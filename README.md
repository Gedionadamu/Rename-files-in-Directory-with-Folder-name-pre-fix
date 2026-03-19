# rename-files

> CLI tool to bulk-rename files in a directory by prefixing them with their parent folder name — supports dry-run, recursive mode, and collision detection.

## How It Works

Given a directory called `vacation`:

```
vacation/
  beach.jpg
  sunset.png
```

Running the tool produces:

```
vacation/
  vacation_beach.jpg
  vacation_sunset.png
```

Each file is renamed to `[directory-name]_[original-file-name]`.

---

## Requirements

- [Node.js](https://nodejs.org/) v14 or higher
- No external dependencies — uses only built-in `fs` and `path` modules

---

## Usage

```bash
node rename-files.js <directory> [options]
```

### Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview all renames without making any changes |
| `--recursive` | Also rename files inside subdirectories (each uses its own dir name as prefix) |
| `--help` | Show usage information |

### Examples

```bash
# Rename all files in ./photos
node rename-files.js ./photos

# Preview what would be renamed (no changes made)
node rename-files.js ./photos --dry-run

# Also rename files inside any subdirectories
node rename-files.js ./photos --recursive
```

---

## Safeguards

- **Dry-run mode** — always preview before committing changes with `--dry-run`
- **Double-prefix protection** — files already prefixed with `dirName_` are automatically skipped
- **Collision detection** — if a target filename already exists, the file is skipped and a warning is shown
- **Exit code** — exits with code `1` if any errors occur, making it safe to use in scripts and CI pipelines

---

## License

MIT
