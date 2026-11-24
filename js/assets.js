/**
 * Encryptor — Modular Vector Asset Pack (Figma Make Style)
 * Menyediakan ikon vektor 1.5px stroke per tipe file & ilustrasi UI 100% offline.
 */
(function (global) {
  "use strict";

  var FILE_ICONS = {
    cel: {
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.12)",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="9" y="10" width="6" height="5" rx="1"/><path d="M10 10V8a2 2 0 1 1 4 0v2"/></svg>'
    },
    pdf: {
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.12)",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2a1.5 1.5 0 0 1 0 3H8v-3zm0 3v2"/><path d="M14 13h1.5a1.5 1.5 0 0 1 0 3H14v-3z"/></svg>'
    },
    image: {
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.12)",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
    },
    archive: {
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.12)",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>'
    },
    doc: {
      color: "#6366f1",
      bg: "rgba(99, 102, 241, 0.12)",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>'
    },
    audio: {
      color: "#ec4899",
      bg: "rgba(236, 72, 153, 0.12)",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
    },
    video: {
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.12)",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10 9 15 12 10 15 10 9"/></svg>'
    },
    code: {
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.12)",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
    },
    binary: {
      color: "#71717a",
      bg: "rgba(113, 113, 122, 0.14)",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>'
    }
  };

  var ILLUSTRATIONS = {
    dropEncrypt:
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="14" y="10" width="36" height="44" rx="6" opacity="0.25"/>' +
        '<rect x="18" y="14" width="28" height="36" rx="4"/>' +
        '<path d="M32 37V25"/>' +
        '<polyline points="27 30 32 25 37 30"/>' +
        '<line x1="25" y1="42" x2="39" y2="42" opacity="0.5"/>' +
      '</svg>',
    dropDecrypt:
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M32 54s16-8 16-20V18l-16-6-16 6v16c0 12 16 20 16 20z" opacity="0.2"/>' +
        '<rect x="23" y="29" width="18" height="14" rx="3"/>' +
        '<path d="M27 29v-4a5 5 0 0 1 9.6-2"/>' +
        '<circle cx="32" cy="36" r="1.5" fill="currentColor"/>' +
      '</svg>',
    emptyQueue:
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="12" y="16" width="40" height="32" rx="6" opacity="0.25"/>' +
        '<path d="M20 28h24M20 36h15" opacity="0.6"/>' +
        '<circle cx="44" cy="36" r="5"/>' +
        '<path d="M44 33.5v5M41.5 36h5"/>' +
      '</svg>'
  };

  function getFileAsset(filename) {
    var ext = "";
    var idx = (filename || "").lastIndexOf(".");
    if (idx > 0) ext = filename.slice(idx + 1).toLowerCase();

    if (ext === "cel" || ext === "cvbundle") return FILE_ICONS.cel;
    if (ext === "pdf") return FILE_ICONS.pdf;
    if (["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp", "heic"].indexOf(ext) !== -1) return FILE_ICONS.image;
    if (["zip", "rar", "7z", "tar", "gz"].indexOf(ext) !== -1) return FILE_ICONS.archive;
    if (["doc", "docx", "txt", "md", "rtf", "xls", "xlsx", "csv", "ppt", "pptx"].indexOf(ext) !== -1) return FILE_ICONS.doc;
    if (["mp3", "wav", "ogg", "m4a", "flac"].indexOf(ext) !== -1) return FILE_ICONS.audio;
    if (["mp4", "mkv", "mov", "avi", "webm"].indexOf(ext) !== -1) return FILE_ICONS.video;
    if (["js", "html", "css", "json", "py", "java", "cpp", "c", "xml"].indexOf(ext) !== -1) return FILE_ICONS.code;
    return FILE_ICONS.binary;
  }

  global.CipherVaultAssets = {
    getFileAsset: getFileAsset,
    ILLUSTRATIONS: ILLUSTRATIONS
  };
})(window);
