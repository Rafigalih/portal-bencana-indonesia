document.addEventListener('DOMContentLoaded', () => {
  const historyBody = document.getElementById('history-body');

  // Ambil data dari API historis
  fetch('/api/gempa/historis')
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="4">Belum ada data riwayat yang tersimpan.</td></tr>';
        return;
      }

      let tableRows = '';
      // Ulangi setiap data gempa
      data.forEach(gempa => {
        // Buat satu baris tabel (<tr>) untuk setiap gempa
        tableRows += `
          <tr>
            <td>${gempa.DateTime}</td>
            <td>${gempa.Magnitude}</td>
            <td>${gempa.Kedalaman}</td>
            <td>${gempa.Wilayah}</td>
          </tr>
        `;
      });

      // Masukkan semua baris yang sudah dibuat ke dalam tabel
      historyBody.innerHTML = tableRows;
    })
    .catch(error => {
      console.error("Gagal mengambil data riwayat:", error);
      historyBody.innerHTML = '<tr><td colspan="4">Terjadi kesalahan saat memuat data.</td></tr>';
    });
});