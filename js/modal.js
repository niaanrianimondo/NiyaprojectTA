// ============================================================
//  modal.js — Buka, tutup, dan isi modal form
//  Bergantung pada: data.js
// ============================================================

function openModal() {
    editId = null;
    document.querySelector('#modalForm .panel-header').textContent = 'INPUT DATA ATLET BARU';
    document.getElementById('atletForm').reset();
    document.getElementById('btn-save-label').textContent = 'SIMPAN DATA';
    document.getElementById('modalForm').style.display = 'flex';
}

function openEditModal(id) {
    const a = atletList.find(x => x.id === id);
    if (!a) return;

    editId = id;
    document.querySelector('#modalForm .panel-header').textContent = 'EDIT DATA ATLET';
    document.getElementById('atlet-nama').value = a.nama;
    document.getElementById('atlet-gender').value = a.gender;
    document.getElementById('atlet-kelas').value = a.kelas;
    document.getElementById('btn-save-label').textContent = 'UPDATE DATA';
    document.getElementById('modalForm').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalForm').style.display = 'none';
    editId = null;
}