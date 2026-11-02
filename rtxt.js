(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".robots-gen")) return;
    document.body.classList.add("rb-full");
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

  /* ---------- DOM ---------- */
  var presets        = document.querySelectorAll(".rb-preset");
  var uaList         = document.getElementById("rbUaList");
  var uaChips        = uaList.querySelectorAll(".rb-ua-chip");
  var uaCount        = document.getElementById("rbUaCount");
  var ruleList       = document.getElementById("rbRuleList");
  var addAllowBtn    = document.getElementById("rbAddAllow");
  var addDisallowBtn = document.getElementById("rbAddDisallow");
  var sitemapInput   = document.getElementById("rbSitemap");
  var crawlInput     = document.getElementById("rbCrawlDelay");
  var codeEl         = document.getElementById("rbCode");
  var copyBtn        = document.getElementById("rbCopyBtn");
  var downloadBtn    = document.getElementById("rbDownloadBtn");
  var resetBtn       = document.getElementById("rbResetBtn");
  var validation     = document.getElementById("rbValidation");
  var validationText = document.getElementById("rbValidationText");
  var statusEl       = document.getElementById("rbOutputStatus");
  var statusText     = document.getElementById("rbOutputStatusText");
  var toast          = document.getElementById("rbToast");
  var toastMsg       = document.getElementById("rbToastMsg");

  if (!uaList) return;

  /* ---------- State ---------- */
  var state = {
    userAgents: ["*"],
    rules: [
      { type: "allow", path: "/" },
      { type: "disallow", path: "/search" },
      { type: "disallow", path: "/label/" }
    ],
    sitemap: "",
    crawlDelay: ""
  };

  /* ---------- Utilities ---------- */
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (m) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
    });
  }

  /* ============================================================
     RENDER RULES
     ============================================================ */
  function renderRules() {
    ruleList.innerHTML = "";
    if (!state.rules.length) {
      var empty = document.createElement("div");
      empty.style.cssText = "padding: 0.65rem; text-align: center; color: var(--rb-ink-dim); font-size: 0.74rem; font-family: var(--rb-font-bangla); background: var(--rb-surface-alt); border-radius: 8px;";
      empty.textContent = "কোনো নিয়ম নেই — উপরে বাটন দিয়ে যোগ করুন";
      ruleList.appendChild(empty);
      return;
    }

    state.rules.forEach(function (rule, idx) {
      var row = document.createElement("div");
      row.className = "rb-rule";
      row.innerHTML =
        '<span class="rb-rule-type ' + rule.type + '">' + (rule.type === "allow" ? "Allow" : "Disallow") + '</span>' +
        '<input type="text" value="' + escapeHtml(rule.path) + '" placeholder="/path/to/block" data-idx="' + idx + '">' +
        '<button type="button" class="rb-rule-del" data-idx="' + idx + '" title="মুছুন">' +
          '<svg class="rb-i" viewBox="0 0 24 24"><use href="#rb-i-trash"/></svg>' +
        '</button>';

      row.querySelector("input").addEventListener("input", function () {
        state.rules[idx].path = this.value;
        update();
      });

      row.querySelector(".rb-rule-del").addEventListener("click", function () {
        state.rules.splice(idx, 1);
        renderRules();
        update();
      });

      ruleList.appendChild(row);
    });
  }

  /* ============================================================
     GENERATE ROBOTS.TXT
     ============================================================ */
  function generate() {
    var lines = [];
    var hasContent = false;

    // Header comment
    lines.push("# robots.txt generated by Tools APK48");
    lines.push("# " + new Date().toISOString().split("T")[0]);
    lines.push("");

    if (state.userAgents.length > 0) {
      state.userAgents.forEach(function (ua) {
        lines.push("User-agent: " + ua);
      });
    } else {
      lines.push("User-agent: *");
    }

    // Rules
    var validRules = state.rules.filter(function (r) { return r.path.trim().length > 0; });
    validRules.forEach(function (rule) {
      if (rule.type === "allow") {
        lines.push("Allow: " + rule.path.trim());
        hasContent = true;
      } else {
        lines.push("Disallow: " + rule.path.trim());
        hasContent = true;
      }
    });

    // Crawl-delay
    if (state.crawlDelay && parseInt(state.crawlDelay, 10) > 0) {
      lines.push("Crawl-delay: " + parseInt(state.crawlDelay, 10));
    }

    // Sitemap (outside user-agent group, at end)
    if (state.sitemap && state.sitemap.trim()) {
      lines.push("");
      lines.push("Sitemap: " + state.sitemap.trim());
    }

    return lines.join("\n");
  }

  /* ---------- Highlight ---------- */
  function highlight(code) {
    var escaped = escapeHtml(code);
    // Comments
    escaped = escaped.replace(/(#[^\n]*)/g, '<span class="comment">$1</span>');
    // Directives (User-agent, Allow, Disallow, Sitemap, Crawl-delay)
    escaped = escaped.replace(/^(User-agent|Allow|Disallow|Sitemap|Crawl-delay):/gm, '<span class="directive">$1:</span>');
    // Values after directive
    escaped = escaped.replace(/(<span class="directive">[^<]+<\/span>\s*)([^\n<]+)/g, '$1<span class="value">$2</span>');
    return escaped;
  }

  /* ============================================================
     VALIDATION
     ============================================================ */
  function validate() {
    var issues = [];

    // No user-agents
    if (!state.userAgents.length) {
      issues.push({ level: "error", text: "কোনো User-agent নেই — কমপক্ষে একটি নির্বাচন করুন" });
    }

    // No rules
    var validRules = state.rules.filter(function (r) { return r.path.trim().length > 0; });
    if (!validRules.length) {
      issues.push({ level: "warning", text: "কোনো Allow/Disallow নিয়ম নেই" });
    }

    // Empty path
    state.rules.forEach(function (r) {
      if (r.path.trim() && r.path.trim()[0] !== "/") {
        issues.push({ level: "warning", text: "নিয়ম \"" + r.path + "\" — স্ল্যাশ (/) দিয়ে শুরু করুন" });
      }
    });

    // Block-all check
    var blockAll = validRules.some(function (r) { return r.type === "disallow" && r.path.trim() === "/"; });
    if (blockAll) {
      issues.push({ level: "error", text: "সব কনটেন্ট ব্লকড (Disallow: /) — সাইট সার্চে আসবে না!" });
    }

    // Sitemap URL
    if (state.sitemap && !/^https?:\/\//i.test(state.sitemap)) {
      issues.push({ level: "warning", text: "Sitemap URL http:// বা https:// দিয়ে শুরু করুন" });
    }

    // Sitemap missing
    if (!state.sitemap || !state.sitemap.trim()) {
      issues.push({ level: "warning", text: "Sitemap যোগ করা হয়নি — দ্রুত ইনডেক্সের জন্য সুপারিশকৃত" });
    }

    // Search block warning
    var blocksSearch = validRules.some(function (r) { return r.type === "disallow" && r.path.trim() === "/search"; });
    if (blocksSearch) {
      issues.push({ level: "ok", text: "সার্চ পেজ ব্লক করা হয়েছে (ভালো)" });
    }

    // Update validation UI
    var errors = issues.filter(function (i) { return i.level === "error"; });
    var warnings = issues.filter(function (i) { return i.level === "warning"; });

    validation.className = "rb-validation";
    var icon = "#rb-i-check-circle";

    if (errors.length) {
      validation.classList.add("error");
      icon = "#rb-i-x-circle";
      statusEl.className = "rb-output-status error";
      statusText.textContent = "Error";
    } else if (warnings.length) {
      validation.classList.add("warning");
      icon = "#rb-i-info";
      statusEl.className = "rb-output-status warning";
      statusText.textContent = "Warning";
    } else {
      validation.classList.add("valid");
      icon = "#rb-i-check-circle";
      statusEl.className = "rb-output-status valid";
      statusText.textContent = "Valid";
    }

    validation.innerHTML = '<svg class="rb-i" viewBox="0 0 24 24"><use href="' + icon + '"/></svg><div id="rbValidationText"></div>';

    var textEl = validation.querySelector("#rbValidationText");
    if (errors.length) {
      textEl.innerHTML = "<strong>ত্রুটি:</strong> " + errors[0].text;
    } else if (warnings.length) {
      textEl.innerHTML = "<strong>সতর্কতা:</strong> " + warnings[0].text;
    } else {
      textEl.innerHTML = "<strong>সব ঠিক আছে!</strong> আপনার robots.txt ফাইল বৈধ।";
    }
  }

  /* ============================================================
     UPDATE
     ============================================================ */
  function update() {
    var code = generate();
    codeEl.innerHTML = highlight(code);
    validate();
  }

  /* ============================================================
     UA TOGGLE
     ============================================================ */
  uaChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var ua = chip.getAttribute("data-ua");
      var idx = state.userAgents.indexOf(ua);
      if (idx === -1) {
        state.userAgents.push(ua);
        chip.classList.add("is-on");
      } else {
        // Prevent removing last one
        if (state.userAgents.length === 1) {
          showToast("⚠ কমপক্ষে একটি User-agent থাকতে হবে");
          return;
        }
        state.userAgents.splice(idx, 1);
        chip.classList.remove("is-on");
      }
      uaCount.textContent = state.userAgents.length + "টি নির্বাচিত";
      update();
    });
  });

  /* ============================================================
     ADD/REMOVE RULES
     ============================================================ */
  addAllowBtn.addEventListener("click", function () {
    state.rules.push({ type: "allow", path: "" });
    renderRules();
    update();
    // Focus the new input
    var inputs = ruleList.querySelectorAll("input");
    if (inputs.length) inputs[inputs.length - 1].focus();
  });

  addDisallowBtn.addEventListener("click", function () {
    state.rules.push({ type: "disallow", path: "" });
    renderRules();
    update();
    var inputs = ruleList.querySelectorAll("input");
    if (inputs.length) inputs[inputs.length - 1].focus();
  });

  /* ============================================================
     SITEMAP / CRAWL
     ============================================================ */
  sitemapInput.addEventListener("input", function () {
    state.sitemap = this.value;
    update();
  });

  crawlInput.addEventListener("input", function () {
    state.crawlDelay = this.value;
    update();
  });

  /* ============================================================
     PRESETS
     ============================================================ */
  var PRESETS = {
    custom: {
      userAgents: ["*"],
      rules: [
        { type: "allow", path: "/" },
        { type: "disallow", path: "/search" },
        { type: "disallow", path: "/label/" }
      ],
      sitemap: "",
      crawlDelay: ""
    },
    blogger: {
      userAgents: ["*"],
      rules: [
        { type: "allow", path: "/" },
        { type: "disallow", path: "/search" },
        { type: "disallow", path: "/label/" }
      ],
      sitemap: "",
      crawlDelay: ""
    },
    wordpress: {
      userAgents: ["*"],
      rules: [
        { type: "allow", path: "/" },
        { type: "disallow", path: "/wp-admin/" },
        { type: "disallow", path: "/wp-includes/" },
        { type: "disallow", path: "/wp-content/plugins/" },
        { type: "allow", path: "/wp-admin/admin-ajax.php" }
      ],
      sitemap: "",
      crawlDelay: ""
    },
    shopify: {
      userAgents: ["*"],
      rules: [
        { type: "allow", path: "/" },
        { type: "disallow", path: "/admin" },
        { type: "disallow", path: "/cart" },
        { type: "disallow", path: "/orders" },
        { type: "disallow", path: "/checkout" },
        { type: "disallow", path: "/account" }
      ],
      sitemap: "",
      crawlDelay: ""
    },
    "allow-all": {
      userAgents: ["*"],
      rules: [
        { type: "allow", path: "/" }
      ],
      sitemap: "",
      crawlDelay: ""
    },
    "block-all": {
      userAgents: ["*"],
      rules: [
        { type: "disallow", path: "/" }
      ],
      sitemap: "",
      crawlDelay: ""
    }
  };

  presets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      presets.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");

      var key = btn.getAttribute("data-preset");
      var preset = PRESETS[key];
      if (!preset) return;

      // Deep clone
      state.userAgents = preset.userAgents.slice();
      state.rules = preset.rules.map(function (r) {
        return { type: r.type, path: r.path };
      });
      state.sitemap = preset.sitemap;
      state.crawlDelay = preset.crawlDelay;

      // Update UI
      sitemapInput.value = preset.sitemap;
      crawlInput.value = preset.crawlDelay;

      // Update UA chips
      uaChips.forEach(function (chip) {
        var ua = chip.getAttribute("data-ua");
        chip.classList.toggle("is-on", state.userAgents.indexOf(ua) !== -1);
      });
      uaCount.textContent = state.userAgents.length + "টি নির্বাচিত";

      renderRules();
      update();

      var presetNames = {
        custom: "কাস্টম",
        blogger: "Blogger",
        wordpress: "WordPress",
        shopify: "Shopify",
        "allow-all": "সব খোলা",
        "block-all": "সব বন্ধ"
      };
      showToast("✓ " + (presetNames[key] || key) + " প্রিসেট লোড হয়েছে");
    });
  });

  /* ============================================================
     RESET
     ============================================================ */
  resetBtn.addEventListener("click", function () {
    state = {
      userAgents: ["*"],
      rules: [
        { type: "allow", path: "/" },
        { type: "disallow", path: "/search" },
        { type: "disallow", path: "/label/" }
      ],
      sitemap: "",
      crawlDelay: ""
    };

    sitemapInput.value = "";
    crawlInput.value = "";

    uaChips.forEach(function (chip) {
      var ua = chip.getAttribute("data-ua");
      chip.classList.toggle("is-on", ua === "*");
    });
    uaCount.textContent = "1টি নির্বাচিত";

    presets.forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-preset") === "custom");
    });

    renderRules();
    update();
    showToast("✓ রিসেট হয়েছে");
  });

  /* ============================================================
     COPY & DOWNLOAD
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

  copyBtn.addEventListener("click", function () {
    var code = generate();
    var done = function () {
      showToast("✓ সব কপি হয়েছে");
      var orig = copyBtn.innerHTML;
      copyBtn.classList.add("copied");
      copyBtn.innerHTML = '<svg class="rb-i" viewBox="0 0 24 24"><use href="#rb-i-check"/></svg> কপি হয়েছে';
      setTimeout(function () {
        copyBtn.classList.remove("copied");
        copyBtn.innerHTML = orig;
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(function () {
        fallbackCopy(code); done();
      });
    } else {
      fallbackCopy(code); done();
    }
  });

  downloadBtn.addEventListener("click", function () {
    var code = generate();
    var blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    showToast("✓ robots.txt ডাউনলোড হয়েছে");
  });

  /* ---------- Init ---------- */
  renderRules();
  update();

})();
