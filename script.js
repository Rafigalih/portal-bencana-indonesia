document.addEventListener('DOMContentLoaded', () => {
  const daftarGempaDiv = document.getElementById('daftar-gempa');
  const infoGunungApiDiv = document.getElementById('info-gunungapi');

  const map = L.map('map').setView([-2.5, 118.0], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const gempaLayer = L.layerGroup().addTo(map);
  const gunungApiLayer = L.layerGroup().addTo(map);
  const overlayLayers = { "Gempa Bumi": gempaLayer, "Gunung Api": gunungApiLayer };
  L.control.layers(null, overlayLayers).addTo(map);

  // --- FUNGSI BARU UNTUK MENENTUKAN GAYA MARKER ---
  function getGayaGempa(magnitudo) {
    let warna = 'green';
    if (magnitudo >= 5.0) {
      warna = '#d9534f'; // Merah
    } else if (magnitudo >= 4.0) {
      warna = '#f0ad4e'; // Oranye
    }
    return {
      radius: magnitudo * 2, // Ukuran lingkaran sebanding dengan magnitudo
      fillColor: warna,
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
  }

  // Ambil Data Gempa
  fetch('/api/gempa')
    .then(response => response.json())
    .then(data => {
      gempaLayer.clearLayers();
      let daftarHtml = '';
      data.Infogempa.gempa.forEach(gempa => {
        const coords = gempa.Coordinates.split(',');
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        const magnitudo = parseFloat(gempa.Magnitude);

        // Bagian daftar teks (tidak berubah)
        daftarHtml += `<a href="#" class="list-group-item list-group-item-action small gempa-item" data-lat="${lat}" data-lng="${lng}">
                         <b>M ${magnitudo}</b> - ${gempa.Wilayah}
                         <div class="text-muted" style="font-size: 0.8em;">${gempa.Tanggal} | ${gempa.Jam}</div>
                       </a>`;

        // --- LOGIKA MARKER PETA YANG DIPERBARUI ---
        // Gunakan L.circleMarker dengan gaya dari fungsi kita
        L.circleMarker([lat, lng], getGayaGempa(magnitudo))
          .addTo(gempaLayer)
          .bindPopup(`<b>M ${magnitudo}</b><br>${gempa.Wilayah}`);
      });
      daftarGempaDiv.innerHTML = daftarHtml;

      // Bagian interaktivitas daftar (tidak berubah)
      const gempaItems = document.querySelectorAll('.gempa-item');
      gempaItems.forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          const lat = this.dataset.lat;
          const lng = this.dataset.lng;
          map.setView([lat, lng], 9);
        });
      });
    });

  // Ambil Data Gunung Api (tidak ada perubahan)
  fetch('/api/gunungapi')
    .then(response => response.json())
    // ... (kode untuk gunung api tetap sama persis)
    .then(data => {
        gunungApiLayer.clearLayers();
        let gunungHtml = '';
        data.data.forEach(gunung => {
            gunungHtml += `<div class="list-group-item list-group-item-action"><b>${gunung.nama}</b><span class="badge bg-danger float-end">${gunung.level_text}</span></div>`;
            L.marker(gunung.coordinates).addTo(gunungApiLayer).bindPopup(`<b>${gunung.nama}</b><br>Status: ${gunung.level_text}`);
        });
        infoGunungApiDiv.innerHTML = gunungHtml;
    });
});