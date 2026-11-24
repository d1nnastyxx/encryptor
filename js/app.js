/**
 * Encryptor — Full Interactive Controller
 * Opt-In Manual Protections: Multi-Layer Cascade (1-3), SHA-256 Keyfile,
 * Kapsul Waktu, Duress Vault (File Pancingan), PNG Steganography,
 * Swipe Cards, Slide-Over Inspector/Preview, Command Palette, & Sketchware AndroidVault.
 */
(function (global) {
  "use strict";

  var cfg = global.CipherVaultConfig;
  var assets = global.CipherVaultAssets;
  var cryptoEngine = global.CipherVaultCrypto;
  var stego = global.CipherVaultStego;
  var pro = global.CipherVaultPro;
  var anim = global.CipherVaultAnimations;
  var sound = global.CipherVaultSound;

  var state = {
    mode: "encrypt",
    queue: [],
    isProcessing: false,
    abortController: null,
    processedCount: 0,
    nextId: 1,
    activeIterations: cfg.PBKDF2_ITERATIONS || 600000,
    cascadeLevel: 1,
    obfuscateMode: "random",
    keyfile: null,
    duressFile: null,
    coverImageFile: null,
    autoWipeTimer: null,
    autoWipeRemaining: 0,
    previewObjectUrl: null
  };

  var dom = {};

  function cacheDom() {
    dom.appNameText = document.getElementById("appNameText");
    dom.appVersionText = document.getElementById("appVersionText");
    dom.securityStatusPill = document.getElementById("securityStatusPill");
    dom.btnOpenCmd = document.getElementById("btnOpenCmd");
    dom.btnToggleSound = document.getElementById("btnToggleSound");
    dom.soundIconOn = document.getElementById("soundIconOn");
    dom.soundIconOff = document.getElementById("soundIconOff");
    dom.btnToggleTheme = document.getElementById("btnToggleTheme");

    dom.statQueueCount = document.getElementById("statQueueCount");
    dom.statProcessedCount = document.getElementById("statProcessedCount");
    dom.statIterations = document.getElementById("statIterations");
    dom.statSessionActivity = document.getElementById("statSessionActivity");
    dom.btnBenchmark = document.getElementById("btnBenchmark");

    dom.tabEncrypt = document.getElementById("tabEncrypt");
    dom.tabDecrypt = document.getElementById("tabDecrypt");
    dom.modeBadgeExt = document.getElementById("modeBadgeExt");
    dom.btnPasteClipboard = document.getElementById("btnPasteClipboard");
    dom.dropzone = document.getElementById("dropzone");
    dom.dropzoneIllustration = document.getElementById("dropzoneIllustration");
    dom.dropzoneTitle = document.getElementById("dropzoneTitle");
    dom.dropzoneSub = document.getElementById("dropzoneSub");
    dom.fileInput = document.getElementById("fileInput");

    // Opt-In Protections DOM
    dom.advancedAccordion = document.getElementById("advancedAccordion");
    dom.btnToggleAdvanced = document.getElementById("btnToggleAdvanced");
    dom.activeProtectionsBadge = document.getElementById("activeProtectionsBadge");
    dom.cascadeLevelRow = document.getElementById("cascadeLevelRow");
    dom.cascadeLevelBtns = document.querySelectorAll(".level-btn");

    dom.keyfileToggle = document.getElementById("keyfileToggle");
    dom.keyfilePanel = document.getElementById("keyfilePanel");
    dom.btnPickKeyfile = document.getElementById("btnPickKeyfile");
    dom.keyfileInput = document.getElementById("keyfileInput");
    dom.keyfileNameLabel = document.getElementById("keyfileNameLabel");
    dom.btnClearKeyfile = document.getElementById("btnClearKeyfile");

    dom.splitKeyToggle = document.getElementById("splitKeyToggle");
    dom.splitKeyPanel = document.getElementById("splitKeyPanel");
    dom.splitKeyInput = document.getElementById("splitKeyInput");

    dom.obfuscateBlock = document.getElementById("obfuscateBlock");
    dom.obfuscateToggle = document.getElementById("obfuscateToggle");
    dom.obfuscatePanel = document.getElementById("obfuscatePanel");
    dom.obfuscateModeBtns = document.querySelectorAll("#obfuscateModePills .level-btn");
    dom.customAliasInput = document.getElementById("customAliasInput");


    dom.expiryBlock = document.getElementById("expiryBlock");
    dom.expiryToggle = document.getElementById("expiryToggle");
    dom.expiryPanel = document.getElementById("expiryPanel");
    dom.expiryInput = document.getElementById("expiryInput");

    dom.duressBlock = document.getElementById("duressBlock");
    dom.duressToggle = document.getElementById("duressToggle");
    dom.duressPanel = document.getElementById("duressPanel");
    dom.btnPickDuressFile = document.getElementById("btnPickDuressFile");
    dom.duressFileInput = document.getElementById("duressFileInput");
    dom.duressFileLabel = document.getElementById("duressFileLabel");
    dom.duressPasswordInput = document.getElementById("duressPasswordInput");

    dom.stegoBlock = document.getElementById("stegoBlock");
    dom.stegoToggle = document.getElementById("stegoToggle");
    dom.stegoPanel = document.getElementById("stegoPanel");
    dom.btnPickCoverImg = document.getElementById("btnPickCoverImg");
    dom.coverImgInput = document.getElementById("coverImgInput");
    dom.coverImgLabel = document.getElementById("coverImgLabel");

    dom.bundleToggleWrap = document.getElementById("bundleToggleWrap");
    dom.bundleModeToggle = document.getElementById("bundleModeToggle");

    dom.cryptoForm = document.getElementById("cryptoForm");
    dom.passwordInput = document.getElementById("passwordInput");
    dom.confirmPasswordInput = document.getElementById("confirmPasswordInput");
    dom.confirmPasswordGroup = document.getElementById("confirmPasswordGroup");
    dom.crackTimeBadge = document.getElementById("crackTimeBadge");
    dom.entropyBadge = document.getElementById("entropyBadge");
    dom.strengthText = document.getElementById("strengthText");
    dom.strengthBarTrack = document.getElementById("strengthBarTrack");
    dom.strengthBarFill = document.getElementById("strengthBarFill");
    dom.matchText = document.getElementById("matchText");
    dom.weakPasswordBanner = document.getElementById("weakPasswordBanner");
    dom.btnGenPassword = document.getElementById("btnGenPassword");
    dom.btnCopyPassword = document.getElementById("btnCopyPassword");
    dom.autoWipeBadge = document.getElementById("autoWipeBadge");

    dom.btnStartProcess = document.getElementById("btnStartProcess");
    dom.btnStartLabel = document.getElementById("btnStartLabel");
    dom.btnCancelProcess = document.getElementById("btnCancelProcess");
    dom.btnRemoveAll = document.getElementById("btnRemoveAll");

    dom.cryptoVisualizer = document.getElementById("cryptoVisualizer");
    dom.visualizerMode = document.getElementById("visualizerMode");
    dom.visualizerFile = document.getElementById("visualizerFile");
    dom.visualizerStage = document.getElementById("visualizerStage");

    dom.queueBadge = document.getElementById("queueBadge");
    dom.gestureHint = document.getElementById("gestureHint");
    dom.queueList = document.getElementById("queueList");
    dom.queueEmptyState = document.getElementById("queueEmptyState");
    dom.queueEmptyIllustration = document.getElementById("queueEmptyIllustration");

    dom.drawerBackdrop = document.getElementById("drawerBackdrop");
    dom.drawerTitle = document.getElementById("drawerTitle");
    dom.drawerSubtitle = document.getElementById("drawerSubtitle");
    dom.drawerBody = document.getElementById("drawerBody");
    dom.btnCloseDrawer = document.getElementById("btnCloseDrawer");

    dom.cmdBackdrop = document.getElementById("cmdBackdrop");
    dom.cmdSearchInput = document.getElementById("cmdSearchInput");
    dom.cmdList = document.getElementById("cmdList");
    dom.btnCloseCmd = document.getElementById("btnCloseCmd");

    dom.toastContainer = document.getElementById("toastContainer");
    dom.modalBackdrop = document.getElementById("modalBackdrop");
    dom.modalTitle = document.getElementById("modalTitle");
    dom.modalMessage = document.getElementById("modalMessage");
    dom.modalCancelBtn = document.getElementById("modalCancelBtn");
    dom.modalConfirmBtn = document.getElementById("modalConfirmBtn");
  }
  
  
  function generateObfuscatedName(index, totalCount) {
    if (!dom.obfuscateToggle || !dom.obfuscateToggle.checked) return null;
    var mode = state.obfuscateMode || "random";

    if (mode === "custom") {
      var alias = (dom.customAliasInput.value || "").trim().replace(/[\\/:*?"<>|]/g, "_");
      if (alias) return totalCount > 1 ? (alias + "_" + (index + 1)) : alias;
    }

    var rand = new Uint8Array(10);
    global.crypto.getRandomValues(rand);

    if (mode === "system") {
      var digits = "";
      for (var d = 0; d < 6; d++) digits += String(rand[d] % 10);
      return "sys_cache_" + digits;
    }

    // Default: random lowercase string seperti "ankxhjbak"
    var chars = "abcdefghijkmnopqrstuvwxyz";
    var out = "";
    for (var i = 0; i < 9; i++) out += chars.charAt(rand[i] % chars.length);
    return out;
  }

  function updateProtectionSummaryBadge() {
    if (state.mode === "decrypt") {
      var dTags = [];
      if (dom.keyfileToggle.checked) dTags.push("Keyfile");
      if (dom.splitKeyToggle && dom.splitKeyToggle.checked) dTags.push("SplitKey");
      dom.activeProtectionsBadge.textContent = dTags.length ? dTags.join(" · ") : "Auto-Deteksi";
      return;
    }
    var tags = ["Lv " + state.cascadeLevel];
    if (dom.keyfileToggle.checked) tags.push("Keyfile");
    if (dom.splitKeyToggle && dom.splitKeyToggle.checked) tags.push("SplitKey");
    if (dom.obfuscateToggle && dom.obfuscateToggle.checked) tags.push("Samar");
    if (dom.expiryToggle.checked) tags.push("Kapsul");
    if (dom.duressToggle.checked) tags.push("Duress");
    if (dom.stegoToggle.checked) tags.push("PNG");
    dom.activeProtectionsBadge.textContent = tags.join(" · ");
    dom.modeBadgeExt.textContent = dom.stegoToggle.checked ? "* → .png (Stego)" : "* → .cel";
  }


  function showToast(message, type) {
    var toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "info");
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.2s ease";
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 220);
    }, 3500);
  }

  function showConfirmModal(title, message, confirmLabel) {
    return new Promise(function (resolve) {
      dom.modalTitle.textContent = title;
      dom.modalMessage.textContent = message;
      dom.modalConfirmBtn.textContent = confirmLabel || "Lanjutkan";
      dom.modalBackdrop.classList.add("open");
      function cleanup(res) {
        dom.modalBackdrop.classList.remove("open");
        dom.modalCancelBtn.removeEventListener("click", onCancel);
        dom.modalConfirmBtn.removeEventListener("click", onConfirm);
        resolve(res);
      }
      function onCancel() { sound.playClick(); cleanup(false); }
      function onConfirm() { sound.playClick(); cleanup(true); }
      dom.modalCancelBtn.addEventListener("click", onCancel);
      dom.modalConfirmBtn.addEventListener("click", onConfirm);
    });
  }

  function openDrawer(title, subtitle, bodyHtmlOrEl) {
    if (state.previewObjectUrl) {
      try { URL.revokeObjectURL(state.previewObjectUrl); } catch (e) {}
      state.previewObjectUrl = null;
    }
    dom.drawerTitle.textContent = title;
    dom.drawerSubtitle.textContent = subtitle || "";
    dom.drawerBody.innerHTML = "";
    if (typeof bodyHtmlOrEl === "string") dom.drawerBody.innerHTML = bodyHtmlOrEl;
    else if (bodyHtmlOrEl) dom.drawerBody.appendChild(bodyHtmlOrEl);
    dom.drawerBackdrop.classList.add("open");
    sound.playSwitch();
  }

  function closeDrawer() {
    dom.drawerBackdrop.classList.remove("open");
    if (state.previewObjectUrl) {
      setTimeout(function () {
        if (state.previewObjectUrl) {
          try { URL.revokeObjectURL(state.previewObjectUrl); } catch (e) {}
          state.previewObjectUrl = null;
        }
      }, 360);
    }
    sound.playClick();
  }

  /* Command Palette */
  function getCommandItems() {
    return [
      { label: "Mode Enkripsi File", hint: "ENCRYPT", action: function () { switchMode("encrypt"); } },
      { label: "Mode Dekripsi (.cel / .png)", hint: "DECRYPT", action: function () { switchMode("decrypt"); } },
      { label: "Buat Password Acak CSPRNG", hint: "KEYGEN", action: triggerGeneratePassword },
      { label: "Buka / Tutup Pengaturan Proteksi", hint: "OPT-IN", action: function () { dom.btnToggleAdvanced.click(); } },
      { label: "Tempel Teks / Gambar Clipboard", hint: "PASTE", action: handleClipboardButton },
      { label: "Kalibrasi Kecepatan CPU PBKDF2", hint: "BENCH", action: runCpuBenchmark },
      { label: "Ganti Tema Gelap / Terang", hint: "THEME", action: function () { dom.btnToggleTheme.click(); } },
      { label: "Aktifkan / Matikan Suara UI", hint: "AUDIO", action: function () { dom.btnToggleSound.click(); } },
      { label: "Buka Blueprint Cara Kerja", hint: "GUIDE", action: function () { if (global.CipherVaultMotionUI) global.CipherVaultMotionUI.openGuide(); } },
      { label: "Putar Cinematic Showcase (03:30)", hint: "FILM", action: function () { window.location.href = "showcase.html"; } },
      { label: "Mulai Tur Sorotan UI", hint: "TOUR", action: function () { if (global.CipherVaultMotionUI) global.CipherVaultMotionUI.startSpotlightTour(); } }
    ];
  }

  function renderCommandList(filter) {
    var query = (filter || "").toLowerCase().trim();
    dom.cmdList.innerHTML = "";
    getCommandItems().forEach(function (cmd) {
      if (query && cmd.label.toLowerCase().indexOf(query) === -1 && cmd.hint.toLowerCase().indexOf(query) === -1) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cmd-item";
      btn.innerHTML = "<span>" + cmd.label + "</span><span class='cmd-item-hint'>" + cmd.hint + "</span>";
      btn.addEventListener("click", function () { closeCommandPalette(); cmd.action(); });
      dom.cmdList.appendChild(btn);
    });
  }

  function openCommandPalette() {
    dom.cmdSearchInput.value = "";
    renderCommandList("");
    dom.cmdBackdrop.classList.add("open");
    sound.playSwitch();
    setTimeout(function () { dom.cmdSearchInput.focus(); }, 60);
  }

  function closeCommandPalette() { dom.cmdBackdrop.classList.remove("open"); }

  /* -------------------------------------------------------------------------
     Header Inspector & Secure Preview
     ------------------------------------------------------------------------- */

  function bytesToHexShort(bytes) {
    var out = "";
    for (var i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
    return out.toUpperCase();
  }

  async function inspectCvaultFile(file) {
    try {
      var raw = await readFileAsUint8Array(file.slice(0, 64));
      var info = cryptoEngine.inspectHeader(raw);
      if (!info) {
        showToast("Header .cel tidak dikenali (jika PNG Stego, langsung tekan Dekripsi).", "warning");
        return;
      }
      var html =
        '<div class="inspect-row"><span class="inspect-key">Format</span><span class="inspect-val">CVLT v' + info.version + '</span></div>' +
        '<div class="inspect-row"><span class="inspect-key">Cascade Level</span><span class="inspect-val">Level ' + info.cascadeLevel + ' (' + info.cascadeLevel + ' lapis)</span></div>' +
        '<div class="inspect-row"><span class="inspect-key">Kunci Ganda Fisik</span><span class="inspect-val">' + (info.requiresKeyfile ? 'WAJIB Keyfile' : 'Tidak dipakai') + '</span></div>' +
        '<div class="inspect-row"><span class="inspect-key">Iterasi PBKDF2</span><span class="inspect-val">' + info.iterations.toLocaleString() + '</span></div>' +
        '<div class="inspect-row"><span class="inspect-key">Salt (16B)</span><span class="inspect-val">' + bytesToHexShort(info.salt).slice(0, 16) + '&hellip;</span></div>' +
        '<div class="inspect-row"><span class="inspect-key">Nonce (12B)</span><span class="inspect-val">' + bytesToHexShort(info.nonce) + '</span></div>';

      openDrawer("Header Inspector", file.name, html);
    } catch (err) {
      showToast("Gagal membaca header file.", "error");
    }
  }

  function previewDecryptedItem(item) {
    if (!item.resultBlob) return;
    var mime = item.resultMime || "";
    var name = item.resultFilename || "";
    var ext = name.lastIndexOf(".") > 0 ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";

    if (mime.indexOf("image/") === 0 || ["jpg", "jpeg", "png", "webp", "gif"].indexOf(ext) !== -1) {
      state.previewObjectUrl = URL.createObjectURL(item.resultBlob);
      var img = document.createElement("img");
      img.className = "preview-img";
      img.src = state.previewObjectUrl;
      img.alt = name;
      openDrawer("Pratinjau Aman (Memori)", name + " • Tidak disimpan ke galeri", img);
    } else if (mime.indexOf("text/") === 0 || ["txt", "json", "md", "csv", "js", "html", "css", "xml"].indexOf(ext) !== -1) {
      var reader = new FileReader();
      reader.onload = function () {
        var pre = document.createElement("pre");
        pre.className = "preview-text";
        pre.textContent = String(reader.result || "").slice(0, 20000);
        openDrawer("Pratinjau Teks Aman", name, pre);
      };
      reader.readAsText(item.resultBlob);
    } else {
      showToast("Pratinjau langsung hanya mendukung gambar & teks. Gunakan Simpan / Unduh.", "info");
    }
  }

  /* -------------------------------------------------------------------------
     Auto-Wipe, Password UI & Mode Switch
     ------------------------------------------------------------------------- */

  function scheduleAutoWipe() {
    clearAutoWipe();
    var secs = cfg.AUTO_WIPE_SECONDS || 30;
    if (secs <= 0) return;
    state.autoWipeRemaining = secs;
    dom.autoWipeBadge.textContent = "Wipe " + state.autoWipeRemaining + "s";
    state.autoWipeTimer = setInterval(function () {
      state.autoWipeRemaining--;
      if (state.autoWipeRemaining <= 0) {
        clearAutoWipe();
        dom.passwordInput.value = "";
        dom.confirmPasswordInput.value = "";
        dom.duressPasswordInput.value = "";
        if (dom.splitKeyInput) dom.splitKeyInput.value = "";
        updatePasswordUI();
        showToast("Sandi dibersihkan otomatis dari memori.", "info");
      } else {
        dom.autoWipeBadge.textContent = "Wipe " + state.autoWipeRemaining + "s";
      }
    }, 1000);
  }

  function clearAutoWipe() {
    if (state.autoWipeTimer) { clearInterval(state.autoWipeTimer); state.autoWipeTimer = null; }
    dom.autoWipeBadge.textContent = "Wipe " + (cfg.AUTO_WIPE_SECONDS || 30) + "s";
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    var units = ["B", "KB", "MB", "GB"];
    var idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return (bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 2) + " " + units[idx];
  }

  function updateStats(activityLabel) {
    dom.statQueueCount.textContent = String(state.queue.length);
    dom.statProcessedCount.textContent = String(state.processedCount);
    dom.statIterations.textContent = Math.round(state.activeIterations / 1000) + "K KDF";
    dom.queueBadge.textContent = String(state.queue.length);
    dom.btnRemoveAll.disabled = state.queue.length === 0 || state.isProcessing;
    dom.gestureHint.style.display = state.queue.length > 0 ? "block" : "none";
    if (activityLabel) dom.statSessionActivity.textContent = activityLabel;
  }

  function updatePasswordUI() {
    var pw = dom.passwordInput.value;
    var confirmPw = dom.confirmPasswordInput.value;
    var bits = pro.calculateEntropyBits(pw);
    dom.entropyBadge.textContent = bits + " bit";
    dom.crackTimeBadge.textContent = "Crack: " + anim.estimateCrackTime(bits);
    if (global.CipherVaultMotionUI) global.CipherVaultMotionUI.updateEntropyGraph(bits);
    if (global.CipherVaultMotionUI) {
      global.CipherVaultMotionUI.updateEntropyGraph(bits);
      global.CipherVaultMotionUI.updateAvalancheMatrix(pw);
    }


    if (state.mode === "encrypt") {
      dom.strengthBarFill.style.width = Math.min(100, Math.round((bits / 90) * 100)) + "%";
      if (!pw) {
        dom.strengthText.textContent = "Kosong";
        dom.strengthText.style.color = "var(--text-tertiary)";
        dom.weakPasswordBanner.style.display = "none";
      } else if (bits < 45) {
        dom.strengthBarFill.style.background = "var(--danger)";
        dom.strengthText.textContent = "Lemah";
        dom.strengthText.style.color = "var(--danger)";
        dom.weakPasswordBanner.style.display = "block";
      } else if (bits < 70) {
        dom.strengthBarFill.style.background = "var(--warning)";
        dom.strengthText.textContent = "Sedang";
        dom.strengthText.style.color = "var(--warning)";
        dom.weakPasswordBanner.style.display = "block";
      } else {
        dom.strengthBarFill.style.background = "var(--success)";
        dom.strengthText.textContent = bits >= 95 ? "Sangat Kuat" : "Kuat";
        dom.strengthText.style.color = "var(--success)";
        dom.weakPasswordBanner.style.display = "none";
      }

      if (!confirmPw) dom.matchText.textContent = "";
      else if (pw === confirmPw) { dom.matchText.textContent = "Cocok"; dom.matchText.style.color = "var(--success)"; }
      else { dom.matchText.textContent = "Tidak cocok"; dom.matchText.style.color = "var(--danger)"; }
    } else {
      dom.weakPasswordBanner.style.display = "none";
    }
  }

  function switchMode(newMode) {
    if (state.isProcessing) {
      showToast("Tunggu atau batalkan proses aktif terlebih dahulu.", "warning");
      return;
    }
    state.mode = newMode;
    var isEncrypt = newMode === "encrypt";

    dom.tabEncrypt.classList.toggle("active", isEncrypt);
    dom.tabEncrypt.setAttribute("aria-selected", String(isEncrypt));
    dom.tabDecrypt.classList.toggle("active", !isEncrypt);
    dom.tabDecrypt.setAttribute("aria-selected", String(!isEncrypt));
    anim.moveSegmentedIndicator(newMode);

    dom.modeBadgeExt.textContent = isEncrypt ? (dom.stegoToggle.checked ? "* → .png (Stego)" : "* → .cel") : ".cel / .png → Asli";
    dom.dropzoneIllustration.innerHTML = isEncrypt ? assets.ILLUSTRATIONS.dropEncrypt : assets.ILLUSTRATIONS.dropDecrypt;
    dom.dropzoneTitle.textContent = isEncrypt ? "Pilih atau seret file ke sini" : "Pilih arsip .cel atau gambar Stego .png";
    dom.dropzoneSub.textContent = isEncrypt
      ? "PDF, gambar, dokumen, arsip, atau tekan Ctrl+V"
      : "Cascade, Kapsul Waktu, Duress & Steganografi terdeteksi otomatis";
    dom.btnStartLabel.textContent = isEncrypt ? "Enkripsi File" : "Dekripsi File";

    dom.confirmPasswordGroup.classList.toggle("collapsed", !isEncrypt);
    dom.cascadeLevelRow.style.display = isEncrypt ? "flex" : "none";
    dom.expiryBlock.style.display = isEncrypt ? "flex" : "none";
    dom.duressBlock.style.display = isEncrypt ? "flex" : "none";
    dom.stegoBlock.style.display = isEncrypt ? "flex" : "none";
    dom.bundleToggleWrap.style.display = isEncrypt ? "flex" : "none";

    dom.strengthBarTrack.style.display = isEncrypt ? "block" : "none";
    dom.strengthText.style.display = isEncrypt ? "inline" : "none";
    dom.crackTimeBadge.style.display = isEncrypt ? "inline" : "none";
    dom.btnGenPassword.style.display = isEncrypt ? "grid" : "none";
    dom.btnCopyPassword.style.display = isEncrypt ? "grid" : "none";
    if (dom.obfuscateBlock) dom.obfuscateBlock.style.display = isEncrypt ? "flex" : "none";


    updateProtectionSummaryBadge();
    updatePasswordUI();
    sound.playSwitch();
    anim.triggerHaptic(10);
  }

  /* -------------------------------------------------------------------------
     Queue, Clipboard & Download Bridge (Sketchware Pro AndroidVault)
     ------------------------------------------------------------------------- */

  async function handleClipboardButton() {
    if (state.isProcessing) return;
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        var text = await navigator.clipboard.readText();
        if (text && text.trim().length > 0) {
          var file = new File([new Blob([text], { type: "text/plain" })], "Catatan_" + Date.now().toString().slice(-4) + ".txt", { type: "text/plain" });
          addFilesToQueue([file]);
          return;
        }
      } catch (e) {}
    }
    showToast("Tekan Ctrl+V di keyboard atau salin teks terlebih dahulu.", "info");
  }

  function revokeItemResources(item) {
    if (item.objectUrl) { try { URL.revokeObjectURL(item.objectUrl); } catch (e) {} item.objectUrl = null; }
    item.resultBlob = null;
    item.resultBytes = null;
    item.extractedFiles = null;
  }

  async function checkDecryptKeyfileHint(file) {
    if (state.mode !== "decrypt") return;
    try {
      var raw = await readFileAsUint8Array(file.slice(0, 64));
      var info = cryptoEngine.inspectHeader(raw);
      if (info && info.requiresKeyfile) {
        dom.advancedAccordion.classList.add("open");
        dom.keyfileToggle.checked = true;
        dom.keyfilePanel.classList.add("open");
        updateProtectionSummaryBadge();
        showToast(file.name + " membutuhkan Kunci Ganda Fisik (Keyfile).", "warning");
      }
      if (info && info.requiresSplitKey && dom.splitKeyToggle) {
        dom.advancedAccordion.classList.add("open");
        dom.splitKeyToggle.checked = true;
        dom.splitKeyPanel.classList.add("open");
        updateProtectionSummaryBadge();
        showToast(file.name + " membutuhkan 2-Part Split Key (Kunci B).", "warning");
      }
    } catch (e) {}
  }


  function addFilesToQueue(fileList) {
    if (!fileList || fileList.length === 0) return;
    var added = 0;
    Array.prototype.slice.call(fileList).forEach(function (file) {
      if (file.size > cfg.MAX_FILE_SIZE) {
        showToast(file.name + " melebihi batas (" + formatBytes(cfg.MAX_FILE_SIZE) + ").", "error");
        return;
      }
      state.queue.push({
        id: state.nextId++,
        file: file,
        status: "pending",
        stage: "Siap diproses",
        progress: 0,
        resultFilename: "",
        resultMime: "",
        resultSize: 0,
        resultBlob: null,
        resultBytes: null,
        extractedFiles: null,
        objectUrl: null,
        errorMessage: ""
      });
      checkDecryptKeyfileHint(file);
      added++;
    });

    if (added > 0) {
      renderQueue();
      updateStats("Siap");
      sound.playDrop();
      anim.triggerHaptic(14);
      showToast(added + " file masuk antrean.", "info");
    }

  }

  function removeQueueItem(id, skipAnimation) {
    if (state.isProcessing) return;
    var doRemove = function () {
      var idx = state.queue.findIndex(function (it) { return it.id === id; });
      if (idx !== -1) { revokeItemResources(state.queue[idx]); state.queue.splice(idx, 1); }
      renderQueue();
      updateStats("Siaga");
      sound.playClick();
    };
    var wrapper = document.getElementById("swipe-wrap-" + id);
    if (!skipAnimation && wrapper) {
      wrapper.classList.add("removing");
      setTimeout(doRemove, 280);
    } else {
      doRemove();
    }
  }

  function clearAllQueue(silent) {
    state.queue.forEach(revokeItemResources);
    state.queue = [];
    renderQueue();
    updateStats("Siaga");
    if (!silent) showToast("Antrean dibersihkan.", "info");
  }

  function bytesToBase64DataUrl(bytes, mime) {
    var chunkSize = 0x8000;
    var binary = "";
    for (var i = 0; i < bytes.length; i += chunkSize) {
      var slice = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, slice);
    }
    return "data:" + (mime || "application/octet-stream") + ";base64," + btoa(binary);
  }

  async function saveOutputToDevice(bytes, blob, filename, mime) {
    try {
      sound.playClick();
      if (global.AndroidVault && typeof global.AndroidVault.saveBase64File === "function") {
        var raw = bytes || new Uint8Array(await blob.arrayBuffer());
        var b64 = bytesToBase64DataUrl(raw, mime);
        global.AndroidVault.saveBase64File(b64, filename);
        showToast("Menyimpan " + filename + " ke Download...", "success");
        anim.triggerHaptic(18);
        return;
      }

      var isFileProto = global.location.protocol === "file:";
      var useB64 = isFileProto && cfg.ENABLE_BASE64_FALLBACK && bytes && bytes.length <= (cfg.BASE64_FALLBACK_MAX_BYTES || 8 * 1024 * 1024);
      var hrefUrl = useB64 ? bytesToBase64DataUrl(bytes, mime) : URL.createObjectURL(blob);

      var a = document.createElement("a");
      a.href = hrefUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast(filename + " disiapkan untuk diunduh.", "success");
      anim.triggerHaptic(18);
    } catch (err) {
      sound.playError();
      showToast("Gagal menyimpan file.", "error");
    }
  }

  function renderQueue() {
    dom.queueList.innerHTML = "";
    if (state.queue.length === 0) {
      dom.queueList.appendChild(dom.queueEmptyState);
      return;
    }

    state.queue.forEach(function (item) {
      var displayFilename = item.status === "done" && item.resultFilename ? item.resultFilename : item.file.name;
      var fileAsset = assets.getFileAsset(displayFilename);

      var wrapper = document.createElement("div");
      wrapper.className = "swipe-wrapper";
      wrapper.id = "swipe-wrap-" + item.id;

      var bgLayer = document.createElement("div");
      bgLayer.className = "swipe-bg-layer";
      bgLayer.innerHTML = '<span class="swipe-hint-save">Simpan &rarr;</span><span class="swipe-hint-del">&larr; Hapus</span>';
      wrapper.appendChild(bgLayer);

      var card = document.createElement("div");
      card.className = "queue-item status-" + item.status;
      card.id = "queue-item-" + item.id;

      var top = document.createElement("div");
      top.className = "q-top";
      var iconWrap = document.createElement("div");
      iconWrap.className = "q-file-icon";
      iconWrap.style.background = fileAsset.bg;
      iconWrap.style.color = fileAsset.color;
      iconWrap.innerHTML = fileAsset.svg;

      var meta = document.createElement("div");
      meta.className = "q-meta";
      var nameEl = document.createElement("div");
      nameEl.className = "q-name";
      nameEl.textContent = displayFilename;
      var subEl = document.createElement("div");
      subEl.className = "q-sub";
      subEl.textContent = formatBytes(item.status === "done" ? item.resultSize : item.file.size);
      meta.appendChild(nameEl);
      meta.appendChild(subEl);

      var rmBtn = document.createElement("button");
      rmBtn.type = "button";
      rmBtn.className = "q-remove-btn";
      rmBtn.textContent = "✕";
      rmBtn.disabled = state.isProcessing;
      rmBtn.addEventListener("click", function () { removeQueueItem(item.id, false); });

      top.appendChild(iconWrap);
      top.appendChild(meta);
      top.appendChild(rmBtn);
      card.appendChild(top);

      var progTrack = document.createElement("div");
      progTrack.className = "q-progress-track";
      var progFill = document.createElement("div");
      progFill.className = "q-progress-fill";
      progFill.style.width = item.progress + "%";
      progTrack.appendChild(progFill);
      card.appendChild(progTrack);

      var statusRow = document.createElement("div");
      statusRow.className = "q-status-row";
      var stageEl = document.createElement("span");
      stageEl.textContent = item.status === "error" ? item.errorMessage : item.stage;
      var pctEl = document.createElement("span");
      pctEl.textContent = item.progress + "%";
      statusRow.appendChild(stageEl);
      statusRow.appendChild(pctEl);
      card.appendChild(statusRow);

      if (item.status === "pending" && item.file.name && item.file.name.toLowerCase().endsWith(".cel")) {
        var preActions = document.createElement("div");
        preActions.className = "q-actions";
        var inspBtn = document.createElement("button");
        inspBtn.type = "button";
        inspBtn.className = "q-btn";
        inspBtn.textContent = "Inspect Header";
        inspBtn.addEventListener("click", function () { inspectCvaultFile(item.file); });
        preActions.appendChild(inspBtn);
        card.appendChild(preActions);
      }

      if (item.status === "done" && item.extractedFiles && item.extractedFiles.length > 0) {
        var listWrap = document.createElement("div");
        listWrap.className = "bundle-extracted-list";
        item.extractedFiles.forEach(function (ef) {
          var row = document.createElement("div");
          row.className = "bundle-file-row";
          var fname = document.createElement("span");
          fname.className = "bundle-file-name";
          fname.textContent = ef.name + " (" + formatBytes(ef.size) + ")";
          var dlMini = document.createElement("button");
          dlMini.type = "button";
          dlMini.className = "bundle-dl-mini";
          dlMini.textContent = "Simpan";
          dlMini.addEventListener("click", function () {
            var b = new Blob([ef.data], { type: ef.mime });
            saveOutputToDevice(ef.data, b, ef.name, ef.mime);
          });
          row.appendChild(fname);
          row.appendChild(dlMini);
          listWrap.appendChild(row);
        });
        card.appendChild(listWrap);
      } else if (item.status === "done") {
        var actions = document.createElement("div");
        actions.className = "q-actions";
        if (state.mode === "decrypt" && item.resultBlob) {
          var prevBtn = document.createElement("button");
          prevBtn.type = "button";
          prevBtn.className = "q-btn";
          prevBtn.textContent = "Pratinjau";
          prevBtn.addEventListener("click", function () { previewDecryptedItem(item); });
          actions.appendChild(prevBtn);
        }
        if (item.resultBlob) {
          var forBtn = document.createElement("button");
          forBtn.type = "button";
          forBtn.className = "q-btn";
          forBtn.textContent = "Forensik";
          forBtn.addEventListener("click", async function () {
            var wrap = document.createElement("div");
            wrap.className = "form-stack";

            var rawBytes = item.resultBytes || new Uint8Array(await item.resultBlob.arrayBuffer());
            var histCanvas = document.createElement("canvas");
            histCanvas.className = "forensic-canvas";
            histCanvas.width = 320;
            histCanvas.height = 120;

            var statEl = document.createElement("div");
            statEl.className = "inspect-row";
            wrap.appendChild(histCanvas);
            wrap.appendChild(statEl);

            if (item.resultFilename && item.resultFilename.toLowerCase().endsWith(".png")) {
              var mapLabel = document.createElement("div");
              mapLabel.className = "drawer-sub";
              mapLabel.textContent = "Peta Panas LSB Piksel (Steganography Heatmap)";
              var mapCanvas = document.createElement("canvas");
              mapCanvas.className = "forensic-canvas";
              mapCanvas.width = 320;
              mapCanvas.height = 140;
              wrap.appendChild(mapLabel);
              wrap.appendChild(mapCanvas);
              setTimeout(function () {
                if (global.CipherVaultMotionUI) global.CipherVaultMotionUI.renderStegoHeatmap(mapCanvas, item.resultBlob);
              }, 80);
            }

            openDrawer("Analisis Forensik 60fps", item.resultFilename, wrap);
            setTimeout(function () {
              if (global.CipherVaultMotionUI) {
                var res = global.CipherVaultMotionUI.renderForensicHistogram(histCanvas, rawBytes);
                statEl.innerHTML = '<span class="inspect-key">Shannon Entropy</span><span class="inspect-val">' + res.entropy.toFixed(4) + ' / 8.000 bit</span>';
              }
            }, 80);
          });
          actions.appendChild(forBtn);
        }

        var dlBtn = document.createElement("button");
        dlBtn.type = "button";
        dlBtn.className = "q-btn q-btn-primary";
        dlBtn.textContent = "Simpan / Unduh";
        dlBtn.addEventListener("click", function () {
          saveOutputToDevice(item.resultBytes, item.resultBlob, item.resultFilename, item.resultMime);
        });
        actions.appendChild(dlBtn);
        card.appendChild(actions);
      }

      wrapper.appendChild(card);
      dom.queueList.appendChild(wrapper);

      anim.attachSwipeGesture(wrapper, card, {
        disabled: state.isProcessing,
        canSave: item.status === "done" && !!item.resultBlob,
        onSwipeDelete: function () { removeQueueItem(item.id, true); },
        onSwipeSave: function () {
          saveOutputToDevice(item.resultBytes, item.resultBlob, item.resultFilename, item.resultMime);
        }
      });
    });
  }

  function updateQueueItemProgressDOM(item) {
    var el = document.getElementById("queue-item-" + item.id);
    if (!el) return;
    var fill = el.querySelector(".q-progress-fill");
    var spans = el.querySelectorAll(".q-status-row span");
    if (fill) fill.style.width = item.progress + "%";
    if (spans[0]) spans[0].textContent = item.stage;
    if (spans[1]) spans[1].textContent = item.progress + "%";
  }

  /* -------------------------------------------------------------------------
     Core Processing (Integrates Cascade, Keyfile, Expiry, Duress & Stego)
     ------------------------------------------------------------------------- */

  function readFileAsUint8Array(file) {
    return new Promise(function (resolve, reject) {
      if (typeof file.arrayBuffer === "function") {
        file.arrayBuffer().then(function (buf) { resolve(new Uint8Array(buf)); })
          .catch(function () { reject(new Error("Gagal membaca file.")); });
        return;
      }
      var reader = new FileReader();
      reader.onload = function () { resolve(new Uint8Array(reader.result)); };
      reader.onerror = function () { reject(new Error("Gagal membaca file.")); };
      reader.readAsArrayBuffer(file);
    });
  }

  async function startProcessing(e) {
    e.preventDefault();
    if (state.isProcessing) return;

    if (!cryptoEngine.hasSecureRandom()) {
      sound.playError();
      showToast("CSPRNG tidak tersedia. Proses dihentikan.", "error");
      return;
    }

    var pendingItems = state.queue.filter(function (it) {
      return it.status === "pending" || it.status === "error" || it.status === "canceled";
    });
    if (pendingItems.length === 0) {
      sound.playError();
      showToast("Tambahkan file terlebih dahulu.", "warning");
      return;
    }

    var password = dom.passwordInput.value;
    if (!password) {
      sound.playError();
      showToast("Password tidak boleh kosong.", "error");
      dom.passwordInput.focus();
      return;
    }

    // Validasi Opt-In Keyfile
    var keyfileBytes = null;
    if (dom.keyfileToggle.checked) {
      if (!state.keyfile) {
        sound.playError();
        showToast("Sakelar Keyfile aktif, tetapi file kunci belum dipilih.", "error");
        return;
      }
      keyfileBytes = await readFileAsUint8Array(state.keyfile);
    }
    
  var splitKey = "";
  if (dom.splitKeyToggle && dom.splitKeyToggle.checked) {
    splitKey = dom.splitKeyInput.value;
    if (!splitKey) {
      sound.playError();
      showToast("Sakelar 2-Part Split Key aktif, tetapi Kunci B belum diisi.", "error");
      dom.splitKeyInput.focus();
      return;
    }
  }


    // Validasi Khusus Mode Enkripsi
    var expiresAt = null;
    var duressPayload = null;
    var useStego = false;

    if (state.mode === "encrypt") {
      if (password !== dom.confirmPasswordInput.value) {
        sound.playError();
        showToast("Konfirmasi password tidak cocok.", "error");
        dom.confirmPasswordInput.focus();
        return;
      }

      if (dom.expiryToggle.checked) {
        var expVal = dom.expiryInput.value;
        var ts = expVal ? new Date(expVal).getTime() : 0;
        if (!ts || isNaN(ts) || ts <= Date.now()) {
          sound.playError();
          showToast("Pilih tanggal & jam Kapsul Waktu di masa depan.", "error");
          return;
        }
        expiresAt = ts;
      }

      if (dom.duressToggle.checked) {
        var duressPw = dom.duressPasswordInput.value;
        if (!state.duressFile || !duressPw) {
          sound.playError();
          showToast("Duress Vault aktif: pilih file pancingan dan isi password kedua.", "error");
          return;
        }
        if (duressPw === password) {
          sound.playError();
          showToast("Password pancingan tidak boleh sama dengan password utama.", "error");
          return;
        }
        duressPayload = {
          bytes: await readFileAsUint8Array(state.duressFile),
          meta: { name: state.duressFile.name, mime: state.duressFile.type },
          password: duressPw
        };
      }

      if (dom.stegoToggle.checked) {
        if (!state.coverImageFile) {
          sound.playError();
          showToast("Kamuflase PNG aktif: pilih gambar cover terlebih dahulu.", "error");
          return;
        }
        useStego = true;
      }

      if (pro.calculateEntropyBits(password) < 45) {
        var okWeak = await showConfirmModal(
          "Password Lemah",
          "Entropi sandi rendah dan mudah ditebak. Tetap lanjutkan?",
          "Tetap Lanjutkan"
        );
        if (!okWeak) return;
      }
    }

    clearAutoWipe();
    state.isProcessing = true;
    state.abortController = { aborted: false };
    sound.playClick();

    dom.btnStartProcess.style.display = "none";
    dom.btnCancelProcess.style.display = "inline-flex";
    dom.cryptoVisualizer.style.display = "flex";
    dom.visualizerMode.textContent = state.mode === "encrypt" ? ("LV" + state.cascadeLevel) : "DECRYPT";
    updateStats(state.mode === "encrypt" ? "Mengenkripsi" : "Mendekripsi");
    renderQueue();

    var successCount = 0;

    if (state.mode === "encrypt" && dom.bundleModeToggle.checked && pendingItems.length > 0) {
      try {
        dom.visualizerFile.textContent = "Arsip Brankas (" + pendingItems.length + " file)";
        dom.visualizerStage.textContent = "Membungkus file...";
        anim.updateProgressBar(5);

        var entries = [];
        for (var b = 0; b < pendingItems.length; b++) {
          pendingItems[b].status = "processing";
          pendingItems[b].stage = "Membungkus...";
          pendingItems[b].progress = 10;
          renderQueue();
          var fBytes = await readFileAsUint8Array(pendingItems[b].file);
          entries.push({ name: pendingItems[b].file.name, mime: pendingItems[b].file.type, data: fBytes });
        }

        var bundle = pro.packFilesToBundle(entries);
        var encBundle = await cryptoEngine.encryptFileData(
          bundle.data,
          { name: bundle.name, mime: bundle.mime },
          password,
          {
            iterations: state.activeIterations,
            cascadeLevel: state.cascadeLevel,
            splitKey: splitKey,
            outputName: generateObfuscatedName(0, 1),
            keyfileBytes: keyfileBytes,
            expiresAt: expiresAt,
            duress: duressPayload,
            abortSignal: state.abortController,
            onProgress: function (stage, pct) {
              dom.visualizerStage.textContent = stage;
              anim.updateProgressBar(pct);
            }
          }
        );

        var finalOut = encBundle;
        if (useStego) {
          dom.visualizerStage.textContent = "Menyisipkan ke piksel PNG...";
          finalOut = await stego.embedInImage(state.coverImageFile, encBundle.data);
        }

        clearAllQueue(true);
        state.queue.push({
          id: state.nextId++,
          file: { name: finalOut.filename, size: finalOut.data.length },
          status: "done",
          stage: useStego ? "Arsip disisipkan ke PNG" : ("Arsip " + entries.length + " file selesai"),
          progress: 100,
          resultFilename: finalOut.filename,
          resultMime: finalOut.mime,
          resultSize: finalOut.data.length,
          resultBlob: new Blob([finalOut.data], { type: finalOut.mime }),
          resultBytes: finalOut.data.length <= (cfg.BASE64_FALLBACK_MAX_BYTES || 8 * 1024 * 1024) ? finalOut.data : null,
          extractedFiles: null,
          objectUrl: null,
          errorMessage: ""
        });
        state.processedCount += entries.length;
        successCount = 1;
      } catch (err) {
        sound.playError();
        showToast(err.message || "Gagal membuat arsip.", "error");
      }
    } else {
      for (var i = 0; i < pendingItems.length; i++) {
        var item = pendingItems[i];
        if (state.abortController.aborted) {
          item.status = "canceled";
          item.stage = "Dibatalkan";
          continue;
        }

        item.status = "processing";
        item.progress = 4;
        item.stage = "Membaca file";
        dom.visualizerFile.textContent = item.file.name;
        dom.visualizerStage.textContent = "Membaca file...";
        anim.updateProgressBar(4);
        renderQueue();

        try {
          var onProg = function (stageName, pct) {
            item.stage = stageName;
            item.progress = pct;
            dom.visualizerStage.textContent = stageName;
            anim.updateProgressBar(pct);
            updateQueueItemProgressDOM(item);
          };

          var result;
          if (state.mode === "encrypt") {
            var inputBytes = await readFileAsUint8Array(item.file);
            var encRes = await cryptoEngine.encryptFileData(
              inputBytes,
              { name: item.file.name, mime: item.file.type },
              password,
              {
                iterations: state.activeIterations,
                cascadeLevel: state.cascadeLevel,
                keyfileBytes: keyfileBytes,
                splitKey: splitKey,
                outputName: generateObfuscatedName(i, pendingItems.length),
                expiresAt: expiresAt,
                duress: duressPayload,
                onProgress: onProg,
                abortSignal: state.abortController
              }
            );

            result = encRes;
            if (useStego) {
              onProg("Menyisipkan ke PNG...", 96);
              result = await stego.embedInImage(state.coverImageFile, encRes.data);
            }

            revokeItemResources(item);
            item.resultFilename = result.filename;
            item.resultMime = result.mime;
            item.resultSize = result.data.length;
            item.resultBlob = new Blob([result.data], { type: result.mime });
            item.resultBytes = result.data.length <= (cfg.BASE64_FALLBACK_MAX_BYTES || 8 * 1024 * 1024) ? result.data : null;
            item.stage = useStego ? "Tersisip di PNG" : ("Terenkripsi (Lv " + state.cascadeLevel + ")");
          } else {
            var decryptInput;
            if (stego.isLikelyImageFile(item.file)) {
              onProg("Mengekstrak payload PNG...", 8);
              var extractedPayload = await stego.extractFromImage(item.file);
              if (!extractedPayload) {
                throw new Error("Gambar PNG ini tidak mengandung payload Encryptor.");
              }
              decryptInput = extractedPayload;
            } else {
              decryptInput = await readFileAsUint8Array(item.file);
            }

            result = await cryptoEngine.decryptFileData(
              decryptInput,
              password,
              { keyfileBytes: keyfileBytes, onProgress: onProg, abortSignal: state.abortController, splitKey: splitKey }
            );
            revokeItemResources(item);

            if (pro.isBundleResult(result)) {
              var extracted = pro.unpackBundleBytes(result.data);
              item.extractedFiles = extracted;
              item.resultFilename = "Arsip (" + extracted.length + " file)";
              item.resultSize = result.data.length;
              item.stage = "Arsip dibongkar";
            } else {
              item.resultFilename = result.filename;
              item.resultMime = result.mime;
              item.resultSize = result.data.length;
              item.resultBlob = new Blob([result.data], { type: result.mime });
              item.resultBytes = result.data.length <= (cfg.BASE64_FALLBACK_MAX_BYTES || 8 * 1024 * 1024) ? result.data : null;
              item.stage = "Integritas valid";
            }
          }

          item.status = "done";
          item.progress = 100;
          state.processedCount++;
          successCount++;
        } catch (err) {
          item.status = err && err.code === "ABORTED" ? "canceled" : "error";
          item.errorMessage = (err && err.message) ? err.message : "Gagal memproses.";
          item.stage = item.errorMessage;
        }
        renderQueue();
      }
    }

    if (keyfileBytes) keyfileBytes.fill(0);
    state.isProcessing = false;
    dom.btnStartProcess.style.display = "inline-flex";
    dom.btnCancelProcess.style.display = "none";
    dom.cryptoVisualizer.style.display = "none";
    renderQueue();

    if (state.abortController.aborted) {
      updateStats("Dibatalkan");
      showToast("Proses dibatalkan.", "warning");
    } else if (successCount > 0) {
      updateStats("Selesai");
      sound.playSuccess(state.mode === "decrypt");
      anim.triggerHaptic([16, 32, 16]);
      showToast("Selesai. Geser kanan atau ketuk Simpan.", "success");
      scheduleAutoWipe();
    } else {
      updateStats("Gagal");
      sound.playError();
      showToast("Pemrosesan gagal. Cek pesan pada antrean.", "error");
    }
  }

  /* -------------------------------------------------------------------------
     Interactive Triggers & Events
     ------------------------------------------------------------------------- */

  function triggerGeneratePassword() {
    try {
      var pw = pro.generateSecurePassword(cfg.GENERATED_PASSWORD_LENGTH || 20);
      dom.passwordInput.type = "text";
      dom.confirmPasswordInput.type = "text";
      sound.playKeygen();
      anim.triggerHaptic(16);
      anim.scramblePasswordInput(dom.passwordInput, pw, function () {
        dom.confirmPasswordInput.value = pw;
        updatePasswordUI();
        showToast("Password acak (" + pro.calculateEntropyBits(pw) + " bit) dibuat.", "success");
      });
    } catch (err) {
      sound.playError();
      showToast(err.message, "error");
    }
  }

  async function runCpuBenchmark() {
    if (state.isProcessing) return;
    sound.playClick();
    dom.btnBenchmark.disabled = true;
    dom.btnBenchmark.textContent = "Mengukur...";
    try {
      var res = await pro.runKdfBenchmark();
      state.activeIterations = res.recommendedIterations;
      updateStats("Kalibrasi OK");
      if (global.CipherVaultMotionUI) global.CipherVaultMotionUI.updateBenchmarkGraph(res.itersPerSec, res.recommendedIterations);
      sound.playSuccess(false);
      showToast("KDF disetel ke " + Math.round(res.recommendedIterations / 1000) + "K iterasi.", "success");
    } catch (err) {
      sound.playError();
      showToast("Kalibrasi gagal.", "error");
    } finally {
      dom.btnBenchmark.disabled = false;
      dom.btnBenchmark.textContent = "Kalibrasi";
    }
  }

  function bindEvents() {
    dom.tabEncrypt.addEventListener("click", function () { switchMode("encrypt"); });
    dom.tabDecrypt.addEventListener("click", function () { switchMode("decrypt"); });

    // Cascade Level Pills
    dom.cascadeLevelBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.cascadeLevel = parseInt(btn.getAttribute("data-level"), 10) || 1;
        dom.cascadeLevelBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
        updateProtectionSummaryBadge();
        sound.playClick();
      });
    });

    // Opt-In Toggles
    dom.keyfileToggle.addEventListener("change", function () {
      dom.keyfilePanel.classList.toggle("open", dom.keyfileToggle.checked);
      updateProtectionSummaryBadge();
      sound.playSwitch();
    });
    dom.btnPickKeyfile.addEventListener("click", function () { dom.keyfileInput.click(); });
    dom.keyfileInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        state.keyfile = e.target.files[0];
        dom.keyfileNameLabel.textContent = state.keyfile.name;
        dom.btnClearKeyfile.style.display = "inline-block";
        sound.playDrop();
      }
    });
    dom.btnClearKeyfile.addEventListener("click", function () {
      state.keyfile = null;
      dom.keyfileInput.value = "";
      dom.keyfileNameLabel.textContent = "Belum ada keyfile dipilih";
      dom.btnClearKeyfile.style.display = "none";
      sound.playClick();
    });

    dom.expiryToggle.addEventListener("change", function () {
      dom.expiryPanel.classList.toggle("open", dom.expiryToggle.checked);
      updateProtectionSummaryBadge();
      sound.playSwitch();
    });

    dom.duressToggle.addEventListener("change", function () {
      dom.duressPanel.classList.toggle("open", dom.duressToggle.checked);
      updateProtectionSummaryBadge();
      sound.playSwitch();
    });
    dom.btnPickDuressFile.addEventListener("click", function () { dom.duressFileInput.click(); });
    dom.duressFileInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        state.duressFile = e.target.files[0];
        dom.duressFileLabel.textContent = state.duressFile.name;
        sound.playDrop();
      }
    });

    dom.stegoToggle.addEventListener("change", function () {
      dom.stegoPanel.classList.toggle("open", dom.stegoToggle.checked);
      updateProtectionSummaryBadge();
      sound.playSwitch();
    });
    dom.btnPickCoverImg.addEventListener("click", function () { dom.coverImgInput.click(); });
    dom.coverImgInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        state.coverImageFile = e.target.files[0];
        dom.coverImgLabel.textContent = state.coverImageFile.name;
        sound.playDrop();
        if (global.CipherVaultMotionUI) {
          var totalQ = state.queue.reduce(function (acc, it) { return acc + (it.file ? it.file.size : 0); }, 0);
          global.CipherVaultMotionUI.updateStegoGauge(state.coverImageFile, totalQ);
        }
      }
    });

    // Command Palette & Drawer
    dom.btnOpenCmd.addEventListener("click", openCommandPalette);
    dom.btnCloseCmd.addEventListener("click", closeCommandPalette);
    dom.cmdBackdrop.addEventListener("click", function (e) { if (e.target === dom.cmdBackdrop) closeCommandPalette(); });
    dom.cmdSearchInput.addEventListener("input", function () { renderCommandList(dom.cmdSearchInput.value); });

    dom.btnCloseDrawer.addEventListener("click", closeDrawer);
    dom.drawerBackdrop.addEventListener("click", function (e) { if (e.target === dom.drawerBackdrop) closeDrawer(); });

    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dom.cmdBackdrop.classList.contains("open")) closeCommandPalette();
        else openCommandPalette();
      } else if (e.key === "Escape") {
        closeCommandPalette();
        closeDrawer();
      }
    });

    document.addEventListener("paste", function (e) {
      if (state.isProcessing || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      var items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      var files = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].kind === "file") { var f = items[i].getAsFile(); if (f) files.push(f); }
      }
      if (files.length > 0) { addFilesToQueue(files); return; }
      var text = e.clipboardData.getData("text");
      if (text && text.trim().length > 0) {
        addFilesToQueue([new File([new Blob([text], { type: "text/plain" })], "Catatan_" + Date.now().toString().slice(-4) + ".txt", { type: "text/plain" })]);
      }
    });

    dom.btnPasteClipboard.addEventListener("click", handleClipboardButton);
    dom.btnToggleTheme.addEventListener("click", function () {
      var next = anim.toggleTheme();
      sound.playSwitch();
      showToast(next === "light" ? "Mode Terang aktif." : "Mode Gelap aktif.", "info");
    });
    dom.btnToggleSound.addEventListener("click", function () {
      var next = !sound.isEnabled();
      sound.setEnabled(next);
      dom.soundIconOn.style.display = next ? "block" : "none";
      dom.soundIconOff.style.display = next ? "none" : "block";
    });
    dom.btnToggleAdvanced.addEventListener("click", function () {
      var isOpen = dom.advancedAccordion.classList.toggle("open");
      dom.btnToggleAdvanced.setAttribute("aria-expanded", String(isOpen));
      sound.playClick();
    });

    dom.btnBenchmark.addEventListener("click", runCpuBenchmark);
    dom.btnGenPassword.addEventListener("click", triggerGeneratePassword);

    dom.btnCopyPassword.addEventListener("click", function () {
      var pw = dom.passwordInput.value;
      if (!pw) { showToast("Password masih kosong.", "warning"); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pw).then(function () { sound.playClick(); showToast("Password disalin.", "success"); })
          .catch(function () { showToast("Salin manual dari kolom input.", "warning"); });
      } else {
        dom.passwordInput.type = "text"; dom.passwordInput.select(); document.execCommand("copy");
        sound.playClick(); showToast("Password disalin.", "success");
      }
    });

    dom.dropzone.addEventListener("click", function () { if (!state.isProcessing) { sound.playClick(); dom.fileInput.click(); } });
    dom.fileInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files.length > 0) { addFilesToQueue(e.target.files); e.target.value = ""; }
    });
    dom.dropzone.addEventListener("dragover", function (e) { e.preventDefault(); dom.dropzone.classList.add("dragover"); });
    dom.dropzone.addEventListener("dragleave", function () { dom.dropzone.classList.remove("dragover"); });
    dom.dropzone.addEventListener("drop", function (e) {
      e.preventDefault(); dom.dropzone.classList.remove("dragover");
      if (!state.isProcessing && e.dataTransfer && e.dataTransfer.files) addFilesToQueue(e.dataTransfer.files);
    });

    dom.passwordInput.addEventListener("input", updatePasswordUI);
    dom.confirmPasswordInput.addEventListener("input", updatePasswordUI);

    document.querySelectorAll(".toggle-vis-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-target"));
        if (target) { target.type = target.type === "password" ? "text" : "password"; sound.playClick(); }
      });
    });

    dom.cryptoForm.addEventListener("submit", startProcessing);
    dom.btnCancelProcess.addEventListener("click", function () {
      if (state.abortController) { state.abortController.aborted = true; sound.playError(); showToast("Menghentikan proses...", "warning"); }
    });
    dom.btnRemoveAll.addEventListener("click", async function () {
      if (state.queue.length === 0 || state.isProcessing) return;
      var ok = await showConfirmModal("Bersihkan Antrean", "Hapus semua file dari daftar antrean?", "Bersihkan");
      if (ok) clearAllQueue(false);
    });
    
  if (dom.splitKeyToggle) {
    dom.splitKeyToggle.addEventListener("change", function () {
      dom.splitKeyPanel.classList.toggle("open", dom.splitKeyToggle.checked);
      updateProtectionSummaryBadge();
      sound.playSwitch();
    });
  }
  if (dom.obfuscateToggle) {
    dom.obfuscateToggle.addEventListener("change", function () {
      dom.obfuscatePanel.classList.toggle("open", dom.obfuscateToggle.checked);
      updateProtectionSummaryBadge();
      sound.playSwitch();
    });
  }
  dom.obfuscateModeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.obfuscateMode = btn.getAttribute("data-obf") || "random";
      dom.obfuscateModeBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
      dom.customAliasInput.style.display = state.obfuscateMode === "custom" ? "block" : "none";
      sound.playClick();
    });
  });

    window.addEventListener("beforeunload", function () { state.queue.forEach(revokeItemResources); });
  }

  function initApp() {
    cacheDom();
    var p = global.CipherVaultPrefs ? global.CipherVaultPrefs.load() : null;
    if (p) {
      cfg.DEFAULT_THEME = p.theme;
      cfg.ENABLE_SOUND = p.sound;
      cfg.AUTO_WIPE_SECONDS = p.autoWipeSeconds;
      state.activeIterations = p.kdfIterations || state.activeIterations;
      state.cascadeLevel = p.defaultCascade || 1;
      state.obfuscateMode = p.obfuscateMode || "random";
    }

    sound.init(cfg.ENABLE_SOUND);
    anim.init(cfg);

    dom.appNameText.textContent = cfg.APP_NAME;
    dom.appVersionText.textContent = cfg.APP_VERSION;
    dom.soundIconOn.style.display = cfg.ENABLE_SOUND ? "block" : "none";
    dom.soundIconOff.style.display = cfg.ENABLE_SOUND ? "none" : "block";
    dom.dropzoneIllustration.innerHTML = assets.ILLUSTRATIONS.dropEncrypt;
    dom.queueEmptyIllustration.innerHTML = assets.ILLUSTRATIONS.emptyQueue;

    if (p) {
      dom.cascadeLevelBtns.forEach(function (b) {
        b.classList.toggle("active", parseInt(b.getAttribute("data-level"), 10) === state.cascadeLevel);
      });
      if (dom.obfuscateToggle && p.defaultObfuscate) {
        dom.obfuscateToggle.checked = true;
        dom.obfuscatePanel.classList.add("open");
      }
      dom.obfuscateModeBtns.forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-obf") === state.obfuscateMode);
      });
      if (dom.customAliasInput) {
        dom.customAliasInput.value = p.customAlias || "";
        dom.customAliasInput.style.display = state.obfuscateMode === "custom" ? "block" : "none";
      }
    }

    if (!cryptoEngine.hasSecureRandom()) {
      dom.securityStatusPill.textContent = "CSPRNG Error";
      dom.securityStatusPill.classList.add("error");
    }

    bindEvents();
    updateProtectionSummaryBadge();
    updateStats("Siaga");
    if (global.CipherVaultMotionUI) global.CipherVaultMotionUI.init();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initApp);
  else initApp();

  global.CipherVaultApp = { getState: function () { return state; } };
})(window);
