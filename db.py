# ============================================================
#  db.py — koneksi MySQL terpusat
#  Kredensial diambil dari environment variable, bukan hardcode.
#  - Saat LOKAL: baca dari file .env (lewat python-dotenv)
#  - Saat di HOSTING (Railway): otomatis kebaca dari Variables
# ============================================================
import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()  # baca file .env kalau ada (untuk development lokal)


def get_db():
    return mysql.connector.connect(
        host=os.environ.get("MYSQLHOST", "localhost"),
        user=os.environ.get("MYSQLUSER", "root"),
        password=os.environ.get("MYSQLPASSWORD", ""),
        database=os.environ.get("MYSQLDATABASE", "silat"),
        port=os.environ.get("MYSQLPORT", 3306)
    )