import { createReadStream, createWriteStream } from "node:fs";
import { rename } from "node:fs/promises";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const inputPath = resolve(
  process.argv[2] ?? fileURLToPath(new URL("../temp/PEPXiaoXue3_2.json", import.meta.url)),
);
const outputPath = resolve(
  process.argv[3] ?? inputPath.replace(/\.json$/i, ".csv"),
);
const temporaryOutputPath = `${outputPath}.tmp`;
const headers = ["wordRand", "headWord", "content", "bookid"];

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsvRow(record) {
  return [
    record.wordRank,
    record.headWord,
    JSON.stringify(record.content ?? {}),
    record.bookId,
  ]
    .map(escapeCsv)
    .join(",");
}

const input = createReadStream(inputPath, { encoding: "utf8" });
const lines = createInterface({ input, crlfDelay: Infinity });
const output = createWriteStream(temporaryOutputPath, { encoding: "utf8" });
let rowCount = 0;

try {
  output.write(`${headers.join(",")}\n`);

  for await (const line of lines) {
    if (!line.trim()) continue;

    const record = JSON.parse(line);
    output.write(`${toCsvRow(record)}\n`);
    rowCount += 1;
  }

  await new Promise((resolvePromise, reject) => {
    output.once("error", reject);
    output.end(resolvePromise);
  });
  await rename(temporaryOutputPath, outputPath);

  console.log(`已转换 ${rowCount} 条记录`);
  console.log(`CSV 文件：${outputPath}`);
} catch (error) {
  output.destroy();
  console.error(`转换失败：${error.message}`);
  process.exitCode = 1;
}
