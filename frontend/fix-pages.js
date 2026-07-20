const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'app', '(public)', 'booking');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('page.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(pagesDir);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import { BookingLayout } from '@/components/layout/BookingLayout';\n", "");
  content = content.replace("<BookingLayout>\n      <PageComponent />\n    </BookingLayout>", "<PageComponent />");
  content = content.replace("<BookingLayout>\r\n      <PageComponent />\r\n    </BookingLayout>", "<PageComponent />");
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
