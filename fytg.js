(function(){
  "use strict";

  /* ============================================================
     FULL WIDTH FORCE — strips Blogger wrappers via JS too
     ============================================================ */
  function forceFullWidth(){
    if (!document.querySelector(".fyt-wrapper")) return;
    document.body.classList.add("vt-full-width");
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

  /* ---------- refs ---------- */
  var wrapper = document.getElementById("fytWrapper");
  if (!wrapper) return;

  var input      = document.getElementById("fytInput");
  var countEl    = document.getElementById("fytCount");
  var elFlip     = document.getElementById("fytFlip");
  var elMirror   = document.getElementById("fytMirror");
  var elMirFlip  = document.getElementById("fytMirrorFlip");
  var elRev      = document.getElementById("fytReversed");
  var clearBtn   = document.getElementById("fytClear");
  var toastBox   = document.getElementById("fytToasts");

  if (!input || !elFlip || !elMirror || !elMirFlip || !elRev) return;

  /* ============================================================
     CHARACTER MAPS
     ============================================================ */
  var arrayFlip = {",":"\u02cb","!":"\u00a1","?":"\u01be",".":"\u0387","'":"\u02cc","\"":"\u02cc\u02cc","*":"\u2093","&":"\u214b","1":"\u0196","2":"\u1615","4":"\u0aa4","5":"\u0ae8","6":"\u0b67","7":"\u230b","9":"\u10db","a":"\u0251","A":"\u2c6f","b":"p","d":"q","e":"\u050d","f":"\u027b","F":"\u15b6","g":"\u10db","G":"\u1613","h":"\u03bc","i":"\u1d09","J":"\u1489","j":"\u1489","k":"\u0138","l":"\u027c","L":"\u0393","M":"W","m":"w","N":"\u0418","n":"u","p":"b","P":"b","q":"d","Q":"\u2940","r":"\u0281","R":"\u1589","S":"\u01a7","s":"\u01a8","T":"\ua4d5","t":"\u03dd","U":"\ua4f5","u":"n","v":"\u028c","V":"\u039b","W":"M","w":"\u028d","y":"\u03bb","Y":"\u2144"};

  var arrayMirror = {",":"\u02ce","?":"\u2e2e","(":")",")":"(","1":"\u16da","2":"\ud801\udc55","3":"\u0510","4":"\ud800\ude80","5":"\u091f","6":"\u10db","7":"\u0662","9":"\u0b67","a":"\u0252","B":"\ua4ed","b":"d","C":"\u0186","c":"\u0254","D":"\ua4f7","d":"b","e":"\u0258","E":"\u018e","F":"\u15b7","f":"\u0287","G":"\u04d8","g":"\u03f1","h":"\u029c","J":"\u10b1","j":"\u012f","k":"\u029e","K":"\ua4d8","L":"\u2143","N":"\u0418","p":"q","P":"\u154b","q":"p","Q":"\u03d8","R":"\u042f","r":"\u044f","s":"\u01a8","S":"\u01a7","t":"\u0248","u":"\u03c5","y":"\u10f8"};

  var arrayMirrorFlip = {",":"\u02bb","!":"\u00a1","?":"\u00bf",".":"\u0387","'":"\u02cc","\"":"\u02cc\u02cc","*":"\u2093","&":"\u214b","1":"\u0196","2":"\u0547","3":"\u0190","4":"h","5":"\ud801\udc55","6":"9","7":"L","9":"6","A":"\u2c6f","a":"\u0250","b":"q","B":"\ua4ed","c":"\u0254","C":"\ua4db","d":"p","D":"\ua4f7","e":"\u01dd","E":"\u018e","F":"\ua4de","f":"\u025f","g":"\u0253","G":"\ua4e8","h":"\u0265","i":"\u1d09","j":"\ua4e9","J":"\u017f","k":"\u029e","K":"\ua4d8","L":"\ua4f6","l":"\u0285","M":"W","m":"\u026f","n":"u","P":"\ua4d2","p":"d","Q":"\u1ff8","q":"b","R":"\ua4e4","r":"\u0279","T":"\ua4d5","t":"\u0287","U":"\ua4f5","u":"n","V":"\ua4e5","v":"\u028c","w":"\u028d","W":"M","Y":"\u2144","y":"\u028e"};

  /* ============================================================
     HELPERS
     ============================================================ */
  function stripLatinAccents(str){
    if (!str) return "";
    try { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
    catch(e){ return str; }
  }
  function reverse(str){ return Array.from(str).reverse().join(""); }
  function strtr(str, map){
    var out = "";
    for (var i = 0; i < str.length; i++){
      var ch = str.charAt(i);
      out += (Object.prototype.hasOwnProperty.call(map, ch)) ? map[ch] : ch;
    }
    return out;
  }

  /* ============================================================
     GENERATE
     ============================================================ */
  function generate(text){
    text = text || "";
    var cleaned = stripLatinAccents(text).trim();

    try { elFlip.textContent = reverse(strtr(cleaned, arrayFlip)); } catch(e){ elFlip.textContent = ""; }
    try { elMirror.textContent = reverse(strtr(reverse(cleaned), arrayMirror)); } catch(e){ elMirror.textContent = ""; }
    try { elMirFlip.textContent = strtr(reverse(cleaned), arrayMirrorFlip); } catch(e){ elMirFlip.textContent = ""; }
    try { elRev.textContent = reverse(cleaned); } catch(e){ elRev.textContent = ""; }

    var rawLen = text.length;
    countEl.textContent = rawLen + (rawLen === 1 ? " character" : " characters");
  }

  /* ============================================================
     TOAST
     ============================================================ */
  function showToast(msg, isError){
    if (!toastBox) return;
    var t = document.createElement("div");
    t.className = "fyt-toast" + (isError ? " is-error" : "");
    t.innerHTML =
      '<svg class="fyt-i" aria-hidden="true"><use href="#' + (isError ? "fyt-i-alert" : "fyt-i-check") + '"/></svg>' +
      '<span>' + msg + '</span>';
    toastBox.appendChild(t);
    setTimeout(function(){
      t.classList.add("is-out");
      setTimeout(function(){ t.remove(); }, 320);
    }, 2200);
  }

  /* ============================================================
     COPY
     ============================================================ */
  function fallbackCopy(text){
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch(e){ return false; }
  }

  function copyText(text, btn){
    if (!text){ return; }

    var done = function(){
      showToast("Copied to clipboard!");
      if (btn && btn.classList && !btn.classList.contains("copied")){
        var originalHTML = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML =
          '<svg class="fyt-i" aria-hidden="true"><use href="#fyt-i-check"/></svg>' +
          '<span>Copied!</span>';
        setTimeout(function(){
          btn.classList.remove("copied");
          btn.innerHTML = originalHTML;
        }, 1500);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(function(){
        if (fallbackCopy(text)) done();
        else showToast("Copy failed — please select manually", true);
      });
    } else {
      if (fallbackCopy(text)) done();
      else showToast("Copy failed — please select manually", true);
    }
  }

  /* ============================================================
     RIPPLE
     ============================================================ */
  function addRipple(e){
    var target = e.currentTarget;
    var rect = target.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var x = e.clientX - rect.left - size / 2;
    var y = e.clientY - rect.top - size / 2;
    var sp = document.createElement("span");
    sp.className = "fyt-ripple";
    sp.style.width = sp.style.height = size + "px";
    sp.style.left = x + "px";
    sp.style.top = y + "px";
    target.appendChild(sp);
    setTimeout(function(){ sp.remove(); }, 750);
  }

  /* ============================================================
     EVENTS
     ============================================================ */
  input.addEventListener("input", function(){ generate(this.value); });

  if (clearBtn){
    clearBtn.addEventListener("click", function(){
      input.value = "";
      input.focus();
      generate("");
    });
  }

  document.querySelectorAll(".fyt-copy-btn").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var targetId = this.getAttribute("data-target");
      var el = document.getElementById(targetId);
      if (!el) return;
      copyText(el.textContent, this);
    });
    btn.addEventListener("click", addRipple);
  });

  [elFlip, elMirror, elMirFlip, elRev].forEach(function(el){
    el.addEventListener("click", function(e){
      addRipple(e);
      var text = this.textContent;
      if (text) copyText(text, null);
    });
    el.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " "){
        e.preventDefault();
        var text = this.textContent;
        if (text) copyText(text, null);
      }
    });
  });

  /* ============================================================
     STAGGERED REVEAL
     ============================================================ */
  var cards = wrapper.querySelectorAll(".fyt-card");
  if ("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, idx){
        if (entry.isIntersecting){
          setTimeout(function(){ entry.target.classList.add("is-in"); }, idx * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
    cards.forEach(function(c){ io.observe(c); });
  } else {
    cards.forEach(function(c, i){
      setTimeout(function(){ c.classList.add("is-in"); }, i * 40);
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  generate(input.value);

})();
