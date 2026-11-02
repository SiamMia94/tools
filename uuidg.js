(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".uuid-gen")) return;
    document.body.classList.add("uu-full");
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
  var versionBtns  = document.querySelectorAll("#uuVersions .uu-chip");
  var countSlider  = document.getElementById("uuCount");
  var countVal     = document.getElementById("uuCountVal");
  var formatBtns   = document.querySelectorAll("#uuFormats .uu-format");
  var generateBtn  = document.getElementById("uuGenerate");
  var copyAllBtn   = document.getElementById("uuCopyAll");
  var listEl       = document.getElementById("uuList");
  var outputCount  = document.getElementById("uuOutputCount");
  var verifyInput  = document.getElementById("uuVerifyInput");
  var verifyResult = document.getElementById("uuVerifyResult");
  var verifyIcon   = document.getElementById("uuVerifyIcon");
  var verifyText   = document.getElementById("uuVerifyText");
  var toast        = document.getElementById("uuToast");
  var toastMsg     = document.getElementById("uuToastMsg");

  if (!listEl) return;

  /* ---------- State ---------- */
  var state = {
    version: "v4",
    count: 5,
    format: "default",
    uuids: []
  };

  /* ============================================================
     UUID GENERATION
     ============================================================ */

  /* UUID v4 — crypto.getRandomValues (RFC 4122 compliant) */
  function uuidV4() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    var hex = "";
    for (var i = 0; i < 16; i++) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return hex.slice(0,8) + "-" + hex.slice(8,12) + "-" + hex.slice(12,16) + "-" + hex.slice(16,20) + "-" + hex.slice(20);
  }

  /* UUID v1 — timestamp (100-ns intervals since 1582-10-15) + random node */
  function uuidV1() {
    // UUID epoch offset in 100-ns intervals: 122192928000000000
    var uuidEpoch = 122192928000000000n;
    var now = BigInt(Date.now()) * 10000n;
    var ts = now + uuidEpoch;

    var timeLow = Number(ts & 0xffffffffn) >>> 0;
    var timeMid = Number((ts >> 32n) & 0xffffn);
    var timeHi  = (Number((ts >> 48n) & 0x0fffn) | 0x1000); // version 1

    var rand = new Uint8Array(8);
    crypto.getRandomValues(rand);
    var clockSeq = ((rand[0] << 8) | rand[1]) & 0x3fff | 0x8000; // variant 10

    var node = "";
    for (var i = 2; i < 8; i++) {
      node += rand[i].toString(16).padStart(2, "0");
    }

    return timeLow.toString(16).padStart(8, "0") + "-" +
           timeMid.toString(16).padStart(4, "0") + "-" +
           timeHi.toString(16).padStart(4, "0") + "-" +
           clockSeq.toString(16).padStart(4, "0") + "-" + node;
  }

  /* UUID v7 — 48-bit unix ms timestamp + random, sortable */
  function uuidV7() {
    var bytes = new Uint8Array(16);
    var now = BigInt(Date.now());

    // First 6 bytes = 48-bit timestamp (big-endian)
    bytes[0] = Number((now >> 40n) & 0xffn);
    bytes[1] = Number((now >> 32n) & 0xffn);
    bytes[2] = Number((now >> 24n) & 0xffn);
    bytes[3] = Number((now >> 16n) & 0xffn);
    bytes[4] = Number((now >> 8n) & 0xffn);
    bytes[5] = Number(now & 0xffn);

    // Random for rest
    crypto.getRandomValues(bytes.subarray(6));

    // Version 7
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    // Variant 10
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    var hex = "";
    for (var i = 0; i < 16; i++) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return hex.slice(0,8) + "-" + hex.slice(8,12) + "-" + hex.slice(12,16) + "-" + hex.slice(16,20) + "-" + hex.slice(20);
  }

  function uuidNil() {
    return "00000000-0000-0000-0000-000000000000";
  }

  /* ---------- Format transform ---------- */
  function applyFormat(uuid, format) {
    var v = uuid;
    if (format === "nohyphen") {
      return v.replace(/-/g, "");
    }
    if (format === "uppercase") {
      return v.toUpperCase();
    }
    if (format === "braces") {
      return "{" + v + "}";
    }
    return v;
  }

  /* ---------- Generate batch ---------- */
  function generateBatch() {
    var results = [];
    for (var i = 0; i < state.count; i++) {
      var raw;
      if (state.version === "v1") raw = uuidV1();
      else if (state.version === "v7") raw = uuidV7();
      else if (state.version === "nil") raw = uuidNil();
      else raw = uuidV4();

      results.push({
        raw: raw,
        formatted: applyFormat(raw, state.format)
      });
    }
    state.uuids = results;
    render();
  }

  /* ---------- Render list ---------- */
  function render() {
    listEl.innerHTML = "";
    outputCount.textContent = state.uuids.length;

    if (!state.uuids.length) {
      listEl.innerHTML =
        '<div class="uu-empty">' +
          '<svg class="uu-i" viewBox="0 0 24 24"><use href="#uu-i-id"/></svg>' +
          '<h3>এখনো UUID তৈরি হয়নি</h3>' +
          '<p>"নতুন UUID তৈরি করুন" ক্লিক করুন</p>' +
        '</div>';
      return;
    }

    state.uuids.forEach(function (item, idx) {
      var el = document.createElement("div");
      el.className = "uu-item";
      el.style.animationDelay = (idx * 25) + "ms";
      el.innerHTML =
        '<span class="uu-item-num">' + (idx + 1) + '</span>' +
        '<span class="uu-item-value" data-idx="' + idx + '">' + escapeHtml(item.formatted) + '</span>' +
        '<button type="button" class="uu-item-copy" data-idx="' + idx + '" title="কপি">' +
          '<svg class="uu-i" viewBox="0 0 24 24"><use href="#uu-i-copy"/></svg>' +
        '</button>';

      el.querySelector(".uu-item-value").addEventListener("click", function () {
        copyText(item.formatted, null);
      });
      el.querySelector(".uu-item-copy").addEventListener("click", function () {
        copyText(item.formatted, this);
      });

      listEl.appendChild(el);
    });
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (m) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
    });
  }

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
        btn.innerHTML = '<svg class="uu-i" viewBox="0 0 24 24"><use href="#uu-i-check"/></svg>';
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

  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 1800);
  }

  /* ============================================================
     VERIFY
     ============================================================ */
  function verifyUUID(input) {
    var v = input.trim();
    if (!v) {
      verifyResult.classList.remove("is-visible");
      return;
    }

    // Strip braces
    var clean = v.replace(/^\{|\}$/g, "").trim();

    // Regex: 8-4-4-4-12 hex with optional hyphens
    var standardRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    var noHyphenRegex = /^[0-9a-f]{32}$/i;

    var isStandard = standardRegex.test(clean);
    var isNoHyphen = noHyphenRegex.test(clean);

    if (!isStandard && !isNoHyphen) {
      verifyResult.className = "uu-verify-result is-visible invalid";
      verifyIcon.querySelector("use").setAttribute("href", "#uu-i-x-circle");
      verifyText.innerHTML = '<strong>✕ অবৈধ UUID।</strong> সঠিক ফরম্যাট: <code>xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code>';
      return;
    }

    // Normalize to check version
    var normalized = clean;
    if (isNoHyphen) {
      normalized = clean.slice(0,8) + "-" + clean.slice(8,12) + "-" + clean.slice(12,16) + "-" + clean.slice(16,20) + "-" + clean.slice(20);
    }

    var versionChar = normalized.charAt(14);
    var variantChar = normalized.charAt(19);

    // NIL check
    if (normalized === "00000000-0000-0000-0000-000000000000") {
      verifyResult.className = "uu-verify-result is-visible valid";
      verifyIcon.querySelector("use").setAttribute("href", "#uu-i-check-circle");
      verifyText.innerHTML = '<strong>✓ বৈধ UUID</strong> — এটি <code>NIL UUID</code> (সব বিট শূন্য)।';
      return;
    }

    var versionNames = {
      "1": "v1 (Time-based)",
      "2": "v2 (DCE Security)",
      "3": "v3 (MD5 name-based)",
      "4": "v4 (Random)",
      "5": "v5 (SHA-1 name-based)",
      "6": "v6 (Reordered time)",
      "7": "v7 (Unix timestamp)",
      "8": "v8 (Custom)"
    };

    var versionName = versionNames[versionChar] || ("অজানা (version nibble = " + versionChar + ")");

    verifyResult.className = "uu-verify-result is-visible valid";
    verifyIcon.querySelector("use").setAttribute("href", "#uu-i-check-circle");
    verifyText.innerHTML =
      '<strong>✓ বৈধ UUID</strong> — সংস্করণ: <code>' + escapeHtml(versionName) + '</code>' +
      (isNoHyphen ? ' · হাইফেন-বিহীন ফরম্যাট' : '');
  }

  /* ============================================================
     EVENTS
     ============================================================ */

  // Version
  versionBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      versionBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.version = btn.getAttribute("data-version");
      generateBatch();
    });
  });

  // Count
  countSlider.addEventListener("input", function () {
    state.count = parseInt(this.value, 10);
    countVal.textContent = state.count;
  });
  countSlider.addEventListener("change", generateBatch);

  // Format
  formatBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      formatBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.format = btn.getAttribute("data-format");
      // Re-format existing (no need to regenerate)
      state.uuids = state.uuids.map(function (u) {
        return { raw: u.raw, formatted: applyFormat(u.raw, state.format) };
      });
      render();
    });
  });

  // Generate
  generateBtn.addEventListener("click", generateBatch);

  // Copy all
  copyAllBtn.addEventListener("click", function () {
    if (!state.uuids.length) {
      showToast("⚠ আগে UUID তৈরি করুন");
      return;
    }
    var text = state.uuids.map(function (u) { return u.formatted; }).join("\n");
    copyText(text, this);
    showToast("✓ সব " + state.uuids.length + "টি কপি হয়েছে");
  });

  // Verify
  verifyInput.addEventListener("input", function () {
    verifyUUID(this.value);
  });

  /* ---------- Init ---------- */
  generateBatch();

})();
