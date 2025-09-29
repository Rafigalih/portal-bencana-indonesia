document.addEventListener('DOMContentLoaded', () => {
  // --- Elemen UI ---
  const daftarGempaDiv = document.getElementById('daftar-gempa');
  const infoGunungApiDiv = document.getElementById('info-gunungapi');
  const infoCuacaDiv = document.getElementById('info-cuaca');
  const lokasiPenggunaSelect = document.getElementById('lokasi-pengguna');

  // --- Data Kota & Pengaturan ---
  const KOTA_INDONESIA = [
    { nama: 'Jakarta', lat: -6.2088, lng: 106.8456 },
    { nama: 'Surabaya', lat: -7.2575, lng: 112.7521 },
    { nama: 'Bandung', lat: -6.9175, lng: 107.6191 },
    { nama: 'Medan', lat: 3.5952, lng: 98.6722 },
    { nama: 'Semarang', lat: -6.9667, lng: 110.4381 },
    { nama: 'Makassar', lat: -5.1477, lng: 119.4327 },
    { nama: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
    { nama: 'Denpasar', lat: -8.6705, lng: 115.2126 },
    { nama: 'Padang', lat: -0.9471, lng: 100.4172 }
  ];
  const RADIUS_PERINGATAN = 250; // dalam km

  // --- Inisialisasi Peta & Layer ---
  const map = L.map('map').setView([-2.5, 118.0], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { /* ... */ }).addTo(map);
  const gempaLayer = L.layerGroup().addTo(map);
  const gunungApiLayer = L.layerGroup().addTo(map);
  L.control.layers(null, { "Gempa Bumi": gempaLayer, "Gunung Api": gunungApiLayer }).addTo(map);

  // --- Fungsi Bantuan ---
  function getGayaGempa(magnitudo) { /* ... */ }

  // Fungsi menghitung jarak antara 2 titik (Haversine formula)
  function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // --- Logika Utama ---
  // Fungsi untuk mengambil dan menampilkan semua data
  function updateSemuaData() {
    const lokasiTersimpan = KOTA_INDONESIA.find(k => k.nama === localStorage.getItem('lokasiPengguna'));

    fetch('/api/gempa')
      .then(response => response.json())
      .then(data => {
        gempaLayer.clearLayers();
        let daftarHtml = '';
        data.Infogempa.gempa.forEach(gempa => {
          const coords = gempa.Coordinates.split(',');
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);

          let kelasDekat = '';
          if (lokasiTersimpan) {
            const jarak = hitungJarak(lokasiTersimpan.lat, lokasiTersimpan.lng, lat, lng);
            if (jarak <= RADIUS_PERINGATAN) {
              kelasDekat = 'dekat'; // Tambahkan kelas 'dekat' jika jaraknya dekat
            }
          }

          // Tambahkan kelas 'dekat' ke HTML jika ada
          daftarHtml += `<a href="#" class="list-group-item list-group-item-action gempa-item ${kelasDekat}" ...>`; 
          // ... (sisa kode pembuatan daftar gempa tetap sama)
        });
        daftarGempaDiv.innerHTML = daftarHtml;
        // ... (logika interaktivitas daftar-ke-peta tetap sama)
      });

    // ... (fetch untuk gunung api dan cuaca tetap sama)
  }

  // --- Inisialisasi Halaman ---
  // Isi dropdown pilihan kota
  KOTA_INDONESIA.forEach(kota => {
    const option = document.createElement('option');
    option.value = kota.nama;
    option.textContent = kota.nama;
    lokasiPenggunaSelect.appendChild(option);
  });

  // Ambil lokasi dari localStorage dan set pilihan dropdown
  const lokasi tersimpan = localStorage.getItem('lokasiPengguna');
  if (lokasiTersimpan) {
    lokasiPenggunaSelect.value = lokasiTersimpan;
  }

  // Tambahkan event listener ke dropdown
  lokasiPenggunaSelect.addEventListener('change', () => {
    localStorage.setItem('lokasiPengguna', lokasiPenggunaSelect.value);
    updateSemuaData(); // Muat ulang data dengan lokasi baru
  });

  // Panggil semua data saat halaman pertama kali dimuat
  updateSemuaData();
});