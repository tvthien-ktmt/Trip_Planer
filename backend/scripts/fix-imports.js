const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '../src/modules');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.controller.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('../../../common/pipes/parse-bigint.pipe')) {
      content = content.replace(/import \{ ParseBigIntPipe \} from '\.\.\/\.\.\/\.\.\/common\/pipes\/parse-bigint\.pipe';/g, "import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';");
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed import in:', filePath);
    }
  }
});
