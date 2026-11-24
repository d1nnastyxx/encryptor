(function (global) {
  "use strict";

  var Prefs = global.CipherVaultPrefs;
  var sound = global.CipherVaultSound;
  var anim = global.CipherVaultAnimations;
  var pro = global.CipherVaultPro;

  function toast(msg) {
    var box = document.getElementById("toastContainer");
    var el = document.createElement("div");
    el.className = "toast toast-success";
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2600);
  }

  function syncUI(p) {
    document.getElementById("setDarkTheme").checked = p.theme === "dark";
    document.getElementById("setSound").checked = !!p.sound;
    document.getElementById("setCascade").value = String(p.defaultCascade || 1);
    document.getElementById("setObfuscate").checked = !!p.defaultObfuscate;
    document.getElementById("setObfMode").value = p.obfuscateMode || "random";
    document.getElementById("setAutoWipe").value = String(p.autoWipeSeconds);
    document.getElementById("setKdfLabel").textContent = "Saat ini: " + Math.round((p.kdfIterations || 600000) / 1000) + "K iterasi";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var p = Prefs.load();
    anim.init(global.CipherVaultConfig);
    sound.init(p.sound);
    syncUI(p);

    document.getElementById("setDarkTheme").addEventListener("change", function (e) {
      var theme = e.target.checked ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      Prefs.save({ theme: theme });
      sound.playSwitch();
    });

    document.getElementById("setSound").addEventListener("change", function (e) {
      sound.setEnabled(e.target.checked);
      Prefs.save({ sound: e.target.checked });
    });

    document.getElementById("setCascade").addEventListener("change", function (e) {
      Prefs.save({ defaultCascade: parseInt(e.target.value, 10) });
      sound.playClick(); toast("Level Cascade bawaan disimpan.");
    });

    document.getElementById("setObfuscate").addEventListener("change", function (e) {
      Prefs.save({ defaultObfuscate: e.target.checked });
      sound.playSwitch(); toast("Pengaturan penyamaran nama disimpan.");
    });

    document.getElementById("setObfMode").addEventListener("change", function (e) {
      Prefs.save({ obfuscateMode: e.target.value });
      sound.playClick(); toast("Pola penyamaran diperbarui.");
    });

    document.getElementById("setAutoWipe").addEventListener("change", function (e) {
      Prefs.save({ autoWipeSeconds: parseInt(e.target.value, 10) });
      sound.playClick(); toast("Durasi Auto-Wipe disimpan.");
    });

    var btnBench = document.getElementById("btnSetBench");
    btnBench.addEventListener("click", async function () {
      btnBench.disabled = true; btnBench.textContent = "Mengukur...";
      try {
        var res = await pro.runKdfBenchmark();
        Prefs.save({ kdfIterations: res.recommendedIterations });
        document.getElementById("setKdfLabel").textContent = "Saat ini: " + Math.round(res.recommendedIterations / 1000) + "K iterasi";
        if (global.CipherVaultMotionUI) global.CipherVaultMotionUI.updateBenchmarkGraph(res.itersPerSec, res.recommendedIterations);
        sound.playSuccess(false);
        toast("Kalibrasi CPU selesai.");
      } catch (err) {
        sound.playError();
      } finally {
        btnBench.disabled = false; btnBench.textContent = "Ukur CPU";
      }
    });

    document.getElementById("btnResetPrefs").addEventListener("click", function () {
      var def = Prefs.reset();
      document.documentElement.setAttribute("data-theme", def.theme);
      syncUI(def);
      sound.playClick();
      toast("Pengaturan dikembalikan ke standar.");
    });
  });
})(window);
