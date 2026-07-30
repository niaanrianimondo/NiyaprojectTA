// ============================================================
//  render.js — Render halaman & tabel
//  Bergantung pada: data.js, toast.js
// ============================================================

// ── Render satu tabel berdasarkan gender ─────────────────────
function renderTable(gender) {
    const list = atletList.filter(a => a.gender === gender);
    const tbody = document.getElementById(`tbody-${gender.toLowerCase()}`);
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="4">
                <div class="empty-state">
                    <i class="ti ti-database-off"></i>
                    <p>BELUM ADA DATA ATLET ${gender.toUpperCase()}</p>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(a => `
        <tr>
            <td><strong>${a.nama}</strong></td>
            <td><span class="badge-kelas">${a.kelas}</span></td>
            <td><span class="badge-target">${CLASS_TARGET[a.kelas] || '-'}</span></td>
            <td>
                <button class="btn-icon edit"   onclick="openEditModal(${a.id})" title="Edit"><i class="ti ti-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteAtlet(${a.id})"   title="Hapus"><i class="ti ti-trash"></i></button>
            </td>
        </tr>`).join('');
}

// ── Update stat cards ─────────────────────────────────────────
function refreshStats() {
    const putra = atletList.filter(a => a.gender === 'Putra').length;
    const putri = atletList.filter(a => a.gender === 'Putri').length;
    const totalEl = document.getElementById('count-total');
    const putraEl = document.getElementById('count-putra');
    const putriEl = document.getElementById('count-putri');
    if (totalEl) totalEl.innerText = atletList.length;
    if (putraEl) putraEl.innerText = putra;
    if (putriEl) putriEl.innerText = putri;
}

function renderAll() {
    renderTable('Putra');
    renderTable('Putri');
    refreshStats();
}

// ── Hapus atlet (langsung ke MySQL lewat API) ─────────────────
async function deleteAtlet(id) {
    const atlet = atletList.find(a => a.id === id);
    if (!atlet) return;
    if (!confirm(`Hapus data "${atlet.nama}"?`)) return;

    const result = await deleteAtletFromServer(id);
    if (result.status !== 'success') {
        showToast(result.message || 'Gagal menghapus data', 'error');
        return;
    }

    await fetchAtletList();
    renderAll();
    showToast('Data berhasil dihapus.', 'error');
}

// ── Halaman: Kelola Atlet ─────────────────────────────────────
function renderKelola(container) {
    container.innerHTML = `
        <header class="admin-top-bar">
            <div class="title-section">
                <h2>Manajemen Data Atlet</h2>
                <p class="text-dim">Pendaftaran dan modifikasi data peserta pencak silat.</p>
            </div>
            <button class="btn-primary" onclick="openModal()">
                <i class="ti ti-plus"></i> TAMBAH ATLET
            </button>
        </header>

        <div class="admin-stats-grid">
            <div class="stat-card">
                <span class="stat-label">TOTAL TERDAFTAR</span>
                <span class="stat-value mono" id="count-total">0</span>
            </div>
            <div class="stat-card stat-putra">
                <span class="stat-label"><i class="ti ti-mars"></i> ATLET PUTRA</span>
                <span class="stat-value mono" id="count-putra">0</span>
            </div>
            <div class="stat-card stat-putri">
                <span class="stat-label"><i class="ti ti-venus"></i> ATLET PUTRI</span>
                <span class="stat-value mono" id="count-putri">0</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">KELAS AKTIF</span>
                <span class="stat-value" style="font-size:16px;letter-spacing:2px;">A B C D E</span>
            </div>
        </div>

        <!-- TABEL PUTRA -->
        <div class="panel table-panel table-putra">
            <div class="panel-header"><i class="ti ti-mars"></i> DATABASE ATLET PUTRA</div>
            <div class="table-wrap">
                <table>
                    <thead><tr>
                        <th>NAMA LENGKAP</th><th>KELAS TANDING</th><th>TARGET BERAT</th><th>AKSI</th>
                    </tr></thead>
                    <tbody id="tbody-putra"></tbody>
                </table>
            </div>
        </div>

        <!-- TABEL PUTRI -->
        <div class="panel table-panel table-putri" style="margin-top:24px;">
            <div class="panel-header"><i class="ti ti-venus"></i> DATABASE ATLET PUTRI</div>
            <div class="table-wrap">
                <table>
                    <thead><tr>
                        <th>NAMA LENGKAP</th><th>KELAS TANDING</th><th>TARGET BERAT</th><th>AKSI</th>
                    </tr></thead>
                    <tbody id="tbody-putri"></tbody>
                </table>
            </div>
        </div>`;

    renderAll();
}

// ── Halaman: Laporan Timbang ──────────────────────────────────
function renderLaporan(container) {
    const toleransi = localStorage.getItem('siladash_toleransi') || '0.0';

    container.innerHTML = `
        <header class="admin-top-bar">
            <div class="title-section">
                <h2>Laporan Timbang</h2>
                <p class="text-dim">Rekapitulasi kesiapan berat badan atlet.
                    <span style="color:var(--accent)">Toleransi: ${toleransi}kg</span>
                </p>
            </div>
        </header>

        <div class="panel table-panel">
            <div class="panel-header"><i class="ti ti-file-text"></i> STATUS VALIDASI BERAT</div>
            <div class="table-wrap">
                <table>
                    <thead><tr>
                        <th>NAMA ATLET</th><th>GENDER</th><th>KELAS</th><th>TARGET</th><th>BERAT AKTUAL</th><th>STATUS</th>
                    </tr></thead>
                    <tbody>
                        ${atletList.length === 0
            ? `<tr><td colspan="6">
                                <div class="empty-state">
                                    <i class="ti ti-database-off"></i>
                                    <p>TIDAK ADA DATA UNTUK DILAPORKAN</p>
                                </div>
                               </td></tr>`
            : atletList.map(a => {
                const status = getStatusTimbang(a);
                const beratVal = (a.berat && a.berat > 0) ? a.berat : '';
                return `
                                <tr>
                                    <td><strong>${a.nama}</strong></td>
                                    <td><span class="gender-badge ${a.gender.toLowerCase()}">
                                        <i class="ti ti-${a.gender === 'Putra' ? 'mars' : 'venus'}"></i> ${a.gender}
                                    </span></td>
                                    <td><span class="badge-kelas">${a.kelas}</span></td>
                                    <td class="mono">${CLASS_TARGET[a.kelas] || '-'}</td>
                                    <td>
                                        <input type="number" step="0.1" class="input-berat mono"
                                            id="berat-${a.id}" placeholder="kg" value="${beratVal}">
                                        <button class="btn-icon edit" title="Simpan berat"
                                            onclick="simpanBerat(${a.id})">
                                            <i class="ti ti-device-floppy"></i>
                                        </button>
                                    </td>
                                    <td>
                                        <span class="status-badge status-${status.kelasCss}">
                                            <i class="ti ti-${status.icon}"></i> ${status.label}
                                        </span>
                                    </td>
                                </tr>`;
            }).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
}

// ── Simpan hasil timbang satu atlet, lalu refresh laporan ─────
async function simpanBerat(id) {
    const input = document.getElementById(`berat-${id}`);
    const berat = parseFloat(input.value);

    if (!berat || berat <= 0) {
        showToast('Masukkan berat yang valid (lebih dari 0).', 'error');
        return;
    }

    const result = await updateBeratToServer(id, berat);
    if (result.status !== 'success') {
        showToast(result.message || 'Gagal menyimpan berat', 'error');
        return;
    }

    await fetchAtletList();
    renderLaporan(document.querySelector('.main-admin'));
    showToast(`Berat ${berat}kg berhasil disimpan.`);
}

// ── Halaman: Sistem Setup ─────────────────────────────────────
function renderSetup(container) {
    const savedToleransi = localStorage.getItem('siladash_toleransi') || '0.0';

    container.innerHTML = `
        <header class="admin-top-bar">
            <div class="title-section">
                <h2>Sistem Setup</h2>
                <p class="text-dim">Konfigurasi parameter ambang batas timbangan digital.</p>
            </div>
        </header>

        <div class="panel" style="max-width:500px;">
            <div class="panel-header"><i class="ti ti-settings"></i> KONFIGURASI TOLERANSI</div>
            <div style="padding:25px;">
                <div class="form-group">
                    <label>TOLERANSI BERAT (KG)</label>
                    <input type="number" id="input-toleransi" step="0.1" value="${savedToleransi}" class="mono">
                    <p style="font-size:11px;color:#888;margin-top:10px;line-height:1.6;">
                        Nilai ini ditambahkan ke batas maksimal kelas.<br>
                        Contoh: toleransi 0.1 → berat 50.1kg di Kelas A tetap SAH.
                    </p>
                </div>
                <button class="btn-save" onclick="saveSystemSetup()"
                    style="width:100%;padding:12px;margin-top:20px;cursor:pointer;">
                    <i class="ti ti-device-floppy"></i> SIMPAN PERUBAHAN
                </button>
            </div>
        </div>`;
}

function saveSystemSetup() {
    const val = document.getElementById('input-toleransi').value;
    localStorage.setItem('siladash_toleransi', val);
    showToast(`Toleransi diatur ke ${val} kg`);
}