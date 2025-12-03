# Color Scheme Update Guide

## New Color Palette

### Primary Colors (Purple/Indigo Gradient)
```
Old: from-sky-400 to-cyan-400
New: from-purple-500 to-indigo-600

Old: sky-400, sky-500, cyan-400
New: purple-500, indigo-600, violet-500
```

### Background Colors
```
Old: sky-50, cyan-50
New: purple-50, indigo-50, violet-50
```

### Border Colors
```
Old: sky-200, cyan-200
New: purple-200, indigo-200
```

### Dark Mode Accents
```
Old: sky-900, cyan-900
New: purple-900, indigo-900
```

## Global Find & Replace

### Gradients
- `from-sky-400 to-cyan-400` → `from-purple-500 to-indigo-600`
- `from-sky-50 to-cyan-50` → `from-purple-50 to-indigo-50`

### Solid Colors
- `bg-sky-400` → `bg-purple-500`
- `bg-sky-50` → `bg-purple-50`
- `bg-cyan-400` → `bg-indigo-600`
- `text-sky-400` → `text-purple-500`
- `border-sky-200` → `border-purple-200`
- `ring-sky-400` → `ring-purple-500`

### Focus States
- `focus:ring-sky-400` → `focus:ring-purple-500`
- `focus:border-sky-400` → `focus:border-purple-500`

## Files to Update

1. `/components/Sidebar.jsx`
2. `/components/UploadSection.jsx`
3. `/components/RecentUploads.jsx`
4. `/components/MetadataCards.jsx`
5. `/components/ReportViewer.jsx`
6. `/components/QuickAccess.jsx`
7. `/components/Charts.jsx`
8. `/components/BackendStatus.jsx`
9. `/components/ChatbotAssistant.jsx`
10. `/components/SequenceComparison.jsx`
11. `/components/RightPanel.jsx`
