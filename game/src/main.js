// Bootstrap for MIRRORKEEPER + autopilot hooks for playtesting.
"use strict";

window.MK = {
  state: null,
  newGame: function () { return mkNewGame(); },
  // One autopilot step: play every affordable card, then end the turn.
  // Returns false when the game is over.
  autoStep: function () {
    var s = window.MK.state;
    if (!s || s.winner) return false;
    if (s.screen === "title") { s.screen = "table"; mkRender(s); }
    var guard = 0;
    while (s.phase === "player" && !s.winner && guard < 12) {
      guard++;
      var idx = -1;
      for (var i = 0; i < s.player.hand.length; i++) {
        if (s.player.hand[i].cost <= s.player.ember) { idx = i; break; }
      }
      if (idx < 0) break;
      mkPlayCard(s, idx);
    }
    if (!s.winner) mkEndTurn(s);
    mkRender(s);
    return !s.winner;
  },
  // Run the autopilot until the game ends (max 200 steps). Returns the winner.
  autoPlay: function () {
    var steps = 0;
    while (window.MK.autoStep() && steps < 200) steps++;
    return { winner: window.MK.state.winner, steps: steps, turn: window.MK.state.turn };
  },
};

document.addEventListener("DOMContentLoaded", function () {
  var shot = new URLSearchParams(window.location.search).get("shot");
  var state;
  if (shot) {
    state = mkSetupShot(shot);
  } else {
    state = mkNewGame();
  }
  window.MK.state = state;
  mkSetState(state);
  mkRender(state);
  if (shot) window.__shotReady = true;
});
