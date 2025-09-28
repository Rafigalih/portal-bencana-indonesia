document.addEventListener('DOMContentLoaded', () => {
  const daftarGempaDiv = document.getElementById('daftar-gempa');
  const infoGunungApiDiv = document.getElementById('info-gunungapi');

  // --- 1. Inisialisasi Peta ---
  const map = L.map('map').setView([-2.5, 118.0], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // --- 2. Siapkan "Wadah" Layer untuk Setiap Jenis Bencana ---
  const gempaLayer = L.layerGroup().addTo(map);
  const gunungApiLayer = L.layerGroup().addTo(map);

  // --- 3. Buat Kontrol untuk Memilih Layer ---
  const overlayLayers = {
    "Gempa Bumi": gempaLayer,
    "Gunung Api": gunungApiLayer
  };
  L.control.layers(null, overlayLayers).addTo(map);

  // --- 4. Ambil Data Gempa dan Masukkan ke Layer Gempa ---
  fetch('/api/gempa')
    .then(response => response.json())
    .then(data => {
      let daftarHtml = '<ul>';
      data.Infogempa.gempa.forEach(gempa => {
        daftarHtml += `<li>${gempa.Tanggal}, ${gempa.Jam} | M ${gempa.Magnitude} | ${gempa.Wilayah}</li>`;

        // Tambahkan marker untuk SETIAP gempa ke dalam gempaLayer
        const coords = gempa.Coordinates.split(',').map(Number);
        L.marker(coords).addTo(gempaLayer)
          .bindPopup(`<b>M ${gempa.Magnitude}</b><br>${gempa.Wilayah}`);
      });
      daftarGempaDiv.innerHTML = daftarHtml + '</ul>';
    });

  // --- 5. Ambil Data Gunung Api dan Masukkan ke Layer Gunung Api ---
  fetch('/api/gunungapi')
    .then(response => response.json())
    .then(data => {
      let gunungHtml = '<ul>';
      data.data.forEach(gunung => {
        gunungHtml += `<li><b>${gunung.nama}</b> - Level ${gunung.level_text}</li>`;

        // Tambahkan marker untuk SETIAP gunung ke dalam gunungApiLayer
        L.marker(gunung.coordinates).addTo(gunungApiLayer)
          .bindPopup(`<b>${gunung.nama}</b><br>Status: ${gunung.level_text}`);
      });
      infoGunungApiDiv.innerHTML = gunungHtml + '</ul>';
    });
});