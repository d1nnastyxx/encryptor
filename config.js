/**
 * Encryptor — Minimalist Studio Configuration (Figma Make Edition)
 */
(function (global) {
  "use strict";

  global.CipherVaultConfig = {
    APP_NAME: "Encryptor",
    APP_VERSION: "4.5",

    // Tema Awal: "dark" (Obsidian Matte) | "light" (Crisp Paper)
    DEFAULT_THEME: "dark",
    SHOW_DOT_GRID: true,
    SHOW_AMBIENT_LIGHT: true,
    BACKGROUND_IMAGE: "assets/background.jpg", // Kosongkan ("") jika ingin murni polos minimalis
    BACKGROUND_IMAGE_OPACITY: 0.14,

    // Interaksi & Audio
    ENABLE_SOUND: true,
    ENABLE_HAPTIC: true,
    ENABLE_RIPPLE: true,

    // Keamanan Kriptografi
    PBKDF2_ITERATIONS: 600000,
    AUTO_WIPE_SECONDS: 30,
    GENERATED_PASSWORD_LENGTH: 20,
    MAX_FILE_SIZE: 100 * 1024 * 1024,
    ENABLE_BATCH_PROCESSING: true,

    // Kompatibilitas Android WebView & Sketchware Pro
    ENABLE_ANDROID_SHARE: true,
    ENABLE_BASE64_FALLBACK: true,
    BASE64_FALLBACK_MAX_BYTES: 8 * 1024 * 1024,

    DEBUG_MODE: false
  };
})(window);
