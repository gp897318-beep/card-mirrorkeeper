// Click + keyboard input for MIRRORKEEPER.
"use strict";

var MK_STATE = null;

function mkSetState(s) { MK_STATE = s; }

function mkOnCardClick(index) {
  var s = MK_STATE;
  if (!s || s.screen !== "table" || s.phase !== "player") return;
  var res = mkPlayCard(s, index);
  if (!res.ok) { mkShowFloater(res.why || "Can't play"); return; }
  var handEl = mkEl("hand");
  var cardEl = handEl && handEl.children[index];
  if (cardEl) cardEl.classList.add("flying");
  if (res.card.type === "mend") MK_AUDIO.heal();
  else if (res.shattered) { MK_AUDIO.shatter(); mkShowBanner("💥 MIRROR SHATTERED! +8 💥", 1800); mkShowFloater("-8"); }
  else if (res.earnedShard) { MK_AUDIO.shard(); mkShowFloater("◆ SHARD +" + s.shards + "/3"); }
  else if (res.card.type === "strike" || res.card.type === "trick") MK_AUDIO.hurt();
  else MK_AUDIO.play();
  mkRender(s);
  if (s.winner) mkOnGameOver(s);
}

function mkOnEndTurn() {
  var s = MK_STATE;
  if (!s || s.screen !== "table" || s.phase !== "player") return;
  MK_AUDIO.click();
  var res = mkEndTurn(s);
  if (!res.ok) return;
  if (res.summary && res.summary.mirror) MK_AUDIO.hurt();
  mkRender(s);
  if (s.winner) mkOnGameOver(s);
}

function mkOnGameOver(s) {
  if (s.winner === "player") { MK_AUDIO.win(); mkShowBanner("★ VICTORY ★", 2200); }
  else if (s.winner === "rival") { MK_AUDIO.lose(); }
}

function mkRestart() {
  var s = mkNewGame();
  s.screen = "table";
  mkLog(s, "A new duel begins. The mirror watches your first card…");
  mkSetState(s);
  mkRender(s);
}

function mkBegin() {
  var s = MK_STATE;
  if (!s) return;
  MK_AUDIO.click();
  s.screen = "table";
  mkLog(s, "A new duel begins. The mirror watches your first card…");
  mkRender(s);
}

document.addEventListener("DOMContentLoaded", function () {
  mkEl("btn-end").addEventListener("click", mkOnEndTurn);
  mkEl("btn-restart").addEventListener("click", function () { MK_AUDIO.click(); mkRestart(); });
  mkEl("btn-begin").addEventListener("click", mkBegin);
  mkEl("btn-again").addEventListener("click", function () { MK_AUDIO.click(); mkRestart(); });
  mkEl("btn-mute").addEventListener("click", function () {
    var s = MK_STATE;
    if (!s) return;
    s.muted = !s.muted;
    mkEl("btn-mute").textContent = s.muted ? "SOUND: OFF (M)" : "SOUND: ON (M)";
  });
  document.addEventListener("keydown", function (ev) {
    var s = MK_STATE;
    if (!s) return;
    if (ev.key >= "1" && ev.key <= "6") {
      mkOnCardClick(parseInt(ev.key, 10) - 1);
    } else if (ev.key === " " || ev.key === "Enter") {
      ev.preventDefault();
      if (s.screen === "title") mkBegin();
      else mkOnEndTurn();
    } else if (ev.key === "r" || ev.key === "R") {
      if (s.screen !== "title") mkRestart();
    } else if (ev.key === "m" || ev.key === "M") {
      s.muted = !s.muted;
      mkEl("btn-mute").textContent = s.muted ? "SOUND: OFF (M)" : "SOUND: ON (M)";
    }
  });
});
