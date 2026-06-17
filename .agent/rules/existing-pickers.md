# Icon & Color Picker Rules (CRITICAL)

## NEVER create icon/color pickers from scratch

The project has **reusable** IconPicker and ColorPicker components. Always use them.

### Available Tools

| Tool | Type | File | Usage |
|------|------|------|-------|
| IconPicker | Vanilla JS | `public/assets/js/icon-picker.js` | `new IconPicker(container, options)` |
| ColorPicker | Vanilla JS | `public/assets/js/color-picker.js` | `new ColorPicker(container, options)` |
| IconPickerIsland | React island | `src/islands/icon-picker/` | `<div data-island="icon-picker">` |
| picker.css | Styles | `public/css/picker.css` | Shared CSS for both pickers |

### When to use which
- **EJS / Alpine.js pages** → Use `IconPicker` and `ColorPicker` vanilla JS classes
- **React components** → Use `IconPickerIsland` React component

### API (Vanilla JS)

```javascript
// Icon Picker — full icon search with Solar/MDI/Tabler libraries
const iconPicker = new IconPicker(containerElement, {
    name: 'icon',           // hidden input name
    value: 'solar:...',     // initial value
    onSelect(icon) {        // callback when icon is selected
        console.log('Selected:', icon);
    }
});
iconPicker.setValue('solar:star-bold-duotone'); // programmatic update
iconPicker.destroy();                           // cleanup

// Color Picker — palette with custom color input
const colorPicker = new ColorPicker(containerElement, {
    name: 'color',          // hidden input name
    value: '#4361ee',       // initial value
    allowCustom: true,      // show <input type="color">
    allowClear: true,       // show clear button
    onSelect(color) {       // callback when color is selected
        console.log('Selected:', color);
    }
});
colorPicker.setValue('#10b981'); // programmatic update
colorPicker.destroy();          // cleanup
```

### Required CSS & JS includes
```html
<link rel="stylesheet" href="/css/picker.css">
<script src="/assets/js/icon-picker.js"></script>
<script src="/assets/js/color-picker.js"></script>
```

### Memory Management
Always call `.destroy()` when the picker's parent container is removed from the DOM (e.g., modal close) to prevent leaked panel elements on `<body>`.
