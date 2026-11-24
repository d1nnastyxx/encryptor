/**
 * Encryptor — Full-Motion Onboarding, Interactive Blueprint,
 * Smooth SVG Graphs (Entropy, CPU Benchmark, Stego Capacity) & Spotlight Tour
 * 100% Offline • Zero External Dependencies • Sketchware Pro Ready
 */
(function (global) {
  "use strict";

  var sound = null;
  var onboardIndex = 0;
  var TOTAL_SLIDES = 4;
  var tourStep = 0;
  var tourActive = false;

  function playSfx(method) {
    if (!sound) sound = global.CipherVaultSound;
    if (sound && typeof sound[method] === "function") sound[method]();
  }

  /* =========================================================================
     1. SMOOTH INTERACTIVE GRAPHS
     ========================================================================= */

  // A. Kurva Logaritmik Entropi & Ketahanan Brute-Force (Real-Time)
  function updateEntropyGraph(bits) {
    var wrap = document.getElementById("entropyGraphWrap");
    var dot = document.getElementById("entropyDot");
    var glow = document.getElementById("entropyDotGlow");
    var guide = document.getElementById("entropyGuideLine");
    var fillClip = document.getElementById("entropyClipRect");
    var zoneLabel = document.getElementById("entropyZoneLabel");
    if (!wrap || !dot) return;

    var clamped = Math.max(0, Math.min(128, bits || 0));
    var t = clamped / 128; // 0..1
    var x = 8 + t * 264;
    // Kurva S-logaritmik halus: y dari 48 (bawah) ke 8 (atas)
    var curveY = 48 - Math.pow(t, 0.72) * 40;

    var color = "#71717a";
    var zone = "Siaga";
    if (clamped > 0 && clamped < 45) {
      color = "#ef4444"; zone = "Zona Rentan";
    } else if (clamped >= 45 && clamped < 70) {
      color = "#f59e0b"; zone = "Zona Standar";
    } else if (clamped >= 70 && clamped < 95) {
      color = "#10b981"; zone = "Zona Kuat";
    } else if (clamped >= 95) {
      color = "#3b82f6"; zone = "Zona Fortress";
    }

    dot.setAttribute("cx", x.toFixed(1));
    dot.setAttribute("cy", curveY.toFixed(1));
    dot.style.fill = color;

    if (glow) {
      glow.setAttribute("cx", x.toFixed(1));
      glow.setAttribute("cy", curveY.toFixed(1));
      glow.style.fill = color;
    }
    if (guide) {
      guide.setAttribute("x1", x.toFixed(1));
      guide.setAttribute("x2", x.toFixed(1));
      guide.setAttribute("y1", curveY.toFixed(1));
    }
    if (fillClip) {
      fillClip.setAttribute("width", Math.max(0, x).toFixed(1));
    }
    if (zoneLabel) {
      zoneLabel.textContent = zone;
      zoneLabel.style.color = color;
    }
  }

  // B. Grafik Perbandingan Beban CPU (Cascade Lv 1 vs Lv 2 vs Lv 3)
  function updateBenchmarkGraph(itersPerSec, activeIterations) {
    var box = document.getElementById("benchGraphBox");
    if (!box || !itersPerSec) return;

    var baseSec = activeIterations / Math.max(1000, itersPerSec);
    var t1 = Math.max(0.2, baseSec);
    var t2 = Math.max(0.3, baseSec * 1.18);
    var t3 = Math.max(0.4, baseSec * 1.38);
    var maxT = t3 * 1.1;

    box.style.display = "flex";
    box.innerHTML =
      '<div class="bench-graph-head">' +
        '<span>Estimasi Proses CPU (' + Math.round(itersPerSec / 1000) + 'K iter/dtk)</span>' +
        '<span>' + Math.round(activeIterations / 1000) + 'K PBKDF2</span>' +
      '</div>' +
      buildBenchRow("Level 1 (Fast)", t1, (t1 / maxT) * 100, "#10b981") +
      buildBenchRow("Level 2 (Dual)", t2, (t2 / maxT) * 100, "#3b82f6") +
      buildBenchRow("Level 3 (Sovereign)", t3, (t3 / maxT) * 100, "#8b5cf6");

    requestAnimationFrame(function () {
      box.querySelectorAll(".bench-bar-fill").forEach(function (el) {
        el.style.width = el.getAttribute("data-w") + "%";
      });
    });
  }

  function buildBenchRow(label, secs, pct, color) {
    return (
      '<div class="bench-row">' +
        '<div class="bench-row-top"><span>' + label + '</span><strong>~' + secs.toFixed(2) + ' dtk</strong></div>' +
        '<div class="bench-bar-track"><div class="bench-bar-fill" data-w="' + Math.min(100, Math.round(pct)) + '" style="width:0%;background:' + color + ';"></div></div>' +
      '</div>'
    );
  }

  // C. Grafik Gauge Kapasitas Piksel PNG Steganography
  function getCoverDimensions(file) {
    return new Promise(function (resolve) {
      if (!file) { resolve(null); return; }
      if (file._cvDims) { resolve(file._cvDims); return; }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          file._cvDims = { w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
          resolve(file._cvDims);
        };
        img.onerror = function () { resolve(null); };
        img.src = reader.result;
      };
      reader.onerror = function () { resolve(null); };
      reader.readAsDataURL(file);
    });
  }

  async function updateStegoGauge(coverFile, payloadBytes) {
    var box = document.getElementById("stegoGaugeBox");
    var arc = document.getElementById("stegoGaugeArc");
    var pctEl = document.getElementById("stegoGaugePct");
    var detailEl = document.getElementById("stegoGaugeDetail");
    if (!box || !arc) return;

    if (!coverFile) {
      box.style.display = "none";
      return;
    }

    var dims = await getCoverDimensions(coverFile);
    if (!dims) { box.style.display = "none"; return; }

    var maxBytes = Math.max(1, Math.floor((dims.w * dims.h * 3) / 8) - 8);
    var estPayload = (payloadBytes || 0) + 256; // + overhead header & tag
    var ratio = estPayload / maxBytes;
    var pct = Math.min(100, Math.round(ratio * 100));

    var circumference = 2 * Math.PI * 18; // r = 18
    var offset = circumference * (1 - Math.min(1, ratio));
    var strokeColor = ratio > 1 ? "#ef4444" : (ratio > 0.8 ? "#f59e0b" : "#10b981");

    box.style.display = "flex";
    arc.style.strokeDasharray = circumference.toFixed(1);
    arc.style.strokeDashoffset = offset.toFixed(1);
    arc.style.stroke = strokeColor;

    if (pctEl) {
      pctEl.textContent = ratio > 1 ? "OVER" : (pct + "%");
      pctEl.style.color = strokeColor;
    }
    if (detailEl) {
      var usedKB = Math.ceil(estPayload / 1024);
      var maxKB = Math.floor(maxBytes / 1024);
      detailEl.innerHTML =
        '<strong>' + dims.w + '&times;' + dims.h + ' px</strong>' +
        '<span>Terpakai ' + usedKB + ' KB / ' + maxKB + ' KB kapasitas LSB</span>';
    }
  }

  /* =========================================================================
     2. START-UP FULL-MOTION ONBOARDING
     ========================================================================= */

  function renderOnboardingSlide(idx) {
    onboardIndex = Math.max(0, Math.min(TOTAL_SLIDES - 1, idx));
    var track = document.getElementById("onboardTrack");
    var dots = document.querySelectorAll(".onboard-dot");
    var btnPrev = document.getElementById("btnOnboardPrev");
    var btnNext = document.getElementById("btnOnboardNext");

    if (track) track.style.transform = "translateX(-" + (onboardIndex * 100) + "%)";
    dots.forEach(function (d, i) { d.classList.toggle("active", i === onboardIndex); });

    if (btnPrev) btnPrev.style.visibility = onboardIndex === 0 ? "hidden" : "visible";
    if (btnNext) btnNext.textContent = onboardIndex === TOTAL_SLIDES - 1 ? "Mulai Studio" : "Lanjut";
  }

  function openOnboarding() {
    var bd = document.getElementById("onboardBackdrop");
    if (!bd) return;
    renderOnboardingSlide(0);
    bd.classList.add("open");
    playSfx("playSwitch");
  }

  function closeOnboarding(markDone) {
    var bd = document.getElementById("onboardBackdrop");
    if (bd) bd.classList.remove("open");
    if (markDone) {
      try { localStorage.setItem("cv_onboarded_v3", "1"); } catch (e) {}
    }
    playSfx("playClick");
  }

  function bindOnboardingEvents() {
    var btnPrev = document.getElementById("btnOnboardPrev");
    var btnNext = document.getElementById("btnOnboardNext");
    var btnSkip = document.getElementById("btnOnboardSkip");
    var btnLaunchTour = document.getElementById("btnOnboardTour");
    var viewport = document.getElementById("onboardViewport");

    if (btnPrev) btnPrev.addEventListener("click", function () { playSfx("playClick"); renderOnboardingSlide(onboardIndex - 1); });
    if (btnNext) btnNext.addEventListener("click", function () {
      if (onboardIndex < TOTAL_SLIDES - 1) { playSfx("playSwitch"); renderOnboardingSlide(onboardIndex + 1); }
      else closeOnboarding(true);
    });
    if (btnSkip) btnSkip.addEventListener("click", function () { closeOnboarding(true); });
    if (btnLaunchTour) btnLaunchTour.addEventListener("click", function () {
      closeOnboarding(true);
      setTimeout(startSpotlightTour, 320);
    });

    document.querySelectorAll(".onboard-dot").forEach(function (dot, i) {
      dot.addEventListener("click", function () { playSfx("playClick"); renderOnboardingSlide(i); });
    });

    // Swipe gesture di dalam Onboarding
    if (viewport) {
      var sx = 0;
      viewport.addEventListener("pointerdown", function (e) {
        if (e.target.closest("input, button")) return;
        sx = e.clientX;
      });
      viewport.addEventListener("pointerup", function (e) {
        if (!sx) return;
        var dx = e.clientX - sx;
        sx = 0;
        if (dx < -45 && onboardIndex < TOTAL_SLIDES - 1) { playSfx("playSwitch"); renderOnboardingSlide(onboardIndex + 1); }
        else if (dx > 45 && onboardIndex > 0) { playSfx("playSwitch"); renderOnboardingSlide(onboardIndex - 1); }
      });
    }

    // Mini-Sandbox interaktif pada Slide 4
    var sandSlider = document.getElementById("sandboxLevelSlider");
    var sandFill = document.getElementById("sandboxBarFill");
    var sandText = document.getElementById("sandboxLevelText");
    if (sandSlider && sandFill && sandText) {
      sandSlider.addEventListener("input", function () {
        var v = parseInt(sandSlider.value, 10);
        var labels = { 1: "Level 1 — Cepat (1 Lapis ChaCha20)", 2: "Level 2 — Dual-Cascade (2 Lapis Kunci)", 3: "Level 3 — Sovereign (3 Lapis + Padding)" };
        var widths = { 1: "36%", 2: "68%", 3: "100%" };
        var colors = { 1: "#10b981", 2: "#3b82f6", 3: "#8b5cf6" };
        sandText.textContent = labels[v];
        sandFill.style.width = widths[v];
        sandFill.style.background = colors[v];
        playSfx("playClick");
      });
    }
  }

  /* =========================================================================
     3. INTERACTIVE CRYPTOGRAPHY BLUEPRINT (HALAMAN PETUNJUK)
     ========================================================================= */

  var BLUEPRINT_NODES = [
    {
      id: "input",
      title: "1. Input & Metadata",
      badge: "PLAINTEXT",
      segments: [
        { label: "MetaLen 4B", pct: 18, color: "#6366f1" },
        { label: "JSON Meta (Nama, MIME, Kapsul Waktu)", pct: 37, color: "#3b82f6" },
        { label: "Byte File Asli", pct: 45, color: "#10b981" }
      ],
      desc: "Nama asli, ekstensi, dan batas tanggal Kapsul Waktu dibungkus bersama byte file sebelum dikunci. Saat didekripsi, format file otomatis pulih tanpa perlu menebak ekstensi."
    },
    {
      id: "keyfile",
      title: "2. SHA-256 Keyfile",
      badge: "OPSIONAL",
      segments: [
        { label: "Password UTF-8", pct: 45, color: "#3b82f6" },
        { label: "SHA-256 Hash File Fisik (32B)", pct: 55, color: "#f59e0b" }
      ],
      desc: "Jika sakelar Keyfile aktif, isi file fisik pilihanmu (foto/MP3/PDF) di-hash menjadi 32 byte SHA-256 lalu digabung dengan password. Tanpa file fisik yang identik, brankas mustahil dibuka."
    },
    {
      id: "pbkdf2",
      title: "3. PBKDF2-SHA256",
      badge: "600K+ ITER",
      segments: [
        { label: "Salt Acak 16B", pct: 30, color: "#06b6d4" },
        { label: "600.000+ Putaran HMAC", pct: 45, color: "#8b5cf6" },
        { label: "Master Key 256-bit", pct: 25, color: "#10b981" }
      ],
      desc: "Setiap file mendapat Salt acak baru dari CSPRNG perangkat. Putaran PBKDF2 memperlambat serangan brute-force ribuan kali lipat."
    },
    {
      id: "cascade",
      title: "4. Cascade Lv 1–3",
      badge: "MULTI-LAYER",
      segments: [
        { label: "Layer 1 (Master)", pct: 34, color: "#10b981" },
        { label: "Layer 2 (Sub-Key 2)", pct: 33, color: "#3b82f6" },
        { label: "Layer 3 + Padding", pct: 33, color: "#8b5cf6" }
      ],
      desc: "Level 2 & 3 menurunkan sub-kunci serta nonce unik di setiap lapisan. Level 3 menambahkan noise padding acak untuk menyamarkan ukuran asli file."
    },
    {
      id: "aead",
      title: "5. Poly1305 & Duress",
      badge: "AEAD + 2 SLOT",
      segments: [
        { label: "Header v2 (12B)", pct: 18, color: "#71717a" },
        { label: "Slot 1 Utama + Tag 16B", pct: 44, color: "#3b82f6" },
        { label: "Slot 2 Duress / Noise", pct: 38, color: "#ef4444" }
      ],
      desc: "Tag 16-byte Poly1305 menjamin integritas: jika 1 byte saja diubah, dekripsi langsung ditolak. Slot 2 menyembunyikan File Pancingan (atau noise acak jika Duress tidak aktif)."
    },
    {
      id: "stego",
      title: "6. PNG Steganography",
      badge: "LSB PIXEL",
      segments: [
        { label: "RGB 7-bit Visual Asli", pct: 68, color: "#10b981" },
        { label: "1-bit LSB Payload .cel", pct: 32, color: "#f59e0b" }
      ],
      desc: "Payload .cel disisipkan ke bit terendah (LSB) piksel merah-hijau-biru gambar cover. Penting: selalu kirim gambar hasil stego maupun .cel sebagai DOKUMEN di WhatsApp agar tidak terkompresi."
    }
  ];

  function selectBlueprintNode(nodeId) {
    var node = BLUEPRINT_NODES.find(function (n) { return n.id === nodeId; }) || BLUEPRINT_NODES[0];
    document.querySelectorAll(".bp-node").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-node") === node.id);
    });

    var detail = document.getElementById("bpDetailBox");
    if (!detail) return;

    var barHtml = node.segments.map(function (s) {
      return '<div class="bp-seg" style="width:' + s.pct + '%;background:' + s.color + ';" title="' + s.label + '"></div>';
    }).join("");

    var legendHtml = node.segments.map(function (s) {
      return '<span class="bp-leg-item"><i style="background:' + s.color + '"></i>' + s.label + '</span>';
    }).join("");

    detail.innerHTML =
      '<div class="bp-detail-head"><strong>' + node.title + '</strong><span class="tabular-chip">' + node.badge + '</span></div>' +
      '<div class="bp-bar">' + barHtml + '</div>' +
      '<div class="bp-legend">' + legendHtml + '</div>' +
      '<p class="bp-desc">' + node.desc + '</p>';
  }

  function openGuide() {
    var bd = document.getElementById("guideBackdrop");
    if (!bd) return;
    selectBlueprintNode("input");
    bd.classList.add("open");
    playSfx("playSwitch");
  }

  function closeGuide() {
    var bd = document.getElementById("guideBackdrop");
    if (bd) bd.classList.remove("open");
    playSfx("playClick");
  }

  function bindGuideEvents() {
    var btnClose = document.getElementById("btnCloseGuide");
    var bd = document.getElementById("guideBackdrop");
    var btnReplayOnboard = document.getElementById("btnGuideReplayOnboard");
    var btnStartTour = document.getElementById("btnGuideStartTour");

    if (btnClose) btnClose.addEventListener("click", closeGuide);
    if (bd) bd.addEventListener("click", function (e) { if (e.target === bd) closeGuide(); });

    document.querySelectorAll(".bp-node").forEach(function (el) {
      el.addEventListener("click", function () {
        playSfx("playClick");
        selectBlueprintNode(el.getAttribute("data-node"));
      });
    });

    if (btnReplayOnboard) btnReplayOnboard.addEventListener("click", function () {
      closeGuide();
      setTimeout(openOnboarding, 260);
    });
    if (btnStartTour) btnStartTour.addEventListener("click", function () {
      closeGuide();
      setTimeout(startSpotlightTour, 260);
    });
  }

  /* =========================================================================
     4. INTERACTIVE SPOTLIGHT TOUR (COACHMARKS LANGSUNG DI UI)
     ========================================================================= */

  var TOUR_STEPS = [
    { selector: "#dropzone", title: "1. Area File & Clipboard", desc: "Ketuk untuk memilih banyak file, seret langsung dari laptop, atau tekan tombol Tempel / Ctrl+V." },
    { selector: "#passwordInput", title: "2. Sandi & Kurva Entropi", desc: "Ketik sandi atau tekan ikon petir (⚡) untuk membuat password CSPRNG 20 karakter. Kurva di bawah memantau kekuatan secara real-time." },
    { selector: "#advancedAccordion", title: "3. Sakelar Proteksi Manual", desc: "Buka menu ini untuk menyalakan Cascade Lv 1–3, Keyfile SHA-256, Kapsul Waktu, Duress Vault, atau Kamuflase PNG secara opsional." },
    { selector: "#queueList", title: "4. Antrean & Gestur Geser", desc: "Geser kartu ke kiri untuk menghapus atau geser ke kanan untuk langsung menyimpan hasil. Ketuk Inspect Header pada file .cel." },
    { selector: "#btnOpenCmd", title: "5. Perintah Cepat (Ctrl+K)", desc: "Akses seluruh fitur, ganti tema Dark/Light, atau buka panduan kapan saja dari tombol ini." }
  ];

  function positionSpotlight(stepIdx) {
    var step = TOUR_STEPS[stepIdx];
    if (!step) { stopSpotlightTour(); return; }
    var target = document.querySelector(step.selector);
    if (!target) { stopSpotlightTour(); return; }

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(function () {
      if (!tourActive) return;
      var rect = target.getBoundingClientRect();
      var ring = document.getElementById("spotlightRing");
      var card = document.getElementById("spotlightCard");
      var pad = 6;

      if (ring) {
        ring.style.top = (rect.top - pad) + "px";
        ring.style.left = (rect.left - pad) + "px";
        ring.style.width = (rect.width + pad * 2) + "px";
        ring.style.height = (rect.height + pad * 2) + "px";
      }

      if (card) {
        document.getElementById("spotStepBadge").textContent = (stepIdx + 1) + " / " + TOUR_STEPS.length;
        document.getElementById("spotTitle").textContent = step.title;
        document.getElementById("spotDesc").textContent = step.desc;
        document.getElementById("btnSpotNext").textContent = stepIdx === TOUR_STEPS.length - 1 ? "Selesai" : "Lanjut";

        var spaceBelow = window.innerHeight - rect.bottom;
        var cardHeight = 165;
        var topPos = spaceBelow > cardHeight + 20 ? (rect.bottom + 14) : Math.max(16, rect.top - cardHeight - 14);
        var leftPos = Math.max(14, Math.min(window.innerWidth - 324, rect.left));
        card.style.top = topPos + "px";
        card.style.left = leftPos + "px";
      }
    }, 220);
  }

  function startSpotlightTour() {
    var overlay = document.getElementById("spotlightOverlay");
    if (!overlay) return;
    tourActive = true;
    tourStep = 0;
    overlay.classList.add("open");
    playSfx("playSwitch");
    positionSpotlight(0);
  }

  function stopSpotlightTour() {
    tourActive = false;
    var overlay = document.getElementById("spotlightOverlay");
    if (overlay) overlay.classList.remove("open");
    playSfx("playClick");
  }

  function bindTourEvents() {
    var btnNext = document.getElementById("btnSpotNext");
    var btnClose = document.getElementById("btnSpotClose");
    if (btnNext) btnNext.addEventListener("click", function () {
      if (tourStep < TOUR_STEPS.length - 1) {
        tourStep++;
        playSfx("playSwitch");
        positionSpotlight(tourStep);
      } else {
        stopSpotlightTour();
      }
    });
    if (btnClose) btnClose.addEventListener("click", stopSpotlightTour);
    window.addEventListener("resize", function () {
      if (tourActive) positionSpotlight(tourStep);
    });
  }

  /* =========================================================================
     INIT
     ========================================================================= */

  function init() {
    bindOnboardingEvents();
    bindGuideEvents();
    bindTourEvents();
    updateEntropyGraph(0);

    var btnGuide = document.getElementById("btnOpenGuide");
    if (btnGuide) btnGuide.addEventListener("click", openGuide);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeGuide();
        closeOnboarding(false);
        if (tourActive) stopSpotlightTour();
      }
    });

    // Tampilkan Start-Up Onboarding otomatis khusus kunjungan pertama
    var seen = false;
    try { seen = localStorage.getItem("cv_onboarded_v3") === "1"; } catch (e) {}
    if (!seen) {
      setTimeout(openOnboarding, 360);
    }
  }

  /* =========================================================================
     5. FORENSIC 60FPS CANVAS GRAPHS (Avalanche Matrix, Histogram & Stego Map)
     ========================================================================= */

  var avPrevBits = new Uint8Array(256);
  var avCurrBits = new Uint8Array(256);
  var avHeat = new Float32Array(256);
  var avRafId = null;

  function drawAvalancheFrame() {
    var canvas = document.getElementById("avalancheCanvas");
    if (!canvas) { avRafId = null; return; }
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var cols = 32, rows = 8;
    var gap = 2;
    var cellW = (w - gap * (cols - 1)) / cols;
    var cellH = (h - gap * (rows - 1)) / rows;
    var activeHeat = false;

    for (var i = 0; i < 256; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var x = col * (cellW + gap);
      var y = row * (cellH + gap);
      var bit = avCurrBits[i];
      var heat = avHeat[i];

      if (heat > 0.02) {
        avHeat[i] *= 0.88;
        activeHeat = true;
      } else {
        avHeat[i] = 0;
      }

      if (heat > 0.05) {
        ctx.fillStyle = bit ? "rgba(59, 130, 246, " + (0.45 + heat * 0.55) + ")" : "rgba(245, 158, 11, " + (0.25 + heat * 0.65) + ")";
      } else {
        ctx.fillStyle = bit ? "rgba(16, 185, 129, 0.72)" : "rgba(120, 120, 130, 0.16)";
      }

      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, cellW, cellH, 1.5) : ctx.rect(x, y, cellW, cellH);
      ctx.fill();
    }

    if (activeHeat) {
      avRafId = requestAnimationFrame(drawAvalancheFrame);
    } else {
      avRafId = null;
    }
  }

  function updateAvalancheMatrix(passwordStr) {
    var canvas = document.getElementById("avalancheCanvas");
    var pctEl = document.getElementById("avalanchePct");
    if (!canvas || !global.CipherVaultCrypto) return;

    if (!passwordStr) {
      avCurrBits.fill(0);
      avPrevBits.fill(0);
      avHeat.fill(0);
      if (pctEl) pctEl.textContent = "0% bit flip";
      drawAvalancheFrame();
      return;
    }

    var hash = global.CipherVaultCrypto.sha256(new TextEncoder().encode(passwordStr));
    var flipped = 0;
    for (var b = 0; b < 32; b++) {
      for (var bit = 0; bit < 8; bit++) {
        var idx = b * 8 + bit;
        var val = (hash[b] >> (7 - bit)) & 1;
        avCurrBits[idx] = val;
        if (val !== avPrevBits[idx]) {
          flipped++;
          avHeat[idx] = 1.0;
        }
        avPrevBits[idx] = val;
      }
    }

    if (pctEl) pctEl.textContent = ((flipped / 256) * 100).toFixed(1) + "% avalanche";
    if (!avRafId) avRafId = requestAnimationFrame(drawAvalancheFrame);
  }

  // B. Byte-Distribution & Shannon Entropy Histogram (60fps Animated Bars)
  function renderForensicHistogram(canvasEl, bytes) {
    if (!canvasEl || !bytes || !bytes.length) return { entropy: 0 };
    var counts = new Uint32Array(256);
    var step = Math.max(1, Math.floor(bytes.length / 262144));
    var sampled = 0;
    for (var i = 0; i < bytes.length; i += step) {
      counts[bytes[i]]++;
      sampled++;
    }

    var entropy = 0;
    for (var c = 0; c < 256; c++) {
      if (counts[c] > 0) {
        var p = counts[c] / sampled;
        entropy -= p * Math.log2(p);
      }
    }

    // Kelompokkan 256 nilai byte menjadi 64 batang spektrum halus
    var bins = new Float32Array(64);
    var maxBin = 1;
    for (var g = 0; g < 64; g++) {
      var sum = counts[g * 4] + counts[g * 4 + 1] + counts[g * 4 + 2] + counts[g * 4 + 3];
      bins[g] = sum;
      if (sum > maxBin) maxBin = sum;
    }

    var ctx = canvasEl.getContext("2d");
    var w = canvasEl.width, h = canvasEl.height;
    var progress = 0;

    function animBars() {
      progress = Math.min(1, progress + 0.06);
      var ease = 1 - Math.pow(1 - progress, 3);
      ctx.clearRect(0, 0, w, h);

      // Garis rata ideal (uniform distribution)
      var idealY = h - ((sampled / 64) / maxBin) * (h - 14);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.45)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, idealY);
      ctx.lineTo(w, idealY);
      ctx.stroke();
      ctx.setLineDash([]);

      var barW = (w / 64) - 1;
      for (var k = 0; k < 64; k++) {
        var bh = (bins[k] / maxBin) * (h - 14) * ease;
        var gradRatio = k / 64;
        ctx.fillStyle = "hsl(" + (205 + gradRatio * 65) + ", 82%, 58%)";
        ctx.fillRect(k * (barW + 1), h - bh, Math.max(1.5, barW), bh);
      }

      if (progress < 1) requestAnimationFrame(animBars);
    }
    requestAnimationFrame(animBars);
    return { entropy: entropy, sampled: sampled };
  }

  // C. Steganography LSB Pixel Heatmap
  function renderStegoHeatmap(canvasEl, imageBlob) {
    if (!canvasEl || !imageBlob) return;
    var url = URL.createObjectURL(imageBlob);
    var img = new Image();
    img.onload = function () {
      var w = canvasEl.width, h = canvasEl.height;
      var ctx = canvasEl.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      var imgData = ctx.getImageData(0, 0, w, h);
      var px = imgData.data;

      for (var i = 0; i < px.length; i += 4) {
        var lsbSum = (px[i] & 1) + (px[i + 1] & 1) + (px[i + 2] & 1); // 0..3
        if (lsbSum === 0) { px[i] = 15; px[i + 1] = 23; px[i + 2] = 42; }
        else if (lsbSum === 1) { px[i] = 37; px[i + 1] = 99; px[i + 2] = 235; }
        else if (lsbSum === 2) { px[i] = 16; px[i + 1] = 185; px[i + 2] = 129; }
        else { px[i] = 245; px[i + 1] = 158; px[i + 2] = 11; }
        px[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  global.CipherVaultMotionUI = {
    init: init,
    openOnboarding: openOnboarding,
    openGuide: openGuide,
    startSpotlightTour: startSpotlightTour,
    updateEntropyGraph: updateEntropyGraph,
    updateBenchmarkGraph: updateBenchmarkGraph,
    updateStegoGauge: updateStegoGauge,
    updateAvalancheMatrix: updateAvalancheMatrix,
    renderForensicHistogram: renderForensicHistogram,
    renderStegoHeatmap: renderStegoHeatmap
  };
})(window);

