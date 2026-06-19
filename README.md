# 4kwallpaper

A beautiful, responsive Medium-style blog feed powered by GitHub.

## Features

✨ **Clean Design** - Minimalist, Apple-inspired UI
🌙 **Dark/Light Mode** - Smooth theme switching with system preferences support
📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
🔍 **Search** - Filter posts by title and subtitle
🎯 **Medium-style Algorithm** - Posts ranked by views, freshness, and randomness
🚀 **GitHub Pages Ready** - Deploy directly to GitHub Pages
📝 **Simple Posting** - Just add JSON files to the `/posts` folder

## Quick Start

### Adding a Post

1. Go to the `posts` folder in your repository
2. Create a new file with a `.json` extension (e.g., `my-first-post.json`)
3. Add your post data in this format:

```json
{
  "title": "My Amazing Post",
  "subtitle": "A brief description of the post",
  "content": "Your full story content here...",
  "date": "2026-06-18"
}
```

### Post JSON Format

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Post title |
| `subtitle` | string | Yes | Short description |
| `content` | string | Yes | Full post content |
| `date` | string | Yes | Publication date (YYYY-MM-DD) |

## File Structure

```
4kwallpaper/
├── index.html          # Main feed page
├── viewer.html         # Post viewer page
├── script.js           # Feed logic
├── viewer.js           # Post viewer logic
├── style.css           # Feed styles
├── viewer-style.css    # Post styles
├── posts/              # Your posts go here
│   ├── post-1.json
│   └── post-2.json
└── 4kwallpaperlogo.png # Site logo
```

## Deploying to GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Select `main` branch as the source
3. Your site will be available at `https://ganesh412004.github.io/4kwallpaper/`

## Customization

### Colors
Edit the CSS variables in `style.css` and `viewer-style.css`:

```css
:root {
    --bg-color: #ffffff;
    --text-color: #242424;
    /* ... more variables ... */
}
```

### Logo
Replace `4kwallpaperlogo.png` with your own logo

## Algorithm

Posts are ranked using a Medium-style algorithm:

```
score = (views / √(age_in_days)) * (0.5 + random * 0.9)
```

This balances:
- **Popularity** - Posts with more views rank higher
- **Freshness** - Newer posts get a boost
- **Discovery** - Random factor prevents stale rankings

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## License

Open source and free to use.
