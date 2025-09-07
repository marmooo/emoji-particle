import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/emoji-particle.js"],
  outDir: "./npm",
  typeCheck: false,
  shims: {
    deno: true,
  },
  package: {
    name: "emoji-particle",
    version: "0.0.2",
    description: "Fireworks and popcorn particle effects using emojis.",
    license: "MIT",
    main: "emoji-particle.ts",
    repository: {
      type: "git",
      url: "git+https://github.com/marmooo/emoji-particle.git",
    },
    bugs: {
      url: "https://github.com/marmooo/emoji-particle/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
