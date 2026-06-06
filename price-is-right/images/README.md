# Product Photos for The Price Is Right

Drop product photos in this folder, then wire them to items in `../data.js`.

## File naming

Use the item's `id` from `data.js` plus an extension — e.g. for the Toyota Camry
(`id: 'c02'`), name the file `c02.jpg`. Then in `data.js`, set:

```js
image: 'images/c02.jpg'
```

If the image is missing or fails to load, the item's emoji shows automatically —
so you can add photos piecemeal, no all-or-nothing.

## Image specs

| Property | Recommendation |
|---|---|
| **Shape** | Square or close to it (gets cropped to a square slot on screen) |
| **Size** | 400×400 to 800×800 pixels |
| **Format** | JPG (smaller files) or PNG (sharper for logos/art) |
| **File size** | Under 200 KB each — large files slow page load |

To resize/compress on Windows, you can right-click → "Edit with Paint" or use a
free tool like [Squoosh](https://squoosh.app/) (drag-and-drop, all browser).

## Sources

- **Stock photos:** Unsplash, Pexels, Pixabay — free, no attribution needed
- **Vintage / nostalgic:** Wikimedia Commons — public domain or CC-licensed
- **Brand products:** Manufacturer websites usually have product photos
- **AI generation:** DALL-E / Midjourney for things you can't find a photo of

## Priority items

See `PRIORITY_LIST.md` in this folder for the recommended order.
