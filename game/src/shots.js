// Deterministic ?shot= scenes for screenshots. No randomness here:
// fixed seeds and fixed hands, so every shot renders the same frame.
"use strict";

function mkShotHand() {
  // Six fully legible cards, one of each type plus a big Strike.
  return [
    { id: 101, type: "strike", name: "Prism Lance", value: 7, cost: 3, rule: "Deal 7 damage." },
    { id: 102, type: "guard", name: "Mirror Aegis", value: 7, cost: 2, rule: "Gain 7 Block." },
    { id: 103, type: "mend", name: "True Image", value: 6, cost: 2, rule: "Heal 6 Life." },
    { id: 104, type: "draw", name: "Twin Glimpse", value: 2, cost: 1, rule: "Draw 2 cards." },
    { id: 105, type: "trick", name: "Shattered Smile", value: 4, cost: 2, rule: "Deal 4 damage. Draw 1." },
    { id: 106, type: "strike", name: "Shard Slash", value: 4, cost: 1, rule: "Deal 4 damage." },
  ];
}

function mkShotBase() {
  var s = mkNewGame(mkSeededRand(20261123));
  s.screen = "table";
  s.phase = "player";
  s.turn = 7;
  s.player.life = 24;
  s.player.block = 4;
  s.player.ember = 6;
  s.player.maxEmber = 6;
  s.player.hand = mkShotHand();
  s.rival.life = 9;
  s.rival.block = 0;
  s.rival.hand = s.rival.hand.slice(0, 5);
  s.lastType = "guard";
  s.lastPlayName = "Mirror Aegis (GUARD 7)";
  s.mirror = { type: "strike", value: 6 };
  s.shards = 2;
  s.rivalPlan = "copy your STRIKE 6 via the mirror";
  s.log = [
    "You play Mirror Aegis — gains 7 Block.",
    "◆ SHARD! A different type than your last play. (2/3)",
    "🪞 Mirror copies GUARD 7 — gains 7 Block.",
    "Rival plays Shard Slash — deals 4 damage.",
    "— Turn 7 — you draw 2, Ember refills to 6.",
    "You play Glass Edge — deals 3 damage.",
  ];
  return s;
}

function mkSetupShot(shot) {
  var s;
  if (shot === "title") {
    s = mkNewGame(mkSeededRand(7));
    s.screen = "title";
    return s;
  }
  if (shot === "cover") {
    s = mkShotBase();
    // A dramatic moment: a big Strike card mid-flight + damage flying.
    setTimeout(function () {
      var handEl = document.getElementById("hand");
      if (handEl && handEl.children[0]) handEl.children[0].classList.add("flying");
      mkShowFloater("-8");
    }, 60);
    return s;
  }
  if (shot === "win") {
    s = mkShotBase();
    s.rival.life = 0;
    s.winner = "player";
    s.screen = "end";
    s.phase = "over";
    s.turn = 11;
    s.stats = { damageDealt: 34, cardsPlayed: 19, turns: 11, shardsEarned: 7, shatters: 2 };
    return s;
  }
  if (shot === "loss") {
    s = mkShotBase();
    s.player.life = 0;
    s.rival.life = 14;
    s.winner = "rival";
    s.screen = "end";
    s.phase = "over";
    s.turn = 12;
    s.stats = { damageDealt: 18, cardsPlayed: 21, turns: 12, shardsEarned: 5, shatters: 1 };
    return s;
  }
  s = mkNewGame(mkSeededRand(1));
  s.screen = "table";
  return s;
}
