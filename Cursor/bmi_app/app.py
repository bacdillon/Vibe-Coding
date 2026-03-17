"""
BMI Calculator - Flask backend with SQLite database
"""
import sqlite3
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='static')
DB_PATH = Path(__file__).parent / 'bmi.db'


def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the SQLite database and create tables."""
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS bmi_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            weight REAL NOT NULL,
            height REAL NOT NULL,
            bmi REAL NOT NULL,
            name TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()


@app.route('/')
def index():
    """Serve the main HTML page."""
    return send_from_directory(Path(__file__).parent, 'index.html')


@app.route('/api/calculate', methods=['POST'])
def calculate():
    """Save a BMI calculation to the database."""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    weight = data.get('weight')
    height = data.get('height')
    bmi = data.get('bmi')
    name = data.get('name', '')

    if weight is None or height is None or bmi is None:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO bmi_records (weight, height, bmi, name) VALUES (?, ?, ?, ?)',
            (float(weight), float(height), float(bmi), str(name)[:100])
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/history')
def history():
    """Get BMI calculation history (most recent first)."""
    try:
        conn = get_db()
        rows = conn.execute(
            'SELECT id, weight, height, bmi, name, created_at FROM bmi_records ORDER BY created_at DESC LIMIT 20'
        ).fetchall()
        conn.close()

        history_list = [
            {
                'id': row['id'],
                'weight': row['weight'],
                'height': row['height'],
                'bmi': row['bmi'],
                'name': row['name'] or '',
                'created_at': row['created_at'],
            }
            for row in rows
        ]
        return jsonify({'success': True, 'history': history_list})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/history/<int:record_id>', methods=['DELETE'])
def delete_record(record_id):
    """Delete a BMI record."""
    try:
        conn = get_db()
        conn.execute('DELETE FROM bmi_records WHERE id = ?', (record_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
