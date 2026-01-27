# LifeFlow Modern UI - Quick Reference Guide

## Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

---

## Component Usage Examples

### SplineScene Component
```tsx
import { SplineScene } from '@/components/ui/SplineScene';

export function MyPage() {
  return (
    <SplineScene
      scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
      className="w-full h-full"
      showLoadingSpinner={true}
    />
  );
}
```

---

## Animation Patterns

### Page Entrance
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  Content
</motion.div>
```

### Page Transitions
```tsx
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={pageKey}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {/* Page content */}
  </motion.div>
</AnimatePresence>
```

### Card Hover Effect
```tsx
<motion.div
  whileHover={{ y: -5, scale: 1.02 }}
  transition={{ duration: 0.2 }}
  style={{
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  }}
  className="bg-white dark:bg-[#202020] rounded-lg"
>
  {/* Card content */}
</motion.div>
```

### Button Interactions
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
>
  Click Me
</motion.button>
```

### Staggered List Animation
```tsx
<div className="space-y-4">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {/* Item content */}
    </motion.div>
  ))}
</div>
```

### Animated Icon (Heart Like)
```tsx
<motion.button
  onClick={() => toggleLike(id)}
  whileHover={{ scale: 1.15 }}
  whileTap={{ scale: 0.9 }}
>
  <motion.div
    animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
    transition={{ duration: 0.3 }}
  >
    <Heart fill={isLiked ? 'currentColor' : 'none'} />
  </motion.div>
</motion.button>
```

---

## Glassmorphism Classes

### Full Glassmorphic Card
```tsx
<div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
  {/* Content */}
</div>
```

### Glassmorphic Button
```tsx
<button className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-lg px-4 py-2 transition-all">
  Button
</button>
```

### Glassmorphic Input
```tsx
<input
  type="text"
  className="bg-white/10 border border-white/20 backdrop-blur-md rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-white/40"
/>
```

---

## Color Palette

### Backgrounds
- Dark: `#191919` (dark:bg-[#191919])
- Darker: `#202020` (dark:bg-[#202020])
- Grid: `#2F2F2F` (dark:bg-[#2F2F2F])
- Grid Hover: `#3F3F3F` (dark:bg-[#3F3F3F])

### Glassmorphism
- Light semi-transparent: `white/10`, `white/20`
- Dark semi-transparent: `white/10` on dark background

### Text Colors
- Primary: `#37352F` (text-[#37352F])
- Secondary: `#E3E3E3` (text-[#E3E3E3])
- Muted: `#9B9A97` (text-[#9B9A97])

### Accent Colors
- Blue: `#3B82F6` (from-blue-500 to-purple-600)
- Green: `#22C55E` (from-green-500 to-emerald-600)
- Red: `#EF4444` (for errors/likes)

---

## Common Classes Reference

### Shadows
```css
/* Subtle */
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)

/* Medium */
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

/* Large */
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

/* Glassmorphic shadows */
shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Backdrop Blur
```css
backdrop-blur-md: blur(12px)
backdrop-blur-lg: blur(16px)
```

### Border Radius
```css
rounded-lg: 8px
rounded-2xl: 16px
```

---

## Responsive Breakpoints

### Tailwind Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px ← Authentication pages switch at this point
- `xl`: 1280px
- `2xl`: 1536px

### Auth Pages Logic
```tsx
{/* Hidden on mobile, visible on lg+ */}
<div className="hidden lg:flex w-1/2">
  <SplineScene />
</div>

{/* Full width on mobile, 1/2 on lg+ */}
<div className="w-full lg:w-1/2">
  {/* Form */}
</div>
```

---

## Animation Timing Reference

### Standard Durations
- Micro-interactions: 200-300ms
- Page transitions: 300-400ms
- Entrance animations: 400-600ms
- Loading animations: 1.5s (infinite)

### Easing Functions
- `easeOut`: Slow start, fast end (entrance)
- `easeInOut`: Slow start and end (transitions)
- `linear`: Constant speed (loading spinners)
- `spring`: Bouncy, physics-based (special effects)

### Stagger Example
```tsx
transition={{
  duration: 0.4,
  delay: index * 0.05, // 50ms between items
}}
```

---

## Dark Mode Support

### Dark Mode Classes Pattern
```tsx
className="bg-white dark:bg-[#191919]
           text-[#37352F] dark:text-[#E3E3E3]
           border-gray-200 dark:border-[#2F2F2F]"
```

### Testing Dark Mode
1. Open DevTools (F12)
2. Ctrl+Shift+P → "Emulate CSS media feature prefers-color-scheme"
3. Select "prefers-color-scheme: dark"

---

## Performance Tips

### Do ✅
- Use `AnimatePresence` to prevent layout shifts
- Batch related animations with stagger delays
- Use `opacity` and `transform` for animations (GPU accelerated)
- Memoize expensive components with staggered lists
- Test on actual devices for performance

### Don't ❌
- Animate color directly (animate opacity + background instead)
- Use `top`, `left` for positioning (use `transform` instead)
- Animate layout properties without AnimatePresence
- Add animations to every single element
- Forget to test on mobile devices

---

## Debugging Animations

### Slow Motion in DevTools
1. Open Chrome DevTools
2. Drawer → Rendering → Slow down animations

### Recording Animations
1. DevTools → Performance tab
2. Click record → interact → stop
3. Analyze frame rate and jank

### Common Issues

**Animations Stuttering?**
- Check GPU acceleration: Use `will-change: transform`
- Reduce simultaneous animations
- Test on actual device

**Animations Not Showing?**
- Check `initial` and `animate` values
- Ensure element is visible (z-index, opacity)
- Verify transition settings

**Performance Bad?**
- Use `motion.div` instead of regular `div`
- Avoid animating `width`/`height` (use scale instead)
- Check browser DevTools Performance tab

---

## Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
tsc -b

# Watch mode
npm run dev -- --host
```

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── SplineScene.tsx (NEW)
│   │   └── ... other components
│   ├── pages/
│   │   ├── LoginPage.tsx (UPDATED)
│   │   ├── SignupPage.tsx (UPDATED)
│   │   ├── FeedPage.tsx (UPDATED)
│   │   ├── ProfilePage.tsx (UPDATED)
│   │   └── ... other pages
│   ├── layouts/
│   │   └── DashboardLayout.tsx (UPDATED)
│   └── ...
├── package.json (UPDATED)
└── ...
```

---

## Resources

### Framer Motion
- Docs: https://www.framer.com/motion/
- Examples: https://www.framer.com/motion/examples/

### Spline
- Docs: https://docs.spline.design/
- Export for React: https://docs.spline.design/react

### Tailwind CSS
- Docs: https://tailwindcss.com/
- Customization: https://tailwindcss.com/docs/theme

---

## Support

For issues or questions:
1. Check the main implementation document
2. Review Framer Motion docs
3. Test in isolation (create minimal reproduction)
4. Check browser console for errors

---

**Happy Animating! 🚀**
