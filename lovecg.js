(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".love-calc")) return;
    document.body.classList.add("lc-full");
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
    var o = document.getElementById("outer-wrapper");
    if (o) o.style.setProperty("overflow-x","visible","important");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", forceFullWidth);
  else forceFullWidth();
  setTimeout(forceFullWidth, 300);
  setTimeout(forceFullWidth, 1200);

  /* ---------- Elements ---------- */
  var hub = document.getElementById("loveCalc");
  if (!hub) return;

  var card         = document.getElementById("lcCard");
  var field1       = document.getElementById("lcField1");
  var field2       = document.getElementById("lcField2");
  var name1        = document.getElementById("lcName1");
  var name2        = document.getElementById("lcName2");
  var avatar1      = document.getElementById("lcAvatar1");
  var avatar2      = document.getElementById("lcAvatar2");
  var count1       = document.getElementById("lcCount1");
  var count2       = document.getElementById("lcCount2");
  var calcBtn      = document.getElementById("lcCalcBtn");
  var hint         = document.getElementById("lcHint");
  var swapBtn      = document.getElementById("lcSwapBtn");
  var randomBtn    = document.getElementById("lcRandomBtn");

  var resultBox    = document.getElementById("lcResult");
  var ringFg       = document.getElementById("lcRingFg");
  var scoreNum     = document.getElementById("lcScoreNum");
  var scoreLabel   = document.getElementById("lcScoreLabel");
  var resultTitle  = document.getElementById("lcResultTitle");
  var resultMsg    = document.getElementById("lcResultMsg");
  var heartsBurst  = document.getElementById("lcHeartsBurst");

  var resAvatar1   = document.getElementById("lcResultAvatar1");
  var resAvatar2   = document.getElementById("lcResultAvatar2");
  var resName1     = document.getElementById("lcResultName1");
  var resName2     = document.getElementById("lcResultName2");

  var luckyNum     = document.getElementById("lcLuckyNum");
  var hashtag      = document.getElementById("lcHashtag");
  var percentile   = document.getElementById("lcPercentile");
  var langName     = document.getElementById("lcLangName");

  var trustVal     = document.getElementById("lcTrustVal");
  var chemVal      = document.getElementById("lcChemVal");
  var commVal      = document.getElementById("lcCommVal");
  var funVal       = document.getElementById("lcFunVal");
  var trustBar     = document.getElementById("lcTrustBar");
  var chemBar      = document.getElementById("lcChemBar");
  var commBar      = document.getElementById("lcCommBar");
  var funBar       = document.getElementById("lcFunBar");

  var shareBtn     = document.getElementById("lcShareBtn");
  var waBtn        = document.getElementById("lcWaBtn");
  var twBtn        = document.getElementById("lcTwBtn");
  var dlBtn        = document.getElementById("lcDlBtn");

  var historyBox   = document.getElementById("lcHistory");
  var historyList  = document.getElementById("lcHistoryList");
  var historyClear = document.getElementById("lcHistoryClear");

  var RING_R = 88;
  var RING_C = 2 * Math.PI * RING_R;
  var STORAGE_HIST = "lc_history_v2";
  var STORAGE_LAST = "lc_last_pair_v2";
  var MAX_HIST = 6;

  if (ringFg) {
    ringFg.style.strokeDasharray = RING_C;
    ringFg.style.strokeDashoffset = RING_C;
  }

  /* ---------- Utilities ---------- */
  function getStore(k, d){
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
    catch(e){ return d; }
  }
  function setStore(k, v){
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch(e){}
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(m){
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
    });
  }

  /* ---------- Deterministic hash ---------- */
  function hashStr(str){
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  /* ---------- Calculate all results ---------- */
  function calculate(a, b){
    var na = (a || "").toLowerCase().replace(/\s+/g, "").trim();
    var nb = (b || "").toLowerCase().replace(/\s+/g, "").trim();
    if (!na || !nb) return null;

    var pair = [na, nb].sort().join("|");
    var h = hashStr(pair);

    var score = Math.min((h % 71) + 30, 99);

    var trust         = 65 + ((h >> 3) % 36);
    var chemistry     = 65 + ((h >> 7) % 36);
    var communication = 65 + ((h >> 11) % 36);
    var fun           = 65 + ((h >> 15) % 36);

    var lucky = (h % 99) + 1;

    var languages = [
      "Words of Affirmation",
      "Quality Time",
      "Acts of Service",
      "Physical Touch",
      "Receiving Gifts"
    ];
    var language = languages[h % languages.length];

    var pct;
    if (score >= 95) pct = 99;
    else if (score >= 90) pct = 92;
    else if (score >= 80) pct = 78;
    else if (score >= 70) pct = 60;
    else if (score >= 60) pct = 45;
    else if (score >= 50) pct = 30;
    else pct = 15;

    return {
      score: score,
      trust: trust, chemistry: chemistry, communication: communication, fun: fun,
      lucky: lucky,
      language: language,
      percentile: pct,
      tier: getTier(score)
    };
  }

  function getTier(score){
    if (score >= 90) return { label: "Soulmates", title: "True Soulmates! 💖", msg: "The stars aligned for you two. This is the kind of match fairy tales are written about." };
    if (score >= 75) return { label: "Great Match", title: "A Beautiful Match 💕", msg: "Strong chemistry, deep connection, and shared rhythm. This one has serious potential." };
    if (score >= 60) return { label: "Sweet Spark", title: "Sweet Connection 💗", msg: "There's a real spark here. Give it time, care, and a little adventure — and watch it grow." };
    if (score >= 45) return { label: "Worth Exploring", title: "Worth Exploring 💖", msg: "Not written in the stars yet — but the best love stories often start with a slow burn." };
    if (score >= 30) return { label: "Mixed Signals", title: "Keep It Complicated 💔", msg: "Love isn't an exact science. Sometimes the strongest bonds take a little patience and honesty." };
    return { label: "Just Friends", title: "Better as Friends 🤝", msg: "The chemistry is friendly, not romantic. But great friendships are their own kind of love." };
  }

  /* ---------- Live avatar/initials ---------- */
  function updateInitial(wrap, avatarEl, inputEl, countEl){
    var v = inputEl.value.trim();
    var initials = v ? v.charAt(0).toUpperCase() : "";
    if (initials) {
      avatarEl.textContent = initials;
      avatarEl.classList.remove("is-empty");
    } else {
      avatarEl.textContent = "";
      avatarEl.classList.add("is-empty");
    }
    if (countEl) countEl.textContent = v.length + "/30";
    wrap.classList.toggle("has-value", v.length > 0);
  }

  function updateLiveUI(){
    var wrap1 = name1.closest(".lc-input-wrap");
    var wrap2 = name2.closest(".lc-input-wrap");
    updateInitial(wrap1, avatar1, name1, count1);
    updateInitial(wrap2, avatar2, name2, count2);

    var ready = name1.value.trim().length >= 2 && name2.value.trim().length >= 2;
    if (hint) {
      hint.classList.toggle("is-ready", ready);
      hint.innerHTML = ready
        ? 'Ready — press <span class="lc-kbd">Enter</span> or click Calculate'
        : 'Fill both names — press <span class="lc-kbd">Enter</span> to calculate';
    }
  }

  /* ---------- Number animation ---------- */
  function animateNumber(el, from, to, duration){
    var start = performance.now();
    function tick(now){
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(from + (to - from) * eased);
      el.firstChild.nodeValue = val;
      if (p < 1) requestAnimationFrame(tick);
      else el.firstChild.nodeValue = to;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Heart burst ---------- */
  function burstHearts(){
    if (!heartsBurst) return;
    heartsBurst.innerHTML = "";
    for (var i = 0; i < 14; i++) {
      var h = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      h.setAttribute("viewBox", "0 0 24 24");
      h.setAttribute("class", "lc-burst-heart");
      var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#lc-i-heart");
      h.appendChild(use);
      h.style.fill = "currentColor";
      var angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      var dist = 90 + Math.random() * 60;
      h.style.setProperty("--dx", (Math.cos(angle) * dist) + "px");
      h.style.setProperty("--dy", (Math.sin(angle) * dist) + "px");
      h.style.setProperty("--rot", ((Math.random() - 0.5) * 90) + "deg");
      h.style.animationDelay = (i * 25) + "ms";
      h.style.color = ["#ec4899", "#f472b6", "#be185d", "#f9a8d4", "#fbbf24"][i % 5];
      heartsBurst.appendChild(h);
    }
    setTimeout(function(){ heartsBurst.innerHTML = ""; }, 1800);
  }

  /* ---------- Confetti (high score) ---------- */
  function fireConfetti(){
    var layer = document.createElement("div");
    layer.className = "lc-confetti";
    document.body.appendChild(layer);
    var colors = ["#ec4899","#f472b6","#be185d","#fbbf24","#a78bfa","#f43f5e","#f9a8d4"];
    for (var i = 0; i < 60; i++) {
      var p = document.createElement("div");
      p.className = "lc-confetti-piece";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.width = (6 + Math.random() * 8) + "px";
      p.style.height = (6 + Math.random() * 10) + "px";
      p.style.animationDuration = (2.2 + Math.random() * 1.6) + "s";
      p.style.animationDelay = (Math.random() * 0.4) + "s";
      if (i % 3 === 0) p.style.borderRadius = "50%";
      layer.appendChild(p);
    }
    setTimeout(function(){ layer.remove(); }, 4500);
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function showToast(text){
    var ex = document.querySelector(".lc-toast");
    if (ex) ex.remove();
    var t = document.createElement("div");
    t.className = "lc-toast";
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>' + escapeHtml(text) + '</span>';
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){
      t.classList.add("is-out");
      setTimeout(function(){ t.remove(); }, 320);
    }, 2200);
  }

  /* ---------- History ---------- */
  function saveHistory(a, b, score){
    var hist = getStore(STORAGE_HIST, []);
    hist = hist.filter(function(x){
      return !(x.a === a && x.b === b);
    });
    hist.unshift({ a: a, b: b, score: score, t: Date.now() });
    if (hist.length > MAX_HIST) hist = hist.slice(0, MAX_HIST);
    setStore(STORAGE_HIST, hist);
    renderHistory();
  }

  function renderHistory(){
    var hist = getStore(STORAGE_HIST, []);
    if (!hist.length) {
      historyBox.hidden = true;
      return;
    }
    historyBox.hidden = false;
    historyList.innerHTML = "";
    hist.forEach(function(item){
      var row = document.createElement("div");
      row.className = "lc-history-item";
      row.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><use href="#lc-i-heart"/></svg>' +
        '<span class="lc-history-names">' + escapeHtml(item.a) + ' + ' + escapeHtml(item.b) + '</span>' +
        '<span class="lc-history-score">' + item.score + '%</span>';
      row.addEventListener("click", function(){
        name1.value = item.a;
        name2.value = item.b;
        updateLiveUI();
        runCalculation(true);
      });
      historyList.appendChild(row);
    });
  }

  if (historyClear) {
    historyClear.addEventListener("click", function(){
      setStore(STORAGE_HIST, []);
      renderHistory();
      showToast("History cleared");
    });
  }

  /* ---------- Validation ---------- */
  function validate(){
    var a = name1.value.trim();
    var b = name2.value.trim();
    var ok = true;
    field1.classList.remove("is-error");
    field2.classList.remove("is-error");
    if (!a) { field1.classList.add("is-error"); ok = false; }
    if (!b) { field2.classList.add("is-error"); ok = false; }
    return ok;
  }

  /* ---------- Fill sub-score bar ---------- */
  function setBar(barEl, valEl, value){
    if (valEl) valEl.textContent = value + "%";
    if (barEl) {
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          barEl.style.width = value + "%";
        });
      });
    }
  }

  /* ---------- Main calculation ---------- */
  var isCalculating = false;
  var lastCalcPair = "";

  function runCalculation(force){
    var a = name1.value.trim();
    var b = name2.value.trim();

    if (!a || !b) {
      validate();
      return;
    }
    if (a.length < 2 || b.length < 2) {
      if (force) showToast("Names need at least 2 letters");
      return;
    }
    if (isCalculating) return;

    var pairKey = a.toLowerCase() + "|" + b.toLowerCase();
    if (!force && pairKey === lastCalcPair) return;
    lastCalcPair = pairKey;

    isCalculating = true;

    var res = calculate(a, b);
    if (!res) { isCalculating = false; return; }

    card.classList.add("is-calculating");
    calcBtn.classList.add("is-loading");
    calcBtn.disabled = true;

    resultBox.hidden = true;
    ringFg.style.strokeDashoffset = RING_C;
    scoreNum.firstChild.nodeValue = "0";
    scoreLabel.textContent = "Calculating…";

    setTimeout(function(){
      resultBox.hidden = false;

      scoreLabel.textContent = res.tier.label;
      resultTitle.textContent = res.tier.title;
      resultMsg.textContent = res.tier.msg;

      // Couple avatars in result
      resAvatar1.textContent = a.charAt(0).toUpperCase();
      resAvatar2.textContent = b.charAt(0).toUpperCase();
      resName1.textContent = a;
      resName2.textContent = b;

      // Chips
      luckyNum.textContent = res.lucky;
      hashtag.textContent = "#" + a.charAt(0).toUpperCase() + b.charAt(0).toUpperCase() + "Love";
      percentile.textContent = res.percentile + "%";

      // Love language
      langName.textContent = res.language;

      // Animate ring
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          ringFg.style.strokeDashoffset = RING_C * (1 - res.score / 100);
        });
      });

      // Animate number
      animateNumber(scoreNum, 0, res.score, 1600);

      // Sub-scores
      setBar(trustBar, trustVal, res.trust);
      setBar(chemBar, chemVal, res.chemistry);
      setBar(commBar, commVal, res.communication);
      setBar(funBar, funVal, res.fun);

      // Burst
      setTimeout(burstHearts, 300);

      // Confetti for high score
      if (res.score >= 90) setTimeout(fireConfetti, 500);

      // Save to history + last pair
      saveHistory(a, b, res.score);
      setStore(STORAGE_LAST, { a: a, b: b });

      // Smooth scroll
      setTimeout(function(){
        resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);

      // Cleanup
      card.classList.remove("is-calculating");
      calcBtn.classList.remove("is-loading");
      calcBtn.disabled = false;
      isCalculating = false;
    }, 1100);
  }

  /* ---------- Share text ---------- */
  function getShareText(){
    var a = name1.value.trim();
    var b = name2.value.trim();
    var res = calculate(a, b);
    if (!res) return "";
    return a + " ❤️ " + b + " = " + res.score + "% 💕 (" + res.tier.label + ") — Calculated on Love Calculator";
  }

  function fallbackCopy(text){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch(e){}
    document.body.removeChild(ta);
  }

  /* ---------- Actions ---------- */
  function doShare(){
    var text = getShareText();
    if (!text) return;
    if (navigator.share) {
      navigator.share({ title: "Love Calculator", text: text }).catch(function(){});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){
        showToast("Result copied to clipboard");
      }).catch(function(){
        fallbackCopy(text);
        showToast("Result copied to clipboard");
      });
    } else {
      fallbackCopy(text);
      showToast("Result copied to clipboard");
    }
  }

  function shareWhatsApp(){
    var text = getShareText();
    if (!text) return;
    var url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener");
  }

  function shareTwitter(){
    var a = name1.value.trim();
    var b = name2.value.trim();
    var res = calculate(a, b);
    if (!res) return;
    var text = a + " ❤️ " + b + " = " + res.score + "% 💕 " + res.tier.label;
    var url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener");
  }

  /* ---------- Download as image ---------- */
  function downloadImage(){
    var a = name1.value.trim();
    var b = name2.value.trim();
    var res = calculate(a, b);
    if (!res) { showToast("Please calculate first"); return; }

    var W = 1080, H = 1080;
    var canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");

    // Background
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#fff5fa");
    bg.addColorStop(1, "#ffe4ee");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.fillStyle = "rgba(252, 231, 243, 0.7)";
    ctx.beginPath();
    ctx.arc(120, 120, 240, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(254, 215, 170, 0.35)";
    ctx.beginPath();
    ctx.arc(980, 980, 280, 0, Math.PI * 2);
    ctx.fill();

    // Header text
    ctx.fillStyle = "#831843";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "italic 900 42px Georgia, serif";
    ctx.fillText("Love Calculator", W / 2, 110);

    // Names
    ctx.fillStyle = "#0a0a0a";
    ctx.font = "700 62px -apple-system, Inter, sans-serif";
    ctx.fillText(a + "  ❤  " + b, W / 2, 210);

    // Ring
    var cx = W / 2, cy = 560, r = 220;
    ctx.strokeStyle = "rgba(236, 72, 153, 0.15)";
    ctx.lineWidth = 32;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    var grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#f472b6");
    grad.addColorStop(0.5, "#ec4899");
    grad.addColorStop(1, "#be185d");
    ctx.strokeStyle = grad;
    ctx.beginPath();
    var startA = -Math.PI / 2;
    var endA = startA + (Math.PI * 2 * res.score / 100);
    ctx.arc(cx, cy, r, startA, endA);
    ctx.stroke();

    // Score text
    ctx.fillStyle = "#be185d";
    ctx.font = "800 200px -apple-system, Inter, sans-serif";
    ctx.fillText(res.score + "%", cx, cy - 10);

    // Tier label
    ctx.fillStyle = "#6b7280";
    ctx.font = "italic 500 44px Georgia, serif";
    ctx.fillText(res.tier.label, cx, cy + 120);

    // Bottom info
    ctx.fillStyle = "#831843";
    ctx.font = "600 32px -apple-system, Inter, sans-serif";
    ctx.fillText("Lucky #" + res.lucky + "   ·   " + res.language, W / 2, 920);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "italic 500 26px Georgia, serif";
    ctx.fillText("Made with RiR · Calculated on Love Calculator", W / 2, 1000);

    // Export
    canvas.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "love-" + a + "-" + b + ".png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Image downloaded 💕");
    }, "image/png");
  }

  /* ---------- Random couple ---------- */
  var RANDOM_NAMES = [
    "Aria", "Kai", "Luna", "Leo", "Sara", "Noah", "Mia", "Ethan", "Zara", "Liam",
    "Nora", "Owen", "Ivy", "Adam", "Elena", "Ryan", "Maya", "Cole", "Ruby", "Jude",
    "Lily", "Finn", "Rose", "Ezra", "Iris", "Jack", "Chloe", "Miles", "Nina", "Theo",
    "Hana", "Owen", "Skye", "Dante", "Ava", "Jasper", "Elle", "Cruz", "Wren", "Enzo"
  ];
  function randomCouple(){
    var a = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    var b = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    while (b === a) b = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    name1.value = a;
    name2.value = b;
    updateLiveUI();
    runCalculation(true);
    showToast("Try " + a + " + " + b + " 💕");
  }

  /* ---------- Reset ---------- */
  function resetAll(){
    resultBox.hidden = true;
    name1.value = "";
    name2.value = "";
    field1.classList.remove("is-error");
    field2.classList.remove("is-error");
    ringFg.style.strokeDashoffset = RING_C;
    scoreNum.firstChild.nodeValue = "0";
    scoreLabel.textContent = "Calculating…";
    lastCalcPair = "";
    updateLiveUI();
    name1.focus();
  }

  /* ---------- Auto-calc (debounced) ---------- */
  var autoTimer = null;
  function scheduleAuto(){
    clearTimeout(autoTimer);
    var a = name1.value.trim();
    var b = name2.value.trim();
    if (a.length >= 2 && b.length >= 2) {
      autoTimer = setTimeout(function(){
        if (!isCalculating) runCalculation(false);
      }, 1000);
    }
  }

  /* ---------- Events ---------- */
  calcBtn.addEventListener("click", function(){ runCalculation(true); });
  shareBtn.addEventListener("click", doShare);
  waBtn.addEventListener("click", shareWhatsApp);
  twBtn.addEventListener("click", shareTwitter);
  dlBtn.addEventListener("click", downloadImage);
  randomBtn.addEventListener("click", randomCouple);

  swapBtn.addEventListener("click", function(){
    var a = name1.value;
    name1.value = name2.value;
    name2.value = a;
    updateLiveUI();
    scheduleAuto();
  });

  document.querySelectorAll("[data-clear]").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.preventDefault();
      var which = btn.getAttribute("data-clear");
      if (which === "1") name1.value = "";
      else name2.value = "";
      updateLiveUI();
      resultBox.hidden = true;
      lastCalcPair = "";
    });
  });

  [name1, name2].forEach(function(input){
    input.addEventListener("input", function(){
      updateLiveUI();
      scheduleAuto();
      input.closest(".lc-field").classList.remove("is-error");
    });
    input.addEventListener("keydown", function(e){
      if (e.key === "Enter") {
        e.preventDefault();
        runCalculation(true);
      }
      if (e.key === "Escape") {
        input.value = "";
        updateLiveUI();
      }
    });
  });

  /* ---------- Restore last pair ---------- */
  var lastPair = getStore(STORAGE_LAST, null);
  if (lastPair && lastPair.a && lastPair.b) {
    name1.value = lastPair.a;
    name2.value = lastPair.b;
  }

  updateLiveUI();
  renderHistory();

  setTimeout(function(){ name1.focus(); }, 400);

})();
