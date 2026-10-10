# Citadel - Advanced Engineering & Machinery

Official web platform for **Citadel**, based at **ODTU Teknokent, Ankara, Turkey**.

This website showcases Citadel's three core hardware engineering product lines:
1. **Citadel AeroGrid™ (Modular Windshaper)**: A multi-fan array wind generator facility for UAV, VTOL, and aerodynamic turbulence testing.
2. **Citadel ShredX-30**: A 30x30 cm single-shaft industrial rotary shredder machine with stationary counter-knives for polymer waste recycling and granulation.
3. **Citadel ExtrudeX**: A precision laboratory desktop filament extrusion system equipped with real-time dual-axis optical laser diameter micrometer PID feedback and automatic spool winding.

---

## Key Features

- **Interactive Simulation Studio**:
  - **AeroGrid Streamline Simulator**: Live aerodynamic streamline particle flow over a test drone with adjustable wind speed (0–25 m/s), turbulence noise, and pitch angles.
  - **ShredX-30 Shearing Simulator**: Real-time single-shaft rotor kinematics shearing plastic scrap pieces against the fixed counter-comb bed into 4mm regrind.
  - **ExtrudeX Continuous Extrusion Simulator**: Thermal gradient barrel, rotating screw, live laser micrometer tolerance graph (1.75 mm ± 0.02 mm), and motorized spooler.
- **WindShaper Modular Configurator**: Interactive sizing tool enabling clients to configure custom fan arrays (e.g., 4x3, 6x4, 8x6 modules) and immediately request quotations.
- **Commercial & RFQ System**: As per company policy, no fixed prices are displayed; users submit technical parameters through the integrated **Request for Quotation (RFQ)** modal.
- **Compliance & Legal Sections**: Complete corporate Terms of Service, Privacy Policy (KVKK Law No. 6698 & GDPR), and CE / ISO 9001 compliance documentation.
- **Prototype to Production Showcase**: Features real photos of Citadel's prototype hardware alongside finalized industrial renders.

---

## How to Deploy to GitHub Pages

This website is built with vanilla HTML5, CSS3, and modern JavaScript with **zero external build dependencies**. It is 100% compatible with GitHub Pages out of the box.

### Step 1: Initialize Git and Push to GitHub

```bash
# Inside the Citadel repository folder:
git init
git add .
git commit -m "Initial commit of Citadel website, renders, and simulators"

# Link to your GitHub repository (replace with your repo URL):
git remote add origin https://github.com/YOUR_USERNAME/citadel.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages in your Repository Settings

1. Navigate to your GitHub repository on github.com.
2. Click **Settings** (top tab) -> **Pages** (left sidebar under "Code and automation").
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch` (or `GitHub Actions`).
   - **Branch**: Select `main` and folder `/(root)`.
   - Click **Save**.
4. In approximately 60 seconds, your site will be live at:
   `https://YOUR_USERNAME.github.io/citadel/`

*(If you have a custom domain, simply enter it in the Custom domain field in GitHub Pages settings, which will generate a `CNAME` file automatically!)*

---

## Local Development & Preview

To preview the website locally on your computer:

```bash
# Using Python's built-in HTTP server:
python3 -m http.server 8080

# Then open in your browser:
# http://localhost:8080
```

---

## File Structure

```
Citadel/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Actions deployment
├── assets/
│   └── images/
│       ├── citadel_logo.svg            # Corporate vector logo
│       ├── citadel_shredder_render.jpg # 30x30 cm single-shaft shredder PR render
│       ├── citadel_extruder_render.jpg # Desktop filament extruder PR render
│       ├── citadel_windshaper_render.jpg# AeroGrid fan-array wind facility PR render
│       ├── prototype_shredder_top.png  # User prototype image 1
│       └── prototype_shredder_side.png # User prototype image 2
├── css/
│   └── styles.css              # Dark aerospace styling & responsive layout
├── js/
│   └── app.js                  # 3 Interactive machine simulators & RFQ logic
├── index.html                  # Main landing page & product showcase
├── 404.html                    # Fallback 404 page for GitHub Pages
├── .nojekyll                   # Disables Jekyll processing on GitHub Pages
└── README.md                   # Project documentation & deployment guide
```

---

&copy; 2026 Citadel Advanced Engineering. Base: ODTU Teknokent, Ankara, Turkey.
