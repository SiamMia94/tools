(function(){
  "use strict";

  function forceFullWidth(){
    if (!document.querySelector(".sc-wrapper")) return;
    document.body.classList.add("vt-full-width");
    ["#content-wrapper","#content-wrapper > .container","#main-wrapper","#main",
     ".blog-posts",".blog-posts-wrap",".item-post-wrap",".item-post",".item-post-inner",
     ".entry-content-wrap",".post-body","#post-body",".blog-post",".entry-header",
     ".blog-entry-header",".p-eh",".hentry","article"].forEach(function(s){
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

  var W = document.getElementById("scWrapper");
  if (!W) return;
  function $(id){ return document.getElementById(id); }

  var toasts = $("scToasts");
  var stickySteps = document.querySelectorAll(".sc-sticky-step");
  var stickyLang = W.querySelector(".sc-sticky-lang");
  var textTabs = $("scTextTabs"), textEncView = $("scTextEncView"), textDecView = $("scTextDecView");
  var secretEl = $("scSecret"), byteCount = $("scByteCount");
  var emojiCats = $("scEmojiCats"), emojiGrid = $("scEmojiGrid");
  var previewEmoji = $("scPreviewEmoji"), resultTitle = $("scResultTitle"), resultSub = $("scResultSub");
  var resultMeta = $("scResultMeta"), output = $("scOutput"), outputBadge = $("scOutputBadge");
  var copyEncBtn = $("scCopyEnc"), verifyBtn = $("scVerify");
  var decodeIn = $("scDecodeIn"), decChip = $("scDecChip"), decoded = $("scDecoded"), copyDecBtn = $("scCopyDec");
  var pasteBtn = $("scPaste"), clearDecBtn = $("scClearDec");
  var sampleEncBtn = $("scSampleEnc"), sampleDecBtn = $("scSampleDec");

  var EMOJI_CATS = {
    love: ["❤️","💖","💗","💓","💕","💞","💘","💝","💟","🩷","🩵","🩶","🫀","♥️","💌","💐","🌹","🥀","🎁","💒","💍","👰","🤵","💋","😘","😍","🥰","😻","🫶","🫂","💏","💑","😚","🥹","💔","❤️‍🔥","❤️‍🩹","😽","🙈","🎀","🗝️","🔐","🏩","💘","💝"],
    smiley: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🫢","🫣","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🫠"],
    gesture: ["👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏"],
    animal: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐢","🐍","🦎","🐙","🦑","🦀","🐠","🐟","🐬","🐳","🦈"],
    nature: ["🌸","💐","🏵️","🌹","🥀","🌺","🌻","🌼","🌷","🌱","🌿","☘️","🍀","🎍","🎋","🍃","🍂","🍁","🌾","🌵","🌴","🌳","🌲","⭐","🌟","✨","⚡","🔥","💫","☀️","🌞","🌝","🌚","🌙","🌛","🌜","🌕","🌈"],
    food: ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥕","🌽","🌶️","🥒","🥬","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🥞","🧇","🥓","🍔","🍟","🍕","🌭","🥪","🌮"],
    object: ["💎","👑","🎯","🎲","🎮","🕹️","🎰","🎨","🖌️","🖍️","📝","✏️","🖊️","🖋️","✒️","📚","📖","📕","📗","📘","📙","📓","📔","📒","🔒","🔓","🔑","🗝️","🔨","🪓","⛏️","🔧","🔩","⚙️","🧲","💣","🔪","🗡️","⚔️","🛡️","🏺","🔮","📿","🧿","🪄"],
    symbol: ["💯","🔥","⚡","✨","⭐","🌟","💫","💥","💢","💤","💦","💨","💬","💭","🗯️","💮","✅","❌","⭕","🚫","💠","♻️","✳️","❇️","✴️","🆚","🆕","🆓","🆒","🆖","🆗","🆙","🆘","🆔","㊗️","㊙️","♈","♉","♊","♋","♌","♍","♎","♏"]
  };

  var state = { textTab: "enc", carrier: "❤️", carrierCat: "love" };
  var lang = (function(){ try { return localStorage.getItem("sc_lang") === "en" ? "en" : "bn"; } catch(e){ return "bn"; } })();

  var T = {
    bn: {
      badge: "100% Offline · Private", subtitle: "আপনার গোপন বার্তা ইমোজির ভেতর অদৃশ্যভাবে লুকিয়ে রাখুন।",
      stepLbl1: "বার্তা", stepLbl2: "বাহক", stepLbl3: "কপি",
      tabEnc: "এনকোড", tabDec: "ডিকোড",
      catLove: "ভালোবাসা", catSmiley: "স্মাইলি", catGesture: "অঙ্গভঙ্গি", catAnimal: "পশু", catNature: "প্রকৃতি", catFood: "খাবার", catObject: "বস্তু", catSymbol: "চিহ্ন",
      step1: "আপনার গোপন বার্তা", ph1: "যে বার্তাটি লুকাতে চান…", encHint: "যেকোনো ভাষায় লিখুন", sample: "নমুনা",
      step2: "বাহক ইমোজি বেছে নিন", step3: "ফলাফল — কপি করুন", receiverSees: "প্রাপক দেখবে",
      resultEmpty: "বার্তার অপেক্ষায়…", resultEmptySub: "বার্তা লিখুন", resultReady: "প্রস্তুত!",
      resultSub: function(b,c){ return b+" বাইট · "+c+" ক্যারেক্টার"; },
      bytes: function(n){ return n+" বাইট"; }, chars: function(n){ return n+" অক্ষর"; },
      copyEnc: "টেক্সট কপি করুন", copiedEnc: "✓ কপি হয়েছে!", copiedBadge: "কপি হয়েছে!",
      verify: "যাচাই", verified: "✓ যাচাই সফল", verifyFail: "⚠ মিলছে না",
      hint: "কিছু অ্যাপ অদৃশ্য ক্যারেক্টার মুছে ফেলে। যাচাই করুন।",
      stepD1: "এনকোড করা টেক্সট পেস্ট করুন", phD: "এখানে পেস্ট করুন…", paste: "পেস্ট", clear: "মুছুন",
      stepD2: "লুকানো বার্তা", phDOut: "লুকানো বার্তা এখানে…", copyDec: "বার্তা কপি করুন", copiedDec: "✓ কপি হয়েছে!",
      chipIdle: "অপেক্ষমাণ", chipFound: function(n){ return "পাওয়া · "+n; }, chipNone: "কোনো বার্তা নেই",
      emptyCopy: "কিছু নেই", pasteFail: "ক্লিপবোর্ড নেই", info1: "অফলাইন", info2: "প্রাইভেট", info3: "অদৃশ্য এনকোডিং", foot: "সম্পূর্ণ অফলাইন",
      showOutput: "এনকোড করা টেক্সট দেখুন",
      guideTitle: "কীভাবে ব্যবহার করবেন",
      guideStep1Title: "১. গোপন বার্তা লিখুন", guideStep1Body: "আপনার গোপন বার্তা ইনপুট বক্সে লিখুন বা পেস্ট করুন। যেকোনো ভাষায় কাজ করবে।",
      guideStep2Title: "২. বাহক বেছে নিন", guideStep2Body: "ভালোবাসা, স্মাইলি, পশু ইত্যাদি ক্যাটাগরি থেকে যেকোনো একটি ইমোজি বেছে নিন। এই ইমোজিটি প্রাপক দেখতে পাবে।",
      guideStep3Title: "৩. কপি করুন", guideStep3Body: "এনকোড করা টেক্সট কপি করুন। এটি দেখতে সাধারণ ইমোজির মতোই মনে হবে, কিন্তু ভেতরে আপনার বার্তা লুকানো।",
      guideStep4Title: "৪. পাঠান", guideStep4Body: "কপি করা টেক্সট WhatsApp, Telegram বা যেকোনো চ্যাটে পেস্ট করে পাঠান। প্রাপক ডিকোড ট্যাবে পেস্ট করলে বার্তা দেখতে পাবে।",
      faqTitle: "সাধারণ প্রশ্ন", faqQ1: "এটি কি সত্যিই নিরাপদ?", faqA1: "হ্যাঁ। সব প্রসেসিং আপনার ব্রাউজারেই হয় — কোনো সার্ভার বা ইন্টারনেট সংযোগের প্রয়োজন নেই। কোনো ডেটা কোথাও পাঠানো বা সংরক্ষণ করা হয় না।",
      faqQ2: "কত লম্বা বার্তা পাঠাতে পারব?", faqA2: "কোনো কঠিন সীমা নেই — তবে খুব বড় বার্তায় অদৃশ্য ক্যারেক্টারের সংখ্যা বেশি হবে।",
      faqQ3: "কেন আমার পাঠানো মেসেজ ডিকোড হচ্ছে না?", faqA3: "কিছু মেসেজিং অ্যাপ (বিশেষত SMS গেটওয়ে) অদৃশ্য ক্যারেক্টার মুছে ফেলে। পাঠানোর আগে সবসময় 'যাচাই' বাটনে ক্লিক করে নিশ্চিত করুন।",
      faqQ4: "কোন অ্যাপে সবচেয়ে ভালো কাজ করে?", faqA4: "WhatsApp, Telegram, Messenger এবং iMessage-এ সবচেয়ে ভালো কাজ করে। SMS এবং কিছু পুরনো ক্লায়েন্টে সমস্যা হতে পারে।",
      tipsTitle: "নিরাপত্তা টিপস",
      tip1: "গুরুত্বপূর্ণ বার্তার ক্ষেত্রে সবসময় 'যাচাই' করুন।",
      tip2: "সবচেয়ে ভালো ফলাফলের জন্য ছোট থেকে মাঝারি দৈর্ঘ্যের বার্তা ব্যবহার করুন।",
      tip3: "প্রাপককে জানান যে এই টুলের ডিকোড ট্যাবে পেস্ট করতে হবে।",
      tip4: "প্রাইভেট বা সংবেদনশীল তথ্য শুধু বিশ্বস্ত প্রাপককে পাঠান।",
      tip5: "একই ইমোজি বারবার ব্যবহার করলেও প্রতিবার বার্তা আলাদা হবে।",
      tip6: "WhatsApp বা Telegram-এ পাঠানোর পর ডিকোড করে যাচাই করুন।"
    },
    en: {
      badge: "100% Offline · Private", subtitle: "Hide your secret message invisibly inside an emoji.",
      stepLbl1: "Message", stepLbl2: "Carrier", stepLbl3: "Copy",
      tabEnc: "Encode", tabDec: "Decode",
      catLove: "Love", catSmiley: "Smileys", catGesture: "Gestures", catAnimal: "Animals", catNature: "Nature", catFood: "Food", catObject: "Objects", catSymbol: "Symbols",
      step1: "Your secret message", ph1: "Type the message to hide…", encHint: "Any language works", sample: "Sample",
      step2: "Choose an emoji carrier", step3: "Result — copy it", receiverSees: "Receiver sees",
      resultEmpty: "Waiting…", resultEmptySub: "Type a message to start", resultReady: "Ready!",
      resultSub: function(b,c){ return b+" bytes · "+c+" chars"; },
      bytes: function(n){ return n+" bytes"; }, chars: function(n){ return n+" chars"; },
      copyEnc: "Copy text", copiedEnc: "✓ Copied!", copiedBadge: "Copied!",
      verify: "Verify", verified: "✓ Verified", verifyFail: "⚠ Mismatch",
      hint: "Some apps strip invisible characters. Verify before sending.",
      stepD1: "Paste the encoded text", phD: "Paste here…", paste: "Paste", clear: "Clear",
      stepD2: "Hidden message", phDOut: "Hidden message appears here…", copyDec: "Copy message", copiedDec: "✓ Copied!",
      chipIdle: "Waiting", chipFound: function(n){ return "Found · "+n; }, chipNone: "No message",
      emptyCopy: "Nothing to copy", pasteFail: "Clipboard denied", info1: "Offline", info2: "Private", info3: "Invisible encoding", foot: "Fully offline",
      showOutput: "Show encoded text",
      guideTitle: "How to use",
      guideStep1Title: "1. Write your secret message", guideStep1Body: "Type or paste your message in the input box. Any language works.",
      guideStep2Title: "2. Choose a carrier", guideStep2Body: "Pick any emoji from the Love, Smileys, Animals, etc. This emoji is what the receiver will see.",
      guideStep3Title: "3. Copy the result", guideStep3Body: "Copy the encoded text. It looks exactly like a normal emoji, but hides your message inside.",
      guideStep4Title: "4. Send it", guideStep4Body: "Paste the copied text into WhatsApp, Telegram or any chat. The receiver pastes it in the Decode tab to read.",
      faqTitle: "Frequently asked questions", faqQ1: "Is this really secure?", faqA1: "Yes. All processing happens in your browser — no server or internet connection required. No data is transmitted or stored anywhere.",
      faqQ2: "How long can my message be?", faqA2: "No hard limit — but longer messages create more invisible characters.",
      faqQ3: "Why doesn't my sent message decode?", faqA3: "Some messaging apps (especially SMS gateways) strip invisible characters. Always click 'Verify' before sending.",
      faqQ4: "Which apps work best?", faqA4: "WhatsApp, Telegram, Messenger and iMessage work best. SMS and some older clients may strip characters.",
      tipsTitle: "Security tips",
      tip1: "Always click 'Verify' for important messages.",
      tip2: "Short to medium-length messages work best.",
      tip3: "Tell the receiver to paste it in the Decode tab of this tool.",
      tip4: "Only share private info with trusted recipients.",
      tip5: "Reusing the same emoji each time still produces a unique message.",
      tip6: "After sending via WhatsApp or Telegram, decode it to verify."
    }
  };

  function isVS(cp){ return (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF); }
  function encodeMsg(carrier, text){
    var bytes = new TextEncoder().encode(text);
    var out = carrier;
    for (var i = 0; i < bytes.length; i++){
      var b = bytes[i];
      out += String.fromCodePoint(b < 16 ? 0xFE00 + b : 0xE0100 + (b - 16));
    }
    return out;
  }
  function collectBytes(str, skipLeadingVS16){
    var bytes = [], prevVS = false, skipped = false;
    for (var ch of str){
      var cp = ch.codePointAt(0);
      if (isVS(cp)){
        if (skipLeadingVS16 && !skipped && !prevVS && cp === 0xFE0F && bytes.length === 0){ skipped = true; prevVS = true; continue; }
        prevVS = true;
        bytes.push(cp <= 0xFE0F ? cp - 0xFE00 : cp - 0xE0100 + 16);
      } else prevVS = false;
    }
    return bytes;
  }
  function decodeMsg(str){
    var a = collectBytes(str, true);
    if (a.length === 0) return { text: "", n: 0 };
    try { return { text: new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(a)), n: a.length }; }
    catch(e){
      var b = collectBytes(str, false);
      try { return { text: new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(b)), n: b.length }; }
      catch(e2){ return { text: new TextDecoder("utf-8").decode(new Uint8Array(a)), n: a.length }; }
    }
  }

  function toast(msg){
    if (!toasts) return;
    var t = document.createElement("div");
    t.className = "sc-toast"; t.textContent = msg;
    toasts.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add("is-in"); });
    setTimeout(function(){ t.classList.remove("is-in"); setTimeout(function(){ t.remove(); }, 350); }, 2400);
  }
  function fallbackCopy(text){
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed";
      ta.style.top = "-1000px"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta); return true;
    } catch(e){ return false; }
  }
  function spawnRipple(btn, ev){
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.1;
    var x = (ev && ev.clientX) ? ev.clientX - rect.left : rect.width / 2;
    var y = (ev && ev.clientY) ? ev.clientY - rect.top : rect.height / 2;
    var ripple = document.createElement("span");
    ripple.className = "sc-copy-ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (x - size / 2) + "px";
    ripple.style.top = (y - size / 2) + "px";
    btn.appendChild(ripple);
    setTimeout(function(){ ripple.remove(); }, 720);
  }
  function showCopiedState(btn){
    if (!btn || btn.classList.contains("is-copied")) return;
    btn.classList.add("is-copied");
    setTimeout(function(){ btn.classList.remove("is-copied"); }, 2000);
  }
  function copyText(text, okMsg, btn, ev){
    if (!text){ toast(T[lang].emptyCopy); return; }
    if (btn) spawnRipple(btn, ev);
    var done = function(){
      toast(okMsg || T[lang].copiedEnc);
      if (btn) showCopiedState(btn);
    };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(function(){
        if (fallbackCopy(text)) done(); else toast("Copy failed");
      });
    } else {
      if (fallbackCopy(text)) done(); else toast("Copy failed");
    }
  }
  function updateOutputBadge(){
    if (!outputBadge) return;
    if (output && output.value){
      outputBadge.textContent = Array.from(output.value).length + " " + (lang === "bn" ? "ক্যারেক্টার" : "chars");
    } else outputBadge.textContent = "";
  }

  function applyLang(l){
    lang = l;
    try { localStorage.setItem("sc_lang", l); } catch(e){}
    document.documentElement.lang = l;
    var t = T[l];
    W.querySelectorAll("[data-i]").forEach(function(el){
      var k = el.getAttribute("data-i");
      if (t[k] !== undefined && typeof t[k] === "string") el.textContent = t[k];
    });
    W.querySelectorAll("[data-ph]").forEach(function(el){
      var k = el.getAttribute("data-ph");
      if (t[k] !== undefined) el.placeholder = t[k];
    });
    if (stickyLang){
      stickyLang.querySelectorAll("button").forEach(function(b){
        b.classList.toggle("is-active", b.getAttribute("data-lang") === l);
      });
    }
    runTextEncode(); runTextDecode();
  }

  function buildEmojiGrid(cat){
    state.carrierCat = cat;
    var list = EMOJI_CATS[cat] || EMOJI_CATS.love;
    emojiGrid.innerHTML = "";
    list.forEach(function(v){
      var b = document.createElement("button");
      b.type = "button"; b.textContent = v; b.setAttribute("aria-label", v);
      if (v === state.carrier) b.classList.add("is-selected");
      b.addEventListener("click", function(){
        state.carrier = v;
        emojiGrid.querySelectorAll("button").forEach(function(x){ x.classList.remove("is-selected"); });
        b.classList.add("is-selected");
        runTextEncode();
      });
      emojiGrid.appendChild(b);
    });
  }

  function updateStepProgress(){
    if (state.textTab === "enc"){
      var hasText = !!secretEl.value, hasResult = !!output.value;
      stickySteps.forEach(function(step){
        var n = parseInt(step.getAttribute("data-step"), 10);
        step.classList.remove("is-done", "is-active");
        if (n === 1 && hasText) step.classList.add("is-done");
        if (n === 2 && hasText) step.classList.add("is-done");
        if (n === 3 && hasResult) step.classList.add("is-done");
        if (n === 1 && !hasText) step.classList.add("is-active");
        else if (n === 2 && hasText && !hasResult) step.classList.add("is-active");
        else if (n === 3 && hasResult) step.classList.add("is-active");
      });
    } else {
      stickySteps.forEach(function(step){
        var n = parseInt(step.getAttribute("data-step"), 10);
        step.classList.remove("is-done", "is-active");
        if (n === 1) step.classList.add(decodeIn.value ? "is-done" : "is-active");
        if (n === 2) step.classList.add(decoded.value ? "is-done" : (decodeIn.value ? "is-active" : ""));
      });
    }
  }

  function runTextEncode(){
    var t = T[lang], secret = secretEl.value;
    var bytes = new TextEncoder().encode(secret).length;
    byteCount.textContent = bytes ? t.bytes(bytes) : "";
    previewEmoji.textContent = state.carrier;

    if (!secret || !state.carrier){
      output.value = ""; copyEncBtn.disabled = true; verifyBtn.disabled = true;
      resultTitle.textContent = t.resultEmpty; resultSub.textContent = t.resultEmptySub; resultMeta.textContent = "";
      updateStepProgress(); updateOutputBadge(); return;
    }
    var out = encodeMsg(state.carrier, secret);
    output.value = out; copyEncBtn.disabled = false; verifyBtn.disabled = false;
    resultTitle.textContent = t.resultReady;
    var totalChars = Array.from(out).length;
    resultSub.textContent = t.resultSub(bytes, totalChars);
    resultMeta.textContent = t.chars(totalChars);

    previewEmoji.classList.remove("is-bouncing");
    void previewEmoji.offsetWidth;
    previewEmoji.classList.add("is-bouncing");
    setTimeout(function(){ previewEmoji.classList.remove("is-bouncing"); }, 750);

    updateStepProgress(); updateOutputBadge();
  }

  function runTextDecode(){
    var t = T[lang], raw = decodeIn.value;
    if (!raw){
      decoded.value = ""; decChip.textContent = t.chipIdle; decChip.className = "sc-chip";
      copyDecBtn.disabled = true;
      updateStepProgress(); return;
    }
    var r = decodeMsg(raw);
    decoded.value = r.text;
    if (r.n > 0 && r.text){
      decChip.textContent = t.chipFound(Array.from(r.text).length);
      decChip.className = "sc-chip is-ok";
      copyDecBtn.disabled = false;
    } else {
      decChip.textContent = t.chipNone;
      decChip.className = "sc-chip is-none";
      copyDecBtn.disabled = true;
    }
    updateStepProgress();
  }

  textTabs.addEventListener("click", function(e){
    var btn = e.target.closest(".sc-tab");
    if (!btn) return;
    var t = btn.getAttribute("data-tab");
    if (t === state.textTab) return;
    state.textTab = t;
    textTabs.querySelectorAll(".sc-tab").forEach(function(b){ b.classList.toggle("is-active", b === btn); });
    textEncView.classList.toggle("is-active", t === "enc");
    textDecView.classList.toggle("is-active", t === "dec");
    updateStepProgress();
  });

  secretEl.addEventListener("input", runTextEncode);
  decodeIn.addEventListener("input", runTextDecode);
  copyEncBtn.addEventListener("click", function(ev){ copyText(output.value, T[lang].copiedEnc, this, ev); });
  copyDecBtn.addEventListener("click", function(ev){ copyText(decoded.value, T[lang].copiedDec, this, ev); });

  verifyBtn.addEventListener("click", function(){
    var r = decodeMsg(output.value);
    toast(r.text === secretEl.value ? T[lang].verified : T[lang].verifyFail);
  });
  pasteBtn.addEventListener("click", function(){
    if (!navigator.clipboard || !navigator.clipboard.readText){ toast(T[lang].pasteFail); return; }
    navigator.clipboard.readText().then(function(txt){ decodeIn.value = txt; runTextDecode(); }).catch(function(){ toast(T[lang].pasteFail); });
  });
  clearDecBtn.addEventListener("click", function(){ decodeIn.value = ""; runTextDecode(); decodeIn.focus(); });
  sampleEncBtn.addEventListener("click", function(){
    secretEl.value = lang === "bn" ? "আমি তোমাকে ভালোবাসি ❤️ — এটি গোপন!" : "I love you ❤️ — this is a secret!";
    runTextEncode(); secretEl.focus();
  });
  sampleDecBtn.addEventListener("click", function(){
    decodeIn.value = encodeMsg("❤️", lang === "bn" ? "সিক্রেট চ্যাট দুর্দান্ত!" : "Secret Chat is awesome!");
    runTextDecode();
  });
  emojiCats.addEventListener("click", function(e){
    var btn = e.target.closest("button");
    if (!btn) return;
    var cat = btn.getAttribute("data-cat");
    if (cat === state.carrierCat) return;
    emojiCats.querySelectorAll("button").forEach(function(b){ b.classList.toggle("is-active", b === btn); });
    buildEmojiGrid(cat);
  });
  if (stickyLang){
    stickyLang.addEventListener("click", function(e){
      var btn = e.target.closest("button");
      if (!btn) return;
      applyLang(btn.getAttribute("data-lang"));
    });
  }

  buildEmojiGrid("love");
  applyLang(lang);

})();
