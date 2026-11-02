(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".pw-gen")) return;
    document.body.classList.add("pw-full");
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
  var passwordEl    = document.getElementById("pwPassword");
  var toggleVisBtn  = document.getElementById("pwToggleVisibility");
  var copyBtn       = document.getElementById("pwCopyBtn");
  var lengthSlider  = document.getElementById("pwLengthSlider");
  var lengthVal     = document.getElementById("pwLengthVal");
  var excludeInput  = document.getElementById("pwExclude");
  var generateBtn   = document.getElementById("pwGenerate");
  var modeBtns      = document.querySelectorAll(".pw-mode-btn");
  var modeGroups    = document.querySelectorAll(".pw-mode-group");
  var wordsSlider   = document.getElementById("pwWordsSlider");
  var wordsVal      = document.getElementById("pwWordsVal");
  var separatorSel  = document.getElementById("pwSeparator");
  var toggles       = document.querySelectorAll(".pw-toggle[data-toggle]");

  var lengthEl      = document.getElementById("pwLength");
  var entropyEl     = document.getElementById("pwEntropy");
  var crackTimeEl   = document.getElementById("pwCrackTime");
  var strengthBar   = document.getElementById("pwStrengthBar");
  var strengthValue = document.getElementById("pwStrengthValue");
  var strengthText  = document.getElementById("pwStrengthText");

  var bulkList      = document.getElementById("pwBulkList");
  var bulkGenBtn    = document.getElementById("pwBulkGen");
  var bulkCopyBtn   = document.getElementById("pwBulkCopy");

  var historyBox    = document.getElementById("pwHistoryBox");
  var historyList   = document.getElementById("pwHistoryList");
  var historyClear  = document.getElementById("pwHistoryClear");

  var toast         = document.getElementById("pwToast");
  var toastMsg      = document.getElementById("pwToastMsg");

  if (!passwordEl) return;

  /* ---------- Staterir ---------- */
  var state = {
    mode: "password",
    length: 16,
    words: 4,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    similar: true,
    unique: false,
    capitalize: true,
    addNumber: true,
    currentPassword: "",
    history: [],
    bulk: []
  };

  var CHARSETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
  };

  var SIMILAR_CHARS = "0O1lI5S8B";

  var WORDS = [
    "apple", "tiger", "river", "mountain", "sunset", "ocean", "flower", "garden", "forest", "cloud",
    "silver", "golden", "purple", "orange", "yellow", "smooth", "bright", "quiet", "silent", "gentle",
    "brave", "clever", "happy", "bold", "calm", "wild", "swift", "steady", "modern", "classic",
    "ancient", "future", "morning", "evening", "summer", "winter", "spring", "autumn", "light", "shadow",
    "water", "fire", "earth", "wind", "star", "moon", "sun", "planet", "comet", "nova",
    "song", "dance", "smile", "dream", "hope", "joy", "rir", "peace", "magic", "spark", "glow",
    "blue", "green", "red", "white", "black", "amber", "rose", "coral", "mint", "teal",
    "stone", "pearl", "crystal", "ember", "flame", "frost", "leaf", "root", "path", "trail",
    "code", "logic", "pixel", "data", "byte", "node", "kernel", "system", "network", "server",
    "storm", "thunder", "rain", "snow", "mist", "fog", "wave", "tide", "bay", "shore"
  ];

  /* ---------- Crypto random ---------- */
  function secureRandom(max) {
    // Cryptographically secure random integer in [0, max)
    if (window.crypto && window.crypto.getRandomValues) {
      var arr = new Uint32Array(1);
      var limit = Math.floor(0xFFFFFFFF / max) * max;
      var val;
      do {
        window.crypto.getRandomValues(arr);
        val = arr[0];
      } while (val >= limit);
      return val % max;
    }
    // Fallback (not cryptographically secure, but works)
    return Math.floor(Math.random() * max);
  }

  function pick(arr) {
    return arr[secureRandom(arr.length)];
  }

  /* ---------- Generate password ---------- */
  function generatePassword() {
    var chars = "";

    if (state.uppercase) chars += CHARSETS.uppercase;
    if (state.lowercase) chars += CHARSETS.lowercase;
    if (state.numbers) chars += CHARSETS.numbers;
    if (state.symbols) chars += CHARSETS.symbols;

    // Remove similar chars
    if (state.similar) {
      SIMILAR_CHARS.split("").forEach(function (c) {
        chars = chars.split(c).join("");
      });
    }

    // Remove custom excluded
    var customExclude = excludeInput.value;
    if (customExclude) {
      customExclude.split("").forEach(function (c) {
        chars = chars.split(c).join("");
      });
    }

    if (!chars) {
      return "";
    }

    var charsArr = chars.split("");
    var len = state.length;

    // Unique mode: cannot exceed charset size
    if (state.unique && len > charsArr.length) {
      len = charsArr.length;
    }

    if (state.unique) {
      // Fisher-Yates shuffle for unique characters
      var pool = charsArr.slice();
      for (var i = pool.length - 1; i > 0; i--) {
        var j = secureRandom(i + 1);
        var tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
      }
      return pool.slice(0, len).join("");
    }

    // Normal random
    var password = "";
    for (var k = 0; k < len; k++) {
      password += charsArr[secureRandom(charsArr.length)];
    }
    return password;
  }

  /* ---------- Generate passphrase ---------- */
  function generatePassphrase() {
    var parts = [];
    for (var i = 0; i < state.words; i++) {
      var w = pick(WORDS);
      if (state.capitalize) {
        w = w.charAt(0).toUpperCase() + w.slice(1);
      }
      parts.push(w);
    }
    var phrase = parts.join(separatorSel.value);
    if (state.addNumber) {
      phrase += secureRandom(100);
    }
    return phrase;
  }

  /* ---------- Calculate entropy ---------- */
  function calculateEntropy(pw) {
    if (!pw) return 0;

    if (state.mode === "passphrase") {
      // Each word contributes log2(WORDS.length) bits
      var wordBits = Math.log2(WORDS.length);
      var entropy = state.words * wordBits;
      if (state.addNumber) entropy += Math.log2(100); // 2 digits
      return Math.round(entropy);
    }

    // Password mode: log2(charsetSize) * length
    var charsetSize = 0;
    if (/[a-z]/.test(pw)) charsetSize += 26;
    if (/[A-Z]/.test(pw)) charsetSize += 26;
    if (/[0-9]/.test(pw)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) charsetSize += 30;

    if (charsetSize === 0) return 0;
    return Math.round(pw.length * Math.log2(charsetSize));
  }

  /* ---------- Format crack time ---------- */
  function formatCrackTime(entropy) {
    if (entropy === 0) return "—";

    // Assume 10^12 guesses/second (very fast attacker)
    var guessesPerSecond = 1e12;
    var seconds = Math.pow(2, entropy - 1) / guessesPerSecond;

    if (seconds < 1) return "সাথে সাথে";
    if (seconds < 60) return Math.round(seconds) + " সেকেন্ড";
    if (seconds < 3600) return Math.round(seconds / 60) + " মিনিট";
    if (seconds < 86400) return Math.round(seconds / 3600) + " ঘণ্টা";
    if (seconds < 31536000) return Math.round(seconds / 86400) + " দিন";
    if (seconds < 31536000 * 1000) return Math.round(seconds / 31536000) + " বছর";
    if (seconds < 31536000 * 1e6) return Math.round(seconds / (31536000 * 1000)) + " হাজার বছর";
    if (seconds < 31536000 * 1e9) return Math.round(seconds / (31536000 * 1e6)) + " মিলিয়ন বছর";
    if (seconds < 31536000 * 1e12) return Math.round(seconds / (31536000 * 1e9)) + " বিলিয়ন বছর";
    return "লক্ষ লক্ষ কোটি বছর";
  }

  /* ---------- Update strength meter ---------- */
  function updateStrength() {
    var pw = state.currentPassword;
    var entropy = calculateEntropy(pw);

    lengthEl.textContent = pw.length;
    entropyEl.textContent = entropy;

    // Determine strength level
    var level, label;
    if (entropy < 30) { level = "weak"; label = "খুব দুর্বল"; }
    else if (entropy < 50) { level = "fair"; label = "মাঝারি"; }
    else if (entropy < 70) { level = "good"; label = "ভালো"; }
    else if (entropy < 90) { level = "strong"; label = "শক্তিশালী"; }
    else { level = "excellent"; label = "অসাধারণ"; }

    strengthBar.setAttribute("data-strength", level);
    strengthValue.className = "pw-strength-value " + level;

    // Update icon
    var icon = entropy < 50 ? "#pw-i-alert" : "#pw-i-shield";
    strengthValue.innerHTML = '<svg class="pw-i" viewBox="0 0 24 24"><use href="' + icon + '"/></svg><span id="pwStrengthText">' + label + '</span>';

    // Update crack time
    crackTimeEl.textContent = formatCrackTime(entropy);
  }

  /* ---------- Toastrir ---------- */
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  /* ---------- Copy ---------- */
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
        btn.innerHTML = '<svg class="pw-i" viewBox="0 0 24 24"><use href="#pw-i-check"/></svg>';
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.innerHTML = orig;
        }, 1500);
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

  /* ---------- Update password display ---------- */
  function setPassword(pw) {
    if (!pw) {
      passwordEl.textContent = "কোনো অক্ষর সিলেক্ট করা হয়নি — একটি টগল চালু করুন";
      state.currentPassword = "";
      updateStrength();
      return;
    }
    state.currentPassword = pw;
    passwordEl.textContent = pw;
    updateStrength();

    // Add to history (if not duplicate)
    if (state.history[0] !== pw) {
      state.history.unshift(pw);
      if (state.history.length > 10) state.history.pop();
      renderHistory();
    }
  }

  /* ---------- Generate and set ---------- */
  function generate() {
    var pw;
    if (state.mode === "password") {
      pw = generatePassword();
    } else {
      pw = generatePassphrase();
    }
    setPassword(pw);
  }

  /* ---------- Render history ---------- */
  function renderHistory() {
    if (!state.history.length) {
      historyBox.hidden = true;
      return;
    }
    historyBox.hidden = false;
    historyList.innerHTML = "";
    state.history.forEach(function (pw, idx) {
      var el = document.createElement("div");
      el.className = "pw-history-item";
      el.innerHTML =
        '<span class="pw-history-pass" title="' + escapeHtml(pw) + '">' + escapeHtml(pw) + '</span>' +
        '<button class="pw-history-close" data-idx="' + idx + '" title="মুছুন"><svg class="pw-i" viewBox="0 0 24 24"><use href="#pw-i-x"/></svg></button>';
      el.querySelector(".pw-history-pass").addEventListener("click", function () {
        copyText(pw, null);
      });
      el.querySelector(".pw-history-close").addEventListener("click", function (e) {
        e.stopPropagation();
        state.history.splice(idx, 1);
        renderHistory();
      });
      historyList.appendChild(el);
    });
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (m) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
    });
  }

  /* ---------- Bulk generate ---------- */
  function bulkGenerate() {
    state.bulk = [];
    for (var i = 0; i < 10; i++) {
      var pw = state.mode === "password" ? generatePassword() : generatePassphrase();
      if (pw) state.bulk.push(pw);
    }
    renderBulk();
  }

  function renderBulk() {
    if (!state.bulk.length) {
      bulkList.innerHTML = '<div class="pw-bulk-empty">উপরে "জেনারেট" ক্লিক করুন</div>';
      return;
    }
    bulkList.innerHTML = "";
    state.bulk.forEach(function (pw, idx) {
      var el = document.createElement("div");
      el.className = "pw-bulk-item";
      el.innerHTML =
        '<span class="pw-bulk-num">' + (idx + 1) + '</span>' +
        '<span class="pw-bulk-pass">' + escapeHtml(pw) + '</span>' +
        '<button class="pw-bulk-copy" data-idx="' + idx + '" title="কপি"><svg class="pw-i" viewBox="0 0 24 24"><use href="#pw-i-copy"/></svg></button>';
      el.querySelector(".pw-bulk-copy").addEventListener("click", function () {
        copyText(pw, this);
      });
      bulkList.appendChild(el);
    });
  }

  /* ============================================================
     EVENT LISTENERS
     ============================================================ */

  /* Toggle visibility */
  var isVisible = true;
  toggleVisBtn.addEventListener("click", function () {
    isVisible = !isVisible;
    passwordEl.classList.toggle("is-hidden", !isVisible);
    toggleVisBtn.querySelector("use").setAttribute("href", isVisible ? "#pw-i-eye" : "#pw-i-eye-off");
  });

  /* Copy */
  copyBtn.addEventListener("click", function () {
    if (!state.currentPassword) {
      showToast("⚠ আগে পাসওয়ার্ড তৈরি করুন");
      return;
    }
    copyText(state.currentPassword, this);
  });

  /* Length slider */
  lengthSlider.addEventListener("input", function () {
    state.length = parseInt(this.value, 10);
    lengthVal.textContent = state.length;
  });
  lengthSlider.addEventListener("change", generate);

  /* Words slider */
  wordsSlider.addEventListener("input", function () {
    state.words = parseInt(this.value, 10);
    wordsVal.textContent = state.words;
  });
  wordsSlider.addEventListener("change", generate);

  /* Separator */
  separatorSel.addEventListener("change", generate);

  /* Toggles */
  toggles.forEach(function (t) {
    t.addEventListener("click", function () {
      t.classList.toggle("is-on");
      var key = t.getAttribute("data-toggle");
      state[key] = t.classList.contains("is-on");
      if (state.mode === "password" && (key === "uppercase" || key === "lowercase" || key === "numbers" || key === "symbols" || key === "similar" || key === "unique")) {
        generate();
      } else if (state.mode === "passphrase" && (key === "capitalize" || key === "addNumber")) {
        generate();
      }
    });
  });

  /* Exclude input */
  excludeInput.addEventListener("input", function () {
    clearTimeout(excludeInput._t);
    excludeInput._t = setTimeout(generate, 300);
  });

  /* Mode switching */
  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modeBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.mode = btn.getAttribute("data-mode");

      modeGroups.forEach(function (g) {
        g.classList.toggle("is-active", g.getAttribute("data-group") === state.mode);
      });

      generate();
    });
  });

  /* Generate button */
  generateBtn.addEventListener("click", generate);

  /* Bulk generate */
  bulkGenBtn.addEventListener("click", function () {
    bulkGenerate();
    showToast("✓ ১০টি পাসওয়ার্ড তৈরি হয়েছে");
  });

  /* Bulk copy all */
  bulkCopyBtn.addEventListener("click", function () {
    if (!state.bulk.length) {
      showToast("⚠ আগে জেনারেট করুন");
      return;
    }
    copyText(state.bulk.join("\n"), this);
    showToast("✓ সব " + state.bulk.length + "টি কপি হয়েছে");
  });

  /* History clear */
  historyClear.addEventListener("click", function () {
    state.history = [];
    renderHistory();
    showToast("✓ ইতিহাস মুছে ফেলা হয়েছে");
  });

  /* ============================================================
     INIT
     ============================================================ */
  generate();

})();
