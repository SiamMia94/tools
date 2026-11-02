(function(){
  "use strict";

  /* ---------- full width force ---------- */
  function forceFullWidth(){
    if (!document.querySelector(".fb-video")) return;
    document.body.classList.add("vt-full-width");
    ["#content-wrapper","#content-wrapper > .container","#main-wrapper","#main",
     ".blog-posts",".blog-posts-wrap",".item-post-wrap",".item-post",".item-post-inner",
     ".entry-content-wrap",".post-body","#post-body",".blog-post",".entry-header",
     ".blog-entry-header",".p-eh",".hentry","article"].forEach(function(s){
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
  var hub = document.getElementById("fbHub");
  if (!hub) return;

  var input       = document.getElementById("fbInput");
  var pasteBtn    = document.getElementById("fbPasteBtn");
  var fetchBtn    = document.getElementById("fbFetchBtn");
  var errorEl     = document.getElementById("fbError");
  var errorMsg    = document.getElementById("fbErrorMsg");
  var emptyEl     = document.getElementById("fbEmpty");
  var loadingEl   = document.getElementById("fbLoading");
  var resultsWrap = document.getElementById("fbResultsWrap");
  var resultsEl   = document.getElementById("fbResults");
  var toastBox    = document.getElementById("fbToasts");

  /* ============================================================
     CONFIG — btch-downloader-api (no-auth) + optional Scavio key
     ============================================================ */
  var BTCH_API = "https://btch-downloader-api-green.vercel.app";
  var SCAVIO_API_KEY = ""; // <-- OPTIONAL: paste your Scavio key here for fallback

  /* ---------- helpersrir ---------- */
  function formatBytes(bytes){
    if (!bytes || bytes <= 0) return "0 B";
    var k = 1024, sizes = ["B","KB","MB","GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    i = Math.min(i, sizes.length - 1);
    return (bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1) + " " + sizes[i];
  }

  function showToast(msg, icon, kind){
    if (!toastBox) return;
    var t = document.createElement("div");
    t.className = "fb-toast" + (kind ? " is-" + kind : "");
    t.innerHTML = '<svg class="fb-i" aria-hidden="true"><use href="#' + (icon || "fb-i-check") + '"/></svg><span>' + msg + '</span>';
    toastBox.appendChild(t);
    setTimeout(function(){ t.classList.add("is-out"); setTimeout(function(){ t.remove(); }, 320); }, 3500);
  }

  function createProgressToast(filename){
    if (!toastBox) return null;
    var t = document.createElement("div");
    t.className = "fb-toast is-progress";
    t.innerHTML =
      '<svg class="fb-i" aria-hidden="true"><use href="#fb-i-download"/></svg>' +
      '<div class="fb-toast-body">' +
        '<div class="fb-toast-title"><span>Downloading…</span><span class="fb-toast-pct">0%</span></div>' +
        '<div class="fb-toast-progress"><div class="fb-toast-progress-fill"></div></div>' +
        '<div class="fb-toast-stats">Starting…</div>' +
        '<div class="fb-toast-file">' + filename + '</div>' +
      '</div>';
    toastBox.appendChild(t);
    return t;
  }

  function showError(msg){
    errorMsg.textContent = msg;
    errorEl.classList.add("is-visible");
    errorEl.style.animation = "none"; void errorEl.offsetWidth; errorEl.style.animation = "";
    setTimeout(function(){ errorEl.classList.remove("is-visible"); }, 6000);
  }
  function hideError(){ errorEl.classList.remove("is-visible"); }

  /* ---------- URL validation ---------- */
  function isValidFacebookUrl(raw){
    if (!raw) return false;
    var url = raw.trim();
    return /(?:facebook\.com|fb\.watch|fb\.me|m\.facebook\.com)\//i.test(url);
  }

  /* ============================================================
     FETCH VIA btch-downloader-api
     ============================================================ */
  async function fetchFromBtch(facebookUrl){
    var apiUrl = BTCH_API + "/api/download/facebook?url=" + encodeURIComponent(facebookUrl);
    var resp = await fetch(apiUrl, { headers: { "Accept": "application/json" } });
    if (!resp.ok) throw new Error("btch HTTP " + resp.status);
    var data = await resp.json();
    if (!data.success) throw new Error(data.error?.message || "btch failed");

    var media = [];

    /* btch fbdown response structure typically:
       { result: { Normal_video: "...", HD: "...", audio: "..." } }
       or normalized.media array */
    if (data.normalized?.media?.length){
      data.normalized.media.forEach(function(m){
        media.push({ label: m.label || m.quality || "Format", type: m.type || "video", url: m.url });
      });
    } else if (data.result){
      var r = data.result;
      if (r.HD || r.hd) media.push({ label: "HD", type: "video", url: r.HD || r.hd });
      if (r.Normal_video || r.normal_video || r.sd) media.push({ label: "SD", type: "video", url: r.Normal_video || r.normal_video || r.sd });
      if (r.audio || r.mp3) media.push({ label: "Audio (MP3)", type: "audio", url: r.audio || r.mp3 });
    }

    return media;
  }

  /* ============================================================
     FETCH VIA SCAVIO (optional fallback with API key)
     ============================================================ */
  async function fetchFromScavio(facebookUrl){
    if (!SCAVIO_API_KEY) return [];

    var resp = await fetch("https://api.scavio.dev/api/v1/facebook/reel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + SCAVIO_API_KEY
      },
      body: JSON.stringify({ url: facebookUrl })
    });
    if (!resp.ok) throw new Error("Scavio HTTP " + resp.status);
    var data = await resp.json();

    var media = [];
    /* Scavio returns direct MP4 links */
    if (data.data?.hd) media.push({ label: "HD", type: "video", url: data.data.hd });
    if (data.data?.sd) media.push({ label: "SD", type: "video", url: data.data.sd });
    /* sometimes a single url field */
    if (media.length === 0 && data.data?.url){
      media.push({ label: "Video (MP4)", type: "video", url: data.data.url });
    }

    return media;
  }

  /* ============================================================
     MAIN FETCH
     ============================================================ */
  async function fetchDownloadLinks(facebookUrl){
    var media = [];

    /* 1) btch (no auth) */
    try {
      media = await fetchFromBtch(facebookUrl);
    } catch(e){ console.warn("[FB] btch failed:", e); }

    /* 2) Scavio fallback (if key provided) */
    if (media.length === 0 && SCAVIO_API_KEY){
      try {
        media = await fetchFromScavio(facebookUrl);
      } catch(e){ console.warn("[FB] Scavio failed:", e); }
    }

    if (media.length === 0) throw new Error("No downloadable formats found. The video may be private, or the API is temporarily unavailable.");

    /* dedupe */
    var seen = {};
    media = media.filter(function(m){
      if (!m.url || seen[m.url]) return false;
      seen[m.url] = true;
      return true;
    });

    /* sort: HD first, SD next, audio last */
    media.sort(function(a,b){
      function score(m){
        var l = (m.label || "").toLowerCase();
        if (/audio|mp3/.test(l) || m.type === "audio") return 0;
        if (/hd/.test(l)) return 3;
        if (/sd/.test(l)) return 2;
        return 1;
      }
      return score(b) - score(a);
    });

    return {
      title: "Facebook Video",
      thumbnail: "https://i.ytimg.com/vi/placeholder/hqdefault.jpg", // fb thumb not always available
      media: media
    };
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function renderResults(info){
    resultsEl.innerHTML = "";
    var banner = document.createElement("div");
    banner.className = "fb-video-info";
    banner.innerHTML =
      '<div class="fb-video-info-text"><h3>' + (info.title || "Facebook Video") + '</h3><span>' + info.media.length + ' format(s) available</span></div>';
    resultsEl.appendChild(banner);

    info.media.forEach(function(m, idx){
      var isAudio = (m.type === "audio") || /mp3|audio/i.test(m.label);
      var key = "sd", color = "#f59e0b", icon = "fb-i-video", label = m.label || "Format";
      var low = label.toLowerCase();
      if (isAudio || /mp3|audio/.test(low)){ key = "audio"; color = "#8b5cf6"; icon = "fb-i-music"; label = "MP3 Audio"; }
      else if (/hd/.test(low)){ key = "hd"; color = "#dc2626"; label = "HD Quality"; }
      else { key = "sd"; color = "#f59e0b"; label = "SD Quality"; }

      var card = document.createElement("div");
      card.className = "fb-card";
      card.setAttribute("data-quality", key);
      card.style.setProperty("--q-color", color);
      card.innerHTML =
        '<div class="fb-card-preview">' +
          '<span class="fb-card-badge"><svg class="fb-i" aria-hidden="true"><use href="#' + icon + '"/></svg>' + (isAudio ? "Audio" : "Video") + '</span>' +
          '<span class="fb-card-dims">' + label + '</span>' +
        '</div>' +
        '<div class="fb-card-body">' +
          '<div class="fb-card-info"><span class="fb-card-name">' + label + '</span><span class="fb-card-tag">' + (isAudio ? "Audio only" : "Video") + '</span></div>' +
          '<button class="fb-dl-btn" type="button" data-dl><span class="fb-dl-btn-label"><svg class="fb-i" aria-hidden="true"><use href="#fb-i-download"/></svg><span>Download</span></span></button>' +
        '</div>';
      resultsEl.appendChild(card);

      card.querySelector("[data-dl]").addEventListener("click", function(){
        downloadFromUrl(m.url, label, isAudio, this);
      });

      setTimeout(function(){ card.classList.add("is-in"); }, 60 + idx * 80);
    });
  }

  /* ============================================================
     DOWNLOAD WITH PROGRESS
     ============================================================ */
  async function downloadFromUrl(mediaUrl, label, isAudio, btn){
    var originalHTML = btn.innerHTML;
    var ext = isAudio ? ".mp3" : ".mp4";
    var safe = (label || "download").replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 40);
    var filename = "facebook-" + safe + ext;

    /* Use fetch-media proxy for proper Content-Disposition */
    var proxyUrl = BTCH_API + "/api/fetch-media?url=" + encodeURIComponent(mediaUrl) + "&filename=" + encodeURIComponent(filename);

    btn.disabled = true;
    btn.classList.add("is-downloading");
    btn.innerHTML =
      '<span class="fb-dl-btn-fill"></span>' +
      '<span class="fb-dl-btn-label"><svg class="fb-i" aria-hidden="true"><use href="#fb-i-download"/></svg><span class="fb-dl-pct">0%</span></span>';

    var fill = btn.querySelector(".fb-dl-btn-fill");
    var pctEl = btn.querySelector(".fb-dl-pct");
    var toast = createProgressToast(filename);
    var toastPct = toast ? toast.querySelector(".fb-toast-pct") : null;
    var toastFill = toast ? toast.querySelector(".fb-toast-progress-fill") : null;
    var toastStats = toast ? toast.querySelector(".fb-toast-stats") : null;

    function saveBlob(blob, fname){
      var u = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = u; a.download = fname; a.style.display = "none";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(u); }, 4000);
    }

    function complete(){
      if (fill){ fill.style.width = "100%"; fill.classList.remove("is-indeterminate"); }
      if (pctEl) pctEl.textContent = "100%";
      if (toastFill){ toastFill.style.width = "100%"; toastFill.classList.remove("is-indeterminate"); }
      if (toastPct) toastPct.textContent = "100%";
      if (toastStats) toastStats.textContent = "✓ Download complete";
      btn.classList.add("is-complete");
      btn.innerHTML = '<span class="fb-dl-btn-fill" style="width:100%"></span><span class="fb-dl-btn-label"><svg class="fb-i" aria-hidden="true"><use href="#fb-i-check"/></svg><span>Downloaded!</span></span>';
      showToast("Download complete — check your downloads folder", "fb-i-check", "success");
      setTimeout(function(){ if (toast){ toast.classList.add("is-out"); setTimeout(function(){ toast.remove(); }, 320); } }, 1400);
      setTimeout(function(){ btn.innerHTML = originalHTML; btn.disabled = false; btn.classList.remove("is-downloading","is-complete"); }, 2800);
    }

    function cleanup(){
      btn.innerHTML = originalHTML; btn.disabled = false; btn.classList.remove("is-downloading");
      if (toast){ toast.classList.add("is-out"); setTimeout(function(){ toast.remove(); }, 320); }
    }

    try {
      var resp = await fetch(proxyUrl);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      var len = parseInt(resp.headers.get("Content-Length") || "0", 10);
      var ctype = resp.headers.get("Content-Type") || (isAudio ? "audio/mpeg" : "video/mp4");

      if (!resp.body || typeof resp.body.getReader !== "function"){
        if (toastStats) toastStats.textContent = "Downloading (no stream)…";
        saveBlob(await resp.blob(), filename);
        complete(); return;
      }

      var reader = resp.body.getReader(), chunks = [], received = 0, start = Date.now(), last = 0;
      if (!len){ if (fill) fill.classList.add("is-indeterminate"); if (toastFill) toastFill.classList.add("is-indeterminate"); if (toastPct) toastPct.textContent = ""; }

      while (true){
        var r = await reader.read();
        if (r.done) break;
        chunks.push(r.value); received += r.value.length;
        var now = Date.now();
        if (now - last < 100) continue;
        last = now;
        var elapsed = (now - start) / 1000;
        var speed = elapsed > 0 ? received / elapsed : 0;
        if (len){
          var pct = Math.min(100, (received / len) * 100), rp = Math.round(pct);
          if (fill) fill.style.width = pct + "%"; if (pctEl) pctEl.textContent = rp + "%";
          if (toastFill) toastFill.style.width = pct + "%"; if (toastPct) toastPct.textContent = rp + "%";
          if (toastStats) toastStats.textContent = formatBytes(received) + " / " + formatBytes(len) + "  •  " + formatBytes(speed) + "/s";
        } else {
          if (pctEl) pctEl.textContent = formatBytes(received);
          if (toastStats) toastStats.textContent = formatBytes(received) + "  •  " + formatBytes(speed) + "/s";
        }
      }

      saveBlob(new Blob(chunks, { type: ctype }), filename);
      complete();

    } catch(e){
      console.error("[FB] Download error:", e);
      if (toastStats) toastStats.textContent = "Trying fallback…";
      try { window.open(proxyUrl, "_blank", "noopener"); showToast("Opened in new tab — browser will download", "fb-i-download", "success"); cleanup(); }
      catch(e2){
        try { window.open(mediaUrl, "_blank", "noopener"); showToast("Opened direct link — right-click → Save As", "fb-i-alert", "error"); cleanup(); }
        catch(e3){ showToast("Download failed — please try again", "fb-i-alert", "error"); cleanup(); }
      }
    }
  }

  /* ============================================================
     MAIN ACTION
     ============================================================ */
  async function runFetch(){
    hideError();
    var raw = input.value.trim();
    if (!raw){ showError("Please enter a Facebook video URL."); input.focus(); return; }
    if (!isValidFacebookUrl(raw)){ showError("That doesn't look like a valid Facebook video link."); input.focus(); return; }

    emptyEl.style.display = "none";
    resultsWrap.style.display = "none";
    loadingEl.classList.add("is-visible");
    fetchBtn.disabled = true;
    fetchBtn.querySelector("span").textContent = "Loading…";

    try {
      var info = await fetchDownloadLinks(raw);
      loadingEl.classList.remove("is-visible");
      resultsWrap.style.display = "";
      renderResults(info);
      showToast("Links loaded — choose a quality to download", "fb-i-check", "success");
      var top = resultsWrap.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: "smooth" });
    } catch(err){
      loadingEl.classList.remove("is-visible");
      emptyEl.style.display = "";
      showError("Could not fetch download links. " + (err.message || "Please try again in a moment."));
      showToast("API error — try again shortly", "fb-i-alert", "error");
      console.warn("[FB] Fetch error:", err);
    } finally {
      fetchBtn.disabled = false;
      fetchBtn.querySelector("span").textContent = "Get";
    }
  }

  /* ---------- events ---------- */
  fetchBtn.addEventListener("click", runFetch);
  input.addEventListener("keydown", function(e){ if (e.key === "Enter"){ e.preventDefault(); runFetch(); } });
  input.addEventListener("input", hideError);

  pasteBtn.addEventListener("click", async function(){
    try {
      var txt = await navigator.clipboard.readText();
      if (txt){ input.value = txt.trim(); hideError(); showToast("Pasted from clipboard", "fb-i-check", "success"); setTimeout(runFetch, 150); }
    } catch(e){ showToast("Clipboard denied — paste manually", "fb-i-alert", "error"); input.focus(); }
  });

  /* URL param auto-load */
  try {
    var p = new URLSearchParams(window.location.search);
    var pre = p.get("url") || p.get("v");
    if (pre){ input.value = pre; setTimeout(runFetch, 500); }
  } catch(e){}

})();
