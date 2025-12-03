const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src');
const exts = ['.md', '.mdx', '.js', '.jsx', '.ts', '.tsx', '.json'];
let changedFiles = [];

function walk(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      walk(full);
      continue;
    }
    const ext = path.extname(it.name).toLowerCase();
    if (!exts.includes(ext)) continue;

    let content = fs.readFileSync(full, 'utf8');
    if (content.includes('.tsx')) {
      const updated = content.split('.tsx').join('.jsx');
      fs.writeFileSync(full, updated, 'utf8');
      changedFiles.push(full);
    }
  }
}

walk(root);
console.log(`Replaced .tsx -> .jsx in ${changedFiles.length} files`);
if (changedFiles.length) console.log(changedFiles.join('\n'));
