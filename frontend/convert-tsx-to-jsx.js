const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to convert all .tsx files to .jsx files
 * This will:
 * 1. Find all .tsx files
 * 2. Remove TypeScript type annotations using a transformer
 * 3. Rename files from .tsx to .jsx
 * 4. Update all import statements
 */

const srcDir = path.join(__dirname, 'src');
const filesConverted = [];
const importUpdates = new Map();

// Function to recursively find all .tsx files
function findTsxFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...findTsxFiles(fullPath));
        } else if (item.endsWith('.tsx')) {
            files.push(fullPath);
        }
    });

    return files;
}

// Function to remove TypeScript type annotations
function removeTypeAnnotations(content) {
    // Remove type imports
    content = content.replace(/import\s+type\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]\s*;?\s*/g, '');
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+(['"][^'"]+['"])/g, (match, imports, from) => {
        // Remove 'type' keyword from imports
        const cleanImports = imports.replace(/type\s+/g, '');
        return `import {${cleanImports}} from ${from}`;
    });

    // Remove interface declarations
    content = content.replace(/export\s+interface\s+\w+\s*\{[^}]*\}/gs, '');
    content = content.replace(/interface\s+\w+\s*\{[^}]*\}/gs, '');

    // Remove type declarations
    content = content.replace(/export\s+type\s+\w+\s*=\s*[^;]+;/g, '');
    content = content.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');

    // Remove function parameter types (e.g., name: string)
    content = content.replace(/\(([^)]*)\)/g, (match, params) => {
        const cleanParams = params.replace(/(\w+)\s*:\s*[^,)]+/g, '$1');
        return `(${cleanParams})`;
    });

    // Remove return type annotations (e.g., ): string =>)
    content = content.replace(/\)\s*:\s*[^{=>\n]+(\s*[{=>\n])/g, ')$1');

    // Remove variable type annotations (e.g., const x: number = 5)
    content = content.replace(/:\s*\w+(\[\])?(\s*[=,;\n])/g, '$2');

    // Remove angle brackets for generics (e.g., useState<string>)
    content = content.replace(/(\w+)<[^>]+>/g, '$1');

    // Remove 'as' type assertions
    content = content.replace(/\s+as\s+\w+/g, '');

    // Remove React.FC and similar type annotations
    content = content.replace(/:\s*React\.FC<[^>]*>/g, '');
    content = content.replace(/:\s*FC<[^>]*>/g, '');

    // Clean up excessive blank lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    return content;
}

// Function to update import statements in a file
function updateImports(content, oldPath) {
    const dir = path.dirname(oldPath);

    importUpdates.forEach((newPath, oldImport) => {
        // Update relative imports
        const regex = new RegExp(`from\\s+['"]([^'"]*${oldImport})['"\\s]*`, 'g');
        content = content.replace(regex, (match, importPath) => {
            const newImport = importPath.replace(/\.tsx$/, '.jsx');
            return match.replace(importPath, newImport);
        });
    });

    return content;
}

// Main conversion function
function convertTsxToJsx() {
    console.log('🔍 Finding all .tsx files...\n');
    const tsxFiles = findTsxFiles(srcDir);

    console.log(`Found ${tsxFiles.length} .tsx files\n`);

    // Step 1: Convert content and rename files
    console.log('📝 Converting files...\n');
    tsxFiles.forEach((filePath, index) => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const newContent = removeTypeAnnotations(content);
            const newPath = filePath.replace(/\.tsx$/, '.jsx');

            // Write the new content
            fs.writeFileSync(filePath, newContent, 'utf8');

            // Rename the file
            fs.renameSync(filePath, newPath);

            // Track the conversion
            const relativePath = path.relative(srcDir, filePath);
            importUpdates.set(relativePath, path.relative(srcDir, newPath));
            filesConverted.push(newPath);

            console.log(`✅ [${index + 1}/${tsxFiles.length}] ${relativePath} → ${path.basename(newPath)}`);
        } catch (error) {
            console.error(`❌ Error converting ${filePath}:`, error.message);
        }
    });

    // Step 2: Update all imports in converted files
    console.log('\n🔄 Updating import statements...\n');
    filesConverted.forEach((filePath, index) => {
        try {
            let content = fs.readFileSync(filePath, 'utf8');

            // Update .tsx imports to .jsx
            content = content.replace(/from\s+(['"])([^'"]+)\.tsx\1/g, "from $1$2.jsx$1");

            fs.writeFileSync(filePath, content, 'utf8');

            if ((index + 1) % 10 === 0) {
                console.log(`Updated ${index + 1}/${filesConverted.length} files...`);
            }
        } catch (error) {
            console.error(`❌ Error updating imports in ${filePath}:`, error.message);
        }
    });

    // Step 3: Update index.html if it exists
    const indexHtmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
        console.log('\n🔄 Updating index.html...\n');
        let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
        indexContent = indexContent.replace(/src\/main\.tsx/g, 'src/main.jsx');
        fs.writeFileSync(indexHtmlPath, indexContent, 'utf8');
        console.log('✅ Updated index.html');
    }

    // Step 4: Update vite.config if it exists
    const viteConfigPaths = [
        path.join(__dirname, 'vite.config.ts'),
        path.join(__dirname, 'vite.config.js')
    ];

    viteConfigPaths.forEach(configPath => {
        if (fs.existsSync(configPath)) {
            console.log(`\n🔄 Updating ${path.basename(configPath)}...\n`);
            let configContent = fs.readFileSync(configPath, 'utf8');
            configContent = configContent.replace(/\.tsx/g, '.jsx');
            fs.writeFileSync(configPath, configContent, 'utf8');
            console.log(`✅ Updated ${path.basename(configPath)}`);
        }
    });

    console.log('\n✨ Conversion complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Files converted: ${filesConverted.length}`);
    console.log(`   - All .tsx files have been converted to .jsx`);
    console.log(`   - Type annotations removed`);
    console.log(`   - Import statements updated\n`);
}

// Run the conversion
try {
    convertTsxToJsx();
} catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
}
