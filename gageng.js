(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".game-gen")) return;
    document.body.classList.add("gg-full");
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

  /* ---------- Elements ---------- */
  var hub = document.getElementById("gameGen");
  if (!hub) return;

  var card         = document.getElementById("ggCard");
  var themeChips   = document.querySelectorAll("#ggThemes .gg-chip");
  var styleChips   = document.querySelectorAll("#ggStyles .gg-chip");
  var themeVal     = document.getElementById("ggThemeVal");
  var styleVal     = document.getElementById("ggStyleVal");

  var countInput   = document.getElementById("ggCount");
  var countNum     = document.getElementById("ggCountNum");
  var countVal     = document.getElementById("ggCountVal");

  var switches     = document.querySelectorAll(".gg-switch[data-toggle]");

  var genBtn       = document.getElementById("ggGenerateBtn");
  var grid         = document.getElementById("ggGrid");
  var emptyEl      = document.getElementById("ggEmpty");
  var resultsCount = document.getElementById("ggResultsCount");
  var copyAllBtn   = document.getElementById("ggCopyAllBtn");
  var downloadBtn  = document.getElementById("ggDownloadBtn");

  var favBox       = document.getElementById("ggFavorites");
  var favList      = document.getElementById("ggFavList");
  var favCount     = document.getElementById("ggFavCount");
  var favClearBtn  = document.getElementById("ggFavClear");

  /* ---------- Storage ---------- */
  var STORAGE_FAVS  = "gg_favs_v1";
  var STORAGE_PREFS = "gg_prefs_v1";

  function getStore(k, d){
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
    catch(e){ return d; }
  }
  function setStore(k, v){
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch(e){}
  }

  var favorites = getStore(STORAGE_FAVS, []);
  var prefs = getStore(STORAGE_PREFS, {
    theme: "fantasy",
    style: "balanced",
    count: 6,
    numbers: true,
    symbols: true
  });

  var state = {
    theme: prefs.theme || "fantasy",
    style: prefs.style || "balanced",
    count: prefs.count || 6,
    numbers: prefs.numbers !== false,
    symbols: prefs.symbols !== false,
    current: []
  };

  /* ---------- Word Banks ---------- */
  var WORDS = {
    fantasy: {
      label: "Fantasy",
      nouns: ["Dragon","Knight","Sword","Blade","Shadow","Storm","Wolf","Raven","Phoenix","Titan",
              "Arcane","Mystic","Rune","Valor","Legend","Saga","Realm","Throne","Crown","Sorcerer",
              "Paladin","Ranger","Warlock","Berserker","Oracle","Druid","Templar","Griffin","Wyvern","Golem",
              "Ember","Frost","Warden","Vanguard","Seer","Prophet","Sentinel","Crusader","Valkyrie","Wraith"],
      prefixes: ["Dark","Ancient","Sacred","Cursed","Blessed","Silent","Savage","Noble","Royal","Eternal",
                 "Fierce","Iron","Golden","Shadow","Frost","Ember","Storm","Chaos","Divine","Hollow"]
    },
    scifi: {
      label: "Sci-Fi",
      nouns: ["Nova","Cosmos","Nebula","Quantum","Cyber","Nano","Void","Stellar","Warp","Pulse",
              "Logic","Circuit","Neural","Prime","Omega","Zenith","Astro","Plasma","Photon","Vector",
              "Proton","Matrix","Bionic","Galactic","Orbital","Synth","Android","Cipher","Datum","Chrome",
              "Nexus","Halo","Titan","Echo","Rift","Flux","Prism","Stratos","Vertex","Apex"],
      prefixes: ["Cyber","Hyper","Quantum","Neo","Ultra","Astro","Nova","Void","Prime","Deep",
                 "Core","Neuro","Zero","Sigma","Delta","Alpha","Omega","Swift","Silent","Iron"]
    },
    cyberpunk: {
      label: "Cyberpunk",
      nouns: ["Neon","Chrome","Glitch","Byte","Vertex","Cipher","Proxy","Pixel","Vector","Hack",
              "Ghost","Razor","Volt","Synth","Blaze","Zero","Wire","Grid","Code","Static",
              "Pulse","Circuit","Echo","Specter","Rogue","Nexus","Data","Virus","Kernel","Node",
              "Hex","Flux","Spark","Bolt","Frame","Cipher","Cortex","Signal","Shard","Wire"],
      prefixes: ["Neon","Chrome","Cyber","Net","Hex","Dark","Rogue","Glitch","Byte","Data",
                 "Synth","Vapor","Crypto","Static","Wire","Pulse","Ghost","Nano","Jade","Ash"]
    },
    battle: {
      label: "Battle",
      nouns: ["Sniper","Assassin","Phantom","Rush","Clutch","Trigger","Ace","Wraith","Vortex","Predator",
              "Havoc","Reaper","Specter","Hunter","Stalker","Marksman","Rogue","Breacher","Slayer","Blade",
              "Fury","Rampage","Vendetta","Overdrive","Bullet","Chaos","Storm","Fang","Claw","Viper",
              "Talon","Strike","Blitz","Breaker","Hunter","Killer","Rage","Frenzy","Fang","Blitz"],
      prefixes: ["Brutal","Rapid","Silent","Deadly","Fierce","Vicious","Savage","Swift","Wild","Lethal",
                 "Cold","Bold","Storm","Blood","Death","Iron","Toxic","Rebel","Doom","Rage"]
    },
    anime: {
      label: "Anime",
      nouns: ["Kawaii","Senpai","Sensei","Otaku","Neko","Kami","Yami","Hikari","Kage","Ryu",
              "Sakura","Hana","Tsuki","Taiyo","Kokoro","Yuki","Sora","Hoshi","Mizu","Kaze",
              "Hono","Tora","Ookami","Niji","Hikari","Tsubasa","Kokoro","Shinobi","Samurai","Ronin",
              "Ninja","Miko","Kitsune","Oni","Dragon","Blade","Master","Sage","Spirit","Legend"],
      prefixes: ["Dark","Bright","Silent","Sacred","Eternal","Hidden","Divine","Shining","Wandering","Swift",
                 "Lone","Crimson","Silver","Golden","Phantom","Mystic","Ancient","Frozen","Shadow","Star"]
    },
    nature: {
      label: "Nature",
      nouns: ["Storm","Thunder","Blizzard","Wildfire","River","Stone","Timber","Frost","Ember","Sand",
              "Tide","Wind","Leaf","Root","Bloom","Petal","Garden","Forest","Meadow","Mountain",
              "Peak","Valley","Shore","Coast","Wave","Rain","Snow","Mist","Breeze","Dawn",
              "Dusk","Sunset","Horizon","Fjord","Cliff","Pine","Willow","Fern","Ivy","Cedar"],
      prefixes: ["Wild","Frost","Storm","Ember","Silver","Golden","Ancient","Silent","Wild","Swift",
                 "Deep","Bright","Pale","Dark","Misty","Rolling","Hidden","Sacred","Crimson","Iron"]
    },
    casual: {
      label: "Casual",
      nouns: ["Star","Moon","Sky","Sun","Cloud","Rose","Bubble","Cookie","Sugar","Angel",
              "Buddy","Happy","Lucky","Sunny","Rainbow","Sparkle","Teddy","Panda","Kitty","Bunny",
              "Honey","Daisy","Petal","Cupcake","Twinkle","Muffin","Peach","Berry","Cherry","Candy",
              "Fairy","Sprinkle","Pudding","Jelly","Cookie","Mochi","Biscuit","Waffle","Dough","Cream"],
      prefixes: ["Happy","Lucky","Sweet","Tiny","Little","Fluffy","Sunny","Sparkly","Merry","Cozy",
                 "Bubbly","Dizzy","Silly","Fancy","Snuggly","Jolly","Peppy","Bright","Dreamy","Chirpy"]
    }
  };

  /* ---------- Suffixes & Modifiers ---------- */
  var SUFFIXES = ["Slayer","Master","Lord","Lady","King","Queen","Hunter","Knight","Warrior","Reaper",
                  "Killer","Boss","Pro","God","Legend","Sage","Champion","Hero","Titan","Breaker",
                  "Caster","Bringer","Walker","Rider","Keeper","Seeker","Forger","Weaver","Warden","Guardian"];

  var STYLE_MODS = {
    balanced: {
      numbers: ["", "", "", "7", "13", "21", "42", "77", "99"],
      symbols: ["", "", "", "", "_", "-", "x"]
    },
    aggressive: {
      numbers: ["666", "99", "77", "13", "777", "X", "420"],
      symbols: ["X", "Z", "!", "!!", "XX", "_X", "K"]
    },
    cool: {
      numbers: ["", "7", "21", "24", "01"],
      symbols: ["", "", "_", ".", "·"]
    },
    cute: {
      numbers: ["", "2", "3", "7", "22"],
      symbols: ["~", "★", "♡", "nyan", "chan", "kit"]
    },
    dark: {
      numbers: ["666", "13", "0", "404", "999"],
      symbols: ["_", "·", "†", "‡", "☠", "X"]
    },
    pro: {
      numbers: ["", "", "01", "07", "99"],
      symbols: ["", "_", ".", "x"]
    }
  };

  /* ---------- Utilities ---------- */
  function pick(arr){
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(m){
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
    });
  }

  /* ---------- Rarity roll ---------- */
  function rollRarity(){
    var r = Math.random() * 100;
    if (r < 50) return "common";      // 50%
    if (r < 78) return "rare";        // 28%
    if (r < 92) return "epic";        // 14%
    if (r < 98.5) return "legendary"; // 6.5%
    return "mythic";                  // 1.5%
  }

  /* ---------- Unique score ---------- */
  function uniqueScore(name){
    var score = 60;
    if (name.length > 8) score += 5;
    if (name.length > 12) score += 5;
    if (/[0-9]/.test(name)) score += 5;
    if (/[_\-·★♡†‡]/.test(name)) score += 5;
    if (/[A-Z]/.test(name)) score += 3;
    if (name.length < 20) score += 4;
    return Math.min(score, 98);
  }

  /* ---------- Apply style to word ---------- */
  function applyStyle(word, style){
    if (!word) return word;
    var w = word;

    if (style === "aggressive") {
      w = w.replace(/s(?=[^aeiou]|$)/gi, "z");
      w = w.replace(/S(?=[^aeiou]|$)/g, "Z");
      if (Math.random() > 0.5) w = w.toUpperCase();
    } else if (style === "cool") {
      if (w.length > 6) w = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    } else if (style === "cute") {
      var cuteSuffixes = ["chan","kun","nyan","bun","kit","paw"];
      if (Math.random() > 0.6) w = w + pick(cuteSuffixes);
    } else if (style === "dark") {
      if (Math.random() > 0.6) w = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    } else if (style === "pro") {
      if (Math.random() > 0.4) w = w.toUpperCase();
    }
    return w;
  }

  /* ---------- Generate a single name ---------- */
  function generateName(){
    var theme = WORDS[state.theme] || WORDS.fantasy;
    var rarity = rollRarity();
    var parts = [];
    var style = state.style;

    // Build parts based on rarity
    if (rarity === "common") {
      parts.push(applyStyle(pick(theme.nouns), style));
    } else if (rarity === "rare") {
      if (Math.random() > 0.5) {
        parts.push(applyStyle(pick(theme.prefixes), style));
        parts.push(applyStyle(pick(theme.nouns), style));
      } else {
        parts.push(applyStyle(pick(theme.nouns), style));
        parts.push(pick(SUFFIXES));
      }
    } else if (rarity === "epic") {
      parts.push(applyStyle(pick(theme.prefixes), style));
      parts.push(applyStyle(pick(theme.nouns), style));
      if (Math.random() > 0.5) parts.push(pick(SUFFIXES));
    } else {
      // legendary + mythic: prefix + noun + suffix always
      parts.push(applyStyle(pick(theme.prefixes), style));
      parts.push(applyStyle(pick(theme.nouns), style));
      parts.push(pick(SUFFIXES));
    }

    // Build base name
    var base = "";
    var capStyle = (rarity === "common" && style !== "pro" && style !== "aggressive");
    parts.forEach(function(p, i){
      if (i === 0) {
        base += capStyle ? (p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()) : p;
      } else {
        base += p;
      }
    });

    // Style mods (numbers/symbols)
    var mods = STYLE_MODS[style] || STYLE_MODS.balanced;
    var suffix = "";

    if (rarity === "common" && Math.random() < 0.3) {
      // Sometimes add a light number even to common
      if (state.numbers) suffix += pick(["7","1","2","3"]);
    } else if (rarity === "rare") {
      if (state.numbers && Math.random() < 0.6) suffix += pick(mods.numbers);
    } else if (rarity === "epic") {
      if (state.symbols && Math.random() < 0.5) suffix += pick(mods.symbols);
      if (state.numbers && Math.random() < 0.7) suffix += pick(mods.numbers);
    } else {
      // legendary & mythic: max styling
      if (state.symbols) suffix += pick(mods.symbols);
      if (state.numbers) suffix += pick(mods.numbers);
      if (state.symbols && Math.random() > 0.5) suffix += pick(mods.symbols);
    }

    var name = base + suffix;

    // Prevent overly long names
    if (name.length > 20) name = name.slice(0, 20);
    // Ensure minimum length
    if (name.length < 3) name = name + "x7";

    return {
      name: name,
      rarity: rarity,
      unique: uniqueScore(name)
    };
  }

  /* ---------- Render single name card ---------- */
  function rarityIcon(rarity){
    var svg = '';
    switch(rarity){
      case "legendary":
      case "mythic":
        svg = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><use href="#gg-i-star"/></svg>';
        break;
      case "epic":
        svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><use href="#gg-i-sparkles"/></svg>';
        break;
      case "rare":
        svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><use href="#gg-i-zap"/></svg>';
        break;
      default:
        svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><use href="#gg-i-bolt"/></svg>';
    }
    return svg;
  }

  function rarityLabel(r){
    return { common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary", mythic: "Mythic" }[r];
  }

  function isFavorite(name){
    return favorites.some(function(f){ return f.name === name; });
  }

  function createNameCard(entry, animateDelay){
    var el = document.createElement("div");
    el.className = "gg-name is-" + entry.rarity;
    el.setAttribute("data-name", entry.name);
    el.style.animationDelay = (animateDelay || 0) + "ms";

    var fav = isFavorite(entry.name);
    var iconHtml = rarityIcon(entry.rarity);

    el.innerHTML =
      '<div class="gg-name-icon">' + iconHtml + '</div>' +
      '<div class="gg-name-body">' +
        '<div class="gg-name-text">' + escapeHtml(entry.name) + '</div>' +
        '<div class="gg-name-meta">' +
          '<span class="gg-rarity-badge">' + rarityLabel(entry.rarity) + '</span>' +
          '<span class="gg-name-unique">' + entry.unique + '% unique</span>' +
        '</div>' +
      '</div>' +
      '<div class="gg-name-actions">' +
        '<button class="gg-name-act gg-copy-btn' + (fav ? ' is-active' : '') + '" data-act="copy" title="Copy">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><use href="#gg-i-copy"/></svg>' +
        '</button>' +
        '<button class="gg-name-act gg-fav-btn' + (fav ? ' is-active' : '') + '" data-act="fav" title="Favorite">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><use href="#gg-i-star"/></svg>' +
        '</button>' +
        '<button class="gg-name-act gg-reroll-btn" data-act="reroll" title="Reroll this one">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><use href="#gg-i-refresh"/></svg>' +
        '</button>' +
      '</div>';

    el.querySelector('[data-act="copy"]').addEventListener("click", function(e){
      e.stopPropagation();
      copyText(entry.name);
      showToast("Copied: " + entry.name);
    });

    el.querySelector('[data-act="fav"]').addEventListener("click", function(e){
      e.stopPropagation();
      toggleFavorite(entry);
      var btn = el.querySelector('[data-act="fav"]');
      btn.classList.toggle("is-active", isFavorite(entry.name));
    });

    el.querySelector('[data-act="reroll"]').addEventListener("click", function(e){
      e.stopPropagation();
      rerollSingle(el);
    });

    return el;
  }

  /* ---------- Reroll one name in place ---------- */
  function rerollSingle(el){
    var newEntry = generateName();
    var idx = state.current.findIndex(function(x){ return x.name === el.getAttribute("data-name"); });
    if (idx !== -1) state.current[idx] = newEntry;

    var parent = el.parentNode;
    var next = el.nextSibling;
    var newEl = createNameCard(newEntry, 0);
    parent.removeChild(el);
    parent.insertBefore(newEl, next);
  }

  /* ---------- Render all generated names ---------- */
  function renderResults(entries, animate){
    grid.innerHTML = "";
    if (!entries.length) {
      grid.appendChild(emptyEl);
      emptyEl.hidden = false;
      resultsCount.textContent = "0";
      return;
    }
    entries.forEach(function(entry, i){
      grid.appendChild(createNameCard(entry, animate ? i * 40 : 0));
    });
    resultsCount.textContent = entries.length;

    // Check for legendary/mythic → confetti
    var hasHigh = entries.some(function(e){
      return e.rarity === "legendary" || e.rarity === "mythic";
    });
    if (hasHigh) setTimeout(fireConfetti, 300);
  }

  /* ---------- Generate handler ---------- */
  var isGenerating = false;
  function doGenerate(){
    if (isGenerating) return;
    isGenerating = true;
    genBtn.disabled = true;

    var n = state.count;
    var entries = [];
    for (var i = 0; i < n; i++) {
      entries.push(generateName());
    }
    state.current = entries;

    // Small delay for feel
    setTimeout(function(){
      renderResults(entries, true);
      genBtn.disabled = false;
      isGenerating = false;
    }, 200);
  }

  /* ---------- Favorites ---------- */
  function toggleFavorite(entry){
    var idx = favorites.findIndex(function(f){ return f.name === entry.name; });
    if (idx === -1) {
      favorites.unshift({ name: entry.name, rarity: entry.rarity, unique: entry.unique });
      showToast("Saved: " + entry.name);
    } else {
      favorites.splice(idx, 1);
      showToast("Removed: " + entry.name);
    }
    setStore(STORAGE_FAVS, favorites);
    renderFavorites();
  }

  function renderFavorites(){
    favCount.textContent = favorites.length;
    if (!favorites.length) {
      favBox.hidden = true;
      return;
    }
    favBox.hidden = false;
    favList.innerHTML = "";
    favorites.forEach(function(item){
      var el = document.createElement("div");
      el.className = "gg-fav-item";
      el.innerHTML =
        '<span class="gg-fav-item-text">' + escapeHtml(item.name) + '</span>' +
        '<button class="gg-fav-item-btn" type="button" title="Remove">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><use href="#gg-i-x"/></svg>' +
        '</button>';

      // Click the item (not button) to copy
      el.addEventListener("click", function(e){
        if (e.target.closest(".gg-fav-item-btn")) return;
        copyText(item.name);
        showToast("Copied: " + item.name);
      });

      el.querySelector(".gg-fav-item-btn").addEventListener("click", function(e){
        e.stopPropagation();
        favorites = favorites.filter(function(f){ return f.name !== item.name; });
        setStore(STORAGE_FAVS, favorites);
        renderFavorites();
        // Update in-card favorite buttons
        document.querySelectorAll(".gg-name").forEach(function(card){
          if (card.getAttribute("data-name") === item.name) {
            var btn = card.querySelector('[data-act="fav"]');
            if (btn) btn.classList.remove("is-active");
          }
        });
      });

      favList.appendChild(el);
    });
  }

  favClearBtn.addEventListener("click", function(){
    favorites = [];
    setStore(STORAGE_FAVS, favorites);
    renderFavorites();
    document.querySelectorAll(".gg-fav-btn.is-active").forEach(function(b){
      b.classList.remove("is-active");
    });
    showToast("Favorites cleared");
  });

  /* ---------- Copy all ---------- */
  copyAllBtn.addEventListener("click", function(){
    if (!state.current.length) {
      showToast("Generate some names first");
      return;
    }
    var text = state.current.map(function(e){ return e.name; }).join("\n");
    copyText(text);
    showToast("All " + state.current.length + " names copied");
  });

  /* ---------- Download PNG ---------- */
  downloadBtn.addEventListener("click", function(){
    if (!state.current.length) {
      showToast("Generate some names first");
      return;
    }
    downloadImage(state.current);
  });

  function downloadImage(entries){
    var W = 1080;
    var H = 1350;
    var canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");

    // Background gradient
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#f9f7ff");
    bg.addColorStop(1, "#ede9fe");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.fillStyle = "rgba(196, 181, 253, 0.5)";
    ctx.beginPath();
    ctx.arc(100, 100, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(103, 232, 249, 0.25)";
    ctx.beginPath();
    ctx.arc(980, 1250, 240, 0, Math.PI * 2);
    ctx.fill();

    // Header
    ctx.fillStyle = "#6d28d9";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "italic 900 44px Georgia, serif";
    ctx.fillText("Game Name Generator", W / 2, 100);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "500 26px -apple-system, Inter, sans-serif";
    ctx.fillText("Theme: " + WORDS[state.theme].label + " · Style: " + state.style, W / 2, 155);

    // Name list
    var startY = 240;
    var rowH = Math.min(80, (H - startY - 120) / entries.length);
    var rarityColors = {
      common: "#94a3b8",
      rare: "#3b82f6",
      epic: "#8b5cf6",
      legendary: "#f59e0b",
      mythic: "#f43f5e"
    };

    entries.forEach(function(entry, i){
      var y = startY + i * rowH;

      // Card background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      var cardX = 80, cardW = W - 160, cardH = rowH - 12;
      var r = 14;
      ctx.moveTo(cardX + r, y);
      ctx.lineTo(cardX + cardW - r, y);
      ctx.quadraticCurveTo(cardX + cardW, y, cardX + cardW, y + r);
      ctx.lineTo(cardX + cardW, y + cardH - r);
      ctx.quadraticCurveTo(cardX + cardW, y + cardH, cardX + cardW - r, y + cardH);
      ctx.lineTo(cardX + r, y + cardH);
      ctx.quadraticCurveTo(cardX, y + cardH, cardX, y + cardH - r);
      ctx.lineTo(cardX, y + r);
      ctx.quadraticCurveTo(cardX, y, cardX + r, y);
      ctx.closePath();
      ctx.fill();

      // Rarity bar
      ctx.fillStyle = rarityColors[entry.rarity] || rarityColors.common;
      ctx.fillRect(cardX, y, 5, cardH);

      // Name
      ctx.fillStyle = "#0a0a0a";
      ctx.textAlign = "left";
      ctx.font = "800 " + Math.min(36, rowH * 0.42) + "px -apple-system, Inter, sans-serif";
      ctx.fillText(entry.name, cardX + 32, y + cardH / 2);

      // Rarity label
      ctx.textAlign = "right";
      ctx.fillStyle = rarityColors[entry.rarity] || rarityColors.common;
      ctx.font = "italic 600 20px Georgia, serif";
      ctx.fillText(entry.rarity.toUpperCase(), cardX + cardW - 24, y + cardH / 2);
    });

    // Footer
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "center";
    ctx.font = "italic 500 24px Georgia, serif";
    ctx.fillText("Generated with RiR · 100% free · No sign-up", W / 2, H - 60);

    canvas.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "game-names-" + state.theme + "-" + Date.now() + ".png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Image downloaded");
    }, "image/png");
  }

  /* ---------- Copy util ---------- */
  function copyText(text){
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function(){
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch(e){}
    document.body.removeChild(ta);
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function showToast(text){
    var ex = document.querySelector(".gg-toast");
    if (ex) ex.remove();
    var t = document.createElement("div");
    t.className = "gg-toast";
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>' + escapeHtml(text) + '</span>';
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){
      t.classList.add("is-out");
      setTimeout(function(){ t.remove(); }, 320);
    }, 2200);
  }

  /* ---------- Confetti ---------- */
  function fireConfetti(){
    var layer = document.createElement("div");
    layer.className = "gg-confetti";
    document.body.appendChild(layer);
    var colors = ["#8b5cf6","#a78bfa","#c4b5fd","#06b6d4","#22d3ee","#fbbf24","#f59e0b","#f43f5e"];
    for (var i = 0; i < 60; i++) {
      var p = document.createElement("div");
      p.className = "gg-confetti-piece";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.width = (6 + Math.random() * 8) + "px";
      p.style.height = (6 + Math.random() * 10) + "px";
      p.style.animationDuration = (2.2 + Math.random() * 1.6) + "s";
      p.style.animationDelay = (Math.random() * 0.4) + "s";
      if (i % 3 === 0) p.style.borderRadius = "50%";
      layer.appendChild(p);
    }
    setTimeout(function(){ layer.remove(); }, 4500);
  }

  /* ---------- Event: theme chips ---------- */
  themeChips.forEach(function(chip){
    chip.addEventListener("click", function(){
      themeChips.forEach(function(c){ c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      state.theme = chip.getAttribute("data-theme");
      themeVal.textContent = WORDS[state.theme].label;
      prefs.theme = state.theme;
      setStore(STORAGE_PREFS, prefs);
    });
  });

  /* ---------- Event: style chips ---------- */
  styleChips.forEach(function(chip){
    chip.addEventListener("click", function(){
      styleChips.forEach(function(c){ c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      state.style = chip.getAttribute("data-style");
      styleVal.textContent = state.style.charAt(0).toUpperCase() + state.style.slice(1);
      prefs.style = state.style;
      setStore(STORAGE_PREFS, prefs);
    });
  });

  /* ---------- Event: count slider ---------- */
  countInput.addEventListener("input", function(){
    state.count = parseInt(this.value, 10);
    countNum.textContent = state.count;
    countVal.textContent = state.count;
    prefs.count = state.count;
    setStore(STORAGE_PREFS, prefs);
  });

  /* ---------- Event: switches ---------- */
  switches.forEach(function(sw){
    function toggle(){
      sw.classList.toggle("is-on");
      var on = sw.classList.contains("is-on");
      sw.setAttribute("aria-pressed", on ? "true" : "false");
      var key = sw.getAttribute("data-toggle");
      if (key === "numbers") {
        state.numbers = on;
        prefs.numbers = on;
      } else if (key === "symbols") {
        state.symbols = on;
        prefs.symbols = on;
      }
      setStore(STORAGE_PREFS, prefs);
    }
    sw.addEventListener("click", toggle);
    sw.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ---------- Event: generate button ---------- */
  genBtn.addEventListener("click", doGenerate);

  /* ---------- Restore prefs ---------- */
  function restorePrefs(){
    // Theme
    themeChips.forEach(function(c){
      c.classList.toggle("is-active", c.getAttribute("data-theme") === state.theme);
    });
    themeVal.textContent = WORDS[state.theme].label;

    // Style
    styleChips.forEach(function(c){
      c.classList.toggle("is-active", c.getAttribute("data-style") === state.style);
    });
    styleVal.textContent = state.style.charAt(0).toUpperCase() + state.style.slice(1);

    // Count
    countInput.value = state.count;
    countNum.textContent = state.count;
    countVal.textContent = state.count;

    // Switches
    switches.forEach(function(sw){
      var key = sw.getAttribute("data-toggle");
      var on = (key === "numbers") ? state.numbers : state.symbols;
      sw.classList.toggle("is-on", on);
      sw.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  restorePrefs();
  renderFavorites();

  // Auto-generate on load for instant gratification
  setTimeout(function(){
    doGenerate();
  }, 400);

})();
