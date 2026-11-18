const initSkyGardenAmbience = () => {
  let defs = null;
  let skyLayer = null;
  let gardenLayer = null;
  const SKY_LAYER_ID = "sky-clouds";
  const GARDEN_LAYER_ID = "garden-ambient";
  const SKY_FILTER_IDS = {
    back: "sky-cloud-filter-back",
    mid: "sky-cloud-filter-mid",
    front: "sky-cloud-filter-front",
  };

  const ensureDefs = () => {
    if (defs && defs.parentElement) return defs;
    defs = document.getElementById("theme-svg-defs");
    if (defs) return defs;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "theme-svg-defs");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.overflow = "hidden";
    svg.innerHTML = `
      <defs>
        <filter id="${SKY_FILTER_IDS.back}" x="-120%" y="-120%" width="340%" height="340%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0068" numOctaves="5" seed="18" result="cloudNoiseBack" />
          <feDisplacementMap in="SourceGraphic" in2="cloudNoiseBack" scale="132" xChannelSelector="R" yChannelSelector="G" result="cloudWarpBack" />
          <feGaussianBlur in="cloudWarpBack" stdDeviation="1.4" result="cloudSoftBack" />
          <feBlend in="SourceGraphic" in2="cloudSoftBack" mode="screen" />
        </filter>
        <filter id="${SKY_FILTER_IDS.mid}" x="-120%" y="-120%" width="340%" height="340%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0078" numOctaves="4" seed="24" result="cloudNoiseMid" />
          <feDisplacementMap in="SourceGraphic" in2="cloudNoiseMid" scale="102" xChannelSelector="R" yChannelSelector="G" result="cloudWarpMid" />
          <feGaussianBlur in="cloudWarpMid" stdDeviation="1.05" result="cloudSoftMid" />
          <feBlend in="SourceGraphic" in2="cloudSoftMid" mode="screen" />
        </filter>
        <filter id="${SKY_FILTER_IDS.front}" x="-120%" y="-120%" width="340%" height="340%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0092" numOctaves="3" seed="31" result="cloudNoiseFront" />
          <feDisplacementMap in="SourceGraphic" in2="cloudNoiseFront" scale="78" xChannelSelector="R" yChannelSelector="G" result="cloudWarpFront" />
          <feGaussianBlur in="cloudWarpFront" stdDeviation="0.75" result="cloudSoftFront" />
          <feBlend in="SourceGraphic" in2="cloudSoftFront" mode="screen" />
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
    defs = svg;
    return defs;
  };

  const ensureSkyLayer = () => {
    if (skyLayer && skyLayer.parentElement) return skyLayer;
    skyLayer = document.getElementById(SKY_LAYER_ID);
    if (skyLayer) return skyLayer;
    const container = document.createElement("div");
    container.id = SKY_LAYER_ID;
    container.className = "sky-clouds";
    const cloudPresets = [
      { reverse: false, width: 760, height: 236, top: 9, dur: 188, rise: -7, scale: 1.04, opacity: 0.92, delay: -24, srcWidthRatio: 0.84, srcHeightRatio: 0.68 },
      { reverse: true, width: 520, height: 254, top: 19, dur: 214, rise: -10, scale: 0.96, opacity: 0.84, delay: -116, srcWidthRatio: 0.62, srcHeightRatio: 0.9 },
      { reverse: false, width: 880, height: 278, top: 31, dur: 236, rise: -8, scale: 1.14, opacity: 0.8, delay: -72, srcWidthRatio: 0.88, srcHeightRatio: 0.7 },
      { reverse: true, width: 430, height: 212, top: 45, dur: 202, rise: -6, scale: 0.88, opacity: 0.76, delay: -148, srcWidthRatio: 0.58, srcHeightRatio: 0.84 },
      { reverse: false, width: 610, height: 170, top: 58, dur: 248, rise: -5, scale: 0.82, opacity: 0.7, delay: -196, srcWidthRatio: 0.9, srcHeightRatio: 0.58 },
      { reverse: true, width: 700, height: 304, top: 67, dur: 226, rise: -9, scale: 1.08, opacity: 0.68, delay: -38, srcWidthRatio: 0.74, srcHeightRatio: 0.92 },
    ];
    cloudPresets.forEach((preset, i) => {
      const cloud = document.createElement("div");
      cloud.className = `sky-cloud${preset.reverse ? " sky-cloud--reverse" : ""}`;
      cloud.style.setProperty("--cloud-seed", `${i + 1}`);
      cloud.style.top = `${preset.top}vh`;
      cloud.style.setProperty("--cloud-width", `${preset.width}px`);
      cloud.style.setProperty("--cloud-height", `${preset.height}px`);
      cloud.style.setProperty("--cloud-src-width-ratio", `${preset.srcWidthRatio || 0.7}`);
      cloud.style.setProperty("--cloud-src-height-ratio", `${preset.srcHeightRatio || 0.78}`);
      cloud.style.setProperty("--cloud-dur", `${preset.dur}s`);
      cloud.style.setProperty("--cloud-rise", `${preset.rise}px`);
      cloud.style.setProperty("--cloud-scale", `${preset.scale}`);
      cloud.style.opacity = `${preset.opacity}`;
      cloud.style.animationDelay = `${preset.delay}s`;
      ["back", "mid", "front"].forEach((layerName) => {
        const layer = document.createElement("span");
        layer.className = `sky-cloud__layer sky-cloud__layer--${layerName}`;
        cloud.appendChild(layer);
      });
      container.appendChild(cloud);
    });
    document.body.appendChild(container);
    skyLayer = container;
    return skyLayer;
  };

  const ensureGardenLayer = () => {
    if (gardenLayer && gardenLayer.parentElement) return gardenLayer;
    gardenLayer = document.getElementById(GARDEN_LAYER_ID);
    if (gardenLayer) return gardenLayer;

    const container = document.createElement("div");
    container.id = GARDEN_LAYER_ID;
    container.className = "garden-ambient";

    const blooms = [
      { cls: "garden-ambient__bloom garden-ambient__bloom--canopy", style: { left: "-12vw", top: "-10vh", width: "50vw", height: "34vh" } },
      { cls: "garden-ambient__bloom garden-ambient__bloom--mist", style: { right: "-14vw", top: "2vh", width: "40vw", height: "30vh" } },
      { cls: "garden-ambient__bloom garden-ambient__bloom--floor", style: { left: "14vw", bottom: "-14vh", width: "60vw", height: "38vh" } },
    ];
    blooms.forEach(({ cls, style }) => {
      const bloom = document.createElement("span");
      bloom.className = cls;
      Object.entries(style).forEach(([key, value]) => {
        bloom.style[key] = value;
      });
      container.appendChild(bloom);
    });

    const beams = [
      { left: "17%", top: "-10vh", width: "10.5vw", height: "88vh", rotate: "-33deg", opacity: "0.22", blur: "17px", dur: "20s", delay: "-8s" },
      { left: "30%", top: "-9vh", width: "6vw", height: "96vh", rotate: "-23deg", opacity: "0.42", blur: "15px", dur: "18s", delay: "-3s", primary: true },
      { left: "49%", top: "-10vh", width: "6vw", height: "94vh", rotate: "-8deg", opacity: "0.5", blur: "16px", dur: "22s", delay: "-12s", primary: true },
      { left: "70%", top: "-9vh", width: "6vw", height: "92vh", rotate: "11deg", opacity: "0.38", blur: "15px", dur: "19s", delay: "-5s", primary: true },
      { left: "84%", top: "-8vh", width: "10vw", height: "84vh", rotate: "23deg", opacity: "0.2", blur: "17px", dur: "24s", delay: "-15s" },
      { left: "7%", top: "-8vh", width: "13vw", height: "92vh", rotate: "-43deg", opacity: "0.16", blur: "22px", dur: "28s", delay: "-17s", shadow: true },
    ];
    beams.forEach((preset) => {
      const beam = document.createElement("span");
      beam.className = `garden-ambient__beam${preset.primary ? " garden-ambient__beam--primary" : ""}${preset.shadow ? " garden-ambient__beam--shadow" : ""}`;
      beam.style.left = preset.left;
      beam.style.top = preset.top;
      beam.style.width = preset.width;
      beam.style.height = preset.height;
      beam.style.setProperty("--garden-beam-rotate", preset.rotate);
      beam.style.setProperty("--garden-beam-opacity", preset.opacity);
      beam.style.setProperty("--garden-beam-blur", preset.blur);
      beam.style.setProperty("--garden-beam-dur", preset.dur);
      beam.style.setProperty("--garden-beam-delay", preset.delay);
      container.appendChild(beam);
    });

    const spotlight = document.createElement("span");
    spotlight.className = "garden-ambient__spotlight";
    container.appendChild(spotlight);

    const leaves = [
      { left: "-3vw", top: "12vh", width: "18vw", height: "24vh", rotate: "-26deg", delay: "-6s", alpha: "0.18" },
      { right: "-2vw", top: "22vh", width: "14vw", height: "21vh", rotate: "24deg", delay: "-14s", alpha: "0.16" },
      { left: "4vw", bottom: "6vh", width: "16vw", height: "20vh", rotate: "-18deg", delay: "-10s", alpha: "0.16" },
      { right: "6vw", bottom: "10vh", width: "13vw", height: "18vh", rotate: "16deg", delay: "-18s", alpha: "0.14" },
    ];
    leaves.forEach((preset) => {
      const leaf = document.createElement("span");
      leaf.className = "garden-ambient__leaf";
      if (preset.left) leaf.style.left = preset.left;
      if (preset.right) leaf.style.right = preset.right;
      if (preset.top) leaf.style.top = preset.top;
      if (preset.bottom) leaf.style.bottom = preset.bottom;
      leaf.style.width = preset.width;
      leaf.style.height = preset.height;
      leaf.style.setProperty("--garden-leaf-rotate", preset.rotate);
      leaf.style.setProperty("--garden-leaf-delay", preset.delay);
      leaf.style.setProperty("--garden-leaf-alpha", preset.alpha);
      container.appendChild(leaf);
    });

    const flowerClusters = [
      {
        side: "left",
        left: "-2vw",
        bottom: "-2vh",
        scale: "0.82",
        opacity: "0.42",
        branches: [
          { left: "2vw", bottom: "1vh", width: "5vw", height: "28vh", rotate: "-6deg", delay: "-4s", alpha: "0.52", kind: "trunk" },
          { left: "4vw", bottom: "8vh", width: "8vw", height: "12px", rotate: "-58deg", delay: "-9s", alpha: "0.42" },
          { left: "4vw", bottom: "10vh", width: "12vw", height: "10px", rotate: "-28deg", delay: "-6s", alpha: "0.34" },
          { left: "5vw", bottom: "9vh", width: "15vw", height: "9px", rotate: "-12deg", delay: "-12s", alpha: "0.3" },
        ],
        flowers: [
          { left: "2vw", bottom: "0vh", size: "116px", delay: "-5.2s", tilt: "-12deg" },
          { left: "10vw", bottom: "6vh", size: "92px", delay: "-9.5s", tilt: "10deg" },
        ],
      },
      {
        side: "right",
        right: "-1vw",
        bottom: "-1vh",
        scale: "0.8",
        opacity: "0.4",
        branches: [
          { right: "2vw", bottom: "1vh", width: "5vw", height: "27vh", rotate: "6deg", delay: "-5s", alpha: "0.5", kind: "trunk" },
          { right: "4vw", bottom: "8vh", width: "8vw", height: "12px", rotate: "58deg", delay: "-10s", alpha: "0.4" },
          { right: "4vw", bottom: "10vh", width: "12vw", height: "10px", rotate: "28deg", delay: "-7s", alpha: "0.32" },
          { right: "5vw", bottom: "9vh", width: "15vw", height: "9px", rotate: "12deg", delay: "-13s", alpha: "0.28" },
        ],
        flowers: [
          { right: "1vw", bottom: "1vh", size: "108px", delay: "-7.8s", tilt: "12deg" },
          { right: "10vw", bottom: "7vh", size: "90px", delay: "-11.6s", tilt: "-9deg" },
        ],
      },
    ];
    const flowerPalettes = [
      "garden-ambient__flower--ivory",
      "garden-ambient__flower--spring",
      "garden-ambient__flower--golden",
      "garden-ambient__flower--ruby",
      "garden-ambient__flower--sky",
    ];
    flowerClusters.forEach((clusterPreset) => {
      const cluster = document.createElement("div");
      cluster.className = `garden-ambient__cluster garden-ambient__cluster--${clusterPreset.side}`;
      if (clusterPreset.left) cluster.style.left = clusterPreset.left;
      if (clusterPreset.right) cluster.style.right = clusterPreset.right;
      cluster.style.bottom = clusterPreset.bottom;
      cluster.style.setProperty("--garden-cluster-scale", clusterPreset.scale);

      clusterPreset.flowers.forEach((flowerPreset, flowerIndex) => {
        const flower = document.createElement("div");
        const paletteClass = flowerPalettes[(flowerIndex + (clusterPreset.side === "right" ? 1 : 0)) % flowerPalettes.length];
        flower.className = `garden-ambient__flower ${paletteClass}`;
        if (flowerPreset.left) flower.style.left = flowerPreset.left;
        if (flowerPreset.right) flower.style.right = flowerPreset.right;
        flower.style.bottom = flowerPreset.bottom;
        flower.style.width = flowerPreset.size;
        flower.style.height = flowerPreset.size;
        flower.style.setProperty("--garden-flower-delay", flowerPreset.delay);
        flower.style.setProperty("--garden-flower-tilt", flowerPreset.tilt);
        flower.style.setProperty("--garden-flower-index", `${flowerIndex}`);
        flower.style.setProperty("--garden-flower-opacity", clusterPreset.opacity);
        const flowerSize = parseInt(flowerPreset.size, 10);
        const curveDirection = clusterPreset.side === "left" ? -1 : 1;
        const stemCurve = curveDirection * (16 + flowerIndex * 6);

        const stem = document.createElement("span");
        stem.className = "garden-ambient__flower-stem";
        stem.style.setProperty("--garden-flower-stem-length", `${Math.round(flowerSize * 1.16)}px`);
        stem.style.setProperty("--garden-flower-stem-width", `${Math.max(12, Math.round(flowerSize * 0.12))}px`);
        stem.style.setProperty("--garden-flower-stem-curve", `${stemCurve}deg`);
        stem.style.setProperty("--garden-flower-stem-delay", flowerPreset.delay);
        stem.style.setProperty("--garden-flower-stem-alpha", "1");
        flower.appendChild(stem);

        const stemBranchA = document.createElement("span");
        stemBranchA.className = "garden-ambient__flower-stem-branch";
        stemBranchA.style.setProperty("--garden-flower-branch-top", `${58 + flowerIndex * 8}%`);
        stemBranchA.style.setProperty("--garden-flower-branch-length", `${Math.round(flowerSize * 0.44)}px`);
        stemBranchA.style.setProperty("--garden-flower-branch-rotate", `${curveDirection * -38}deg`);
        stemBranchA.style.setProperty("--garden-flower-branch-alpha", `${0.28 - flowerIndex * 0.03}`);
        flower.appendChild(stemBranchA);

        const stemBranchB = document.createElement("span");
        stemBranchB.className = "garden-ambient__flower-stem-branch garden-ambient__flower-stem-branch--secondary";
        stemBranchB.style.setProperty("--garden-flower-branch-top", `${72 + flowerIndex * 5}%`);
        stemBranchB.style.setProperty("--garden-flower-branch-length", `${Math.round(flowerSize * 0.34)}px`);
        stemBranchB.style.setProperty("--garden-flower-branch-rotate", `${curveDirection * 30}deg`);
        stemBranchB.style.setProperty("--garden-flower-branch-alpha", `${0.22 - flowerIndex * 0.025}`);
        flower.appendChild(stemBranchB);

        const center = document.createElement("span");
        center.className = "garden-ambient__flower-center";
        flower.appendChild(center);

        for (let petalIndex = 0; petalIndex < 6; petalIndex += 1) {
          const petal = document.createElement("span");
          petal.className = "garden-ambient__flower-petal";
          petal.style.setProperty("--garden-flower-petal-rot", `${petalIndex * 60}deg`);
          flower.appendChild(petal);
        }

        cluster.appendChild(flower);
      });

      container.appendChild(cluster);
    });

    const petalRainPresets = [
      { left: "3%", top: "-6%", size: "18px", dur: "15s", delay: "-2s", driftX: "38px", rotateFrom: "-18deg", rotateTo: "120deg", alpha: "0.24" },
      { left: "12%", top: "-2%", size: "16px", dur: "16s", delay: "-11s", driftX: "28px", rotateFrom: "-10deg", rotateTo: "144deg", alpha: "0.22" },
      { left: "24%", top: "-8%", size: "17px", dur: "14s", delay: "-6s", driftX: "34px", rotateFrom: "-22deg", rotateTo: "136deg", alpha: "0.25" },
      { left: "38%", top: "-3%", size: "15px", dur: "17s", delay: "-14s", driftX: "22px", rotateFrom: "-12deg", rotateTo: "152deg", alpha: "0.2" },
      { right: "3%", top: "-4%", size: "18px", dur: "15s", delay: "-3s", driftX: "-40px", rotateFrom: "18deg", rotateTo: "-126deg", alpha: "0.24" },
      { right: "12%", top: "0%", size: "16px", dur: "16s", delay: "-12s", driftX: "-32px", rotateFrom: "10deg", rotateTo: "-146deg", alpha: "0.22" },
      { right: "24%", top: "-7%", size: "17px", dur: "14s", delay: "-8s", driftX: "-36px", rotateFrom: "22deg", rotateTo: "-132deg", alpha: "0.25" },
      { right: "38%", top: "-1%", size: "15px", dur: "17s", delay: "-15s", driftX: "-24px", rotateFrom: "12deg", rotateTo: "-154deg", alpha: "0.2" },
    ];
    const petalRainPalettes = [
      "garden-ambient__petal-rain--ivory",
      "garden-ambient__petal-rain--spring",
      "garden-ambient__petal-rain--golden",
      "garden-ambient__petal-rain--ruby",
      "garden-ambient__petal-rain--sky",
    ];
    petalRainPresets.forEach((preset) => {
      const petal = document.createElement("span");
      const paletteIndex = (preset.left ? 0 : 1) + (parseInt(String(preset.size), 10) % petalRainPalettes.length);
      petal.className = `garden-ambient__petal-rain ${petalRainPalettes[paletteIndex % petalRainPalettes.length]}`;
      if (preset.left) petal.style.left = preset.left;
      if (preset.right) petal.style.right = preset.right;
      petal.style.top = preset.top;
      petal.style.width = preset.size;
      petal.style.height = `calc(${preset.size} * 1.55)`;
      petal.style.setProperty("--garden-petal-dur", preset.dur);
      petal.style.setProperty("--garden-petal-delay", preset.delay);
      petal.style.setProperty("--garden-petal-drift-x", preset.driftX);
      petal.style.setProperty("--garden-petal-rot-from", preset.rotateFrom);
      petal.style.setProperty("--garden-petal-rot-to", preset.rotateTo);
      petal.style.setProperty("--garden-petal-alpha", preset.alpha);
      container.appendChild(petal);
    });

    document.body.appendChild(container);
    gardenLayer = container;
    return gardenLayer;
  };

  const apply = (theme) => {
    const t = String(theme || "").trim().toLowerCase();
    const motionOff = document.body.classList.contains("theme-motion-off");
    const readingMode = isReadingModeActive();
    const showSky = t === "sky" && !motionOff && !readingMode;
    const showGarden = t === "garden" && !motionOff && !readingMode;

    document.body.classList.toggle("sky-clouds-on", showSky);
    document.body.classList.toggle("garden-ambient-on", showGarden);

    if (showSky) {
      ensureDefs();
      const layer = ensureSkyLayer();
      layer.hidden = false;
    } else if (skyLayer) {
      skyLayer.hidden = true;
    }

    if (showGarden) {
      const layer = ensureGardenLayer();
      layer.hidden = false;
    } else if (gardenLayer) {
      gardenLayer.hidden = true;
    }
  };

  apply(getCurrentTheme());
  window.addEventListener("ludwig-theme-changed", (e) => apply(e && e.detail ? e.detail.theme : ""));
  window.addEventListener("ludwig-theme-motion-changed", () => apply(getCurrentTheme()));
  window.addEventListener("ludwig-reading-mode-changed", () => apply(getCurrentTheme()));
};

initSkyGardenAmbience();

const initMeteorShower = () => {
  if (document.getElementById("meteor-shower")) return;

  const container = document.createElement("div");
  container.id = "meteor-shower";
  container.className = "meteor-shower";

  const starfield = document.createElement("div");
  starfield.id = "starfield";
  starfield.className = "starfield";

  const starsOnlyClass = "galaxy-stars-only-on";

  let intervalId = null;

  const buildStars = () => {
    if (starfield.childElementCount) return;
    const count = 70;
    for (let i = 0; i < count; i += 1) {
      const s = document.createElement("div");
      s.className = "star";
      const size = 1 + Math.random() * 2.4;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const dur = 1400 + Math.random() * 2600;
      const delay = Math.random() * 2200;
      const alpha = 0.55 + Math.random() * 0.4;
      s.style.left = `${left}%`;
      s.style.top = `${top}%`;
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.setProperty("--twinkle-dur", `${dur}ms`);
      s.style.setProperty("--twinkle-delay", `${delay}ms`);
      s.style.setProperty("--star-alpha", `${alpha}`);
      starfield.appendChild(s);
    }
  };

  const startStars = () => {
    buildStars();
    if (!document.body.contains(starfield)) document.body.appendChild(starfield);
  };

  const stopStars = () => {
    if (starfield.parentElement) starfield.remove();
  };

  const spawnMeteor = () => {
    const m = document.createElement("div");
    m.className = "meteor";
    const left = 20 + Math.random() * 100;
    const top = -20 + Math.random() * 70;
    const dur = 1500 + Math.random() * 1400;
    const len = 320 + Math.random() * 280;
    const thickness = 2.4 + Math.random() * 1.2;
    m.style.left = `${left}%`;
    m.style.top = `${top}%`;
    m.style.setProperty("--meteor-dur", `${dur}ms`);
    m.style.setProperty("--meteor-len", `${len}px`);
    m.style.setProperty("--meteor-thickness", `${thickness}px`);
    m.style.setProperty("--meteor-dx", `-920px`);
    m.style.setProperty("--meteor-dy", `920px`);
    container.appendChild(m);
    window.setTimeout(() => m.remove(), dur + 80);
  };

  const startMeteors = () => {
    if (intervalId) return;
    startStars();
    if (!document.body.contains(container)) document.body.appendChild(container);
    document.body.classList.add("galaxy-meteors-on");

    spawnMeteor();
    spawnMeteor();
    intervalId = window.setInterval(() => {
      if (document.hidden) return;
      spawnMeteor();
      if (Math.random() < 0.35) spawnMeteor();
    }, 560);
  };

  const stopMeteors = () => {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    if (container.parentElement) container.remove();
    document.body.classList.remove("galaxy-meteors-on");
  };

  const apply = (theme) => {
    const t = String(theme || "").trim().toLowerCase();
    const motionOff = document.body.classList.contains("theme-motion-off");
    const readingMode = isReadingModeActive();
    if (t === "galaxy" && !motionOff && !readingMode) {
      const path = String(window.location.pathname || "");
      const isNotesDetail = /\/notes\//.test(path) && !path.endsWith("/index.html");
      const isWritingDetail = /\/writing\//.test(path) && !path.endsWith("/index.html");
      const isCanvasDetail = /\/canvas\//.test(path) && !path.endsWith("/index.html");

      document.body.classList.remove(starsOnlyClass);
      if (isNotesDetail || isWritingDetail || isCanvasDetail) {
        stopMeteors();
        startStars();
        document.body.classList.add(starsOnlyClass);
      } else {
        startMeteors();
      }
    } else {
      stopMeteors();
      stopStars();
      document.body.classList.remove(starsOnlyClass);
    }
  };

  apply(getCurrentTheme());
  window.addEventListener("ludwig-theme-changed", (e) => apply(e && e.detail ? e.detail.theme : ""));
  window.addEventListener("ludwig-theme-motion-changed", () => apply(getCurrentTheme()));
  document.addEventListener("visibilitychange", () => apply(getCurrentTheme()));
  window.addEventListener("ludwig-reading-mode-changed", () => apply(getCurrentTheme()));
};

initMeteorShower();

const initDeepSeaBubbles = () => {
  const containerId = "deep-sea-bubbles";
  let container = null;
  let active = false;
  let timerId = null;
  let rafId = null;

  const prefersReducedMotion = () => {
    try {
      return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}
    return false;
  };

  const ensureContainer = () => {
    if (container && document.getElementById(containerId) === container) return container;
    const existing = document.getElementById(containerId);
    if (existing) {
      container = existing;
      return container;
    }
    container = document.createElement("div");
    container.id = containerId;
    container.className = "deep-sea-bubbles";
    document.body.appendChild(container);
    return container;
  };

  const stop = () => {
    active = false;
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    const el = document.getElementById(containerId);
    if (el) el.remove();
  };

  const spawn = () => {
    if (!active) return;
    if (document.hidden) return;
    if (isReadingModeActive()) return;

    const host = ensureContainer();
    const b = document.createElement("div");
    b.className = "deep-sea-bubble";

    const size = 8 + Math.random() * 22;
    const left = Math.random() * 100;
    const alpha = 0.38 + Math.random() * 0.28;
    const drift = -26 + Math.random() * 52;
    const wobble = 6 + Math.random() * 16;
    const rot = 3 + Math.random() * 6;
    const rotSign = Math.random() < 0.5 ? -1 : 1;
    const durBase = prefersReducedMotion() ? 17000 : 10000;
    const dur = durBase + Math.random() * (prefersReducedMotion() ? 12000 : 9000);

    b.style.left = `${left}%`;
    b.style.setProperty("--bubble-size", `${size}px`);
    b.style.setProperty("--bubble-alpha", `${alpha}`);
    b.style.setProperty("--bubble-drift", `${drift}px`);
    b.style.setProperty("--bubble-w1", `${-wobble}px`);
    b.style.setProperty("--bubble-w2", `${wobble}px`);
    b.style.setProperty("--bubble-w3", `${-(wobble * 0.6)}px`);
    b.style.setProperty("--bubble-r1", `${rotSign * -rot}deg`);
    b.style.setProperty("--bubble-r2", `${rotSign * rot}deg`);
    b.style.setProperty("--bubble-r3", `${rotSign * -(rot * 0.6)}deg`);
    b.style.setProperty("--bubble-dur", `${dur}ms`);
    b.style.setProperty("--bubble-blur", `${(Math.random() * 0.7).toFixed(2)}px`);

    b.addEventListener("animationend", () => b.remove());
    host.appendChild(b);
  };

  const loop = () => {
    if (!active) return;
    spawn();
    const gapBase = prefersReducedMotion() ? 1200 : 500;
    const gap = gapBase + Math.random() * (prefersReducedMotion() ? 1600 : 900);
    timerId = window.setTimeout(() => {
      rafId = window.requestAnimationFrame(loop);
    }, gap);
  };

  const start = () => {
    if (active) return;
    active = true;
    ensureContainer();
    loop();
  };

  const apply = (theme) => {
    const t = String(theme || "").trim().toLowerCase();
    const isDeepSea = t === "deep-sea" || t === "galaxy-night";
    const motionOff = document.body.classList.contains("theme-motion-off");
    if (!isDeepSea || motionOff || isReadingModeActive()) stop();
    else start();
  };

  apply(getCurrentTheme());
  window.addEventListener("ludwig-theme-changed", (e) => apply(e && e.detail ? e.detail.theme : ""));
  window.addEventListener("ludwig-theme-motion-changed", () => apply(getCurrentTheme()));
  document.addEventListener("visibilitychange", () => apply(getCurrentTheme()));
  window.addEventListener("ludwig-reading-mode-changed", () => apply(getCurrentTheme()));
};

initDeepSeaBubbles();

const initDeepSeaFish = () => {
  const containerId = "deep-sea-fish";
  let container = null;
  let active = false;

  const prefersReducedMotion = () => {
    try {
      return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}
    return false;
  };

  const ensureContainer = () => {
    if (container && document.getElementById(containerId) === container) return container;
    const existing = document.getElementById(containerId);
    if (existing) {
      container = existing;
      return container;
    }
    container = document.createElement("div");
    container.id = containerId;
    container.className = "deep-sea-fish";
    container.setAttribute("aria-hidden", "true");
    document.body.appendChild(container);
    return container;
  };

  const buildFishSvg = (variant) => {
    const bodyOpacity = variant === 2 ? "0.78" : "0.74";
    const finOpacity = variant === 2 ? "0.68" : "0.64";
    return `<svg viewBox="0 0 240 99" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="fin-tail" d="M228.47 36.1471C230.769 31.1344 232.184 25.7614 232.651 20.266C232.702 19.7482 232.632 19.2257 232.448 18.7392C232.264 18.2528 231.969 17.8156 231.588 17.4619C231.206 17.1082 230.748 16.8475 230.249 16.7003C229.75 16.5531 229.224 16.5234 228.712 16.6133C218.014 18.5493 195.915 30.1123 189.397 48.6705C191.26 51.5175 193.582 54.0349 196.27 56.1196C208.208 67.9926 227.472 72.515 236.802 72.0007C237.312 71.9671 237.809 71.8185 238.254 71.566C238.699 71.3135 239.081 70.9636 239.372 70.5425C239.663 70.1214 239.855 69.64 239.933 69.1343C240.012 68.6286 239.975 68.1116 239.826 67.622C236.734 57.564 233.951 52.5501 230.836 49.7066C229.046 47.9958 227.85 45.7563 227.424 43.3162C226.998 40.876 227.365 38.3636 228.47 36.1471V36.1471Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-back-bottom" d="M178.495 60.1602C173.483 62.4289 165.242 65.7942 155.391 69.1065C156.409 70.2731 157.28 71.5609 157.984 72.9407C158.243 73.479 158.655 73.9285 159.169 74.2327C159.683 74.5369 160.276 74.682 160.872 74.6498C167.868 74.1668 174.896 74.5248 181.807 75.7161C182.434 75.8351 183.082 75.753 183.659 75.4813C184.236 75.2097 184.712 74.7624 185.02 74.2036L186.971 70.6115C187.188 70.2134 187.313 69.7716 187.337 69.3187C187.36 68.8658 187.282 68.4133 187.107 67.9948L184.839 62.5423C184.635 62.0552 184.307 61.63 183.888 61.3089C183.469 60.9879 182.973 60.7822 182.45 60.7122L178.495 60.1602Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-back-top" d="M171.593 37.4432L145.887 26.8557L163.942 23.7249C165.967 23.3753 168.043 23.4645 170.031 23.9864C172.019 24.5082 173.871 25.4506 175.464 26.7498L182.639 32.6107C182.861 32.7914 183.027 33.0314 183.118 33.3027C183.209 33.5741 183.221 33.8656 183.153 34.1436C183.085 34.4216 182.939 34.6745 182.733 34.873C182.527 35.0715 182.269 35.2075 181.989 35.2652L171.593 37.4432Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-dorsel" d="M93.6292 15.8725C107.45 15.8725 121.943 18.6403 135.265 22.3459C135.605 21.6953 135.845 20.9966 135.975 20.2738C137.367 12.4996 125.391 3.84063 109.158 0.936655C104.071 -0.00705102 98.8777 -0.236105 93.7275 0.256062L80.542 16.2204C84.3827 16.0011 88.6695 15.8725 93.6292 15.8725Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="bod" d="M208.026 46.4122C207.716 43.4401 202.114 35.3256 198.455 36.7852C192.958 38.9783 192.013 43.4931 185.148 40.9218C176.832 37.8137 132.558 15.875 93.6666 15.875C50.8818 15.875 55.1686 24.9878 36.0482 28.2245C15.0603 31.7713 8.11974 43.2208 8.11974 43.2208C5.44332 47.0474 4.46803 50.1707 8.97407 50.4505L22.3788 51.6757L1.59503 53.3167C1.17423 53.4417 0.800822 53.6907 0.52349 54.031C0.246157 54.3714 0.0777661 54.7874 0.0402305 55.2249C0.00269499 55.6624 0.0977673 56.101 0.313066 56.4837C0.528365 56.8664 0.853904 57.1752 1.24726 57.3702C10.0703 61.9076 19.5663 66.672 30.7936 70.6271C42.777 71.0809 55.1459 67.708 62.782 57.9827C65.156 54.8519 68.6565 49.4523 66.5623 45.6106C64.0219 41.3378 59.5083 38.464 55.4937 35.3029C52.6283 33.0796 49.5209 30.947 47.1772 28.1262C53.7624 31.5671 60.65 33.8736 66.4867 38.8119C68.0833 40.1108 69.4395 41.6798 70.4937 43.4477C72.8828 47.2894 71.4615 52.3033 69.4655 55.8955C62.8652 67.9954 49.4454 73.2891 36.396 72.4875C51.9479 77.3274 70.7886 80.5415 95.3677 79.9517C129.458 81.7969 177.391 61.3707 183.251 57.8466C189.11 54.3225 199.196 59.412 202.152 59.9187C208.185 61.0001 208.457 50.5035 208.026 46.4122Z" fill="currentColor" opacity="${bodyOpacity}"/>
  <path class="eye" d="M32.268 42.4575C35.0364 42.4575 37.2806 40.2127 37.2806 37.4436C37.2806 34.6745 35.0364 32.4297 32.268 32.4297C29.4996 32.4297 27.2554 34.6745 27.2554 37.4436C27.2554 40.2127 29.4996 42.4575 32.268 42.4575Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-front-bottom" d="M111.721 84.494L101.235 78.6558C98.0912 76.9025 94.638 75.7751 91.0658 75.3359L76.9504 73.6041C76.8167 73.5919 76.6827 73.6245 76.5696 73.6968C76.4564 73.7691 76.3706 73.8771 76.3256 74.0036C76.2805 74.1301 76.2789 74.268 76.3208 74.3955C76.3627 74.5231 76.4459 74.6331 76.5572 74.7082L88.5633 82.558L96.532 94.1588L111.6 98.9307C111.838 99.0052 112.09 99.0198 112.334 98.9734C112.579 98.927 112.808 98.8209 113.002 98.6645C113.196 98.5082 113.348 98.3064 113.445 98.0771C113.542 97.8478 113.581 97.5981 113.558 97.3501L112.507 85.6813C112.484 85.434 112.4 85.1964 112.263 84.9893C112.125 84.7822 111.939 84.6121 111.721 84.494Z" fill="currentColor" opacity="${finOpacity}"/>
  <path class="fin-front-top" d="M110.776 39.9819C107.456 38.8133 103.837 38.8133 100.516 39.9819L79.2563 47.4007C80.2023 48.0611 80.9822 48.9322 81.5346 49.9452C82.0869 50.9583 82.3966 52.0858 82.4393 53.2389C82.4189 54.8025 81.861 56.3113 80.8592 57.5117L97.6888 59.0242C100.494 59.2719 103.307 58.6283 105.725 57.1851C108.144 55.7418 110.047 53.5723 111.162 50.9853L113.347 45.9109C113.59 45.3554 113.717 44.7557 113.718 44.1491C113.719 43.5425 113.595 42.9422 113.354 42.3857C113.113 41.8292 112.759 41.3285 112.316 40.9149C111.872 40.5013 111.348 40.1837 110.776 39.9819V39.9819Z" fill="currentColor" opacity="${finOpacity}"/>
</svg>`;
  };

  const rebuild = () => {
    const host = ensureContainer();
    host.innerHTML = "";

    const count = 6;
    for (let i = 0; i < count; i += 1) {
      const item = document.createElement("div");
      item.className = "deep-sea-fish-item";

      const motion = document.createElement("div");
      motion.className = "deep-sea-fish-motion";

      const size = 22 + Math.random() * 44;
      const top = 10 + Math.random() * 80;
      const dur = 42000 + Math.random() * 52000;
      const delay = -Math.random() * dur;
      const dir = Math.random() < 0.5 ? -1 : 1;
      const alpha = 0.10 + Math.random() * 0.12;
      const blur = (Math.random() * 0.7).toFixed(2);
      const wag = 1500 + Math.random() * 1700;
      const fin = 1300 + Math.random() * 1500;
      const variant = Math.random() < 0.5 ? 1 : 2;
      const face = dir === 1 ? -1 : 1;

      item.style.setProperty("--fish-size", `${size.toFixed(2)}px`);
      item.style.setProperty("--fish-top", `${top.toFixed(2)}`);
      item.style.setProperty("--fish-dur", `${dur.toFixed(0)}ms`);
      item.style.setProperty("--fish-delay", `${delay.toFixed(0)}ms`);
      item.style.setProperty("--fish-dir", String(dir));
      item.style.setProperty("--fish-face", String(face));
      item.style.setProperty("--fish-wag-dir", String(face));
      item.style.setProperty("--fish-drift-from", dir === 1 ? "-30vw" : "130vw");
      item.style.setProperty("--fish-drift-to", dir === 1 ? "130vw" : "-30vw");
      item.style.setProperty("--fish-alpha", `${alpha.toFixed(3)}`);
      item.style.setProperty("--fish-blur", `${blur}px`);
      item.style.setProperty("--fish-wag", `${wag.toFixed(0)}ms`);
      item.style.setProperty("--fish-fin", `${fin.toFixed(0)}ms`);

      motion.innerHTML = `<div class="deep-sea-fish-art">${buildFishSvg(variant)}</div>`;
      item.appendChild(motion);
      host.appendChild(item);
    }
  };

  const stop = () => {
    active = false;
    const el = document.getElementById(containerId);
    if (el) el.remove();
    container = null;
  };

  const start = () => {
    if (active) return;
    if (document.body.classList.contains("theme-motion-off")) return;
    if (prefersReducedMotion()) return;
    active = true;
    ensureContainer();
    rebuild();
  };

  const apply = (theme) => {
    const t = String(theme || "").trim().toLowerCase();
    const isDeepSea = t === "deep-sea" || t === "galaxy-night";
    const motionOff = document.body.classList.contains("theme-motion-off");
    if (!isDeepSea || motionOff || isReadingModeActive() || document.hidden) stop();
    else start();
  };

  apply(getCurrentTheme());
  window.addEventListener("ludwig-theme-changed", (e) => apply(e && e.detail ? e.detail.theme : ""));
  window.addEventListener("ludwig-theme-motion-changed", () => apply(getCurrentTheme()));
  document.addEventListener("visibilitychange", () => apply(getCurrentTheme()));
  window.addEventListener("ludwig-reading-mode-changed", () => apply(getCurrentTheme()));
};

initDeepSeaFish();

