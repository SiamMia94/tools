(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".img-comp")) return;
    document.body.classList.add("ic-full");
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
  var upload       = document.getElementById("icUpload");
  var fileInput    = document.getElementById("icFileInput");
  var browseBtn    = document.getElementById("icBrowseBtn");
  var settings     = document.getElementById("icSettings");
  var fileCount    = document.getElementById("icFileCount");
  var quality      = document.getElementById("icQuality");
  var qualityVal   = document.getElementById("icQualityVal");
  var maxWidth     = document.getElementById("icMaxWidth");
  var maxHeight    = document.getElementById("icMaxHeight");
  var formatSel    = document.getElementById("icFormat");
  var compressBtn  = document.getElementById("icCompressBtn");
  var clearBtn     = document.getElementById("icClearBtn");
  var progressEl   = document.getElementById("icProgress");
  var progressFill = document.getElementById("icProgressFill");
  var progressText = document.getElementById("icProgressText");
  var summaryEl    = document.getElementById("icSummary");
  var totalOrigEl  = document.getElementById("icTotalOriginal");
  var totalSavedEl = document.getElementById("icTotalSaved");
  var totalPctEl   = document.getElementById("icTotalPercent");
  var resultsEl    = document.getElementById("icResults");
  var batchEl      = document.getElementById("icBatch");
  var batchText    = document.getElementById("icBatchText");
  var zipBtn       = document.getElementById("icDownloadZip");
  var toast        = document.getElementById("icToast");
  var toastMsg     = document.getElementById("icToastMsg");

  if (!upload || !fileInput) return;

  var MAX_FILES = 20;
  var MAX_SIZE = 20 * 1024 * 1024;

  var files = []; // { id, file, name, size, originalUrl, compressedBlob, compressedUrl, width, height, newWidth, newHeight, status, originalMime }

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
    return /^image\/(jpeg|jpg|png|webp)$/i.test(t) ||
           /\.(jpe?g|png|webp)$/i.test(file.name);
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
        id: "ic-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        file: file,
        name: file.name,
        size: file.size,
        originalMime: file.type,
        originalUrl: URL.createObjectURL(file),
        compressedBlob: null,
        compressedUrl: null,
        newWidth: 0,
        newHeight: 0,
        status: "pending"
      };
      files.push(item);
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

  /* ============================================================
     RENDER CARD
     ============================================================ */
  function renderResult(item) {
    var existing = document.getElementById(item.id);
    if (existing) existing.remove();

    var card = document.createElement("div");
    card.className = "ic-result";
    card.id = item.id;
    card.innerHTML =
      '<div class="ic-result-thumb">' +
        '<img src="' + item.originalUrl + '" alt="preview">' +
      '</div>' +
      '<div class="ic-result-info">' +
        '<p class="ic-result-name" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</p>' +
        '<div class="ic-result-meta">' +
          '<span class="ic-result-sizes" data-sizes>' + formatBytes(item.size) + '</span>' +
          '<span class="ic-result-status" data-status>' +
            '<svg class="ic-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-i-clock"/></svg> Pending' +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="ic-result-actions">' +
        '<button type="button" class="ic-result-btn download" data-download disabled title="Download">' +
          '<svg class="ic-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-i-download"/></svg>' +
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
    var thumb = card.querySelector(".ic-result-thumb img");
    var sizes = card.querySelector("[data-sizes]");

    if (item.status === "done" && item.compressedBlob) {
      var savings = Math.max(0, Math.round((1 - item.compressedBlob.size / item.size) * 100));
      var savingsClass = savings < 20 ? " is-low" : "";

      status.className = "ic-result-status done";
      status.innerHTML = '<svg class="ic-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-i-check"/></svg> Done';
      downloadBtn.disabled = false;

      if (thumb && item.compressedUrl) {
        thumb.src = item.compressedUrl;
      }

      sizes.innerHTML =
        '<span class="ic-size-old">' + formatBytes(item.size) + '</span>' +
        '<span class="ic-size-arrow">→</span>' +
        '<span class="ic-size-new">' + formatBytes(item.compressedBlob.size) + '</span>' +
        '<span class="ic-savings' + savingsClass + '">-' + savings + '%</span>' +
        (item.newWidth && item.newHeight ?
          '<span class="ic-dim-info">' + item.newWidth + '×' + item.newHeight + '</span>' : '');
    } else if (item.status === "error") {
      status.className = "ic-result-status error";
      status.innerHTML = '<svg class="ic-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-i-x-circle"/></svg> Error';
      downloadBtn.disabled = true;
    } else if (item.status === "processing") {
      status.className = "ic-result-status";
      status.innerHTML = '<svg class="ic-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-i-hourglass"/></svg> Processing...';
    }
  }

  /* ============================================================
     COMPRESS
     ============================================================ */
  function compressImage(file, opts) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();

      img.onload = function () {
        try {
          var w = img.naturalWidth;
          var h = img.naturalHeight;

          // Scale down if max dimensions set
          if (opts.maxWidth && w > opts.maxWidth) {
            h = Math.round(h * (opts.maxWidth / w));
            w = opts.maxWidth;
          }
          if (opts.maxHeight && h > opts.maxHeight) {
            w = Math.round(w * (opts.maxHeight / h));
            h = opts.maxHeight;
          }

          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");

          var outMime = getOutputFormat(file.type, opts.format);

          // For JPEG, fill white (transparent pixels become black otherwise)
          if (outMime === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, h);
          }

          ctx.drawImage(img, 0, 0, w, h);

          var quality = opts.quality / 100;
          // PNG doesn't use quality param
          var finalQuality = (outMime === "image/png") ? undefined : quality;

          canvas.toBlob(function (blob) {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("Canvas compression failed"));
              return;
            }
            resolve({
              blob: blob,
              width: w,
              height: h,
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

    var pending = files.filter(function (f) { return f.status !== "done" && f.status !== "processing"; });
    if (!pending.length) {
      showToast("ℹ সব ছবি ইতিমধ্যে কম্প্রেস হয়েছে");
      return;
    }

    isProcessing = true;
    compressBtn.disabled = true;
    compressBtn.classList.add("is-loading");
    progressEl.hidden = false;
    progressFill.style.width = "0%";

    var opts = {
      quality: parseInt(quality.value, 10),
      maxWidth: parseInt(maxWidth.value, 10) || 0,
      maxHeight: parseInt(maxHeight.value, 10) || 0,
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

      progressText.textContent = "প্রসেস হচ্ছে " + (done + 1) + " / " + pending.length + ": " + item.name;
      progressFill.style.width = Math.round(((done + 1) / pending.length) * 100) + "%";

      compressImage(item.file, opts)
        .then(function (result) {
          item.compressedBlob = result.blob;
          item.compressedUrl = URL.createObjectURL(result.blob);
          item.newWidth = result.width;
          item.newHeight = result.height;
          item.outputMime = result.mime;
          item.status = "done";
          updateResultCard(item);
          updateSummary();
          done++;
          setTimeout(processNext, 30);
        })
        .catch(function (err) {
          console.error("Compression error:", err);
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
    compressBtn.disabled = false;
    compressBtn.classList.remove("is-loading");
    progressText.textContent = "✓ " + count + "টি ছবি কম্প্রেস হয়েছে";
    setTimeout(function () {
      progressEl.hidden = true;
      progressFill.style.width = "0%";
    }, 1500);

    updateSummary();
    updateBatchInfo();
    showToast("✓ " + count + "টি ছবি কম্প্রেস হয়েছে");
  }

  /* ============================================================
     SUMMARY
     ============================================================ */
  function updateSummary() {
    var done = files.filter(function (f) { return f.status === "done" && f.compressedBlob; });
    if (!done.length) {
      summaryEl.hidden = true;
      return;
    }

    var totalOrig = 0;
    var totalNew = 0;
    done.forEach(function (f) {
      totalOrig += f.size;
      totalNew += f.compressedBlob.size;
    });

    var saved = totalOrig - totalNew;
    var pct = totalOrig > 0 ? Math.round((saved / totalOrig) * 100) : 0;

    summaryEl.hidden = false;
    totalOrigEl.textContent = formatBytes(totalOrig);
    totalSavedEl.textContent = formatBytes(saved);
    totalPctEl.textContent = pct + "%";
  }

  /* ============================================================
     BATCH INFO
     ============================================================ */
  function updateBatchInfo() {
    var done = files.filter(function (f) { return f.status === "done" && f.compressedBlob; });
    if (!done.length) {
      batchEl.hidden = true;
      return;
    }
    batchEl.hidden = false;
    batchText.textContent = done.length + "টি ছবি কম্প্রেস হয়েছে";
  }

  /* ============================================================
     DOWNLOAD
     ============================================================ */
  function downloadItem(item) {
    if (!item.compressedBlob) {
      showToast("⚠ প্রথমে কম্প্রেস করুন");
      return;
    }
    var baseName = item.name.replace(/\.[^.]+$/, "");
    var ext = getExtFromMime(item.outputMime || item.compressedBlob.type);
    var a = document.createElement("a");
    a.href = item.compressedUrl;
    a.download = baseName + "-compressed." + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("✓ ডাউনলোড শুরু হয়েছে");
  }

  function downloadZip() {
    var done = files.filter(function (f) { return f.status === "done" && f.compressedBlob; });
    if (!done.length) {
      showToast("⚠ প্রথমে কম্প্রেস করুন");
      return;
    }
    if (typeof JSZip === "undefined") {
      showToast("⚠ ZIP লাইব্রেরি লোড হয়নি — আলাদাভাবে ডাউনলোড করুন");
      return;
    }

    zipBtn.disabled = true;
    var origHtml = zipBtn.innerHTML;
    zipBtn.innerHTML = '<svg class="ic-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-i-hourglass"/></svg> ZIP তৈরি হচ্ছে...';

    var zip = new JSZip();
    done.forEach(function (item) {
      var baseName = item.name.replace(/\.[^.]+$/, "");
      var ext = getExtFromMime(item.outputMime || item.compressedBlob.type);
      var fname = baseName + "-compressed." + ext;
      var name = fname;
      var n = 1;
      while (zip.file(name)) {
        name = baseName + "-compressed-" + (n++) + "." + ext;
      }
      zip.file(name, item.compressedBlob);
    });

    zip.generateAsync({ type: "blob", compression: "DEFLATE" })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "compressed-images-" + Date.now() + ".zip";
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
      if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
    });
    files = [];
    resultsEl.innerHTML = "";
    settings.hidden = true;
    summaryEl.hidden = true;
    batchEl.hidden = true;
    progressEl.hidden = true;
    fileInput.value = "";
    fileCount.textContent = "0";
    showToast("✓ সব ছবি মুছে ফেলা হয়েছে");
  }

  /* ============================================================
     EVENTS
     ============================================================ */
  upload.addEventListener("click", function (e) {
    if (e.target.closest(".ic-upload-btn")) return;
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

  quality.addEventListener("input", function () {
    qualityVal.textContent = this.value + "%";
  });

  compressBtn.addEventListener("click", processAll);
  clearBtn.addEventListener("click", clearAll);
  zipBtn.addEventListener("click", downloadZip);

})();
