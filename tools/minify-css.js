import fs from "node:fs/promises";
import path from "node:path";
import CleanCSS from "clean-css";
import { glob } from "glob";

const PROJECT_ROOT = process.cwd();
const CSS_GLOB = "assets/css/**/*.css";

function isMinFile(filePath) {
  return filePath.endsWith(".min.css");
}

function toMinPath(filePath) {
  return filePath.replace(/\.css$/i, ".min.css");
}

async function minifyFile(filePath) {
  const absPath = path.join(PROJECT_ROOT, filePath);
  const css = await fs.readFile(absPath, "utf8");

  const output = new CleanCSS({
    level: 2,
    rebase: false, // evita reescrever urls
  }).minify(css);

  if (output.errors?.length) {
    throw new Error(`Erros ao minificar ${filePath}:\n- ${output.errors.join("\n- ")}`);
  }

  const minPath = toMinPath(absPath);
  await fs.writeFile(minPath, output.styles, "utf8");

  const inBytes = Buffer.byteLength(css, "utf8");
  const outBytes = Buffer.byteLength(output.styles, "utf8");
  return { filePath, minPath: path.relative(PROJECT_ROOT, minPath), inBytes, outBytes };
}

async function main() {
  const files = await glob(CSS_GLOB, {
    nodir: true,
    ignore: ["**/*.min.css"],
  });

  if (!files.length) {
    console.log(`Nenhum CSS encontrado em: ${CSS_GLOB}`);
    return;
  }

  const results = [];
  for (const file of files) {
    if (isMinFile(file)) continue;
    results.push(await minifyFile(file));
  }

  for (const r of results) {
    const saved = r.inBytes - r.outBytes;
    console.log(
      `${r.filePath} -> ${r.minPath}  (${r.inBytes}b -> ${r.outBytes}b, -${saved}b)`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});