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

  function getGayaGempa(magnitudo) {
    let warna = 'green';
    if (magnitudo >= 5.0) { warna = '#d9534f'; } 
    else if (magnitudo >= 4.0) { warna = '#f0ad4e'; }
    return {
      radius: magnitudo * 2,
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

        // --- PERUBAHAN UTAMA DI SINI ---
        // Membuat struktur HTML yang lebih kompleks untuk setiap item gempa
        daftarHtml += `
          <a href="#" class="list-group-item list-group-item-action gempa-item" data-lat="${lat}" data-lng="${lng}">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">M ${magnitudo}</h5>
              <small class="text-muted">${gempa.Tanggal}</small>
            </div>
            <p class="mb-1">${gempa.Wilayah}</p>
            <small class="text-muted">Kedalaman: ${gempa.Kedalaman}</small>
          </a>`;

        L.circleMarker([lat, lng], getGayaGempa(magnitudo))
          .addTo(gempaLayer)
          .bindPopup(`<b>M ${magnitudo}</b><br>${gempa.Wilayah}`);
      });
      daftarGempaDiv.innerHTML = daftarHtml;

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

  // Ambil Data Gunung Api
  fetch('/api/gunungapi')
    .then(response => response.json())
    .then(data => {
      gunungApiLayer.clearLayers();
      let gunungHtml = '';
      data.data.forEach(gunung => {
        // --- PERUBAHAN UTAMA DI SINI ---
        // Membuat struktur HTML yang lebih kompleks untuk setiap item gunung api
        gunungHtml += `
          <div class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">${gunung.nama}</h5>
              <span class="badge bg-danger rounded-pill">${gunung.level_text}</span>
            </div>
          </div>`;
        L.marker(gunung.coordinates).addTo(gunungApiLayer)
          .bindPopup(`<b>${gunung.nama}</b><br>Status: ${gunung.level_text}`);
      });
      infoGunungApiDiv.innerHTML = gunungHtml;
    });
});