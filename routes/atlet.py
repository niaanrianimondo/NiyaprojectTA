# ============================================================
#  routes/atlet.py — CRUD data atlet (dipakai Admin panel)
# ============================================================
from flask import Blueprint, jsonify, request
from db import get_db

atlet_bp = Blueprint('atlet_bp', __name__)


@atlet_bp.route('/api/get-atlet', methods=['GET'])
def get_atlet():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, nama, gender, kelas, berat, berat_updated_at "
            "FROM atlet ORDER BY nama ASC"
        )
        data = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


@atlet_bp.route('/api/add-atlet', methods=['POST'])
def add_atlet():
    data = request.json or {}
    nama = (data.get('nama') or '').strip()
    gender = data.get('gender', 'Putra')
    kelas = data.get('kelas', 'Kelas A')

    if not nama:
        return jsonify({"status": "error", "message": "Nama tidak boleh kosong"}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO atlet (nama, gender, kelas, berat) VALUES (%s, %s, %s, NULL)",
            (nama, gender, kelas)
        )
        db.commit()
        new_id = cursor.lastrowid
        cursor.close()
        db.close()
        return jsonify({"status": "success", "id": new_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@atlet_bp.route('/api/update-atlet/<int:atlet_id>', methods=['PUT'])
def update_atlet(atlet_id):
    data = request.json or {}
    nama = (data.get('nama') or '').strip()
    gender = data.get('gender', 'Putra')
    kelas = data.get('kelas', 'Kelas A')

    if not nama:
        return jsonify({"status": "error", "message": "Nama tidak boleh kosong"}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "UPDATE atlet SET nama=%s, gender=%s, kelas=%s WHERE id=%s",
            (nama, gender, kelas, atlet_id)
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


@atlet_bp.route('/api/delete-atlet/<int:atlet_id>', methods=['DELETE'])
def delete_atlet(atlet_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM atlet WHERE id=%s", (atlet_id,))
        db.commit()
        affected = cursor.rowcount
        cursor.close()
        db.close()
        if affected == 0:
            return jsonify({"status": "error", "message": "Atlet tidak ditemukan"}), 404
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500