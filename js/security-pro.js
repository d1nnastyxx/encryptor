/**
 * Encryptor — Fortress Security Pro Module
 * 1. CSPRNG Password Generator & Entropy Calculator
 * 2. Multi-File Archive Bundler & Unpacker (format biner CVBD di dalam .cel)
 * 3. CPU KDF Benchmark untuk rekomendasi iterasi PBKDF2
 */
(function (global) {
  "use strict";

  var BUNDLE_MAGIC = [0x43, 0x56, 0x42, 0x44]; // "CVBD"
  var BUNDLE_MIME = "application/x-ciphervault-bundle";

  /* -------------------------------------------------------------------------
     1. CSPRNG Password Generator & Entropy Bit Calculator
     ------------------------------------------------------------------------- */

  function generateSecurePassword(length) {
    if (!global.crypto || typeof global.crypto.getRandomValues !== "function") {
      throw new Error("CSPRNG tidak tersedia di perangkat ini.");
    }
    var len = Math.max(12, Math.min(64, length || 20));
    var lower = "abcdefghijkmnopqrstuvwxyz";
    var upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    var digits = "23456789";
    var symbols = "!@#$%^&*-_=+?";
    var all = lower + upper + digits + symbols;

    function pickChar(charset) {
      var maxValid = 256 - (256 % charset.length);
      var buf = new Uint8Array(1);
      do {
        global.crypto.getRandomValues(buf);
      } while (buf[0] >= maxValid);
      return charset.charAt(buf[0] % charset.length);
    }

    var chars = [
      pickChar(lower),
      pickChar(upper),
      pickChar(digits),
      pickChar(symbols)
    ];

    for (var i = chars.length; i < len; i++) {
      chars.push(pickChar(all));
    }

    // Fisher-Yates shuffle dengan CSPRNG
    for (var j = chars.length - 1; j > 0; j--) {
      var randBuf = new Uint32Array(1);
      global.crypto.getRandomValues(randBuf);
      var k = randBuf[0] % (j + 1);
      var tmp = chars[j];
      chars[j] = chars[k];
      chars[k] = tmp;
    }

    return chars.join("");
  }

  function calculateEntropyBits(password) {
    if (!password) return 0;
    var pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 32;
    if (pool === 0) return 0;
    return Math.round(password.length * (Math.log(pool) / Math.LN2));
  }

  /* -------------------------------------------------------------------------
     2. Multi-File Archive Bundler / Unpacker
     Format: [4B "CVBD"] [4B fileCount] + N * ([4B metaLen][JSON meta][4B dataLen][bytes])
     ------------------------------------------------------------------------- */

  function packFilesToBundle(entries) {
    var enc = new TextEncoder();
    var prepared = [];
    var totalSize = 8;

    for (var i = 0; i < entries.length; i++) {
      var metaBytes = enc.encode(JSON.stringify({
        name: entries[i].name || ("file_" + (i + 1)),
        mime: entries[i].mime || "application/octet-stream",
        size: entries[i].data.length
      }));
      prepared.push({ meta: metaBytes, data: entries[i].data });
      totalSize += 4 + metaBytes.length + 4 + entries[i].data.length;
    }

    var out = new Uint8Array(totalSize);
    var view = new DataView(out.buffer);
    out.set(BUNDLE_MAGIC, 0);
    view.setUint32(4, prepared.length, false);

    var offset = 8;
    for (var j = 0; j < prepared.length; j++) {
      view.setUint32(offset, prepared[j].meta.length, false);
      offset += 4;
      out.set(prepared[j].meta, offset);
      offset += prepared[j].meta.length;

      view.setUint32(offset, prepared[j].data.length, false);
      offset += 4;
      out.set(prepared[j].data, offset);
      offset += prepared[j].data.length;
    }

    var now = new Date();
    var stamp = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") + "_" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0");

    return {
      data: out,
      name: "VaultBundle_" + stamp + ".cvbundle",
      mime: BUNDLE_MIME
    };
  }

  function isBundleResult(decryptedResult) {
    if (!decryptedResult || !decryptedResult.data || decryptedResult.data.length < 8) return false;
    if (decryptedResult.mime === BUNDLE_MIME) return true;
    for (var i = 0; i < 4; i++) {
      if (decryptedResult.data[i] !== BUNDLE_MAGIC[i]) return false;
    }
    return true;
  }

  function unpackBundleBytes(bundleBytes) {
    if (bundleBytes.length < 8) {
      throw new Error("Struktur arsip bundle tidak valid.");
    }
    for (var i = 0; i < 4; i++) {
      if (bundleBytes[i] !== BUNDLE_MAGIC[i]) {
        throw new Error("Header arsip bundle tidak dikenali.");
      }
    }

    var view = new DataView(bundleBytes.buffer, bundleBytes.byteOffset, bundleBytes.byteLength);
    var count = view.getUint32(4, false);
    var dec = new TextDecoder();
    var files = [];
    var offset = 8;

    for (var f = 0; f < count; f++) {
      if (offset + 4 > bundleBytes.length) throw new Error("Arsip bundle terpotong.");
      var metaLen = view.getUint32(offset, false);
      offset += 4;
      var metaObj = JSON.parse(dec.decode(bundleBytes.subarray(offset, offset + metaLen)));
      offset += metaLen;

      if (offset + 4 > bundleBytes.length) throw new Error("Data file dalam bundle terpotong.");
      var dataLen = view.getUint32(offset, false);
      offset += 4;
      var fileData = bundleBytes.slice(offset, offset + dataLen);
      offset += dataLen;

      files.push({
        name: metaObj.name || ("extracted_" + (f + 1)),
        mime: metaObj.mime || "application/octet-stream",
        size: fileData.length,
        data: fileData
      });
    }

    return files;
  }

  /* -------------------------------------------------------------------------
     3. CPU KDF Benchmark (Memakai mesin js/crypto.js tanpa ubah kode inti)
     ------------------------------------------------------------------------- */

  async function runKdfBenchmark() {
    var engine = global.CipherVaultCrypto;
    if (!engine) throw new Error("Modul kriptografi belum dimuat.");

    var sampleIters = 25000;
    var sampleData = new Uint8Array(16);
    var t0 = performance.now();

    await engine.encryptFileData(
      sampleData,
      { name: "bench.bin", mime: "application/octet-stream" },
      "CipherVault_Bench_Key",
      { iterations: sampleIters }
    );

    var elapsed = Math.max(10, performance.now() - t0);
    var itersPerSec = Math.round((sampleIters / elapsed) * 1000);
    // Target waktu ~1.4 detik per file, dengan batas aman minimal 600.000
    var recommended = Math.round((itersPerSec * 1.4) / 50000) * 50000;
    recommended = Math.max(600000, Math.min(1200000, recommended));

    return {
      elapsedMs: Math.round(elapsed),
      itersPerSec: itersPerSec,
      recommendedIterations: recommended
    };
  }

  global.CipherVaultPro = {
    BUNDLE_MIME: BUNDLE_MIME,
    generateSecurePassword: generateSecurePassword,
    calculateEntropyBits: calculateEntropyBits,
    packFilesToBundle: packFilesToBundle,
    isBundleResult: isBundleResult,
    unpackBundleBytes: unpackBundleBytes,
    runKdfBenchmark: runKdfBenchmark
  };
})(window);
