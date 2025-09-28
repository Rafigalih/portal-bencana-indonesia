document.addEventListener('DOMContentLoaded', () => {
  const daftarGempaDiv = document.getElementById('daftar-gempa');
  const infoGunungApiDiv = document.getElementById('info-gunungapi');
  // ... (kode div cuaca tetap sama)

  const map = L.map('map').setView([-2.5, 118.0], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // ... (kode layer dan kontrol peta tetap sama)
  const gempaLayer = L.layerGroup().addTo(map);
  const gunungApiLayer = L.layerGroup().addTo(map);
  const overlayLayers = { "Gempa Bumi": gempaLayer, "Gunung Api": gunungApiLayer };
  L.control.layers(null, overlayLayers).addTo(map);

  // ... (fungsi getGayaGempa tetap sama)
  function getGayaGempa(magnitudo) { /* ... */ }

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

        // BARU: Buat ID unik untuk setiap item daftar gempa
        const gempaId = `gempa-${gempa.DateTime.replace(/[: Z]/g, '')}`;

        daftarHtml += `
          <a href="#" id="${gempaId}" class="list-group-item list-group-item-action gempa-item" data-lat="${lat}" data-lng="${lng}">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">M ${magnitudo}</h5>
              <small class="text-muted">${gempa.Tanggal}</small>
            </div>
            <p class="mb-1">${gempa.Wilayah}</p>
            <small class="text-muted">Kedalaman: ${gempa.Kedalaman}</small>
          </a>`;

        // BARU: Tambahkan event 'click' pada marker
        L.circleMarker([lat, lng], getGayaGempa(magnitudo))
          .addTo(gempaLayer)
          .bindPopup(`<b>M ${magnitudo}</b><br>${gempa.Wilayah}`)
          .on('click', function() {
            // Hapus highlight dari item sebelumnya
            document.querySelectorAll('.gempa-item.highlight').forEach(el => el.classList.remove('highlight'));

            // Temukan item daftar yang sesuai dan tambahkan highlight
            const listItem = document.getElementById(gempaId);
            if (listItem) {
              listItem.classList.add('highlight');
              // Gulir daftar agar item terlihat
              listItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
      });
      daftarGempaDiv.innerHTML = daftarHtml;

      // ... (logika interaktivitas daftar-ke-peta tetap sama)
      const gempaItems = document.querySelectorAll('.gempa-item');
      gempaItems.forEach(item => { /* ... */ });
    });

  // ... (kode fetch untuk gunung api dan cuaca tetap sama)
  fetch('/api/gunungapi').then(response => response.json()).then(data => { /* ... */ });
  fetch('/api/cuaca').then(response => response.json()).then(data => { /* ... */ });
});