const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "apps", "web", "src");
const offenders = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (full.endsWith(".d.ts") || full.endsWith(".js")) {
      offenders.push(full);
    }
  }
}

if (fs.existsSync(root)) {
  walk(root);
}

if (offenders.length > 0) {
  console.error("Generated files found inside apps/web/src:");
  for (const file of offenders) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}
