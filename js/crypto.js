/**
 * Encryptor — Pure-JS Cryptography Engine v4.0
 * Fitur: Format v1/v2, Multi-Layer Cascade (1-3), SHA-256 Keyfile,
 * 2-Part Split Key (FLAG_SPLIT_KEY), Kapsul Waktu, Duress Vault, & Zero Extension Leak.
 */
(function (global) {
  "use strict";

  var MAGIC = new Uint8Array([0x43, 0x56, 0x4c, 0x54]); // "CVLT"
  var VER_V1 = 0x01;
  var VER_V2 = 0x02;
  var V1_HEADER_SIZE = 37;
  var V2_PREFIX_SIZE = 12;
  var SLOT_HEADER_SIZE = 32;
  var TAG_SIZE = 16;
  var FLAG_KEYFILE = 0x01;
  var FLAG_SPLIT_KEY = 0x02;

  var SHA256_INIT = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]);

  var SHA256_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function yieldToUI() {
    return new Promise(function (resolve) { setTimeout(resolve, 0); });
  }

  function checkAbort(abortSignal) {
    if (abortSignal && abortSignal.aborted) {
      var err = new Error("Proses dibatalkan oleh pengguna.");
      err.code = "ABORTED";
      throw err;
    }
  }

  function hasSecureRandom() {
    return !!(global.crypto && typeof global.crypto.getRandomValues === "function");
  }

  function getSecureRandomBytes(length) {
    if (!hasSecureRandom()) {
      var err = new Error("CSPRNG tidak tersedia pada perangkat ini.");
      err.code = "NO_CSPRNG";
      throw err;
    }
    var buf = new Uint8Array(length);
    global.crypto.getRandomValues(buf);
    return buf;
  }

  function sha256Compress(state, blockWords, w) {
    for (var i = 0; i < 16; i++) w[i] = blockWords[i];
    for (var j = 16; j < 64; j++) {
      var x = w[j - 15], y = w[j - 2];
      var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }
    var a = state[0], b = state[1], c = state[2], d = state[3];
    var e = state[4], f = state[5], g = state[6], h = state[7];
    for (var r = 0; r < 64; r++) {
      var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      var ch = (e & f) ^ (~e & g);
      var t1 = (h + S1 + ch + SHA256_K[r] + w[r]) >>> 0;
      var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    state[0] = (state[0] + a) >>> 0; state[1] = (state[1] + b) >>> 0;
    state[2] = (state[2] + c) >>> 0; state[3] = (state[3] + d) >>> 0;
    state[4] = (state[4] + e) >>> 0; state[5] = (state[5] + f) >>> 0;
    state[6] = (state[6] + g) >>> 0; state[7] = (state[7] + h) >>> 0;
  }

  function bytesToWordsBE(bytes, offset, outWords) {
    for (var i = 0; i < 16; i++) {
      var idx = offset + i * 4;
      outWords[i] = ((bytes[idx] << 24) | (bytes[idx + 1] << 16) | (bytes[idx + 2] << 8) | bytes[idx + 3]) >>> 0;
    }
  }

  function sha256(msg) {
    var len = msg.length;
    var bitLen = len * 8;
    var totalLen = (len + 9 + 63) & ~63;
    var padded = new Uint8Array(totalLen);
    padded.set(msg);
    padded[len] = 0x80;
    var view = new DataView(padded.buffer);
    view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
    view.setUint32(totalLen - 4, bitLen >>> 0, false);

    var state = new Uint32Array(SHA256_INIT);
    var blockWords = new Uint32Array(16);
    var w = new Uint32Array(64);
    for (var offset = 0; offset < totalLen; offset += 64) {
      bytesToWordsBE(padded, offset, blockWords);
      sha256Compress(state, blockWords, w);
    }
    var out = new Uint8Array(32);
    var ov = new DataView(out.buffer);
    for (var i = 0; i < 8; i++) ov.setUint32(i * 4, state[i], false);
    return out;
  }

  function hmacSha256(key, data) {
    var k = key.length > 64 ? sha256(key) : key;
    var ipad = new Uint8Array(64), opad = new Uint8Array(64);
    ipad.fill(0x36); opad.fill(0x5c);
    for (var i = 0; i < k.length; i++) { ipad[i] ^= k[i]; opad[i] ^= k[i]; }
    var inner = new Uint8Array(64 + data.length);
    inner.set(ipad, 0); inner.set(data, 64);
    var innerHash = sha256(inner);
    var outer = new Uint8Array(96);
    outer.set(opad, 0); outer.set(innerHash, 64);
    return sha256(outer);
  }

  async function pbkdf2Sha256Async(secretBytes, salt, iterations, onProgress, abortSignal) {
    var k = secretBytes.length > 64 ? sha256(secretBytes) : secretBytes;
    var ipad = new Uint8Array(64), opad = new Uint8Array(64);
    ipad.fill(0x36); opad.fill(0x5c);
    for (var i = 0; i < k.length; i++) { ipad[i] ^= k[i]; opad[i] ^= k[i]; }

    var w = new Uint32Array(64), blockWords = new Uint32Array(16);
    var ipadState = new Uint32Array(SHA256_INIT), opadState = new Uint32Array(SHA256_INIT);
    bytesToWordsBE(ipad, 0, blockWords); sha256Compress(ipadState, blockWords, w);
    bytesToWordsBE(opad, 0, blockWords); sha256Compress(opadState, blockWords, w);

    var saltBlock = new Uint8Array(salt.length + 4);
    saltBlock.set(salt, 0); saltBlock[salt.length + 3] = 1;
    var u1Bytes = hmacSha256(secretBytes, saltBlock);
    var u1View = new DataView(u1Bytes.buffer);

    var uWords = new Uint32Array(8), dkWords = new Uint32Array(8);
    for (var m = 0; m < 8; m++) { uWords[m] = u1View.getUint32(m * 4, false); dkWords[m] = uWords[m]; }

    var secondBlock = new Uint32Array(16);
    secondBlock[8] = 0x80000000; secondBlock[15] = 768;
    var innerState = new Uint32Array(8), outerState = new Uint32Array(8);
    var lastYield = performance.now();

    for (var iter = 1; iter < iterations; iter++) {
      innerState.set(ipadState);
      for (var a = 0; a < 8; a++) secondBlock[a] = uWords[a];
      sha256Compress(innerState, secondBlock, w);

      outerState.set(opadState);
      for (var b = 0; b < 8; b++) secondBlock[b] = innerState[b];
      sha256Compress(outerState, secondBlock, w);

      for (var c = 0; c < 8; c++) { uWords[c] = outerState[c]; dkWords[c] ^= uWords[c]; }

      if ((iter & 2047) === 0) {
        checkAbort(abortSignal);
        var now = performance.now();
        if (now - lastYield >= 18) {
          if (onProgress) onProgress(iter / iterations);
          await yieldToUI();
          lastYield = performance.now();
        }
      }
    }
    if (onProgress) onProgress(1);
    var dk = new Uint8Array(32), dv = new DataView(dk.buffer);
    for (var o = 0; o < 8; o++) dv.setUint32(o * 4, dkWords[o], false);
    return dk;
  }

  function chacha20Block(key, counter, nonce, outBuf) {
    var state = new Uint32Array(16);
    var kv = new DataView(key.buffer, key.byteOffset, 32);
    var nv = new DataView(nonce.buffer, nonce.byteOffset, 12);
    state[0] = 0x61707865; state[1] = 0x3320646e; state[2] = 0x79622d32; state[3] = 0x6b206574;
    for (var i = 0; i < 8; i++) state[4 + i] = kv.getUint32(i * 4, true);
    state[12] = counter >>> 0;
    for (var j = 0; j < 3; j++) state[13 + j] = nv.getUint32(j * 4, true);

    var w = new Uint32Array(state);
    function qr(a, b, c, d) {
      w[a] = (w[a] + w[b]) >>> 0; w[d] ^= w[a]; w[d] = ((w[d] << 16) | (w[d] >>> 16)) >>> 0;
      w[c] = (w[c] + w[d]) >>> 0; w[b] ^= w[c]; w[b] = ((w[b] << 12) | (w[b] >>> 20)) >>> 0;
      w[a] = (w[a] + w[b]) >>> 0; w[d] ^= w[a]; w[d] = ((w[d] << 8)  | (w[d] >>> 24)) >>> 0;
      w[c] = (w[c] + w[d]) >>> 0; w[b] ^= w[c]; w[b] = ((w[b] << 7)  | (w[b] >>> 25)) >>> 0;
    }
    for (var r = 0; r < 10; r++) {
      qr(0, 4, 8, 12); qr(1, 5, 9, 13); qr(2, 6, 10, 14); qr(3, 7, 11, 15);
      qr(0, 5, 10, 15); qr(1, 6, 11, 12); qr(2, 7, 8, 13); qr(3, 4, 9, 14);
    }
    var out = outBuf || new Uint8Array(64);
    var ov = new DataView(out.buffer, out.byteOffset, 64);
    for (var k = 0; k < 16; k++) ov.setUint32(k * 4, (w[k] + state[k]) >>> 0, true);
    return out;
  }

  async function chacha20XorAsync(key, startCounter, nonce, data, onProgress, abortSignal) {
    var out = new Uint8Array(data.length);
    var blockBuf = new Uint8Array(64);
    var counter = startCounter >>> 0;
    var total = data.length;
    var lastYield = performance.now();
    for (var offset = 0; offset < total; offset += 64) {
      chacha20Block(key, counter++, nonce, blockBuf);
      var end = Math.min(offset + 64, total);
      for (var i = offset; i < end; i++) out[i] = data[i] ^ blockBuf[i - offset];
      if ((offset & 65535) === 0 && offset > 0) {
        checkAbort(abortSignal);
        var now = performance.now();
        if (now - lastYield >= 18) {
          if (onProgress) onProgress(offset / total);
          await yieldToUI();
          lastYield = performance.now();
        }
      }
    }
    if (onProgress) onProgress(1);
    return out;
  }

  function le16BytesToBigInt(bytes, offset) {
    var res = 0n;
    for (var i = 15; i >= 0; i--) res = (res << 8n) | BigInt(bytes[offset + i]);
    return res;
  }

  async function poly1305AeadTagAsync(oneTimeKey, aad, ciphertext, onProgress, abortSignal) {
    var r = le16BytesToBigInt(oneTimeKey, 0) & 0x0ffffffc0ffffffc0ffffffc0fffffffn;
    var s = le16BytesToBigInt(oneTimeKey, 16);
    var P = (1n << 130n) - 5n;
    var HIBIT = 1n << 128n;
    var acc = 0n;
    var padBuf = new Uint8Array(16);
    var lastYield = performance.now();

    async function feedPadded16(buf, track) {
      var len = buf.length, fullLen = len & ~15;
      for (var i = 0; i < fullLen; i += 16) {
        acc = ((acc + le16BytesToBigInt(buf, i) + HIBIT) * r) % P;
        if (track && (i & 65535) === 0 && i > 0) {
          checkAbort(abortSignal);
          var now = performance.now();
          if (now - lastYield >= 18) {
            if (onProgress) onProgress(i / len);
            await yieldToUI();
            lastYield = performance.now();
          }
        }
      }
      if (len > fullLen) {
        padBuf.fill(0);
        padBuf.set(buf.subarray(fullLen), 0);
        acc = ((acc + le16BytesToBigInt(padBuf, 0) + HIBIT) * r) % P;
      }
    }

    await feedPadded16(aad, false);
    await feedPadded16(ciphertext, true);

    var lenBlock = new Uint8Array(16);
    var lv = new DataView(lenBlock.buffer);
    lv.setUint32(0, aad.length >>> 0, true);
    lv.setUint32(4, Math.floor(aad.length / 0x100000000), true);
    lv.setUint32(8, ciphertext.length >>> 0, true);
    lv.setUint32(12, Math.floor(ciphertext.length / 0x100000000), true);
    acc = ((acc + le16BytesToBigInt(lenBlock, 0) + HIBIT) * r) % P;

    var tagVal = (acc + s) & ((1n << 128n) - 1n);
    var tag = new Uint8Array(16);
    for (var t = 0; t < 16; t++) { tag[t] = Number(tagVal & 0xffn); tagVal >>= 8n; }
    if (onProgress) onProgress(1);
    return tag;
  }

  function constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  /* -------------------------------------------------------------------------
     Secret Combination (Password + Optional Split Key B + Optional SHA-256 Keyfile)
     ------------------------------------------------------------------------- */

  function buildSecretBytes(password, keyfileBytes, splitKey) {
    var enc = new TextEncoder();
    var parts = [enc.encode(password)];
    if (splitKey && splitKey.length > 0) {
      parts.push(sha256(enc.encode("CVLT-SPLIT-KEY-B:" + splitKey)));
    }
    if (keyfileBytes && keyfileBytes.length > 0) {
      parts.push(sha256(keyfileBytes));
    }
    var total = 0;
    for (var i = 0; i < parts.length; i++) total += parts[i].length;
    var combined = new Uint8Array(total);
    var off = 0;
    for (var j = 0; j < parts.length; j++) {
      combined.set(parts[j], off);
      off += parts[j].length;
    }
    parts[0].fill(0);
    return combined;
  }

  function deriveLayerMaterial(masterKey, baseNonce, layerIndex) {
    if (layerIndex === 1) return { key: masterKey, nonce: baseNonce };
    var enc = new TextEncoder();
    var k = hmacSha256(masterKey, enc.encode("CVLT-CASCADE-KEY-" + layerIndex));
    var nFull = hmacSha256(masterKey, enc.encode("CVLT-CASCADE-NONCE-" + layerIndex));
    return { key: k, nonce: nFull.subarray(0, 12) };
  }

  function extractExtension(filename) {
    var idx = (filename || "").lastIndexOf(".");
    if (idx <= 0 || idx === filename.length - 1) return "";
    return filename.slice(idx + 1).toLowerCase();
  }

  function stripExtension(filename) {
    var name = filename || "vault";
    var idx = name.lastIndexOf(".");
    return idx > 0 ? name.slice(0, idx) : name;
  }

  async function encryptSingleSlot(fileBytes, meta, password, keyfileBytes, splitKey, level, iterations, expiresAt, onProgress, abortSignal) {
    var enc = new TextEncoder();
    var salt = getSecureRandomBytes(16);
    var nonce = getSecureRandomBytes(12);
    var secretBytes = buildSecretBytes(password, keyfileBytes, splitKey);

    var masterKey = await pbkdf2Sha256Async(
      secretBytes, salt, iterations,
      function (p) { if (onProgress) onProgress("Deriving key", 10 + Math.round(p * 40)); },
      abortSignal
    );
    secretBytes.fill(0);

    var padLen = level >= 3 ? (16 + (getSecureRandomBytes(1)[0] % 192)) : 0;
    var metaObj = {
      name: meta.name || "unnamed",
      ext: extractExtension(meta.name || ""),
      size: fileBytes.length,
      mime: meta.mime || "application/octet-stream",
      expiresAt: expiresAt || null,
      padLen: padLen
    };
    var metaBytes = enc.encode(JSON.stringify(metaObj));
    var currentData = new Uint8Array(4 + metaBytes.length + fileBytes.length + padLen);
    var pv = new DataView(currentData.buffer);
    pv.setUint32(0, metaBytes.length, false);
    currentData.set(metaBytes, 4);
    currentData.set(fileBytes, 4 + metaBytes.length);
    if (padLen > 0) currentData.set(getSecureRandomBytes(padLen), 4 + metaBytes.length + fileBytes.length);

    var slotHeader = new Uint8Array(SLOT_HEADER_SIZE);
    var shv = new DataView(slotHeader.buffer);
    shv.setUint32(0, iterations, false);
    slotHeader.set(salt, 4);
    slotHeader.set(nonce, 20);

    for (var L = 1; L <= level; L++) {
      checkAbort(abortSignal);
      var mat = deriveLayerMaterial(masterKey, nonce, L);
      var aad = L === 1 ? slotHeader : enc.encode("CVLT-L" + L);
      var basePct = 52 + Math.round(((L - 1) / level) * 42);
      var spanPct = Math.round(42 / level);

      if (onProgress) onProgress("Cascade Layer " + L + "/" + level, basePct);
      var ct = await chacha20XorAsync(mat.key, 1, mat.nonce, currentData, function (p) {
        if (onProgress) onProgress("Cascade Layer " + L + "/" + level, basePct + Math.round(p * spanPct * 0.65));
      }, abortSignal);

      var polyKey = chacha20Block(mat.key, 0, mat.nonce).subarray(0, 32);
      var tag = await poly1305AeadTagAsync(polyKey, aad, ct, function (p) {
        if (onProgress) onProgress("Authenticating L" + L, basePct + Math.round(spanPct * 0.65 + p * spanPct * 0.35));
      }, abortSignal);

      polyKey.fill(0);
      if (L > 1) mat.key.fill(0);
      currentData.fill(0);

      var wrapped = new Uint8Array(ct.length + TAG_SIZE);
      wrapped.set(ct, 0);
      wrapped.set(tag, ct.length);
      currentData = wrapped;
    }

    masterKey.fill(0);
    var slotOut = new Uint8Array(SLOT_HEADER_SIZE + currentData.length);
    slotOut.set(slotHeader, 0);
    slotOut.set(currentData, SLOT_HEADER_SIZE);
    return slotOut;
  }

  async function decryptSingleSlot(slotBytes, password, keyfileBytes, splitKey, level, onProgress, abortSignal) {
    if (slotBytes.length < SLOT_HEADER_SIZE + (level * TAG_SIZE) + 4) return null;

    var slotHeader = slotBytes.subarray(0, SLOT_HEADER_SIZE);
    var shv = new DataView(slotHeader.buffer, slotHeader.byteOffset, SLOT_HEADER_SIZE);
    var iterations = shv.getUint32(0, false);
    if (iterations < 1000 || iterations > 10000000) return null;

    var salt = slotHeader.subarray(4, 20);
    var nonce = slotHeader.subarray(20, 32);
    var secretBytes = buildSecretBytes(password, keyfileBytes, splitKey);

    var masterKey = await pbkdf2Sha256Async(
      secretBytes, salt, iterations,
      function (p) { if (onProgress) onProgress("Deriving key", 10 + Math.round(p * 40)); },
      abortSignal
    );
    secretBytes.fill(0);

    var enc = new TextEncoder();
    var currentData = slotBytes.subarray(SLOT_HEADER_SIZE);

    for (var L = level; L >= 1; L--) {
      checkAbort(abortSignal);
      if (currentData.length < TAG_SIZE) { masterKey.fill(0); return null; }

      var mat = deriveLayerMaterial(masterKey, nonce, L);
      var aad = L === 1 ? slotHeader : enc.encode("CVLT-L" + L);
      var ct = currentData.subarray(0, currentData.length - TAG_SIZE);
      var expectedTag = currentData.subarray(currentData.length - TAG_SIZE);

      var polyKey = chacha20Block(mat.key, 0, mat.nonce).subarray(0, 32);
      var actualTag = await poly1305AeadTagAsync(polyKey, aad, ct, null, abortSignal);
      polyKey.fill(0);

      if (!constantTimeEqual(expectedTag, actualTag)) {
        if (L > 1) mat.key.fill(0);
        masterKey.fill(0);
        return null;
      }

      if (onProgress) onProgress("Decrypting Layer " + L + "/" + level, 55 + Math.round(((level - L + 1) / level) * 38));
      var pt = await chacha20XorAsync(mat.key, 1, mat.nonce, ct, null, abortSignal);
      if (L > 1) mat.key.fill(0);
      currentData = pt;
    }

    masterKey.fill(0);

    var pv = new DataView(currentData.buffer, currentData.byteOffset, 4);
    var metaLen = pv.getUint32(0, false);
    if (4 + metaLen > currentData.length) { currentData.fill(0); return null; }

    var metaObj = JSON.parse(new TextDecoder().decode(currentData.subarray(4, 4 + metaLen)));
    if (metaObj.expiresAt && Date.now() > metaObj.expiresAt) {
      currentData.fill(0);
      var expDate = new Date(metaObj.expiresAt).toLocaleString("id-ID");
      var errExp = new Error("Kapsul Waktu kedaluwarsa sejak " + expDate + ". Akses ditolak.");
      errExp.code = "EXPIRED";
      throw errExp;
    }

    var dataEnd = currentData.length - (metaObj.padLen || 0);
    var fileData = currentData.slice(4 + metaLen, dataEnd);
    currentData.fill(0);

    return {
      data: fileData,
      filename: metaObj.name || "decrypted_file",
      ext: metaObj.ext || "",
      size: metaObj.size,
      mime: metaObj.mime || "application/octet-stream",
      expiresAt: metaObj.expiresAt || null
    };
  }

  async function encryptFileData(fileBytes, meta, password, options) {
    var opts = options || {};
    var iterations = opts.iterations || 600000;
    var level = Math.max(1, Math.min(3, opts.cascadeLevel || 1));
    var keyfileBytes = opts.keyfileBytes || null;
    var splitKey = opts.splitKey || "";
    var expiresAt = opts.expiresAt || null;
    var duress = opts.duress || null;
    var onProgress = opts.onProgress || function () {};
    var abortSignal = opts.abortSignal || null;

    var slot1 = await encryptSingleSlot(
      fileBytes, meta, password, keyfileBytes, splitKey, level, iterations, expiresAt, onProgress, abortSignal
    );

    var slot2;
    if (duress && duress.bytes && duress.password) {
      onProgress("Encrypting Duress Vault", 92);
      slot2 = await encryptSingleSlot(
        duress.bytes, duress.meta, duress.password, keyfileBytes, splitKey, level, iterations, null, null, abortSignal
      );
    } else {
      slot2 = getSecureRandomBytes(64 + (getSecureRandomBytes(1)[0] % 64));
    }

    var flags = 0x00;
    if (keyfileBytes && keyfileBytes.length > 0) flags |= FLAG_KEYFILE;
    if (splitKey && splitKey.length > 0) flags |= FLAG_SPLIT_KEY;

    var output = new Uint8Array(V2_PREFIX_SIZE + slot1.length + slot2.length);
    output.set(MAGIC, 0);
    output[4] = VER_V2;
    output[5] = flags;
    output[6] = level;
    output[7] = 0x00;
    var ov = new DataView(output.buffer);
    ov.setUint32(8, slot1.length, false);
    output.set(slot1, V2_PREFIX_SIZE);
    output.set(slot2, V2_PREFIX_SIZE + slot1.length);

    // Zero Extension Leak: buang ekstensi asli, gunakan nama samaran jika diberikan
    var baseOut = opts.outputName
      ? String(opts.outputName).replace(/\.cel$/i, "").replace(/[\\/:*?"<>|]/g, "_")
      : stripExtension(meta.name);
    if (!baseOut) baseOut = "vault";

    onProgress("Completed", 100);
    return {
      data: output,
      filename: baseOut + ".cel",
      mime: "application/octet-stream"
    };
  }

  async function decryptV1(cvaultBytes, password, onProgress, abortSignal) {
    if (cvaultBytes.length < V1_HEADER_SIZE + TAG_SIZE + 4) {
      var errShort = new Error("File rusak atau bukan arsip .cel yang valid.");
      errShort.code = "CORRUPT_FILE"; throw errShort;
    }
    var hv = new DataView(cvaultBytes.buffer, cvaultBytes.byteOffset, V1_HEADER_SIZE);
    var iterations = hv.getUint32(5, false);
    var header = cvaultBytes.subarray(0, V1_HEADER_SIZE);
    var salt = cvaultBytes.subarray(9, 25);
    var nonce = cvaultBytes.subarray(25, 37);
    var ciphertext = cvaultBytes.subarray(V1_HEADER_SIZE, cvaultBytes.length - TAG_SIZE);
    var expectedTag = cvaultBytes.subarray(cvaultBytes.length - TAG_SIZE);

    var pwBytes = new TextEncoder().encode(password);
    var key = await pbkdf2Sha256Async(pwBytes, salt, iterations, function (p) {
      onProgress("Deriving key", 10 + Math.round(p * 45));
    }, abortSignal);
    pwBytes.fill(0);

    var polyKey = chacha20Block(key, 0, nonce).subarray(0, 32);
    var actualTag = await poly1305AeadTagAsync(polyKey, header, ciphertext, null, abortSignal);
    polyKey.fill(0);

    if (!constantTimeEqual(expectedTag, actualTag)) {
      key.fill(0);
      var errAuth = new Error("Autentikasi gagal: Password salah atau file telah dimodifikasi.");
      errAuth.code = "AUTH_FAILED"; throw errAuth;
    }

    onProgress("Decrypting", 78);
    var plaintext = await chacha20XorAsync(key, 1, nonce, ciphertext, null, abortSignal);
    key.fill(0);

    var pv = new DataView(plaintext.buffer, plaintext.byteOffset, 4);
    var metaLen = pv.getUint32(0, false);
    var metaObj = JSON.parse(new TextDecoder().decode(plaintext.subarray(4, 4 + metaLen)));
    var fileData = plaintext.slice(4 + metaLen);
    plaintext.fill(0);

    onProgress("Completed", 100);
    return {
      data: fileData,
      filename: metaObj.name || "decrypted_file",
      ext: metaObj.ext || "",
      size: metaObj.size,
      mime: metaObj.mime || "application/octet-stream",
      isDuress: false
    };
  }

  async function decryptFileData(cvaultBytes, password, options) {
    var opts = options || {};
    var onProgress = opts.onProgress || function () {};
    var abortSignal = opts.abortSignal || null;
    var keyfileBytes = opts.keyfileBytes || null;
    var splitKey = opts.splitKey || "";

    if (cvaultBytes.length < 16) {
      var e1 = new Error("File terlalu kecil atau rusak.");
      e1.code = "CORRUPT_FILE"; throw e1;
    }
    for (var i = 0; i < 4; i++) {
      if (cvaultBytes[i] !== MAGIC[i]) {
        var e2 = new Error("Format tidak dikenali. Bukan file .cel Encryptor.");
        e2.code = "INVALID_FORMAT"; throw e2;
      }
    }

    var ver = cvaultBytes[4];
    if (ver === VER_V1) return decryptV1(cvaultBytes, password, onProgress, abortSignal);
    if (ver !== VER_V2) {
      var e3 = new Error("Versi format .cel (v" + ver + ") tidak didukung.");
      e3.code = "UNSUPPORTED_VERSION"; throw e3;
    }

    var flags = cvaultBytes[5];
    var level = Math.max(1, Math.min(3, cvaultBytes[6] || 1));
    var requiresKeyfile = (flags & FLAG_KEYFILE) !== 0;
    var requiresSplitKey = (flags & FLAG_SPLIT_KEY) !== 0;

    if (requiresKeyfile && (!keyfileBytes || keyfileBytes.length === 0)) {
      var eKf = new Error("File ini membutuhkan Kunci Ganda Fisik (Keyfile).");
      eKf.code = "KEYFILE_REQUIRED"; throw eKf;
    }
    if (requiresSplitKey && (!splitKey || splitKey.length === 0)) {
      var eSk = new Error("File ini dilindungi 2-Part Split Key. Aktifkan & isi Kunci B.");
      eSk.code = "SPLIT_KEY_REQUIRED"; throw eSk;
    }

    var pv = new DataView(cvaultBytes.buffer, cvaultBytes.byteOffset, V2_PREFIX_SIZE);
    var slot1Len = pv.getUint32(8, false);
    if (V2_PREFIX_SIZE + slot1Len > cvaultBytes.length) {
      var eCor = new Error("Struktur kontainer v2 rusak.");
      eCor.code = "CORRUPT_FILE"; throw eCor;
    }

    var slot1 = cvaultBytes.subarray(V2_PREFIX_SIZE, V2_PREFIX_SIZE + slot1Len);
    var slot2 = cvaultBytes.subarray(V2_PREFIX_SIZE + slot1Len);

    var res1 = await decryptSingleSlot(slot1, password, keyfileBytes, splitKey, level, onProgress, abortSignal);
    if (res1) { onProgress("Completed", 100); res1.isDuress = false; return res1; }

    if (slot2.length >= SLOT_HEADER_SIZE + TAG_SIZE + 4) {
      var res2 = await decryptSingleSlot(slot2, password, keyfileBytes, splitKey, level, onProgress, abortSignal);
      if (res2) { onProgress("Completed", 100); res2.isDuress = true; return res2; }
    }

    var errFail = new Error("Autentikasi gagal: Sandi / Kunci B / Keyfile salah atau file rusak.");
    errFail.code = "AUTH_FAILED";
    throw errFail;
  }

  function inspectHeader(bytes) {
    if (!bytes || bytes.length < 44) return null;
    for (var i = 0; i < 4; i++) {
      if (bytes[i] !== MAGIC[i]) return null;
    }
    var ver = bytes[4];
    if (ver === VER_V1) {
      var v1 = new DataView(bytes.buffer, bytes.byteOffset, V1_HEADER_SIZE);
      return {
        version: 1, cascadeLevel: 1, requiresKeyfile: false, requiresSplitKey: false,
        iterations: v1.getUint32(5, false), salt: bytes.subarray(9, 25), nonce: bytes.subarray(25, 37)
      };
    }
    if (ver === VER_V2) {
      var v2Slot = new DataView(bytes.buffer, bytes.byteOffset + V2_PREFIX_SIZE, SLOT_HEADER_SIZE);
      return {
        version: 2,
        cascadeLevel: bytes[6] || 1,
        requiresKeyfile: (bytes[5] & FLAG_KEYFILE) !== 0,
        requiresSplitKey: (bytes[5] & FLAG_SPLIT_KEY) !== 0,
        iterations: v2Slot.getUint32(0, false),
        salt: bytes.subarray(V2_PREFIX_SIZE + 4, V2_PREFIX_SIZE + 20),
        nonce: bytes.subarray(V2_PREFIX_SIZE + 20, V2_PREFIX_SIZE + 32)
      };
    }
    return null;
  }

  global.CipherVaultCrypto = {
    hasSecureRandom: hasSecureRandom,
    sha256: sha256,
    encryptFileData: encryptFileData,
    decryptFileData: decryptFileData,
    inspectHeader: inspectHeader
  };
})(window);
