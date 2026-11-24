/**
 * Encryptor — Full Interactive Motion, Page Transitions & iOS Action Sheet Engine
 * 100% Offline • 60fps Spring Physics • Auto-upgrades native <select> on Android WebView
 */
(function (global) {
  "use strict";

  var config = null;
  var PAGE_ORDER = ["index.html", "tools.html", "guide.html", "settings.html"];
  var selectSyncCallbacks = [];

  function getCurrentPageName() {
    var path = (global.location && global.location.pathname) || "index.html";
    var name = path.split("/").pop() || "index.html";
    return PAGE_ORDER.indexOf(name) !== -1 ? name : "index.html";
  }

  /* -------------------------------------------------------------------------
     1. Theme & Background
     ------------------------------------------------------------------------- */
  function applyTheme(theme) {
    var mode = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", mode);

    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", mode === "light" ? "#f8f8fa" : "#09090b");

    var sun = document.getElementById("themeIconSun");
    var moon = document.getElementById("themeIconMoon");
    if (sun) sun.style.display = mode === "dark" ? "block" : "none";
    if (moon) moon.style.display = mode === "light" ? "block" : "none";

    try { localStorage.setItem("cv_theme", mode); } catch (e) {}
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || "dark";
    var next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    return next;
  }

  function applyBackgroundPrefs(cfg) {
    var bgLayer = document.getElementById("bgImageLayer");
    if (bgLayer && cfg.BACKGROUND_IMAGE) {
      bgLayer.style.backgroundImage = "url('" + cfg.BACKGROUND_IMAGE + "')";
      bgLayer.style.opacity = String(cfg.BACKGROUND_IMAGE_OPACITY || 0.14);
    }
    var grid = document.getElementById("bgGridLayer");
    if (grid) grid.style.display = cfg.SHOW_DOT_GRID ? "block" : "none";
    var ambient = document.getElementById("ambientLight");
    if (ambient) ambient.style.display = cfg.SHOW_AMBIENT_LIGHT ? "block" : "none";
  }

  /* -------------------------------------------------------------------------
     2. Directional Page-Slide Transitions (Studio <-> Tools <-> Panduan <-> Pengaturan)
     ------------------------------------------------------------------------- */
  function initPageTransitions() {
    var shell = document.querySelector(".app-shell");
    if (shell) {
      var enterDir = null;
      try {
        enterDir = sessionStorage.getItem("cv_nav_dir");
        sessionStorage.removeItem("cv_nav_dir");
      } catch (e) {}

      if (enterDir === "left" || enterDir === "right") {
        shell.classList.add(enterDir === "left" ? "page-enter-left" : "page-enter-right");
        setTimeout(function () {
          shell.classList.remove("page-enter-left", "page-enter-right");
        }, 380);
      } else {
        shell.classList.add("page-enter-fade");
        setTimeout(function () { shell.classList.remove("page-enter-fade"); }, 320);
      }
    }

    var currentIdx = PAGE_ORDER.indexOf(getCurrentPageName());
    document.querySelectorAll(".ios-tab-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || link.classList.contains("active")) {
          e.preventDefault();
          triggerPop(link);
          return;
        }
        e.preventDefault();
        var targetName = href.split("/").pop();
        var targetIdx = PAGE_ORDER.indexOf(targetName);
        var goingRight = targetIdx > currentIdx;

        if (global.CipherVaultSound) global.CipherVaultSound.playSwitch();
        triggerPop(link);

        try { sessionStorage.setItem("cv_nav_dir", goingRight ? "left" : "right"); } catch (err) {}

        if (shell) {
          shell.classList.add(goingRight ? "page-exit-left" : "page-exit-right");
          setTimeout(function () { global.location.href = href; }, 175);
        } else {
          global.location.href = href;
        }
      });
    });
  }

  /* -------------------------------------------------------------------------
     3. Universal Micro-Animations (Mute, Theme, Buttons, Switches)
     ------------------------------------------------------------------------- */
  function triggerPop(el, animClass) {
    if (!el) return;
    var cls = animClass || "anim-pop";
    el.classList.remove(cls);
    void el.offsetWidth; // reflow agar animasi selalu berulang
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 420);
  }

  function initMicroAnimations() {
    var btnSound = document.getElementById("btnToggleSound");
    if (btnSound) {
      btnSound.addEventListener("click", function () {
        triggerPop(btnSound, "anim-shake-pop");
      });
    }

    var btnTheme = document.getElementById("btnToggleTheme");
    if (btnTheme) {
      btnTheme.addEventListener("click", function () {
        triggerPop(btnTheme, "anim-spin-pop");
      });
    }

    document.addEventListener("click", function (e) {
      var el = e.target.closest(".icon-pill-btn, .level-btn, .bp-node, .btn-chip-subtle, .btn-ghost-sm, .inline-tool-btn, .cmd-trigger-btn");
      if (el && el.id !== "btnToggleSound" && el.id !== "btnToggleTheme") {
        triggerPop(el, "anim-pop");
      }
    });
  }

  /* -------------------------------------------------------------------------
     4. Custom iOS Action Sheet Picker (Mengganti Native Android White Dialog)
     ------------------------------------------------------------------------- */
  function ensureActionSheetDOM() {
    var existing = document.getElementById("iosActionSheetBackdrop");
    if (existing) return existing;

    var bd = document.createElement("div");
    bd.id = "iosActionSheetBackdrop";
    bd.className = "ios-sheet-backdrop";
    bd.innerHTML =
      '<div class="ios-sheet-panel" role="dialog" aria-modal="true">' +
        '<div class="drawer-handle"></div>' +
        '<div class="ios-sheet-title" id="iosSheetTitle">Pilih Opsi</div>' +
        '<div class="ios-sheet-options" id="iosSheetOptions"></div>' +
        '<button type="button" class="ios-sheet-cancel" id="iosSheetCancel">Batal</button>' +
      '</div>';
    document.body.appendChild(bd);

    function closeSheet() {
      bd.classList.remove("open");
      if (global.CipherVaultSound) global.CipherVaultSound.playClick();
    }

    bd.addEventListener("click", function (e) { if (e.target === bd) closeSheet(); });
    bd.querySelector("#iosSheetCancel").addEventListener("click", closeSheet);
    return bd;
  }

  function initCustomSelectPickers() {
    var selects = document.querySelectorAll("select.sub-select");
    if (!selects.length) return;

    var bd = ensureActionSheetDOM();
    var titleEl = bd.querySelector("#iosSheetTitle");
    var optsEl = bd.querySelector("#iosSheetOptions");

    selects.forEach(function (sel) {
      if (sel.dataset.iosUpgraded === "1") return;
      sel.dataset.iosUpgraded = "1";
      sel.style.display = "none";

      var trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "ios-select-trigger";

      function syncLabel() {
        var opt = sel.options[sel.selectedIndex];
        trigger.innerHTML =
          '<span class="ios-select-val">' + (opt ? opt.textContent : "") + '</span>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
      }

      syncLabel();
      selectSyncCallbacks.push(syncLabel);
      sel.parentNode.insertBefore(trigger, sel);

      trigger.addEventListener("click", function () {
        if (global.CipherVaultSound) global.CipherVaultSound.playSwitch();
        triggerPop(trigger, "anim-pop");

        var rowCopy = sel.closest(".setting-row") && sel.closest(".setting-row").querySelector("strong");
        titleEl.textContent = rowCopy ? rowCopy.textContent : "Pilih Opsi";
        optsEl.innerHTML = "";

        Array.prototype.slice.call(sel.options).forEach(function (opt, idx) {
          var isSelected = idx === sel.selectedIndex;
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "ios-sheet-opt" + (isSelected ? " selected" : "");
          btn.innerHTML =
            '<span>' + opt.textContent + '</span>' +
            '<span class="ios-sheet-check">' + (isSelected ? "&#10003;" : "") + '</span>';
          btn.addEventListener("click", function () {
            sel.value = opt.value;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            syncLabel();
            bd.classList.remove("open");
            if (config && config.ENABLE_HAPTIC && navigator.vibrate) {
              try { navigator.vibrate(12); } catch (e) {}
            }
          });
          optsEl.appendChild(btn);
        });

        bd.classList.add("open");
      });
    });

    // Sinkronkan ulang jika tombol Reset Pengaturan ditekan
    var btnReset = document.getElementById("btnResetPrefs");
    if (btnReset) {
      btnReset.addEventListener("click", function () {
        setTimeout(function () {
          selectSyncCallbacks.forEach(function (fn) { fn(); });
        }, 40);
      });
    }
  }

  /* -------------------------------------------------------------------------
     5. Segmented Control, Progress, Scrambler & Swipe Cards (Utuh)
     ------------------------------------------------------------------------- */
  function moveSegmentedIndicator(mode) {
    var indicator = document.getElementById("tabIndicator");
    if (!indicator) return;
    indicator.style.transform = mode === "decrypt" ? "translateX(100%)" : "translateX(0%)";
  }

  function updateProgressBar(percent) {
    var clamped = Math.max(0, Math.min(100, Math.round(percent)));
    var fill = document.getElementById("visualizerBarFill");
    var label = document.getElementById("visualizerPercent");
    if (fill) fill.style.width = clamped + "%";
    if (label) label.textContent = clamped + "%";
  }

  function estimateCrackTime(entropyBits) {
    if (!entropyBits || entropyBits <= 0) return "—";
    var seconds = Math.pow(2, entropyBits - 1) / 100000;
    if (seconds < 1) return "< 1 detik";
    if (seconds < 60) return Math.round(seconds) + " detik";
    var mins = seconds / 60;
    if (mins < 60) return Math.round(mins) + " menit";
    var hours = mins / 60;
    if (hours < 24) return Math.round(hours) + " jam";
    var days = hours / 24;
    if (days < 365) return Math.round(days) + " hari";
    var years = days / 365;
    if (years < 1000) return Math.round(years) + " tahun";
    if (years < 1e6) return Math.round(years / 1000) + " rb thn";
    if (years < 1e9) return Math.round(years / 1e6) + " jt thn";
    return "Abad+";
  }

  function scramblePasswordInput(inputEl, finalPassword, onDone) {
    var charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    var frame = 0;
    var totalFrames = 14;
    inputEl.classList.add("scrambling");
    function step() {
      frame++;
      var revealCount = Math.floor((frame / totalFrames) * finalPassword.length);
      var display = "";
      for (var i = 0; i < finalPassword.length; i++) {
        display += i < revealCount ? finalPassword.charAt(i) : charset.charAt(Math.floor(Math.random() * charset.length));
      }
      inputEl.value = display;
      if (frame < totalFrames) requestAnimationFrame(step);
      else {
        inputEl.value = finalPassword;
        inputEl.classList.remove("scrambling");
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(step);
  }

  function attachSwipeGesture(wrapperEl, cardEl, options) {
    var opts = options || {};
    var startX = 0, startY = 0, currentX = 0, isDragging = false, isHorizontal = null;
    var hintSave = wrapperEl.querySelector(".swipe-hint-save");
    var hintDel = wrapperEl.querySelector(".swipe-hint-del");
    var threshold = 88;

    cardEl.addEventListener("pointerdown", function (e) {
      if (opts.disabled || e.target.closest("button, a, input")) return;
      startX = e.clientX; startY = e.clientY; currentX = 0; isDragging = true; isHorizontal = null;
    });

    cardEl.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (isHorizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        isHorizontal = Math.abs(dx) > Math.abs(dy);
        if (isHorizontal) {
          cardEl.classList.add("dragging");
          if (cardEl.setPointerCapture) { try { cardEl.setPointerCapture(e.pointerId); } catch (err) {} }
        }
      }
      if (!isHorizontal) return;
      currentX = (dx > 0 && !opts.canSave) ? Math.min(28, dx * 0.22) : Math.max(-140, Math.min(140, dx));
      cardEl.style.transform = "translateX(" + currentX + "px)";
      if (hintDel) hintDel.style.opacity = currentX < -16 ? String(Math.min(1, Math.abs(currentX) / threshold)) : "0";
      if (hintSave) hintSave.style.opacity = (opts.canSave && currentX > 16) ? String(Math.min(1, currentX / threshold)) : "0";
    });

    function finishDrag() {
      if (!isDragging) return;
      isDragging = false;
      cardEl.classList.remove("dragging");
      if (isHorizontal && currentX <= -threshold && opts.onSwipeDelete) {
        cardEl.style.transform = "translateX(-110%)";
        wrapperEl.classList.add("removing");
        setTimeout(function () { opts.onSwipeDelete(); }, 280);
      } else if (isHorizontal && opts.canSave && currentX >= threshold && opts.onSwipeSave) {
        cardEl.style.transform = "translateX(0px)";
        if (hintSave) hintSave.style.opacity = "0";
        opts.onSwipeSave();
      } else {
        cardEl.style.transform = "translateX(0px)";
        if (hintDel) hintDel.style.opacity = "0";
        if (hintSave) hintSave.style.opacity = "0";
      }
      isHorizontal = null;
    }

    cardEl.addEventListener("pointerup", finishDrag);
    cardEl.addEventListener("pointercancel", finishDrag);
  }

  function bindRipple(cfg) {
    if (!cfg.ENABLE_RIPPLE) return;
    document.addEventListener("pointerdown", function (e) {
      var target = e.target.closest(".btn-primary, .btn-secondary, .btn-danger, .q-btn, .ios-sheet-opt");
      if (!target || target.disabled) return;
      var rect = target.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var circle = document.createElement("span");
      circle.className = "ripple-circle";
      circle.style.width = size + "px";
      circle.style.height = size + "px";
      circle.style.left = (e.clientX - rect.left - size / 2) + "px";
      circle.style.top = (e.clientY - rect.top - size / 2) + "px";
      target.appendChild(circle);
      setTimeout(function () { if (circle.parentNode) circle.parentNode.removeChild(circle); }, 460);
    });
  }

  global.CipherVaultAnimations = {
    init: function (cfg) {
      config = cfg;
      var savedTheme = cfg.DEFAULT_THEME || "dark";
      try { savedTheme = localStorage.getItem("cv_theme") || savedTheme; } catch (e) {}
      applyTheme(savedTheme);
      applyBackgroundPrefs(cfg);
      bindRipple(cfg);
      initPageTransitions();
      initMicroAnimations();
      initCustomSelectPickers();
    },
    toggleTheme: toggleTheme,
    triggerPop: triggerPop,
    moveSegmentedIndicator: moveSegmentedIndicator,
    updateProgressBar: updateProgressBar,
    estimateCrackTime: estimateCrackTime,
    scramblePasswordInput: scramblePasswordInput,
    attachSwipeGesture: attachSwipeGesture,
    triggerHaptic: function (pattern) {
      if (!config || !config.ENABLE_HAPTIC) return;
      if (navigator && typeof navigator.vibrate === "function") {
        try { navigator.vibrate(pattern || 14); } catch (e) {}
      }
    }
  };
})(window);
