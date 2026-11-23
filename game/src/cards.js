// Card definitions for MIRRORKEEPER: the deck and the five types.
// Types are told apart by colour AND shape, never by text alone:
// Strike red sword, Guard blue shield, Mend green leaf, Draw gold quill,
// Trick purple star.
"use strict";

var MK_TYPES = {
  strike: { key: "strike", label: "STRIKE", icon: "\u2694", css: "t-strike", verb: "Deal damage" },
  guard:  { key: "guard",  label: "GUARD",  icon: "\uD83D\uDEE1", css: "t-guard",  verb: "Gain Block" },
  mend:   { key: "mend",   label: "MEND",   icon: "\u2767", css: "t-mend",   verb: "Heal Life" },
  draw:   { key: "draw",   label: "DRAW",   icon: "\u2712", css: "t-draw",   verb: "Draw cards" },
  trick:  { key: "trick",  label: "TRICK",  icon: "\u2605", css: "t-trick",  verb: "Damage + draw" },
};

// Build the 30-card deck. Each card: { id, type, name, value, cost, rule }.
function mkBuildDeck() {
  var defs = [
    // Strike: value = damage dealt
    ["strike", "Glass Edge", 3, 1, "Deal 3 damage."],
    ["strike", "Glass Edge", 3, 1, "Deal 3 damage."],
    ["strike", "Shard Slash", 4, 1, "Deal 4 damage."],
    ["strike", "Shard Slash", 4, 1, "Deal 4 damage."],
    ["strike", "Mirror Breaker", 5, 2, "Deal 5 damage."],
    ["strike", "Mirror Breaker", 5, 2, "Deal 5 damage."],
    ["strike", "Silver Tempest", 6, 2, "Deal 6 damage."],
    ["strike", "Silver Tempest", 6, 2, "Deal 6 damage."],
    ["strike", "Prism Lance", 7, 3, "Deal 7 damage."],
    // Guard: value = Block gained
    ["guard", "Silver Ward", 4, 1, "Gain 4 Block."],
    ["guard", "Silver Ward", 4, 1, "Gain 4 Block."],
    ["guard", "Glass Wall", 5, 1, "Gain 5 Block."],
    ["guard", "Glass Wall", 5, 1, "Gain 5 Block."],
    ["guard", "Mirror Aegis", 7, 2, "Gain 7 Block."],
    ["guard", "Mirror Aegis", 7, 2, "Gain 7 Block."],
    // Mend: value = Life healed
    ["mend", "Soft Reflection", 4, 1, "Heal 4 Life."],
    ["mend", "Soft Reflection", 4, 1, "Heal 4 Life."],
    ["mend", "Moonlight Mend", 5, 2, "Heal 5 Life."],
    ["mend", "Moonlight Mend", 5, 2, "Heal 5 Life."],
    ["mend", "True Image", 6, 2, "Heal 6 Life."],
    // Draw: value = cards drawn
    ["draw", "Polished Thought", 1, 1, "Draw 1 card."],
    ["draw", "Polished Thought", 1, 1, "Draw 1 card."],
    ["draw", "Twin Glimpse", 2, 1, "Draw 2 cards."],
    ["draw", "Twin Glimpse", 2, 1, "Draw 2 cards."],
    ["draw", "Hall of Echoes", 2, 2, "Draw 2 cards."],
    // Trick: value = damage dealt, plus draw 1
    ["trick", "False Reflection", 2, 1, "Deal 2 damage. Draw 1."],
    ["trick", "False Reflection", 2, 1, "Deal 2 damage. Draw 1."],
    ["trick", "Smoke and Glass", 3, 2, "Deal 3 damage. Draw 1."],
    ["trick", "Smoke and Glass", 3, 2, "Deal 3 damage. Draw 1."],
    ["trick", "Shattered Smile", 4, 2, "Deal 4 damage. Draw 1."],
  ];
  return defs.map(function (d, i) {
    return { id: i + 1, type: d[0], name: d[1], value: d[2], cost: d[3], rule: d[4] };
  });
}

function mkShuffle(deck, rand) {
  var a = deck.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rand() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Deterministic RNG (mulberry32) for shot scenes and tests.
function mkSeededRand(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
