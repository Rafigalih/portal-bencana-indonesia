const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { parseString } = require('xml2js');

const app = express();
const PORT = 3000;
const DB_FILE = 'database_gempa.json';

// ... (kode dataGunungApi dan middleware lainnya tetap sama)
const dataGunungApi = { "data": [ /* ... */ ] };
app.use(express.static(__dirname));
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.get('/api/gempa', async (req, res) => { /* ... */ });
app.get('/api/gunungapi', (req, res) => { res.json(dataGunungApi); });
app.get('/api/gempa/historis', (req, res) => { /* ... */ });


// --- ENDPOINT CUACA DENGAN PENANGANAN ERROR YANG LEBIH BAIK ---
app.get('/api/cuaca', async (req, res) => {
  try {
    const response = await axios.get('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-JawaBarat.xml');

    parseString(response.data, (err, result) => {
      // --- PERBAIKAN UTAMA ADA DI SINI ---
      // Jika ada error saat proses parsing XML, tangani di sini.
      if (err) {
        console.error("XML Parsing Error:", err.message);
        // Kirim response error yang jelas ke browser dan hentikan eksekusi
        return res.status(500).json({ message: 'Gagal memproses data XML dari BMKG karena format tidak valid.' });
      }

      const areaBekasi = result.data.forecast[0].area.find(a => a.$.description === 'Bekasi');
      if (!areaBekasi) {
        return res.status(404).json({ message: 'Data cuaca Bekasi tidak ditemukan.' });
      }

      const temperatur = areaBekasi.parameter.find(p => p.$.id === 't').timerange[0].value[0]._;
      const cuacaCode = areaBekasi.parameter.find(p => p.$.id === 'weather').timerange[0].value[0]._;

      const cuacaData = {
        kota: 'Bekasi',
        temperatur: `${temperatur}°C`,
        cuaca: getNamaCuaca(cuacaCode)
      };

      res.json(cuacaData);
    });
  } catch (error) {
    console.error("Gagal mengambil data cuaca:", error.message);
    res.status(500).json({ message: 'Gagal mengambil data cuaca dari server BMKG.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// --- FUNGSI BANTUAN (TETAP SAMA) ---
function getNamaCuaca(code) { /* ... */ }