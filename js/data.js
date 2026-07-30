// ============================================================
//  data.js — Variabel global, konstanta, dan fungsi penyimpanan
// ============================================================

// Ganti kalau Flask kamu jalan di alamat/port lain
const API_BASE = 'http://127.0.0.1:5000';

const CLASS_TARGET = {
    "Kelas A": "45-50kg",
    "Kelas B": "50-55kg",
    "Kelas C": "55-60kg",
    "Kelas D": "60-65kg",
    "Kelas E": "65-70kg"
};

// Ubah "45-50kg" jadi {min:45, max:50} untuk dibandingkan dengan berat asli
function parseTargetRange(kelas) {
    const raw = CLASS_TARGET[kelas];
    if (!raw) return null;
    const [min, max] = raw.replace('kg', '').split('-').map(Number);
    return { min, max };
}

// ── Hitung status SAH / GAGAL / BELUM TIMBANG untuk satu atlet ──
// Toleransi (dari Sistem Setup) ditambahkan ke batas MAKSIMAL kelas saja,
// contoh: toleransi 0.1 -> berat 50.1kg di Kelas A tetap SAH.
function getStatusTimbang(atlet) {
    const berat = parseFloat(atlet.berat);

    if (!berat || berat <= 0) {
        return { label: 'BELUM TIMBANG', kelasCss: 'belum', icon: 'clock' };
    }

    const range = parseTargetRange(atlet.kelas);
    if (!range) {
        return { label: 'KELAS TIDAK VALID', kelasCss: 'gagal', icon: 'circle-x' };
    }

    const toleransi = parseFloat(localStorage.getItem('siladash_toleransi')) || 0;
    const batasMax = range.max + toleransi;

    if (berat >= range.min && berat <= batasMax) {
        return { label: 'SAH', kelasCss: 'sah', icon: 'circle-check' };
    }
    return { label: 'GAGAL', kelasCss: 'gagal', icon: 'circle-x' };
}

let atletList = [];   // cache lokal, selalu diisi ulang dari server lewat fetchAtletList()
let editId = null;    // id atlet (dari MySQL) yang sedang diedit

// ── Ambil semua atlet dari server ──
async function fetchAtletList() {
    try {
        const res = await fetch(`${API_BASE}/api/get-atlet`);
        const json = await res.json();
        if (json.status !== 'success') {
            showToast(json.message || 'Gagal memuat data atlet', 'error');
            atletList = [];
            return atletList;
        }
        atletList = json.data;
        return atletList;
    } catch (err) {
        showToast('Tidak bisa terhubung ke server. Pastikan Flask sedang berjalan.', 'error');
        atletList = [];
        return atletList;
    }
}

// ── Tambah atlet baru ──
async function addAtletToServer(payload) {
    try {
        const res = await fetch(`${API_BASE}/api/add-atlet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (err) {
        return { status: 'error', message: 'Tidak bisa terhubung ke server.' };
    }
}

// ── Update data identitas atlet (nama/gender/kelas) ──
async function updateAtletToServer(id, payload) {
    try {
        const res = await fetch(`${API_BASE}/api/update-atlet/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (err) {
        return { status: 'error', message: 'Tidak bisa terhubung ke server.' };
    }
}

// ── Update HANYA berat hasil timbang (dipakai di halaman Laporan Timbang) ──
async function updateBeratToServer(id, berat) {
    try {
        const res = await fetch(`${API_BASE}/api/update-berat/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ berat })
        });
        return await res.json();
    } catch (err) {
        return { status: 'error', message: 'Tidak bisa terhubung ke server.' };
    }
}

// ── Hapus atlet ──
async function deleteAtletFromServer(id) {
    try {
        const res = await fetch(`${API_BASE}/api/delete-atlet/${id}`, {
            method: 'DELETE'
        });
        return await res.json();
    } catch (err) {
        return { status: 'error', message: 'Tidak bisa terhubung ke server.' };
    }
}