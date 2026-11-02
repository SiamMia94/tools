(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".fancy-text")) return;
    document.body.classList.add("ft-full");
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
  var input        = document.getElementById("ftInput");
  var countEl      = document.getElementById("ftCount");
  var clearBtn     = document.getElementById("ftClear");
  var grid         = document.getElementById("ftGrid");
  var emptyEl      = document.getElementById("ftEmpty");
  var filterBar    = document.getElementById("ftFilters");
  var filters      = filterBar.querySelectorAll(".ft-filter");
  var resultsCount = document.getElementById("ftResultsCount");
  var copyAllBtn   = document.getElementById("ftCopyAllBtn");
  var toast        = document.getElementById("ftToast");
  var toastMsg     = document.getElementById("ftToastMsg");
  var countAll     = document.getElementById("ftCountAll");

  if (!input) return;

  /* ============================================================
     FONT DEFINITIONS
     ============================================================ */

  function A(str){ return Array.from(str); }

  var FONTS = [
    /* --- SERIF MATH --- */
    {
      id: "bold", name: "Bold", category: "serif", tag: "𝐀",
      upper: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙",
      lower: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳",
      num:   "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
    },
    {
      id: "italic", name: "Italic", category: "serif", tag: "𝐴",
      upper: "𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍",
      lower: "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧",
      num:   ""
    },
    {
      id: "bolditalic", name: "Bold Italic", category: "serif", tag: "𝑨",
      upper: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁",
      lower: "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛",
      num:   ""
    },
    {
      id: "script", name: "Script", category: "serif", tag: "𝒜",
      upper: "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵",
      lower: "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏",
      num:   ""
    },
    {
      id: "boldscript", name: "Bold Script", category: "serif", tag: "𝓐",
      upper: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩",
      lower: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃",
      num:   ""
    },
    {
      id: "fraktur", name: "Fraktur", category: "serif", tag: "𝔄",
      upper: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ",
      lower: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷",
      num:   ""
    },
    {
      id: "boldfraktur", name: "Bold Fraktur", category: "serif", tag: "𝕬",
      upper: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅",
      lower: "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟",
      num:   ""
    },
    {
      id: "double", name: "Double-struck", category: "serif", tag: "𝔸",
      upper: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ",
      lower: "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",
      num:   "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡"
    },

    /* --- SANS --- */
    {
      id: "sans", name: "Sans-serif", category: "sans", tag: "𝖠",
      upper: "𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹",
      lower: "𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓",
      num:   "𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫"
    },
    {
      id: "sansbold", name: "Sans Bold", category: "sans", tag: "𝗔",
      upper: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭",
      lower: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇",
      num:   "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"
    },
    {
      id: "sansitalic", name: "Sans Italic", category: "sans", tag: "𝘈",
      upper: "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡",
      lower: "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻",
      num:   ""
    },
    {
      id: "sansbolditalic", name: "Sans Bold Italic", category: "sans", tag: "𝘼",
      upper: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕",
      lower: "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯",
      num:   ""
    },
    {
      id: "mono", name: "Monospace", category: "sans", tag: "𝙰",
      upper: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉",
      lower: "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣",
      num:   "𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
    },

    /* --- SMALL --- */
    {
      id: "smallcaps", name: "Small Caps", category: "small", tag: "ᴀ",
      upper: "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ",
      lower: "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ",
      num:   ""
    },
    {
      id: "superscript", name: "Superscript", category: "small", tag: "ᵃ",
      upper: "",
      lower: "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖ۹ʳˢᵗᵘᵛʷˣʸᶻ",
      num:   "⁰¹²³⁴⁵⁶⁷⁸⁹"
    },

    /* --- SYMBOLS --- */
    {
      id: "bubble", name: "Bubble", category: "symbols", tag: "Ⓐ",
      upper: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ",
      lower: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ",
      num:   "⓪①②③④⑤⑥⑦⑧⑨"
    },
    {
      id: "square", name: "Square", category: "symbols", tag: "🄰",
      upper: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉",
      lower: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉",
      num:   ""
    },
    {
      id: "circled", name: "Circled Black", category: "symbols", tag: "🅐",
      upper: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩",
      lower: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩",
      num:   ""
    },
    {
      id: "paren", name: "Parenthesized", category: "symbols", tag: "⒜",
      upper: "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵",
      lower: "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵",
      num:   ""
    },

    /* --- DECOR (combining marks) --- */
    {
      id: "strike", name: "Strike-through", category: "decor", tag: "S̶",
      type: "combining", combining: "\u0336"
    },
    {
      id: "underline", name: "Underline", category: "decor", tag: "U̲",
      type: "combining", combining: "\u0332"
    },
    {
      id: "slash", name: "Slash-through", category: "decor", tag: "S̷",
      type: "combining", combining: "\u0337"
    },
    {
      id: "wavy", name: "Wavy", category: "decor", tag: "W͜",
      type: "combining", combining: "\u0330"
    },
    {
      id: "wide", name: "Wide Spacing", category: "decor", tag: "W I D E",
      type: "spacing"
    }
  ];

  /* Pre-compute array-form of upper/lower/num for each font */
  FONTS.forEach(function(f){
    if (f.upper) f._upper = Array.from(f.upper);
    if (f.lower) f._lower = Array.from(f.lower);
    if (f.num)   f._num   = Array.from(f.num);
  });

  /* ---------- Transform engine ---------- */
  function transform(text, font){
    if (!text) return "";

    var chars = Array.from(text);
    var result = "";

    if (font.type === "combining") {
      chars.forEach(function(c){
        result += c;
        // add combining mark after any non-whitespace char
        if (!/\s/.test(c)) result += font.combining;
      });
      return result;
    }

    if (font.type === "spacing") {
      return chars.join(" ");
    }

    chars.forEach(function(c){
      var code = c.codePointAt(0);
      if (code >= 65 && code <= 90) {         // A-Z
        var idx = code - 65;
        result += (font._upper && font._upper[idx]) || c;
      } else if (code >= 97 && code <= 122) { // a-z
        var idx2 = code - 97;
        result += (font._lower && font._lower[idx2]) || c;
      } else if (code >= 48 && code <= 57 && font._num) { // 0-9
        var idx3 = code - 48;
        result += font._num[idx3] || c;
      } else {
        result += c;
      }
    });
    return result;
  }

  /* ============================================================
     STATE + RENDER
     ============================================================ */
  var state = {
    filter: "all",
    current: {}
  };

  /* Count per category once */
  (function initCounts(){
    var counts = { serif: 0, sans: 0, small: 0, symbols: 0, decor: 0 };
    FONTS.forEach(function(f){ counts[f.category] = (counts[f.category] || 0) + 1; });
    countAll.textContent = FONTS.length;
    Object.keys(counts).forEach(function(k){
      var el = filterBar.querySelector('[data-filter-count="' + k + '"]');
      if (el) el.textContent = counts[k];
    });
  })();

  /* Build all cards once, then filter them */
  var cardEls = {};

  function buildCards(){
    grid.innerHTML = "";
    FONTS.forEach(function(font, i){
      var card = document.createElement("div");
      card.className = "ft-card";
      card.setAttribute("data-font-id", font.id);
      card.setAttribute("data-category", font.category);
      card.style.animationDelay = (i * 20) + "ms";

      card.innerHTML =
        '<div class="ft-card-head">' +
          '<span class="ft-card-label">' +
            '<svg class="ft-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ft-i-type"/></svg>' +
            font.name +
          '</span>' +
          '<button class="ft-copy-btn" type="button" data-copy="' + font.id + '">' +
            '<svg class="ft-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ft-i-copy"/></svg>' +
            '<span>Copy</span>' +
          '</button>' +
        '</div>' +
        '<div class="ft-card-body" data-output="' + font.id + '" tabindex="0"></div>';

      grid.appendChild(card);
      cardEls[font.id] = card;

      card.querySelector('[data-copy="' + font.id + '"]').addEventListener("click", function(e){
        e.stopPropagation();
        var text = state.current[font.id] || "";
        if (!text) {
          showToast("⚠ প্রথমে টেক্সট লিখুন");
          return;
        }
        copyText(text, this);
      });

      var body = card.querySelector('[data-output="' + font.id + '"]');
      body.addEventListener("click", function(){
        var text = state.current[font.id] || "";
        if (text) copyText(text, null);
      });
      body.addEventListener("keydown", function(e){
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          var text = state.current[font.id] || "";
          if (text) copyText(text, null);
        }
      });
    });
  }

  /* ---------- Update all outputs ---------- */
  function update(){
    var raw = input.value;
    countEl.textContent = raw.length + " / 200";

    if (!raw.trim()) {
      Object.keys(cardEls).forEach(function(id){
        var body = cardEls[id].querySelector('[data-output="' + id + '"]');
        if (body) body.textContent = "";
      });
      state.current = {};
      emptyEl.style.display = "";
      grid.style.display = "none";
      return;
    }

    emptyEl.style.display = "none";
    grid.style.display = "";

    FONTS.forEach(function(font){
      var out = transform(raw, font);
      state.current[font.id] = out;
      var card = cardEls[font.id];
      if (!card) return;
      var body = card.querySelector('[data-output="' + font.id + '"]');
      if (body) body.textContent = out;
    });
  }

  /* ---------- Filter ---------- */
  function applyFilter(){
    var f = state.filter;
    var visible = 0;
    FONTS.forEach(function(font){
      var card = cardEls[font.id];
      if (!card) return;
      var show = (f === "all" || font.category === f);
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });
    resultsCount.textContent = visible;
  }

  filters.forEach(function(btn){
    btn.addEventListener("click", function(){
      filters.forEach(function(b){ b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.filter = btn.getAttribute("data-filter");
      applyFilter();
    });
  });

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function showToast(msg){
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){
      toast.classList.remove("show");
    }, 2000);
  }

  /* ---------- Copy ---------- */
  function fallbackCopy(text){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch(e){}
    document.body.removeChild(ta);
  }

  function copyText(text, btn){
    if (!text) return;
    var done = function(){
      showToast("✓ কপি হয়েছে");
      if (btn) {
        var orig = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML = '<svg class="ft-i" viewBox="0 0 24 24" aria-hidden="true"><use href="#ft-i-check"/></svg><span>Copied</span>';
        setTimeout(function(){
          btn.classList.remove("copied");
          btn.innerHTML = orig;
        }, 1400);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function(){
        fallbackCopy(text); done();
      });
    } else {
      fallbackCopy(text); done();
    }
  }

  /* ---------- Copy all ---------- */
  copyAllBtn.addEventListener("click", function(){
    var raw = input.value.trim();
    if (!raw) {
      showToast("⚠ প্রথমে টেক্সট লিখুন");
      return;
    }
    var lines = [];
    FONTS.forEach(function(font){
      var visible = (state.filter === "all" || font.category === state.filter);
      if (!visible) return;
      var out = state.current[font.id];
      if (out) lines.push(out);
    });
    if (!lines.length) {
      showToast("⚠ কোনো ফলাফল নেই");
      return;
    }
    copyText(lines.join("\n"), null);
  });

  /* ---------- Samples ---------- */
  document.querySelectorAll(".ft-sample").forEach(function(btn){
    btn.addEventListener("click", function(){
      input.value = btn.getAttribute("data-sample") || "";
      update();
      input.focus();
    });
  });

  /* ---------- Clear ---------- */
  clearBtn.addEventListener("click", function(){
    input.value = "";
    update();
    input.focus();
  });

  /* ---------- Input ---------- */
  var debounceTimer = null;
  input.addEventListener("input", function(){
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(update, 60);
  });

  /* ---------- Init ---------- */
  buildCards();
  applyFilter();
  update();

})();
