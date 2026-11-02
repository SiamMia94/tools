(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".meta-gen")) return;
    document.body.classList.add("mg-full");
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
  var elTitle      = document.getElementById("mgTitle");
  var elDesc       = document.getElementById("mgDesc");
  var elKeywords   = document.getElementById("mgKeywords");
  var elAuthor     = document.getElementById("mgAuthor");
  var elLanguage   = document.getElementById("mgLanguage");
  var elUrl        = document.getElementById("mgUrl");
  var elImage      = document.getElementById("mgImage");
  var elSiteName   = document.getElementById("mgSiteName");
  var elOgType     = document.getElementById("mgOgType");
  var elTwCard     = document.getElementById("mgTwCard");

  var titleCount   = document.getElementById("mgTitleCount");
  var descCount    = document.getElementById("mgDescCount");
  var keywordsCount= document.getElementById("mgKeywordsCount");

  var toggles      = document.querySelectorAll(".mg-toggle[data-toggle]");
  var sampleBtn    = document.getElementById("mgSampleBtn");
  var resetBtn     = document.getElementById("mgResetBtn");

  var codeEl       = document.getElementById("mgCode");
  var copyBtn      = document.getElementById("mgCopyBtn");
  var downloadBtn  = document.getElementById("mgDownloadBtn");

  var scoreEl      = document.getElementById("mgScore");
  var scoreText    = document.getElementById("mgScoreText");
  var checksList   = document.getElementById("mgChecksList");

  var googleTitle  = document.getElementById("mgGoogleTitle");
  var googleDesc   = document.getElementById("mgGoogleDesc");
  var googleUrl    = document.getElementById("mgGoogleUrl");
  var googleSite   = document.getElementById("mgGoogleSiteName");
  var googleFav    = document.getElementById("mgGoogleFavicon");

  var fbImg        = document.getElementById("mgFbImg");
  var fbDomain     = document.getElementById("mgFbDomain");
  var fbTitle      = document.getElementById("mgFbTitle");
  var fbDesc       = document.getElementById("mgFbDesc");

  var twImg        = document.getElementById("mgTwImg");
  var twDomain     = document.getElementById("mgTwDomain");
  var twTitle      = document.getElementById("mgTwTitle");
  var twDesc       = document.getElementById("mgTwDesc");

  var tabs         = document.querySelectorAll(".mg-preview-tab");
  var panes        = document.querySelectorAll(".mg-preview-pane");

  var toast        = document.getElementById("mgToast");
  var toastMsg     = document.getElementById("mgToastMsg");

  if (!elTitle) return;

  /* ---------- State ---------- */
  var state = {
    viewport: true,
    robots: true,
    charset: true,
    canonical: true,
    themeColor: true,
    og: true,
    twitter: true,
    schema: true
  };

  var THEME_COLOR = "#3b82f6";

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

  function getDomain(url) {
    if (!url) return "";
    try {
      var u = new URL(url.indexOf("http") === 0 ? url : "https://" + url);
      return u.hostname.replace(/^www\./, "");
    } catch (e) {
      return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    }
  }

  function getFullUrl(url) {
    if (!url) return "";
    if (url.indexOf("http") === 0) return url;
    return "https://" + url;
  }

  /* ============================================================
     GENERATE META TAGS
     ============================================================ */
  function generateTags() {
    var title = elTitle.value.trim();
    var desc = elDesc.value.trim();
    var keywords = elKeywords.value.trim();
    var author = elAuthor.value.trim();
    var lang = elLanguage.value;
    var url = getFullUrl(elUrl.value.trim());
    var image = getFullUrl(elImage.value.trim());
    var siteName = elSiteName.value.trim() || title;
    var ogType = elOgType.value;
    var twCard = elTwCard.value;

    var lines = [];

    // Charset
    if (state.charset) {
      lines.push("<!-- Primary Meta Tags -->");
      lines.push('<meta charset="UTF-8">');
    }

    // Viewport
    if (state.viewport) {
      lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }

    // Title (also add if not charset — fresh start)
    if (title) {
      if (!state.charset) lines.push("<!-- Primary Meta Tags -->");
      lines.push('<title>' + escapeHtml(title) + '</title>');
      lines.push('<meta name="title" content="' + escapeHtml(title) + '">');
    }

    // Description
    if (desc) {
      lines.push('<meta name="description" content="' + escapeHtml(desc) + '">');
    }

    // Keywords
    if (keywords) {
      lines.push('<meta name="keywords" content="' + escapeHtml(keywords) + '">');
    }

    // Author
    if (author) {
      lines.push('<meta name="author" content="' + escapeHtml(author) + '">');
    }

    // Language
    if (lang) {
      lines.push('<meta http-equiv="content-language" content="' + escapeHtml(lang) + '">');
    }

    // Robots
    if (state.robots) {
      lines.push('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">');
    }

    // Theme color
    if (state.themeColor) {
      lines.push('<meta name="theme-color" content="' + THEME_COLOR + '">');
    }

    // Canonical
    if (state.canonical && url) {
      lines.push('<link rel="canonical" href="' + escapeHtml(url) + '">');
    }

    // Open Graph
    if (state.og && title) {
      lines.push("");
      lines.push("<!-- Open Graph / Facebook -->");
      lines.push('<meta property="og:type" content="' + escapeHtml(ogType) + '">');
      if (url) lines.push('<meta property="og:url" content="' + escapeHtml(url) + '">');
      lines.push('<meta property="og:title" content="' + escapeHtml(title) + '">');
      if (desc) lines.push('<meta property="og:description" content="' + escapeHtml(desc) + '">');
      if (image) lines.push('<meta property="og:image" content="' + escapeHtml(image) + '">');
      if (image) lines.push('<meta property="og:image:width" content="1200">');
      if (image) lines.push('<meta property="og:image:height" content="630">');
      if (siteName) lines.push('<meta property="og:site_name" content="' + escapeHtml(siteName) + '">');
      if (lang) lines.push('<meta property="og:locale" content="' + escapeHtml(lang) + '">');
    }

    // Twitter
    if (state.twitter && title) {
      lines.push("");
      lines.push("<!-- Twitter -->");
      lines.push('<meta property="twitter:card" content="' + escapeHtml(twCard) + '">');
      if (url) lines.push('<meta property="twitter:url" content="' + escapeHtml(url) + '">');
      lines.push('<meta property="twitter:title" content="' + escapeHtml(title) + '">');
      if (desc) lines.push('<meta property="twitter:description" content="' + escapeHtml(desc) + '">');
      if (image) lines.push('<meta property="twitter:image" content="' + escapeHtml(image) + '">');
    }

    // Schema
    if (state.schema && title) {
      lines.push("");
      lines.push("<!-- Schema.org Structured Data -->");
      var schema = {
        "@context": "https://schema.org",
        "@type": ogType === "article" ? "Article" :
                 ogType === "product" ? "Product" :
                 ogType === "profile" ? "ProfilePage" : "WebPage",
        "name": title,
        "description": desc || "",
        "url": url || "",
        "inLanguage": lang || "en"
      };
      if (image) schema.image = image;
      if (author) schema.author = { "@type": "Person", "name": author };
      lines.push('<script type="application/ld+json">');
      lines.push(JSON.stringify(schema, null, 2));
      lines.push("<\/script>");
    }

    return lines.join("\n");
  }

  /* ---------- Syntax highlight for code ---------- */
  function highlightCode(code) {
    var escaped = escapeHtml(code);
    // Simple syntax highlight
    escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="comment">$1</span>');
    escaped = escaped.replace(/(&lt;\/?)([\w:]+)/g, '$1<span class="tag">$2</span>');
    escaped = escaped.replace(/([\w:-]+)=(&quot;[^&]*&quot;)/g, '<span class="attr">$1</span>=<span class="string">$2</span>');
    return escaped;
  }

  /* ============================================================
     UPDATE PREVIEWS
     ============================================================ */
  function updatePreviews() {
    var title = elTitle.value.trim();
    var desc = elDesc.value.trim();
    var url = elUrl.value.trim();
    var image = elImage.value.trim();
    var siteName = elSiteName.value.trim() || title || "Your Site";
    var domain = getDomain(url) || "example.com";

    // Google
    googleTitle.textContent = title || "";
    googleDesc.textContent = desc || "";
    googleUrl.textContent = url ? getFullUrl(url) : "https://example.com";
    googleSite.textContent = siteName;
    googleFav.textContent = (siteName.charAt(0) || "V").toUpperCase();

    // Facebook
    fbTitle.textContent = title || "";
    fbDesc.textContent = desc || "";
    fbDomain.textContent = domain.toUpperCase();
    if (image) {
      fbImg.innerHTML = '<img src="' + escapeHtml(image) + '" alt="OG image" onerror="this.parentNode.innerHTML=\'<div class=\\\'mg-fb-placeholder\\\'><svg class=\\\'mg-i\\\'><use href=\\\'#mg-i-image\\\'/></svg><span>Image failed</span></div>\'">';
    } else {
      fbImg.innerHTML = '<div class="mg-fb-placeholder"><svg class="mg-i"><use href="#mg-i-image"/></svg><span>No image</span></div>';
    }

    // Twitter
    twTitle.textContent = title || "";
    twDesc.textContent = desc || "";
    twDomain.textContent = domain;
    if (image) {
      twImg.innerHTML = '<img src="' + escapeHtml(image) + '" alt="Twitter image" onerror="this.parentNode.innerHTML=\'<div class=\\\'mg-fb-placeholder\\\'><svg class=\\\'mg-i\\\'><use href=\\\'#mg-i-image\\\'/></svg><span>Image failed</span></div>\'">';
    } else {
      twImg.innerHTML = '<div class="mg-fb-placeholder"><svg class="mg-i"><use href="#mg-i-image"/></svg><span>No image</span></div>';
    }

    // Charset hint colors
    updateCharHint(titleCount, title.length, 60, 100);
    updateCharHint(descCount, desc.length, 160, 250);
    var kwCount = keywordsCountFor(elKeywords.value);
    keywordsCount.textContent = kwCount + " কীওয়ার্ড";
  }

  function keywordsCountFor(val) {
    if (!val.trim()) return 0;
    return val.split(",").map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 0; }).length;
  }

  function updateCharHint(el, current, ideal, max) {
    el.textContent = current + " / " + ideal;
    el.classList.remove("good", "warn", "bad");
    if (current === 0) {
      el.classList.add("bad");
    } else if (current > max) {
      el.classList.add("bad");
    } else if (current > ideal) {
      el.classList.add("warn");
    } else if (current >= ideal * 0.5) {
      el.classList.add("good");
    } else {
      el.classList.add("warn");
    }
  }

  /* ============================================================
     SEO SCORE & CHECKLIST
     ============================================================ */
  function updateSEO() {
    var title = elTitle.value.trim();
    var desc = elDesc.value.trim();
    var keywords = elKeywords.value.trim();
    var url = elUrl.value.trim();
    var image = elImage.value.trim();
    var author = elAuthor.value.trim();

    var checks = [];
    var score = 0;

    // Title checks (30 pts)
    if (title.length >= 30 && title.length <= 60) {
      checks.push({ pass: true, text: "টাইটেল আদর্শ দৈর্ঘ্যে (" + title.length + " অক্ষর)" });
      score += 15;
    } else if (title.length > 0) {
      checks.push({ pass: false, warn: title.length < 30, text: "টাইটেল " + (title.length < 30 ? "খুব ছোট" : "খুব বড়") + " (" + title.length + "/60 অক্ষর)" });
      score += 5;
    } else {
      checks.push({ pass: false, text: "টাইটেল যোগ করুন" });
    }

    if (title && !/^[a-z]/.test(title[0])) {
      score += 5;
    }

    if (title && (title.indexOf("|") > -1 || title.indexOf("—") > -1 || title.indexOf("-") > -1)) {
      checks.push({ pass: true, text: "টাইটেলে ব্র্যান্ড সেপারেটর আছে" });
      score += 10;
    } else if (title) {
      checks.push({ pass: false, warn: true, text: "টাইটেলে ব্র্যান্ড সেপারেটর যোগ করুন (| বা —)" });
    }

    // Description checks (30 pts)
    if (desc.length >= 120 && desc.length <= 160) {
      checks.push({ pass: true, text: "ডেসক্রিপশন আদর্শ দৈর্ঘ্যে (" + desc.length + " অক্ষর)" });
      score += 20;
    } else if (desc.length > 0) {
      checks.push({ pass: false, warn: desc.length < 120, text: "ডেসক্রিপশন " + (desc.length < 120 ? "খুব ছোট" : "খুব বড়") + " (" + desc.length + "/160 অক্ষর)" });
      score += 8;
    } else {
      checks.push({ pass: false, text: "মেটা ডেসক্রিপশন যোগ করুন" });
    }

    if (desc) {
      var hasCTA = /(এখন|আজ|দেখুন|কিনুন|জানুন|শিখুন|ডাউনলোড|click|learn|buy|discover|try|download|free|ফ্রি)/i.test(desc);
      if (hasCTA) {
        checks.push({ pass: true, text: "ডেসক্রিপশনে কল-টু-অ্যাকশন আছে" });
        score += 10;
      } else {
        checks.push({ pass: false, warn: true, text: "ডেসক্রিপশনে কল-টু-অ্যাকশন যোগ করুন" });
      }
    }

    // Keywords (10 pts)
    var kwList = keywords.split(",").map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 0; });
    if (kwList.length >= 3 && kwList.length <= 10) {
      checks.push({ pass: true, text: "কীওয়ার্ড সংখ্যা আদর্শ (" + kwList.length + ")" });
      score += 10;
    } else if (kwList.length > 0) {
      checks.push({ pass: false, warn: true, text: "কীওয়ার্ড " + (kwList.length < 3 ? "খুব কম" : "খুব বেশি") + " (" + kwList.length + ")" });
      score += 4;
    } else {
      checks.push({ pass: false, warn: true, text: "কীওয়ার্ড যোগ করুন (ঐচ্ছিক)" });
    }

    // URL (10 pts)
    if (url) {
      checks.push({ pass: true, text: "URL যোগ করা আছে" });
      score += 5;
      if (url.indexOf("https://") === 0) {
        score += 5;
      } else {
        checks.push({ pass: false, warn: true, text: "URL-এ https:// যোগ করুন" });
      }
    } else {
      checks.push({ pass: false, text: "পেজ URL যোগ করুন" });
    }

    // Image (10 pts)
    if (image) {
      checks.push({ pass: true, text: "OG Image যোগ করা আছে" });
      score += 10;
    } else {
      checks.push({ pass: false, warn: true, text: "OG Image যোগ করুন (সোশ্যাল শেয়ারের জন্য)" });
    }

    // Author (5 pts)
    if (author) {
      checks.push({ pass: true, text: "লেখকের নাম যোগ করা আছে" });
      score += 5;
    } else {
      checks.push({ pass: false, warn: true, text: "লেখকের নাম যোগ করুন (E-E-A-T এর জন্য)" });
    }

    score = Math.min(score, 100);

    // Update score UI
    scoreText.textContent = score;
    scoreEl.classList.remove("excellent", "good", "fair", "poor");
    if (score >= 85) scoreEl.classList.add("excellent");
    else if (score >= 65) scoreEl.classList.add("good");
    else if (score >= 40) scoreEl.classList.add("fair");
    else scoreEl.classList.add("poor");

    // Update checklist
    checksList.innerHTML = "";
    checks.forEach(function(c) {
      var div = document.createElement("div");
      div.className = "mg-check " + (c.pass ? "pass" : (c.warn ? "warn" : "fail"));
      var icon = c.pass ? "#mg-i-check" : (c.warn ? "#mg-i-x" : "#mg-i-x");
      div.innerHTML = '<span class="mg-check-icon"><svg class="mg-i" viewBox="0 0 24 24"><use href="' + icon + '"/></svg></span><span class="mg-check-text">' + escapeHtml(c.text) + '</span>';
      checksList.appendChild(div);
    });
  }

  /* ============================================================
     MASTER UPDATE
     ============================================================ */
  function update() {
    updatePreviews();
    updateSEO();
    var code = generateTags();
    codeEl.innerHTML = highlightCode(code);
  }

  /* ============================================================
     EVENT LISTENERS
     ============================================================ */
  var allInputs = [elTitle, elDesc, elKeywords, elAuthor, elUrl, elImage, elSiteName];
  allInputs.forEach(function(el) {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });
  [elLanguage, elOgType, elTwCard].forEach(function(el) {
    el.addEventListener("change", update);
  });

  /* Toggles */
  toggles.forEach(function(sw) {
    sw.addEventListener("click", function() {
      sw.classList.toggle("is-on");
      var key = sw.getAttribute("data-toggle");
      state[key] = sw.classList.contains("is-on");
      update();
    });
  });

  /* Tabs */
  tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
      tabs.forEach(function(t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      var id = tab.getAttribute("data-tab");
      panes.forEach(function(p) {
        p.classList.toggle("is-active", p.getAttribute("data-pane") === id);
      });
    });
  });

  /* ============================================================
     SAMPLE / RESET
     ============================================================ */
  sampleBtn.addEventListener("click", function() {
    elTitle.value = "Tools APK48 — 30+ Free Online Tools for Everyone";
    elDesc.value = "Discover 24+ free online tools on Tools APK48. Flip text, generate QR codes, compress images, and more. 100% free, no sign-up required.";
    elKeywords.value = "tools apk48, free online tools, text tools, image tools, SEO tools, QR code";
    elAuthor.value = "Tools APK48";
    elLanguage.value = "en";
    elUrl.value = "https://apk48.com/tools";
    elImage.value = "https://apk48.com/og-image.jpg";
    elSiteName.value = "Tools APK48";
    elOgType.value = "website";
    elTwCard.value = "summary_large_image";
    update();
    showToast("✓ Sample data লোড হয়েছে");
  });

  resetBtn.addEventListener("click", function() {
    elTitle.value = "";
    elDesc.value = "";
    elKeywords.value = "";
    elAuthor.value = "";
    elLanguage.value = "bn";
    elUrl.value = "";
    elImage.value = "";
    elSiteName.value = "";
    elOgType.value = "website";
    elTwCard.value = "summary_large_image";
    update();
    showToast("✓ সব ফিল্ড মুছে ফেলা হয়েছে");
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

  copyBtn.addEventListener("click", function() {
    var code = generateTags();
    var done = function() {
      showToast("✓ সব ট্যাগ কপি হয়েছে");
      var origHtml = copyBtn.innerHTML;
      copyBtn.classList.add("copied");
      copyBtn.innerHTML = '<svg class="mg-i" viewBox="0 0 24 24"><use href="#mg-i-check"/></svg> কপি হয়েছে';
      setTimeout(function() {
        copyBtn.classList.remove("copied");
        copyBtn.innerHTML = origHtml;
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(function() {
        fallbackCopy(code); done();
      });
    } else {
      fallbackCopy(code); done();
    }
  });

  downloadBtn.addEventListener("click", function() {
    var code = generateTags();
    var html = '<!DOCTYPE html>\n<html lang="' + elLanguage.value + '">\n<head>\n' + code + '\n</head>\n<body>\n  <h1>' + escapeHtml(elTitle.value || "Your Page") + '</h1>\n</body>\n</html>';
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "meta-tags-" + Date.now() + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 3000);
    showToast("✓ HTML ফাইল ডাউনলোড হয়েছে");
  });

  /* ---------- Init ---------- */
  update();

})();
