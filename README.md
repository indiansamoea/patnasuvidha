# Patna Suvidha React App 🇮🇳

This project is the modern React version of Patna Suvidha, built using Vite, Tailwind CSS, and Firebase. It was migrated from a single `index.html` file into a modular React structure.

## 🚀 Getting Started

1. **Install Dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   *This will start a local server, usually at `http://localhost:5173`. Open this URL in your browser to view the app.*

## 📁 Project Structure

*   **`src/components/`**: Reusable UI parts like `Navbar.jsx`, `Footer.jsx`, and `WeatherWidget.jsx`.
*   **`src/pages/`**: The main views of your application (`Home.jsx`, `AddBusiness.jsx`, `BusinessDetails.jsx`, `Success.jsx`).
*   **`src/context/AppContext.jsx`**: Global state management. It handles Dark Mode, Language toggling (English/Hindi), and fetches live business data directly from Firebase Firestore.
*   **`src/services/firebase.js`**: Your Firebase configuration and initialization (Auth, Firestore).
*   **`src/utils/`**: Helper files containing your translations (`i18n.js`) and category definitions (`categories.js`).
*   **`src/index.css`**: Global Tailwind styles, custom animations, and CSS variables.
*   **`public/`**: Contains static assets like your PWA `manifest.json`, Service Worker (`sw.js`), and App Icons.

## 🛠️ Editing the App

*   **To change text or translations**: Edit `src/utils/i18n.js`.
*   **To modify categories or form fields**: Edit `src/utils/categories.js`.
*   **To change global styles**: Edit `src/index.css` or `tailwind.config.js`.
*   **Whenever you save a file**, the browser will automatically refresh instantly thanks to Vite's Hot Module Replacement (HMR).

## 📦 Building for Production

When you are ready to put your app online (like on Firebase Hosting, Vercel, or Netlify), run:
```bash
npm run build
```
This generates an optimized, minified bundle inside the `dist/` folder. You will upload/deploy the contents of this `dist/` folder to your server.

---
*Created with ❤️ for Patna*
