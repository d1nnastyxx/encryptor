/**
 * Encryptor — Shared Preferences Store (Multi-Page Sync)
 */
(function (global) {
  "use strict";

  var KEY = "cv_prefs_v4";
  var DEFAULTS = {
    theme: "dark",
    sound: true,
    defaultCascade: 1,
    defaultObfuscate: false,
    obfuscateMode: "random", // "random" | "system" | "custom"
    customAlias: "",
    autoWipeSeconds: 30,
    kdfIterations: 600000
  };

  function load() {
    var out = Object.assign({}, DEFAULTS);
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        Object.assign(out, parsed);
      } else {
        var legacyTheme = localStorage.getItem("cv_theme");
        if (legacyTheme === "light" || legacyTheme === "dark") out.theme = legacyTheme;
      }
    } catch (e) {}
    return out;
  }

  function save(partial) {
    var next = Object.assign(load(), partial || {});
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      if (next.theme) localStorage.setItem("cv_theme", next.theme);
    } catch (e) {}
    return next;
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return load();
  }

  global.CipherVaultPrefs = {
    DEFAULTS: DEFAULTS,
    load: load,
    save: save,
    reset: reset
  };
})(window);
