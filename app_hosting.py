# ============================================================
#  app_hosting.py — versi hosting dengan penyajian file statis
# ============================================================
from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.atlet import atlet_bp
from routes.timbang import timbang_bp
import os

app = Flask(__name__)
CORS(app)

app.register_blueprint(atlet_bp)
app.register_blueprint(timbang_bp)

# Halaman utama → arahkan ke Admin.html
@app.route('/')
def index():
    return send_from_directory('.', 'Admin.html')

# Sajikan file apa pun (Admin.html, monitoring.html, CSS, JS)
@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('.', filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
