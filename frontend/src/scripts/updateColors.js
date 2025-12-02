// Color Scheme Update Script
// Run with: node scripts/updateColors.js

const fs = require('fs');
const path = require('path');

const replacements = [
  // Gradients
  { from: /from-sky-400 to-cyan-400/g, to: 'from-purple-500 to-indigo-600' },
  { from: /from-sky-50 to-cyan-50/g, to: 'from-purple-50 to-indigo-50' },
  
  // Background colors
  { from: /bg-sky-400/g, to: 'bg-purple-500' },
  { from: /bg-sky-500/g, to: 'bg-purple-600' },
  { from: /bg-sky-50/g, to: 'bg-purple-50' },
  { from: /bg-sky-100/g, to: 'bg-purple-100' },
  { from: /bg-cyan-400/g, to: 'bg-indigo-600' },
  { from: /bg-cyan-50/g, to: 'bg-indigo-50' },
  
  // Text colors
  { from: /text-sky-400/g, to: 'text-purple-500' },
  { from: /text-sky-500/g, to: 'text-purple-600' },
  { from: /text-sky-600/g, to: 'text-purple-700' },
  { from: /text-cyan-400/g, to: 'text-indigo-600' },
  
  // Border colors
  { from: /border-sky-100/g, to: 'border-purple-100' },
  { from: /border-sky-200/g, to: 'border-purple-200' },
  { from: /border-sky-400/g, to: 'border-purple-400' },
  { from: /border-cyan-200/g, to: 'border-indigo-200' },
  
  // Ring colors (focus states)
  { from: /ring-sky-400/g, to: 'ring-purple-500' },
  { from: /ring-cyan-400/g, to: 'ring-indigo-500' },
  
  // Focus states
  { from: /focus:ring-sky-400/g, to: 'focus:ring-purple-500' },
  { from: /focus:border-sky-400/g, to: 'focus:border-purple-500' },
  
  // Dark mode
  { from: /dark:bg-sky-900/g, to: 'dark:bg-purple-900' },
  { from: /dark:border-sky-800/g, to: 'dark:border-purple-800' },
  { from: /dark:from-sky-500/g, to: 'dark:from-purple-500' },
];

const filesToUpdate = [
  'components/UploadSection.tsx',
  'components/RecentUploads.tsx',
  'components/MetadataCards.tsx',
  'components/ReportViewer.tsx',
  'components/ChatbotAssistant.tsx',
  'components/SequenceComparison.tsx',
  'components/RightPanel.tsx',
  'components/QuickAccess.tsx',
  'App.tsx',
];

console.log('🎨 Updating color scheme from sky-blue/cyan to purple/indigo...\n');

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} (not found)`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;
    
    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        changeCount += matches.length;
        content = content.replace(from, to);
      }
    });
    
    if (changeCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${file} (${changeCount} changes)`);
    } else {
      console.log(`⏭️  No changes needed for ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${file}:`, error.message);
  }
});

console.log('\n✨ Color scheme update complete!');
