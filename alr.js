(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".air-wrapper")) return;
    document.body.classList.add("air-full");
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

  var $ = function (id) { return document.getElementById(id); };

  var uploadZone    = $("airUploadZone");
  var fileInput     = $("airFileInput");
  var browseBtn     = $("airBrowseBtn");
  var optionsPanel  = $("airOptions");
  var processBtn    = $("airProcess");
  var processText   = $("airProcessText");
  var clearBtn      = $("airClear");
  var progressEl    = $("airProgress");
  var progressFill  = $("airProgressFill");
  var progressText  = $("airProgressText");
  var resultsEl     = $("airResults");
  var batchEl       = $("airBatch");
  var batchText     = $("airBatchText");
  var downloadZipBtn= $("airDownloadZip");
  var toast         = $("airToast");
  var toastMsg      = $("airToastMsg");

  var optExif       = $("airRemoveExif");
  var optXmp        = $("airRemoveXmp");
  var optC2pa       = $("airRemoveC2pa");
  var optInject     = $("airInjectExif");

  if (!uploadZone || !fileInput) return;

  var MAX_SIZE = 15 * 1024 * 1024;
  var MAX_BATCH = 30;

  var files = [];
  var cleanedCount = 0;

  var SVG_CHECK = '<svg class="air-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#air-i-check-circle"/></svg>';
  var SVG_X     = '<svg class="air-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#air-i-x-circle"/></svg>';
  var SVG_CLOCK = '<svg class="air-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#air-i-clock"/></svg>';
  var SVG_HOUR  = '<svg class="air-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#air-i-hourglass"/></svg>';
  var SVG_DOWN  = '<svg class="air-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#air-i-download"/></svg>';

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
    return /^image\/(jpeg|jpg|png|webp|avif|heic|heif)$/i.test(t) ||
           /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name);
  }

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
        rejected.push(f.name + " (১৫ MB এর চেয়ে বড়)");
        return;
      }
      accepted.push(f);
    });

    var remaining = MAX_BATCH - files.length;
    if (accepted.length > remaining) {
      var dropped = accepted.length - remaining;
      accepted = accepted.slice(0, remaining);
      rejected.push(dropped + "টি ফাইল বাদ (সর্বোচ্চ ৩০)");
    }

    accepted.forEach(function (file) {
      var item = {
        id: "air-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        file: file,
        name: file.name,
        size: file.size,
        originalUrl: URL.createObjectURL(file),
        cleanedBlob: null,
        cleanedUrl: null,
        status: "pending"
      };
      files.push(item);
      renderResult(item);
    });

    if (accepted.length) {
      optionsPanel.style.display = "";
      showToast("✓ " + accepted.length + "টি ছবি যোগ হয়েছে");
    }
    if (rejected.length) {
      setTimeout(function () {
        showToast("⚠ " + rejected[0]);
      }, 500);
    }

    updateBatchInfo();
  }

  function renderResult(item) {
    var existing = document.getElementById(item.id);
    if (existing) existing.remove();

    var card = document.createElement("div");
    card.className = "air-result";
    card.id = item.id;
    card.innerHTML =
      '<div class="air-result-thumb">' +
        '<img src="' + item.originalUrl + '" alt="preview">' +
      '</div>' +
      '<div class="air-result-info">' +
        '<p class="air-result-name" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</p>' +
        '<div class="air-result-meta">' +
          '<span class="air-result-sizes">' + formatBytes(item.size) + '</span>' +
          '<span class="air-result-status" data-status>' + SVG_CLOCK + ' Pending</span>' +
        '</div>' +
      '</div>' +
      '<div class="air-result-actions">' +
        '<button type="button" class="air-download-btn" data-download disabled title="ডাউনলোড">' +
          SVG_DOWN +
        '</button>' +
      '</div>';

    resultsEl.appendChild(card);

    card.querySelector("[data-download]").addEventListener("click", function () {
      downloadItem(item);
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function stripMetadata(file, options) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth;
          var h = img.naturalHeight;

          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");

          var isPng = /png/i.test(file.type) || /\.png$/i.test(file.name);
          if (!isPng) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, h);
          }
          ctx.drawImage(img, 0, 0);

          var outMime = "image/jpeg";
          var quality = 0.92;
          if (isPng) {
            outMime = "image/png";
            quality = undefined;
          } else if (/webp/i.test(file.type)) {
            outMime = "image/webp";
          }

          canvas.toBlob(function (blob) {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("Canvas conversion failed"));
              return;
            }
            if (options && options.injectExif && outMime === "image/jpeg") {
              injectCameraExif(blob).then(resolve).catch(function () {
                resolve(blob);
              });
            } else {
              resolve(blob);
            }
          }, outMime, quality);
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

  function injectCameraExif(jpegBlob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var bytes = new Uint8Array(e.target.result);
          var exif = buildExifSegment();
          var out = new Uint8Array(2 + exif.length + (bytes.length - 2));
          out[0] = 0xFF; out[1] = 0xD8;
          out.set(exif, 2);
          out.set(bytes.subarray(2), 2 + exif.length);
          resolve(new Blob([out], { type: "image/jpeg" }));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(jpegBlob);
    });
  }

  function buildExifSegment() {
    var make = "Generic\0";
    var model = "Camera\0";
    var software = "AI Label Remover\0";

    var tiffHeader = [0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00];
    var ifd0Count = 3;
    var ifd0Size = 2 + ifd0Count * 12 + 4;
    var dataStart = tiffHeader.length + ifd0Size;

    var makeBytes = strToBytes(make);
    var modelBytes = strToBytes(model);
    var softwareBytes = strToBytes(software);

    var makeOffset = dataStart;
    var modelOffset = makeOffset + makeBytes.length;
    var softwareOffset = modelOffset + modelBytes.length;

    var ifd0 = [ifd0Count & 0xFF, (ifd0Count >> 8) & 0xFF];
    ifd0 = ifd0.concat(tagEntry(0x010F, 2, makeBytes.length, makeOffset));
    ifd0 = ifd0.concat(tagEntry(0x0110, 2, modelBytes.length, modelOffset));
    ifd0 = ifd0.concat(tagEntry(0x0131, 2, softwareBytes.length, softwareOffset));
    ifd0.push(0, 0, 0, 0);

    var ifdBytes = ifd0.concat(makeBytes, modelBytes, softwareBytes);
    var tiffData = tiffHeader.concat(ifdBytes);

    var exifHeader = strToBytes("Exif\0\0");
    var payload = exifHeader.concat(tiffData);
    var segLength = payload.length + 2;

    var seg = [0xFF, 0xE1, (segLength >> 8) & 0xFF, segLength & 0xFF].concat(payload);
    return new Uint8Array(seg);
  }

  function tagEntry(tag, type, count, offset) {
    return [
      tag & 0xFF, (tag >> 8) & 0xFF,
      type & 0xFF, (type >> 8) & 0xFF,
      count & 0xFF, (count >> 8) & 0xFF, (count >> 16) & 0xFF, (count >> 24) & 0xFF,
      offset & 0xFF, (offset >> 8) & 0xFF, (offset >> 16) & 0xFF, (offset >> 24) & 0xFF
    ];
  }

  function strToBytes(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) out.push(str.charCodeAt(i) & 0xFF);
    return out;
  }

  function processAll() {
    if (!files.length) {
      showToast("⚠ প্রথমে ছবি যোগ করুন");
      return;
    }

    var pending = files.filter(function (f) { return !f.cleanedBlob; });
    if (!pending.length) {
      showToast("ℹ সব ছবি ইতিমধ্যেই পরিষ্কার");
      return;
    }

    processBtn.disabled = true;
    processText.textContent = "প্রসেস হচ্ছে...";
    progressEl.style.display = "block";
    progressFill.style.width = "0%";

    var options = {
      removeExif: optExif.checked,
      removeXmp: optXmp.checked,
      removeC2pa: optC2pa.checked,
      injectExif: optInject.checked
    };

    var done = 0;

    function processNext() {
      if (done >= pending.length) {
        finishProcessing(pending.length);
        return;
      }

      var item = pending[done];
      progressText.textContent = "প্রসেস হচ্ছে " + (done + 1) + " / " + pending.length + ": " + item.name;
      progressFill.style.width = Math.round(((done + 1) / pending.length) * 100) + "%";

      var card = document.getElementById(item.id);
      if (card) {
        var status = card.querySelector("[data-status]");
        status.innerHTML = SVG_HOUR + ' প্রসেসিং...';
        status.style.color = "#6b7280";
      }

      stripMetadata(item.file, options)
        .then(function (blob) {
          item.cleanedBlob = blob;
          item.cleanedUrl = URL.createObjectURL(blob);
          item.status = "cleaned";
          updateResultCard(item);
          done++;
          setTimeout(processNext, 30);
        })
        .catch(function (err) {
          console.error("Process error:", err);
          item.status = "error";
          updateResultCard(item, "ব্যর্থ");
          done++;
          setTimeout(processNext, 30);
        });
    }

    processNext();
  }

  function updateResultCard(item, errorMsg) {
    var card = document.getElementById(item.id);
    if (!card) return;

    var status = card.querySelector("[data-status]");
    var downloadBtn = card.querySelector("[data-download]");
    var thumb = card.querySelector(".air-result-thumb img");
    var sizes = card.querySelector(".air-result-sizes");

    if (item.status === "cleaned" && item.cleanedBlob) {
      status.innerHTML = SVG_CHECK + ' পরিষ্কার';
      status.style.color = "#059669";
      downloadBtn.disabled = false;
      if (thumb && item.cleanedUrl) thumb.src = item.cleanedUrl;
      if (sizes) {
        sizes.innerHTML = '<span style="text-decoration:line-through;color:#9ca3af">' +
          formatBytes(item.size) + '</span> → <strong style="color:#059669">' +
          formatBytes(item.cleanedBlob.size) + '</strong>';
      }
    } else if (item.status === "error") {
      status.innerHTML = SVG_X + ' ' + (errorMsg || "ব্যর্থ");
      status.style.color = "#dc2626";
    }
  }

  function finishProcessing(count) {
    processBtn.disabled = false;
    processText.textContent = "ছবি পরিষ্কার করুন";
    progressText.textContent = "✓ " + count + "টি ছবি পরিষ্কার হয়েছে";
    setTimeout(function () {
      progressEl.style.display = "none";
      progressFill.style.width = "0%";
    }, 1500);

    updateBatchInfo();
    showToast("✓ " + count + "টি ছবি পরিষ্কার হয়েছে");
  }

  function downloadItem(item) {
    if (!item.cleanedBlob) {
      showToast("⚠ প্রথমে প্রসেস করুন");
      return;
    }
    var baseName = item.name.replace(/\.[^.]+$/, "");
    var ext = guessExt(item.cleanedBlob.type, item.name);
    var a = document.createElement("a");
    a.href = item.cleanedUrl;
    a.download = baseName + "-cleaned." + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("✓ ডাউনলোড শুরু হয়েছে");
  }

  function guessExt(mime, name) {
    if (/png/i.test(mime)) return "png";
    if (/webp/i.test(mime)) return "webp";
    if (/jpeg|jpg/i.test(mime)) return "jpg";
    var m = name.match(/\.([a-z0-9]+)$/i);
    return m ? m[1] : "jpg";
  }

  function downloadZip() {
    var ready = files.filter(function (f) { return f.cleanedBlob; });
    if (!ready.length) {
      showToast("⚠ প্রথমে প্রসেস করুন");
      return;
    }
    if (typeof JSZip === "undefined") {
      showToast("⚠ ZIP লাইব্রেরি লোড হয়নি");
      return;
    }

    downloadZipBtn.disabled = true;
    downloadZipBtn.innerHTML = SVG_HOUR + ' ZIP তৈরি হচ্ছে...';

    var zip = new JSZip();
    ready.forEach(function (item) {
      var baseName = item.name.replace(/\.[^.]+$/, "");
      var ext = guessExt(item.cleanedBlob.type, item.name);
      var fname = baseName + "-cleaned." + ext;
      var name = fname;
      var n = 1;
      while (zip.file(name)) {
        name = baseName + "-cleaned-" + (n++) + "." + ext;
      }
      zip.file(name, item.cleanedBlob);
    });

    zip.generateAsync({ type: "blob", compression: "DEFLATE" }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "ai-label-removed-" + Date.now() + ".zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000);

      downloadZipBtn.disabled = false;
      downloadZipBtn.innerHTML = '<svg class="air-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#air-i-file-zip"/></svg> ZIP ডাউনলোড';
      showToast("✓ ZIP ডাউনলোড শুরু হয়েছে");
    }).catch(function (err) {
      console.error(err);
      downloadZipBtn.disabled = false;
      downloadZipBtn.innerHTML = '<svg class="air-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#air-i-file-zip"/></svg> ZIP ডাউনলোড';
      showToast("✕ ZIP তৈরি ব্যর্থ");
    });
  }

  function updateBatchInfo() {
    cleanedCount = files.filter(function (f) { return f.cleanedBlob; }).length;
    if (cleanedCount > 0) {
      batchEl.style.display = "";
      batchText.textContent = cleanedCount + "টি ছবি পরিষ্কার হয়েছে";
    } else {
      batchEl.style.display = "none";
    }
  }

  function clearAll() {
    files.forEach(function (f) {
      if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
      if (f.cleanedUrl) URL.revokeObjectURL(f.cleanedUrl);
    });
    files = [];
    cleanedCount = 0;
    resultsEl.innerHTML = "";
    optionsPanel.style.display = "none";
    batchEl.style.display = "none";
    progressEl.style.display = "none";
    fileInput.value = "";
    showToast("✓ সব ছবি মুছে ফেলা হয়েছে");
  }

  uploadZone.addEventListener("click", function (e) {
    if (e.target.closest(".air-upload-btn")) return;
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
    uploadZone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.add("air-dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    uploadZone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.remove("air-dragover");
    });
  });
  uploadZone.addEventListener("drop", function (e) {
    var dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) addFiles(dt.files);
  });

  processBtn.addEventListener("click", processAll);
  clearBtn.addEventListener("click", clearAll);
  downloadZipBtn.addEventListener("click", downloadZip);

})();
