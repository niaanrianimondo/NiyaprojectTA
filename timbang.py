# ============================================================
#  routes/timbang.py — simpan hasil timbangan ke database
#
#  Manual dulu (dipanggil dari tombol di Admin panel) sampai alat
#  timbangan fisik siap. Begitu Timbangan.js sudah bisa baca alat,
#  tinggal panggil endpoint yang sama ini secara otomatis dengan
#  id atlet yang sedang terdeteksi wajahnya
#  (ambil dari GET /api/get-status di routes/kamera.py).
# ============================================================
from flask import Blueprint, jsonify, request
from db import get_db

timbang_bp = Blueprint('timbang_bp', __name__)


@timbang_bp.route('/api/update-berat', methods=['POST'])
def update_berat():
    data = request.json or {}
    atlet_id = data.get('id')
    berat = data.get('berat')

    if atlet_id is None or berat is None:
        return jsonify({"status": "error", "message": "id dan berat wajib diisi"}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "UPDATE atlet SET berat=%s, berat_updated_at=NOW() WHERE id=%s",
            (berat, atlet_id)
        )
        db.commit()
        affected = cursor.rowcount
        cursor.close()
        db.close()
        if affected == 0:
            return jsonify({"status": "error", "message": "Atlet tidak ditemukan"}), 404
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500