# 📇 Naman Daryani - NFC Digital Business Card & Interactive CMS

An ultra-modern, high-performance NFC Digital Business Card, Interactive Terminal, and User-Friendly Admin CMS designed for **Naman Daryani**.

Built to showcase both business ventures seamlessly:
- **🏢 Exharnet:** Wholesale distribution of Mica & Laminates, Louvers, ASA Sheets, and Acrylic panels across Madhya Pradesh.
- **👜 Geba India:** Mindful handcrafted sustainable luxury bags & pouches made from rescued upcycled designer textiles ([gebaindia.com](https://gebaindia.com)).
- **👤 Naman Daryani:** Founder & Director, Indore (MP) • [@naman_daryani](https://instagram.com/naman_daryani).

---

## ⚡ Quick Start (Local Run)

Start the local server with zero dependencies (no `npm install` needed!):

```bash
node server.js
```

Then open your browser to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔐 How to Use Your Admin Panel (CMS)

You can edit **all images, texts, links, products, and contact numbers** directly from the user-friendly Admin Panel.

1. Scroll to the footer of the card and click the small lock icon (🔒) on the bottom right, OR open the Terminal view and run command `admin`.
2. Enter your security PIN:
   - **Default PIN:** `2907` *(your birthday)*
3. In the Admin Dashboard, you can:
   - **Upload your photo:** Click *"Choose Photo from Device"* to set your picture with instant live preview.
   - **Edit Personal Info:** Update Name, Title, Phone, WhatsApp, Location, Birthday, Bio, and your Instagram handle (`@naman_daryani`).
   - **Edit Exharnet:** Change descriptions, wholesale coverage, and WhatsApp catalog message templates.
   - **Edit Geba India:** Change story, collections, and online store links.
   - **Change Security PIN:** Set a custom PIN anytime.
4. Click **"Save & Apply Changes"**:
   - If running locally via `node server.js`, it automatically writes your changes directly to `data.json` on disk!
   - If deployed on a static host (like GitHub Pages or Vercel), it saves to your browser's local storage and provides a 1-click **"Export data.json"** button so you can download the updated file.

---

## 🏷️ How to Write Your NFC Tags

Once your card is hosted or live:

1. Download the free app **NFC Tools** on your phone:
   - [iPhone / iOS App Store](https://apps.apple.com/app/nfc-tools/id1252962749)
   - [Android / Google Play Store](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc)
2. Open **NFC Tools** and tap **Write**.
3. Tap **Add a record** ➔ select **URL / URI**.
4. Paste your live website link (e.g. `https://namandaryani.github.io` or your custom domain).
5. Tap **Write** and hold your phone to your NFC tag / card.
6. A green checkmark will appear. Done!

*Now whenever you tap the card against any iPhone or Android phone, your custom digital business card will instantly open without needing any app!*

---

## 🚀 Free 1-Minute Deployment Options

### Option 1: GitHub Pages (100% Free Forever)
1. Push this folder to a GitHub repository:
   ```bash
   git add .
   git commit -m "NFC Digital Business Card"
   git branch -M main
   git remote add origin https://github.com/yourusername/portfolio.git
   git push -u origin main
   ```
2. In your GitHub repo, go to **Settings** ➔ **Pages**.
3. Under **Build and deployment** ➔ **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your site will be live at `https://yourusername.github.io/portfolio` in ~30 seconds!

### Option 2: Vercel / Netlify / Cloudflare Pages
- Simply drag and drop this project folder into Vercel or Netlify, and it is instantly deployed globally with free automatic SSL.

---

## 📂 File Structure

```
epic-pasteur/
├── index.html            # Main card UI, interactive terminal & admin CMS modal
├── styles.css            # Glassmorphism theme, luxury typography & animations
├── app.js                # Core app engine: vCard generator, terminal CLI, share API
├── admin.js              # Admin CMS engine: PIN authentication, visual editing & sync
├── data.json             # Single source of truth for all data
├── server.js             # Zero-dependency local Node server with save API
├── assets/
│   ├── exharnet-logo.svg # Vector Exharnet logo (from /Documents/LOGOS)
│   ├── geba-logo.svg     # Vector Geba logo (from /Documents/LOGOS)
│   ├── linizio-logo.svg  # Vector brand logo
│   ├── neolux-logo.svg   # Vector brand logo
│   ├── acrika-logo.svg   # Vector brand logo
│   ├── konex-logo.svg    # Vector brand logo
│   └── favicon.svg       # Luxury ND monogram favicon
└── README.md             # This guide
```
