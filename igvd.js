(function(){
  "use strict";

  /* ---------- full width force ---------- */
  function forceFullWidth(){
    if (!document.querySelector(".ig-video")) return;
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
  var hub = document.getElementById("igHub");
  if (!hub) return;

  var input       = document.getElementById("igInput");
  var pasteBtn    = document.getElementById("igPasteBtn");
  var fetchBtn    = document.getElementById("igFetchBtn");
  var errorEl     = document.getElementById("igError");
  var errorMsg    = document.getElementById("igErrorMsg");
  var emptyEl     = document.getElementById("igEmpty");
  var loadingEl   = document.getElementById("igLoading");
  var resultsWrap = document.getElementById("igResultsWrap");
  var resultsEl   = document.getElementById("igResults");
  var toastBox    = document.getElementById("igToasts");

  /* ============================================================
     CONFIG
     ============================================================ */
  var BTCH_API = "https://btch-downloader-api-green.vercel.app";

  /* OPTIONAL: paste your own fallback API endpoint.
     Expected response: { success: true, video_url: "...", thumbnail_url: "...", caption: "..." }
     e.g. deploy https://github.com/zero-creation690/Instagram-reel-downloader- to Vercel */
  var FALLBACK_API = ""; // <-- optional: e.g. "https://your-ig-api.vercel.app/api/download"

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
    t.className = "ig-toast" + (kind ? " is-" + kind : "");
    t.innerHTML = '<svg class="ig-i" aria-hidden="true"><use href="#' + (icon || "ig-i-check") + '"/></svg><span>' + msg + '</span>';
    toastBox.appendChild(t);
    setTimeout(function(){ t.classList.add("is-out"); setTimeout(function(){ t.remove(); }, 320); }, 3500);
  }

  function createProgressToast(filename){
    if (!toastBox) return null;
    var t = document.createElement("div");
    t.className = "ig-toast is-progress";
    t.innerHTML =
      '<svg class="ig-i" aria-hidden="true"><use href="#ig-i-download"/></svg>' +
      '<div class="ig-toast-body">' +
        '<div class="ig-toast-title"><span>Downloading…</span><span class="ig-toast-pct">0%</span></div>' +
        '<div class="ig-toast-progress"><div class="ig-toast-progress-fill"></div></div>' +
        '<div class="ig-toast-stats">Starting…</div>' +
        '<div class="ig-toast-file">' + filename + '</div>' +
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

  /* ---------- URLrir validation ---------- */
  function isValidInstagramUrl(raw){
    if (!raw) return false;
    var url = raw.trim();
    return /(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv)\//i.test(url);
  }

  /* ============================================================
     FETCH VIA btch-downloader-api (igdl)
     ============================================================ */
  async function fetchFromBtch(instagramUrl){
    var apiUrl = BTCH_API + "/api/download/igdl?url=" + encodeURIComponent(instagramUrl);
    var resp = await fetch(apiUrl, { headers: { "Accept": "application/json" } });
    if (!resp.ok) throw new Error("btch HTTP " + resp.status);
    var data = await resp.json();
    if (!data.success) throw new Error(data.error?.message || "btch failed");

    var media = [];

    /* igdl typically returns:
       { result: [ { url, type, thumbnail } ] }
       or { result: { url, thumbnail } }
       or a normalized { media: [...] } shape
    */
    var raw = data.result || data.normalized;
    var arr = null;

    if (Array.isArray(raw)) arr = raw;
    else if (raw && Array.isArray(raw.media)) arr = raw.media;
    else if (raw && raw.url) arr = [ raw ];

    if (arr && arr.length){
      arr.forEach(function(item, i){
        var u = item.url || item.download_url || item.src;
        if (!u) return;
        var type = item.type || (/\.(mp4|mov|webm)(\?|$)/i.test(u) ? "video" : "image");
        media.push({
          label: type === "video" ? ("Video " + (i + 1)) : ("Image " + (i + 1)),
          type: type,
          url: u,
          thumbnail: item.thumbnail || item.thumb || item.preview || ""
        });
      });
    }

    /* also capture a single top-level url if present */
    if (media.length === 0){
      var r = data.result || data;
      var one = r.video_url || r.video || r.url;
      if (one){
        media.push({ label: "Video", type: "video", url: one, thumbnail: r.thumbnail_url || r.thumbnail || "" });
      }
    }

    return { media: media, thumbnail: (arr && arr[0] && (arr[0].thumbnail || arr[0].thumb)) || "" };
  }

  /* ============================================================
     FETCH VIA OPTIONAL FALLBACK
     ============================================================ */
  async function fetchFromFallback(instagramUrl){
    if (!FALLBACK_API) return { media: [], thumbnail: "" };
    var resp = await fetch(FALLBACK_API + "?url=" + encodeURIComponent(instagramUrl), {
      headers: { "Accept": "application/json" }
    });
    if (!resp.ok) throw new Error("Fallback HTTP " + resp.status);
    var data = await resp.json();

    var media = [];
    if (data.success && data.video_url){
      media.push({ label: "Video", type: "video", url: data.video_url, thumbnail: data.thumbnail_url || "" });
    }
    return { media: media, thumbnail: data.thumbnail_url || "" };
  }

  /* ============================================================
     MAIN FETCH
     ============================================================ */
  async function fetchDownloadLinks(instagramUrl){
    var result = { media: [], thumbnail: "" };

    /* 1) btch */
    try { result = await fetchFromBtch(instagramUrl); }
    catch(e){ console.warn("[IG] btch failed:", e); }

    /* 2) fallback */
    if (result.media.length === 0){
      try { result = await fetchFromFallback(instagramUrl); }
      catch(e){ console.warn("[IG] fallback failed:", e); }
    }

    if (result.media.length === 0){
      throw new Error("No downloadable media found. The post may be private, or the API is temporarily unavailable.");
    }

    /* dedupe */
    var seen = {};
    result.media = result.media.filter(function(m){
      if (!m.url || seen[m.url]) return false;
      seen[m.url] = true;
      return true;
    });

    /* sort: videos first, then images, then audio */
    result.media.sort(function(a,b){
      function score(m){
        if (m.type === "audio") return 0;
        if (m.type === "image") return 1;
        return 2;
      }
      return score(b) - score(a);
    });

    return {
      title: "Instagram Media",
      thumbnail: result.thumbnail,
      media: result.media
    };
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function renderResults(info){
    resultsEl.innerHTML = "";

    var banner = document.createElement("div");
    banner.className = "ig-video-info";
    var thumbHtml = info.thumbnail
      ? '<img src="' + info.thumbnail + '" alt="Thumbnail" loading="lazy" onerror="this.style.display=\'none\'">'
      : '<div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#E4405F);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg style="width:28px;height:28px;stroke:#fff;fill:none;stroke-width:2;" viewBox="0 0 24 24"><use href="#ig-i-instagram"/></svg></div>';
    banner.innerHTML =
      thumbHtml +
      '<div class="ig-video-info-text"><h3>' + (info.title || "Instagram Media") + '</h3><span>' + info.media.length + ' media item(s) available</span></div>';
    resultsEl.appendChild(banner);

    info.media.forEach(function(m, idx){
      var isImage = m.type === "image";
      var isAudio = m.type === "audio";
      var key = isAudio ? "audio" : (isImage ? "image" : "video");
      var color = isAudio ? "#F77737" : (isImage ? "#833AB4" : "#E4405F");
      var icon = isAudio ? "ig-i-music" : (isImage ? "ig-i-image" : "ig-i-video");
      var typeLabel = isAudio ? "Audio" : (isImage ? "Image" : "Video");
      var label = m.label || (typeLabel + " " + (idx + 1));

      var card = document.createElement("div");
      card.className = "ig-card";
      card.setAttribute("data-quality", key);
      card.style.setProperty("--q-color", color);

      var previewImg = m.thumbnail
        ? '<img src="' + m.thumbnail + '" alt="Preview" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">'
        : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,' + color + '22,' + color + '44);"><svg style="width:44px;height:44px;stroke:' + color + ';fill:none;stroke-width:1.6;" viewBox="0 0 24 24"><use href="#' + icon + '"/></svg></div>';

      card.innerHTML =
        '<div class="ig-card-preview">' +
          '<span class="ig-card-badge"><svg class="ig-i" aria-hidden="true"><use href="#' + icon + '"/></svg>' + typeLabel + '</span>' +
          '<span class="ig-card-dims">' + label + '</span>' +
          previewImg +
        '</div>' +
        '<div class="ig-card-body">' +
          '<div class="ig-card-info"><span class="ig-card-name">' + label + '</span><span class="ig-card-tag">' + typeLabel + '</span></div>' +
          '<button class="ig-dl-btn" type="button" data-dl><span class="ig-dl-btn-label"><svg class="ig-i" aria-hidden="true"><use href="#ig-i-download"/></svg><span>Download</span></span></button>' +
        '</div>';
      resultsEl.appendChild(card);

      card.querySelector("[data-dl]").addEventListener("click", function(){
        downloadFromUrl(m.url, label, isAudio, isImage, this);
      });

      setTimeout(function(){ card.classList.add("is-in"); }, 60 + idx * 80);
    });
  }

  /* ============================================================
     DOWNLOAD WITH PROGRESS
     ============================================================ */
  async function downloadFromUrl(mediaUrl, label, isAudio, isImage, btn){
    var originalHTML = btn.innerHTML;
    var ext = isAudio ? ".mp3" : (isImage ? ".jpg" : ".mp4");
    var safe = (label || "download").replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 40);
    var filename = "instagram-" + safe + ext;

    /* proxy through fetch-media for proper Content-Disposition */
    var proxyUrl = BTCH_API + "/api/fetch-media?url=" + encodeURIComponent(mediaUrl) + "&filename=" + encodeURIComponent(filename);

    btn.disabled = true;
    btn.classList.add("is-downloading");
    btn.innerHTML =
      '<span class="ig-dl-btn-fill"></span>' +
      '<span class="ig-dl-btn-label"><svg class="ig-i" aria-hidden="true"><use href="#ig-i-download"/></svg><span class="ig-dl-pct">0%</span></span>';

    var fill = btn.querySelector(".ig-dl-btn-fill");
    var pctEl = btn.querySelector(".ig-dl-pct");
    var toast = createProgressToast(filename);
    var toastPct = toast ? toast.querySelector(".ig-toast-pct") : null;
    var toastFill = toast ? toast.querySelector(".ig-toast-progress-fill") : null;
    var toastStats = toast ? toast.querySelector(".ig-toast-stats") : null;

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
      btn.innerHTML = '<span class="ig-dl-btn-fill" style="width:100%"></span><span class="ig-dl-btn-label"><svg class="ig-i" aria-hidden="true"><use href="#ig-i-check"/></svg><span>Downloaded!</span></span>';
      showToast("Download complete — check your downloads folder", "ig-i-check", "success");
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
      var ctype = resp.headers.get("Content-Type") || (isAudio ? "audio/mpeg" : (isImage ? "image/jpeg" : "video/mp4"));

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
      console.error("[IG] Download error:", e);
      if (toastStats) toastStats.textContent = "Trying fallback…";
      try { window.open(proxyUrl, "_blank", "noopener"); showToast("Opened in new tab — browser will download", "ig-i-download", "success"); cleanup(); }
      catch(e2){
        try { window.open(mediaUrl, "_blank", "noopener"); showToast("Opened direct link — right-click → Save As", "ig-i-alert", "error"); cleanup(); }
        catch(e3){ showToast("Download failed — please try again", "ig-i-alert", "error"); cleanup(); }
      }
    }
  }

  /* ============================================================
     MAIN ACTION
     ============================================================ */
  async function runFetch(){
    hideError();
    var raw = input.value.trim();
    if (!raw){ showError("Please enter an Instagram Reel or Post URL."); input.focus(); return; }
    if (!isValidInstagramUrl(raw)){ showError("That doesn't look like a valid Instagram video/post link."); input.focus(); return; }

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
      showToast("Media loaded — choose an item to download", "ig-i-check", "success");
      var top = resultsWrap.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: "smooth" });
    } catch(err){
      loadingEl.classList.remove("is-visible");
      emptyEl.style.display = "";
      showError("Could not fetch download links. " + (err.message || "Please try again in a moment."));
      showToast("API error — try again shortly", "ig-i-alert", "error");
      console.warn("[IG] Fetch error:", err);
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
      if (txt){ input.value = txt.trim(); hideError(); showToast("Pasted from clipboard", "ig-i-check", "success"); setTimeout(runFetch, 150); }
    } catch(e){ showToast("Clipboard denied — paste manually", "ig-i-alert", "error"); input.focus(); }
  });

  /* URL param auto-load */
  try {
    var p = new URLSearchParams(window.location.search);
    var pre = p.get("url") || p.get("v");
    if (pre){ input.value = pre; setTimeout(runFetch, 500); }
  } catch(e){}

})();
