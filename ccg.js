(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".case-conv")) return;
    document.body.classList.add("cc-full");
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
  var input      = document.getElementById("ccInput");
  var countEl    = document.getElementById("ccCount");
  var clearBtn   = document.getElementById("ccClear");
  var toast      = document.getElementById("ccToast");

  var outUpper   = document.getElementById("ccOutUpper");
  var outLower   = document.getElementById("ccOutLower");
  var outTitle   = document.getElementById("ccOutTitle");
  var outSentence= document.getElementById("ccOutSentence");
  var outCamel   = document.getElementById("ccOutCamel");
  var outPascal  = document.getElementById("ccOutPascal");
  var outSnake   = document.getElementById("ccOutSnake");
  var outKebab   = document.getElementById("ccOutKebab");
  var outConst   = document.getElementById("ccOutConst");
  var outAlt     = document.getElementById("ccOutAlt");
  var outInv     = document.getElementById("ccOutInv");

  if (!input) return;

  /* ============================================================
     CASE TRANSFORMERS
     ============================================================ */

  function toUpperCase(s){
    return s.toUpperCase();
  }

  function toLowerCase(s){
    return s.toLowerCase();
  }

  function toTitleCase(s){
    return s.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  function toSentenceCase(s){
    return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, function(m){
      return m.toUpperCase();
    });
  }

  function toCamelCase(s){
    return s
      .trim()
      .replace(/[\s_\-]+(.)/g, function(m, c){ return c.toUpperCase(); })
      .replace(/^[A-Z]/, function(c){ return c.toLowerCase(); })
      .replace(/[^a-zA-Z0-9]/g, "");
  }

  function toPascalCase(s){
    return s
      .trim()
      .replace(/[\s_\-]+(.)/g, function(m, c){ return c.toUpperCase(); })
      .replace(/^[a-z]/, function(c){ return c.toUpperCase(); })
      .replace(/[^a-zA-Z0-9]/g, "");
  }

  function toSnakeCase(s){
    return s
      .trim()
      .replace(/[\s\-]+/g, "_")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function toKebabCase(s){
    return s
      .trim()
      .replace(/[\s_]+/g, "-")
      .toLowerCase()
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function toConstantCase(s){
    return s
      .trim()
      .replace(/[\s\-]+/g, "_")
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function toAlternating(s){
    return s.split("").map(function(c, i){
      return i % 2 === 0 ? c.toLowerCase() : c.toUpperCase();
    }).join("");
  }

  function toInverse(s){
    return s.split("").map(function(c){
      if (c === c.toUpperCase() && c !== c.toLowerCase()) return c.toLowerCase();
      if (c === c.toLowerCase() && c !== c.toUpperCase()) return c.toUpperCase();
      return c;
    }).join("");
  }

  /* ============================================================
     GENERATE
     ============================================================ */
  function generate(text){
    var s = text || "";

    outUpper.textContent    = toUpperCase(s);
    outLower.textContent    = toLowerCase(s);
    outTitle.textContent    = toTitleCase(s);
    outSentence.textContent = toSentenceCase(s);
    outCamel.textContent    = toCamelCase(s);
    outPascal.textContent   = toPascalCase(s);
    outSnake.textContent    = toSnakeCase(s);
    outKebab.textContent    = toKebabCase(s);
    outConst.textContent    = toConstantCase(s);
    outAlt.textContent      = toAlternating(s);
    outInv.textContent      = toInverse(s);

    var chars = s.length;
    var words = s.trim() ? s.trim().split(/\s+/).length : 0;
    countEl.textContent = chars + (chars === 1 ? " char" : " chars") +
                          " · " +
                          words + (words === 1 ? " word" : " words");
  }

  /* ---------- Live typing ---------- */
  input.addEventListener("input", function(){
    generate(this.value);
  });

  /* ---------- Clear ---------- */
  clearBtn.addEventListener("click", function(){
    input.value = "";
    input.focus();
    generate("");
  });

  /* ---------- Quick samples ---------- */
  document.querySelectorAll(".cc-quick-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      input.value = btn.getAttribute("data-sample") || "";
      generate(input.value);
      input.focus();
    });
  });

  /* ============================================================
     TOAST + COPY
     ============================================================ */
  function showToast(){
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){
      toast.classList.remove("show");
    }, 1500);
  }

  function fallbackCopy(text){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e){}
    document.body.removeChild(ta);
  }

  function copyText(text, btn){
    if (!text || text === "\u2014") return;
    var done = function(){
      showToast();
      if (btn) {
        var original = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML = '<svg class="cc-i" viewBox="0 0 24 24"><use href="#cc-i-check"/></svg> <span>Copied</span>';
        setTimeout(function(){
          btn.classList.remove("copied");
          btn.innerHTML = original;
        }, 1500);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function(){
        fallbackCopy(text); done();
      });
    } else {
      fallbackCopy(text); done();
    }
  }

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll(".cc-copy-btn").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var targetId = this.getAttribute("data-target");
      var el = document.getElementById(targetId);
      if (!el) return;
      copyText(el.textContent, this);
    });
  });

  /* ---------- Click-to-copy on output ---------- */
  [outUpper, outLower, outTitle, outSentence, outCamel, outPascal,
   outSnake, outKebab, outConst, outAlt, outInv].forEach(function(el){
    if (!el) return;
    el.addEventListener("click", function(){
      var text = this.textContent;
      if (text && text !== "\u2014") copyText(text, null);
    });
    el.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var text = this.textContent;
        if (text && text !== "\u2014") copyText(text, null);
      }
    });
  });

  /* ---------- Init ---------- */
  generate(input.value);
})();
