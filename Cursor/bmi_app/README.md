# BMI Calculator Web Application

A full-stack BMI (Body Mass Index) calculator with HTML, CSS, JavaScript, Python (Flask), and SQLite.

## Features

- **Calculate BMI** — Enter weight (kg) and height (cm) to get your BMI
- **Category interpretation** — Underweight, Normal, Overweight, or Obese
- **History tracking** — All calculations saved to SQLite database
- **Delete entries** — Remove unwanted records from history

## Setup

1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python app.py
   ```

4. Open your browser to **http://127.0.0.1:5000**

## Project Structure

```
bmi_app/
├── app.py           # Flask backend with SQLite
├── index.html       # Main HTML page
├── static/
│   ├── style.css    # Styling
│   └── app.js       # Frontend logic & API calls
├── bmi.db           # SQLite database (created on first run)
├── requirements.txt
└── README.md
```

## Tech Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **Backend:** Python Flask
- **Database:** SQLite
