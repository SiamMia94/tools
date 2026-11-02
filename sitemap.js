(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".sm-gen")) return;
    document.body.classList.add("sm-full");
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
  var presets         = document.querySelectorAll(".sm-preset");
  var bulkInput       = document.getElementById("smBulk");
  var bulkAddBtn      = document.getElementById("smBulkAdd");
  var bulkClearBtn    = document.getElementById("smBulkClear");
  var addUrlBtn       = document.getElementById("smAddUrl");
  var urlList         = document.getElementById("smUrlList");
  var urlCount        = document.getElementById("smUrlCount");
  var defaultPriority = document.getElementById("smDefaultPriority");
  var defaultFreq     = document.getElementById("smDefaultFreq");
  var imageSupport    = document.getElementById("smImageSupport");
  var autoLastmod     = document.getElementById("smAutoLastmod");
  var sampleBtn       = document.getElementById("smSampleBtn");
  var resetBtn        = document.getElementById("smResetBtn");
  var codeEl          = document.getElementById("smCode");
  var copyBtn         = document.getElementById("smCopyBtn");
  var downloadBtn     = document.getElementById("smDownloadBtn");
  var validation      = document.getElementById("smValidation");
  var validationText  = document.getElementById("smValidationText");
  var statUrls        = document.getElementById("smStatUrls");
  var statSizeText    = document.getElementById("smStatSizeText");
  var toast           = document.getElementById("smToast");
  var toastMsg        = document.getElementById("smToastMsg");

  if (!urlList) return;

  /* ---------- State ---------- */
  var state = {
    urls: []
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

  function escapeXml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (m) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
    });
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function isValidUrl(url) {
    if (!url || !url.trim()) return false;
    try {
      var u = new URL(url.indexOf("http") === 0 ? url : "https://" + url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  function getTodayDate() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  /* ============================================================
     RENDER URL LIST
     ============================================================ */
  function renderUrls() {
    urlList.innerHTML = "";
    urlCount.textContent = state.urls.length + "টি URL";

    if (!state.urls.length) {
      var empty = document.createElement("div");
      empty.style.cssText = "padding: 1.25rem; text-align: center; color: var(--sm-ink-dim); font-size: 0.78rem; font-family: var(--sm-font-bangla); background: var(--sm-surface-alt); border-radius: 8px;";
      empty.textContent = "এখনো কোনো URL যোগ করা হয়নি";
      urlList.appendChild(empty);
      return;
    }

    state.urls.forEach(function (item, idx) {
      var el = document.createElement("div");
      el.className = "sm-url-item" + (isValidUrl(item.url) ? "" : " is-invalid");

      el.innerHTML =
        '<span class="sm-url-num">' + (idx + 1) + '</span>' +
        '<input type="text" class="sm-url-input" value="' + escapeHtml(item.url) + '" placeholder="https://example.com/page" data-idx="' + idx + '">' +
        '<div class="sm-url-meta">' +
          '<input type="number" class="sm-url-priority" value="' + item.priority + '" min="0" max="1" step="0.1" title="Priority" data-idx="' + idx + '">' +
          '<select class="sm-url-freq" title="Changefreq" data-idx="' + idx + '">' +
            '<option value="always"' + (item.freq === "always" ? " selected" : "") + '>Always</option>' +
            '<option value="hourly"' + (item.freq === "hourly" ? " selected" : "") + '>Hourly</option>' +
            '<option value="daily"' + (item.freq === "daily" ? " selected" : "") + '>Daily</option>' +
            '<option value="weekly"' + (item.freq === "weekly" ? " selected" : "") + '>Weekly</option>' +
            '<option value="monthly"' + (item.freq === "monthly" ? " selected" : "") + '>Monthly</option>' +
            '<option value="yearly"' + (item.freq === "yearly" ? " selected" : "") + '>Yearly</option>' +
            '<option value="never"' + (item.freq === "never" ? " selected" : "") + '>Never</option>' +
          '</select>' +
          '<button type="button" class="sm-url-del" data-idx="' + idx + '" title="মুছুন">' +
            '<svg class="sm-i" viewBox="0 0 24 24"><use href="#sm-i-trash"/></svg>' +
          '</button>' +
        '</div>';

      // Events
      var urlInput = el.querySelector(".sm-url-input");
      urlInput.addEventListener("input", function () {
        state.urls[idx].url = this.value;
        el.classList.toggle("is-invalid", !isValidUrl(this.value));
        update();
      });

      var prioInput = el.querySelector(".sm-url-priority");
      prioInput.addEventListener("change", function () {
        var v = parseFloat(this.value);
        if (isNaN(v) || v < 0) v = 0;
        if (v > 1) v = 1;
        this.value = v.toFixed(1);
        state.urls[idx].priority = parseFloat(this.value);
        update();
      });

      var freqSelect = el.querySelector(".sm-url-freq");
      freqSelect.addEventListener("change", function () {
        state.urls[idx].freq = this.value;
        update();
      });

      el.querySelector(".sm-url-del").addEventListener("click", function () {
        state.urls.splice(idx, 1);
        renderUrls();
        update();
      });

      urlList.appendChild(el);
    });
  }

  /* ============================================================
     GENERATE XML
     ============================================================ */
  function generateXML() {
    var validUrls = state.urls.filter(function (item) {
      return isValidUrl(item.url);
    });

    var lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');

    if (imageSupport.checked) {
      lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      lines.push('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');
    } else {
      lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    }

    var today = getTodayDate();

    validUrls.forEach(function (item) {
      var url = item.url.indexOf("http") === 0 ? item.url : "https://" + item.url;
      lines.push("  <url>");
      lines.push("    <loc>" + escapeXml(url) + "</loc>");

      if (autoLastmod.checked) {
        lines.push("    <lastmod>" + today + "</lastmod>");
      }

      if (item.freq) {
        lines.push("    <changefreq>" + item.freq + "</changefreq>");
      }

      if (item.priority !== undefined && item.priority !== null) {
        lines.push("    <priority>" + parseFloat(item.priority).toFixed(1) + "</priority>");
      }

      lines.push("  </url>");
    });

    lines.push("</urlset>");
    return lines.join("\n");
  }

  /* ---------- Highlight XML ---------- */
  function highlightXml(code) {
    var escaped = escapeHtml(code);
    // Comments
    escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="comment">$1</span>');
    // XML declaration
    escaped = escaped.replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span class="tag">$1</span>');
    // Tags
    escaped = escaped.replace(/(&lt;\/?)([\w:]+)([^&]*?)(\/?&gt;)/g, function (m, open, name, attrs, close) {
      var attrHighlighted = attrs.replace(/([\w:]+)=(&quot;[^&]*&quot;)/g, '<span class="attr">$1</span>=<span class="string">$2</span>');
      return '<span class="punct">' + open + '</span><span class="tag">' + name + '</span>' + attrHighlighted + '<span class="punct">' + close + '</span>';
    });
    // Values between tags
    escaped = escaped.replace(/(&gt;)([^<&\s][^<&]*)(&lt;)/g, function (m, o, val, c) {
      if (val.indexOf('<span') !== -1) return m;
      return '<span class="punct">' + o + '</span><span class="string">' + val + '</span><span class="punct">' + c + '</span>';
    });
    return escaped;
  }

  /* ============================================================
     VALIDATION
     ============================================================ */
  function validate() {
    var validUrls = state.urls.filter(function (item) {
      return isValidUrl(item.url);
    });
    var invalidUrls = state.urls.filter(function (item) {
      return item.url.trim() && !isValidUrl(item.url);
    });

    var issues = [];

    if (!state.urls.length) {
      issues.push({ level: "error", text: "কোনো URL নেই — কমপক্ষে একটি URL যোগ করুন" });
    } else if (!validUrls.length) {
      issues.push({ level: "error", text: "কোনো বৈধ URL নেই — URL http:// বা https:// দিয়ে শুরু করুন" });
    }

    if (invalidUrls.length) {
      issues.push({ level: "warning", text: invalidUrls.length + "টি অবৈধ URL বাদ দেওয়া হবে" });
    }

    if (validUrls.length > 50000) {
      issues.push({ level: "error", text: "সর্বোচ্চ ৫০,০০০ URL সমর্থিত" });
    }

    // Duplicate check
    var seen = {};
    var duplicates = 0;
    validUrls.forEach(function (item) {
      var key = item.url.trim().toLowerCase();
      if (seen[key]) duplicates++;
      seen[key] = true;
    });
    if (duplicates > 0) {
      issues.push({ level: "warning", text: duplicates + "টি ডুপ্লিকেট URL আছে" });
    }

    // Update stats
    statUrls.textContent = validUrls.length;
    var xml = generateXML();
    statSizeText.textContent = formatBytes(new Blob([xml]).size);

    // Update validation UI
    var errors = issues.filter(function (i) { return i.level === "error"; });
    var warnings = issues.filter(function (i) { return i.level === "warning"; });

    validation.className = "sm-validation";
    var icon = "#sm-i-check-circle";

    if (errors.length) {
      validation.classList.add("error");
      icon = "#sm-i-x-circle";
    } else if (warnings.length) {
      validation.classList.add("warning");
      icon = "#sm-i-info";
    } else {
      validation.classList.add("valid");
      icon = "#sm-i-check-circle";
    }

    validation.innerHTML = '<svg class="sm-i" viewBox="0 0 24 24"><use href="' + icon + '"/></svg><div id="smValidationText"></div>';

    var textEl = validation.querySelector("#smValidationText");
    if (errors.length) {
      textEl.innerHTML = "<strong>ত্রুটি:</strong> " + errors[0].text;
    } else if (warnings.length) {
      textEl.innerHTML = "<strong>সতর্কতা:</strong> " + warnings[0].text;
    } else {
      textEl.innerHTML = "<strong>সব ঠিক আছে!</strong> " + validUrls.length + "টি URL সহ বৈধ sitemap.xml";
    }
  }

  /* ============================================================
     UPDATE
     ============================================================ */
  function update() {
    var xml = generateXML();
    codeEl.innerHTML = highlightXml(xml);
    validate();
  }

  /* ============================================================
     ADD URLS
     ============================================================ */
  bulkAddBtn.addEventListener("click", function () {
    var lines = bulkInput.value.split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
    if (!lines.length) {
      showToast("⚠ কোনো URL লিখুন");
      return;
    }

    var defaultPrio = parseFloat(defaultPriority.value) || 0.5;
    var defaultFr = defaultFreq.value || "weekly";

    var added = 0;
    lines.forEach(function (line) {
      var url = line.indexOf("http") === 0 ? line : "https://" + line;
      state.urls.push({
        url: url,
        priority: defaultPrio,
        freq: defaultFr
      });
      added++;
    });

    bulkInput.value = "";
    renderUrls();
    update();
    showToast("✓ " + added + "টি URL যোগ হয়েছে");
  });

  bulkClearBtn.addEventListener("click", function () {
    bulkInput.value = "";
    bulkInput.focus();
  });

  addUrlBtn.addEventListener("click", function () {
    var defaultPrio = parseFloat(defaultPriority.value) || 0.5;
    var defaultFr = defaultFreq.value || "weekly";
    state.urls.push({
      url: "",
      priority: defaultPrio,
      freq: defaultFr
    });
    renderUrls();
    update();

    // Focus the new input
    setTimeout(function () {
      var inputs = urlList.querySelectorAll(".sm-url-input");
      if (inputs.length) inputs[inputs.length - 1].focus();
    }, 50);
  });

  /* ============================================================
     PRESETS
     ============================================================ */
  var PRESETS = {
    standard: function () {
      state.urls = [
        { url: "https://example.com/", priority: 1.0, freq: "daily" },
        { url: "https://example.com/about", priority: 0.6, freq: "monthly" },
        { url: "https://example.com/contact", priority: 0.6, freq: "monthly" },
        { url: "https://example.com/blog", priority: 0.8, freq: "weekly" },
        { url: "https://example.com/blog/post-1", priority: 0.7, freq: "weekly" }
      ];
    },
    blogger: function () {
      state.urls = [
        { url: "https://yourblog.blogspot.com/", priority: 1.0, freq: "daily" },
        { url: "https://yourblog.blogspot.com/p/about.html", priority: 0.6, freq: "monthly" },
        { url: "https://yourblog.blogspot.com/p/contact.html", priority: 0.6, freq: "monthly" },
        { url: "https://yourblog.blogspot.com/p/privacy.html", priority: 0.4, freq: "yearly" }
      ];
    },
    wordpress: function () {
      state.urls = [
        { url: "https://yoursite.com/", priority: 1.0, freq: "daily" },
        { url: "https://yoursite.com/blog/", priority: 0.9, freq: "daily" },
        { url: "https://yoursite.com/shop/", priority: 0.8, freq: "weekly" },
        { url: "https://yoursite.com/about/", priority: 0.6, freq: "monthly" },
        { url: "https://yoursite.com/contact/", priority: 0.6, freq: "monthly" }
      ];
    },
    shopify: function () {
      state.urls = [
        { url: "https://yourshop.com/", priority: 1.0, freq: "daily" },
        { url: "https://yourshop.com/collections/all", priority: 0.9, freq: "daily" },
        { url: "https://yourshop.com/collections/new", priority: 0.8, freq: "daily" },
        { url: "https://yourshop.com/pages/about", priority: 0.6, freq: "monthly" },
        { url: "https://yourshop.com/blogs/news", priority: 0.7, freq: "weekly" }
      ];
    },
    news: function () {
      state.urls = [
        { url: "https://yoursite.com/", priority: 1.0, freq: "always" },
        { url: "https://yoursite.com/news", priority: 0.9, freq: "always" },
        { url: "https://yoursite.com/breaking", priority: 0.9, freq: "hourly" },
        { url: "https://yoursite.com/opinion", priority: 0.7, freq: "daily" }
      ];
    }
  };

  presets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      presets.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");

      var key = btn.getAttribute("data-preset");
      var fn = PRESETS[key];
      if (!fn) return;

      fn();
      renderUrls();
      update();

      var presetNames = {
        standard: "Standard",
        blogger: "Blogger",
        wordpress: "WordPress",
        shopify: "Shopify",
        news: "News"
      };
      showToast("✓ " + (presetNames[key] || key) + " প্রিসেট লোড হয়েছে");
    });
  });

  /* ============================================================
     SAMPLE / RESET
     ============================================================ */
  sampleBtn.addEventListener("click", function () {
    PRESETS.blogger();
    defaultPriority.value = "0.7";
    defaultFreq.value = "weekly";
    renderUrls();
    update();
    showToast("✓ Sample data লোড হয়েছে");
  });

  resetBtn.addEventListener("click", function () {
    state.urls = [];
    defaultPriority.value = "0.8";
    defaultFreq.value = "weekly";
    bulkInput.value = "";
    imageSupport.checked = false;
    autoLastmod.checked = true;

    presets.forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-preset") === "standard");
    });

    renderUrls();
    update();
    showToast("✓ রিসেট হয়েছে");
  });

  /* ============================================================
     SETTINGS CHANGES
     ============================================================ */
  imageSupport.addEventListener("change", update);
  autoLastmod.addEventListener("change", update);

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
    var code = generateXML();
    var done = function () {
      showToast("✓ সব কপি হয়েছে");
      var orig = copyBtn.innerHTML;
      copyBtn.classList.add("copied");
      copyBtn.innerHTML = '<svg class="sm-i" viewBox="0 0 24 24"><use href="#sm-i-check"/></svg> কপি হয়েছে';
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
    var code = generateXML();
    var blob = new Blob([code], { type: "application/xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    showToast("✓ sitemap.xml ডাউনলোড হয়েছে");
  });

  /* ---------- Init with sample ---------- */
  PRESETS.standard();
  renderUrls();
  update();

})();
