(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".wc-wrapper")) return;
    document.body.classList.add("wc-full");
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

  var $ = function(id){ return document.getElementById(id); };

  var input        = $("wcInput");
  var pasteBtn     = $("wcPasteBtn");
  var sampleBtn    = $("wcSampleBtn");
  var copyBtn      = $("wcCopyBtn");
  var clearBtn     = $("wcClearBtn");
  var toast        = $("wcToast");
  var toastMsg     = $("wcToastMsg");

  var elWords      = $("wcWords");
  var elChars      = $("wcChars");
  var elSentences  = $("wcSentences");
  var elParagraphs = $("wcParagraphs");
  var elCharsNoSpace = $("wcCharsNoSpace");
  var elReadTime   = $("wcReadTime");
  var elSpeakTime  = $("wcSpeakTime");
  var elUnique     = $("wcUnique");
  var elTopWords   = $("wcTopWords");
  var elUpper      = $("wcUpper");
  var elLower      = $("wcLower");
  var elNumbers    = $("wcNumbers");
  var elPunct      = $("wcPunct");
  var elSpaces     = $("wcSpaces");
  var elLineBreaks = $("wcLineBreaks");

  var limitEls = {
    twitter:   { used: $("wcTwitterUsed"),   bar: $("wcTwitterBar"),   max: 280 },
    instagram: { used: $("wcInstagramUsed"), bar: $("wcInstagramBar"), max: 2200 },
    sms:       { used: $("wcSmsUsed"),       bar: $("wcSmsBar"),       max: 160 },
    linkedin:  { used: $("wcLinkedinUsed"),  bar: $("wcLinkedinBar"),  max: 3000 },
    title:     { used: $("wcTitleUsed"),     bar: $("wcTitleBar"),     max: 60 },
    desc:      { used: $("wcDescUsed"),      bar: $("wcDescBar"),      max: 160 }
  };

  if (!input) return;

  /* ---------- Full width / error helpers ---------- */
  function showToast(msg){
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){
      toast.classList.remove("show");
    }, 2200);
  }

  function fallbackCopy(text){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch(e){}
    document.body.removeChild(ta);
  }

  function copyText(text){
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function(){ fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  /* ---------- Word splitting (supports Bangla + Latin) ---------- */
  function getWords(text){
    if (!text) return [];
    // Match words: Latin letters, Bangla letters (\u0980-\u09FF), numbers, apostrophes
    var re = /[\u0980-\u09FF\u00C0-\u024FA-Za-z0-9'’_-]+/g;
    return text.match(re) || [];
  }

  /* ---------- Sentence counting ---------- */
  function countSentences(text){
    if (!text || !text.trim()) return 0;
    // Split on ., !, ?, Bangla danda (।), and double newline paragraphs
    var parts = text.split(/[\.\!\?।\u0964]+/).filter(function(s){
      return s.trim().length > 0;
    });
    return parts.length;
  }

  /* ---------- Paragraph counting ---------- */
  function countParagraphs(text){
    if (!text || !text.trim()) return 0;
    return text.split(/\n\s*\n+/).filter(function(p){
      return p.trim().length > 0;
    }).length;
  }

  /* ---------- Format duration ---------- */
  function formatDuration(seconds){
    if (seconds < 1) return "0s";
    if (seconds < 60) return Math.ceil(seconds) + "s";
    var m = Math.floor(seconds / 60);
    var s = Math.round(seconds % 60);
    if (m < 60) return m + "m" + (s > 0 ? " " + s + "s" : "");
    var h = Math.floor(m / 60);
    m = m % 60;
    return h + "h" + (m > 0 ? " " + m + "m" : "");
  }

  /* ---------- Format large numbers ---------- */
  function formatNum(n){
    if (n < 1000) return String(n);
    return n.toLocaleString();
  }

  /* ---------- Update all ---------- */
  function update(){
    var text = input.value;

    // Words
    var wordsArr = getWords(text);
    var wordCount = wordsArr.length;

    // Chars (with and without spaces)
    var charCount = text.length;
    var charsNoSpace = text.replace(/\s/g, "").length;

    // Sentences & paragraphs
    var sentences = countSentences(text);
    var paragraphs = countParagraphs(text);

    // Reading & speaking time
    var readMinutes = wordCount / 200;
    var speakMinutes = wordCount / 130;
    var readSec = readMinutes * 60;
    var speakSec = speakMinutes * 60;

    // Unique words (case-insensitive)
    var uniqueSet = {};
    var lowerWords = wordsArr.map(function(w){ return w.toLowerCase(); });
    lowerWords.forEach(function(w){ uniqueSet[w] = true; });
    var uniqueCount = Object.keys(uniqueSet).length;

    // Case stats
    var upper = 0, lower = 0, numbers = 0, punct = 0, spaces = 0, lineBreaks = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === " ") spaces++;
      else if (ch === "\n" || ch === "\r") lineBreaks++;
      else if (/[A-Z]/.test(ch)) upper++;
      else if (/[a-z]/.test(ch)) lower++;
      else if (/[0-9]/.test(ch)) numbers++;
      else if (/[\u0980-\u09FF]/.test(ch)) {
        // Bangla letters count as "lower" for display simplicity
        lower++;
      } else if (/[^\w\s]/.test(ch)) punct++;
    }

    // Update DOM with animation
    setStat(elWords, wordCount);
    setStat(elChars, charCount);
    setStat(elSentences, sentences);
    setStat(elParagraphs, paragraphs);
    setStat(elCharsNoSpace, formatNum(charsNoSpace));
    setStat(elUnique, formatNum(uniqueCount));
    setStat(elReadTime, formatDuration(readSec));
    setStat(elSpeakTime, formatDuration(speakSec));
    setStat(elUpper, formatNum(upper));
    setStat(elLower, formatNum(lower));
    setStat(elNumbers, formatNum(numbers));
    setStat(elPunct, formatNum(punct));
    setStat(elSpaces, formatNum(spaces));
    setStat(elLineBreaks, formatNum(lineBreaks));

    // Update platform limits (using char count with spaces)
    var usedChars = charCount;
    Object.keys(limitEls).forEach(function(key){
      var lim = limitEls[key];
      if (!lim.used || !lim.bar) return;
      var pct = Math.min(100, (usedChars / lim.max) * 100);
      lim.used.textContent = formatNum(usedChars);
      lim.bar.style.width = pct + "%";
      var wrapper = lim.used.closest(".wc-limit");
      if (wrapper) {
        wrapper.classList.toggle("is-over", usedChars > lim.max);
      }
    });

    // Update top words
    updateTopWords(wordsArr);
  }

  /* ---------- Stat setter with is-zero class ---------- */
  function setStat(el, value){
    if (!el) return;
    var str = String(value);
    if (el.textContent !== str) {
      el.textContent = str;
    }
    if (el.classList.contains("is-zero") || typeof value === "number") {
      var isEmpty = (value === 0 || value === "0" || value === "0s");
      el.classList.toggle("is-zero", isEmpty);
    }
  }

  /* ---------- Top words ---------- */
  function updateTopWords(wordsArr){
    if (!elTopWords) return;

    if (!wordsArr.length) {
      elTopWords.innerHTML = '<div class="wc-empty-msg">টেক্সট লেখা শুরু করুন…</div>';
      return;
    }

    var counts = {};
    var display = {};
    wordsArr.forEach(function(w){
      var key = w.toLowerCase();
      if (!counts[key]) {
        counts[key] = 0;
        display[key] = w;
      }
      counts[key]++;
    });

    var sorted = Object.keys(counts).map(function(k){
      return { word: display[k], key: k, count: counts[k] };
    }).sort(function(a, b){
      if (b.count !== a.count) return b.count - a.count;
      return a.word.localeCompare(b.word);
    }).slice(0, 10);

    elTopWords.innerHTML = "";
    sorted.forEach(function(item, idx){
      var el = document.createElement("div");
      el.className = "wc-word" + (idx === 0 ? " is-top" : "");
      el.innerHTML =
        '<span class="wc-word-text" title="' + escapeHtml(item.word) + '">' + escapeHtml(item.word) + '</span>' +
        '<span class="wc-word-count">' + item.count + '</span>';
      elTopWords.appendChild(el);
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(m){
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
    });
  }

  /* ---------- Live input ---------- */
  input.addEventListener("input", update);
  input.addEventListener("change", update);

  /* ---------- Paste button ---------- */
  pasteBtn.addEventListener("click", function(){
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function(text){
        if (text) {
          input.value = text;
          update();
          showToast("✓ পেস্ট হয়েছে");
        } else {
          showToast("⚠ ক্লিপবোর্ড খালি");
        }
      }).catch(function(){
        input.focus();
        showToast("⚠ ম্যানুয়ালি Ctrl+V চাপুন");
      });
    } else {
      input.focus();
      showToast("⚠ ম্যানুয়ালি Ctrl+V চাপুন");
    }
  });

  /* ---------- Sample text ---------- */
  var SAMPLE = "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet at least once!\n\n" +
    "বাংলা ভাষা是世界ে সবচেয়ে মিষ্টি ভাষাগুলোর একটি। এখানে বাংলা শব্দ গণনাও কাজ করে। " +
    "Word counter দিয়ে তুমি সহজেই যেকোনো লেখার শব্দ, অক্ষর ও বাক্য সংখ্যা জানতে পারবে।\n\n" +
    "Try pasting your own text above to see live updates. Numbers 12345 and punctuation marks !?., also count correctly.";

  sampleBtn.addEventListener("click", function(){
    input.value = SAMPLE;
    update();
    input.focus();
    showToast("✓ নমুনা টেক্সট যুক্ত হয়েছে");
  });

  /* ---------- Copy ---------- */
  copyBtn.addEventListener("click", function(){
    var text = input.value;
    if (!text.trim()) {
      showToast("⚠ কিছু টেক্সট লিখুন");
      return;
    }
    copyText(text);
    showToast("✓ টেক্সট কপি হয়েছে");
  });

  /* ---------- Clear ---------- */
  clearBtn.addEventListener("click", function(){
    input.value = "";
    update();
    input.focus();
    showToast("✓ সব মুছে ফেলা হয়েছে");
  });

  /* ---------- Keyboard shortcuts ---------- */
  input.addEventListener("keydown", function(e){
    // Ctrl+L to clear
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      input.value = "";
      update();
    }
  });

  /* ---------- Init ---------- */
  update();

})();
