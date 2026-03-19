#!/usr/bin/env node

/**
 * rename-files.js
 * Renames all files in a directory to: [directoryName]_[fileName]
 *
 * Usage:
 *   node rename-files.js <directory>
 *   node rename-files.js <directory> --dry-run     (preview without renaming)
 *   node rename-files.js <directory> --recursive   (include subdirectories)
 */

const fs = require("fs");
const path = require("path");

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: node rename-files.js <directory> [options]

Options:
  --dry-run      Preview renames without making any changes
  --recursive    Also rename files inside subdirectories (uses each sub-dir name)
  --help         Show this help message

Example:
  node rename-files.js ./photos
  node rename-files.js ./photos --dry-run
  node rename-files.js ./photos --recursive
`);
  process.exit(0);
}

const targetDir = args.find((a) => !a.startsWith("--"));
const isDryRun = args.includes("--dry-run");
const isRecursive = args.includes("--recursive");

// ── Validate directory ────────────────────────────────────────────────────────
const resolvedDir = path.resolve(targetDir);

if (!fs.existsSync(resolvedDir)) {
  console.error(`❌  Directory not found: ${resolvedDir}`);
  process.exit(1);
}

if (!fs.statSync(resolvedDir).isDirectory()) {
  console.error(`❌  Path is not a directory: ${resolvedDir}`);
  process.exit(1);
}

// ── Core rename logic ─────────────────────────────────────────────────────────
let renamed = 0;
let skipped = 0;
let errors = 0;

/**
 * Renames files inside `dirPath`, prefixing each with `dirName_`.
 */
function renameFilesIn(dirPath) {
  const dirName = path.basename(dirPath);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (isRecursive) renameFilesIn(fullPath); // recurse first
      continue; // directories themselves are not renamed
    }

    if (!entry.isFile()) continue; // skip symlinks, sockets, etc.

    // Skip files that already have the prefix to avoid double-prefixing
    const prefix = `${dirName}_`;
    if (entry.name.startsWith(prefix)) {
      console.log(`⏭   Skip (already prefixed): ${entry.name}`);
      skipped++;
      continue;
    }

    const newName = `${prefix}${entry.name}`;
    const newPath = path.join(dirPath, newName);

    // Guard against collision
    if (fs.existsSync(newPath)) {
      console.warn(`⚠️   Collision – target already exists, skipping: ${newName}`);
      skipped++;
      continue;
    }

    if (isDryRun) {
      console.log(`🔍  [dry-run] ${entry.name}  →  ${newName}`);
      renamed++;
    } else {
      try {
        fs.renameSync(fullPath, newPath);
        console.log(`✅  ${entry.name}  →  ${newName}`);
        renamed++;
      } catch (err) {
        console.error(`❌  Failed to rename "${entry.name}": ${err.message}`);
        errors++;
      }
    }
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────
console.log(`\n📁  Directory : ${resolvedDir}`);
console.log(`🏷   Mode      : ${isDryRun ? "dry-run (no changes)" : "live"}`);
console.log(`🔁  Recursive : ${isRecursive ? "yes" : "no"}`);
console.log("─".repeat(50));

renameFilesIn(resolvedDir);

console.log("─".repeat(50));
console.log(
  `\nDone.  Renamed: ${renamed}  |  Skipped: ${skipped}  |  Errors: ${errors}\n`
);

if (errors > 0) process.exit(1);

