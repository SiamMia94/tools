(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".img-resizer")) return;
    document.body.classList.add("ir-full");
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
  var upload         = document.getElementById("irUpload");
  var fileInput      = document.getElementById("irFileInput");
  var browseBtn      = document.getElementById("irBrowseBtn");
  var settings       = document.getElementById("irSettings");
  var fileCount      = document.getElementById("irFileCount");
  var origDims       = document.getElementById("irOriginalDims");
  var origVal        = document.getElementById("irOrigVal");
  var widthInput     = document.getElementById("irWidth");
  var heightInput    = document.getElementById("irHeight");
  var lockBtn        = document.getElementById("irLockBtn");
  var lockLabel      = document.getElementById("irLockLabel");
  var percentRow     = document.getElementById("irPercentRow");
  var presetsBar     = document.getElementById("irPresets");
  var fitBar         = document.getElementById("irFit");
  var formatSel      = document.getElementById("irFormat");
  var qualityRange   = document.getElementById("irQuality");
  var qualityVal     = document.getElementById("irQualityVal");
  var resizeBtn      = document.getElementById("irResizeBtn");
  var clearBtn       = document.getElementById("irClearBtn");
  var progressEl     = document.getElementById("irProgress");
  var progressFill   = document.getElementById("irProgressFill");
  var progressText   = document.getElementById("irProgressText");
  var resultsEl      = document.getElementById("irResults");
  var batchEl        = document.getElementById("irBatch");
  var batchText      = document.getElementById("irBatchText");
  var zipBtn         = document.getElementById("irDownloadZip");
  var toast          = document.getElementById("irToast");
  var toastMsg       = document.getElementById("irToastMsg");

  if (!upload || !fileInput) return;

  var MAX_FILES = 20;
  var MAX_SIZE = 20 * 1024 * 1024;

  var files = [];
  var aspectLocked = true;
  var currentFit = "contain";

  /* ============================================================
     UTILITIES
     ============================================================ */
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("show");
    }, 2400);
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 KB";
    var kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + " KB";
    return (kb / 1024).toFixed(2) + " MB";
  }

  function isSupported(file) {
    var t = file.type || "";
    return /^image\/(jpeg|jpg|png|webp|gif)$/i.test(t) ||
           /\.(jpe?g|png|webp|gif)$/i.test(file.name);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
    });
  }

  function getOutputFormat(originalMime, userChoice) {
    if (userChoice && userChoice !== "auto") return userChoice;
    if (/jpeg|jpg/i.test(originalMime)) return "image/jpeg";
    if (/webp/i.test(originalMime)) return "image/webp";
    if (/png/i.test(originalMime)) return "image/png";
    return "image/jpeg";
  }

  function getExtFromMime(mime) {
    if (/jpeg|jpg/i.test(mime)) return "jpg";
    if (/png/i.test(mime)) return "png";
    if (/webp/i.test(mime)) return "webp";
    return "jpg";
  }

  /* ============================================================
     FILE HANDLING
     ============================================================ */
  function addFiles(fileList) {
    var incoming = Array.prototype.slice.call(fileList);
    var accepted = [];
    var rejected = [];

    incoming.forEach(function (f) {
      if (!isSupported(f)) {
        rejected.push(f.name + " (ফরম্যাট সাপোর্টেড নয়)");
        return;
      }
      if (f.size > MAX_SIZE) {
        rejected.push(f.name + " (২০ MB এর চেয়ে বড়)");
        return;
      }
      accepted.push(f);
    });

    var remaining = MAX_FILES - files.length;
    if (accepted.length > remaining) {
      var dropped = accepted.length - remaining;
      accepted = accepted.slice(0, remaining);
      rejected.push(dropped + "টি ফাইল বাদ (সর্বোচ্চ ২০)");
    }

    accepted.forEach(function (file) {
      var item = {
        id: "ir-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        file: file,
        name: file.name,
        size: file.size,
        originalMime: file.type,
        originalUrl: URL.createObjectURL(file),
        resizedBlob: null,
        resizedUrl: null,
        originalWidth: 0,
        originalHeight: 0,
        newWidth: 0,
        newHeight: 0,
        status: "pending"
      };
      files.push(item);
      loadImageDimensions(item);
      renderResult(item);
    });

    if (accepted.length) {
      settings.hidden = false;
      fileCount.textContent = files.length;
      showToast("✓ " + accepted.length + "টি ছবি যোগ হয়েছে");
    }
    if (rejected.length) {
      setTimeout(function () {
        showToast("⚠ " + rejected[0]);
      }, 500);
    }
  }

  /* Load dimensions and set defaults based on first image */
  function loadImageDimensions(item) {
    var img = new Image();
    img.onload = function () {
      item.originalWidth = img.naturalWidth;
      item.originalHeight = img.naturalHeight;

      // Set default width/height if empty (based on first image)
      if (!widthInput.value && !heightInput.value) {
        widthInput.value = item.originalWidth;
        heightInput.value = item.originalHeight;
      }

      // Update original dims display
      origVal.textContent = item.originalWidth + " × " + item.originalHeight + " px";

      updateResultCard(item);
    };
    img.src = item.originalUrl;
  }

  /* ============================================================
     RENDER CARD
     ============================================================ */
  function renderResult(item) {
    var existing = document.getElementById(item.id);
    if (existing) existing.remove();

    var card = document.createElement("div");
    card.className = "ir-result";
    card.id = item.id;
    card.innerHTML =
      '<div class="ir-result-thumb">' +
        '<img src="' + item.originalUrl + '" alt="preview">' +
      '</div>' +
      '<div class="ir-result-info">' +
        '<p class="ir-result-name" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</p>' +
        '<div class="ir-result-meta">' +
          '<span class="ir-result-dims" data-dims>' + formatBytes(item.size) + '</span>' +
          '<span class="ir-result-status" data-status>' +
            '<svg class="ir-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ir-i-clock"/></svg> Pending' +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="ir-result-actions">' +
        '<button type="button" class="ir-result-btn download" data-download disabled title="Download">' +
          '<svg class="ir-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ir-i-download"/></svg>' +
        '</button>' +
      '</div>';

    resultsEl.appendChild(card);

    card.querySelector("[data-download]").addEventListener("click", function () {
      downloadItem(item);
    });
  }

  function updateResultCard(item) {
    var card = document.getElementById(item.id);
    if (!card) return;

    var status = card.querySelector("[data-status]");
    var downloadBtn = card.querySelector("[data-download]");
    var thumb = card.querySelector(".ir-result-thumb img");
    var dims = card.querySelector("[data-dims]");

    if (item.status === "done" && item.resizedBlob) {
      status.className = "ir-result-status done";
      status.innerHTML = '<svg class="ir-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ir-i-check"/></svg> Done';
      downloadBtn.disabled = false;

      if (thumb && item.resizedUrl) {
        thumb.src = item.resizedUrl;
      }

      dims.innerHTML =
        '<span class="ir-dim-old">' + item.originalWidth + '×' + item.originalHeight + '</span>' +
        '<span class="ir-dim-arrow">→</span>' +
        '<span class="ir-dim-new">' + item.newWidth + '×' + item.newHeight + '</span>' +
        '<span class="ir-result-size"><svg class="ir-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ir-i-file"/></svg>' + formatBytes(item.resizedBlob.size) + '</span>';
    } else if (item.status === "error") {
      status.className = "ir-result-status error";
      status.innerHTML = '<svg class="ir-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ir-i-x-circle"/></svg> Error';
      downloadBtn.disabled = true;
    } else if (item.status === "processing") {
      status.className = "ir-result-status";
      status.innerHTML = '<svg class="ir-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ir-i-hourglass"/></svg> Processing...';
    } else {
      if (item.originalWidth) {
        dims.innerHTML = item.originalWidth + '×' + item.originalHeight + ' · ' + formatBytes(item.size);
      }
    }
  }

  /* ============================================================
     RESIZE LOGIC
     ============================================================ */
  function calculateTargetSize(srcW, srcH, targetW, targetH, fit) {
    if (!targetW && !targetH) return { width: srcW, height: srcH };
    if (!targetW) targetW = Math.round(srcW * (targetH / srcH));
    if (!targetH) targetH = Math.round(srcH * (targetW / srcW));

    var srcRatio = srcW / srcH;
    var dstRatio = targetW / targetH;

    if (fit === "stretch") {
      return { width: targetW, height: targetH };
    }

    if (fit === "cover") {
      // Fill the target box, crop overflow
      if (srcRatio > dstRatio) {
        return { width: Math.round(srcH * dstRatio), height: srcH, cropW: Math.round(targetW), cropH: Math.round(targetH), offsetX: Math.round((srcW - srcH * dstRatio) / 2), offsetY: 0 };
      } else {
        return { width: srcW, height: Math.round(srcW / dstRatio), cropW: Math.round(targetW), cropH: Math.round(targetH), offsetX: 0, offsetY: Math.round((srcH - srcW / dstRatio) / 2) };
      }
    }

    // contain — fit inside target box, letterbox if needed
    if (srcRatio > dstRatio) {
      return { width: targetW, height: Math.round(targetW / srcRatio), offsetX: 0, offsetY: Math.round((targetH - targetW / srcRatio) / 2), canvasW: targetW, canvasH: targetH };
    } else {
      return { width: Math.round(targetH * srcRatio), height: targetH, offsetX: Math.round((targetW - targetH * srcRatio) / 2), offsetY: 0, canvasW: targetW, canvasH: targetH };
    }
  }

  function resizeImage(file, opts) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();

      img.onload = function () {
        try {
          var srcW = img.naturalWidth;
          var srcH = img.naturalHeight;

          var targetW = opts.width || 0;
          var targetH = opts.height || 0;

          if (!targetW && !targetH) {
            // No dimensions — just re-encode at original size
            targetW = srcW;
            targetH = srcH;
          }

          var size = calculateTargetSize(srcW, srcH, targetW, targetH, opts.fit);
          var canvas = document.createElement("canvas");
          var outMime = getOutputFormat(file.type, opts.format);

          var ctx;

          if (opts.fit === "cover") {
            // Crop to fit
            canvas.width = targetW;
            canvas.height = targetH;
            ctx = canvas.getContext("2d");

            if (outMime === "image/jpeg") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, targetW, targetH);
            }

            var sw = size.width;
            var sh = size.height;
            var sx = size.offsetX || 0;
            var sy = size.offsetY || 0;

            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
          } else if (opts.fit === "contain") {
            // Letterbox
            canvas.width = targetW;
            canvas.height = targetH;
            ctx = canvas.getContext("2d");

            if (outMime === "image/jpeg") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, targetW, targetH);
            }

            ctx.drawImage(img, size.offsetX || 0, size.offsetY || 0, size.width, size.height);
          } else {
            // Stretch
            canvas.width = targetW;
            canvas.height = targetH;
            ctx = canvas.getContext("2d");

            if (outMime === "image/jpeg") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, targetW, targetH);
            }

            ctx.drawImage(img, 0, 0, targetW, targetH);
          }

          var quality = opts.quality / 100;
          var finalQuality = (outMime === "image/png") ? undefined : quality;

          canvas.toBlob(function (blob) {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("Canvas resize failed"));
              return;
            }
            resolve({
              blob: blob,
              width: canvas.width,
              height: canvas.height,
              mime: outMime
            });
          }, outMime, finalQuality);

        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Image load failed"));
      };

      img.src = url;
    });
  }

  /* ============================================================
     PROCESS ALL
     ============================================================ */
  var isProcessing = false;

  function processAll() {
    if (isProcessing) return;
    if (!files.length) {
      showToast("⚠ প্রথমে ছবি যোগ করুন");
      return;
    }

    var targetW = parseInt(widthInput.value, 10) || 0;
    var targetH = parseInt(heightInput.value, 10) || 0;

    if (!targetW && !targetH) {
      showToast("⚠ প্রস্থ বা উচ্চতা দিন");
      widthInput.focus();
      return;
    }

    var pending = files.filter(function (f) { return f.status !== "done" && f.status !== "processing"; });
    if (!pending.length) {
      showToast("ℹ সব ছবি ইতিমধ্যে রিসাইজ হয়েছে");
      return;
    }

    isProcessing = true;
    resizeBtn.disabled = true;
    resizeBtn.classList.add("is-loading");
    progressEl.hidden = false;
    progressFill.style.width = "0%";

    var opts = {
      width: targetW,
      height: targetH,
      fit: currentFit,
      quality: parseInt(qualityRange.value, 10),
      format: formatSel.value
    };

    var done = 0;

    function processNext() {
      if (done >= pending.length) {
        finishProcessing(pending.length);
        return;
      }

      var item = pending[done];
      item.status = "processing";
      updateResultCard(item);

      progressText.textContent = "রিসাইজ হচ্ছে " + (done + 1) + " / " + pending.length + ": " + item.name;
      progressFill.style.width = Math.round(((done + 1) / pending.length) * 100) + "%";

      resizeImage(item.file, opts)
        .then(function (result) {
          item.resizedBlob = result.blob;
          item.resizedUrl = URL.createObjectURL(result.blob);
          item.newWidth = result.width;
          item.newHeight = result.height;
          item.outputMime = result.mime;
          item.status = "done";
          updateResultCard(item);
          done++;
          setTimeout(processNext, 30);
        })
        .catch(function (err) {
          console.error("Resize error:", err);
          item.status = "error";
          updateResultCard(item);
          done++;
          setTimeout(processNext, 30);
        });
    }

    processNext();
  }

  function finishProcessing(count) {
    isProcessing = false;
    resizeBtn.disabled = false;
    resizeBtn.classList.remove("is-loading");
    progressText.textContent = "✓ " + count + "টি ছবি রিসাইজ হয়েছে";
    setTimeout(function () {
      progressEl.hidden = true;
      progressFill.style.width = "0%";
    }, 1500);

    updateBatchInfo();
    showToast("✓ " + count + "টি ছবি রিসাইজ হয়েছে");
  }

  /* ============================================================
     BATCH INFO
     ============================================================ */
  function updateBatchInfo() {
    var done = files.filter(function (f) { return f.status === "done" && f.resizedBlob; });
    if (!done.length) {
      batchEl.hidden = true;
      return;
    }
    batchEl.hidden = false;
    batchText.textContent = done.length + "টি ছবি রিসাইজ হয়েছে";
  }

  /* ============================================================
     DOWNLOAD
     ============================================================ */
  function downloadItem(item) {
    if (!item.resizedBlob) {
      showToast("⚠ প্রথমে রিসাইজ করুন");
      return;
    }
    var baseName = item.name.replace(/\.[^.]+$/, "");
    var ext = getExtFromMime(item.outputMime || item.resizedBlob.type);
    var a = document.createElement("a");
    a.href = item.resizedUrl;
    a.download = baseName + "-" + item.newWidth + "x" + item.newHeight + "." + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("✓ ডাউনলোড শুরু হয়েছে");
  }

  function downloadZip() {
    var done = files.filter(function (f) { return f.status === "done" && f.resizedBlob; });
    if (!done.length) {
      showToast("⚠ প্রথমে রিসাইজ করুন");
      return;
    }
    if (typeof JSZip === "undefined") {
      showToast("⚠ ZIP লাইব্রেরি লোড হয়নি — আলাদাভাবে ডাউনলোড করুন");
      return;
    }

    zipBtn.disabled = true;
    var origHtml = zipBtn.innerHTML;
    zipBtn.innerHTML = '<svg class="ir-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ir-i-hourglass"/></svg> ZIP তৈরি হচ্ছে...';

    var zip = new JSZip();
    done.forEach(function (item) {
      var baseName = item.name.replace(/\.[^.]+$/, "");
      var ext = getExtFromMime(item.outputMime || item.resizedBlob.type);
      var fname = baseName + "-" + item.newWidth + "x" + item.newHeight + "." + ext;
      var name = fname;
      var n = 1;
      while (zip.file(name)) {
        name = baseName + "-" + item.newWidth + "x" + item.newHeight + "-" + (n++) + "." + ext;
      }
      zip.file(name, item.resizedBlob);
    });

    zip.generateAsync({ type: "blob", compression: "DEFLATE" })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "resized-images-" + Date.now() + ".zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 3000);

        zipBtn.disabled = false;
        zipBtn.innerHTML = origHtml;
        showToast("✓ ZIP ডাউনলোড শুরু হয়েছে");
      })
      .catch(function (err) {
        console.error(err);
        zipBtn.disabled = false;
        zipBtn.innerHTML = origHtml;
        showToast("✕ ZIP তৈরি ব্যর্থ");
      });
  }

  /* ============================================================
     CLEAR
     ============================================================ */
  function clearAll() {
    files.forEach(function (f) {
      if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
      if (f.resizedUrl) URL.revokeObjectURL(f.resizedUrl);
    });
    files = [];
    resultsEl.innerHTML = "";
    settings.hidden = true;
    batchEl.hidden = true;
    progressEl.hidden = true;
    fileInput.value = "";
    fileCount.textContent = "0";
    widthInput.value = "";
    heightInput.value = "";
    showToast("✓ সব ছবি মুছে ফেলা হয়েছে");
  }

  /* ============================================================
     ASPECT RATIO LOCK
     ============================================================ */
  lockBtn.addEventListener("click", function () {
    aspectLocked = !aspectLocked;
    lockBtn.classList.toggle("is-active", aspectLocked);
    lockBtn.setAttribute("aria-pressed", aspectLocked ? "true" : "false");
    lockLabel.textContent = aspectLocked ? "Locked" : "Unlocked";
    lockBtn.querySelector("use").setAttribute("href", aspectLocked ? "#ir-i-lock" : "#ir-i-unlock");
  });

  /* Sync ratio when typing */
  function syncRatio(source) {
    if (!aspectLocked) return;
    var w = parseFloat(widthInput.value);
    var h = parseFloat(heightInput.value);

    if (source === "width" && w && files.length) {
      var first = files[0];
      if (first.originalWidth && first.originalHeight) {
        var ratio = first.originalWidth / first.originalHeight;
        heightInput.value = Math.round(w / ratio);
      }
    } else if (source === "height" && h && files.length) {
      var first2 = files[0];
      if (first2.originalWidth && first2.originalHeight) {
        var ratio2 = first2.originalWidth / first2.originalHeight;
        widthInput.value = Math.round(h * ratio2);
      }
    }
  }

  widthInput.addEventListener("input", function () { syncRatio("width"); });
  heightInput.addEventListener("input", function () { syncRatio("height"); });

  /* ============================================================
     PRESETS
     ============================================================ */
  document.querySelectorAll(".ir-preset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".ir-preset").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");

      var w = btn.getAttribute("data-w");
      var h = btn.getAttribute("data-h");
      widthInput.value = w;
      heightInput.value = h;

      // Clear percentage active states
      document.querySelectorAll(".ir-percent-btn").forEach(function (b) { b.classList.remove("is-active"); });
    });
  });

  /* ============================================================
     PERCENTAGE
     ============================================================ */
  document.querySelectorAll(".ir-percent-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pct = parseFloat(btn.getAttribute("data-percent"));

      if (!files.length) {
        showToast("⚠ প্রথমে ছবি যোগ করুন");
        return;
      }

      var first = files[0];
      if (!first.originalWidth || !first.originalHeight) {
        showToast("⚠ ছবি লোড হচ্ছে");
        return;
      }

      var w = Math.round(first.originalWidth * (pct / 100));
      var h = Math.round(first.originalHeight * (pct / 100));
      widthInput.value = w;
      heightInput.value = h;

      document.querySelectorAll(".ir-percent-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");

      document.querySelectorAll(".ir-preset").forEach(function (b) { b.classList.remove("is-active"); });
    });
  });

  /* ============================================================
     FIT MODE
     ============================================================ */
  document.querySelectorAll(".ir-fit-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".ir-fit-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      currentFit = btn.getAttribute("data-fit");
    });
  });

  /* ============================================================
     QUALITY
     ============================================================ */
  qualityRange.addEventListener("input", function () {
    qualityVal.textContent = this.value + "%";
  });

  /* ============================================================
     EVENTS
     ============================================================ */
  upload.addEventListener("click", function (e) {
    if (e.target.closest(".ir-upload-btn")) return;
    fileInput.click();
  });
  browseBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    fileInput.click();
  });
  fileInput.addEventListener("change", function () {
    if (this.files && this.files.length) addFiles(this.files);
    this.value = "";
  });

  ["dragenter", "dragover"].forEach(function (evt) {
    upload.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      upload.classList.add("is-dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    upload.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      upload.classList.remove("is-dragover");
    });
  });
  upload.addEventListener("drop", function (e) {
    var dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) addFiles(dt.files);
  });

  resizeBtn.addEventListener("click", processAll);
  clearBtn.addEventListener("click", clearAll);
  zipBtn.addEventListener("click", downloadZip);

})();
