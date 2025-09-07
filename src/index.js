function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}
loadConfig();

function spawnRandomOption() {
  const keys = ["p", "f", "1", "2", "3", "4"];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  simulateKey(randomKey);
}

function simulateKey(key) {
  const w = emojiParticle.canvas.width;
  const h = emojiParticle.canvas.height;
  const optionsMap = {
    "p": {
      particleType: "popcorn",
      count: 20,
      originX: Math.random() * w,
      originY: Math.random() * h,
      minSpeed: 7,
      maxSpeed: 10,
      angle: -Math.PI / 2,
      angleVariance: Math.PI / 2,
      gravity: 0.2,
      lifeTime: 120,
      fade: true,
      size: 20,
    },
    "f": {
      particleType: "rocket",
      count: 1,
      originX: Math.random() * w,
      originY: h,
      minSpeed: 8,
      maxSpeed: 10,
      angle: -Math.PI / 2,
      angleVariance: 0,
      gravity: 0.05,
      lifeTime: 60,
      fade: true,
      size: 30,
      explosionOptions: {
        count: 60,
        size: 24,
        minSpeed: 2,
        maxSpeed: 6,
        gravity: 0.1,
        lifeTime: 80,
        fade: true,
      },
    },
    "1": {
      particleType: "popcorn",
      count: 15,
      size: 50,
      originX: 100,
      originY: Math.random() * h,
      minSpeed: 10,
      maxSpeed: 13,
      angle: 0,
      angleVariance: Math.PI / 6,
      gravity: 0.3,
      lifeTime: 100,
      fade: true,
    },
    "2": {
      particleType: "popcorn",
      count: 15,
      size: 50,
      originX: w - 100,
      originY: Math.random() * h,
      minSpeed: 5,
      maxSpeed: 8,
      angle: -3 * Math.PI / 4,
      angleVariance: Math.PI / 12,
      gravity: 0.25,
      lifeTime: 100,
      fade: true,
    },
    "3": {
      particleType: "rocket",
      count: 1,
      size: 50,
      originX: 0,
      originY: h,
      minSpeed: 10,
      maxSpeed: 12,
      angle: -Math.PI / 4,
      angleVariance: 0,
      gravity: 0.05,
      lifeTime: 60 + Math.random() * 60,
      fade: true,
      explosionOptions: {
        count: 60,
        size: 24,
        minSpeed: 2,
        maxSpeed: 6,
        gravity: 0.1,
        lifeTime: 80,
        fade: true,
      },
    },
    "4": {
      particleType: "rocket",
      count: 1,
      size: 50,
      originX: w,
      originY: h,
      minSpeed: 10,
      maxSpeed: 12,
      angle: -3 * Math.PI / 4,
      angleVariance: 0,
      gravity: 0.05,
      lifeTime: 60 + Math.random() * 60,
      fade: true,
      explosionOptions: {
        count: 60,
        size: 12,
        minSpeed: 2,
        maxSpeed: 6,
        gravity: 0.5,
        lifeTime: 80,
        fade: true,
      },
    },
  };
  emojiParticle.worker.postMessage({ type: "spawn", options: optionsMap[key] });
}

function initEmojiParticle() {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed",
    pointerEvents: "none",
    top: "0px",
    left: "0px",
  });
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  document.body.prepend(canvas);

  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker("emoji-particle.js");
  worker.postMessage({ type: "init", canvas: offscreen }, [offscreen]);

  globalThis.addEventListener("resize", () => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    worker.postMessage({ type: "resize", width, height });
  });
  return { canvas, offscreen, worker };
}

const emojiParticle = initEmojiParticle();
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (["p", "f", "1", "2", "3", "4"].includes(key)) {
    simulateKey(key);
  }
});
document.addEventListener("pointerdown", spawnRandomOption);
