(function (global) {
  "use strict";

  var cryptoEngine = global.CipherVaultCrypto;
  var sound = global.CipherVaultSound;
  var anim = global.CipherVaultAnimations;
  var prefs = global.CipherVaultPrefs.load();
  var ZW = ["\u200B", "\u200C", "\u200D", "\uFEFF"]; // 2 bit per karakter tak terlihat
  var lastHashHex = "";
  var lastZwResult = "";

  function toast(msg, type) {
    var box = document.getElementById("toastContainer");
    var el = document.createElement("div");
    el.className = "toast toast-" + (type || "info");
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3200);
  }

  function bytesToZw(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) {
      var b = bytes[i];
      s += ZW[(b >> 6) & 3] + ZW[(b >> 4) & 3] + ZW[(b >> 2) & 3] + ZW[b & 3];
    }
    return s;
  }

  function zwToBytes(str) {
    var bits = [];
    for (var i = 0; i < str.length; i++) {
      var idx = ZW.indexOf(str.charAt(i));
      if (idx !== -1) bits.push(idx);
    }
    if (bits.length < 4 || (bits.length % 4) !== 0) return null;
    var out = new Uint8Array(bits.length / 4);
    for (var j = 0; j < out.length; j++) {
      out[j] = (bits[j * 4] << 6) | (bits[j * 4 + 1] << 4) | (bits[j * 4 + 2] << 2) | bits[j * 4 + 3];
    }
    return out;
  }

  function bytesToHex(bytes) {
    var h = "";
    for (var i = 0; i < bytes.length; i++) h += bytes[i].toString(16).padStart(2, "0");
    return h;
  }

  function init() {
    anim.init(global.CipherVaultConfig);
    sound.init(prefs.sound);

    var carrier = document.getElementById("zwCarrierInput");
    var msgEl = document.getElementById("zwMessageInput");
    var pwEl = document.getElementById("zwPasswordInput");
    var outBox = document.getElementById("zwOutputBox");
    var btnCopy = document.getElementById("btnZwCopy");

    document.getElementById("btnZwHide").addEventListener("click", async function () {
      var text = msgEl.value;
      var pw = pwEl.value;
      if (!text || !pw) { toast("Isi pesan rahasia dan password.", "warning"); return; }
      sound.playClick();
      try {
        var enc = await cryptoEngine.encryptFileData(
          new TextEncoder().encode(text),
          { name: "note.txt", mime: "text/plain" },
          pw,
          { iterations: 50000, cascadeLevel: 1 }
        );
        var cText = carrier.value || "Halo.";
        lastZwResult = cText.slice(0, 1) + bytesToZw(enc.data) + cText.slice(1);
        outBox.style.display = "block";
        outBox.textContent = "Tersisip (" + enc.data.length + "B terenkripsi): " + lastZwResult;
        btnCopy.style.display = "inline-block";
        sound.playSuccess(false);
        toast("Pesan rahasia berhasil disembunyikan di teks.", "success");
      } catch (e) {
        sound.playError();
        toast(e.message, "error");
      }
    });

    document.getElementById("btnZwReveal").addEventListener("click", async function () {
      var rawText = msgEl.value;
      var pw = pwEl.value;
      if (!rawText || !pw) { toast("Tempel teks stego dan masukkan password.", "warning"); return; }
      var payload = zwToBytes(rawText);
      if (!payload) { sound.playError(); toast("Tidak ditemukan karakter Zero-Width rahasia.", "error"); return; }
      try {
        var dec = await cryptoEngine.decryptFileData(payload, pw);
        lastZwResult = new TextDecoder().decode(dec.data);
        outBox.style.display = "block";
        outBox.textContent = lastZwResult;
        btnCopy.style.display = "inline-block";
        sound.playSuccess(true);
        toast("Pesan rahasia berhasil diekstrak.", "success");
      } catch (e) {
        sound.playError();
        toast("Password salah atau teks terpotong.", "error");
      }
    });

    btnCopy.addEventListener("click", function () {
      if (!lastZwResult) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastZwResult).then(function () { sound.playClick(); toast("Disalin ke clipboard.", "success"); });
      }
    });

    // SHA-256 Verifier & Standalone Inspector
    var fileIn = document.getElementById("hashFileInput");
    var hashBox = document.getElementById("hashResultBox");
    var cmpIn = document.getElementById("hashCompareInput");
    var matchEl = document.getElementById("hashMatchStatus");
    var inspBox = document.getElementById("standaloneInspectBox");

    function updateMatch() {
      var target = (cmpIn.value || "").trim().toLowerCase();
      if (!target || !lastHashHex) { matchEl.textContent = ""; return; }
      if (target === lastHashHex) {
        matchEl.textContent = "✓ COCOK 100% — Integritas file identik.";
        matchEl.style.color = "var(--success)";
      } else {
        matchEl.textContent = "✕ TIDAK COCOK — File berbeda atau telah berubah.";
        matchEl.style.color = "var(--danger)";
      }
    }

    document.getElementById("btnPickHashFile").addEventListener("click", function () { fileIn.click(); });
    cmpIn.addEventListener("input", updateMatch);

    fileIn.addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      document.getElementById("hashFileLabel").textContent = f.name;
      var reader = new FileReader();
      reader.onload = function () {
        var bytes = new Uint8Array(reader.result);
        lastHashHex = bytesToHex(cryptoEngine.sha256(bytes));
        hashBox.style.display = "block";
        hashBox.textContent = "SHA-256: " + lastHashHex;
        updateMatch();

        var info = cryptoEngine.inspectHeader(bytes);
        if (info) {
          inspBox.style.display = "flex";
          inspBox.innerHTML =
            '<div class="inspect-row"><span class="inspect-key">Format</span><span class="inspect-val">CVLT v' + info.version + ' · Lv ' + info.cascadeLevel + '</span></div>' +
            '<div class="inspect-row"><span class="inspect-key">Keyfile Fisik</span><span class="inspect-val">' + (info.requiresKeyfile ? 'Wajib' : 'Tidak') + '</span></div>' +
            '<div class="inspect-row"><span class="inspect-key">2-Part Split Key</span><span class="inspect-val">' + (info.requiresSplitKey ? 'Wajib Kunci B' : 'Tidak') + '</span></div>' +
            '<div class="inspect-row"><span class="inspect-key">Iterasi PBKDF2</span><span class="inspect-val">' + info.iterations.toLocaleString() + '</span></div>';
        } else {
          inspBox.style.display = "none";
        }
        sound.playDrop();
      };
      reader.readAsArrayBuffer(f);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})(window);
