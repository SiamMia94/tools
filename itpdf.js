(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".img2pdf")) return;
    document.body.classList.add("ip-full");
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
  var upload        = document.getElementById("ipUpload");
  var fileInput     = document.getElementById("ipFileInput");
  var browseBtn     = document.getElementById("ipBrowseBtn");
  var workspace     = document.getElementById("ipWorkspace");
  var pageCount     = document.getElementById("ipPageCount");
  var grid          = document.getElementById("ipGrid");
  var addMoreBtn    = document.getElementById("ipAddMoreBtn");
  var pageSizes     = document.getElementById("ipPageSizes");
  var orientation   = document.getElementById("ipOrientation");
  var marginSelect  = document.getElementById("ipMargin");
  var fitSelect     = document.getElementById("ipFit");
  var qualityRange  = document.getElementById("ipQuality");
  var qualityVal    = document.getElementById("ipQualityVal");
  var generateBtn   = document.getElementById("ipGenerateBtn");
  var clearBtn      = document.getElementById("ipClearBtn");
  var progressEl    = document.getElementById("ipProgress");
  var progressFill  = document.getElementById("ipProgressFill");
  var progressText  = document.getElementById("ipProgressText");
  var resultEl      = document.getElementById("ipResult");
  var resultMeta    = document.getElementById("ipResultMeta");
  var downloadBtn   = document.getElementById("ipDownloadBtn");
  var toast         = document.getElementById("ipToast");
  var toastMsg      = document.getElementById("ipToastMsg");

  if (!upload || !fileInput) return;

  var MAX_FILES = 30;
  var MAX_SIZE = 20 * 1024 * 1024;
  var files = []; // { id, file, name, size, url, width, height }
  var lastPdfBlob = null;
  var lastPdfName = "images.pdf";
  var currentPageSize = "a4";

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
      rejected.push(dropped + "টি ফাইল বাদ (সর্বোচ্চ ৩০)");
    }

    // Load each image to get dimensions
    var loadedPromises = accepted.map(function (file) {
      return new Promise(function (resolve) {
        var item = {
          id: "ip-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          file: file,
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          width: 0,
          height: 0
        };
        var img = new Image();
        img.onload = function () {
          item.width = img.naturalWidth;
          item.height = img.naturalHeight;
          resolve(item);
        };
        img.onerror = function () {
          resolve(item);
        };
        img.src = item.url;
      });
    });

    Promise.all(loadedPromises).then(function (items) {
      items.forEach(function (item) { files.push(item); });
      renderGrid();
      if (accepted.length) {
        workspace.hidden = false;
        showToast("✓ " + accepted.length + "টি ছবি যোগ হয়েছে");
      }
      if (rejected.length) {
        setTimeout(function () {
          showToast("⚠ " + rejected[0]);
        }, 500);
      }
    });
  }

  /* ============================================================
     RENDER GRID
     ============================================================ */
  function renderGrid() {
    grid.innerHTML = "";

    if (!files.length) {
      workspace.hidden = true;
      return;
    }

    workspace.hidden = false;
    pageCount.textContent = files.length;

    files.forEach(function (item, idx) {
      var card = document.createElement("div");
      card.className = "ip-page";
      card.setAttribute("data-id", item.id);

      var isFirst = idx === 0;
      var isLast = idx === files.length - 1;

      card.innerHTML =
        '<div class="ip-page-badge">' + (idx + 1) + '</div>' +
        '<div class="ip-page-thumb">' +
          '<img src="' + item.url + '" alt="' + escapeHtml(item.name) + '" loading="lazy">' +
        '</div>' +
        '<div class="ip-page-info">' +
          '<div class="ip-page-name" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</div>' +
          '<div class="ip-page-dims">' + item.width + ' × ' + item.height + '</div>' +
        '</div>' +
        '<div class="ip-page-controls">' +
          '<button type="button" class="ip-page-btn" data-act="up" ' + (isFirst ? 'disabled' : '') + ' title="উপরে">' +
            '<svg class="ip-i" viewBox="0 0 24 24"><use href="#ip-i-arrow-up"/></svg>' +
          '</button>' +
          '<button type="button" class="ip-page-btn" data-act="down" ' + (isLast ? 'disabled' : '') + ' title="নিচে">' +
            '<svg class="ip-i" viewBox="0 0 24 24"><use href="#ip-i-arrow-down"/></svg>' +
          '</button>' +
          '<button type="button" class="ip-page-btn danger" data-act="delete" title="মুছুন">' +
            '<svg class="ip-i" viewBox="0 0 24 24"><use href="#ip-i-trash"/></svg>' +
          '</button>' +
        '</div>';

      card.querySelector('[data-act="up"]').addEventListener("click", function () {
        if (idx > 0) moveItem(idx, idx - 1);
      });
      card.querySelector('[data-act="down"]').addEventListener("click", function () {
        if (idx < files.length - 1) moveItem(idx, idx + 1);
      });
      card.querySelector('[data-act="delete"]').addEventListener("click", function () {
        deleteItem(item.id);
      });

      grid.appendChild(card);
    });
  }

  function moveItem(from, to) {
    if (from < 0 || to < 0 || from >= files.length || to >= files.length) return;
    var item = files.splice(from, 1)[0];
    files.splice(to, 0, item);
    renderGrid();
  }

  function deleteItem(id) {
    var idx = files.findIndex(function (f) { return f.id === id; });
    if (idx === -1) return;
    URL.revokeObjectURL(files[idx].url);
    files.splice(idx, 1);
    renderGrid();
    if (!files.length) {
      workspace.hidden = true;
      resultEl.hidden = true;
    }
    showToast("✓ ছবি মুছে ফেলা হয়েছে");
  }

  /* ============================================================
     PDF GENERATION
     ============================================================ */
  function imageToJpeg(item, quality) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          var ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          var dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve({
            dataUrl: dataUrl,
            width: canvas.width,
            height: canvas.height
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = function () {
        reject(new Error("Image load failed"));
      };
      img.src = item.url;
    });
  }

  function generatePDF() {
    if (!files.length) {
      showToast("⚠ প্রথমে ছবি যোগ করুন");
      return;
    }
    if (typeof window.jspdf === "undefined" || !window.jspdf.jsPDF) {
      showToast("⚠ PDF লাইব্রেরি লোড হয়নি — ইন্টারনেট চেক করুন");
      return;
    }

    var jsPDF = window.jspdf.jsPDF;

    generateBtn.disabled = true;
    generateBtn.classList.add("is-loading");
    progressEl.hidden = false;
    progressFill.style.width = "0%";
    resultEl.hidden = true;

    var pageSize = currentPageSize;
    var orient = orientation.value;
    var marginKey = marginSelect.value;
    var fit = fitSelect.value;
    var quality = parseInt(qualityRange.value, 10) / 100;

    var marginMm = { none: 0, small: 5, medium: 10, large: 15 }[marginKey];
    var pageSizes = {
      a4: [210, 297],
      letter: [215.9, 279.4],
      legal: [215.9, 355.6]
    };

    var pdf = null;
    var done = 0;
    var total = files.length;

    function processNext() {
      if (done >= total) {
        finish();
        return;
      }

      var item = files[done];
      progressText.textContent = "প্রসেস হচ্ছে " + (done + 1) + " / " + total + ": " + item.name;
      progressFill.style.width = Math.round((done / total) * 100) + "%";

      imageToJpeg(item, quality)
        .then(function (jpeg) {
          var pw, ph;

          if (pageSize === "fit") {
            // Fit to image — use image dimensions converted to mm at 96 DPI
            var dpi = 96;
            pw = (jpeg.width / dpi) * 25.4;
            ph = (jpeg.height / dpi) * 25.4;
            // Very large images — cap to reasonable sizes
            var maxMm = 500;
            if (pw > maxMm || ph > maxMm) {
              var s = maxMm / Math.max(pw, ph);
              pw *= s;
              ph *= s;
            }
          } else {
            var base = pageSizes[pageSize];
            pw = base[0];
            ph = base[1];

            var applyLandscape = false;
            if (orient === "landscape") {
              applyLandscape = true;
            } else if (orient === "auto") {
              applyLandscape = jpeg.width > jpeg.height;
            }
            if (applyLandscape) {
              var tmp = pw;
              pw = ph;
              ph = tmp;
            }
          }

          // Create or add page
          var pageOrient = pw > ph ? "landscape" : "portrait";
          if (!pdf) {
            pdf = new jsPDF({
              orientation: pageOrient,
              unit: "mm",
              format: [pw, ph],
              compress: true
            });
          } else {
            pdf.addPage([pw, ph], pageOrient);
          }

          // Calculate draw box
          var availW = pw - marginMm * 2;
          var availH = ph - marginMm * 2;
          var imgRatio = jpeg.width / jpeg.height;
          var boxRatio = availW / availH;

          var drawW, drawH, x, y;

          if (fit === "stretch") {
            drawW = availW;
            drawH = availH;
            x = marginMm;
            y = marginMm;
          } else {
            // contain
            if (imgRatio > boxRatio) {
              drawW = availW;
              drawH = availW / imgRatio;
            } else {
              drawH = availH;
              drawW = availH * imgRatio;
            }
            x = marginMm + (availW - drawW) / 2;
            y = marginMm + (availH - drawH) / 2;
          }

          pdf.addImage(jpeg.dataUrl, "JPEG", x, y, drawW, drawH, undefined, "FAST");
          done++;
          progressFill.style.width = Math.round((done / total) * 100) + "%";
          setTimeout(processNext, 20);
        })
        .catch(function (err) {
          console.error("PDF error:", err);
          done++;
          setTimeout(processNext, 20);
        });
    }

    function finish() {
      try {
        var blob = pdf.output("blob");
        lastPdfBlob = blob;
        var baseName = "images-" + Date.now();
        lastPdfName = baseName + ".pdf";

        resultMeta.textContent = total + " পৃষ্ঠা · " + formatBytes(blob.size);
        resultEl.hidden = false;

        progressText.textContent = "✓ PDF তৈরি হয়েছে";
        setTimeout(function () {
          progressEl.hidden = true;
          progressFill.style.width = "0%";
        }, 1200);

        generateBtn.disabled = false;
        generateBtn.classList.remove("is-loading");
        showToast("✓ PDF তৈরি হয়েছে");
        resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (err) {
        console.error(err);
        generateBtn.disabled = false;
        generateBtn.classList.remove("is-loading");
        progressEl.hidden = true;
        showToast("✕ PDF তৈরি ব্যর্থ");
      }
    }

    processNext();
  }

  /* ============================================================
     DOWNLOAD
     ============================================================ */
  function downloadPDF() {
    if (!lastPdfBlob) {
      showToast("⚠ প্রথমে PDF তৈরি করুন");
      return;
    }
    var url = URL.createObjectURL(lastPdfBlob);
    var a = document.createElement("a");
    a.href = url;
    a.download = lastPdfName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    showToast("✓ ডাউনলোড শুরু হয়েছে");
  }

  /* ============================================================
     CLEAR
     ============================================================ */
  function clearAll() {
    files.forEach(function (f) {
      if (f.url) URL.revokeObjectURL(f.url);
    });
    files = [];
    lastPdfBlob = null;
    grid.innerHTML = "";
    workspace.hidden = true;
    resultEl.hidden = true;
    progressEl.hidden = true;
    fileInput.value = "";
    showToast("✓ সব ছবি মুছে ফেলা হয়েছে");
  }

  /* ============================================================
     EVENTS
     ============================================================ */
  upload.addEventListener("click", function (e) {
    if (e.target.closest(".ip-upload-btn")) return;
    fileInput.click();
  });
  browseBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    fileInput.click();
  });
  addMoreBtn.addEventListener("click", function () {
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

  /* Page size chips */
  pageSizes.addEventListener("click", function (e) {
    var btn = e.target.closest(".ip-chip");
    if (!btn) return;
    pageSizes.querySelectorAll(".ip-chip").forEach(function (b) {
      b.classList.remove("is-active");
    });
    btn.classList.add("is-active");
    currentPageSize = btn.getAttribute("data-size");

    // Disable orientation for fit mode
    if (currentPageSize === "fit") {
      orientation.disabled = true;
      orientation.style.opacity = "0.5";
    } else {
      orientation.disabled = false;
      orientation.style.opacity = "1";
    }
  });

  /* Quality */
  qualityRange.addEventListener("input", function () {
    qualityVal.textContent = this.value + "%";
  });

  /* Generate & download */
  generateBtn.addEventListener("click", generatePDF);
  downloadBtn.addEventListener("click", downloadPDF);
  clearBtn.addEventListener("click", clearAll);

})();
