import { build, stop } from "esbuild";

async function bundleWorker(entryPath: string, outPath: string) {
  const result = await build({
    entryPoints: [entryPath],
    bundle: true,
    minify: true,
    format: "esm",
    write: false,
  });
  const workerCode = new TextDecoder().decode(result.outputFiles[0].contents);
  const wrapper = `
export function createWorker() {
  const blob = new Blob([${
    JSON.stringify(workerCode)
  }], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url, { type: "module" });
  URL.revokeObjectURL(url);
  return worker;
}
`;
  await Deno.writeTextFile(outPath, wrapper);
}

await bundleWorker("emoji-particle.ts", "src/emoji-particle.js");
stop();
