const fs = require('fs');
const path = require('path');

// Directory to search
const uiDir = path.join(__dirname, 'src', 'components', 'ui');

// Function to fix imports in a file
function fixImportsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Fix 1: Remove version numbers from imports
        content = content.replace(/@[\d.]+"/g, '"');

        // Fix 2: Fix invalid wildcard imports (import * from -> import * as X from)
        content = content.replace(/^import \* from "react";$/gm, 'import * as React from "react";');

        // Fix 3: Fix Radix UI imports
        content = content.replace(/^import \* from "@radix-ui\/react-([a-z-]+)";$/gm, (match, componentName) => {
            const parts = componentName.split('-');
            const pascalCase = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
            return `import * as ${pascalCase}Primitive from "@radix-ui/react-${componentName}";`;
        });

        // Fix 4: Fix other package imports
        content = content.replace(/^import \* from "([^@][^"]+)";$/gm, (match, packageName) => {
            const pkgName = packageName.split('/').pop();
            const alias = pkgName.charAt(0).toUpperCase() + pkgName.slice(1).replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
            return `import * as ${alias} from "${packageName}";`;
        });

        // Fix 5: Fix broken import aliases with version numbers
        content = content.replace(/import \* as ([A-Za-z]+)@[\d.]+Primitive/g, 'import * as $1Primitive');

        // Only write if changes were made
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed: ${path.basename(filePath)}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔧 Fixing import statements in UI components...\n');

let fixedCount = 0;
const files = fs.readdirSync(uiDir);

files.forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
        const filePath = path.join(uiDir, file);
        if (fixImportsInFile(filePath)) {
            fixedCount++;
        }
    }
});

console.log(`\n✨ Successfully fixed ${fixedCount} files!`);
