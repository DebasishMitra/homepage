# Premium Homepage Dashboard

An elegant, premium-grade browser homepage dashboard built using **Vanilla HTML5, CSS3, and ES6 Javascript Modules**. Powered by **Vite** for blazing fast compilation and bundled with a **Supabase** backend for authentication, cloud settings synchronization, and data storage.

---

\***\*Deployment**

- [Vercel](https://homepage-debasishmitra.vercel.app)
- [Cloudflare Pages](https://homepage.debasishmitra7452.workers.dev)
- [Netlify](https://homepage-search.netlify.app)

---

## 🌟 Key Features

### 🕒 Interactive Clock System

- **4 Stunning Styles**: Cycle between _Modern Minimalist_, _Hacker Neon_, _Bold Italic_, or a highly responsive _Analog Clock_.
- **Custom Formats**: Toggle between 12-hour and 24-hour display configurations in settings.
- **Instant Style Changing**: Click directly on the clock interface to cycle style layouts instantly.

### 🔍 Unified Intelligent Search System

- **Dynamic Search Engines Grid**: Integrated dropdown menu featuring standard search engines (Google, Bing, Yahoo, Yandex), Privacy-focused alternatives (DuckDuckGo, Brave, Ecosia), and modern AI search engines (Google AI, ChatGPT, Perplexity, DeepSeek, Grok).
- **Voice Search Integration**: Speak directly to search using high-fidelity native Speech Recognition.
- **Intelligent Tab Management**: Configure queries to launch either in your current active workspace or a clean new tab.

### 🎨 Harmonious Customization & Aesthetics

- **Dynamic Glass Panels Toggle**: Seamlessly convert all dashboard surfaces from beautiful flat colors to hyper-premium translucent glassmorphism panels (`backdrop-filter` enabled).
- **Flexible Light & Dark Modes**: Fully customized CSS system optimized to switch theme profiles on the fly.
- **Full Customization Panel**: Real-time picker controls for background image uploads, page base color settings, and dynamic highlight accent colors.
- **Responsive Settings Dashboard**: Beautiful, categorized configurations dashboard that adapts seamlessly to desktop and mobile environments alike.

### 🛠️ Built-in Productivity Apps

- **Smart Bookmark Manager**: Categorized bookmark library synced seamlessly with the cloud database.
- **Notepad Editor**: Auto-saving digital notepad to capture quick thoughts.
- **Web Link Hub**: Dedicated link shortcuts module with 24 high-fidelity target sites.
- **System Footers**: Displays real-time geolocated network diagnostics including IPv4 addresses, ISPs, exact coordinates, and timezones.
- **Live Weather Widget**: Current temperature indicators coupled with interactive widgets that open to expose feels-like index, humidity levels, wind speeds, and a 7-day extended forecast grid (powered by the **Open-Meteo** API).

---

## 🔒 Advanced Security

- **Secure Supabase Authentication**: Email and password-protected accounts for settings and data encryption.
- **Browser-Resilient Rate Limiting**: Built-in protection on login and sign-up windows (maximum **5 attempts per minute**). Rate-limit states are saved directly to `localStorage`, rendering brute-force attacks useless even if they refresh the tab or reload the browser.
- **Safe Account Deletion**: Users can self-delete their profiles directly from the Account tab. Account deletion is safely orchestrated via a secure PostgreSQL function run as a `SECURITY DEFINER`.
- **CORS & Same-Origin Bypass Proxying**: Dynamic Quick Access icons automatically proxy through Google's favicon caching layer, utilizing optimized domain lookups to elegantly bypass strict cross-origin policies (like `NotSameOrigin` and `NotSameSite` HTTP blocks) enforced by portals like Claude and Gmail.
- **Legal Compliance Integration**: Integrated compliance footers in both `login.html` and `index.html` referencing custom, theme-compliant **Privacy Policy** and **Terms of Use** sub-panels.

---

## 🛠️ Technology Stack

- **Frontend Core**: Vanilla HTML5, Advanced CSS Grid/Flexbox layouts, ES6 Modules.
- **Bundler & Tooling**: [Vite 8](https://vite.dev/)
- **Database & Auth**: [Supabase JS Client SDK](https://supabase.com/)
- **Iconography**: [Lucide Icons Library](https://lucide.dev/)
- **Weather API**: [Open-Meteo Geocoding and Forecast API](https://open-meteo.com/)

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### 💻 Installation

1. Clone or open the project folder in your terminal:

   ```bash
   cd homepage
   ```

2. Install all necessary development dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and populate it with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-key
   ```

4. Launch the local development server:

   ```bash
   npm run dev
   ```

5. Open the address output in the terminal console (e.g., `http://localhost:5173`) in your preferred browser.

---

## 🌐 Setting as Browser Homepage & New Tab

To experience the premium dashboard every time you open your browser or open a new tab, configure your browser settings using the steps below:

### 🌐 Google Chrome

1. Click the **three dots menu** (top right) and open **Settings**.
2. Navigate to **On startup** in the left sidebar.
3. Select **Open a specific page or set of pages**.
4. Click **Add a new page**, enter your local dev URL (`http://localhost:5173`) or deployed production URL, and click **Add**.
5. _Optional (New Tab page override)_: Chrome does not natively support custom URLs for new tabs. To enable this, install the lightweight Chrome extension **"Custom New Tab URL"** from the Chrome Web Store and set your dashboard URL in it.

### 🧭 Microsoft Edge

1. Click the **three dots menu** and open **Settings**.
2. Navigate to **Start, home, and new tabs** in the sidebar.
3. Under **When Edge starts**, select **Open these pages** and click **Add a new page**. Input your homepage URL.
4. Under **Home button**, toggle **Show home button on toolbar**, select the secondary input option, and enter your homepage URL.

### 🦊 Mozilla Firefox

1. Click the **hamburger menu** (top right) and open **Settings**.
2. Select **Home** in the left sidebar.
3. Locate **Homepage and new windows** under _New Windows and Tabs_.
4. Change the dropdown menu selection from _Firefox Home (Default)_ to **Custom URLs...**.
5. Paste your homepage URL in the input field.

### 🦁 Brave Browser

1. Open **Settings** from the main menu.
2. Select **Get started** in the left-hand navigation.
3. Under **On startup**, select **Open a specific page or set of pages**.
4. Click **Add a new page** and enter your homepage URL.

---

## 🗄️ Database Setup (Supabase)

To enable data persistence for your profile, settings, bookmarks, and links, you must execute the database schemas on your Supabase instance:

1. Navigate to the **SQL Editor** inside your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new blank query.
3. Open the `supabase_setup.sql` file present in the project's root folder, copy the full contents, and paste it into the editor.
4. Execute the query to setup:
   - **Profiles Table**: Automatically synchronized with new user signups.
   - **Bookmarks, Notes, & Web Links tables**: All secured with **Row Level Security (RLS)** policies so users can only access their own private rows.
   - **`delete_user()` Function**: A Postgres function required to safely delete an active user's credentials on request.

## 🧩 Building as a Native Browser Extension (Chrome / Edge / Brave)

You can turn this entire homepage website into a native Manifest V3 browser extension so it runs locally and **replaces your default New Tab page** instantly. 

We have already configured a fully functional `manifest.json` under the `/public` directory. Follow the steps below to load it into your browser:

### 📦 1. Build the Extension Bundle
Run the production build command in your terminal to compile the code and assets:
```bash
npm run build
```
This compiles all files and copies the `manifest.json` into the output **`dist/`** directory. The `dist/` directory is now a fully qualified, self-contained browser extension!

### 🔧 2. Load into Your Browser

#### 🌐 Google Chrome & Brave
1. Open the browser and go to `chrome://extensions` (or `brave://extensions`).
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the **`dist/`** directory inside your project folder.
5. *Open a new tab!* The browser will automatically load your premium homepage locally with instant speed.

#### 🧭 Microsoft Edge
1. Open Edge and go to `edge://extensions`.
2. Toggle **Developer mode** (bottom-left corner sidebar).
3. Click **Load unpacked** and select the **`dist/`** folder.
4. Open a new tab to see your dashboard active!

---

## 📂 Project Structure

```
├── .env                  # Private Environment variables for Supabase
├── bookmarks.html        # Bookmark manager page layout
├── index.html            # Main dashboard shell
├── login.html            # Gateway signup & login page
├── notepad.html          # Notepad editor page interface
├── package.json          # Dependency and build script configuration
├── privacy.html          # Privacy Policy page layout (CORS & Same-Origin bypassed)
├── supabase_setup.sql    # Database migration scripts and access policies
├── terms.html            # Terms of Use page layout (fully compliant)
├── vite.config.js        # Vite compiler configurations
└── src/
    ├── auth.js           # Auth states and browser-resilient rate-limiting
    ├── bookmarks.js      # Bookmarks grid logic and CRUD requests
    ├── dialogs.js        # Dynamic prompts and confirmation helpers
    ├── main.js           # Clock, weather, search engines, and dashboard state management
    ├── style.css         # CSS style variables, glassmorphism tokens, and responsive sheets
    └── supabaseClient.js # Supabase client instance initializer
```

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

For full details, please refer to the accompanying [LICENSE](https://github.com/DebasishMitra/homepage/blob/main/LICENSE) file in the root repository. Build something beautiful and keep it open!
