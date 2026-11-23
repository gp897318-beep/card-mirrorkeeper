// Tiny WebAudio bleeps, generated in code — no audio files.
"use strict";

var MK_AUDIO = (function () {
  var ctx = null;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = ensure();
    if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol || 0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  return {
    play: function () { tone(520, 0.09, "triangle", 0.12); tone(780, 0.08, "sine", 0.08, 0.05); },
    hurt: function () { tone(180, 0.16, "sawtooth", 0.10); tone(120, 0.2, "sawtooth", 0.08, 0.06); },
    heal: function () { tone(660, 0.12, "sine", 0.09); tone(880, 0.14, "sine", 0.08, 0.08); },
    shard: function () { tone(980, 0.1, "sine", 0.11); tone(1240, 0.12, "sine", 0.1, 0.07); },
    shatter: function () {
      [1400, 1100, 900, 700, 500, 320].forEach(function (f, i) { tone(f, 0.14, "triangle", 0.12, i * 0.06); });
    },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.12, i * 0.13); }); },
    lose: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0.25, "sine", 0.1, i * 0.15); }); },
    click: function () { tone(440, 0.05, "square", 0.05); },
  };
})();
