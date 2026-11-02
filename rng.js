(function () {
  "use strict";

  /* ---------- Full width force ---------- */
  function forceFullWidth() {
    if (!document.querySelector(".rn-gen")) return;
    document.body.classList.add("rn-full");
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
  var cultureChips   = document.querySelectorAll("#rnCultures .rn-chip");
  var genderBtns     = document.querySelectorAll("#rnGenders .rn-gender");
  var formatBtns     = document.querySelectorAll("#rnFormats .rn-format");
  var countSlider    = document.getElementById("rnCount");
  var countVal       = document.getElementById("rnCountVal");
  var generateBtn    = document.getElementById("rnGenerate");
  var regenerateBtn  = document.getElementById("rnRegenerate");
  var copyAllBtn     = document.getElementById("rnCopyAll");
  var namesGrid      = document.getElementById("rnNames");
  var resultsCount   = document.getElementById("rnResultsCount");
  var favsBox        = document.getElementById("rnFavs");
  var favsList       = document.getElementById("rnFavsList");
  var favsCount      = document.getElementById("rnFavsCount");
  var favsClear      = document.getElementById("rnFavsClear");
  var historyBox     = document.getElementById("rnHistory");
  var historyList    = document.getElementById("rnHistoryList");
  var historyClear   = document.getElementById("rnHistoryClear");
  var toast          = document.getElementById("rnToast");
  var toastMsg       = document.getElementById("rnToastMsg");

  if (!namesGrid) return;

  /* ---------- Storage ---------- */
  var STORAGE_FAVS = "rn_favs_v1";
  var STORAGE_PREFS = "rn_prefs_v1";

  function getStore(k, d) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
    catch (e) { return d; }
  }
  function setStore(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }

  var favorites = getStore(STORAGE_FAVS, []);
  var prefs = getStore(STORAGE_PREFS, { culture: "western", gender: "random", format: "full", count: 12 });

  /* ---------- State ---------- */
  var state = {
    culture: prefs.culture || "western",
    gender: prefs.gender || "random",
    format: prefs.format || "full",
    count: prefs.count || 12,
    names: [],
    history: []
  };

  /* ============================================================
     NAME BANKS — 9 cultures
     ============================================================ */
  var NAMES = {
    western: {
      male: ["James","Michael","William","David","Joseph","Christopher","Daniel","Matthew","Anthony","Mark","Donald","Steven","Paul","Andrew","Joshua","Kenneth","Kevin","Brian","George","Timothy","Ronald","Jason","Edward","Jeffrey","Ryan","Jacob","Gary","Nicholas","Eric","Jonathan","Stephen","Larry","Justin","Scott","Brandon","Benjamin","Samuel","Gregory","Frank","Alexander"],
      female: ["Mary","Patricia","Jennifer","Linda","Elizabeth","Barbara","Susan","Jessica","Sarah","Karen","Nancy","Lisa","Betty","Margaret","Sandra","Ashley","Kimberly","Emily","Donna","Michelle","Carol","Amanda","Dorothy","Melissa","Deborah","Stephanie","Rebecca","Sharon","Laura","Cynthia","Kathleen","Amy","Shirley","Angela","Helen","Anna","Brenda","Pamela","Nicole","Emma"],
      last: ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores"]
    },
    bengali: {
      male: ["Rakib","Shakib","Tanvir","Arif","Imran","Rahim","Sabbir","Fahim","Rifat","Sajid","Mahin","Nayeem","Sakib","Tahmid","Rasel","Sohel","Rony","Mizan","Rubel","Raju","Naim","Tarek","Ashiq","Hasan","Rony","Sohan","Jahid","Siam","Nabil","Arafat"],
      female: ["Sumaiya","Fatima","Ayesha","Nusrat","Tasnim","Maliha","Rima","Jannat","Sadia","Nabila","Tania","Anika","Farhana","Faria","Sanjida","Mim","Mitu","Popy","Priya","Tasmin","Sharmin","Jhumur","Rina","Moushumi","Nupur","Bushra","Afsana","Tahmina","Nur","Shabnam"],
      last: ["Rahman","Ahmed","Islam","Khan","Hossain","Chowdhury","Sarker","Uddin","Akter","Sultana","Haque","Alam","Mahmud","Karim","Siddique","Miah","Hossain","Bhuiyan","Molla","Talukder"]
    },
    arabic: {
      male: ["Mohammed","Ahmed","Ali","Omar","Hassan","Hussein","Khalid","Ibrahim","Yusuf","Abdullah","Faisal","Salman","Rashid","Karim","Tariq","Saif","Nasser","Majid","Riyad","Adel","Samir","Hamza","Bilal","Zaid","Imad"],
      female: ["Fatima","Aisha","Maryam","Zainab","Khadija","Layla","Noor","Sara","Amira","Huda","Salma","Yasmin","Rania","Nadia","Lina","Dana","Reem","Aya","Layla","Mariam","Hessa","Shaikha","Noura","Latifa","Mona"],
      last: ["Al-Rashid","Al-Ahmed","Al-Hassan","Al-Sayed","Al-Ali","Al-Farsi","Al-Khalifa","Al-Mansour","Al-Nasser","Al-Hakim","Al-Amin","Al-Zahra","Al-Karim","Al-Saud","Al-Qasimi"]
    },
    japanese: {
      male: ["Haruto","Yuto","Sota","Yuki","Riku","Kaito","Ren","Hinata","Takumi","Kenta","Hiroshi","Takeshi","Kazuki","Daiki","Ryota","Sho","Yusuke","Koji","Akira","Ryo","Yamato","Hikaru","Masato","Naoki","Tatsuya"],
      female: ["Yui","Hina","Sakura","Aoi","Rin","Yuna","Miyu","Akari","Haruka","Aina","Mei","Saki","Kana","Emi","Hana","Yui","Riko","Ayaka","Nanami","Kaori","Yuki","Mai","Misaki","Chihiro","Yuka"],
      last: ["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Kobayashi","Kato","Yoshida","Yamada","Sasaki","Yamaguchi","Matsumoto"]
    },
    korean: {
      male: ["Min-jun","Ji-hoo","Seo-jun","Do-yun","Ha-jun","Ye-jun","Si-woo","Joo-won","Yu-jun","Ji-ho","Min-ho","Hyun-woo","Jae-min","Jun-ho","Tae-yang","Jin-woo","Woo-jin","Sung-min","Kyung-ho","Young-ho"],
      female: ["Seo-yeon","Ji-woo","Min-seo","Seo-hyun","Ji-yoo","Chae-won","Soo-ah","Ye-eun","Ha-eun","Yu-na","Ji-min","Da-eun","So-yeon","Ha-yoon","Ye-jin","Min-ji","Eun-ji","Hye-jin","Sun-hee","Mi-rae"],
      last: ["Kim","Lee","Park","Choi","Jung","Kang","Cho","Yoon","Jang","Lim","Han","Oh","Seo","Shin","Kwon"]
    },
    hindi: {
      male: ["Aarav","Vivaan","Aditya","Arjun","Rohan","Karan","Rahul","Vikram","Aryan","Ishaan","Kabir","Dev","Shivam","Yash","Rishabh","Rir","Sahil","Nikhil","Manish","Suresh","Vijay","Ajay","Ravi","Amit","Sanjay"],
      female: ["Priya","Ananya","Aisha","Diya","Kavya","Riya","Sneha","Pooja","Nisha","Shreya","Aanya","Meera","Aditi","Ishita","Anjali","Kavita","Sunita","Radha","Sita","Meena","Neha","Swati","Anita","Rekha","Deepa"],
      last: ["Sharma","Verma","Gupta","Singh","Patel","Kumar","Reddy","Rao","Nair","Iyer","Joshi","Mehta","Shah","Yadav","Mishra","Chauhan","Tiwari","Pandey","Agarwal","Jain"]
    },
    turkish: {
      male: ["Mehmet","Mustafa","Ahmet","Ali","Huseyin","Hasan","Ibrahim","Murat","Omer","Yusuf","Emre","Burak","Can","Cem","Deniz","Kerem","Tolga","Sinan","Kaan","Serkan"],
      female: ["Fatma","Ayse","Emine","Hatice","Zeynep","Elif","Merve","Ozlem","Esra","Selin","Deniz","Ceren","Ebru","Derya","Asli","Gizem","Seda","Yasemin","Buse","Dilara"],
      last: ["Yilmaz","Kaya","Demir","Sahin","Celik","Yildiz","Yildirim","Ozturk","Aydin","Ozdemir","Arslan","Dogan","Kilic","Aslan","Cetin"]
    },
    spanish: {
      male: ["Antonio","Jose","Manuel","Francisco","David","Juan","Javier","Daniel","Carlos","Miguel","Alejandro","Pedro","Angel","Pablo","Sergio","Diego","Raul","Luis","Fernando","Adrian"],
      female: ["Maria","Carmen","Isabel","Ana","Dolores","Pilar","Teresa","Rosa","Cristina","Marta","Lucia","Paula","Laura","Elena","Sofia","Carmen","Elena","Natalia","Patricia","Raquel"],
      last: ["Garcia","Rodriguez","Gonzalez","Fernandez","Lopez","Martinez","Sanchez","Perez","Gomez","Martin","Jimenez","Ruiz","Hernandez","Diaz","Moreno","Alvarez","Romero","Navarro","Torres","Domínguez"]
    },
    italian: {
      male: ["Leonardo","Francesco","Alessandro","Lorenzo","Matteo","Andrea","Gabriele","Riccardo","Tommaso","Marco","Luca","Giuseppe","Antonio","Giovanni","Pietro","Stefano","Paolo","Roberto","Salvatore","Davide"],
      female: ["Sofia","Giulia","Aurora","Alice","Ginevra","Emma","Giorgia","Greta","Beatrice","Anna","Chiara","Martina","Sara","Francesca","Elena","Giulia","Valentina","Federica","Alessia","Silvia"],
      last: ["Rossi","Russo","Ferrari","Esposito","Bianchi","Romano","Colombo","Ricci","Marino","Greco","Bruno","Gallo","Conti","De Luca","Costa","Giordano","Mancini","Rizzo","Lombardi","Moretti"]
    }
  };

  /* ---------- Helpers ---------- */
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (m) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
    });
  }

  /* ---------- Generate a single name ---------- */
  function generateOne() {
    var bank = NAMES[state.culture] || NAMES.western;

    var gender = state.gender;
    if (gender === "random") {
      gender = Math.random() > 0.5 ? "male" : "female";
    }

    var firstNamePool = gender === "male" ? bank.male : bank.female;
    var first = pick(firstNamePool);
    var last = pick(bank.last);

    var display = "";
    if (state.format === "full") {
      display = first + " " + last;
    } else if (state.format === "first") {
      display = first;
    } else if (state.format === "last") {
      display = last;
    } else if (state.format === "initials") {
      display = first.charAt(0).toUpperCase() + "." + last.charAt(0).toUpperCase() + ".";
    }

    return {
      first: first,
      last: last,
      display: display,
      gender: gender,
      culture: state.culture
    };
  }

  /* ---------- Generate batch ---------- */
  function generateAll() {
    state.names = [];
    for (var i = 0; i < state.count; i++) {
      state.names.push(generateOne());
    }
    renderNames();
    addHistory();
  }

  /* ---------- Render names ---------- */
  function renderNames() {
    namesGrid.innerHTML = "";

    if (!state.names.length) {
      namesGrid.innerHTML =
        '<div class="rn-empty">' +
          '<svg class="rn-i" viewBox="0 0 24 24"><use href="#rn-i-users"/></svg>' +
          '<h3>এখনো নাম তৈরি হয়নি</h3>' +
          '<p>"নতুন নাম তৈরি করুন" ক্লিক করুন — এক ক্লিকে অনেক নাম</p>' +
        '</div>';
      resultsCount.textContent = "0";
      return;
    }

    resultsCount.textContent = state.names.length;

    var cultureLabels = {
      western: "Western",
      bengali: "বাংলা",
      arabic: "আরবি",
      japanese: "জাপানি",
      korean: "কোরিয়ান",
      hindi: "হিন্দি",
      turkish: "তুর্কি",
      spanish: "স্পেনিশ",
      italian: "ইতালিয়ান"
    };

    state.names.forEach(function (name, idx) {
      var card = document.createElement("div");
      card.className = "rn-name-card gender-" + (name.gender === "male" ? "m" : "f");
      card.style.animationDelay = (idx * 30) + "ms";

      var initial = name.display.charAt(0).toUpperCase();

      card.innerHTML =
        '<div class="rn-name-avatar">' + escapeHtml(initial) + '</div>' +
        '<div class="rn-name-body">' +
          '<div class="rn-name-text" title="ক্লিক করে কপি করুন">' + escapeHtml(name.display) + '</div>' +
          '<div class="rn-name-meta">' +
            '<span class="rn-name-gender-tag">' + (name.gender === "male" ? "♂ M" : "♀ F") + '</span>' +
            '<span class="rn-name-culture">' + (cultureLabels[name.culture] || name.culture) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="rn-name-actions">' +
          '<button type="button" class="rn-name-btn" data-act="copy" title="কপি">' +
            '<svg class="rn-i" viewBox="0 0 24 24"><use href="#rn-i-copy"/></svg>' +
          '</button>' +
          '<button type="button" class="rn-name-btn' + (favorites.indexOf(name.display) !== -1 ? " is-fav" : "") + '" data-act="fav" title="প্রিয় তালিকায় যোগ করুন">' +
            '<svg class="rn-i" viewBox="0 0 24 24"><use href="#rn-i-star"/></svg>' +
          '</button>' +
        '</div>';

      // Click on name text = copy
      card.querySelector(".rn-name-text").addEventListener("click", function () {
        copyText(name.display, null);
      });

      // Copy button
      card.querySelector('[data-act="copy"]').addEventListener("click", function (e) {
        e.stopPropagation();
        copyText(name.display, this);
      });

      // Favorite button
      card.querySelector('[data-act="fav"]').addEventListener("click", function (e) {
        e.stopPropagation();
        toggleFavorite(name.display, this);
      });

      namesGrid.appendChild(card);
    });
  }

  /* ---------- Favorite toggle ---------- */
  function toggleFavorite(name, btn) {
    var idx = favorites.indexOf(name);
    if (idx === -1) {
      favorites.unshift(name);
      if (favorites.length > 30) favorites = favorites.slice(0, 30);
      if (btn) {
        btn.classList.add("is-fav");
      }
      showToast("★ প্রিয় তালিকায় যোগ হয়েছে");
    } else {
      favorites.splice(idx, 1);
      if (btn) {
        btn.classList.remove("is-fav");
      }
      showToast("প্রিয় তালিকা থেকে সরানো হয়েছে");
    }
    setStore(STORAGE_FAVS, favorites);
    renderFavorites();
  }

  /* ---------- Render favorites ---------- */
  function renderFavorites() {
    favsCount.textContent = favorites.length;
    if (!favorites.length) {
      favsBox.hidden = true;
      return;
    }
    favsBox.hidden = false;
    favsList.innerHTML = "";
    favorites.forEach(function (name) {
      var el = document.createElement("div");
      el.className = "rn-fav-item";
      el.innerHTML =
        '<span class="rn-fav-text">' + escapeHtml(name) + '</span>' +
        '<button class="rn-fav-close" type="button" title="মুছুন">' +
          '<svg class="rn-i" viewBox="0 0 24 24"><use href="#rn-i-x"/></svg>' +
        '</button>';
      el.querySelector(".rn-fav-text").addEventListener("click", function () {
        copyText(name, null);
      });
      el.querySelector(".rn-fav-close").addEventListener("click", function (e) {
        e.stopPropagation();
        var i = favorites.indexOf(name);
        if (i !== -1) {
          favorites.splice(i, 1);
          setStore(STORAGE_FAVS, favorites);
          renderFavorites();
          // Update card buttons
          document.querySelectorAll(".rn-name-card").forEach(function (card) {
            var text = card.querySelector(".rn-name-text");
            if (text && text.textContent === name) {
              var favBtn = card.querySelector('[data-act="fav"]');
              if (favBtn) favBtn.classList.remove("is-fav");
            }
          });
        }
      });
      favsList.appendChild(el);
    });
  }

  /* ---------- Historyrir ---------- */
  function addHistory() {
    if (!state.names.length) return;
    var first = state.names[0].display;
    state.history = state.history.filter(function (h) { return h !== first; });
    state.history.unshift(first);
    if (state.history.length > 8) state.history = state.history.slice(0, 8);
    renderHistory();
  }

  function renderHistory() {
    if (!state.history.length) {
      historyBox.hidden = true;
      return;
    }
    historyBox.hidden = false;
    historyList.innerHTML = "";
    state.history.forEach(function (name) {
      var el = document.createElement("div");
      el.className = "rn-history-item";
      el.innerHTML = '<span>' + escapeHtml(name) + '</span>';
      el.addEventListener("click", function () {
        copyText(name, null);
      });
      historyList.appendChild(el);
    });
  }

  /* ---------- Copy ---------- */
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
        btn.innerHTML = '<svg class="rn-i" viewBox="0 0 24 24"><use href="#rn-i-check"/></svg>';
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.innerHTML = orig;
        }, 1400);
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
     EVENTS
     ============================================================ */

  // Culture chips
  cultureChips.forEach(function (chip) {
    if (chip.getAttribute("data-culture") === state.culture) {
      chip.classList.add("is-active");
    } else {
      chip.classList.remove("is-active");
    }
    chip.addEventListener("click", function () {
      cultureChips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      state.culture = chip.getAttribute("data-culture");
      prefs.culture = state.culture;
      setStore(STORAGE_PREFS, prefs);
      generateAll();
    });
  });

  // Gender
  genderBtns.forEach(function (btn) {
    if (btn.getAttribute("data-gender") === state.gender) {
      btn.classList.add("is-active");
    } else {
      btn.classList.remove("is-active");
    }
    btn.addEventListener("click", function () {
      genderBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.gender = btn.getAttribute("data-gender");
      prefs.gender = state.gender;
      setStore(STORAGE_PREFS, prefs);
      generateAll();
    });
  });

  // Format
  formatBtns.forEach(function (btn) {
    if (btn.getAttribute("data-format") === state.format) {
      btn.classList.add("is-active");
    } else {
      btn.classList.remove("is-active");
    }
    btn.addEventListener("click", function () {
      formatBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.format = btn.getAttribute("data-format");
      prefs.format = state.format;
      setStore(STORAGE_PREFS, prefs);
      generateAll();
    });
  });

  // Count
  countSlider.value = state.count;
  countVal.textContent = state.count;
  countSlider.addEventListener("input", function () {
    state.count = parseInt(this.value, 10);
    countVal.textContent = state.count;
    prefs.count = state.count;
    setStore(STORAGE_PREFS, prefs);
  });
  countSlider.addEventListener("change", generateAll);

  // Generate button
  generateBtn.addEventListener("click", generateAll);
  regenerateBtn.addEventListener("click", generateAll);

  // Copy all
  copyAllBtn.addEventListener("click", function () {
    if (!state.names.length) {
      showToast("⚠ আগে নাম তৈরি করুন");
      return;
    }
    var text = state.names.map(function (n) { return n.display; }).join("\n");
    copyText(text, this);
    showToast("✓ সব " + state.names.length + "টি নাম কপি হয়েছে");
  });

  // Favorites clear
  favsClear.addEventListener("click", function () {
    favorites = [];
    setStore(STORAGE_FAVS, favorites);
    renderFavorites();
    document.querySelectorAll('[data-act="fav"].is-fav').forEach(function (b) {
      b.classList.remove("is-fav");
    });
    showToast("✓ প্রিয় তালিকা মুছে ফেলা হয়েছে");
  });

  // History clear
  historyClear.addEventListener("click", function () {
    state.history = [];
    renderHistory();
    showToast("✓ ইতিহাস মুছে ফেলা হয়েছে");
  });

  /* ---------- Init ---------- */
  generateAll();
  renderFavorites();

})();
