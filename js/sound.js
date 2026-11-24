/**
 * Encryptor — Tactile Offline Audio Synthesizer (Web Audio API)
 * Menghasilkan efek suara mekanis & futuristik tanpa file MP3 eksternal.
 */
(function (global) {
  "use strict";

  var ctx = null;
  var enabled = true;

  function ensureContext() {
    if (!enabled) return null;
    if (!ctx) {
      var AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(function () {});
    }
    return ctx;
  }

  function playTone(freqStart, freqEnd, duration, type, volume, delay) {
    var ac = ensureContext();
    if (!ac) return;
    var now = ac.currentTime + (delay || 0);
    var osc = ac.createOscillator();
    var gain = ac.createGain();

    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd && freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume || 0.08, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function unlockOnFirstGesture() {
    var unlock = function () {
      ensureContext();
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("pointerdown", unlock, { passive: true });
    document.addEventListener("keydown", unlock, { passive: true });
  }

  global.CipherVaultSound = {
    init: function (isEnabled) {
      enabled = isEnabled !== false;
      unlockOnFirstGesture();
    },
    setEnabled: function (val) {
      enabled = !!val;
      if (enabled) this.playClick();
    },
    isEnabled: function () {
      return enabled;
    },
    playBoot: function () {
      playTone(220, 440, 0.14, "triangle", 0.06, 0);
      playTone(440, 880, 0.18, "sine", 0.06, 0.12);
    },
    playClick: function () {
      playTone(720, 320, 0.045, "triangle", 0.05, 0);
    },
    playSwitch: function () {
      playTone(420, 680, 0.07, "sine", 0.055, 0);
    },
    playDrop: function () {
      playTone(300, 520, 0.08, "sine", 0.06, 0);
      playTone(520, 760, 0.09, "triangle", 0.05, 0.06);
    },
    playKeygen: function () {
      playTone(600, 900, 0.05, "square", 0.03, 0);
      playTone(850, 1200, 0.06, "square", 0.03, 0.055);
      playTone(1100, 1500, 0.08, "sine", 0.05, 0.11);
    },
    playTick: function () {
      playTone(980, 620, 0.025, "sine", 0.02, 0);
    },
    playSuccess: function (isDecrypt) {
      if (isDecrypt) {
        playTone(440, 554, 0.11, "sine", 0.07, 0);
        playTone(554, 659, 0.12, "sine", 0.07, 0.1);
        playTone(659, 880, 0.22, "triangle", 0.08, 0.2);
      } else {
        playTone(523, 659, 0.1, "triangle", 0.07, 0);
        playTone(659, 1046, 0.22, "sine", 0.08, 0.11);
      }
    },
    playError: function () {
      playTone(220, 140, 0.16, "sawtooth", 0.06, 0);
      playTone(170, 110, 0.2, "sawtooth", 0.05, 0.15);
    }
  };
})(window);
