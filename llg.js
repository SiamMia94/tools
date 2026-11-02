(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".li-gen")) return;
    document.body.classList.add("li-full");
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
  var modeBtns       = document.querySelectorAll("#liModes .li-mode");
  var countSlider    = document.getElementById("liCount");
  var countVal       = document.getElementById("liCountVal");
  var langSelect     = document.getElementById("liLanguage");
  var toggles        = document.querySelectorAll(".li-toggle[data-toggle]");
  var generateBtn    = document.getElementById("liGenerate");
  var previewEl      = document.getElementById("liPreview");
  var copyTextBtn    = document.getElementById("liCopyText");
  var copyHtmlBtn    = document.getElementById("liCopyHtml");
  var statWords      = document.getElementById("liStatWords");
  var statChars      = document.getElementById("liStatChars");
  var statParas      = document.getElementById("liStatParas");
  var toast          = document.getElementById("liToast");
  var toastMsg       = document.getElementById("liToastMsg");

  if (!previewEl) return;

  /* ---------- State ---------- */
  var state = {
    mode: "paragraphs",
    count: 5,
    language: "latin",
    classic: true,
    html: false,
    currentText: "",
    currentHtml: "",
    currentParas: []
  };

  /* ============================================================
     WORD BANKS
     ============================================================ */
  var LATIN_WORDS = (
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore " +
    "et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip " +
    "ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat " +
    "nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt " +
    "mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci a odio nullam " +
    "varius turpis et commodo pharetra est eros bibendum elit nec luctus magna felis sollicitudin " +
    "mauris integer in mauris eu nibh euismod gravida duis ac tellus et risus vulputate vehicula " +
    "donec lobortis risus a elit etiam tempor ut ullamcorper ligula eu tempor congue eros est euismod " +
    "turpis id fermentum quam mauris in nibh cras viverra dapibus varius aliquam erat volutpat " +
    "proin sagittis nisl non nisl posuere sit amet sodales nulla porttitor"
  ).split(" ");

  var ENGLISH_WORDS = (
    "the quick brown fox jumps over the lazy dog while sun sets behind distant mountains painting " +
    "the sky with colors of orange purple and pink a gentle breeze moves through the ancient oak " +
    "trees their leaves rustling softly in the evening air as stars begin to appear one by one " +
    "above the quiet village where time seems to slow down and everyday worries fade into memories " +
    "of yesterday people gather around fires sharing stories of hope and laughter their voices " +
    "mingling with the crackling flames that dance and twist like living things in the darkness " +
    "children play hide and seek among tall grass while their parents watch with tired smiles " +
    "remembering their own youth when life was simple and full of wonder and endless possibilities"
  ).split(" ");

  /* ============================================================
     HELPERS
     ============================================================ */
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ---------- Generate sentence ---------- */
  function generateSentence(words, isFirst) {
    var len = randomInt(6, 14);
    var arr = [];
    for (var i = 0; i < len; i++) {
      arr.push(pick(words));
    }
    var sentence = arr.join(" ");
    if (isFirst && state.classic) {
      sentence = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, " + sentence;
    }
    sentence = capitalize(sentence);
    return sentence + ".";
  }

  /* ---------- Generate paragraph ---------- */
  function generateParagraph(words) {
    var sentenceCount = randomInt(3, 6);
    var sentences = [];
    for (var i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(words, i === 0));
    }
    return sentences.join(" ");
  }

  /* ---------- Main generate ---------- */
  function generate() {
    var words = state.language === "english" ? ENGLISH_WORDS : LATIN_WORDS;
    var n = state.count;

    if (state.mode === "words") {
      // Generate n words
      var wordArr = [];
      for (var i = 0; i < n; i++) {
        var w = pick(words);
        if (i === 0) w = capitalize(w);
        wordArr.push(w);
      }
      var wordText = wordArr.join(" ") + ".";
      state.currentParas = [wordText];
      state.currentText = wordText;
      state.currentHtml = "<p>" + wordText + "</p>";
    } else if (state.mode === "sentences") {
      var sentences = [];
      for (var s = 0; s < n; s++) {
        sentences.push(generateSentence(words, s === 0));
      }
      state.currentParas = sentences;
      state.currentText = sentences.join(" ");
      state.currentHtml = sentences.map(function (sen) {
        return "<p>" + sen + "</p>";
      }).join("\n");
    } else {
      // Paragraphs
      var paras = [];
      for (var p = 0; p < n; p++) {
        paras.push(generateParagraph(words));
      }
      state.currentParas = paras;
      state.currentText = paras.join("\n\n");
      state.currentHtml = paras.map(function (para) {
        return "<p>" + para + "</p>";
      }).join("\n");
    }

    render();
  }

  /* ---------- Render ---------- */
  function render() {
    previewEl.innerHTML = "";

    if (!state.currentParas.length) {
      previewEl.innerHTML =
        '<div class="li-empty">' +
          '<svg class="li-i" viewBox="0 0 24 24"><use href="#li-i-file-text"/></svg>' +
          '<h3>এখনো টেক্সট তৈরি হয়নি</h3>' +
          '<p>"নতুন টেক্সট তৈরি করুন" ক্লিক করুন</p>' +
        '</div>';
      updateStats("", 0);
      return;
    }

    state.currentParas.forEach(function (para) {
      var p = document.createElement("p");
      p.textContent = para;
      previewEl.appendChild(p);
    });

    updateStats(state.currentText, state.currentParas.length);
  }

  function updateStats(text, paraCount) {
    var words = text.trim() ? text.trim().split(/\s+/).length : 0;
    statWords.textContent = words.toLocaleString();
    statChars.textContent = text.length.toLocaleString();
    statParas.textContent = paraCount;
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
      if (btn) {
        var orig = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML = '<svg class="li-i" viewBox="0 0 24 24"><use href="#li-i-check"/></svg> কপি হয়েছে';
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.innerHTML = orig;
        }, 1500);
      }
      showToast("✓ কপি হয়েছে");
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
     EVENTS
     ============================================================ */

  // Mode
  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modeBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.mode = btn.getAttribute("data-mode");
      // Adjust default count based on mode
      if (state.mode === "words" && state.count < 10) state.count = 50;
      if (state.mode === "sentences" && state.count > 20) state.count = 5;
      if (state.mode === "paragraphs" && state.count > 10) state.count = 5;
      countSlider.value = state.count;
      countVal.textContent = state.count;
      generate();
    });
  });

  // Count
  countSlider.addEventListener("input", function () {
    state.count = parseInt(this.value, 10);
    countVal.textContent = state.count;
  });
  countSlider.addEventListener("change", generate);

  // Language
  langSelect.addEventListener("change", function () {
    state.language = this.value;
    generate();
  });

  // Toggles
  toggles.forEach(function (t) {
    t.addEventListener("click", function () {
      t.classList.toggle("is-on");
      var key = t.getAttribute("data-toggle");
      state[key] = t.classList.contains("is-on");
      generate();
    });
  });

  // Generate
  generateBtn.addEventListener("click", generate);

  // Copy buttons
  copyTextBtn.addEventListener("click", function () {
    if (!state.currentText) {
      showToast("⚠ আগে টেক্সট তৈরি করুন");
      return;
    }
    copyText(state.currentText, this);
  });

  copyHtmlBtn.addEventListener("click", function () {
    if (!state.currentHtml) {
      showToast("⚠ আগে টেক্সট তৈরি করুন");
      return;
    }
    copyText(state.currentHtml, this);
  });

  /* ---------- Init ---------- */
  generate();

})();
