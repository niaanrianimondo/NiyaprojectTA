# ============================================================
#  app_hosting.py — INI yang akan di-deploy ke Railway
#  Tidak ada import cv2/serial sama sekali, biar tidak error di cloud.
# ============================================================
from flask import Flask
from flask_cors import CORS
from routes.atlet import atlet_bp
from routes.timbang import timbang_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(atlet_bp)
app.register_blueprint(timbang_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)