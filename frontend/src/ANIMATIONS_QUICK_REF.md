# 🎬 Animations Quick Reference

## ⚡ Quick Start (30 seconds)

### **1. Scroll Animation**
```tsx
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const ref = useScrollAnimation('fade-in', 0);
<div ref={ref}>Fades in on scroll</div>
```

### **2. Page Transition**
```tsx
import { AnimatedPage } from './components/AnimatedPage';

<AnimatedPage animation="slide-up">
  <YourContent />
</AnimatedPage>
```

### **3. Hover Effect**
```tsx
<motion.button
  whileHover={{ y: -5, scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### **4. Number Counter**
```tsx
import { useCounterAnimation } from '../hooks/useScrollAnimation';

const ref = useCounterAnimation(1000, 2000);
<span ref={ref}>0</span> // Counts to 1000
```

---

## 📦 Import Cheat Sheet

```tsx
// Hooks
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useStaggerAnimation } from '../hooks/useScrollAnimation';
import { useCounterAnimation } from '../hooks/useScrollAnimation';
import { useParallax } from '../hooks/useScrollAnimation';
import { useScrollProgress } from '../hooks/useScrollAnimation';
import { useMouseParallax } from '../hooks/useScrollAnimation';

// Components
import { AnimatedPage } from './components/AnimatedPage';
import { AnimatedCard } from './components/AnimatedPage';
import { AnimatedButton } from './components/AnimatedPage';
import { AnimatedList, AnimatedListItem } from './components/AnimatedPage';
import { FloatingElement } from './components/AnimatedPage';
import { PulsingElement } from './components/AnimatedPage';
import { ScrollProgressBar } from './components/AnimatedPage';

// Utilities
import { animeAnimations } from '../utils/animations';
import { initAnimeJS } from '../utils/animations';

// Framer Motion
import { motion, AnimatePresence } from 'motion/react';
```

---

## 🎯 Common Patterns

### **Pattern 1: Scroll-Triggered Card**
```tsx
const ref = useScrollAnimation('scale-up', 0);

<motion.div
  ref={ref}
  whileHover={{ y: -5 }}
  className="card"
>
  Content
</motion.div>
```

### **Pattern 2: Staggered List**
```tsx
<AnimatedList staggerDelay={0.1}>
  {items.map(item => (
    <AnimatedListItem key={item.id}>
      {item.name}
    </AnimatedListItem>
  ))}
</AnimatedList>
```

### **Pattern 3: Animated Stats**
```tsx
const countRef = useCounterAnimation(stats.value, 2000);

<div>
  <span ref={countRef}>0</span>
  <span className="label">{stats.label}</span>
</div>
```

### **Pattern 4: Loading State**
```tsx
{isLoading && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <LoadingIcon />
    </motion.div>
  </motion.div>
)}
```

### **Pattern 5: Error Shake**
```tsx
useEffect(() => {
  if (error) {
    animeAnimations.shake('.error-element');
  }
}, [error]);

<div className="error-element">
  {error}
</div>
```

---

## 🎨 Animation Types

### **Scroll Animations:**
| Type | Hook | Delay |
|------|------|-------|
| Fade In | `useScrollAnimation('fade-in', 0)` | 0ms |
| Slide Left | `useScrollAnimation('slide-left', 100)` | 100ms |
| Slide Right | `useScrollAnimation('slide-right', 100)` | 100ms |
| Scale Up | `useScrollAnimation('scale-up', 0)` | 0ms |

### **Page Transitions:**
| Type | Usage |
|------|-------|
| Fade | `<AnimatedPage animation="fade">` |
| Slide Up | `<AnimatedPage animation="slide-up">` |
| Slide Left | `<AnimatedPage animation="slide-left">` |
| Scale | `<AnimatedPage animation="scale">` |
| Blur | `<AnimatedPage animation="blur">` |

### **Hover Effects:**
| Effect | Code |
|--------|------|
| Lift | `whileHover={{ y: -5 }}` |
| Grow | `whileHover={{ scale: 1.05 }}` |
| Glow | `whileHover={{ boxShadow: '...' }}` |
| Rotate | `whileHover={{ rotate: 5 }}` |

---

## ⏱️ Timing Guide

| Duration | Use Case | Example |
|----------|----------|---------|
| 100-200ms | Micro-interactions | Button hover, tap |
| 300-400ms | Standard transitions | View changes |
| 500-800ms | Entrance animations | Page load, modals |
| 1000-2000ms | Special effects | Number counters |
| Infinite | Continuous | Float, pulse, spin |

---

## 🎯 Easing Reference

| Easing | When to Use |
|--------|-------------|
| `easeOut` | Entrances (fast → slow) |
| `easeIn` | Exits (slow → fast) |
| `easeInOut` | Interactive (smooth both) |
| `linear` | Spinners, continuous |
| `spring` | Bouncy, playful |

---

## 🔧 Anime.js Quick Reference

```typescript
// Fade in
animeAnimations.fadeIn('.element', 0);

// Slide
animeAnimations.slideInLeft('.element', 100);
animeAnimations.slideInRight('.element', 100);

// Scale
animeAnimations.scaleUp('.element', 0);

// Stagger
animeAnimations.stagger('.items', 0);

// Effects
animeAnimations.bounce('.element');
animeAnimations.pulse('.element', true);
animeAnimations.shake('.element');
animeAnimations.float('.element');

// Utility
animeAnimations.progressBar('.bar', 75);
animeAnimations.counter(element, 0, 100, 2000);
```

---

## 🎬 Motion Variants

```tsx
// Button
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>

// Card
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
/>

// Modal
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
/>

// List Item
<motion.li
  variants={{
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }}
/>
```

---

## 📊 Performance Tips

✅ **DO:**
- Use `transform` and `opacity`
- Cleanup animations on unmount
- Respect `prefers-reduced-motion`
- Debounce scroll handlers
- Use `will-change` sparingly

❌ **DON'T:**
- Animate `width`, `height`, `top`, `left`
- Create 50+ simultaneous animations
- Forget to remove event listeners
- Animate every scroll pixel
- Use inline styles for animations

---

## 🐛 Debugging

### **Anime.js Not Working?**
```javascript
// Check if loaded
console.log((window as any).anime ? 'Loaded' : 'Not loaded');

// Initialize manually
import { initAnimeJS } from '../utils/animations';
initAnimeJS();
```

### **Animation Jank?**
```
Chrome DevTools → Performance → Record
Look for:
- FPS drops (should be 60)
- Long tasks (should be <50ms)
- Layout thrashing
```

### **Motion Not Smooth?**
```tsx
// Add will-change
<motion.div style={{ willChange: 'transform' }}>

// Simplify
transition={{ duration: 0.3, ease: 'easeOut' }}
```

---

## 🎯 Where Used

| Component | Animations |
|-----------|-----------|
| App.jsx | Scroll progress, sidebar slide |
| LoginPage | Background blobs, form fields |
| UploadSection | Float icon, drag state, shake |
| Sidebar | Slide in, hover lift |
| MetadataCards | Fade in, counters, hover |
| ReportViewer | Page slide, download pulse |
| Chatbot | Float button, message slides |
| Comparison | Modal scale, bar animation |

---

## 📱 Responsive

```typescript
const isMobile = window.innerWidth < 768;

const config = {
  duration: isMobile ? 0.3 : 0.6,
  scale: isMobile ? 1.02 : 1.05,
  distance: isMobile ? 5 : 10,
};
```

---

## 🎨 Color-Coded Examples

### 🟢 **Simple (Copy & Paste)**
```tsx
<motion.div whileHover={{ y: -5 }}>
  Lifts on hover
</motion.div>
```

### 🟡 **Intermediate**
```tsx
const ref = useScrollAnimation('fade-in', 100);
<div ref={ref}>Fades in on scroll</div>
```

### 🔴 **Advanced**
```tsx
<AnimatedList staggerDelay={0.1}>
  {items.map((item, i) => (
    <AnimatedListItem key={i}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        {item.name}
      </motion.div>
    </AnimatedListItem>
  ))}
</AnimatedList>
```

---

## 🚀 Production Checklist

- [ ] Anime.js loads from CDN
- [ ] All animations have cleanup
- [ ] Respects `prefers-reduced-motion`
- [ ] No layout thrashing
- [ ] 60 FPS maintained
- [ ] Mobile optimized
- [ ] Tested on real devices
- [ ] Fallbacks for no JS
- [ ] Loading states animated
- [ ] Error states have feedback

---

## 📖 Documentation

- **Complete Guide:** `/ANIMATIONS_GUIDE.md`
- **Implementation:** `/ANIMATIONS_IMPLEMENTATION.md`
- **Code:** `/utils/animations.ts`
- **Hooks:** `/hooks/useScrollAnimation.ts`
- **Components:** `/components/AnimatedPage.jsx`

---

## 🎉 Quick Copy-Paste Snippets

### **Scroll Fade**
```tsx
import { useScrollAnimation } from '../hooks/useScrollAnimation';
const ref = useScrollAnimation('fade-in', 0);
<div ref={ref}>Content</div>
```

### **Hover Lift**
```tsx
<motion.div whileHover={{ y: -5 }}>Hover me</motion.div>
```

### **Page Transition**
```tsx
<AnimatedPage animation="slide-up">
  <Content />
</AnimatedPage>
```

### **Number Counter**
```tsx
const ref = useCounterAnimation(1000);
<span ref={ref}>0</span>
```

### **Loading Spinner**
```tsx
<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
  <Icon />
</motion.div>
```

---

**🎬 That's it! You're ready to animate!** ✨

*For detailed examples, see `/ANIMATIONS_GUIDE.md`*
