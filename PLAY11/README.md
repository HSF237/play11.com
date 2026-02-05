# Play11 Website

Premium, multi-page front-end website for the Play11 jersey brand. Built with HTML, CSS, and vanilla JavaScript only.

## Pages
- Home (`index.html`)
- Shop (`shop.html`) - display-only catalog with live filters
- About (`about.html`)
- Contact (`contact.html`) - client-side validation only

## Features
- Fullscreen hero video background (animated canvas fallback)
- Scroll reveal animations
- Smooth transitions and hover interactions
- Floating AI chatbot (front-end only)
- Responsive layout for mobile, tablet, and desktop

## Project Structure
```
/index.html
/shop.html
/about.html
/contact.html
/css/style.css
/js/main.js
/js/chatbot.js
/assets/images/jersey-placeholder.svg
/assets/images/hero-poster.svg
/assets/images/map-placeholder.svg
/assets/video/hero.mp4
/assets/video/README.txt
/README.md
```

## Running Locally
Open `index.html` in any modern browser. No build step required.

## Hero Video
- The hero uses an animated canvas stream by default for a smooth, autoplay background.
- To use a real video, replace `assets/video/hero.mp4` with your own clip and add a `<source>` tag inside the hero `<video>` element in `index.html`.

## AI Chatbot
This is a front-end-only demo. If no API key is provided, predefined answers are used.

To enable live AI responses, define the following in `js/chatbot.js` or as global variables:
- `window.PLAY11_API_KEY = "YOUR_KEY"`
- `window.PLAY11_API_URL = "https://api.openai.com/v1/chat/completions"` (optional)
- `window.PLAY11_AI_MODEL = "gpt-4o-mini"` (optional)

No backend or payments are included.
