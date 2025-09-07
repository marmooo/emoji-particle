const rockets: Rocket[] = [];
const particles: Particle[] = [];
const popcornEmojiList = ["🍿", "🌽", "🥤", "🥨", "🫐", "🍣"];
const fireworkEmojiList = ["✨", "⭐️", "💥", "🌟", "🔥", "💫"];
const rocketEmojiList = ["🚀", "🧨", "💣", "🪄", "🛸"];
const emojiCache = new Map<string, ImageBitmap>();
let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;
let width: number;
let height: number;

interface BaseParticle {
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  age: number;
  lifeTime: number;
  fade: boolean;
  size: number;
}

interface Particle extends BaseParticle {
  type: "emoji";
}

interface Rocket {
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  age: number;
  lifeTime: number;
  size: number;
  explosionOptions: ExplosionOptions;
}

interface SpawnOptions {
  particleType?: "popcorn" | "rocket";
  originX?: number;
  originY?: number;
  count?: number;
  size?: number;
  minSpeed?: number;
  maxSpeed?: number;
  angle?: number;
  angleVariance?: number;
  gravity?: number;
  lifeTime?: number;
  fade?: boolean;
  explosionOptions?: ExplosionOptions;
}

interface ExplosionOptions {
  count?: number;
  size?: number;
  minSpeed?: number;
  maxSpeed?: number;
  angle?: number;
  angleVariance?: number;
  gravity?: number;
  lifeTime?: number;
  fade?: boolean;
  emojiList?: string[];
}

type MessageData =
  | { type: "init"; canvas: OffscreenCanvas }
  | { type: "spawn"; options: SpawnOptions }
  | { type: "resize"; width: number; height: number };

self.onmessage = async (e: MessageEvent<MessageData>) => {
  if (e.data.type === "init") {
    canvas = e.data.canvas;
    ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    width = canvas.width;
    height = canvas.height;

    await prepareEmojiCache([
      ...popcornEmojiList,
      ...fireworkEmojiList,
      ...rocketEmojiList,
    ]);

    requestAnimationFrame(loop);
  } else if (e.data.type === "spawn") {
    spawn(e.data.options);
  } else if (e.data.type === "resize") {
    width = e.data.width;
    height = e.data.height;
    canvas.width = width;
    canvas.height = height;
  }
};

async function emojiToBitmap(emoji: string, size = 64): Promise<ImageBitmap> {
  const off = new OffscreenCanvas(size, size);
  const ctx = off.getContext("2d") as OffscreenCanvasRenderingContext2D;
  ctx.font = `${size}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2);
  return await createImageBitmap(off);
}

async function prepareEmojiCache(list: (string | ImageBitmap)[], size = 64) {
  for (const item of list) {
    if (typeof item === "string") {
      if (!emojiCache.has(item)) {
        const bmp = await emojiToBitmap(item, size);
        emojiCache.set(item, bmp);
      }
    } else if (item instanceof ImageBitmap) {
      if (!emojiCache.has(item as unknown as string)) {
        emojiCache.set(item as unknown as string, item);
      }
    } else {
      console.warn("Unsupported emoji item:", item);
    }
  }
}

function spawn(opts: SpawnOptions) {
  const {
    particleType = "popcorn",
    originX = width / 2,
    originY = height / 2,
    count = 20,
    size = 30,
    minSpeed = 5,
    maxSpeed = 10,
    angle = -Math.PI / 2,
    angleVariance = Math.PI / 6,
    gravity = 0.2,
    lifeTime = 100,
    fade = true,
    explosionOptions = {},
  } = opts;

  if (particleType === "popcorn") {
    for (let i = 0; i < count; i++) {
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      const dir = angle + (Math.random() - 0.5) * angleVariance;
      const emoji =
        popcornEmojiList[Math.floor(Math.random() * popcornEmojiList.length)];
      particles.push({
        type: "emoji",
        emoji,
        size,
        x: originX,
        y: originY,
        vx: Math.cos(dir) * speed,
        vy: Math.sin(dir) * speed,
        gravity,
        age: 0,
        lifeTime,
        fade,
      });
    }
  } else if (particleType === "rocket") {
    for (let i = 0; i < count; i++) {
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      const dir = angle + (Math.random() - 0.5) * angleVariance;
      const emoji =
        rocketEmojiList[Math.floor(Math.random() * rocketEmojiList.length)];
      rockets.push({
        emoji,
        x: originX,
        y: originY,
        vx: Math.cos(dir) * speed,
        vy: Math.sin(dir) * speed,
        gravity,
        age: 0,
        lifeTime,
        size,
        explosionOptions,
      });
    }
  }
}

function spawnExplosion(x: number, y: number, options: ExplosionOptions = {}) {
  const {
    count = 20,
    size = 20,
    minSpeed = 2,
    maxSpeed = 7,
    angle = 0,
    angleVariance = Math.PI * 2,
    gravity = 0.1,
    lifeTime = 80,
    fade = true,
    emojiList = fireworkEmojiList,
  } = options;

  for (let i = 0; i < count; i++) {
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    const dir = angle + (Math.random() - 0.5) * angleVariance;
    const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
    particles.push({
      type: "emoji",
      emoji,
      x,
      y,
      vx: Math.cos(dir) * speed,
      vy: Math.sin(dir) * speed,
      gravity,
      age: 0,
      lifeTime,
      fade,
      size,
    });
  }
}

function update() {
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    r.vy += r.gravity;
    r.x += r.vx;
    r.y += r.vy;
    r.age++;
    if (r.age >= r.lifeTime) {
      spawnExplosion(r.x, r.y, r.explosionOptions);
      rockets.splice(i, 1);
    }
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.age++;
    if (p.age >= p.lifeTime) particles.splice(i, 1);
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  for (const r of rockets) {
    const bmp = emojiCache.get(r.emoji);
    if (bmp) {
      ctx.globalAlpha = 1;
      ctx.drawImage(bmp, r.x - r.size / 2, r.y - r.size / 2, r.size, r.size);
    }
  }
  for (const p of particles) {
    const bmp = emojiCache.get(p.emoji);
    if (bmp) {
      const alpha = p.fade ? 1 - p.age / p.lifeTime : 1;
      ctx.globalAlpha = alpha;
      ctx.drawImage(bmp, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
    }
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
