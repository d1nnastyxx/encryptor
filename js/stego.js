/**
 * Encryptor — Offline PNG LSB Steganography Engine
 * Menyisipkan & mengekstrak payload .cel ke dalam bit terendah (LSB) piksel RGB.
 * Memaksa Alpha = 255 agar bebas korupsi premultiplied-alpha di Android WebView.
 */
(function (global) {
  "use strict";

  var STEGO_MAGIC = [0x43, 0x56, 0x53, 0x47]; // "CVSG"

  function loadImageFromFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { reject(new Error("Gagal memuat gambar cover.")); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error("Gagal membaca file gambar.")); };
      reader.readAsDataURL(file);
    });
  }

  function dataUrlToUint8Array(dataUrl) {
    var base64 = dataUrl.split(",")[1];
    var binary = atob(base64);
    var len = binary.length;
    var out = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }

  async function embedInImage(coverImageFile, payloadBytes) {
    var img = await loadImageFromFile(coverImageFile);
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imgData.data;

    var totalPixels = canvas.width * canvas.height;
    var maxBytes = Math.floor((totalPixels * 3) / 8) - 8;

    if (payloadBytes.length > maxBytes) {
      throw new Error(
        "Gambar cover terlalu kecil! Kapasitas maksimal gambar ini " +
        Math.max(0, Math.floor(maxBytes / 1024)) + " KB, sedangkan payload " +
        Math.ceil(payloadBytes.length / 1024) + " KB. Gunakan gambar beresolusi lebih besar."
      );
    }

    // Header 8 byte: [4B "CVSG"] + [4B payloadLen BE] + payload
    var packet = new Uint8Array(8 + payloadBytes.length);
    packet.set(STEGO_MAGIC, 0);
    var pv = new DataView(packet.buffer);
    pv.setUint32(4, payloadBytes.length, false);
    packet.set(payloadBytes, 8);

    var bitIdx = 0;
    var totalBits = packet.length * 8;

    for (var p = 0; p < pixels.length && bitIdx < totalBits; p += 4) {
      pixels[p + 3] = 255; // Kunci Alpha = 255 agar nilai RGB tidak berubah saat encode PNG
      for (var c = 0; c < 3 && bitIdx < totalBits; c++) {
        var byteVal = packet[bitIdx >> 3];
        var bit = (byteVal >> (7 - (bitIdx & 7))) & 1;
        pixels[p + c] = (pixels[p + c] & 0xfe) | bit;
        bitIdx++;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    var pngDataUrl = canvas.toDataURL("image/png");
    var pngBytes = dataUrlToUint8Array(pngDataUrl);

    var baseName = (coverImageFile.name || "cover").replace(/\.[^.]+$/, "");
    return {
      data: pngBytes,
      filename: baseName + "_vault.png",
      mime: "image/png"
    };
  }

  async function extractFromImage(imageFile) {
    var img = await loadImageFromFile(imageFile);
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    var bitCursor = 0;
    var pixelCursor = 0;
    var chanCursor = 0;

    function readBytes(count) {
      var out = new Uint8Array(count);
      for (var b = 0; b < count; b++) {
        var val = 0;
        for (var bit = 0; bit < 8; bit++) {
          if (pixelCursor >= pixels.length) return null;
          val = (val << 1) | (pixels[pixelCursor + chanCursor] & 1);
          chanCursor++;
          if (chanCursor === 3) {
            chanCursor = 0;
            pixelCursor += 4;
          }
          bitCursor++;
        }
        out[b] = val;
      }
      return out;
    }

    var header = readBytes(8);
    if (!header) return null;
    for (var i = 0; i < 4; i++) {
      if (header[i] !== STEGO_MAGIC[i]) return null;
    }

    var hv = new DataView(header.buffer);
    var payloadLen = hv.getUint32(4, false);
    var maxBytes = Math.floor(((canvas.width * canvas.height) * 3) / 8) - 8;
    if (payloadLen <= 0 || payloadLen > maxBytes) return null;

    return readBytes(payloadLen);
  }

  function isLikelyImageFile(file) {
    if (!file) return false;
    var type = (file.type || "").toLowerCase();
    var name = (file.name || "").toLowerCase();
    return type === "image/png" || name.endsWith(".png");
  }

  global.CipherVaultStego = {
    embedInImage: embedInImage,
    extractFromImage: extractFromImage,
    isLikelyImageFile: isLikelyImageFile
  };
})(window);
