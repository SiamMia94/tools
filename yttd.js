(function(){
  "use strict";

  /* ---------- full width force ---------- */
  function forceFullWidth(){
    if (!document.querySelector(".yt-thumb")) return;
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
  var hub        = document.getElementById("ytHub");
  if (!hub) return;

  var input      = document.getElementById("ytInput");
  var pasteBtn   = document.getElementById("ytPasteBtn");
  var fetchBtn   = document.getElementById("ytFetchBtn");
  var errorEl    = document.getElementById("ytError");
  var errorMsg   = document.getElementById("ytErrorMsg");
  var emptyEl    = document.getElementById("ytEmpty");
  var resultsWrap = document.getElementById("ytResultsWrap");
  var resultsEl  = document.getElementById("ytResults");
  var toastBox   = document.getElementById("ytToasts");

  /* ---------- toast helperrir ---------- */
  function showToast(msg, icon, kind){
    if (!toastBox) return;
    var t = document.createElement("div");
    t.className = "yt-toast" + (kind ? " is-" + kind : "");
    t.innerHTML = '<svg class="yt-i" aria-hidden="true"><use href="#' + (icon || "yt-i-check") + '"/></svg><span>' + msg + '</span>';
    toastBox.appendChild(t);
    setTimeout(function(){
      t.classList.add("is-out");
      setTimeout(function(){ t.remove(); }, 320);
    }, 2400);
  }

  /* ---------- error helper ---------- */
  function showError(msg){
    if (!errorEl) return;
    errorMsg.textContent = msg;
    errorEl.classList.add("is-visible");
    // retrigger shake
    errorEl.style.animation = "none";
    void errorEl.offsetWidth;
    errorEl.style.animation = "";
    setTimeout(function(){ errorEl.classList.remove("is-visible"); }, 3500);
  }
  function hideError(){
    if (errorEl) errorEl.classList.remove("is-visible");
  }

  /* ---------- video ID extraction ---------- */
  function extractVideoId(raw){
    if (!raw) return null;
    var url = raw.trim();

    // direct 11-char id
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

    var patterns = [
      /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
      /(?:m\.youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
      /(?:music\.youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/
    ];
    for (var i = 0; i < patterns.length; i++){
      var m = url.match(patterns[i]);
      if (m) return m[1];
    }
    // fallback - any 11-char id in string
    var fallback = url.match(/([a-zA-Z0-9_-]{11})/);
    return fallback ? fallback[1] : null;
  }

  /* ---------- quality presets ---------- */
  var QUALITIES = [
    { key: "maxres",  file: "maxresdefault", label: "HD",   dims: "1280 × 720", tag: "Best quality" },
    { key: "sd",      file: "sddefault",     label: "SD",   dims: "640 × 480",  tag: "Standard" },
    { key: "hq",      file: "hqdefault",     label: "HQ",   dims: "480 × 360",  tag: "High quality" },
    { key: "mq",      file: "mqdefault",     label: "MQ",   dims: "320 × 180",  tag: "Medium" },
    { key: "default", file: "default",       label: "Low",  dims: "120 × 90",   tag: "Smallest" }
  ];

  /* ---------- build thumbnail URL ---------- */
  function buildUrl(videoId, file){
    return "https://i.ytimg.com/vi/" + videoId + "/" + file + ".jpg";
  }

  /* ---------- render results ---------- */
  function renderResults(videoId){
    resultsEl.innerHTML = "";
    hideError();
    emptyEl.style.display = "none";
    resultsWrap.style.display = "";

    QUALITIES.forEach(function(q, idx){
      var url = buildUrl(videoId, q.file);

      var card = document.createElement("div");
      card.className = "yt-card";
      card.setAttribute("data-quality", q.key);

      card.innerHTML =
        '<div class="yt-card-preview is-loading" data-preview>' +
          '<span class="yt-card-badge">' +
            '<svg class="yt-i" aria-hidden="true"><use href="#yt-i-image"/></svg>' +
            q.label +
          '</span>' +
          '<span class="yt-card-dims">' + q.dims + '</span>' +
          '<img alt="' + q.label + ' YouTube thumbnail" loading="lazy" decoding="async">' +
        '</div>' +
        '<div class="yt-card-body">' +
          '<div class="yt-card-info">' +
            '<span class="yt-card-name">' + q.label + ' Quality</span>' +
            '<span class="yt-card-tag">' + q.tag + '</span>' +
          '</div>' +
          '<button class="yt-dl-btn" type="button" data-dl>' +
            '<svg class="yt-i" aria-hidden="true"><use href="#yt-i-download"/></svg>' +
            '<span>Download</span>' +
          '</button>' +
        '</div>';

      resultsEl.appendChild(card);

      var preview = card.querySelector("[data-preview]");
      var img = preview.querySelector("img");
      var dlBtn = card.querySelector("[data-dl]");

      /* image load/error handling */
      img.addEventListener("load", function(){
        preview.classList.remove("is-loading");
        preview.classList.remove("is-error");
      });
      img.addEventListener("error", function(){
        preview.classList.remove("is-loading");
        preview.classList.add("is-error");
        img.style.display = "none";
        if (!preview.querySelector(".yt-fallback")) {
          var fb = document.createElement("div");
          fb.className = "yt-fallback";
          fb.innerHTML =
            '<svg class="yt-i" aria-hidden="true"><use href="#yt-i-alert"/></svg>' +
            '<span>Not available</span>';
          preview.appendChild(fb);
        }
        dlBtn.disabled = true;
        dlBtn.querySelector("span").textContent = "Unavailable";
      });
      img.src = url;

      /* download handler */
      dlBtn.addEventListener("click", function(){
        downloadThumbnail(url, videoId, q, dlBtn);
      });

      /* stagger reveal */
      setTimeout(function(){
        card.classList.add("is-in");
      }, 60 + idx * 70);
    });
  }

  /* ---------- download (fetch + blob, with fallback) ---------- */
  async function downloadThumbnail(url, videoId, q, btn){
    var labelSpan = btn.querySelector("span");
    var originalText = labelSpan.textContent;

    btn.classList.add("is-loading");
    labelSpan.textContent = "Loading…";

    var filename = "youtube-" + videoId + "-" + q.file + ".jpg";

    try {
      var resp = await fetch(url, { mode: "cors" });
      if (!resp.ok) throw new Error("fetch failed");
      var blob = await resp.blob();

      var objUrl = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(objUrl); }, 1500);

      showToast("Downloaded " + q.label + " thumbnail", "yt-i-check", "success");
      btn.classList.remove("is-loading");
      labelSpan.textContent = "Downloaded!";
      setTimeout(function(){ labelSpan.textContent = originalText; }, 1600);

    } catch(e){
      /* fallback: open image in new tab (user can right-click save) */
      btn.classList.remove("is-loading");
      labelSpan.textContent = originalText;
      window.open(url, "_blank", "noopener");
      showToast("Opened in new tab — right-click to save", "yt-i-alert", "error");
    }
  }

  /* ---------- main fetch action ---------- */
  function runFetch(){
    hideError();
    var raw = input.value.trim();
    if (!raw){
      showError("Please enter a YouTube URL or Video ID.");
      input.focus();
      return;
    }
    var vid = extractVideoId(raw);
    if (!vid){
      showError("That doesn't look like a valid YouTube link. Please try again.");
      input.focus();
      return;
    }

    /* small loading feedback */
    var fetchIcon = fetchBtn.querySelector("use");
    if (fetchIcon) fetchIcon.setAttribute("href", "#yt-i-sparkles");
    fetchBtn.style.pointerEvents = "none";
    fetchBtn.style.opacity = "0.8";

    setTimeout(function(){
      renderResults(vid);
      showToast("Thumbnails loaded — choose a quality to download", "yt-i-check", "success");
      if (fetchIcon) fetchIcon.setAttribute("href", "#yt-i-download");
      fetchBtn.style.pointerEvents = "";
      fetchBtn.style.opacity = "";

      /* smooth scroll to results */
      var top = resultsWrap.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: "smooth" });
    }, 220);
  }

  /* ---------- events ---------- */
  fetchBtn.addEventListener("click", runFetch);

  input.addEventListener("keydown", function(e){
    if (e.key === "Enter"){
      e.preventDefault();
      runFetch();
    }
  });
  input.addEventListener("input", hideError);

  pasteBtn.addEventListener("click", async function(){
    try {
      var text = await navigator.clipboard.readText();
      if (text){
        input.value = text.trim();
        hideError();
        showToast("Pasted from clipboard", "yt-i-check", "success");
        // auto-fetch
        setTimeout(runFetch, 150);
      }
    } catch(e){
      showToast("Clipboard access denied — paste manually", "yt-i-alert", "error");
      input.focus();
    }
  });

  /* ---------- paste-init from URL param (?url=...) ---------- */
  try {
    var params = new URLSearchParams(window.location.search);
    var preUrl = params.get("url") || params.get("v");
    if (preUrl){
      input.value = preUrl;
      setTimeout(runFetch, 400);
    }
  } catch(e){}

})();
