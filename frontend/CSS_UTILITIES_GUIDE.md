# CSS Utilities Guide

## Overview
All new CSS utilities are defined in `src/index.css` and available globally.

## Glass Effect

### Usage
```jsx
<div className="glass-effect rounded-3xl">
  {/* Content */}
</div>
```

### What It Does
Combines glassmorphism effects:
- `bg-white/80` - 80% opaque white background
- `backdrop-blur-xl` - Extra-large blur effect
- `border border-white/20` - Semi-transparent white border
- `shadow-xl shadow-blue-500/10` - Subtle blue tinted shadow

### Best For
- Modal containers
- Card backgrounds
- Form containers
- Overlay panels

### Example
```jsx
// Login card
<div className="glass-effect rounded-3xl p-8">
  <form>{/* form fields */}</form>
</div>
```

---

## Gradient Text

### Usage
```jsx
<h1 className="gradient-text">Car Market Hub</h1>
```

### What It Does
Applies blue-to-indigo gradient to text:
- Blue-600 (start)
- Indigo-600 (end)
- Proper text clipping for visibility

### Best For
- Headings
- Brand text
- Price displays
- Key metrics

### Example
```jsx
<p className="text-5xl font-black gradient-text">
  ${price.toLocaleString()}
</p>
```

---

## Card Hover

### Usage
```jsx
<div className="card-hover rounded-2xl">
  {/* Card content */}
</div>
```

### What It Does
Unified card hover effects:
- Smooth 300ms transitions
- Shadow enhancement on hover
- Subtle lift (-translate-y-2)
- Scale-safe hover state

### Best For
- Product cards
- Listing items
- Dashboard cards
- Interactive boxes

### Example
```jsx
<div className="bg-white rounded-2xl card-hover">
  <img src={car.image} />
  <h3>{car.make} {car.model}</h3>
</div>
```

---

## Transition Smooth

### Usage
```jsx
<button className="transition-smooth">
  Click Me
</button>
```

### What It Does
Applied smooth transition timing:
- Duration: 0.3s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Affects all properties

### Best For
- Button interactions
- Color changes
- Size changes
- Opacity changes

### Example
```jsx
<input 
  className="transition-smooth focus:ring-blue-500"
  type="email"
/>
```

---

## Button Focus

### Usage
```jsx
<button className="btn-focus">Submit</button>
```

### What It Does
Accessibility-compliant focus states:
- Focus ring: 2px width
- Ring color: Blue-500
- Ring offset: 2px
- Proper outline removal

### Best For
- Form buttons
- Navigation links
- Clickable elements
- Interactive controls

### Example
```jsx
<button className="px-4 py-2 bg-blue-600 text-white btn-focus">
  Save Changes
</button>
```

---

## Slide Down Animation

### Usage
```jsx
{dropdownOpen && (
  <div className="animate-slideDown">
    {/* Dropdown content */}
  </div>
)}
```

### What It Does
Smooth downward entrance:
- Starts 10px above
- Fades in from 0% to 100% opacity
- Takes 0.3s to complete
- Uses ease-out timing

### Best For
- Dropdown menus
- Popover panels
- Notification alerts
- Tooltip elements

### Example
```jsx
{isOpen && (
  <div className="absolute animate-slideDown">
    <ul>{/* Menu items */}</ul>
  </div>
)}
```

---

## Scale In Animation

### Usage
```jsx
{showModal && (
  <div className="animate-scaleIn">
    {/* Modal content */}
  </div>
)}
```

### What It Does
Smooth scale and fade entrance:
- Starts at 95% scale
- Fades in simultaneously
- Takes 0.3s to complete
- Uses ease-out timing

### Best For
- Modal dialogs
- Confirmation boxes
- Toast notifications
- Overlay panels

### Example
```jsx
<div className="fixed animate-scaleIn">
  <div className="bg-white rounded-3xl">
    {/* Modal content */}
  </div>
</div>
```

---

## Shimmer Animation

### Usage
```jsx
<div className="animate-shimmer bg-gradient-to-r from-gray-300 to-gray-400">
  {/* Loading placeholder */}
</div>
```

### What It Does
Horizontal shimmer/wave effect:
- Runs continuously (2s loop)
- Background position shift
- Creates loading effect
- Smooth animation

### Best For
- Loading skeletons
- Content placeholders
- Data loading states
- Perceived performance

### Example
```jsx
{isLoading && (
  <div className="animate-shimmer h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
)}
```

---

## Combined Utility Examples

### Example 1: Login Form
```jsx
<div className="glass-effect rounded-3xl p-8">
  <h1 className="gradient-text">Sign In</h1>
  <form className="space-y-6">
    <input 
      className="transition-smooth focus:ring-blue-500" 
      type="email" 
    />
    <button className="transition-smooth btn-focus">
      Sign In
    </button>
  </form>
</div>
```

### Example 2: Card List
```jsx
<div className="grid gap-6">
  {items.map(item => (
    <div key={item.id} className="card-hover bg-white rounded-2xl">
      <img src={item.image} />
      <h3 className="gradient-text">{item.title}</h3>
    </div>
  ))}
</div>
```

### Example 3: Modal
```jsx
{isOpen && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
    <div className="glass-effect rounded-3xl animate-scaleIn">
      <h2 className="gradient-text">Confirm Action</h2>
      <button className="btn-focus transition-smooth">Confirm</button>
    </div>
  </div>
)}
```

### Example 4: Dropdown Menu
```jsx
<div className="relative">
  <button className="transition-smooth btn-focus">Menu</button>
  {open && (
    <ul className="animate-slideDown absolute">
      <li><a href="#">Option 1</a></li>
      <li><a href="#">Option 2</a></li>
    </ul>
  )}
</div>
```

---

## Migration Guide

### From Old to New

**Before:**
```jsx
<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 p-8 border border-white/20">
```

**After:**
```jsx
<div className="glass-effect rounded-3xl p-8">
```

**Before:**
```jsx
<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
```

**After:**
```jsx
<h1 className="gradient-text">
```

**Before:**
```jsx
<div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col hover:-translate-y-2">
```

**After:**
```jsx
<div className="bg-white rounded-2xl card-hover group flex flex-col">
```

---

## Customization

All utilities are defined in `src/index.css` under `@layer utilities`.

To modify, edit the class definitions:

```css
@layer utilities {
  /* Edit these properties */
  .glass-effect {
    @apply bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-blue-500/10;
  }
  
  .gradient-text {
    @apply text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600;
  }
}
```

---

## Browser Support

All utilities work in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Chrome Mobile)

For older browsers, graceful degradation ensures visibility.

---

## Performance Notes

- Utilities are compiled to single CSS rules
- No runtime overhead
- Animations use `transform` for GPU acceleration
- Transitions use efficient cubic-bezier timing
- Classes enable CSS code reuse

---

## Quick Reference

| Class | Effect | Best For |
|-------|--------|----------|
| `.glass-effect` | Blur + transparency | Modals, cards |
| `.gradient-text` | Blue→Indigo gradient | Headings, prices |
| `.card-hover` | Shadow + lift | Product cards |
| `.transition-smooth` | 0.3s smooth transition | All interactions |
| `.btn-focus` | Blue focus ring | Buttons, links |
| `.animate-slideDown` | Top-to-bottom entrance | Dropdowns |
| `.animate-scaleIn` | Scale + fade entrance | Modals |
| `.animate-shimmer` | Horizontal wave | Loading states |

---

**Last Updated**: 2025-11-17
**Tailwind CSS Version**: 4.1.2
**Utility Count**: 8 main + 4 animations
