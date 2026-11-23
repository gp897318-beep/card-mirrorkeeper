// Rival AI for MIRRORKEEPER: readable, counterable choices.
// The rival's intent is telegraphed a full turn ahead (rivalPlan), and its
// mirror copy is shown on the big mirror card, so the player can always
// read what is coming and play around it.
"use strict";

// Pick the rival's own card for this turn. Returns { index } or null.
function mkRivalPick(s) {
  var hand = s.rival.hand;
  if (!hand.length) return null;
  var affordable = [];
  for (var i = 0; i < hand.length; i++) {
    if (hand[i].cost <= s.rival.ember) affordable.push(i);
  }
  if (!affordable.length) return null;
  s.rival.ember = Math.min(2 + s.turn, 10);

  function byType(t) {
    var best = -1, bestVal = -1;
    affordable.forEach(function (i) {
      if (hand[i].type === t && hand[i].value > bestVal) { bestVal = hand[i].value; best = i; }
    });
    return best;
  }
  // Heal when hurt, finish when the player is nearly beaten.
  if (s.rival.life <= 10) { var m = byType("mend"); if (m >= 0) return { index: m }; }
  if (s.player.life <= 6) { var k = byType("strike"); if (k >= 0) return { index: k }; }
  // Guard when the player's last play was a big Strike.
  if (s.lastType === "strike" && s.mirror && s.mirror.value >= 6) {
    var g = byType("guard"); if (g >= 0 && Math.random() < 0.6) return { index: g };
  }
  // Otherwise prefer Strike, then Trick, then anything affordable.
  var pref = ["strike", "trick", "guard", "mend", "draw"];
  for (var p = 0; p < pref.length; p++) {
    var idx = byType(pref[p]);
    if (idx >= 0) return { index: idx };
  }
  return { index: affordable[0] };
}

// Telegraph: what the rival is leaning towards next turn, in plain words.
function mkPickRivalPlan(s) {
  if (s.mirror) {
    return "copy your " + MK_TYPES[s.mirror.type].label + " " + s.mirror.value + " via the mirror";
  }
  if (s.rival.life <= 10) return "mend its wounds";
  if (s.player.life <= 8) return "strike hard at you";
  var plans = ["strike hard at you", "copy your next card", "guard behind glass", "draw deeper into its deck"];
  return plans[Math.floor(Math.random() * plans.length)];
}
