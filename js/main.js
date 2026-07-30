// ============================================================
//  main.js — Navigasi sidebar & inisialisasi halaman
//  Bergantung pada: data.js, toast.js, modal.js, render.js
// ============================================================

window.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.querySelector('.main-admin');

    // 1. Ambil data terbaru dari MySQL dulu, baru render halaman awal
    await fetchAtletList();
    if (mainContainer) renderKelola(mainContainer);

    // 2. Navigasi Sidebar
    document.querySelectorAll('.side-item').forEach(item => {
        item.addEventListener('click', async function (e) {
            e.preventDefault();
            document.querySelectorAll('.side-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const menu = this.innerText.trim().toUpperCase();
            mainContainer.innerHTML = '';

            // Selalu ambil ulang data terbaru tiap pindah halaman,
            // supaya Laporan Timbang & Kelola Atlet tidak pernah basi.
            await fetchAtletList();

            if (menu.includes('LAPORAN')) renderLaporan(mainContainer);
            else if (menu.includes('SETUP')) renderSetup(mainContainer);
            else renderKelola(mainContainer);
        });
    });

    // 3. Tutup modal klik overlay
    const modalForm = document.getElementById('modalForm');
    if (modalForm) {
        modalForm.addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });
    }

    // 4. Handle Form Submit — langsung ke API MySQL, bukan localStorage/array lokal
    const atletForm = document.getElementById('atletForm');
    if (atletForm) {
        atletForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const nama = document.getElementById('atlet-nama').value.trim();
            const gender = document.getElementById('atlet-gender').value;
            const kelas = document.getElementById('atlet-kelas').value;

            if (!nama) {
                showToast('Nama atlet tidak boleh kosong!', 'error');
                return;
            }

            const payload = { nama, gender, kelas };
            const result = (editId !== null)
                ? await updateAtletToServer(editId, payload)
                : await addAtletToServer(payload);

            if (result.status !== 'success') {
                showToast(result.message || 'Gagal menyimpan data ke server', 'error');
                return;
            }

            showToast(result.message || `${nama} berhasil disimpan.`);
            await fetchAtletList();
            renderAll();
            closeModal();
        });
    }
});