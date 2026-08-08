# 📈 TradeTrack Pro - Flask Web Application

**TradeTrack Pro** is a modern, mobile-first professional trading journal and analytics web application built with a **Python Flask** backend, **Jinja2** templates, **Tailwind CSS**, custom theme CSS custom variables (Dark & Light mode), and **Chart.js** performance visualizers.

---

## 🌟 Key Features

1. **Mobile-First Responsive UI**:
   - Flawlessly optimized from **360p Android viewports** up to **1920px 4K desktop displays**.
   - **Zero horizontal scroll** on mobile with responsive table wrappers and flex/grid layout.

2. **Dark / Light Mode Toggle**:
   - Integrated theme toggle switch in navbar.
   - Smooth CSS transitions with user preference saved in `localStorage`.

3. **Complete Trading Journal Suite**:
   - **Dashboard**: High-level overview, cumulative PnL, win rate, best stock/strategy, Chart.js weekly breakdown, and recent trades.
   - **Add / Edit Trade**: Live estimated PnL calculator, emotion logging, strategy tracking, and form loading spinners.
   - **Trade History Log**: Real-time search, filter by Buy/Sell or Win/Loss, sorting options, and action controls.
   - **Advanced Analytics**: Chart.js charts (Weekly, Monthly growth line, Win vs Loss doughnut), Streaks (win/loss), strategy edge analysis, and Smart AI Insights.
   - **Risk & Position Calculator**: Real-time risk amount, risk per share, allowed quantity calculation, and position capital size.
   - **Settings & Data Management**: User profile, password updates, CSV export, JSON backup & restore, and clear data options.

---

## 📁 Project Directory Structure

```text
TradeTrack/
├── app.py                      # Flask Application Server & REST API Endpoints
├── requirements.txt            # Python Dependencies
├── README.md                   # Installation & Setup Guide
├── static/                     # Static Frontend Assets
│   ├── css/
│   │   └── style.css           # Custom Design System (CSS Variables for Light/Dark)
│   └── js/
│       ├── main.js             # Theme switcher, Mobile Drawer Navigation & Toast Notifications
│       ├── dashboard.js        # Dashboard statistics, recent trades & Chart.js bar chart
│       ├── add_trade.js        # Live PnL calculation & form submission loading handler
│       ├── history.js          # Search, filtering, sorting & trade table actions
│       ├── analytics.js        # Advanced Analytics & Chart.js visualizers
│       ├── risk_calculator.js  # Position Sizing & Risk Calculator logic
│       └── settings.js         # Settings, CSV Export, JSON Backup & Restore
└── templates/                  # Jinja2 HTML Templates
    ├── base.html               # Shared layout, navbar, mobile menu & theme toggle
    ├── index.html              # Login page
    ├── signup.html             # User registration
    ├── forgot_password.html    # Password reset
    ├── dashboard.html          # Main Dashboard
    ├── add_trade.html          # Add / Edit Trade form
    ├── history.html            # Trade History log
    ├── analytics.html          # Analytics & AI Insights
    ├── risk_calculator.html    # Position Sizing Risk Calculator
    └── settings.html           # Settings & Data Exports
```

---

## 🚀 Quick Setup & Execution Guide

### Prerequisites
- Python 3.8+ installed on your system.

### 1. Installation
Clone or navigate to the repository directory in your terminal:

```bash
cd TradeTrack
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

### 2. Run the Flask Web Application

Start the Flask server:

```bash
python app.py
```

### 3. Open in Browser

Open your browser and navigate to:
[http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🛠️ Demo Credentials
- **Username**: `demo`
- **Password**: `demo`

*(You can also register a new account on the Sign Up page)*.

---

## 🛠️ Tech Stack
- **Backend**: Python, Flask, Jinja2, Werkzeug
- **Frontend**: HTML5, CSS3 (CSS Variables for Dark/Light theme), Vanilla JavaScript (ES6+), Tailwind CSS CDN, Chart.js
