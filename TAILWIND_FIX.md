# Tailwind CSS Not Working - Quick Fix

## If styling is broken:

1. **Stop your dev server** (Ctrl+C in terminal)

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **Hard refresh browser:**
   - Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
   - Or open DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

## Verify Tailwind is Working

Check if Tailwind classes are being applied:
- Open browser DevTools (F12)
- Go to Elements/Inspector
- Look at any element (like a button)
- You should see Tailwind classes in the styles

## If Still Not Working

1. **Check browser console for errors** (F12 → Console tab)

2. **Verify globals.css is loading:**
   - DevTools → Network tab
   - Reload page
   - Look for `globals.css` file loading

3. **Check if PostCSS is working:**
   ```bash
   npx tailwindcss -i ./app/globals.css -o ./test.css --dry-run
   ```
   Should complete without errors

4. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Configuration Check

✅ `app/globals.css` should have:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

✅ `app/layout.tsx` should import:
```tsx
import './globals.css'
```

✅ `tailwind.config.ts` should have content paths:
```ts
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
]
```

✅ `postcss.config.js` should have:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Most Common Solution

**Just restart your dev server** after clearing `.next` cache. This fixes 90% of styling issues.


