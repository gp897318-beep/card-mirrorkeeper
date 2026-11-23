// DOM rendering for MIRRORKEEPER: HUD, mirror, hands, log, screens.
"use strict";

function mkEl(id) { return document.getElementById(id); }

function mkCardEl(card, index, state) {
  var t = MK_TYPES[card.type];
  var div = document.createElement("div");
  div.className = "card " + card.type + (card.cost > state.player.ember ? " unaffordable" : "");
  div.dataset.index = index;
  var key = document.createElement("span");
  key.className = "key"; key.textContent = String(index + 1);
  var cost = document.createElement("span");
  cost.className = "cost"; cost.textContent = String(card.cost);
  var icon = document.createElement("div");
  icon.className = "icon"; icon.textContent = t.icon;
  var value = document.createElement("div");
  value.className = "value"; value.textContent = String(card.value);
  var name = document.createElement("div");
  name.className = "name"; name.textContent = card.name;
  var rule = document.createElement("div");
  rule.className = "rule"; rule.textContent = t.label + " — " + card.rule;
  div.appendChild(key); div.appendChild(cost); div.appendChild(icon);
  div.appendChild(value); div.appendChild(name); div.appendChild(rule);
  div.addEventListener("click", function () { mkOnCardClick(index); });
  return div;
}

function mkRender(state) {
  // Top bar + life totals.
  mkEl("turn-num").textContent = String(state.turn);
  mkEl("life-you-num").textContent = String(state.player.life);
  mkEl("life-rival-num").textContent = String(state.rival.life);
  mkEl("life-you").classList.toggle("low", state.player.life <= 10);
  mkEl("life-rival").classList.toggle("low", state.rival.life <= 10);
  mkEl("block-you").textContent = state.player.block > 0 ? "🛡 Block " + state.player.block : "";
  mkEl("block-rival").textContent = state.rival.block > 0 ? "🛡 Block " + state.rival.block : "";
  mkEl("deck-count").textContent = String(state.player.deck.length);
  mkEl("discard-count").textContent = String(state.player.discard.length);
  var pips = "";
  for (var e = 0; e < state.player.maxEmber; e++) pips += e < state.player.ember ? "●" : "○";
  mkEl("ember-pips").innerHTML = '<span class="ember-pip">' + pips + "</span> " + state.player.ember + "/" + state.player.maxEmber + " Ember";

  // Rival face-down hand with live count.
  var rc = mkEl("rival-cards");
  rc.innerHTML = "";
  var show = Math.min(state.rival.hand.length, 6);
  for (var i = 0; i < show; i++) {
    var b = document.createElement("span");
    b.className = "mini-back";
    rc.appendChild(b);
  }
  mkEl("rival-count").textContent = state.rival.hand.length + " cards";
  mkEl("rival-plan-text").textContent = state.rivalPlan || "—";
  mkEl("last-play-text").textContent = state.lastPlayName || "none yet";

  // THE MIRROR: big central card showing the type it will copy.
  var mc = mkEl("mirror-card");
  if (state.mirror) {
    var mt = MK_TYPES[state.mirror.type];
    mkEl("mirror-type-icon").textContent = mt.icon;
    mkEl("mirror-type-name").textContent = "MIRROR WILL COPY: " + mt.label + " " + state.mirror.value;
    mkEl("mirror-type-rule").textContent = "Next turn the rival plays a " + mt.label + " " + state.mirror.value + " just like yours. Feed it a weak one — or shatter it first.";
    mc.style.background = "linear-gradient(160deg,#f2f7ff,#b9cfe8)";
  } else {
    mkEl("mirror-type-icon").textContent = "?";
    mkEl("mirror-type-name").textContent = "AWAITING YOUR FIRST CARD";
    mkEl("mirror-type-rule").textContent = "Play any card — the mirror will copy its type next turn.";
  }

  // Shard pips.
  var sp = mkEl("shard-pips");
  sp.innerHTML = "";
  for (var s = 0; s < 3; s++) {
    var pip = document.createElement("span");
    pip.className = "shard-pip" + (s < state.shards ? " lit" : "");
    pip.textContent = "◆";
    sp.appendChild(pip);
  }

  // Player hand.
  var hand = mkEl("hand");
  hand.innerHTML = "";
  state.player.hand.forEach(function (card, idx) {
    hand.appendChild(mkCardEl(card, idx, state));
  });

  // Log.
  var log = mkEl("log");
  log.innerHTML = "";
  state.log.forEach(function (line) {
    var d = document.createElement("div");
    d.textContent = line;
    log.appendChild(d);
  });

  // Screens.
  mkEl("title-screen").classList.toggle("hidden", state.screen !== "title");
  mkEl("end-screen").classList.toggle("hidden", state.screen !== "end");
  if (state.screen === "end") mkRenderEnd(state);
}

function mkRenderEnd(state) {
  var title = mkEl("end-title");
  var sub = mkEl("end-sub");
  if (state.winner === "player") {
    title.textContent = "★ VICTORY ★";
    title.className = "win";
    sub.textContent = "The mirror lies shattered at your feet. The hall is yours.";
  } else if (state.winner === "rival") {
    title.textContent = "DEFEAT";
    title.className = "loss";
    sub.textContent = "The MIRRORKEEPER reflects your every move — and wins. Try again.";
  } else {
    title.textContent = "DRAW";
    title.className = "";
    sub.textContent = "Both reflections fade at once.";
  }
  mkEl("end-stats").innerHTML =
    "Turns played: <b>" + state.turn + "</b><br>" +
    "Damage you dealt: <b>" + state.stats.damageDealt + "</b><br>" +
    "Cards you played: <b>" + state.stats.cardsPlayed + "</b><br>" +
    "Shards earned: <b>" + state.stats.shardsEarned + "</b> · Shatters: <b>" + state.stats.shatters + "</b><br>" +
    "Final Life — You <b>" + state.player.life + "</b> · MirrorKeeper <b>" + state.rival.life + "</b>";
}

function mkShowFloater(text) {
  var f = mkEl("floater");
  f.textContent = text;
  f.classList.remove("show");
  void f.offsetWidth;
  f.classList.add("show");
}

function mkShowBanner(text, ms) {
  var b = mkEl("banner");
  b.textContent = text;
  b.classList.remove("hidden");
  setTimeout(function () { b.classList.add("hidden"); }, ms || 1600);
}
