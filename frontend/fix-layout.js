const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else if (file.endsWith('page.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('D:/Trip_Planer/frontend/src/app');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('PublicLayout')) {
    content = content.replace(/import\s+\{\s*PublicLayout\s*\}\s+from\s+['"].*?['"];?\n?/g, '');
    content = content.replace(/<PublicLayout>/g, '<>');
    content = content.replace(/<\/PublicLayout>/g, '</>');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed:', f);
  }
});

// Now move everything to (public) except admin, user, and root layout/globals
const appDir = 'D:/Trip_Planer/frontend/src/app';
const publicGroupDir = path.join(appDir, '(public)');

if (!fs.existsSync(publicGroupDir)) {
  fs.mkdirSync(publicGroupDir);
}

const excluded = ['admin', 'user', 'internal', '(public)', 'layout.tsx', 'globals.css', 'favicon.ico'];
const topLevel = fs.readdirSync(appDir);

topLevel.forEach(item => {
  if (excluded.includes(item)) return;
  const oldPath = path.join(appDir, item);
  const newPath = path.join(publicGroupDir, item);
  fs.renameSync(oldPath, newPath);
  console.log('Moved', item, 'to (public)');
});

// Create layout.tsx for (public)
const layoutContent = `import { PublicLayout } from '@/components/layout/PublicLayout';

export default function PublicRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  );
}
`;
fs.writeFileSync(path.join(publicGroupDir, 'layout.tsx'), layoutContent, 'utf8');
console.log('Created (public)/layout.tsx');
