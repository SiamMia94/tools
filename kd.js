(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".kd-gen")) return;
    document.body.classList.add("kd-full");
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
  var input         = document.getElementById("kdInput");
  var charCount     = document.getElementById("kdCharCount");
  var sampleBtn     = document.getElementById("kdSampleBtn");
  var pasteBtn      = document.getElementById("kdPasteBtn");
  var clearBtn      = document.getElementById("kdClearBtn");
  var toggles       = document.querySelectorAll(".kd-toggle[data-toggle]");
  var minLengthSel  = document.getElementById("kdMinLength");
  var checkInput    = document.getElementById("kdCheckInput");
  var checkResult   = document.getElementById("kdCheckResult");
  var wordsEl       = document.getElementById("kdWords");
  var uniqueEl      = document.getElementById("kdUnique");
  var charsEl       = document.getElementById("kdChars");
  var topDensityEl  = document.getElementById("kdTopDensity");
  var keywordList   = document.getElementById("kdKeywordList");
  var scoreBadge    = document.getElementById("kdScoreBadge");
  var scoreText     = document.getElementById("kdScoreText");
  var recList       = document.getElementById("kdRecList");
  var tabs          = document.querySelectorAll(".kd-tab");
  var toast         = document.getElementById("kdToast");
  var toastMsg      = document.getElementById("kdToastMsg");

  if (!input) return;

  /* ---------- State ---------- */
  var state = {
    stopwords: true,
    caseinsensitive: true,
    minLength: 3,
    activeTab: 1,
    ngramsCache: { 1: [], 2: [], 3: [] }
  };

  /* ---------- Stopwords ---------- */
  var STOPWORDS_EN = ["a","an","and","are","as","at","be","but","by","for","from","has","have","he","her","his","i","in","is","it","its","me","my","no","not","of","on","or","our","she","so","than","that","the","their","them","they","this","to","up","us","was","we","were","what","when","which","who","will","with","would","you","your","can","do","does","did","just","get","got","will","would","could","should","about","into","out","over","very","also","then","there","here","now","more","most","some","any","all","if","than","because","while","after","before","during","through","between"];

  var STOPWORDS_BN = ["এবং","বা","কিন্তু","যদি","তবে","কারণ","তাই","এটা","সেটা","এটি","সেটি","এই","সেই","একটি","একটা","আমি","আমরা","তুমি","তোমরা","সে","তারা","আমার","আমাদের","তোমার","তোমাদের","তার","তাদের","কি","কী","কেন","কোথায়","কবে","কিভাবে","কীভাবে","হলো","হয়","হবে","হচ্ছে","হয়েছে","ছিল","ছিলেন","করে","করতে","করছে","করেছেন","করব","থেকে","জন্য","দিয়ে","দ্বারা","সাথে","মধ্যে","উপর","নিচে","আগে","পরে","সময়","খুব","বেশ","আরো","আরও","শুধু","কিন্তু","তবু","নয়","না","নেই","ছাড়া"];

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

  function formatNum(n) {
    if (n < 1000) return String(n);
    return n.toLocaleString();
  }

  function isStopword(word) {
    var w = word.toLowerCase();
    return STOPWORDS_EN.indexOf(w) !== -1 || STOPWORDS_BN.indexOf(w) !== -1;
  }

  /* ---------- Extract words ---------- */
  function extractWords(text) {
    if (!text) return [];
    // Match Bangla + Latin words/numbers
    var re = /[\u0980-\u09FF\u00C0-\u024F\u1E00-\u1EFFA-Za-z0-9']+/g;
    var raw = text.match(re) || [];

    return raw.filter(function (w) {
      // Remove pure numbers longer than 5 (usually not keywords)
      if (/^\d{6,}$/.test(w)) return false;
      // Check min length
      if (w.length < state.minLength) return false;
      // Stopword check
      if (state.stopwords && isStopword(w)) return false;
      return true;
    }).map(function (w) {
      return state.caseinsensitive ? w.toLowerCase() : w;
    });
  }

  /* ---------- N-gram generation ---------- */
  function generateNgrams(words, n) {
    var counts = {};
    for (var i = 0; i <= words.length - n; i++) {
      var ngram = words.slice(i, i + n).join(" ");
      counts[ngram] = (counts[ngram] || 0) + 1;
    }
    return counts;
  }

  /* ---------- Main analysis ---------- */
  function analyze() {
    var text = input.value;
    charCount.textContent = formatNum(text.length);

    var allWords = extractWords(text);
    var totalWords = allWords.length;

    // Unique count
    var uniqueSet = {};
    allWords.forEach(function (w) { uniqueSet[w] = true; });
    var uniqueCount = Object.keys(uniqueSet).length;

    // Update top stats
    wordsEl.textContent = formatNum(totalWords);
    uniqueEl.textContent = formatNum(uniqueCount);
    charsEl.textContent = formatNum(text.length);

    // Update is-zero class
    wordsEl.classList.toggle("is-zero", totalWords === 0);
    uniqueEl.classList.toggle("is-zero", uniqueCount === 0);
    charsEl.classList.toggle("is-zero", text.length === 0);

    // Generate n-grams
    [1, 2, 3].forEach(function (n) {
      var counts = generateNgrams(allWords, n);
      var arr = Object.keys(counts).map(function (k) {
        return {
          text: k,
          count: counts[k],
          density: totalWords > 0 ? (counts[k] * n / totalWords) * 100 : 0
        };
      }).sort(function (a, b) {
        return b.count - a.count || a.text.localeCompare(b.text);
      });
      state.ngramsCache[n] = arr;
    });

    // Top density
    var topArr = state.ngramsCache[1];
    var topDensity = topArr.length > 0 ? topArr[0].density : 0;
    topDensityEl.textContent = topDensity.toFixed(1) + "%";
    topDensityEl.classList.toggle("is-zero", topDensity === 0);

    // Render current tab
    renderTab();
    updateScore();
    renderRecommendations();
    updateChecker();
  }

  /* ---------- Render current tab ---------- */
  function renderTab() {
    var n = state.activeTab;
    var arr = state.ngramsCache[n];

    if (!arr.length) {
      keywordList.innerHTML =
        '<div class="kd-empty">' +
          '<svg class="kd-i" viewBox="0 0 24 24"><use href="#kd-i-chart"/></svg>' +
          'টেক্সট লেখা শুরু করুন — কীওয়ার্ড ঘনত্ব এখানে দেখাবে' +
        '</div>';
      return;
    }

    // Take top 25
    var top = arr.slice(0, 25);
    var maxCount = top[0].count;

    keywordList.innerHTML = "";
    top.forEach(function (item) {
      var pctClass = "";
      if (item.density > 3) pctClass = "high";
      else if (item.density >= 1 && item.density <= 2.5) pctClass = "good";

      var fillClass = "";
      if (item.density > 3) fillClass = "high";
      else if (item.density >= 1 && item.density <= 2.5) fillClass = "good";

      var barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

      var el = document.createElement("div");
      el.className = "kd-keyword";
      el.innerHTML =
        '<div class="kd-keyword-head">' +
          '<span class="kd-keyword-word" title="' + escapeHtml(item.text) + '">' + escapeHtml(item.text) + '</span>' +
          '<span class="kd-keyword-stats">' +
            '<span class="kd-keyword-count">' + item.count + '</span>' +
            '<span class="kd-keyword-pct ' + pctClass + '">' + item.density.toFixed(1) + '%</span>' +
          '</span>' +
        '</div>' +
        '<div class="kd-keyword-bar">' +
          '<div class="kd-keyword-fill ' + fillClass + '" style="width:' + barWidth + '%"></div>' +
        '</div>';

      keywordList.appendChild(el);
    });
  }

  /* ---------- Score & recommendations ---------- */
  function updateScore() {
    var oneGrams = state.ngramsCache[1];
    var totalWords = oneGrams.reduce(function (s, i) { return s + i.count; }, 0);

    var score = 0;
    var checks = [];

    if (totalWords === 0) {
      scoreText.textContent = "0";
      scoreBadge.className = "kd-score-badge poor";
      return;
    }

    // Text length check (30 pts)
    if (totalWords >= 300) {
      score += 30;
      checks.push({ type: "pass", text: "টেক্সট দৈর্ঘ্য চমৎকার (" + totalWords + " শব্দ)" });
    } else if (totalWords >= 150) {
      score += 20;
      checks.push({ type: "warn", text: "টেক্সট দৈর্ঘ্য গ্রহণযোগ্য, তবে ৩০০+ শব্দ আদর্শ" });
    } else {
      score += 8;
      checks.push({ type: "warn", text: "টেক্সট খুব ছোট (" + totalWords + " শব্দ) — আরও কনটেন্ট যোগ করুন" });
    }

    // Top keyword density (40 pts)
    if (oneGrams.length > 0) {
      var top = oneGrams[0];
      if (top.density >= 1 && top.density <= 2.5) {
        score += 40;
        checks.push({ type: "pass", text: "টপ কীওয়ার্ড \"" + top.text + "\" আদর্শ ঘনত্বে (" + top.density.toFixed(1) + "%)" });
      } else if (top.density > 2.5 && top.density <= 3.5) {
        score += 20;
        checks.push({ type: "warn", text: "টপ কীওয়ার্ড ঘনত্ব সামান্য বেশি (" + top.density.toFixed(1) + "%) — ৩%-এর নিচে রাখুন" });
      } else if (top.density > 3.5) {
        score += 5;
        checks.push({ type: "error", text: "কীওয়ার্ড স্টাফিং সনাক্ত (" + top.density.toFixed(1) + "%) — কমিয়ে দিন" });
      } else {
        score += 15;
        checks.push({ type: "warn", text: "টপ কীওয়ার্ড ঘনত্ব কম (" + top.density.toFixed(1) + "%) — ১-২.৫% লক্ষ্য করুন" });
      }
    }

    // Unique ratio (20 pts)
    var uniqueRatio = oneGrams.length / totalWords;
    if (uniqueRatio >= 0.4) {
      score += 20;
      checks.push({ type: "pass", text: "শব্দ বৈচিত্র্য চমৎকার (" + (uniqueRatio * 100).toFixed(0) + "%)" });
    } else if (uniqueRatio >= 0.25) {
      score += 12;
      checks.push({ type: "warn", text: "শব্দ বৈচিত্র্য গ্রহণযোগ্য — আরও সমার্থক শব্দ ব্যবহার করুন" });
    } else {
      score += 5;
      checks.push({ type: "error", text: "শব্দ পুনরাবৃত্তি বেশি — কীওয়ার্ড স্টাফিং কমাতে হবে" });
    }

    // Multiple keywords in ideal range (10 pts)
    var idealCount = oneGrams.filter(function (item) {
      return item.density >= 1 && item.density <= 2.5;
    }).length;
    if (idealCount >= 3) {
      score += 10;
      checks.push({ type: "pass", text: idealCount + "টি কীওয়ার্ড আদর্শ ঘনত্বে" });
    } else if (idealCount >= 1) {
      score += 5;
      checks.push({ type: "warn", text: "শুধু " + idealCount + "টি কীওয়ার্ড আদর্শ ঘনত্বে — আরও টার্গেট করুন" });
    }

    score = Math.min(score, 100);
    scoreText.textContent = score;

    // Update badge class
    scoreBadge.className = "kd-score-badge";
    if (score >= 85) scoreBadge.classList.add("excellent");
    else if (score >= 65) scoreBadge.classList.add("good");
    else if (score >= 40) scoreBadge.classList.add("warning");
    else scoreBadge.classList.add("poor");

    // Update recommendations
    renderRecommendationsFromChecks(checks);
  }

  function renderRecommendationsFromChecks(checks) {
    if (!checks.length) {
      recList.innerHTML = '<div class="kd-rec warn"><span class="kd-rec-icon"><svg class="kd-i" viewBox="0 0 24 24"><use href="#kd-i-info"/></svg></span><span class="kd-rec-text">বিশ্লেষণ শুরু করতে টেক্সট লিখুন</span></div>';
      return;
    }

    recList.innerHTML = "";
    checks.forEach(function (check) {
      var icon = check.type === "pass" ? "#kd-i-check" : (check.type === "error" ? "#kd-i-x-circle" : "#kd-i-info");
      var div = document.createElement("div");
      div.className = "kd-rec " + check.type;
      div.innerHTML =
        '<span class="kd-rec-icon"><svg class="kd-i" viewBox="0 0 24 24"><use href="' + icon + '"/></svg></span>' +
        '<span class="kd-rec-text">' + escapeHtml(check.text) + '</span>';
      recList.appendChild(div);
    });
  }

  function renderRecommendations() {
    // Handled in updateScore
  }

  /* ---------- Specific keyword checker ---------- */
  function updateChecker() {
    var query = checkInput.value.trim();
    if (!query) {
      checkResult.textContent = "";
      checkResult.className = "kd-checker-result";
      return;
    }

    var allWords = extractWords(input.value);
    var q = state.caseinsensitive ? query.toLowerCase() : query;

    // Count occurrences
    var count = 0;
    var qParts = q.split(/\s+/);
    var n = qParts.length;

    if (n > 1) {
      // Phrase check
      for (var i = 0; i <= allWords.length - n; i++) {
        var match = true;
        for (var j = 0; j < n; j++) {
          if (allWords[i + j] !== qParts[j]) {
            match = false;
            break;
          }
        }
        if (match) count++;
      }
    } else {
      allWords.forEach(function (w) { if (w === q) count++; });
    }

    var totalWords = allWords.length;
    var density = totalWords > 0 ? (count * n / totalWords) * 100 : 0;

    checkResult.className = "kd-checker-result " + (count > 0 ? "found" : "notfound");

    if (count > 0) {
      checkResult.innerHTML = "✓ পাওয়া গেছে: <strong>" + count + "</strong> বার · ঘনত্ব <strong>" + density.toFixed(2) + "%</strong>";
    } else {
      checkResult.innerHTML = "✗ \"" + escapeHtml(query) + "\" কীওয়ার্ডটি পাওয়া যায়নি";
    }
  }

  /* ---------- Event listeners ---------- */
  var debounceTimer = null;
  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(analyze, 150);
  });

  /* Toggles */
  toggles.forEach(function (sw) {
    sw.addEventListener("click", function () {
      sw.classList.toggle("is-on");
      var key = sw.getAttribute("data-toggle");
      state[key] = sw.classList.contains("is-on");
      analyze();
    });
  });

  /* Min length */
  minLengthSel.addEventListener("change", function () {
    state.minLength = parseInt(this.value, 10);
    analyze();
  });

  /* Tabs */
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      state.activeTab = parseInt(tab.getAttribute("data-tab"), 10);
      renderTab();
    });
  });

  /* Checker input */
  var checkDebounce = null;
  checkInput.addEventListener("input", function () {
    clearTimeout(checkDebounce);
    checkDebounce = setTimeout(updateChecker, 200);
  });

  /* Sample text */
  var SAMPLE = "Search engine optimization (SEO) is the practice of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic rather than direct traffic or paid traffic. SEO involves optimizing content, building backlinks, and improving technical aspects of a website. Good SEO helps websites rank higher in search engine results pages. Effective SEO requires understanding how search engines work. SEO tools help analyze and improve SEO performance. বাংলা ভাষায় লেখা কনটেন্টেও SEO কাজ করে। কীওয়ার্ড রিসার্চ হলো SEO-র প্রথম ধাপ। ভালো SEO কৌশল ওয়েবসাইটের ট্রাফিক বাড়াতে সাহায্য করে।";

  sampleBtn.addEventListener("click", function () {
    input.value = SAMPLE;
    analyze();
    showToast("✓ Sample text লোড হয়েছে");
  });

  /* Paste */
  pasteBtn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (text) {
        if (text) {
          input.value = text;
          analyze();
          showToast("✓ পেস্ট হয়েছে");
        } else {
          showToast("⚠ ক্লিপবোর্ড খালি");
        }
      }).catch(function () {
        input.focus();
        showToast("⚠ ম্যানুয়ালি Ctrl+V চাপুন");
      });
    } else {
      input.focus();
      showToast("⚠ ম্যানুয়ালি Ctrl+V চাপুন");
    }
  });

  /* Clear */
  clearBtn.addEventListener("click", function () {
    input.value = "";
    checkInput.value = "";
    checkResult.textContent = "";
    analyze();
    showToast("✓ সব মুছে ফেলা হয়েছে");
    input.focus();
  });

  /* ---------- Init ---------- */
  analyze();

})();
