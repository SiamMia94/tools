(function(){
  "use strict";

  /* ---------- full width force ---------- */
  function forceFullWidth(){
    if (!document.querySelector(".tt-video")) return;
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

  /* ---------- refsrir ---------- */
  var hub = document.getElementById("ttHub");
  if (!hub) return;

  var input       = document.getElementById("ttInput");
  var pasteBtn    = document.getElementById("ttPasteBtn");
  var fetchBtn    = document.getElementById("ttFetchBtn");
  var errorEl     = document.getElementById("ttError");
  var errorMsg    = document.getElementById("ttErrorMsg");
  var emptyEl     = document.getElementById("ttEmpty");
  var loadingEl   = document.getElementById("ttLoading");
  var resultsWrap = document.getElementById("ttResultsWrap");
  var resultsEl   = document.getElementById("ttResults");
  var toastBox    = document.getElementById("ttToasts");

  /* ============================================================
     CONFIG — btch-downloader-api (TikTok endpoint)
     ============================================================ */
  var API_BASE = "https://btch-downloader-api-green.vercel.app";
  var TT_ENDPOINT = API_BASE + "/api/download/tiktok?url=";

  /* ---------- helpers ---------- */
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
    t.className = "tt-toast" + (kind ? " is-" + kind : "");
    t.innerHTML = '<svg class="tt-i" aria-hidden="true"><use href="#' + (icon || "tt-i-check") + '"/></svg><span>' + msg + '</span>';
    toastBox.appendChild(t);
    setTimeout(function(){ t.classList.add("is-out"); setTimeout(function(){ t.remove(); }, 320); }, 3500);
  }

  function createProgressToast(filename){
    if (!toastBox) return null;
    var t = document.createElement("div");
    t.className = "tt-toast is-progress";
    t.innerHTML =
      '<svg class="tt-i" aria-hidden="true"><use href="#tt-i-download"/></svg>' +
      '<div class="tt-toast-body">' +
        '<div class="tt-toast-title"><span>Downloading…</span><span class="tt-toast-pct">0%</span></div>' +
        '<div class="tt-toast-progress"><div class="tt-toast-progress-fill"></div></div>' +
        '<div class="tt-toast-stats">Starting…</div>' +
        '<div class="tt-toast-file">' + filename + '</div>' +
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
  function isValidTikTokUrl(raw){
    if (!raw) return false;
    var url = raw.trim();
    return /(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\//i.test(url);
  }

  /* ============================================================
     FETCH VIA btch-downloader-api
     ============================================================ */
  async function fetchTikTok(ttUrl){
    var resp = await fetch(TT_ENDPOINT + encodeURIComponent(ttUrl), {
      headers: { "Accept": "application/json" }
    });
    if (!resp.ok) throw new Error("btch HTTP " + resp.status);
    var data = await resp.json();
    if (!data.success) throw new Error(data.error?.message || "btch failed");

    var media = [];
    var thumb = "";

    /* 1) Prefer normalized.media array */
    if (data.normalized && Array.isArray(data.normalized.media) && data.normalized.media.length > 0){
      thumb = data.normalized.thumbnail || "";
      data.normalized.media.forEach(function(m){
        if (!m.url) return;
        media.push({
          label: m.label || "Video",
          type: m.type || "video",
          url: m.url
        });
      });
    }

    /* 2) Fallback: parse raw result object */
    if (media.length === 0 && data.result){
      var r = data.result;
      thumb = thumb || r.cover || r.thumbnail || (r.origin_cover && r.origin_cover.url_list && r.origin_cover.url_list[0]) || "";

      /* video no watermark */
      if (r.video && r.video.noWatermark) media.push({ label: "Video (no watermark)", type: "video", url: r.video.noWatermark });
      /* video with watermark */
      if (r.video && r.video.watermark) media.push({ label: "Video (with watermark)", type: "video", url: r.video.watermark });
      /* legacy keys */
      if (r.video_no_watermark || r.nowatermark) media.push({ label: "Video (no watermark)", type: "video", url: r.video_no_watermark || r.nowatermark });
      if (r.video_watermark || r.watermark) media.push({ label: "Video (with watermark)", type: "video", url: r.video_watermark || r.watermark });

      /* audio / music */
      var audioUrl = r.audio || r.music || (r.music_info && (r.music_info.play || r.music_info.url)) || null;
      if (audioUrl) media.push({ label: "Audio (MP3)", type: "audio", url: audioUrl });

      /* images / slideshow */
      if (Array.isArray(r.images) && r.images.length){
        r.images.forEach(function(img, i){
          var u = typeof img === "string" ? img : (img.url || img.url_list && img.url_list[0]);
          if (u) media.push({ label: "Image " + (i + 1), type: "image", url: u });
        });
      }
    }

    if (media.length === 0) throw new Error("No downloadable media found.");

    /* dedupe */
    var seen = {};
    media = media.filter(function(m){
      if (!m.url || seen[m.url]) return false;
      seen[m.url] = true;
      return true;
    });

    /* sort: no-watermark first, then watermark, then audio, then images */
    function score(m){
      var l = (m.label || "").toLowerCase();
      if (/no.?watermark/.test(l)) return 4;
      if (/with.?watermark/.test(l)) return 3;
      if (m.type === "audio") return 2;
      if (m.type === "image") return 1;
      return 0;
    }
    media.sort(function(a,b){ return score(b) - score(a); });

    return {
      title: (data.normalized && data.normalized.title) || (data.result && data.result.title) || "TikTok Video",
      thumbnail: thumb,
      media: media
    };
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function renderResults(info){
    resultsEl.innerHTML = "";

    var banner = document.createElement("div");
    banner.className = "tt-video-info";
    var thumbHtml = info.thumbnail
      ? '<img src="' + info.thumbnail + '" alt="Thumbnail" loading="lazy" onerror="this.style.display=\'none\'">'
      : '<div style="width:64px;height:64px;border-radius:12px;background:linear-gradient(135deg,#00f2ea,#ff0050);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg style="width:32px;height:32px;fill:#fff;" viewBox="0 0 24 24"><use href="#tt-i-tiktok"/></svg></div>';
    banner.innerHTML =
      thumbHtml +
      '<div class="tt-video-info-text"><h3>' + (info.title || "TikTok Video") + '</h3><span>' + info.media.length + ' format(s) available</span></div>';
    resultsEl.appendChild(banner);

    info.media.forEach(function(m, idx){
      var isAudio = m.type === "audio";
      var isImage = m.type === "image";
      var key = isAudio ? "audio" : (isImage ? "image" : (/no.?watermark/i.test(m.label) ? "nowatermark" : "watermark"));
      var color = isAudio ? "#0f172a" : (isImage ? "#833AB4" : (/no.?watermark/i.test(m.label) ? "#00c4be" : "#ff0050"));
      var icon = isAudio ? "tt-i-music" : "tt-i-video";
      var label = m.label || "Format";

      var card = document.createElement("div");
      card.className = "tt-card";
      card.setAttribute("data-quality", key);
      card.style.setProperty("--q-color", color);

      var previewImg = info.thumbnail
        ? '<img src="' + info.thumbnail + '" alt="Preview" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">'
        : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,' + color + '22,' + color + '44);"><svg style="width:44px;height:44px;stroke:' + color + ';fill:none;stroke-width:1.6;" viewBox="0 0 24 24"><use href="#' + icon + '"/></svg></div>';

      card.innerHTML =
        '<div class="tt-card-preview">' +
          '<span class="tt-card-badge"><svg class="tt-i" aria-hidden="true"><use href="#' + icon + '"/></svg>' + (isAudio ? "Audio" : (isImage ? "Image" : "Video")) + '</span>' +
          '<span class="tt-card-dims">' + label + '</span>' +
          previewImg +
        '</div>' +
        '<div class="tt-card-body">' +
          '<div class="tt-card-info"><span class="tt-card-name">' + label + '</span><span class="tt-card-tag">' + (isAudio ? "Audio only" : (isImage ? "Image" : "Video")) + '</span></div>' +
          '<button class="tt-dl-btn" type="button" data-dl><span class="tt-dl-btn-label"><svg class="tt-i" aria-hidden="true"><use href="#tt-i-download"/></svg><span>Download</span></span></button>' +
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
    var filename = "tiktok-" + safe + ext;

    /* proxy through fetch-media for proper Content-Disposition */
    var proxyUrl = API_BASE + "/api/fetch-media?url=" + encodeURIComponent(mediaUrl) + "&filename=" + encodeURIComponent(filename);

    btn.disabled = true;
    btn.classList.add("is-downloading");
    btn.innerHTML =
      '<span class="tt-dl-btn-fill"></span>' +
      '<span class="tt-dl-btn-label"><svg class="tt-i" aria-hidden="true"><use href="#tt-i-download"/></svg><span class="tt-dl-pct">0%</span></span>';

    var fill = btn.querySelector(".tt-dl-btn-fill");
    var pctEl = btn.querySelector(".tt-dl-pct");
    var toast = createProgressToast(filename);
    var toastPct = toast ? toast.querySelector(".tt-toast-pct") : null;
    var toastFill = toast ? toast.querySelector(".tt-toast-progress-fill") : null;
    var toastStats = toast ? toast.querySelector(".tt-toast-stats") : null;

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
      btn.innerHTML = '<span class="tt-dl-btn-fill" style="width:100%"></span><span class="tt-dl-btn-label"><svg class="tt-i" aria-hidden="true"><use href="#tt-i-check"/></svg><span>Downloaded!</span></span>';
      showToast("Download complete — check your downloads folder", "tt-i-check", "success");
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
      console.error("[TT] Download error:", e);
      if (toastStats) toastStats.textContent = "Trying fallback…";
      try { window.open(proxyUrl, "_blank", "noopener"); showToast("Opened in new tab — browser will download", "tt-i-download", "success"); cleanup(); }
      catch(e2){
        try { window.open(mediaUrl, "_blank", "noopener"); showToast("Opened direct link — right-click → Save As", "tt-i-alert", "error"); cleanup(); }
        catch(e3){ showToast("Download failed — please try again", "tt-i-alert", "error"); cleanup(); }
      }
    }
  }

  /* ============================================================
     MAIN ACTION
     ============================================================ */
  async function runFetch(){
    hideError();
    var raw = input.value.trim();
    if (!raw){ showError("Please enter a TikTok video URL."); input.focus(); return; }
    if (!isValidTikTokUrl(raw)){ showError("That doesn't look like a valid TikTok video link."); input.focus(); return; }

    emptyEl.style.display = "none";
    resultsWrap.style.display = "none";
    loadingEl.classList.add("is-visible");
    fetchBtn.disabled = true;
    fetchBtn.querySelector("span").textContent = "Loading…";

    try {
      var info = await fetchTikTok(raw);
      loadingEl.classList.remove("is-visible");
      resultsWrap.style.display = "";
      renderResults(info);
      showToast("Links loaded — choose a format to download", "tt-i-check", "success");
      var top = resultsWrap.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: "smooth" });
    } catch(err){
      loadingEl.classList.remove("is-visible");
      emptyEl.style.display = "";
      showError("Could not fetch download links. " + (err.message || "Please try again in a moment."));
      showToast("API error — try again shortly", "tt-i-alert", "error");
      console.warn("[TT] Fetch error:", err);
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
      if (txt){ input.value = txt.trim(); hideError(); showToast("Pasted from clipboard", "tt-i-check", "success"); setTimeout(runFetch, 150); }
    } catch(e){ showToast("Clipboard denied — paste manually", "tt-i-alert", "error"); input.focus(); }
  });

  /* URL param auto-load */
  try {
    var p = new URLSearchParams(window.location.search);
    var pre = p.get("url") || p.get("v");
    if (pre){ input.value = pre; setTimeout(runFetch, 500); }
  } catch(e){}

})();
