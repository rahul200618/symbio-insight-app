# .gitignore Configuration Guide

## Overview
This project now has comprehensive `.gitignore` files to prevent unwanted files from being committed to version control.

## Files Created

### 1. **Root `.gitignore`**
Location: `symbio-insight-app/.gitignore`

Excludes:
- `node_modules/` - All dependency folders
- `.env*` - All environment variable files
- `build/`, `dist/` - Build outputs
- Editor files (`.vscode/`, `.idea/`, etc.)
- OS files (`.DS_Store`, `Thumbs.db`, etc.)
- Log files (`*.log`)
- Temporary files (`*.tmp`, `.cache/`)

### 2. **Frontend `.gitignore`**
Location: `symbio-insight-app/frontend/.gitignore`

Additional frontend-specific exclusions:
- Vite build artifacts
- React/Next.js outputs
- TypeScript build info
- Parcel cache
- Storybook outputs
- `convert-tsx-to-jsx.js` - Temporary conversion script

### 3. **Backend `.gitignore`**
Location: `symbio-insight-app/backend/.gitignore`

Additional backend-specific exclusions:
- Database files (`*.sqlite`, `*.db`)
- Uploaded files (`uploads/`)
- Session files
- Runtime data (`*.pid`, `pids/`)
- Coverage reports

## Environment Variable Templates

### Frontend `.env.example`
Location: `symbio-insight-app/frontend/.env.example`

Template for frontend environment variables. Copy this to `.env` and fill in your values:
```bash
cp .env.example .env
```

### Backend `.env.example`
Location: `symbio-insight-app/backend/.env.example`

Template for backend environment variables. Copy this to `.env` and fill in your values:
```bash
cp .env.example .env
```

## Important Notes

### ⚠️ Security
- **Never commit `.env` files** - They contain sensitive credentials
- The `.env` files are already in `.gitignore`
- Always use `.env.example` to show what variables are needed
- Replace placeholder values in `.env.example` before sharing

### 📝 What Gets Committed
✅ **DO commit:**
- Source code (`.js`, `.jsx`, `.ts`, `.tsx`)
- Configuration files (`package.json`, `vite.config.js`, etc.)
- `.env.example` files (without sensitive data)
- Documentation (`.md` files)
- Public assets

❌ **DON'T commit:**
- `node_modules/`
- `.env` files with real credentials
- Build outputs (`build/`, `dist/`)
- Log files
- Editor-specific settings
- OS-specific files
- Database files
- Uploaded user content

### 🔄 If You Already Committed Sensitive Files

If you accidentally committed `.env` or other sensitive files:

1. Remove from Git tracking:
```bash
git rm --cached .env
git rm --cached backend/.env
git rm --cached frontend/.env
```

2. Commit the removal:
```bash
git commit -m "Remove sensitive .env files from tracking"
```

3. Push changes:
```bash
git push
```

4. **Important:** If the files contained passwords or API keys, **rotate those credentials immediately** as they may be in Git history.

### 🧹 Cleaning Up

To remove all ignored files from your working directory (be careful!):
```bash
git clean -fdX
```

This will delete all files that are in `.gitignore`.

## Files You Can Safely Delete

These files are now in `.gitignore` and can be deleted if no longer needed:
- `frontend/fix-imports.js` - Was used to fix import statements (one-time use)
- `frontend/convert-tsx-to-jsx.js` - Was used for TypeScript conversion (one-time use)

## Verification

To check what files are being ignored:
```bash
git status --ignored
```

To check if a specific file is ignored:
```bash
git check-ignore -v filename
```

## Best Practices

1. **Always check `.env.example`** when setting up the project on a new machine
2. **Never share actual `.env` files** - share `.env.example` instead
3. **Review `.gitignore`** before committing to ensure no sensitive data leaks
4. **Use environment variables** for all sensitive configuration
5. **Document required environment variables** in `.env.example`

## Summary

✅ Root `.gitignore` created  
✅ Frontend `.gitignore` created  
✅ Backend `.gitignore` created  
✅ Frontend `.env.example` created  
✅ Backend `.env.example` created  

Your repository is now properly configured to exclude unwanted and sensitive files from version control! 🎉
