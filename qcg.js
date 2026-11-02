(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".qr-gen")) return;
    document.body.classList.add("qr-full");
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

  /* ---------- DOMRIR ---------- */
  var typeButtons   = document.querySelectorAll(".qr-type-btn");
  var fieldGroups   = document.querySelectorAll(".qr-field-group");
  var fgColor       = document.getElementById("qrFgColor");
  var bgColor       = document.getElementById("qrBgColor");
  var colorPresets  = document.querySelectorAll(".qr-preset-swatch");
  var sizeRange     = document.getElementById("qrSize");
  var sizeValue     = document.getElementById("qrSizeValue");
  var ecLevelSel    = document.getElementById("qrEcLevel");
  var canvas        = document.getElementById("qrCanvas");
  var canvasWrap    = document.getElementById("qrCanvasWrap");
  var placeholder   = document.getElementById("qrPlaceholder");
  var statusEl      = document.getElementById("qrStatus");
  var statusText    = document.getElementById("qrStatusText");
  var downloadPngBtn= document.getElementById("qrDownloadPng");
  var downloadSvgBtn= document.getElementById("qrDownloadSvg");
  var copyImageBtn  = document.getElementById("qrCopyImage");
  var resetBtn      = document.getElementById("qrResetBtn");
  var toast         = document.getElementById("qrToast");
  var toastMsg      = document.getElementById("qrToastMsg");

  if (!canvas) return;

  /* ---------- State ---------- */
  var state = {
    type: "url",
    currentData: "",
    qrGenerated: false
  };

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

  function escapeVcard(s) {
    return String(s || "").replace(/[\\;,]/g, function (m) { return "\\" + m; }).replace(/\n/g, "\\n");
  }

  /* ============================================================
     BUILD QR DATA STRING
     ============================================================ */
  function buildQRData() {
    var type = state.type;

    if (type === "url") {
      var url = document.getElementById("qrUrl").value.trim();
      if (!url) return "";
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      return url;
    }

    if (type === "text") {
      return document.getElementById("qrText").value.trim();
    }

    if (type === "email") {
      var email = document.getElementById("qrEmail").value.trim();
      if (!email) return "";
      var subj = document.getElementById("qrEmailSubject").value.trim();
      var body = document.getElementById("qrEmailBody").value.trim();
      var params = [];
      if (subj) params.push("subject=" + encodeURIComponent(subj));
      if (body) params.push("body=" + encodeURIComponent(body));
      return "mailto:" + email + (params.length ? "?" + params.join("&") : "");
    }

    if (type === "phone") {
      var phone = document.getElementById("qrPhone").value.trim();
      if (!phone) return "";
      return "tel:" + phone.replace(/\s+/g, "");
    }

    if (type === "sms") {
      var smsPhone = document.getElementById("qrSmsPhone").value.trim();
      if (!smsPhone) return "";
      var smsBody = document.getElementById("qrSmsBody").value.trim();
      return "SMSTO:" + smsPhone.replace(/\s+/g, "") + ":" + smsBody;
    }

    if (type === "wifi") {
      var ssid = document.getElementById("qrWifiSsid").value.trim();
      if (!ssid) return "";
      var pass = document.getElementById("qrWifiPass").value;
      var enc = document.getElementById("qrWifiType").value;
      var esc = function (s) { return String(s).replace(/([\\;,:"])/g, "\\$1"); };
      if (enc === "nopass") {
        return "WIFI:T:nopass;S:" + esc(ssid) + ";;";
      }
      return "WIFI:T:" + enc + ";S:" + esc(ssid) + ";P:" + esc(pass) + ";;";
    }

    if (type === "vcard") {
      var first = document.getElementById("qrVcardFirst").value.trim();
      var last = document.getElementById("qrVcardLast").value.trim();
      var vphone = document.getElementById("qrVcardPhone").value.trim();
      var vemail = document.getElementById("qrVcardEmail").value.trim();
      var company = document.getElementById("qrVcardCompany").value.trim();
      if (!first && !last && !vphone && !vemail) return "";
      var v = "BEGIN:VCARD\nVERSION:3.0\n";
      v += "N:" + escapeVcard(last) + ";" + escapeVcard(first) + ";;;\n";
      v += "FN:" + escapeVcard(first + " " + last).trim() + "\n";
      if (company) v += "ORG:" + escapeVcard(company) + "\n";
      if (vphone) v += "TEL;TYPE=CELL:" + vphone + "\n";
      if (vemail) v += "EMAIL:" + vemail + "\n";
      v += "END:VCARD";
      return v;
    }

    if (type === "geo") {
      var lat = document.getElementById("qrGeoLat").value.trim();
      var lng = document.getElementById("qrGeoLong").value.trim();
      if (!lat || !lng) return "";
      return "geo:" + lat + "," + lng;
    }

    if (type === "event") {
      var title = document.getElementById("qrEventTitle").value.trim();
      var start = document.getElementById("qrEventStart").value.trim();
      var end = document.getElementById("qrEventEnd").value.trim();
      var loc = document.getElementById("qrEventLocation").value.trim();
      if (!title || !start) return "";
      // Convert to iCal format: YYYYMMDDTHHMMSS
      function toIcal(str) {
        var m = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?/);
        if (!m) return "";
        return m[1] + m[2] + m[3] + "T" + (m[4] || "00") + (m[5] || "00") + "00";
      }
      var startIcal = toIcal(start);
      var endIcal = end ? toIcal(end) : startIcal;
      if (!startIcal) return "";
      var ev = "BEGIN:VEVENT\n";
      ev += "SUMMARY:" + escapeVcard(title) + "\n";
      ev += "DTSTART:" + startIcal + "\n";
      ev += "DTEND:" + endIcal + "\n";
      if (loc) ev += "LOCATION:" + escapeVcard(loc) + "\n";
      ev += "END:VEVENT";
      return ev;
    }

    return "";
  }

  /* ============================================================
     GENERATE QR
     ============================================================ */
  function generateQR() {
    var data = buildQRData();
    state.currentData = data;

    if (!data) {
      placeholder.style.display = "";
      canvasWrap.style.display = "none";
      statusEl.className = "qr-preview-status empty";
      statusText.textContent = "তথ্য দিন";
      downloadPngBtn.disabled = true;
      downloadSvgBtn.disabled = true;
      copyImageBtn.disabled = true;
      state.qrGenerated = false;
      return;
    }

    placeholder.style.display = "none";
    canvasWrap.style.display = "";

    // Clear canvas
    var size = parseInt(sizeRange.value, 10);
    canvas.width = size;
    canvas.height = size;

    // Use QRCode.js to generate into a temp div, then render into our canvas
    var tempDiv = document.createElement("div");
    tempDiv.style.cssText = "position:absolute;left:-9999px;top:-9999px;";

    try {
      var qr = new QRCode(tempDiv, {
        text: data,
        width: size,
        height: size,
        colorDark: fgColor.value,
        colorLight: bgColor.value,
        correctLevel: QRCode.CorrectLevel[ecLevelSel.value] || QRCode.CorrectLevel.M
      });

      // Wait for QR to be generated (it's usually sync but be safe)
      setTimeout(function () {
        var qrCanvas = tempDiv.querySelector("canvas");
        var qrImg = tempDiv.querySelector("img");

        if (qrCanvas) {
          var ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(qrCanvas, 0, 0, size, size);
          state.qrGenerated = true;
          enableActions();
        } else if (qrImg && qrImg.src) {
          var img = new Image();
          img.onload = function () {
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            state.qrGenerated = true;
            enableActions();
          };
          img.src = qrImg.src;
        }

        statusEl.className = "qr-preview-status valid";
        statusText.textContent = "প্রস্তুত";
      }, 30);

    } catch (err) {
      console.error("QR generation error:", err);
      statusEl.className = "qr-preview-status empty";
      statusText.textContent = "ডেটা বেশি";
      showToast("⚠ ডেটা অনেক বেশি — ছোট করুন");
      downloadPngBtn.disabled = true;
      downloadSvgBtn.disabled = true;
      copyImageBtn.disabled = true;
      state.qrGenerated = false;
    }
  }

  function enableActions() {
    downloadPngBtn.disabled = false;
    downloadSvgBtn.disabled = false;
    copyImageBtn.disabled = false;
  }

  /* ============================================================
     TYPE SWITCHING
     ============================================================ */
  typeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      typeButtons.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.type = btn.getAttribute("data-type");

      fieldGroups.forEach(function (g) {
        g.classList.toggle("is-active", g.getAttribute("data-group") === state.type);
      });

      generateQR();
    });
  });

  /* ============================================================
     INPUT LISTENERS (live)
     ============================================================ */
  var allInputs = document.querySelectorAll(".qr-field-group input, .qr-field-group textarea, .qr-field-group select");
  allInputs.forEach(function (input) {
    input.addEventListener("input", generateQR);
    input.addEventListener("change", generateQR);
  });

  /* ============================================================
     COLORS
     ============================================================ */
  fgColor.addEventListener("input", generateQR);
  bgColor.addEventListener("input", generateQR);

  colorPresets.forEach(function (swatch) {
    swatch.addEventListener("click", function () {
      colorPresets.forEach(function (s) { s.classList.remove("is-active"); });
      swatch.classList.add("is-active");
      fgColor.value = swatch.getAttribute("data-fg");
      bgColor.value = swatch.getAttribute("data-bg");
      generateQR();
    });
  });

  /* ============================================================
     SIZE
     ============================================================ */
  sizeRange.addEventListener("input", function () {
    sizeValue.textContent = this.value + " px";
  });
  sizeRange.addEventListener("change", generateQR);

  /* ============================================================
     ERROR CORRECTION
     ============================================================ */
  ecLevelSel.addEventListener("change", generateQR);

  /* ============================================================
     DOWNLOAD PNG
     ============================================================ */
  downloadPngBtn.addEventListener("click", function () {
    if (!state.qrGenerated) {
      showToast("⚠ আগে তথ্য দিন");
      return;
    }
    try {
      canvas.toBlob(function (blob) {
        if (!blob) {
          showToast("✕ ডাউনলোড ব্যর্থ");
          return;
        }
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "qr-code-" + Date.now() + ".png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
        showToast("✓ PNG ডাউনলোড হয়েছে");
      }, "image/png");
    } catch (err) {
      console.error(err);
      showToast("✕ ডাউনলোড ব্যর্থ");
    }
  });

  /* ============================================================
     DOWNLOAD SVG
     ============================================================ */
  downloadSvgBtn.addEventListener("click", function () {
    if (!state.qrGenerated) {
      showToast("⚠ আগে তথ্য দিন");
      return;
    }

    try {
      // Regenerate using QRCode.js internal matrix
      var tempDiv = document.createElement("div");
      tempDiv.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
      document.body.appendChild(tempDiv);

      var size = parseInt(sizeRange.value, 10);
      var qr = new QRCode(tempDiv, {
        text: state.currentData,
        width: size,
        height: size,
        colorDark: fgColor.value,
        colorLight: bgColor.value,
        correctLevel: QRCode.CorrectLevel[ecLevelSel.value] || QRCode.CorrectLevel.M
      });

      setTimeout(function () {
        var qrCanvas = tempDiv.querySelector("canvas");
        if (!qrCanvas) {
          document.body.removeChild(tempDiv);
          // Fallback: rasterize from main canvas
          rasterToSvg();
          return;
        }

        // Read pixels from the QR canvas
        var ctx = qrCanvas.getContext("2d");
        var imgData = ctx.getImageData(0, 0, size, size);
        var data = imgData.data;

        // Determine module size by analyzing top row (find first transition)
        // Standard QR is 21x21 up to 177x177
        // Find module size by looking for the position marker pattern (7x7)
        // Simpler: use the QRCode.js internal _oQRCode (not exposed), so we detect via pixel scanning

        // Detect grid size: scan center of top-left position marker
        // Position marker is 7 modules wide
        var topLeftSize = 0;
        for (var x = 0; x < size; x++) {
          var i = x * 4;
          if (data[i] < 128) { topLeftSize++; }
          else if (topLeftSize > 0) { break; }
        }

        if (topLeftSize === 0) {
          document.body.removeChild(tempDiv);
          rasterToSvg();
          return;
        }

        var moduleCount = Math.round(size / (topLeftSize / 7));
        var moduleSize = size / moduleCount;

        var fg = fgColor.value;
        var bg = bgColor.value;

        var svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
        svg += '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + moduleCount + ' ' + moduleCount + '" shape-rendering="crispEdges">\n';
        svg += '<rect width="' + moduleCount + '" height="' + moduleCount + '" fill="' + bg + '"/>\n';
        svg += '<path fill="' + fg + '" d="';

        for (var y = 0; y < moduleCount; y++) {
          for (var x = 0; x < moduleCount; x++) {
            var px = Math.floor(x * moduleSize + moduleSize / 2);
            var py = Math.floor(y * moduleSize + moduleSize / 2);
            var pi = (py * size + px) * 4;
            if (data[pi] < 128) {
              svg += "M" + x + " " + y + "h1v1h-1z";
            }
          }
        }

        svg += '"/>\n</svg>';

        document.body.removeChild(tempDiv);

        var blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "qr-code-" + Date.now() + ".svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
        showToast("✓ SVG ডাউনলোড হয়েছে");

      }, 50);

    } catch (err) {
      console.error(err);
      showToast("✕ SVG তৈরি ব্যর্থ");
    }
  });

  function rasterToSvg() {
    // Fallback: use main canvas as background
    var dataUrl = canvas.toDataURL("image/png");
    var svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
    svg += '<svg xmlns="http://www.w3.org/2000/svg" width="' + canvas.width + '" height="' + canvas.height + '" viewBox="0 0 ' + canvas.width + ' ' + canvas.height + '">\n';
    svg += '<image href="' + dataUrl + '" width="' + canvas.width + '" height="' + canvas.height + '"/>\n';
    svg += '</svg>';
    var blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "qr-code-" + Date.now() + ".svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    showToast("✓ SVG ডাউনলোড হয়েছে");
  }

  /* ============================================================
     COPY IMAGE TO CLIPBOARD
     ============================================================ */
  copyImageBtn.addEventListener("click", function () {
    if (!state.qrGenerated) {
      showToast("⚠ আগে তথ্য দিন");
      return;
    }

    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast("⚠ এই ব্রাউজারে ইমেজ কপি সাপোর্টেড নয়");
      return;
    }

    canvas.toBlob(function (blob) {
      if (!blob) {
        showToast("✕ কপি ব্যর্থ");
        return;
      }
      try {
        var item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(function () {
          showToast("✓ ইমেজ কপি হয়েছে");
        }).catch(function (err) {
          console.error(err);
          showToast("⚠ কপি করা যায়নি — ডাউনলোড করুন");
        });
      } catch (err) {
        console.error(err);
        showToast("⚠ এই ব্রাউজারে ইমেজ কপি সাপোর্টেড নয়");
      }
    }, "image/png");
  });

  /* ============================================================
     RESET
     ============================================================ */
  resetBtn.addEventListener("click", function () {
    // Clear all fields
    document.querySelectorAll(".qr-field-group input, .qr-field-group textarea").forEach(function (el) {
      el.value = "";
    });

    // Reset to URL type
    typeButtons.forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-type") === "url");
    });
    state.type = "url";
    fieldGroups.forEach(function (g) {
      g.classList.toggle("is-active", g.getAttribute("data-group") === "url");
    });

    // Reset colors
    fgColor.value = "#1e293b";
    bgColor.value = "#ffffff";
    colorPresets.forEach(function (s, i) {
      s.classList.toggle("is-active", i === 0);
    });

    // Reset size + EC
    sizeRange.value = 400;
    sizeValue.textContent = "400 px";
    ecLevelSel.value = "M";

    // URL default
    document.getElementById("qrUrl").value = "https://apk48.com";

    generateQR();
    showToast("✓ রিসেট হয়েছে");
  });

  /* ============================================================
     INIT
     ============================================================ */
  generateQR();

})();
