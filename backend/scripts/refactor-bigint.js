const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/modules');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.controller.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Check if BigInt(id) is used
    if (content.includes('BigInt(id)')) {
      // 1. Replace @Param('id') id: string with @Param('id', ParseBigIntPipe) id: bigint
      content = content.replace(/@Param\('id'\)\s+id:\s+string/g, "@Param('id', ParseBigIntPipe) id: bigint");

      // 2. Add import for ParseBigIntPipe if not present
      if (!content.includes('ParseBigIntPipe')) {
        // Find relative path to src/common/pipes/parse-bigint.pipe
        const depth = filePath.split(path.sep).length - srcDir.split(path.sep).length + 1;
        const relativePath = '../'.repeat(depth) + 'common/pipes/parse-bigint.pipe';
        content = `import { ParseBigIntPipe } from '${relativePath}';\n` + content;
      }

      // 3. Replace BigInt(id) with id
      content = content.replace(/BigInt\(id\)/g, "id");

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
      }
    }
  }
});
