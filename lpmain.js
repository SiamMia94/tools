(function () {
  "use strict";

  function forceFullWidth() {
    if (!document.querySelector(".tools-hub")) return;
    document.body.classList.add("vt-full-width");
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
    var o = document.getElementById("outer-wrapper");
    if (o) o.style.setProperty("overflow-x","visible","important");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", forceFullWidth);
  else forceFullWidth();
  setTimeout(forceFullWidth, 300);
  setTimeout(forceFullWidth, 1200);

  var hub = document.getElementById("thHub");
  if (!hub) return;

  var searchInput  = document.getElementById("thSearch");
  var searchWrap   = document.getElementById("thSearchWrap");
  var clearBtn     = document.getElementById("thSearchClear");
  var filters      = document.querySelectorAll(".th-filter");
  var tools        = Array.prototype.slice.call(document.querySelectorAll(".th-tool"));
  var emptyState   = document.getElementById("thEmpty");
  var resetBtn     = document.getElementById("thResetBtn");
  var resultsCount = document.getElementById("thResultsCount");
  var sortSelect   = document.getElementById("thSort");
  var grid         = document.getElementById("thGrid");
  var toastBox     = document.getElementById("thToasts");
  var randomBtn    = document.getElementById("thRandomBtn");
  var viewToggle   = document.getElementById("thViewToggle");
  var viewLabel    = document.getElementById("thViewLabel");
  var favCountEl   = document.getElementById("thFavCount");

  var FAV_KEY = "vtrick_favs_sunlight";
  var PREF_KEY = "vtrick_prefs_sunlight";
  function getStore(k, d){ try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } }
  function setStore(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  var favorites = getStore(FAV_KEY, []);
  var prefs = getStore(PREF_KEY, { view: "grid", sort: "default" });

  var state = {
    activeCat: "all",
    query: "",
    sort: prefs.sort || "default",
    view: prefs.view || "grid"
  };

  function showToast(msg, icon) {
    if (!toastBox) return;
    var t = document.createElement("div");
    t.className = "th-toast";
    t.innerHTML = '<svg class="th-i" aria-hidden="true"><use href="#' + (icon || "th-i-check") + '"/></svg><span>' + msg + '</span>';
    toastBox.appendChild(t);
    setTimeout(function(){
      t.classList.add("is-out");
      setTimeout(function(){ t.remove(); }, 320);
    }, 2200);
  }

  function animateCounter(el, target, dur) {
    if (!el) return;
    dur = dur || 900;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  function updateStats() {
    var cats = {};
    tools.forEach(function(t) {
      var c = t.getAttribute("data-cat");
      cats[c] = (cats[c] || 0) + 1;
    });
    document.querySelectorAll(".th-filter-count[data-count]").forEach(function(el) {
      var k = el.getAttribute("data-count");
      el.textContent = (k === "all") ? tools.length : (cats[k] || 0);
    });
    if (favCountEl) favCountEl.textContent = favorites.length;
  }

  function isFav(id){ return favorites.indexOf(id) !== -1; }

  function updateFavUI() {
    tools.forEach(function(tool) {
      var id = tool.getAttribute("data-id");
      var btn = tool.querySelector('[data-fav-id]');
      if (!btn || !id) return;
      var fav = isFav(id);
      tool.classList.toggle("is-fav", fav);
      btn.classList.toggle("is-active", fav);
      btn.setAttribute("aria-label", fav ? "Remove from favorites" : "Add to favorites");
    });
    if (favCountEl) favCountEl.textContent = favorites.length;
  }

  var CAT_ORDER = { text: 0, image: 1, video: 2, seo: 3, utility: 4, generator: 5 };
  tools.forEach(function(t, i){ t.setAttribute("data-original-index", i); });

  function sortTools() {
    var s = tools.slice();
    var m = state.sort;
    if (m === "az") s.sort(function(a,b){ return a.getAttribute("data-name").localeCompare(b.getAttribute("data-name")); });
    else if (m === "za") s.sort(function(a,b){ return b.getAttribute("data-name").localeCompare(a.getAttribute("data-name")); });
    else if (m === "cat") s.sort(function(a,b){
      var ca = CAT_ORDER[a.getAttribute("data-cat")] || 99;
      var cb = CAT_ORDER[b.getAttribute("data-cat")] || 99;
      return ca !== cb ? ca - cb : a.getAttribute("data-name").localeCompare(b.getAttribute("data-name"));
    });
    else s.sort(function(a,b){ return (+a.getAttribute("data-original-index")) - (+b.getAttribute("data-original-index")); });
    s.forEach(function(t){ grid.appendChild(t); });
  }

  function highlightText(el, q) {
    if (!el) return;
    var original = el.getAttribute("data-original");
    if (original === null) {
      original = el.textContent;
      el.setAttribute("data-original", original);
    }
    if (!q) { el.textContent = original; return; }
    var idx = original.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) { el.textContent = original; return; }
    el.textContent = "";
    el.appendChild(document.createTextNode(original.slice(0, idx)));
    var mark = document.createElement("mark");
    mark.textContent = original.slice(idx, idx + q.length);
    el.appendChild(mark);
    el.appendChild(document.createTextNode(original.slice(idx + q.length)));
  }

  function addRipple(e) {
    var target = e.currentTarget;
    var rect = target.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var x = e.clientX - rect.left - size / 2;
    var y = e.clientY - rect.top - size / 2;
    var sp = document.createElement("span");
    sp.className = "th-ripple";
    sp.style.width = sp.style.height = size + "px";
    sp.style.left = x + "px";
    sp.style.top = y + "px";
    target.appendChild(sp);
    setTimeout(function(){ sp.remove(); }, 800);
  }

  tools.forEach(function(tool) {
    tool.addEventListener("click", addRipple);
    tool.addEventListener("mousemove", function(e) {
      var r = tool.getBoundingClientRect();
      tool.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      tool.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    });
  });

  document.querySelectorAll("[data-fav-id]").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      var id = btn.getAttribute("data-fav-id");
      var i = favorites.indexOf(id);
      if (i === -1) { favorites.push(id); showToast("Added to favorites", "th-i-star"); }
      else { favorites.splice(i, 1); showToast("Removed from favorites", "th-i-star"); }
      setStore(FAV_KEY, favorites);
      updateFavUI();
      applyFilter();
    });
  });

  function applyFilter() {
    var q = state.query.toLowerCase().trim();
    var visible = 0;

    tools.forEach(function(tool) {
      var cat = (tool.getAttribute("data-cat") || "").toLowerCase();
      var id = tool.getAttribute("data-id");
      var name = (tool.getAttribute("data-name") || "").toLowerCase();
      var text = tool.textContent.toLowerCase();

      var catMatch;
      if (state.activeCat === "all") catMatch = true;
      else if (state.activeCat === "fav") catMatch = isFav(id);
      else catMatch = (cat === state.activeCat);

      var textMatch = !q || name.indexOf(q) !== -1 || text.indexOf(q) !== -1;

      if (catMatch && textMatch) {
        tool.style.display = "";
        visible++;
      } else {
        tool.style.display = "none";
      }

      var nameText = tool.querySelector(".th-name-text");
      if (nameText) highlightText(nameText, state.query.trim());
    });

    if (resultsCount) animateCounter(resultsCount, visible, 400);
    if (emptyState) emptyState.style.display = visible === 0 ? "" : "none";
  }

  var dTimer = null;
  if (searchInput) {
    searchInput.addEventListener("input", function() {
      var v = this.value;
      if (searchWrap) searchWrap.classList.toggle("has-value", v.length > 0);
      clearTimeout(dTimer);
      dTimer = setTimeout(function(){
        state.query = v;
        applyFilter();
      }, 140);
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      searchInput.value = "";
      state.query = "";
      if (searchWrap) searchWrap.classList.remove("has-value");
      searchInput.focus();
      applyFilter();
    });
  }

  filters.forEach(function(btn) {
    btn.addEventListener("click", function() {
      filters.forEach(function(b){ b.classList.remove("is-active"); });
      this.classList.add("is-active");
      state.activeCat = this.getAttribute("data-filter") || "all";
      applyFilter();
    });
  });

  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener("change", function() {
      state.sort = this.value;
      prefs.sort = state.sort;
      setStore(PREF_KEY, prefs);
      sortTools();
      applyFilter();
    });
  }

  function applyView() {
    grid.classList.toggle("is-list", state.view === "list");
    if (viewLabel) viewLabel.textContent = state.view === "list" ? "Grid view" : "List view";
    if (viewToggle) {
      var icon = viewToggle.querySelector("use");
      if (icon) icon.setAttribute("href", state.view === "list" ? "#th-i-grid" : "#th-i-list");
    }
  }

  if (viewToggle) {
    applyView();
    viewToggle.addEventListener("click", function() {
      state.view = state.view === "list" ? "grid" : "list";
      prefs.view = state.view;
      setStore(PREF_KEY, prefs);
      applyView();
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", function() {
      var visible = tools.filter(function(t){ return t.style.display !== "none"; });
      if (!visible.length) return;
      var pick = visible[Math.floor(Math.random() * visible.length)];
      var name = pick.querySelector(".th-name-text");
      showToast("Opening: " + (name ? name.textContent : "tool"), "th-i-dice");
      setTimeout(function() {
        window.location.href = pick.getAttribute("href");
      }, 350);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      searchInput.value = "";
      state.query = "";
      state.activeCat = "all";
      if (searchWrap) searchWrap.classList.remove("has-value");
      filters.forEach(function(b) {
        b.classList.toggle("is-active", b.getAttribute("data-filter") === "all");
      });
      applyFilter();
    });
  }

  document.addEventListener("keydown", function(e) {
    var tag = (e.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea" || e.target.isContentEditable;
    if (!typing && (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"))) {
      e.preventDefault();
      if (searchInput) { searchInput.focus(); searchInput.select(); }
    }
    if (e.key === "Escape" && document.activeElement === searchInput) {
      if (clearBtn) clearBtn.click();
    }
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
    tools.forEach(function(t) { io.observe(t); });
  } else {
    tools.forEach(function(t) { t.classList.add("is-revealed"); });
  }

  updateStats();
  updateFavUI();
  sortTools();
  applyFilter();
  applyView();
  setTimeout(function(){ animateCounter(resultsCount, tools.length, 700); }, 200);
  window.__thInit = true;

  if (typeof MutationObserver !== "undefined") {
    var mo = new MutationObserver(function() {
      clearTimeout(mo._timeout);
      mo._timeout = setTimeout(forceFullWidth, 150);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
})();
