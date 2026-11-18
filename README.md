# Luveedu Notifications (luvnotify)

**Version:** 1.0.0

A dependency-free toast notification library for Luveedu products. Statuses, visual variants, auto-hide, copy, sound, action buttons, and animations — all configurable.

---

## 1. Files

| File | Purpose |
|---|---|
| `css/v1/luvnotify.css` | Styles, palettes, variants, animations |
| `js/v1/luvnotify.js` | Engine and public API |

Public asset URLs:

```text
https://files.luveedu.com/ui-library/css/v1/luvnotify.css
https://files.luveedu.com/ui-library/js/v1/luvnotify.js
```

Live demo:

```text
https://files.luveedu.com/ui-library/demo-notification.html
```

---

## 2. Installation

Add the stylesheet and script to your page. No dependencies are required.

```html
<link rel="stylesheet" href="https://files.luveedu.com/ui-library/css/v1/luvnotify.css">
<script src="https://files.luveedu.com/ui-library/js/v1/luvnotify.js"></script>
```

The script exposes:

- `window.LuvNotify`
- `window.luvnotify` (alias)

Optional: if `css/v1/library.css` is also loaded, luvnotify inherits the same fonts and 6px radius.

---

## 3. Quick start

```js
LuvNotify.success('Saved successfully.');
LuvNotify.error('Something went wrong.');
LuvNotify.warning('Storage is almost full.');
LuvNotify.info('A new version is available.');
LuvNotify.neutral('You have 3 unread messages.');
LuvNotify.loading('Uploading…');
```

Full control:

```js
LuvNotify.show({
  type: 'info',
  title: 'API key',
  message: 'YOUR_API_KEY',
  showCopy: true,
  duration: 0,
  position: 'top-right',
  animation: 'slide',
  variant: 'solid',
  sound: true
});
```

---

## 4. API reference

### `LuvNotify.show(options)`

Creates a toast. Returns the toast id (string).

### `LuvNotify.success(message, options)`

### `LuvNotify.error(message, options)`

### `LuvNotify.warning(message, options)`

### `LuvNotify.info(message, options)`

### `LuvNotify.neutral(message, options)`

### `LuvNotify.loading(message, options)`

Shortcuts for each status. `loading()` defaults to `duration: 0` (sticky). All return the toast id.

### `LuvNotify.update(id, options)`

Updates an existing toast. Returns the id, or `null` if not found.

Supported keys: `type`, `title`, `message`, `duration`, `variant`.

Changing `duration` restarts the auto-hide timer. `duration: 0` makes the toast sticky.

### `LuvNotify.dismiss(id)`

Dismisses one toast. Returns `true` if found.

### `LuvNotify.dismissAll(position?)`

Dismisses all toasts, or only those in a given position.

### `LuvNotify.configure(options)`

Merges options into the global defaults. Returns a copy of the config.

### `LuvNotify.getConfig()`

Returns a copy of the current global defaults.

### `LuvNotify.setSound(on)`

Sets the global sound default. Returns the boolean.

### `LuvNotify.setPosition(position)`

Sets the global position default. Returns the position.

### `LuvNotify.setTheme(theme)`

Sets the global theme default (`auto`, `light`, `dark`). Returns the theme.

### `LuvNotify.setVariant(variant)`

Sets the global variant default. Returns the variant.

### `LuvNotify.copy(text)`

Copies text to the clipboard. Returns `Promise<boolean>`.

### `LuvNotify.playSound(type, volume)`

Plays a status tone manually. `type` is a status name; `volume` is `0`–`1`.

### `LuvNotify.version`

Returns `'1.0.0'`.

---

## 5. Options reference

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | string | `'info'` | `success`, `error`, `warning`, `info`, `neutral`, `loading` |
| `title` | string | `''` | Bold title line |
| `message` | string | `''` | Body text (or HTML when `html: true`) |
| `html` | boolean | `false` | Render `message` as HTML. Only use with trusted content |
| `duration` | number | `4000` | Auto-hide in milliseconds. `0` = sticky |
| `dismissible` | boolean | `true` | Show the close (×) button |
| `showIcon` | boolean | `true` | Show the status icon |
| `showCopy` | boolean | `false` | Show the copy button |
| `copyText` | string \| null | `null` | Text to copy. Defaults to `message` (or `title`) |
| `copyLabel` | string | `'Copy'` | Accessible label/title for the copy button |
| `position` | string | `'top-right'` | `top-right`, `top-left`, `top-center`, `bottom-right`, `bottom-left`, `bottom-center` |
| `animation` | string | `'slide'` | `slide`, `fade`, `scale`, `bounce` |
| `sound` | boolean | `true` | Play a tone for the status |
| `volume` | number | `0.35` | Sound volume, `0`–`1` |
| `pauseOnHover` | boolean | `true` | Pause the auto-hide timer on hover |
| `closeOnClick` | boolean | `false` | Dismiss when the toast body is clicked |
| `maxVisible` | number | `5` | Max toasts per position; the oldest is removed first |
| `width` | number \| string \| null | `null` | Toast width. Number = px; string = any CSS width |
| `offset` | number | `16` | Container padding in px |
| `gap` | number | `12` | Gap between toasts in px |
| `theme` | string | `'auto'` | `auto`, `light`, `dark` |
| `variant` | string | `'soft'` | `soft`, `solid`, `gradient`, `outline`, `minimal` |
| `actions` | array \| null | `null` | Inline action buttons (see section 12) |
| `onOpen` | function \| null | `null` | `function(id, element)` |
| `onClose` | function \| null | `null` | `function(id)` |
| `onCopy` | function \| null | `null` | `function(text, success)` |

---

## 6. Statuses

| Status | Icon | Use for |
|---|---|---|
| `success` | check | Completed actions |
| `error` | circle-x | Failures |
| `warning` | triangle | Caution |
| `info` | info | Neutral information |
| `neutral` | bell | General messages |
| `loading` | spinner | In-progress work |

---

## 7. Variants

| Variant | Background | Text / icon |
|---|---|---|
| `soft` | Tinted status surface | Status color |
| `solid` | Solid status color | White |
| `gradient` | Status gradient | White |
| `outline` | Surface | Status color + colored border |
| `minimal` | Neutral surface | Neutral text, status-colored icon |

```js
LuvNotify.success('Saved', { variant: 'solid' });
LuvNotify.configure({ variant: 'gradient' });
LuvNotify.setVariant('outline');
```

---

## 8. Positions

`top-right` (default), `top-left`, `top-center`, `bottom-right`, `bottom-left`, `bottom-center`.

Each position has its own stack and its own `maxVisible` limit.

---

## 9. Animations

| Animation | Behavior |
|---|---|
| `slide` | Slides in from the nearest edge |
| `fade` | Fades in |
| `scale` | Scales up |
| `bounce` | Springs in with an overshoot |

All toasts also get an icon pop and a spring entrance. Success draws its check, error shakes, and warning pulses. The `soft`, `outline`, and `minimal` variants also get a light sweep on entry.

---

## 10. Auto-hide and pause

- `duration` controls auto-hide. `0` keeps the toast until dismissed.
- `pauseOnHover: true` pauses the timer while the pointer is over the toast.
- `maxVisible` removes the oldest toast in the same position when the limit is reached.

---

## 11. Copy button

```js
LuvNotify.show({
  type: 'info',
  title: 'API key',
  message: 'YOUR_API_KEY',
  showCopy: true,
  duration: 0
});
```

- Copies `copyText`, or `message` if `copyText` is not set.
- If `html: true`, tags are stripped before copying.
- Shows a check icon for 1.6 seconds.
- Uses the Clipboard API when available, with a fallback.
- Calls `onCopy(text, success)`.

---

## 12. Action buttons

```js
LuvNotify.show({
  type: 'warning',
  title: 'Delete workspace?',
  message: 'This cannot be undone.',
  duration: 0,
  actions: [
    { label: 'Delete', variant: 'danger', onClick: function (e, id) { /* ... */ } },
    { label: 'Cancel' }
  ]
});
```

Action object:

| Key | Type | Description |
|---|---|---|
| `label` | string | Button text |
| `variant` | string | `primary` or `danger` (optional) |
| `onClick` | function | `function(event, id)` |
| `close` | boolean | Default `true`; set `false` to keep the toast open |

---

## 13. Sound

- Generated with the Web Audio API; no audio files.
- Tones: success (two ascending), error (two descending), warning (two beeps), info (single), neutral (soft click), loading (silent).
- `volume` is `0`–`1`.
- Browsers require a user gesture before audio can play. If blocked, the sound is skipped silently.
- Disable globally with `LuvNotify.setSound(false)` or per toast with `sound: false`.

---

## 14. Callbacks

```js
LuvNotify.show({
  type: 'success',
  message: 'Saved',
  onOpen: function (id, element) { /* ... */ },
  onClose: function (id) { /* ... */ },
  onCopy: function (text, success) { /* ... */ }
});
```

---

## 15. Dark mode

- `theme: 'auto'` follows `data-theme` on `<html>` or `<body>`, then the OS preference.
- `theme: 'light'` or `'dark'` forces a mode.
- Dark palettes use solid tinted surfaces (no transparency).

```html
<html data-theme="dark">
```

---

## 16. Accessibility

- Non-error toasts use `role="status"` and `aria-live="polite"`.
- Error toasts use `role="alert"` and `aria-live="assertive"`.
- `aria-atomic="true"` on each toast.
- Close and copy buttons have `aria-label` and `title`.
- Keep messages short and descriptive.

---

## 17. Examples

### Global defaults

```js
LuvNotify.configure({
  position: 'bottom-right',
  duration: 5000,
  variant: 'solid',
  sound: false
});
```

### Loading → success

```js
var id = LuvNotify.loading('Saving changes…');

setTimeout(function () {
  LuvNotify.update(id, {
    type: 'success',
    title: 'Done',
    message: 'Changes saved.',
    duration: 3000
  });
}, 1800);
```

### Sticky with actions

```js
LuvNotify.show({
  type: 'warning',
  message: 'Your session is about to expire.',
  duration: 0,
  actions: [
    { label: 'Stay signed in', variant: 'primary', onClick: refreshSession },
    { label: 'Sign out', onClick: signOut }
  ]
});
```

### Custom width and position

```js
LuvNotify.info('Wide message', {
  position: 'bottom-center',
  width: 480,
  animation: 'bounce'
});
```

### HTML message (trusted content only)

```js
LuvNotify.show({
  type: 'info',
  html: true,
  message: '<strong>Heads up!</strong> Read the <a href="/changelog">changelog</a>.'
});
```

---

## 18. Rules and guidelines

1. **Use the design system.** Keep the 6px radius, the Bricolage Grotesque font, and the existing palette. Do not introduce new colors or fonts.
2. **Use `variant` for themes.** Do not override `--luvn-*` variables directly unless you are extending the library.
3. **Do not disable animations.** The library is designed to always animate. Do not add a global `prefers-reduced-motion` override that sets durations to `1ms`.
4. **Use `configure()` for app-wide defaults** and per-toast options for one-offs.
5. **Keep messages short.** One or two lines is ideal.
6. **Use `duration: 0` for toasts that require action.**
7. **Use `maxVisible` to prevent flooding.**
8. **Sanitize untrusted content.** Never pass user input to `html: true`.
9. **Do not rely on sound for critical feedback.** Browsers may block audio until a user gesture.
10. **Use `onClose` for cleanup** (timers, subscriptions, etc.).
11. **Copy requires a secure context** for the Clipboard API; the fallback works otherwise.
12. **Do not create toast containers manually.** The library manages one container per position.

---

## 19. Browser support

Modern evergreen browsers with CSS custom properties, flexbox, gradients, and Web Audio. Internet Explorer is not supported.

---

## 20. Troubleshooting

| Problem | Check |
|---|---|
| No animation | Ensure `luvnotify.css` is loaded and no global reduced-motion override is active |
| No sound | Audio requires a user gesture; check `sound` and `volume` |
| Copy does nothing | Clipboard API needs HTTPS; the fallback uses `execCommand` |
| Toast hidden behind UI | The container uses `z-index: 9999`; check for parent stacking contexts |
| Dark mode looks wrong | Set `data-theme` on `<html>` or `<body>`, or pass `theme` |
| Solid variant looks washed out | Ensure the latest CSS is loaded (the white sheen was removed) |
| Toast not appearing | Confirm `LuvNotify` is loaded and `show()` is called after the DOM is ready |

---

## 21. Version

`1.0.0`
