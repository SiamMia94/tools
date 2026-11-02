(function () {
  "use strict";

  function forceFullWidth() {
    if (!document.querySelector(".tts-wrapper")) return;
    document.body.classList.add("tts-full");
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
  var input        = document.getElementById("ttsInput");
  var countEl      = document.getElementById("ttsCount");
  var clearBtn     = document.getElementById("ttsClear");
  var pasteBtn     = document.getElementById("ttsPasteBtn");
  var voiceSel     = document.getElementById("ttsVoice");
  var rateInput    = document.getElementById("ttsRate");
  var rateValue    = document.getElementById("ttsRateValue");
  var pitchInput   = document.getElementById("ttsPitch");
  var pitchValue   = document.getElementById("ttsPitchValue");
  var volInput     = document.getElementById("ttsVolume");
  var volValue     = document.getElementById("ttsVolumeValue");
  var playBtn      = document.getElementById("ttsPlay");
  var pauseBtn     = document.getElementById("ttsPause");
  var stopBtn      = document.getElementById("ttsStop");
  var dlBtn        = document.getElementById("ttsDownload");
  var previewBtn   = document.getElementById("ttsPreview");
  var statusEl     = document.getElementById("ttsStatus");
  var waveEl       = document.getElementById("ttsWave");
  var toast        = document.getElementById("ttsToast");
  var toastMsg     = document.getElementById("ttsToastMsg");
  var demoChips    = document.querySelectorAll(".tts-chip[data-text]");

  if (!input) return;

  /* ---------- Curated Neural Voice List ---------- */
  /* From Microsoft Edge Read Aloud neural voices */
  var NEURAL_VOICES = [
    { id: "bn-BD-NabanitaNeural",    lang: "বাংলা (বাংলাদেশ)", name: "Nabanita",  gender: "♀" },
    { id: "bn-BD-PradeepNeural",     lang: "বাংলা (বাংলাদেশ)", name: "Pradeep",   gender: "♂" },
    { id: "bn-IN-TanishaaNeural",    lang: "বাংলা (ভারত)",    name: "Tanishaa",  gender: "♀" },
    { id: "bn-IN-BashkarNeural",     lang: "বাংলা (ভারত)",    name: "Bashkar",   gender: "♂" },

    { id: "en-US-AriaNeural",        lang: "English (US)", name: "Aria",        gender: "♀" },
    { id: "en-US-JennyNeural",       lang: "English (US)", name: "Jenny",       gender: "♀" },
    { id: "en-US-MichelleNeural",    lang: "English (US)", name: "Michelle",    gender: "♀" },
    { id: "en-US-AnaNeural",         lang: "English (US)", name: "Ana (Child)", gender: "♀" },
    { id: "en-US-GuyNeural",         lang: "English (US)", name: "Guy",         gender: "♂" },
    { id: "en-US-DavisNeural",       lang: "English (US)", name: "Davis",       gender: "♂" },
    { id: "en-US-TonyNeural",        lang: "English (US)", name: "Tony",        gender: "♂" },
    { id: "en-US-ChristopherNeural", lang: "English (US)", name: "Christopher", gender: "♂" },
    { id: "en-US-EricNeural",        lang: "English (US)", name: "Eric",        gender: "♂" },
    { id: "en-US-RogerNeural",       lang: "English (US)", name: "Roger",       gender: "♂" },

    { id: "en-GB-SoniaNeural",       lang: "English (UK)", name: "Sonia",       gender: "♀" },
    { id: "en-GB-LibbyNeural",       lang: "English (UK)", name: "Libby",       gender: "♀" },
    { id: "en-GB-RyanNeural",        lang: "English (UK)", name: "Ryan",        gender: "♂" },
    { id: "en-GB-ThomasNeural",      lang: "English (UK)", name: "Thomas",      gender: "♂" },

    { id: "en-AU-NatashaNeural",     lang: "English (AU)", name: "Natasha",     gender: "♀" },
    { id: "en-AU-WilliamNeural",     lang: "English (AU)", name: "William",     gender: "♂" },
    { id: "en-CA-ClaraNeural",       lang: "English (CA)", name: "Clara",       gender: "♀" },
    { id: "en-CA-LiamNeural",        lang: "English (CA)", name: "Liam",        gender: "♂" },
    { id: "en-IN-NeerjaNeural",      lang: "English (IN)", name: "Neerja",      gender: "♀" },
    { id: "en-IN-PrabhatNeural",     lang: "English (IN)", name: "Prabhat",     gender: "♂" },

    { id: "hi-IN-SwaraNeural",       lang: "हिन्दी (Hindi)", name: "Swara",     gender: "♀" },
    { id: "hi-IN-MadhurNeural",      lang: "हिन्दी (Hindi)", name: "Madhur",    gender: "♂" },

    { id: "ur-PK-UzmaNeural",        lang: "اردو (Urdu)",   name: "Uzma",       gender: "♀" },
    { id: "ur-PK-AsadNeural",        lang: "اردو (Urdu)",   name: "Asad",       gender: "♂" },

    { id: "ar-SA-ZariyahNeural",     lang: "العربية (Arabic)", name: "Zariyah", gender: "♀" },
    { id: "ar-SA-HamedNeural",       lang: "العربية (Arabic)", name: "Hamed",   gender: "♂" },
    { id: "ar-EG-SalmaNeural",       lang: "العربية (Egypt)", name: "Salma",    gender: "♀" },
    { id: "ar-EG-ShakirNeural",      lang: "العربية (Egypt)", name: "Shakir",   gender: "♂" },

    { id: "es-ES-ElviraNeural",      lang: "Español (ES)",  name: "Elvira",    gender: "♀" },
    { id: "es-ES-AlvaroNeural",      lang: "Español (ES)",  name: "Álvaro",    gender: "♂" },
    { id: "es-MX-DaliaNeural",       lang: "Español (MX)",  name: "Dalia",     gender: "♀" },
    { id: "es-MX-JorgeNeural",       lang: "Español (MX)",  name: "Jorge",     gender: "♂" },

    { id: "fr-FR-DeniseNeural",      lang: "Français",      name: "Denise",    gender: "♀" },
    { id: "fr-FR-HenriNeural",       lang: "Français",      name: "Henri",     gender: "♂" },

    { id: "de-DE-KatjaNeural",       lang: "Deutsch",       name: "Katja",     gender: "♀" },
    { id: "de-DE-ConradNeural",      lang: "Deutsch",       name: "Conrad",    gender: "♂" },

    { id: "it-IT-ElsaNeural",        lang: "Italiano",      name: "Elsa",      gender: "♀" },
    { id: "it-IT-DiegoNeural",       lang: "Italiano",      name: "Diego",     gender: "♂" },

    { id: "pt-BR-FranciscaNeural",   lang: "Português (BR)", name: "Francisca", gender: "♀" },
    { id: "pt-BR-AntonioNeural",     lang: "Português (BR)", name: "Antônio",  gender: "♂" },

    { id: "ru-RU-SvetlanaNeural",    lang: "Русский",       name: "Svetlana",  gender: "♀" },
    { id: "ru-RU-DmitryNeural",      lang: "Русский",       name: "Dmitry",    gender: "♂" },

    { id: "tr-TR-EmelNeural",        lang: "Türkçe",        name: "Emel",      gender: "♀" },
    { id: "tr-TR-AhmetNeural",       lang: "Türkçe",        name: "Ahmet",     gender: "♂" },

    { id: "zh-CN-XiaoxiaoNeural",    lang: "中文 (Chinese)", name: "Xiaoxiao", gender: "♀" },
    { id: "zh-CN-YunxiNeural",       lang: "中文 (Chinese)", name: "Yunxi",    gender: "♂" },

    { id: "ja-JP-NanamiNeural",      lang: "日本語 (Japanese)", name: "Nanami", gender: "♀" },
    { id: "ja-JP-KeitaNeural",       lang: "日本語 (Japanese)", name: "Keita",  gender: "♂" },

    { id: "ko-KR-SunHiNeural",       lang: "한국어 (Korean)", name: "Sun-Hi",  gender: "♀" },
    { id: "ko-KR-InJoonNeural",      lang: "한국어 (Korean)", name: "InJoon",  gender: "♂" },

    { id: "ta-IN-PallaviNeural",     lang: "தமிழ் (Tamil)",  name: "Pallavi",  gender: "♀" },
    { id: "te-IN-ShrutiNeural",      lang: "తెలుగు (Telugu)", name: "Shruti",  gender: "♀" },
    { id: "ta-IN-ValluvarNeural",    lang: "தமிழ் (Tamil)",  name: "Valluvar", gender: "♂" },
    { id: "te-IN-MohanNeural",       lang: "తెలుగు (Telugu)", name: "Mohan",   gender: "♂" }
  ];

  /* ---------- State ---------- */
  var state = {
    audio: null,
    audioBlobUrl: null,
    isPlaying: false,
    isPaused: false,
    isSynthesizing: false,
    fallbackVoice: null
  };

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg || "সম্পন্ন!";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2500);
  }

  /* ---------- Populate voices ---------- */
  function populateVoices() {
    voiceSel.innerHTML = "";

    var grouped = {};
    NEURAL_VOICES.forEach(function (v) {
      if (!grouped[v.lang]) grouped[v.lang] = [];
      grouped[v.lang].push(v);
    });

    var langs = Object.keys(grouped);
    langs.forEach(function (lang) {
      var group = document.createElement("optgroup");
      group.label = lang;
      grouped[lang].forEach(function (v) {
        var opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = v.gender + "  " + v.name + "  ⭐";
        group.appendChild(opt);
      });
      voiceSel.appendChild(group);
    });

    // Auto-select Bengali (Bangladesh) female by default
    voiceSel.value = "bn-BD-NabanitaNeural";
  }

  /* ---------- Character count ---------- */
  function updateCount() {
    var len = input.value.length;
    countEl.textContent = len + (len === 1 ? " character" : " characters");
  }
  input.addEventListener("input", updateCount);
  updateCount();

  /* ---------- Clear ---------- */
  clearBtn.addEventListener("click", function () {
    input.value = "";
    updateCount();
    input.focus();
    stopTTS();
  });

  /* ---------- Paste ---------- */
  pasteBtn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (text) {
        if (text) {
          input.value = text;
          updateCount();
          showToast("✓ পেস্ট হয়েছে");
        } else {
          showToast("⚠ ক্লিপবোর্ড খালি");
        }
      }).catch(function () {
        showToast("⚠ পেস্ট করার অনুমতি নেই");
      });
    } else {
      input.focus();
      showToast("⚠ ম্যানুয়ালি Ctrl+V চাপুন");
    }
  });

  /* ---------- Demo chips ---------- */
  demoChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      input.value = this.getAttribute("data-text");
      updateCount();
      showToast("✓ ডেমো টেক্সট লোড হয়েছে");
    });
  });

  /* ---------- Range labels ---------- */
  rateInput.addEventListener("input", function () {
    rateValue.textContent = parseFloat(this.value).toFixed(1) + "x";
    if (state.audio) state.audio.playbackRate = 1; // handle rate via synthesis
  });
  pitchInput.addEventListener("input", function () {
    pitchValue.textContent = parseFloat(this.value).toFixed(1);
  });
  volInput.addEventListener("input", function () {
    volValue.textContent = Math.round(parseFloat(this.value) * 100) + "%";
    if (state.audio) state.audio.volume = parseFloat(this.value);
  });

  /* ---------- Edge TTS WebSocket ---------- */
  function escapeXml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function edgeTTS(text, voiceId, ratePercent, pitchHz) {
    return new Promise(function (resolve, reject) {
      var token = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
      var connId = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
          });

      var ws;
      try {
        ws = new WebSocket(
          "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1" +
          "?TrustedClientToken=" + token +
          "&ConnectionId=" + connId
        );
      } catch (e) {
        reject(e);
        return;
      }

      var chunks = [];
      var finished = false;
      var timeout = setTimeout(function () {
        if (!finished) {
          finished = true;
          try { ws.close(); } catch (e) {}
          reject(new Error("Timeout"));
        }
      }, 25000);

      ws.onopen = function () {
        try {
          // Config
          ws.send(
            "Content-Type:application/json; charset=utf-8\r\n" +
            "Path:speech.config\r\n\r\n" +
            '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":false},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}'
          );

          // SSML
          var rateStr = (ratePercent >= 0 ? "+" : "") + ratePercent + "%";
          var pitchStr = (pitchHz >= 0 ? "+" : "") + pitchHz + "Hz";
          var ssml =
            '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">' +
            '<voice name="' + voiceId + '">' +
            '<prosody pitch="' + pitchStr + '" rate="' + rateStr + '">' +
            escapeXml(text) +
            '</prosody></voice></speak>';

          ws.send(
            "X-RequestId:" + connId + "\r\n" +
            "Content-Type:application/ssml+xml\r\n" +
            "X-Timestamp:" + new Date().toISOString() + "Z\r\n" +
            "Path:ssml\r\n\r\n" +
            ssml
          );
        } catch (e) {
          finished = true;
          clearTimeout(timeout);
          try { ws.close(); } catch (e2) {}
          reject(e);
        }
      };

      ws.onmessage = function (e) {
        if (typeof e.data === "string") {
          if (e.data.indexOf("Path:turn.end") !== -1) {
            if (!finished) {
              finished = true;
              clearTimeout(timeout);
              try { ws.close(); } catch (e2) {}

              if (chunks.length === 0) {
                reject(new Error("No audio received"));
                return;
              }

              var total = 0;
              chunks.forEach(function (c) { total += c.byteLength; });
              var combined = new Uint8Array(total);
              var offset = 0;
              chunks.forEach(function (c) {
                combined.set(new Uint8Array(c), offset);
                offset += c.byteLength;
              });

              var blob = new Blob([combined], { type: "audio/mpeg" });
              resolve(blob);
            }
          }
          return;
        }

        // Binary audio chunk
        var reader = new FileReader();
        reader.onload = function () {
          var buf = reader.result;
          if (buf.byteLength < 2) return;
          var view = new DataView(buf);
          var headerLen = view.getUint16(0);
          var audioStart = 2 + headerLen;
          if (audioStart >= buf.byteLength) return;
          var audioData = buf.slice(audioStart);
          if (audioData.byteLength > 0) chunks.push(audioData);
        };
        reader.readAsArrayBuffer(e.data);
      };

      ws.onerror = function () {
        if (!finished) {
          finished = true;
          clearTimeout(timeout);
          reject(new Error("WebSocket error"));
        }
      };

      ws.onclose = function () {
        if (!finished) {
          finished = true;
          clearTimeout(timeout);
          reject(new Error("Connection closed"));
        }
      };
    });
  }

  /* ---------- Player UI ---------- */
  function setStatus(text) { statusEl.textContent = text; }
  function setWave(mode) {
    waveEl.classList.remove("is-playing", "is-loading");
    if (mode === "playing") waveEl.classList.add("is-playing");
    else if (mode === "loading") waveEl.classList.add("is-loading");
  }
  function setButtons(state) {
    if (state === "idle") {
      playBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
      dlBtn.disabled = !state.audioBlobUrl;
      pauseBtn.innerHTML = '<svg class="tts-i"><use href="#tts-i-pause"/></svg>';
    } else if (state === "loading") {
      playBtn.disabled = true;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
      dlBtn.disabled = true;
    } else if (state === "speaking") {
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      dlBtn.disabled = false;
      pauseBtn.innerHTML = '<svg class="tts-i"><use href="#tts-i-pause"/></svg>';
    } else if (state === "paused") {
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      dlBtn.disabled = false;
      pauseBtn.innerHTML = '<svg class="tts-i"><use href="#tts-i-play"/></svg>';
    }
  }

  /* ---------- Browser TTS fallback ---------- */
  function speakWithBrowser(text, lang) {
    if (typeof window.speechSynthesis === "undefined") {
      showToast("⚠ কোনো ভয়েস পাওয়া যায়নি");
      return;
    }

    var synth = window.speechSynthesis;
    var voices = synth.getVoices();
    if (!voices.length) {
      showToast("⚠ কোনো ভয়েস পাওয়া যায়নি");
      return;
    }

    var langLower = (lang || "en").toLowerCase();
    var langPrefix = langLower.split("-")[0];

    var browserVoice = voices.find(function (v) { return v.lang && v.lang.toLowerCase() === langLower; })
                    || voices.find(function (v) { return v.lang && v.lang.toLowerCase().indexOf(langPrefix) === 0; })
                    || voices[0];

    var u = new SpeechSynthesisUtterance(text);
    if (browserVoice) {
      u.voice = browserVoice;
      u.lang = browserVoice.lang;
    }
    u.rate = parseFloat(rateInput.value);
    u.pitch = parseFloat(pitchInput.value);
    u.volume = parseFloat(volInput.value);

    u.onstart = function () {
      setStatus("চলছে (browser voice) 🔊");
      setButtons("speaking");
      setWave("playing");
    };
    u.onend = function () {
      setStatus("সম্পন্ন ✓");
      setButtons("idle");
      setWave(null);
    };
    u.onerror = function () {
      setStatus("ত্রুটি হয়েছে");
      setButtons("idle");
      setWave(null);
    };

    synth.speak(u);
    setStatus("চলছে (browser voice) 🔊");
    setButtons("speaking");
    setWave("playing");
  }

  /* ---------- Stop ---------- */
  function stopTTS() {
    if (state.audio) {
      try {
        state.audio.pause();
        state.audio.currentTime = 0;
      } catch (e) {}
    }
    if (typeof window.speechSynthesis !== "undefined") {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    state.isPlaying = false;
    state.isPaused = false;
    state.isSynthesizing = false;
    setStatus("প্রস্তুত — প্লে বাটনে ক্লিক করুন");
    setButtons("idle");
    setWave(null);
  }

  /* ---------- Pause ---------- */
  function pauseTTS() {
    if (typeof window.speechSynthesis !== "undefined" && window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        state.isPaused = false;
        setStatus("চলছে... 🔊");
        setButtons("speaking");
        setWave("playing");
      } else {
        window.speechSynthesis.pause();
        state.isPaused = true;
        setStatus("বিরত ⏸");
        setButtons("paused");
        setWave(null);
      }
      return;
    }

    if (state.audio) {
      if (state.isPaused) {
        state.audio.play();
        state.isPaused = false;
        setStatus("চলছে... 🔊");
        setButtons("speaking");
        setWave("playing");
      } else if (state.isPlaying) {
        state.audio.pause();
        state.isPaused = true;
        setStatus("বিরত ⏸");
        setButtons("paused");
        setWave(null);
      }
    }
  }

  /* ---------- Synthesize & Play ---------- */
  function synthesizeAndPlay(text, voiceId) {
    var rate = parseFloat(rateInput.value);
    var pitch = parseFloat(pitchInput.value);
    var volume = parseFloat(volInput.value);

    var ratePercent = Math.round((rate - 1) * 100);
    var pitchHz = Math.round((pitch - 1) * 100);

    state.isSynthesizing = true;
    setStatus("ভয়েস তৈরি হচ্ছে... ⚡");
    setButtons("loading");
    setWave("loading");

    edgeTTS(text, voiceId, ratePercent, pitchHz).then(function (blob) {
      state.isSynthesizing = false;

      if (state.audioBlobUrl) URL.revokeObjectURL(state.audioBlobUrl);
      state.audioBlobUrl = URL.createObjectURL(blob);
      state.audio = new Audio(state.audioBlobUrl);
      state.audio.volume = volume;

      state.audio.onplay = function () {
        state.isPlaying = true;
        state.isPaused = false;
        setStatus("চলছে... 🔊");
        setButtons("speaking");
        setWave("playing");
      };
      state.audio.onended = function () {
        state.isPlaying = false;
        state.isPaused = false;
        setStatus("সম্পন্ন ✓");
        setButtons("idle");
        setWave(null);
      };
      state.audio.onerror = function () {
        state.isPlaying = false;
        setStatus("অডিও এরর");
        setButtons("idle");
        setWave(null);
      };

      state.audio.play().catch(function (err) {
        console.error("Play error:", err);
        setStatus("ব্রাউজার অটো-প্লে ব্লক করেছে");
        setButtons("idle");
        setWave(null);
        showToast("⚠ প্লে বাটনে আবার ক্লিক করুন");
      });

      dlBtn.disabled = false;
    }).catch(function (err) {
      state.isSynthesizing = false;
      console.error("[Edge TTS]", err);
      showToast("⚠ Neural ব্যর্থ — browser voice ব্যবহার করছি");
      // Extract language from voiceId (e.g., "bn-BD-NabanitaNeural" -> "bn-BD")
      var lang = voiceId ? voiceId.split("-").slice(0, 2).join("-") : "en-US";
      speakWithBrowser(text, lang);
    });
  }

  /* ---------- Play button ---------- */
  playBtn.addEventListener("click", function () {
    var text = input.value.trim();
    if (!text) {
      showToast("⚠ প্রথমে কিছু লিখুন");
      input.focus();
      return;
    }

    if (text.length > 5000) {
      showToast("⚠ ৫০০০ অক্ষরের বেশি টেক্সট কাজ নাও করতে পারে");
    }

    var voiceId = voiceSel.value;
    if (!voiceId) {
      showToast("⚠ প্রথমে ভয়েস বেছে নিন");
      return;
    }

    // If paused → resume
    if (state.audio && state.isPaused) {
      state.audio.play();
      state.isPaused = false;
      setStatus("চলছে... 🔊");
      setButtons("speaking");
      setWave("playing");
      return;
    }

    // If already playing → stop and re-synthesize
    stopTTS();

    synthesizeAndPlay(text, voiceId);
  });

  /* ---------- Preview ---------- */
  if (previewBtn) {
    previewBtn.addEventListener("click", function () {
      var voiceId = voiceSel.value;
      if (!voiceId) {
        showToast("⚠ প্রথমে ভয়েস বেছে নিন");
        return;
      }
      stopTTS();
      var sample = voiceId.indexOf("bn") === 0
        ? "আসসালামু আলাইকুম। আমি বাংলায় কথা বলতে পারি।"
        : voiceId.indexOf("hi") === 0
        ? "नमस्ते। मैं हिंदी में बोल सकता हूँ।"
        : voiceId.indexOf("ar") === 0
        ? "السلام عليكم. أنا أتحدث العربية."
        : "Hello! This is a sample of my voice.";
      showToast("🔊 প্রিভিউ তৈরি হচ্ছে…");
      synthesizeAndPlay(sample, voiceId);
    });
  }

  /* ---------- Pause / Stop ---------- */
  pauseBtn.addEventListener("click", pauseTTS);
  stopBtn.addEventListener("click", stopTTS);

  /* ---------- Download MP3 ---------- */
  dlBtn.addEventListener("click", function () {
    if (!state.audioBlobUrl) {
      showToast("⚠ প্রথমে ভয়েস তৈরি করুন");
      return;
    }
    var a = document.createElement("a");
    a.href = state.audioBlobUrl;
    a.download = "tts-" + Date.now() + ".mp3";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("✓ MP3 ডাউনলোড শুরু হয়েছে");
  });

  /* ---------- Init ---------- */
  populateVoices();
  setButtons("idle");
  setWave(null);

})();
