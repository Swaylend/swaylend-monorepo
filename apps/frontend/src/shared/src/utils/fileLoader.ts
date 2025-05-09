/*
 *   File loader to load data once at build time.
 */
import fs from "fs";

export function loadFile(filepath: string) {
  return fs.readFileSync(filepath, "utf8");
}
