const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') && !file.includes('prisma.service.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace this.prisma.[model] with this.prisma.extended.[model]
  // Note: we should avoid matching this.prisma.extended
  content = content.replace(/this\.prisma\.(?!\$|extended)([_a-zA-Z0-9]+)/g, 'this.prisma.extended.$1');
  
  // also replace this.prisma.$transaction with this.prisma.extended.$transaction
  content = content.replace(/this\.prisma\.\$transaction/g, 'this.prisma.extended.$transaction');
  
  // What about this.prisma.$connect / $disconnect? We should not replace them if we keep them on PrismaService.
  // Actually, the new PrismaService will just have extended. So $transaction is on extended.
  
  // But wait, the reviewer's code: 
  //   this.extended = this._client.$extends(...)
  // So extended has $transaction. What about $queryRaw? It is also on extended.

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
