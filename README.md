# SE Marketing Consulting Website

A polished single-page marketing website for SE Marketing Consulting. The page is designed as a live advertisement for local small business owners who need a clean, modern, affordable website.

## Project Structure

```text
se-marketing-website/
|-- index.html
|-- preview.html
|-- css/
|   `-- styles.css
|-- js/
|   `-- script.js
|-- images/
|   `-- qr-placeholder.svg
|   `-- preview-qr.png
|-- assets/
|   `-- mockups/
|       |-- desktop-mockup.svg
|       `-- phone-mockup.svg
|-- package.json
`-- README.md
```

## Run Locally

This is a static HTML/CSS/JavaScript site. You can open `index.html` directly in a browser.

If you prefer a local server, run:

```bash
npx serve .
```

Then open the local URL shown in your terminal.

## QR Code

The main page includes a real QR image at `images/preview-qr.png`.

It points to:

```text
https://scottthatch.github.io/SE-Marketing-Website/preview.html
```

## Replacing the QR Code

1. Generate a QR code that points to the live URL for `preview.html`, for example `https://your-domain.com/preview.html`.
2. Save your real QR image in the `images` folder, for example `images/website-qr.png`.
3. Open `index.html`.
4. Find the QR section image:

```html
<img src="images/preview-qr.png" alt="Scan to see what your website could look like">
```

5. Replace the `src` with your new image:

```html
<img src="images/website-qr.png" alt="Scan to see what your website could look like">
```

The CSS already includes styling for `.qr-frame img`, so the real QR code will fit in the existing box without additional changes.

## Included Sections

- Hero section with primary call to action
- "This Could Be Your Website" desktop and phone mock website preview
- Services cards
- 20% off offer block
- QR code placeholder section linking to `preview.html`
- Quick preview scan landing page
- Contact section for SE Marketing Consulting and Scott Thatcher

## Customization Notes

- Update colors in `css/styles.css` under the `:root` variables.
- Edit page copy and contact details in `index.html`.
- Scroll animations are handled in `js/script.js` using `IntersectionObserver`.
