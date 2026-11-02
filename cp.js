(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".cp-gen")) return;
    document.body.classList.add("cp-full");
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
  var swatch         = document.getElementById("cpSwatch");
  var hexBig         = document.getElementById("cpHexBig");
  var nativeInput    = document.getElementById("cpNative");
  var copyHexBtn     = document.getElementById("cpCopyHex");
  var randomBtn      = document.getElementById("cpRandom");
  var saveBtn        = document.getElementById("cpSave");

  var rInput         = document.getElementById("cpR");
  var gInput         = document.getElementById("cpG");
  var bInput         = document.getElementById("cpB");
  var rVal           = document.getElementById("cpRVal");
  var gVal           = document.getElementById("cpGVal");
  var bVal           = document.getElementById("cpBVal");
  var hInput         = document.getElementById("cpH");
  var sInput         = document.getElementById("cpS");
  var lInput         = document.getElementById("cpL");
  var hVal           = document.getElementById("cpHVal");
  var sVal           = document.getElementById("cpSVal");
  var lVal           = document.getElementById("cpLVal");

  var fmtHex         = document.getElementById("cpFmtHex");
  var fmtRgb         = document.getElementById("cpFmtRgb");
  var fmtHsl         = document.getElementById("cpFmtHsl");
  var fmtHsv         = document.getElementById("cpFmtHsv");
  var fmtCmyk        = document.getElementById("cpFmtCmyk");
  var formatBtns     = document.querySelectorAll(".cp-format");

  var shadesGrid     = document.getElementById("cpShades");
  var harmComp       = document.getElementById("cpHarmComp");
  var harmAna        = document.getElementById("cpHarmAna");
  var harmTri        = document.getElementById("cpHarmTri");
  var harmTet        = document.getElementById("cpHarmTet");

  var paletteGrid    = document.getElementById("cpPalette");
  var paletteCount   = document.getElementById("cpPaletteCount");
  var paletteClear   = document.getElementById("cpPaletteClear");

  var toast          = document.getElementById("cpToast");
  var toastMsg       = document.getElementById("cpToastMsg");

  if (!swatch) return;

  /* ---------- State ---------- */
  var STORAGE_PALETTE = "cp_palette_v1";
  var state = {
    r: 244, g: 63, b: 94,
    h: 350, s: 89, l: 60
  };

  var palette = [];
  try {
    var stored = localStorage.getItem(STORAGE_PALETTE);
    if (stored) palette = JSON.parse(stored) || [];
  } catch (e) { palette = []; }

  /* ============================================================
     COLOR MATH
     ============================================================ */
  function clamp(v, min, max) {
    v = parseInt(v, 10) || 0;
    return Math.max(min, Math.min(max, v));
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(function (v) {
      var hex = clamp(v, 0, 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
  }

  function hexToRgb(hex) {
    var h = String(hex || "").replace("#", "").trim();
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length === 8) h = h.slice(0, 6);
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {
      r: parseInt(h.substr(0, 2), 16),
      g: parseInt(h.substr(2, 2), 16),
      b: parseInt(h.substr(4, 2), 16)
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    var d = max - min;
    if (d === 0) { h = 0; s = 0; }
    else {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var hue2rgb = function (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;
    var d = max - min;
    s = max === 0 ? 0 : d / max;
    if (d === 0) h = 0;
    else {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  }

  function rgbToCmyk(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
      c: Math.round(((1 - r - k) / (1 - k)) * 100),
      m: Math.round(((1 - g - k) / (1 - k)) * 100),
      y: Math.round(((1 - b - k) / (1 - k)) * 100),
      k: Math.round(k * 100)
    };
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function render() {
    var r = state.r, g = state.g, b = state.b;
    var hex = rgbToHex(r, g, b);
    var hsl = rgbToHsl(r, g, b);
    var hsv = rgbToHsv(r, g, b);
    var cmyk = rgbToCmyk(r, g, b);

    // Sync state.hsl to computed (in case RGB was changed)
    state.h = hsl.h;
    state.s = hsl.s;
    state.l = hsl.l;

    // Big swatch + hex
    swatch.style.background = hex;
    hexBig.textContent = hex;

    // Native input
    if (nativeInput.value.toLowerCase() !== hex.toLowerCase()) {
      nativeInput.value = hex;
    }

    // Format chips
    fmtHex.textContent = hex;
    fmtRgb.textContent = r + ", " + g + ", " + b;
    fmtHsl.textContent = hsl.h + ", " + hsl.s + "%, " + hsl.l + "%";
    fmtHsv.textContent = hsv.h + ", " + hsv.s + "%, " + hsv.v + "%";
    fmtCmyk.textContent = cmyk.c + ", " + cmyk.m + ", " + cmyk.y + ", " + cmyk.k;

    // RGB sliders
    rInput.value = r;
    gInput.value = g;
    bInput.value = b;
    rVal.value = r;
    gVal.value = g;
    bVal.value = b;

    // RGB slider track gradients
    rInput.style.background = "linear-gradient(to right, rgb(0," + g + "," + b + "), rgb(255," + g + "," + b + "))";
    gInput.style.background = "linear-gradient(to right, rgb(" + r + ",0," + b + "), rgb(" + r + ",255," + b + "))";
    bInput.style.background = "linear-gradient(to right, rgb(" + r + "," + g + ",0), rgb(" + r + "," + g + ",255))";

    // HSL sliders
    hInput.value = hsl.h;
    sInput.value = hsl.s;
    lInput.value = hsl.l;
    hVal.value = hsl.h;
    sVal.value = hsl.s;
    lVal.value = hsl.l;

    // HSL slider track gradients
    hInput.style.background = "linear-gradient(to right, " +
      "hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), " +
      "hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

    var satRgb0 = hslToRgb(hsl.h, 0, hsl.l);
    var satRgb100 = hslToRgb(hsl.h, 100, hsl.l);
    sInput.style.background = "linear-gradient(to right, rgb(" +
      satRgb0.r + "," + satRgb0.g + "," + satRgb0.b + "), rgb(" +
      satRgb100.r + "," + satRgb100.g + "," + satRgb100.b + "))";

    var lRgb0 = hslToRgb(hsl.h, hsl.s, 0);
    var lRgb50 = hslToRgb(hsl.h, hsl.s, 50);
    var lRgb100 = hslToRgb(hsl.h, hsl.s, 100);
    lInput.style.background = "linear-gradient(to right, rgb(" +
      lRgb0.r + "," + lRgb0.g + "," + lRgb0.b + "), rgb(" +
      lRgb50.r + "," + lRgb50.g + "," + lRgb50.b + "), rgb(" +
      lRgb100.r + "," + lRgb100.g + "," + lRgb100.b + "))";

    // Shades
    renderShades(hsl);

    // Harmonies
    renderHarmonies(hsl);

    // Palette
    renderPalette();
  }

  /* ---------- Shades (light to dark) ---------- */
  function renderShades(hsl) {
    shadesGrid.innerHTML = "";
    var steps = [95, 88, 80, 72, 64, 56, 48, 40, 32, 24, 18, 12];
    steps.forEach(function (lightness) {
      var rgb = hslToRgb(hsl.h, hsl.s, lightness);
      var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      var el = document.createElement("button");
      el.type = "button";
      el.className = "cp-shade";
      el.style.background = hex;
      el.title = hex;
      el.setAttribute("aria-label", hex);
      el.addEventListener("click", function () {
        setRgb(rgb.r, rgb.g, rgb.b);
        copyText(hex, null);
      });
      shadesGrid.appendChild(el);
    });
  }

  /* ---------- Harmonies ---------- */
  function renderHarmonies(hsl) {
    // Complementary: current + (h+180)
    var comp1 = hslToRgb(hsl.h, hsl.s, hsl.l);
    var comp2 = hslToRgb(hsl.h + 180, hsl.s, hsl.l);
    fillSwatches(harmComp, [comp1, comp2]);

    // Analogous: h-30, h, h+30
    var ana1 = hslToRgb(hsl.h - 30, hsl.s, hsl.l);
    var ana2 = hslToRgb(hsl.h, hsl.s, hsl.l);
    var ana3 = hslToRgb(hsl.h + 30, hsl.s, hsl.l);
    fillSwatches(harmAna, [ana1, ana2, ana3]);

    // Triadic: h, h+120, h+240
    var tri1 = hslToRgb(hsl.h, hsl.s, hsl.l);
    var tri2 = hslToRgb(hsl.h + 120, hsl.s, hsl.l);
    var tri3 = hslToRgb(hsl.h + 240, hsl.s, hsl.l);
    fillSwatches(harmTri, [tri1, tri2, tri3]);

    // Tetradic: h, h+60, h+180, h+240
    var tet1 = hslToRgb(hsl.h, hsl.s, hsl.l);
    var tet2 = hslToRgb(hsl.h + 60, hsl.s, hsl.l);
    var tet3 = hslToRgb(hsl.h + 180, hsl.s, hsl.l);
    var tet4 = hslToRgb(hsl.h + 240, hsl.s, hsl.l);
    fillSwatches(harmTet, [tet1, tet2, tet3, tet4]);
  }

  function fillSwatches(container, rgbs) {
    container.innerHTML = "";
    rgbs.forEach(function (rgb) {
      var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      var el = document.createElement("button");
      el.type = "button";
      el.className = "cp-harmony-swatch";
      el.style.background = hex;
      el.title = hex;
      el.setAttribute("aria-label", hex);
      el.addEventListener("click", function () {
        setRgb(rgb.r, rgb.g, rgb.b);
        copyText(hex, null);
      });
      container.appendChild(el);
    });
  }

  /* ---------- Palette ---------- */
  function renderPalette() {
    paletteGrid.innerHTML = "";
    if (!palette.length) {
      var empty = document.createElement("div");
      empty.className = "cp-palette-empty";
      empty.textContent = '"Save" ক্লিক করলে কালার এখানে জমা হবে';
      paletteGrid.appendChild(empty);
      paletteCount.textContent = "0 টি";
      return;
    }
    paletteCount.textContent = palette.length + " টি";
    palette.forEach(function (hex, idx) {
      var el = document.createElement("button");
      el.type = "button";
      el.className = "cp-palette-swatch";
      el.style.background = hex;
      el.title = hex;
      el.setAttribute("aria-label", hex);
      el.addEventListener("click", function () {
        var rgb = hexToRgb(hex);
        if (rgb) setRgb(rgb.r, rgb.g, rgb.b);
        copyText(hex, null);
      });
      el.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        // Remove on right-click
        palette.splice(idx, 1);
        savePalette();
        renderPalette();
        showToast("✓ প্যালেট থেকে মুছে ফেলা হয়েছে");
      });
      paletteGrid.appendChild(el);
    });
  }

  function savePalette() {
    try {
      localStorage.setItem(STORAGE_PALETTE, JSON.stringify(palette));
    } catch (e) {}
  }

  /* ============================================================
     SET COLOR
     ============================================================ */
  function setRgb(r, g, b) {
    state.r = clamp(r, 0, 255);
    state.g = clamp(g, 0, 255);
    state.b = clamp(b, 0, 255);
    render();
  }

  function setHsl(h, s, l) {
    var rgb = hslToRgb(h, s, l);
    state.h = clamp(h, 0, 360);
    state.s = clamp(s, 0, 100);
    state.l = clamp(l, 0, 100);
    state.r = rgb.r;
    state.g = rgb.g;
    state.b = rgb.b;
    render();
  }

  /* ============================================================
     COPY
     ============================================================ */
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  function copyText(text, btn) {
    if (!text) return;
    var done = function () {
      showToast("✓ কপি হয়েছে: " + text);
      if (btn) {
        var orig = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML = '<svg class="cp-i" viewBox="0 0 24 24"><use href="#cp-i-check"/></svg> কপি হয়েছে';
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.innerHTML = orig;
        }, 1500);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text); done();
      });
    } else {
      fallbackCopy(text); done();
    }
  }

  /* ============================================================
     TOAST
     ============================================================ */
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 1800);
  }

  /* ============================================================
     EVENTS
     ============================================================ */

  // Big hex click = copy
  hexBig.addEventListener("click", function () {
    copyText(hexBig.textContent, null);
  });

  // Native color input
  nativeInput.addEventListener("input", function () {
    var rgb = hexToRgb(this.value);
    if (rgb) setRgb(rgb.r, rgb.g, rgb.b);
  });

  // Copy HEX button
  copyHexBtn.addEventListener("click", function () {
    copyText(hexBig.textContent, this);
  });

  // Random rir
  randomBtn.addEventListener("click", function () {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    setRgb(r, g, b);
    showToast("🎲 র‍্যান্ডম কালার তৈরি হয়েছে");
  });

  // Save to palette
  saveBtn.addEventListener("click", function () {
    var hex = rgbToHex(state.r, state.g, state.b);
    if (palette.indexOf(hex) !== -1) {
      showToast("⚠ এই কালার আগেই প্যালেটে আছে");
      return;
    }
    palette.unshift(hex);
    if (palette.length > 24) palette = palette.slice(0, 24);
    savePalette();
    renderPalette();
    showToast("✓ প্যালেটে যোগ হয়েছে");
  });

  // Palette clear
  paletteClear.addEventListener("click", function () {
    if (!palette.length) return;
    palette = [];
    savePalette();
    renderPalette();
    showToast("✓ প্যালেট মুছে ফেলা হয়েছে");
  });

  // RGB sliders
  [rInput, gInput, bInput].forEach(function (input, idx) {
    input.addEventListener("input", function () {
      var v = parseInt(this.value, 10) || 0;
      if (idx === 0) setRgb(v, state.g, state.b);
      else if (idx === 1) setRgb(state.r, v, state.b);
      else setRgb(state.r, state.g, v);
    });
  });

  // RGB number inputs
  [rVal, gVal, bVal].forEach(function (input, idx) {
    input.addEventListener("input", function () {
      var v = clamp(this.value, 0, 255);
      if (idx === 0) setRgb(v, state.g, state.b);
      else if (idx === 1) setRgb(state.r, v, state.b);
      else setRgb(state.r, state.g, v);
    });
    input.addEventListener("blur", function () {
      this.value = clamp(this.value, 0, 255);
    });
  });

  // HSL sliders
  [hInput, sInput, lInput].forEach(function (input, idx) {
    input.addEventListener("input", function () {
      var v = parseInt(this.value, 10) || 0;
      var hsl = rgbToHsl(state.r, state.g, state.b);
      if (idx === 0) setHsl(v, hsl.s, hsl.l);
      else if (idx === 1) setHsl(hsl.h, v, hsl.l);
      else setHsl(hsl.h, hsl.s, v);
    });
  });

  // HSL number inputs
  [hVal, sVal, lVal].forEach(function (input, idx) {
    input.addEventListener("input", function () {
      var v = parseInt(this.value, 10) || 0;
      var hsl = rgbToHsl(state.r, state.g, state.b);
      if (idx === 0) setHsl(clamp(v, 0, 360), hsl.s, hsl.l);
      else if (idx === 1) setHsl(hsl.h, clamp(v, 0, 100), hsl.l);
      else setHsl(hsl.h, hsl.s, clamp(v, 0, 100));
    });
    input.addEventListener("blur", function () {
      var max = idx === 0 ? 360 : 100;
      this.value = clamp(this.value, 0, max);
    });
  });

  // Format chips copy
  formatBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var val = btn.querySelector(".cp-format-value").textContent;
      copyText(val, btn);
    });
  });

  /* ============================================================
     INIT
     ============================================================ */
  render();

})();
