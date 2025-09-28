const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs'); // Impor modul File System

const app = express();
const PORT = 3000;
const DB_FILE = 'database_gempa.json'; // Nama file database kita

// DATA CONTOH GUNUNG API
const dataGunungApi = {
  "data": [
    { "nama": "Gunung Merapi", "level": 3, "level_text": "Siaga", "coordinates": [-7.541, 110.445] },
    { "nama": "Gunung Semeru", "level": 3, "level_text": "Siaga", "coordinates": [-8.108, 112.922] },
    { "nama": "Gunung Anak Krakatau", "level": 2, "level_text": "Waspada", "coordinates": [-6.102, 105.423] }
  ]
};

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/gempa', async (req, res) => {
  try {
    const response = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json');
    const gempaTerkini = response.data;

    // LOGIKA PENYIMPANAN DATA
    let dbData = [];
    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE);
      dbData = JSON.parse(fileContent);
    }
    const idGempaTerbaru = gempaTerkini.Infogempa.gempa[0].DateTime;
    const isAlreadySaved = dbData.some(gempa => gempa.DateTime === idGempaTerbaru);
    if (!isAlreadySaved) {
      console.log('Data gempa baru ditemukan! Menyimpan ke database...');
      dbData.unshift(gempaTerkini.Infogempa.gempa[0]);
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
    }

    res.json(gempaTerkini);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal ambil data gempa' });
  }
});

// ENDPOINT UNTUK GUNUNG API
app.get('/api/gunungapi', (req, res) => {
  res.json(dataGunungApi);
});

// --- ENDPOINT BARU UNTUK DATA HISTORIS ---
app.get('/api/gempa/historis', (req, res) => {
  if (fs.existsSync(DB_FILE)) {
    const fileContent = fs.readFileSync(DB_FILE);
    const dataHistoris = JSON.parse(fileContent);
    res.json(dataHistoris);
  } else {
    // Jika file database belum ada, kirim array kosong
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Server Fase 3 berjalan di http://localhost:${PORT}`);
});