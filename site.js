/* =========================================================
   Shared site script: builds the navigation bar (and the tool
   cards on the main page) from the one list below.

   To add a new tool, add an item to a menu here — it shows up in
   the dropdown and on the main page automatically. To add a whole
   new dropdown, add another object to `menus`.
   ========================================================= */

(function () {
  "use strict";

  const SITE = {
    name: "Snejpen.men",
    home: "index.html",
    menus: [
      {
        label: "Tools",
        items: [
          {
            label: "Random name selector",
            href: "random-name-selector.html",
            icon: "🎡",
            description: "Collect names from a Twitch chat, then spin a wheel to pick one at random."
          },
          {
            label: "Coin flip",
            href: "coin-flip.html",
            icon: "🪙",
            description: "Flip a coin and keep a running score of heads and tails."
          },
          {
            label: "Wheel spin",
            href: "wheel-spin.html",
            icon: "🎯",
            description: "Type your own options, one per line, and spin the wheel. Your list is saved for next time."
          }
        ]
      },
      {
        label: "Scripts",
        items: [
          {
            label: "Close WoW script",
            href: "scripts/CloseWowScript.ps1",
            download: "CloseWowScript.ps1",   // makes the browser save the file instead of opening it
            icon: "📜",
            description: "PowerShell script that asks which WoW version and what min/max interval to use, then force-closes the game at random times in that range, on repeat."
          }
        ]
      },
      {
        label: "Themes",
        hidden: true,    // nav bar only: not listed on the main page
        corner: true,    // sits in the far right corner of the bar
        items: [
          { label: "Toggle default theme", href: "#", icon: "🌑", action: "theme", theme: "default" },
          { label: "Toggle Livx theme", href: "#", icon: "💖", action: "theme", theme: "livx" },
          { label: "Toggle Buttsoap theme", href: "#", icon: "🍔", action: "theme", theme: "buttsoap" }
        ]
      }
    ]
  };

  function currentFile() {
    const last = location.pathname.split("/").pop();
    return last || SITE.home;
  }

  function el(tag, props, children) {
    const node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "text") node.textContent = props[k];
      else if (k === "class") node.className = props[k];
      else node.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  /* ---------- navigation bar ---------- */

  function buildNav() {
    const mount = document.getElementById("site-nav");
    if (!mount) return;

    const here = currentFile();
    const canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;

    const brand = el("a", { class: "brand", href: SITE.home, text: SITE.name });
    if (here === SITE.home) brand.setAttribute("aria-current", "page");

    const menuList = el("ul", { class: "nav-menus" });
    const cornerMount = el("ul", { class: "nav-menus nav-corner" });
    const menuNodes = [];

    function closeAll(except) {
      menuNodes.forEach(function (m) {
        if (m !== except) setOpen(m, false);
      });
    }

    function setOpen(menuNode, open) {
      menuNode.classList.toggle("open", open);
      menuNode.querySelector(".nav-trigger").setAttribute("aria-expanded", String(open));
    }

    SITE.menus.forEach(function (menu) {
      const trigger = el("button", {
        class: "nav-trigger",
        type: "button",
        "aria-haspopup": "true",
        "aria-expanded": "false",
        text: menu.label
      });

      const dropdown = el("ul", { class: "nav-dropdown" });
      let isActive = false;

      menu.items.forEach(function (item) {
        const link = el("a", { href: item.href }, [
          el("span", { class: "icon", "data-icon": item.icon || "", text: item.icon || "" }),
          el("span", { text: item.label })
        ]);
        if (item.action === "theme") {
          link.setAttribute("data-theme", item.theme);
          link.appendChild(el("span", { class: "nav-badge theme-check", "aria-hidden": "true", text: "✓" }));
          link.addEventListener("click", function (e) {
            e.preventDefault();
            closeAll(null);
            // choosing the theme that's already on flips back to default
            setTheme(item.theme !== "default" && currentTheme() === item.theme ? "default" : item.theme);
          });
        }
        if (item.download) {
          link.setAttribute("download", item.download);
          link.appendChild(el("span", { class: "nav-badge", "aria-hidden": "true", text: "↓" }));
          // a download doesn't leave the page, so close the menu ourselves
          link.addEventListener("click", function () { closeAll(null); });
        }
        if (item.href === here && !item.action) {
          link.setAttribute("aria-current", "page");
          isActive = true;
        }
        dropdown.appendChild(el("li", {}, [link]));
      });

      const node = el("li", { class: "nav-menu" + (isActive ? " active" : "") }, [trigger, dropdown]);
      menuNodes.push(node);
      if (menu.corner) {
        node.classList.add("corner");
        cornerMount.appendChild(node);
      } else {
        menuList.appendChild(node);
      }

      // click / tap (and Enter or Space for keyboard users)
      trigger.addEventListener("click", function () {
        const willOpen = canHover ? true : !node.classList.contains("open");
        closeAll(node);
        setOpen(node, willOpen);
      });

      // mouse users can just hover
      if (canHover) {
        node.addEventListener("mouseenter", function () { closeAll(node); setOpen(node, true); });
        node.addEventListener("mouseleave", function () { setOpen(node, false); });
      }

      // keyboard: arrows move through the items, Escape closes
      node.addEventListener("keydown", function (e) {
        const links = Array.prototype.slice.call(dropdown.querySelectorAll("a"));
        const idx = links.indexOf(document.activeElement);

        if (e.key === "Escape") {
          setOpen(node, false);
          trigger.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(node, true);
          (links[idx + 1] || links[0]).focus();
        } else if (e.key === "ArrowUp" && idx !== -1) {
          e.preventDefault();
          (links[idx - 1] || links[links.length - 1]).focus();
        }
      });
    });

    // clicking anywhere else closes any open menu
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-menu")) closeAll(null);
    });

    mount.className = "site-nav";
    mount.appendChild(el("div", { class: "nav-inner" }, [brand, menuList]));
    mount.appendChild(cornerMount);
  }

  /* ---------- tool cards on the main page ---------- */

  function buildToolGrid() {
    const mount = document.getElementById("tool-sections");
    if (!mount) return;

    SITE.menus.forEach(function (menu) {
      if (menu.hidden) return;
      const cards = menu.items.filter(function (i) { return i.description; }).map(function (item) {
        const card = el("a", { class: "tool-card", href: item.href }, [
          el("div", { class: "tool-icon icon", "data-icon": item.icon || "", text: item.icon || "" }),
          el("h3", { text: item.label }),
          el("p", { text: item.description })
        ]);
        if (item.download) {
          card.setAttribute("download", item.download);
          card.appendChild(el("span", { class: "tool-tag", text: "↓ Download" }));
        }
        return card;
      });
      if (!cards.length) return;
      mount.appendChild(el("h2", { class: "section-title", text: menu.label }));
      mount.appendChild(el("div", { class: "tool-grid" }, cards));
    });
  }

  /* ---------- themes ----------
     The choice is remembered (localStorage), so it stays on for every page and
     after a refresh. To add a theme: add an entry here, a `body.<name>` colour block
     in site.css, and an item in the Themes menu above.
       art   = picture shown on both sides of every page
       ratio = picture width / height (keeps the menus clear of the pictures)
       icons = replaces every icon on the page with this emoji                     */

  const THEME_KEY = "snejpenTheme";
  const THEMES = {
    "default":  {},
    "livx":     { art: "Features/livx.webp",     ratio: 0.763, cap: "38vw" },
    "buttsoap": { art: "Features/buttsoap.webp", ratio: 1.266, cap: "21vw", icons: "🍔" }
  };

  function currentTheme() {
    const cls = document.body.classList;
    return cls.contains("livx") ? "livx" : cls.contains("buttsoap") ? "buttsoap" : "default";
  }

  function paintTheme(theme) {
    if (!THEMES[theme]) theme = "default";
    const t = THEMES[theme];
    const body = document.body;
    Object.keys(THEMES).forEach(function (name) { body.classList.toggle(name, name === theme); });
    body.classList.toggle("has-art", !!t.art);
    if (t.art) { body.style.setProperty("--art-ratio", t.ratio); body.style.setProperty("--art-cap", t.cap); }
    else { body.style.removeProperty("--art-ratio"); body.style.removeProperty("--art-cap"); }

    document.querySelectorAll(".theme-side").forEach(function (img) { img.remove(); });
    if (t.art) {
      ["left", "right"].forEach(function (side) {
        body.appendChild(el("img", { class: "theme-side " + side, src: t.art, alt: "", draggable: "false" }));
      });
    }

    document.querySelectorAll(".icon").forEach(function (node) {
      node.textContent = t.icons || node.getAttribute("data-icon");
    });

    // front page only, and only while no theme is picked: a little nudge toward the Themes menu
    const hint = document.getElementById("theme-hint");
    if (hint) hint.hidden = theme !== "default";

    document.querySelectorAll("[data-theme]").forEach(function (a) {
      const selected = a.getAttribute("data-theme") === theme;
      a.classList.toggle("selected", selected);
      if (selected) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }

  function setTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (err) {}
    try { window.name = THEME_KEY + "=" + theme; } catch (err) {}   // fallback for browsers that isolate local files
    paintTheme(theme);
  }

  /* ---------- wheel sounds (Buttsoap theme only) ----------
     Pages call SiteAudio.spin() when a spin starts and SiteAudio.win() when it lands.
     Nothing plays unless the Buttsoap theme is on and "Use audio" is ticked. */

  const AUDIO_KEY = "snejpenUseAudio";
  const SiteAudio = (function () {
    let enabled = false;
    try { enabled = localStorage.getItem(AUDIO_KEY) === "1"; } catch (err) {}
    const VOLUME_KEY = "snejpenAudioVolume";
    let volume = 0.4;                         // 0..1, set by the slider (starts at 40%)
    try {
      const saved = parseFloat(localStorage.getItem(VOLUME_KEY));
      if (saved >= 0 && saved <= 1) volume = saved;
    } catch (err) {}
    let spinSound = null, winSound = null, fadeTimer = null;

    function active() { return enabled && document.body.classList.contains("buttsoap"); }
    function load(path) { const a = new Audio(path); a.preload = "auto"; a.volume = volume; return a; }

    function stopSpin() {
      if (!spinSound) return;
      clearInterval(fadeTimer);
      const snd = spinSound;
      let v = snd.volume;
      fadeTimer = setInterval(function () {      // quick fade so the sound doesn't cut off with a click
        v -= 0.14;
        if (v <= 0) { clearInterval(fadeTimer); snd.pause(); snd.currentTime = 0; snd.volume = volume; }
        else snd.volume = v;
      }, 25);
    }

    return {
      mount: function (container) {
        if (!container) return;
        const box = el("input", { type: "checkbox", id: "useAudioToggle" });
        box.checked = enabled;
        box.addEventListener("change", function () {
          enabled = box.checked;
          try { localStorage.setItem(AUDIO_KEY, enabled ? "1" : "0"); } catch (err) {}
          if (!enabled) { if (spinSound) { spinSound.pause(); spinSound.currentTime = 0; } }
          else { spinSound = spinSound || load("Sounds/HamburgerSpin.mp3"); winSound = winSound || load("Sounds/HamburgerWin.mp3"); }
        });
        const slider = el("input", { type: "range", class: "audio-volume", min: "0", max: "100", step: "1", "aria-label": "Audio volume" });
        slider.value = Math.round(volume * 100);
        slider.title = "Volume " + slider.value + "%";
        slider.hidden = !enabled;                 // only shown while audio is on
        slider.addEventListener("input", function () {
          volume = slider.value / 100;
          slider.title = "Volume " + slider.value + "%";
          try { localStorage.setItem(VOLUME_KEY, String(volume)); } catch (err) {}
          if (spinSound) spinSound.volume = volume;   // changes what's playing right now, too
          if (winSound) winSound.volume = volume;
        });
        box.addEventListener("change", function () { slider.hidden = !box.checked; });
        container.className = "audio-toggle";
        container.appendChild(el("label", {}, [box, el("span", { text: "Use audio" })]));
        container.appendChild(slider);
      },
      spin: function () {
        if (!active()) return;
        clearInterval(fadeTimer);
        spinSound = spinSound || load("Sounds/HamburgerSpin.mp3");
        spinSound.volume = volume;
        spinSound.currentTime = 0;
        const p = spinSound.play(); if (p && p.catch) p.catch(function () {});
      },
      win: function () {
        if (!active()) return;
        stopSpin();
        winSound = winSound || load("Sounds/HamburgerWin.mp3");
        winSound.volume = volume;
        winSound.currentTime = 0;
        const p = winSound.play(); if (p && p.catch) p.catch(function () {});
      }
    };
  })();
  window.SiteAudio = SiteAudio;

  function buildThemeHint() {
    if (currentFile() !== SITE.home || !document.querySelector(".nav-corner")) return;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 60 44");
    svg.setAttribute("width", "54");
    svg.setAttribute("height", "40");
    svg.setAttribute("aria-hidden", "true");
    const curve = document.createElementNS(svgNS, "path");
    // a loop-free swoosh from the lower left that curls up toward the top right, ending in an arrowhead
    curve.setAttribute("d", "M4 38 C 14 40, 40 36, 48 10");
    curve.setAttribute("class", "curve");
    const head = document.createElementNS(svgNS, "path");
    head.setAttribute("d", "M39 17 L48 6 L54 19");
    head.setAttribute("class", "curve");
    svg.appendChild(curve);
    svg.appendChild(head);
    const hint = el("div", { id: "theme-hint", class: "theme-hint" }, [
      el("span", { class: "hint-text", text: "check out our themes" })
    ]);
    hint.appendChild(svg);
    document.body.appendChild(hint);
  }

  buildNav();
  buildToolGrid();
  buildThemeHint();

  let saved = "default";
  try { saved = localStorage.getItem(THEME_KEY) || ""; } catch (err) {}
  if (!saved && String(window.name).indexOf(THEME_KEY + "=") === 0) saved = String(window.name).split("=")[1];
  paintTheme(saved);
})();
