"""
TradeTrack Pro - Flask Backend Application
Professional Trading Journal & Analytics Platform
"""

import os
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "tradetrack_pro_secret_key_2026")

# In-memory storage with file persistence backup
DATA_DIR = os.path.join(app.root_path, 'data')
TRADES_FILE = os.path.join(DATA_DIR, 'trades.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

def ensure_data_dir():
    """Ensure data directory and JSON storage files exist."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(TRADES_FILE):
        with open(TRADES_FILE, 'w') as f:
            json.dump([], f)
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump([
                {
                    "username": "demo",
                    "fullName": "Demo Trader",
                    "email": "demo@tradetrack.com",
                    "password": "demo"
                }
            ], f)

ensure_data_dir()

def load_json(filepath):
    """Safely load JSON data from file."""
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
    return []

def save_json(filepath, data):
    """Safely write JSON data to file."""
    try:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving {filepath}: {e}")
        return False


# ==========================================================
# PAGE ROUTES (Jinja2 Templates)
# ==========================================================

@app.route('/')
def index():
    """Login / Landing Page."""
    return render_template('index.html')

@app.route('/signup')
def signup():
    """Signup Page."""
    return render_template('signup.html')

@app.route('/forgot-password')
def forgot_password():
    """Forgot Password Page."""
    return render_template('forgot_password.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard Page."""
    return render_template('dashboard.html', active_page='dashboard')

@app.route('/add-trade')
def add_trade():
    """Add / Edit Trade Page."""
    return render_template('add_trade.html', active_page='add_trade')

@app.route('/history')
def history():
    """Trade History Log Page."""
    return render_template('history.html', active_page='history')

@app.route('/analytics')
def analytics():
    """Analytics Page."""
    return render_template('analytics.html', active_page='analytics')

@app.route('/risk-calculator')
def risk_calculator():
    """Risk Calculator Page."""
    return render_template('risk_calculator.html', active_page='risk_calculator')

@app.route('/settings')
def settings():
    """Settings Page."""
    return render_template('settings.html', active_page='settings')


# ==========================================================
# REST API ENDPOINTS
# ==========================================================

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    """API endpoint to authenticate user."""
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    users = load_json(USERS_FILE)
    user = next((u for u in users if u['username'].lower() == username.lower() and u['password'] == password), None)
    
    if user:
        session['user'] = {
            'username': user['username'],
            'fullName': user.get('fullName', user['username']),
            'email': user.get('email', '')
        }
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': session['user']
        })
    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@app.route('/api/auth/signup', methods=['POST'])
def api_signup():
    """API endpoint to register new user."""
    data = request.get_json() or {}
    full_name = data.get('fullName', '').strip()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not username or not password or not email:
        return jsonify({'success': False, 'message': 'Please fill all required fields'}), 400

    users = load_json(USERS_FILE)
    if any(u['username'].lower() == username.lower() for u in users):
        return jsonify({'success': False, 'message': 'Username already exists'}), 400

    new_user = {
        'username': username,
        'fullName': full_name or username,
        'email': email,
        'password': password
    }
    users.append(new_user)
    save_json(USERS_FILE, users)

    session['user'] = {
        'username': new_user['username'],
        'fullName': new_user['fullName'],
        'email': new_user['email']
    }

    return jsonify({
        'success': True,
        'message': 'Account created successfully',
        'user': session['user']
    })

@app.route('/api/trades', methods=['GET', 'POST'])
def api_trades():
    """API endpoint to get or create trades."""
    trades = load_json(TRADES_FILE)
    
    if request.method == 'GET':
        return jsonify({'success': True, 'trades': trades})
    
    # POST - Create or update trade
    trade_data = request.get_json() or {}
    trade_id = trade_data.get('id') or int(datetime.now().timestamp() * 1000)
    
    trade = {
        'id': trade_id,
        'username': trade_data.get('username', 'Guest'),
        'stock': trade_data.get('stock', '').upper(),
        'type': trade_data.get('type', 'BUY'),
        'entry': float(trade_data.get('entry', 0)),
        'exit': float(trade_data.get('exit', 0)),
        'quantity': int(trade_data.get('quantity', 0)),
        'strategy': trade_data.get('strategy', 'General'),
        'emotion': trade_data.get('emotion', 'Neutral'),
        'date': trade_data.get('date', datetime.now().strftime('%Y-%m-%d')),
        'notes': trade_data.get('notes', ''),
        'pnl': float(trade_data.get('pnl', 0))
    }

    # Check if updating existing trade
    existing_index = next((i for i, t in enumerate(trades) if t.get('id') == trade_id), None)
    if existing_index is not None:
        trades[existing_index] = trade
        msg = "Trade updated successfully"
    else:
        trades.append(trade)
        msg = "Trade added successfully"

    save_json(TRADES_FILE, trades)
    return jsonify({'success': True, 'message': msg, 'trade': trade})

@app.route('/api/trades/<int:trade_id>', methods=['DELETE', 'PUT'])
def api_trade_detail(trade_id):
    """API endpoint to delete or update specific trade."""
    trades = load_json(TRADES_FILE)
    existing_index = next((i for i, t in enumerate(trades) if t.get('id') == trade_id), None)
    
    if existing_index is None:
        return jsonify({'success': False, 'message': 'Trade not found'}), 404
        
    if request.method == 'DELETE':
        trades.pop(existing_index)
        save_json(TRADES_FILE, trades)
        return jsonify({'success': True, 'message': 'Trade deleted successfully'})
    
    elif request.method == 'PUT':
        data = request.get_json() or {}
        trades[existing_index].update(data)
        save_json(TRADES_FILE, trades)
        return jsonify({'success': True, 'message': 'Trade updated successfully', 'trade': trades[existing_index]})

@app.route('/api/trades/clear', methods=['POST'])
def api_clear_trades():
    """Clear all trades."""
    save_json(TRADES_FILE, [])
    return jsonify({'success': True, 'message': 'All trades cleared successfully'})

@app.route('/api/trades/import', methods=['POST'])
def api_import_trades():
    """Import trades list."""
    data = request.get_json() or []
    if isinstance(data, list):
        save_json(TRADES_FILE, data)
        return jsonify({'success': True, 'message': f'Successfully imported {len(data)} trades'})
    return jsonify({'success': False, 'message': 'Invalid data format'}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting TradeTrack Pro Flask server on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
