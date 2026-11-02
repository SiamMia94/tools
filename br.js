(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".bg-rem")) return;
    document.body.classList.add("br-full");
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
  var upload        = document.getElementById("brUpload");
  var fileInput     = document.getElementById("brFileInput");
  var browseBtn     = document.getElementById("brBrowseBtn");
  var workspace     = document.getElementById("brWorkspace");
  var stage         = document.getElementById("brStage");
  var displayCanvas = document.getElementById("brDisplay");
  var overlayCanvas = document.getElementById("brOverlay");
  var toolIndicator = document.getElementById("brToolIndicator");
  var toolLabel     = document.getElementById("brToolLabel");
  var toolButtons   = document.querySelectorAll(".br-tool");
  var toleranceIn   = document.getElementById("brTolerance");
  var toleranceVal  = document.getElementById("brToleranceVal");
  var featherIn     = document.getElementById("brFeather");
  var featherVal    = document.getElementById("brFeatherVal");
  var brushIn       = document.getElementById("brBrush");
  var brushVal      = document.getElementById("brBrushVal");
  var bgOptions     = document.querySelectorAll(".br-bg-opt");
  var customColor   = document.getElementById("brCustomColor");
  var removeBtn     = document.getElementById("brRemoveBtn");
  var resetBtn      = document.getElementById("brResetBtn");
  var downloadBtn   = document.getElementById("brDownloadBtn");
  var toast         = document.getElementById("brToast");
  var toastMsg      = document.getElementById("brToastMsg");

  if (!upload || !fileInput) return;

  /* ---------- State ---------- */
  var MAX_SIZE = 20 * 1024 * 1024;
  var MAX_DIM = 1600; // downscale longest side for performance

  var originalCanvas = document.createElement("canvas");
  var workingCanvas = document.createElement("canvas");
  var oCtx = originalCanvas.getContext("2d");
  var wCtx = workingCanvas.getContext("2d");
  var dCtx = displayCanvas.getContext("2d");
  var ovCtx = overlayCanvas.getContext("2d");

  var currentTool = "pan";
  var brushRadius = 15;
  var currentBgColor = "transparent";
  var isProcessing = false;
  var hasImage = false;

  // Brush pointer tracking
  var isDrawing = false;
  var lastX = 0;
  var lastY = 0;

  /* ---------- Utilities ---------- */
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("show");
    }, 2400);
  }

  function setProcessing(state) {
    isProcessing = state;
    removeBtn.disabled = state;
    resetBtn.disabled = state;
    downloadBtn.disabled = state || !hasImage;
    removeBtn.classList.toggle("is-loading", state);
  }

  /* ---------- Composite working → display ---------- */
  function composite() {
    if (!hasImage) return;
    dCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    dCtx.drawImage(workingCanvas, 0, 0);
  }

  /* ---------- Load image ---------- */
  function loadImage(file) {
    if (!/^image\//i.test(file.type || "")) {
      showToast("⚠ শুধু ছবি ফাইল সাপোর্টেড");
      return;
    }
    if (file.size > MAX_SIZE) {
      showToast("⚠ ফাইল ২০ MB এর চেয়ে বড়");
      return;
    }

    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      try {
        // Calculate scaled dimensions
        var scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.round(img.naturalWidth * scale);
        var h = Math.round(img.naturalHeight * scale);

        // Set up canvases
        originalCanvas.width = w;
        originalCanvas.height = h;
        workingCanvas.width = w;
        workingCanvas.height = h;
        displayCanvas.width = w;
        displayCanvas.height = h;
        overlayCanvas.width = w;
        overlayCanvas.height = h;

        // Draw original
        oCtx.clearRect(0, 0, w, h);
        oCtx.drawImage(img, 0, 0, w, h);

        // Copy to working
        wCtx.clearRect(0, 0, w, h);
        wCtx.drawImage(originalCanvas, 0, 0);

        // Composite to display
        composite();

        hasImage = true;
        workspace.hidden = false;
        downloadBtn.disabled = false;

        showToast("✓ ছবি লোড হয়েছে (" + w + "×" + h + ")");

        // Scroll to workspace
        setTimeout(function () {
          workspace.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);

      } catch (err) {
        console.error(err);
        showToast("✕ ছবি লোড ব্যর্থ");
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      showToast("✕ ছবি লোড করা যায়নি");
    };
    img.src = url;
  }

  /* ============================================================
     BACKGROUND REMOVAL — Flood fill from edges
     ============================================================ */
  function sampleCorner(data, w, h, cx, cy, radius) {
    var r = 0, g = 0, b = 0, count = 0;
    var x0 = Math.max(0, cx - radius);
    var y0 = Math.max(0, cy - radius);
    var x1 = Math.min(w - 1, cx + radius);
    var y1 = Math.min(h - 1, cy + radius);

    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var i = (y * w + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }
    return { r: r / count, g: g / count, b: b / count };
  }

  function removeBackground() {
    if (!hasImage) return;

    var w = workingCanvas.width;
    var h = workingCanvas.height;

    // Reset working to original first
    wCtx.clearRect(0, 0, w, h);
    wCtx.drawImage(originalCanvas, 0, 0);

    var imageData = wCtx.getImageData(0, 0, w, h);
    var data = imageData.data;

    // Sample 4 corners (5x5 patches)
    var patchR = 5;
    var c1 = sampleCorner(data, w, h, 0, 0, patchR);
    var c2 = sampleCorner(data, w, h, w - 1, 0, patchR);
    var c3 = sampleCorner(data, w, h, 0, h - 1, patchR);
    var c4 = sampleCorner(data, w, h, w - 1, h - 1, patchR);

    // Average background color
    var br = (c1.r + c2.r + c3.r + c4.r) / 4;
    var bg = (c1.g + c2.g + c3.g + c4.g) / 4;
    var bb = (c1.b + c2.b + c3.b + c4.b) / 4;

    var tolerance = parseFloat(toleranceIn.value);
    var feather = parseFloat(featherIn.value);

    var tolSq = tolerance * tolerance;
    var featherSq = (tolerance + feather) * (tolerance + feather);

    // BFS flood fill from edges
    var visited = new Uint8Array(w * h);
    var stack = new Int32Array(w * h * 2);
    var sp = 0;

    // Seed edges (top, bottom, left, right)
    for (var x = 0; x < w; x++) {
      var idxT = x; // top
      if (!visited[idxT]) { visited[idxT] = 1; stack[sp++] = x; stack[sp++] = 0; }
      var idxB = (h - 1) * w + x; // bottom
      if (!visited[idxB]) { visited[idxB] = 1; stack[sp++] = x; stack[sp++] = h - 1; }
    }
    for (var y = 0; y < h; y++) {
      var idxL = y * w; // left
      if (!visited[idxL]) { visited[idxL] = 1; stack[sp++] = 0; stack[sp++] = y; }
      var idxR = y * w + (w - 1); // right
      if (!visited[idxR]) { visited[idxR] = 1; stack[sp++] = w - 1; stack[sp++] = y; }
    }

    // Process
    while (sp > 0) {
      sp -= 2;
      var py = stack[sp + 1];
      var px = stack[sp];
      var idx = py * w + px;
      var di = idx * 4;

      var dr = data[di] - br;
      var dg = data[di + 1] - bg;
      var db = data[di + 2] - bb;
      var distSq = dr * dr + dg * dg + db * db;

      if (distSq > featherSq) continue;

      // Compute alpha
      var alpha;
      if (distSq <= tolSq) {
        alpha = 0;
      } else {
        var dist = Math.sqrt(distSq);
        var p = (dist - tolerance) / feather;
        alpha = Math.min(255, Math.round(p * 255));
      }

      // Apply
      if (alpha < data[di + 3]) {
        data[di + 3] = alpha;
      }

      // Push neighbors
      function tryPush(nx, ny) {
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
        var nidx = ny * w + nx;
        if (visited[nidx]) return;
        visited[nidx] = 1;
        stack[sp++] = nx;
        stack[sp++] = ny;
      }
      tryPush(px - 1, py);
      tryPush(px + 1, py);
      tryPush(px, py - 1);
      tryPush(px, py + 1);
    }

    wCtx.putImageData(imageData, 0, 0);
    composite();
  }

  /* ---------- Remove button ---------- */
  removeBtn.addEventListener("click", function () {
    if (!hasImage) {
      showToast("⚠ প্রথমে ছবি লোড করুন");
      return;
    }
    if (isProcessing) return;
    setProcessing(true);

    // Let UI paint spinner before heavy compute
    setTimeout(function () {
      try {
        removeBackground();
        showToast("✓ ব্যাকগ্রাউন্ড সরানো হয়েছে");
      } catch (err) {
        console.error(err);
        showToast("✕ প্রসেস ব্যর্থ");
      }
      setProcessing(false);
    }, 60);
  });

  /* ---------- Reset to original ---------- */
  resetBtn.addEventListener("click", function () {
    if (!hasImage) return;
    wCtx.clearRect(0, 0, workingCanvas.width, workingCanvas.height);
    wCtx.drawImage(originalCanvas, 0, 0);
    composite();
    showToast("✓ মূল ছবিতে ফিরেছেন");
  });

  /* ---------- Sliders ---------- */
  toleranceIn.addEventListener("input", function () {
    toleranceVal.textContent = this.value;
  });
  featherIn.addEventListener("input", function () {
    featherVal.textContent = this.value;
  });
  brushIn.addEventListener("input", function () {
    brushVal.textContent = this.value;
    brushRadius = parseFloat(this.value);
  });

  /* ---------- Tool selection ---------- */
  toolButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      toolButtons.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      currentTool = btn.getAttribute("data-tool");

      if (currentTool === "erase") {
        toolLabel.textContent = "মুছুন";
        toolIndicator.querySelector("use").setAttribute("href", "#br-i-eraser");
      } else if (currentTool === "restore") {
        toolLabel.textContent = "ফিরান";
        toolIndicator.querySelector("use").setAttribute("href", "#br-i-restore");
      } else {
        toolLabel.textContent = "প্যান";
        toolIndicator.querySelector("use").setAttribute("href", "#br-i-hand");
      }
    });
  });

  /* ---------- Background color options ---------- */
  bgOptions.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (e.target === customColor) return;
      bgOptions.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");

      var bg = btn.getAttribute("data-bg");
      if (bg === "custom") {
        currentBgColor = customColor.value;
      } else {
        currentBgColor = bg;
      }
    });
  });
  customColor.addEventListener("input", function () {
    currentBgColor = this.value;
    bgOptions.forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-bg") === "custom");
    });
  });

  /* ============================================================
     BRUSH DRAWING
     ============================================================ */
  function getCanvasCoords(e) {
    var rect = displayCanvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width * displayCanvas.width;
    var y = (e.clientY - rect.top) / rect.height * displayCanvas.height;
    return { x: x, y: y };
  }

  function drawBrushDot(x, y) {
    if (currentTool === "erase") {
      wCtx.globalCompositeOperation = "destination-out";
      wCtx.beginPath();
      wCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
      wCtx.fill();
      wCtx.globalCompositeOperation = "source-over";
    } else if (currentTool === "restore") {
      wCtx.save();
      wCtx.beginPath();
      wCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
      wCtx.clip();
      wCtx.drawImage(originalCanvas, 0, 0);
      wCtx.restore();
    }
  }

  function drawStroke(x0, y0, x1, y1) {
    var dist = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
    var step = Math.max(1, brushRadius * 0.4);
    var steps = Math.max(1, Math.ceil(dist / step));
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      drawBrushDot(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
    }
  }

  /* ---------- Overlay brush cursor ---------- */
  function drawCursor(x, y, visible) {
    ovCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    if (!visible) return;
    if (currentTool === "pan") return;

    ovCtx.beginPath();
    ovCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
    ovCtx.strokeStyle = currentTool === "erase" ? "rgba(244, 63, 94, 0.9)" : "rgba(16, 185, 129, 0.9)";
    ovCtx.lineWidth = Math.max(2, brushRadius * 0.15);
    ovCtx.stroke();

    // Inner circle for size
    ovCtx.beginPath();
    ovCtx.arc(x, y, Math.max(1, brushRadius - ovCtx.lineWidth), 0, Math.PI * 2);
    ovCtx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ovCtx.lineWidth = 1;
    ovCtx.stroke();
  }

  /* ---------- Pointer events on display canvas ---------- */
  displayCanvas.addEventListener("pointerdown", function (e) {
    if (!hasImage || currentTool === "pan") return;
    isDrawing = true;
    var c = getCanvasCoords(e);
    lastX = c.x;
    lastY = c.y;
    drawBrushDot(c.x, c.y);
    composite();
    displayCanvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  displayCanvas.addEventListener("pointermove", function (e) {
    if (!hasImage) return;
    var c = getCanvasCoords(e);

    // Draw cursor
    if (currentTool !== "pan") {
      drawCursor(c.x, c.y, true);
    } else {
      ovCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    if (isDrawing && currentTool !== "pan") {
      drawStroke(lastX, lastY, c.x, c.y);
      composite();
      lastX = c.x;
      lastY = c.y;
    }
  });

  displayCanvas.addEventListener("pointerup", function (e) {
    if (isDrawing) {
      isDrawing = false;
      composite();
    }
    try { displayCanvas.releasePointerCapture(e.pointerId); } catch (err) {}
  });

  displayCanvas.addEventListener("pointerleave", function () {
    ovCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  });

  displayCanvas.addEventListener("pointercancel", function () {
    isDrawing = false;
    ovCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  });

  // Cursor style
  displayCanvas.addEventListener("mouseenter", function () {
    if (currentTool === "pan") {
      displayCanvas.style.cursor = "default";
    } else {
      displayCanvas.style.cursor = "none";
    }
  });
  displayCanvas.addEventListener("mouseleave", function () {
    displayCanvas.style.cursor = "default";
  });

  // Update cursor style when tool changes
  toolButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (currentTool === "pan") {
        displayCanvas.style.cursor = "default";
      } else {
        displayCanvas.style.cursor = "none";
      }
    });
  });

  /* ============================================================
     DOWNLOAD
     ============================================================ */
  downloadBtn.addEventListener("click", function () {
    if (!hasImage) {
      showToast("⚠ প্রথমে ছবি লোড করুন");
      return;
    }

    // Create output canvas
    var out = document.createElement("canvas");
    out.width = workingCanvas.width;
    out.height = workingCanvas.height;
    var octx = out.getContext("2d");

    // Apply background color if not transparent
    if (currentBgColor !== "transparent") {
      octx.fillStyle = currentBgColor;
      octx.fillRect(0, 0, out.width, out.height);
    }

    // Draw working canvas on top
    octx.drawImage(workingCanvas, 0, 0);

    // Export
    out.toBlob(function (blob) {
      if (!blob) {
        showToast("✕ ডাউনলোড ব্যর্থ");
        return;
      }
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "background-removed-" + Date.now() + ".png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
      showToast("✓ ডাউনলোড শুরু হয়েছে");
    }, "image/png");
  });

  /* ============================================================
     FILE INPUT
     ============================================================ */
  upload.addEventListener("click", function (e) {
    if (e.target.closest(".br-upload-btn")) return;
    fileInput.click();
  });
  browseBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    fileInput.click();
  });
  fileInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      loadImage(this.files[0]);
    }
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
    if (dt && dt.files && dt.files[0]) loadImage(dt.files[0]);
  });

  /* ---------- Init ---------- */
  downloadBtn.disabled = true;

})();
