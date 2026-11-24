# Encryptor 4.5 — Client-Side Cryptography & Steganography Studio

Aplikasi enkripsi berkas dan steganografi **100% offline / client-side** berbasis Pure JavaScript, Web Audio API, dan Canvas 2D tanpa ketergantungan server maupun pustaka eksternal.

## Live Demo
- **Web Application:** `https://d1nnastyxx.github.io/encryptor-4.5/`
- **Interactive Product Showcase (03:30):** `https://d1nnastyxx.github.io/encryptor-4.5/showcase.html`

## Fitur Utama
- **Authenticated Encryption:** ChaCha20-Poly1305 AEAD dengan derivasi kunci PBKDF2-HMAC-SHA256.
- **Multi-Layer Cascade (Lv 1–3):** Enkripsi berlapis dengan sub-kunci independen dan random padding.
- **Key Management:** Dukungan SHA-256 Physical Keyfile & 2-Part Split Key.
- **Zero Extension Leak:** Kontainer `.cel` terenkripsi yang menghapus ekstensi asli serta mendukung penyamaran nama berkas.
- **Advanced Defense:** Duress Vault (lapisan umpan) & Time Capsule (kunci batas waktu).
- **Steganography & Forensics:** Penyisipan LSB piksel PNG, Zero-Width Unicode Text Stego, serta analisis *Shannon Entropy Histogram* & *Avalanche Matrix* 60 FPS.

## Tech Stack
HTML5 · CSS3 (iOS Settings UI) · Vanilla JavaScript · Canvas 2D · Inline SVG · Web Audio API · Web Speech API
