// Game state, turn flow and the mirror/shard rules for MIRRORKEEPER.
"use strict";

var MK_MAX_LIFE = 30;
var MK_SHATTER_DAMAGE = 8;

function mkNewGame(rand) {
  var deck = mkShuffle(mkBuildDeck(), rand || Math.random);
  var rivalDeck = mkShuffle(mkBuildDeck(), rand || Math.random);
  var s = {
    screen: "title",
    turn: 1,
    phase: "player", // "player" | "rival" | "over"
    player: { life: MK_MAX_LIFE, block: 0, ember: 3, maxEmber: 3, hand: [], deck: deck, discard: [] },
    rival: { life: MK_MAX_LIFE, block: 0, ember: 3, maxEmber: 3, hand: [], deck: rivalDeck, discard: [] },
    lastType: null,      // type of the last card the player played
    lastPlayName: null,
    shards: 0,
    shardTurn: 0,      // turn on which the last shard was earned (max 1/turn)
    mirror: null,        // { type, value } — what the rival copies next turn
    rivalSkipsNext: false,
    rivalPlan: null,     // telegraphed rival intent, shown a full turn ahead
    log: [],
    stats: { damageDealt: 0, cardsPlayed: 0, turns: 0, shardsEarned: 0, shatters: 0 },
    muted: false,
    winner: null,
    shatterFlash: false,
  };
  mkDrawCards(s, s.player, 6);
  mkDrawCards(s, s.rival, 6);
  s.rivalPlan = mkPickRivalPlan(s);
  return s;
}

function mkDrawCards(s, side, n) {
  for (var i = 0; i < n; i++) {
    if (side.deck.length === 0) {
      if (side.discard.length === 0) break;
      side.deck = mkShuffle(side.discard, Math.random);
      side.discard = [];
    }
    side.hand.push(side.deck.shift());
  }
}

function mkLog(s, text) {
  s.log.unshift(text);
  if (s.log.length > 14) s.log.length = 14;
}

// Damage after Block. Returns the Life damage actually dealt.
function mkDealDamage(s, target, amount) {
  var absorbed = Math.min(target.block, amount);
  target.block -= absorbed;
  var lifeDamage = amount - absorbed;
  target.life = Math.max(0, target.life - lifeDamage);
  return lifeDamage;
}

function mkHeal(s, target, amount) {
  target.life = Math.min(MK_MAX_LIFE, target.life + amount);
}

// Apply one card's effect. `byPlayer` says who played it.
function mkApplyCard(s, card, byPlayer) {
  var me = byPlayer ? s.player : s.rival;
  var foe = byPlayer ? s.rival : s.player;
  var done = "";
  if (card.type === "strike") {
    var d = mkDealDamage(s, foe, card.value);
    if (byPlayer) s.stats.damageDealt += d;
    done = "deals " + d + " damage";
  } else if (card.type === "guard") {
    me.block += card.value;
    done = "gains " + card.value + " Block";
  } else if (card.type === "mend") {
    mkHeal(s, me, card.value);
    done = "heals " + card.value + " Life";
  } else if (card.type === "draw") {
    mkDrawCards(s, me, card.value);
    done = "draws " + card.value + " card" + (card.value > 1 ? "s" : "");
  } else if (card.type === "trick") {
    var td = mkDealDamage(s, foe, card.value);
    if (byPlayer) s.stats.damageDealt += td;
    mkDrawCards(s, me, 1);
    done = "deals " + td + " damage and draws 1";
  }
  return done;
}

// The player plays the card at hand index i. Returns a result object.
function mkPlayCard(s, i) {
  if (s.screen !== "table" || s.phase !== "player" || s.winner) return { ok: false, why: "not your turn" };
  var hand = s.player.hand;
  if (i < 0 || i >= hand.length) return { ok: false, why: "no such card" };
  var card = hand[i];
  if (card.cost > s.player.ember) return { ok: false, why: "not enough Ember" };
  s.player.ember -= card.cost;
  hand.splice(i, 1);
  s.player.discard.push(card);
  s.stats.cardsPlayed++;
  var effect = mkApplyCard(s, card, true);

  // SHARD RULE: a type different from your last play earns ONE shard per
  // turn; repeating a type steadies the reflection and resets shards to 0.
  var earnedShard = false;
  if (s.lastType !== null && card.type === s.lastType) {
    if (s.shards > 0) mkLog(s, "Same type twice — the reflection steadies, shards lost.");
    s.shards = 0;
  } else if (s.lastType !== null && s.shardTurn !== s.turn) {
    s.shards++;
    s.shardTurn = s.turn;
    s.stats.shardsEarned++;
    earnedShard = true;
  }
  s.lastType = card.type;
  s.lastPlayName = card.name + " (" + MK_TYPES[card.type].label + " " + card.value + ")";
  // THE MIRROR: the rival will copy this type (and value) next turn.
  s.mirror = { type: card.type, value: card.value };
  mkLog(s, "You play " + card.name + " — " + effect + ".");

  var shattered = false;
  if (s.shards >= 3) {
    s.shards = 0;
    s.stats.shatters++;
    var sd = mkDealDamage(s, s.rival, MK_SHATTER_DAMAGE);
    s.stats.damageDealt += sd;
    s.rivalSkipsNext = true;
    s.shatterFlash = true;
    shattered = true;
    mkLog(s, "💥 SHATTER! The mirror bursts — +" + sd + " damage, rival skips its next turn!");
  }
  mkCheckEnd(s);
  return { ok: true, card: card, effect: effect, earnedShard: earnedShard, shattered: shattered };
}

function mkCheckEnd(s) {
  if (s.rival.life <= 0 && s.player.life <= 0) { s.winner = "draw"; }
  else if (s.rival.life <= 0) { s.winner = "player"; }
  else if (s.player.life <= 0) { s.winner = "rival"; }
  if (s.winner) { s.screen = "end"; s.phase = "over"; }
}

// End the player's turn: the rival acts (mirror copy + one card), then a
// new player turn begins. Returns a summary for the renderer.
function mkEndTurn(s) {
  if (s.screen !== "table" || s.phase !== "player" || s.winner) return { ok: false };
  s.phase = "rival";
  var summary = { mirror: null, rivalCard: null, skipped: false };
  if (s.rivalSkipsNext) {
    s.rivalSkipsNext = false;
    summary.skipped = true;
    mkLog(s, "The MIRRORKEEPER staggers — it skips its turn!");
  } else {
    // 1) THE MIRROR COPY: the rival copies your last card's type + value.
    if (s.mirror) {
      var copy = { type: s.mirror.type, value: s.mirror.value, name: "Mirror Copy" };
      var eff = mkApplyCard(s, copy, false);
      summary.mirror = { type: s.mirror.type, value: s.mirror.value, effect: eff };
      mkLog(s, "🪞 Mirror copies " + MK_TYPES[s.mirror.type].label + " " + s.mirror.value + " — " + eff + ".");
    }
    // 2) The rival plays up to three cards of its own from its face-down hand.
    s.rival.ember = Math.min(3 + Math.floor(s.turn / 2), 8);
    var played = 0;
    while (played < 3) {
      var pick = mkRivalPick(s);
      if (!pick) break;
      var rc = s.rival.hand.splice(pick.index, 1)[0];
      s.rival.discard.push(rc);
      var reff = mkApplyCard(s, rc, false);
      summary.rivalCard = { name: rc.name, type: rc.type, value: rc.value, effect: reff };
      mkLog(s, "Rival plays " + rc.name + " — " + reff + ".");
      played++;
    }
    mkCheckEnd(s);
  }
  if (!s.winner) {
    s.turn++;
    s.stats.turns = s.turn;
    s.player.maxEmber = Math.min(3 + Math.floor(s.turn / 2), 8);
    s.player.ember = s.player.maxEmber;
    s.player.block = 0;
    s.rival.block = 0;
    mkDrawCards(s, s.player, 2);
    mkDrawCards(s, s.rival, 2);
    s.rivalPlan = mkPickRivalPlan(s);
    s.phase = "player";
    mkLog(s, "— Turn " + s.turn + " — you draw 2, Ember refills to " + s.player.maxEmber + ".");
  }
  return { ok: true, summary: summary };
}
