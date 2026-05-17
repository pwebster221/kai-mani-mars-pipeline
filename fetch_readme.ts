import fs from 'fs';
fetch("https://raw.githubusercontent.com/anthropics/anthropic-sdk-typescript/main/README.md")
  .then(r => r.text())
  .then(t => fs.writeFileSync('anthropic_readme.md', t));
