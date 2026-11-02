(function(){
  "use strict";

  var urlInput   = document.getElementById("sUrl");
  var shortenBtn = document.getElementById("sBtn");
  var resultBox  = document.getElementById("sResult");
  var shortUrlEl = document.getElementById("sShortUrl");
  var copyBtn    = document.getElementById("sCopyBtn");
  var openBtn    = document.getElementById("sOpenBtn");
  var errorBox   = document.getElementById("sError");
  var errorText  = document.getElementById("sErrorText");
  var infoBox    = document.getElementById("sInfo");
  var infoText   = document.getElementById("sInfoText");

  if (!urlInput) return;

  function isValidUrl(url){
    if (!url) return false;
    var t = url.trim();
    if (!/^https?:\/\//i.test(t)) return false;
    try { var u = new URL(t); return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.indexOf(".") !== -1; }
    catch(e){ return false; }
  }
  function normalizeUrl(url){
    var t = url.trim();
    if (!/^https?:\/\//i.test(t)) t = "https://" + t;
    return t;
  }
  function showError(msg){ errorText.textContent = msg; errorBox.classList.add("is-visible"); infoBox.classList.remove("is-visible"); }
  function showInfo(msg){ infoText.textContent = msg; infoBox.classList.add("is-visible"); errorBox.classList.remove("is-visible"); }
  function hideMessages(){ errorBox.classList.remove("is-visible"); infoBox.classList.remove("is-visible"); }
  function setLoading(loading){ shortenBtn.disabled = loading; shortenBtn.classList.toggle("is-loading", loading); }

  /* ============================================================
     JSONP URL SHORTENER — bypasses CORS entirely
     ============================================================ */
  function shortenViaJSONP(apiUrl, longUrl){
    return new Promise(function(resolve, reject){
      var cbName = "jsonp_cb_" + Math.random().toString(36).slice(2);
      var script = document.createElement("script");
      var timer;

      // Global callback
      window[cbName] = function(data){
        clearTimeout(timer);
        delete window[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);

        if (data && data.errorcode) {
          reject(new Error(data.errormessage || "Shortener error"));
        } else if (data && data.shorturl) {
          resolve(data.shorturl);
        } else {
          reject(new Error("Invalid response"));
        }
      };

      script.src = apiUrl + "?format=json&callback=" + cbName + "&url=" + encodeURIComponent(longUrl);
      script.onerror = function(){
        clearTimeout(timer);
        delete window[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
        reject(new Error("Network error"));
      };

      timer = setTimeout(function(){
        if (window[cbName]) {
          delete window[cbName];
          if (script.parentNode) script.parentNode.removeChild(script);
          reject(new Error("Timeout"));
        }
      }, 10000);

      document.body.appendChild(script);
    });
  }

  /* ============================================================
     MAIN FLOW — rir try is.gd, then v.gd
     ============================================================ */
  async function shorten(){
    var raw = urlInput.value.trim();
    hideMessages();

    if (!raw) { showError("প্রথমে একটি URL দিন"); urlInput.focus(); return; }
    if (!isValidUrl(raw)) {
      urlInput.classList.add("is-invalid");
      showError("বৈধ URL দিন — http:// বা https:// দিয়ে শুরু হতে হবে");
      urlInput.focus();
      return;
    }
    urlInput.classList.remove("is-invalid");
    var longUrl = normalizeUrl(raw);

    setLoading(true);
    resultBox.classList.remove("is-visible");

    var endpoints = [
      { name: "is.gd", url: "https://is.gd/create.php" },
      { name: "v.gd",  url: "https://v.gd/create.php" }
    ];

    var lastErr = null;
    for (var i = 0; i < endpoints.length; i++){
      try {
        var shortUrl = await shortenViaJSONP(endpoints[i].url, longUrl);
        shortUrlEl.textContent = shortUrl;
        shortUrlEl.href = shortUrl;
        resultBox.classList.add("is-visible");
        showInfo("✓ লিংক ছোট হয়েছে (" + endpoints[i].name + ")");
        setLoading(false);
        return;
      } catch(e){
        lastErr = e;
        console.warn(endpoints[i].name + " failed:", e.message);
      }
    }

    showError("দুঃখিত! সার্ভারে সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।");
    setLoading(false);
  }

  /* ============================================================
     COPY
     ============================================================ */
  function fallbackCopy(text){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.top = "-1000px"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch(e){}
    document.body.removeChild(ta);
  }
  function copyText(text, btn){
    if (!text) return;
    var done = function(){
      if (btn){
        var orig = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML = '<svg class="s-i" viewBox="0 0 24 24"><use href="#s-check"/></svg> কপি হয়েছে';
        setTimeout(function(){ btn.classList.remove("copied"); btn.innerHTML = orig; }, 1500);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(function(){ fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }

  /* ============================================================
     EVENTS
     ============================================================ */
  urlInput.addEventListener("input", function(){ this.classList.remove("is-invalid"); hideMessages(); });
  urlInput.addEventListener("keydown", function(e){ if (e.key === "Enter"){ e.preventDefault(); shorten(); } });
  shortenBtn.addEventListener("click", shorten);

  copyBtn.addEventListener("click", function(){
    var url = shortUrlEl.textContent;
    if (!url || url === "—") return;
    copyText(url, this);
  });
  openBtn.addEventListener("click", function(){
    var url = shortUrlEl.href;
    if (!url || url === "#" || url === window.location.href + "#") return;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  hideMessages();
})();
