const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(public)/flights/[id]/page.tsx',
  'src/app/(public)/boarding-pass/[id]/page.tsx',
  'src/app/(public)/reset-password/page.tsx',
  'src/app/(public)/blog/[slug]/page.tsx'
];

files.forEach(relativePath => {
  const file = path.join(__dirname, relativePath);
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('import { Suspense } from \'react\';')) {
    content = content.replace("import dynamic from 'next/dynamic';", "import dynamic from 'next/dynamic';\nimport { Suspense } from 'react';");
    content = content.replace("<PageComponent />", "<Suspense fallback={<div>Loading...</div>}>\n        <PageComponent />\n      </Suspense>");
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Skipped ${file}`);
  }
});
