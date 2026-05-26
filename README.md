# Don Skidmore Memorial Golf Outing Website

Static website for the 2026 Don Skidmore Memorial Golf Outing fundraiser.

## Files

- `index.html` contains the page content and links.
- `styles.css` contains the responsive visual design.
- `script.js` handles the contact form mailto behavior.
- `assets/fundraiserFlyer.png` is the original event flyer.

## Contact Form

Before publishing, replace the placeholder at the top of `script.js`:

```js
const FUNDRAISER_EMAIL = "REPLACE_WITH_FUNDRAISER_EMAIL@example.com";
```

with the official fundraiser email address.

## Preview

You can open `index.html` directly in a browser, or run a local static server:

```powershell
python -m http.server 8010
```

Then visit `http://127.0.0.1:8010/`.
