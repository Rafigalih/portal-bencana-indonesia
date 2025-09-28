document.addEventListener('DOMContentLoaded', () => {
  const historyBody = document.getElementById('history-body');
  const filterWilayah = document.getElementById('filter-wilayah');
  const filterMagnitudo = document.getElementById('filter-magnitudo');

  let semuaGempa = []; // Variabel untuk menyimpan semua data asli

  // Fungsi untuk menampilkan data ke tabel
  function renderTable(dataArray) {
    if (dataArray.length === 0) {
      historyBody.innerHTML = '<tr><td colspan="4">Data tidak ditemukan.</td></tr>';
      return;
    }

    let tableRows = '';
    dataArray.forEach(gempa => {
      tableRows += `
        <tr>
          <td>${gempa.DateTime.replace('T', ' ').replace('Z', '')}</td>
          <td>${gempa.Magnitude}</td>
          <td>${gempa.Kedalaman}</td>
          <td>${gempa.Wilayah}</td>
        </tr>
      `;
    });
    historyBody.innerHTML = tableRows;
  }

  // Fungsi untuk melakukan filter
  function applyFilters() {
    const teksWilayah = filterWilayah.value.toLowerCase();
    const minMagnitudo = parseFloat(filterMagnitudo.value) || 0;

    const dataTersaring = semuaGempa.filter(gempa => {
      const cocokWilayah = gempa.Wilayah.toLowerCase().includes(teksWilayah);
      const cocokMagnitudo = parseFloat(gempa.Magnitude) >= minMagnitudo;
      return cocokWilayah && cocokMagnitudo;
    });

    renderTable(dataTersaring);
  }

  // Ambil data dari API saat halaman pertama kali dimuat
  fetch('/api/gempa/historis')
    .then(response => response.json())
    .then(data => {
      semuaGempa = data; // Simpan data asli
      renderTable(semuaGempa); // Tampilkan semua data untuk pertama kali
    })
    .catch(error => {
      console.error("Gagal mengambil data riwayat:", error);
      historyBody.innerHTML = '<tr><td colspan="4">Terjadi kesalahan saat memuat data.</td></tr>';
    });

  // Tambahkan 'pendengar' ke input filter
  filterWilayah.addEventListener('input', applyFilters);
  filterMagnitudo.addEventListener('input', applyFilters);
});