(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".hash-gen")) return;
    document.body.classList.add("hg-full");
    var sels = ["#content-wrapper","#content-wrapper > .container","#main-wrapper","#main",
      ".blog-posts",".blog-posts-wrap",".item-post-wrap",".item-post",".item-post-inner",
      ".entry-content-wrap",".post-body","#post-body",".blog-post",".entry-header",
      ".blog-entry-header",".p-eh",".hentry","article"];
    sels.forEach(function(s){
      document.querySelectorAll(s).forEach(function(el){
        el.style.setProperty("padding","0","important");
        el.style.setProperty("margin-left","0","important");
        el.style.setProperty("margin-right","0","important");
        el.style.setProperty("max-width","100%","important");
        el.style.setProperty("width","100%","important");
        el.style.setProperty("border-radius","0","important");
        el.style.setProperty("box-shadow","none","important");
        el.style.setProperty("background","transparent","important");
        el.style.setProperty("border","0","important");
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", forceFullWidth);
  else forceFullWidth();
  setTimeout(forceFullWidth, 300);
  setTimeout(forceFullWidth, 1200);

  /* ---------- DOMRIR ---------- */
  var tabs          = document.querySelectorAll(".hg-tab[data-tab]");
  var panels        = document.querySelectorAll(".hg-panel");
  var textarea      = document.getElementById("hgTextarea");
  var charCount     = document.getElementById("hgCharCount");
  var byteCount     = document.getElementById("hgByteCount");
  var clearTextBtn  = document.getElementById("hgClearText");
  var upload        = document.getElementById("hgUpload");
  var fileInput     = document.getElementById("hgFileInput");
  var fileInfo      = document.getElementById("hgFileInfo");
  var fileName      = document.getElementById("hgFileName");
  var fileMeta      = document.getElementById("hgFileMeta");
  var fileClear     = document.getElementById("hgFileClear");
  var fileWarning   = document.getElementById("hgFileWarning");
  var verifyInput   = document.getElementById("hgVerifyInput");
  var verifyResult  = document.getElementById("hgVerifyResult");
  var verifyIcon    = document.getElementById("hgVerifyIcon");
  var verifyText    = document.getElementById("hgVerifyText");
  var toast         = document.getElementById("hgToast");
  var toastMsg      = document.getElementById("hgToastMsg");

  var hashEls = {
    md5:    document.getElementById("hgMd5"),
    sha1:   document.getElementById("hgSha1"),
    sha256: document.getElementById("hgSha256"),
    sha384: document.getElementById("hgSha384"),
    sha512: document.getElementById("hgSha512")
  };

  var copyBtns = document.querySelectorAll(".hg-copy-btn");

  if (!textarea) return;

  /* ---------- State ---------- */
  var state = {
    currentHashes: { md5: "", sha1: "", sha256: "", sha384: "", sha512: "" },
    activeTab: "text",
    currentFile: null
  };

  var MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

  /* ============================================================
     MD5 IMPLEMENTATION (pure JavaScript, byte-array based)
     ============================================================ */
  function md5(bytes) {
    var msgLen = bytes.length;
    var bitLenLo = (msgLen * 8) >>> 0;
    var bitLenHi = Math.floor(msgLen / 0x20000000);

    // Padded length must be multiple of 64
    var paddedLen = (((msgLen + 8) >> 6) + 1) * 64;
    var padded = new Uint8Array(paddedLen);
    padded.set(bytes);
    padded[msgLen] = 0x80;

    var last = paddedLen - 8;
    padded[last]     = bitLenLo & 0xff;
    padded[last + 1] = (bitLenLo >>> 8) & 0xff;
    padded[last + 2] = (bitLenLo >>> 16) & 0xff;
    padded[last + 3] = (bitLenLo >>> 24) & 0xff;
    padded[last + 4] = bitLenHi & 0xff;
    padded[last + 5] = (bitLenHi >>> 8) & 0xff;
    padded[last + 6] = (bitLenHi >>> 16) & 0xff;
    padded[last + 7] = (bitLenHi >>> 24) & 0xff;

    var a0 = 0x67452301;
    var b0 = 0xefcdab89;
    var c0 = 0x98badcfe;
    var d0 = 0x10325476;

    var K = [
      0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
      0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
      0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
      0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
      0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
      0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
      0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
      0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
      0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
      0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
      0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
      0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
      0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
      0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
      0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
      0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];
    var S = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
      5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
      4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
      6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];

    var M = new Uint32Array(16);

    for (var offset = 0; offset < paddedLen; offset += 64) {
      for (var i = 0; i < 16; i++) {
        M[i] = padded[offset + i * 4] |
               (padded[offset + i * 4 + 1] << 8) |
               (padded[offset + i * 4 + 2] << 16) |
               (padded[offset + i * 4 + 3] << 24);
      }

      var A = a0, B = b0, C = c0, D = d0;

      for (var j = 0; j < 64; j++) {
        var F, g;
        if (j < 16) { F = (B & C) | (~B & D); g = j; }
        else if (j < 32) { F = (D & B) | (~D & C); g = (5 * j + 1) % 16; }
        else if (j < 48) { F = B ^ C ^ D; g = (3 * j + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * j) % 16; }

        F = (F + A + K[j] + M[g]) >>> 0;
        A = D;
        D = C;
        C = B;
        B = (B + ((F << S[j]) | (F >>> (32 - S[j])))) >>> 0;
      }

      a0 = (a0 + A) >>> 0;
      b0 = (b0 + B) >>> 0;
      c0 = (c0 + C) >>> 0;
      d0 = (d0 + D) >>> 0;
    }

    function wordToHex(word) {
      return (
        ((word & 0xff).toString(16).padStart(2, "0")) +
        (((word >>> 8) & 0xff).toString(16).padStart(2, "0")) +
        (((word >>> 16) & 0xff).toString(16).padStart(2, "0")) +
        (((word >>> 24) & 0xff).toString(16).padStart(2, "0"))
      );
    }

    return wordToHex(a0) + wordToHex(b0) + wordToHex(c0) + wordToHex(d0);
  }

  /* ============================================================
     SHA HELPERS (via Web Crypto)
     ============================================================ */
  function bufferToHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var hex = "";
    for (var i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return hex;
  }

  async function shaHash(algo, bytes) {
    if (!window.crypto || !window.crypto.subtle) return null;
    try {
      var buf = await crypto.subtle.digest(algo, bytes);
      return bufferToHex(buf);
    } catch (e) {
      return null;
    }
  }

  /* ============================================================
     HASH ALL
     ============================================================ */
  async function hashAll(bytes) {
    var result = {};

    // MD5 (custom)
    try { result.md5 = md5(bytes); }
    catch (e) { result.md5 = null; }

    // SHA family
    result.sha1   = await shaHash("SHA-1", bytes);
    result.sha256 = await shaHash("SHA-256", bytes);
    result.sha384 = await shaHash("SHA-384", bytes);
    result.sha512 = await shaHash("SHA-512", bytes);

    return result;
  }

  /* ============================================================
     RENDER HASHES
     ============================================================ */
  function renderHashes(hashes) {
    state.currentHashes = hashes;

    Object.keys(hashEls).forEach(function (key) {
      var el = hashEls[key];
      var hash = hashes[key];

      if (hash) {
        el.textContent = hash;
        el.classList.remove("is-empty");
      } else {
        if (!window.crypto || !window.crypto.subtle) {
          el.textContent = "⚠ Web Crypto সাপোর্টেড নয় (HTTPS দরকার)";
        } else {
          el.textContent = "গণনা করা যায়নি";
        }
        el.classList.add("is-empty");
      }
    });

    // Re-run verify if there's input
    if (verifyInput.value.trim()) {
      doVerify();
    }
  }

  /* ============================================================
     EMPTY HASHES STATE
     ============================================================ */
  function showEmptyHashes() {
    state.currentHashes = { md5: "", sha1: "", sha256: "", sha384: "", sha512: "" };
    Object.keys(hashEls).forEach(function (key) {
      hashEls[key].textContent = "টেক্সট লিখলে হ্যাশ এখানে দেখাবে";
      hashEls[key].classList.add("is-empty");
    });
    hideVerify();
  }

  /* ============================================================
     HASH FROM TEXT
     ============================================================ */
  var hashTimer = null;
  function hashFromText() {
    var text = textarea.value;

    // Update counters
    charCount.textContent = text.length.toLocaleString();
    var bytes = new TextEncoder().encode(text);
    byteCount.textContent = bytes.length.toLocaleString();

    if (!text.length) {
      showEmptyHashes();
      return;
    }

    clearTimeout(hashTimer);
    hashTimer = setTimeout(async function () {
      try {
        var hashes = await hashAll(bytes);
        renderHashes(hashes);
      } catch (e) {
        console.error("Hash error:", e);
      }
    }, 120);
  }

  /* ============================================================
     HASH FROM FILE
     ============================================================ */
  async function hashFromFile(file) {
    if (!file) return;

    state.currentFile = file;

    // Update file info
    fileName.textContent = file.name;
    fileMeta.textContent = formatBytes(file.size);
    fileInfo.classList.add("is-visible");

    if (file.size > MAX_FILE_SIZE) {
      fileWarning.classList.add("is-visible");
    } else {
      fileWarning.classList.remove("is-visible");
    }

    try {
      var arrayBuffer = await file.arrayBuffer();
      var bytes = new Uint8Array(arrayBuffer);
      var hashes = await hashAll(bytes);
      renderHashes(hashes);
    } catch (e) {
      console.error("File hash error:", e);
      showToast("✕ ফাইল পড়া যায়নি");
    }
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }

  /* ============================================================
     VERIFY
     ============================================================ */
  function doVerify() {
    var value = verifyInput.value.trim().toLowerCase();
    if (!value) {
      hideVerify();
      return;
    }

    // Check against each hash
    var algoLabels = {
      md5: "MD5",
      sha1: "SHA-1",
      sha256: "SHA-256",
      sha384: "SHA-384",
      sha512: "SHA-512"
    };

    var match = null;
    Object.keys(state.currentHashes).forEach(function (key) {
      if (state.currentHashes[key] && state.currentHashes[key].toLowerCase() === value) {
        match = algoLabels[key];
      }
    });

    verifyResult.classList.add("is-visible");

    if (match) {
      verifyResult.className = "hg-verify-result is-visible match";
      verifyIcon.querySelector("use").setAttribute("href", "#hg-i-check-circle");
      verifyText.innerHTML = '<strong>✓ মিলে গেছে!</strong> এটি <strong>' + match + '</strong> হ্যাশের সাথে হুবহু মিলে।';
    } else {
      verifyResult.className = "hg-verify-result is-visible nomatch";
      verifyIcon.querySelector("use").setAttribute("href", "#hg-i-x-circle");
      verifyText.innerHTML = '<strong>✕ কোনো মিল নেই।</strong> এই হ্যাশটি কোনো অ্যালগরিদমের সাথেই মিলছে না।';
    }
  }

  function hideVerify() {
    verifyResult.classList.remove("is-visible");
  }

  /* ============================================================
     COPY
     ============================================================ */
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  function copyText(text, btn) {
    if (!text) return;
    var done = function () {
      showToast("✓ কপি হয়েছে");
      if (btn) {
        var orig = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML = '<svg class="hg-i" viewBox="0 0 24 24"><use href="#hg-i-check"/></svg>';
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.innerHTML = orig;
        }, 1400);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text); done();
      });
    } else {
      fallbackCopy(text); done();
    }
  }

  /* ============================================================
     TOAST
     ============================================================ */
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2000);
  }

  /* ============================================================
     EVENTS
     ============================================================ */

  // Text input
  textarea.addEventListener("input", hashFromText);

  // Clear text
  clearTextBtn.addEventListener("click", function () {
    textarea.value = "";
    hashFromText();
    showToast("✓ টেক্সট মুছে ফেলা হয়েছে");
    textarea.focus();
  });

  // Tab switching
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      var name = tab.getAttribute("data-tab");
      state.activeTab = name;
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === name);
      });
    });
  });

  // File upload click
  upload.addEventListener("click", function () {
    fileInput.click();
  });

  // File select
  fileInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      hashFromFile(this.files[0]);
    }
    this.value = "";
  });

  // Drag & drop
  ["dragenter", "dragover"].forEach(function (evt) {
    upload.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      upload.classList.add("is-dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    upload.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      upload.classList.remove("is-dragover");
    });
  });
  upload.addEventListener("drop", function (e) {
    var dt = e.dataTransfer;
    if (dt && dt.files && dt.files[0]) {
      hashFromFile(dt.files[0]);
    }
  });

  // Clear file
  fileClear.addEventListener("click", function () {
    state.currentFile = null;
    fileInfo.classList.remove("is-visible");
    fileWarning.classList.remove("is-visible");
    showEmptyHashes();
    showToast("✓ ফাইল মুছে ফেলা হয়েছে");
  });

  // Copy buttons
  copyBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-copy");
      var hash = state.currentHashes[key];
      if (!hash) {
        showToast("⚠ আগে ইনপুট দিন");
        return;
      }
      copyText(hash, btn);
    });
  });

  // Verify input
  verifyInput.addEventListener("input", doVerify);

  // Click hash to copy
  Object.keys(hashEls).forEach(function (key) {
    hashEls[key].addEventListener("click", function () {
      var hash = state.currentHashes[key];
      if (hash) copyText(hash, null);
    });
  });

  /* ---------- Init ---------- */
  showEmptyHashes();

})();
