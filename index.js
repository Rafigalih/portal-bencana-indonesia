    const express = require('express');
    const axios = require('axios');
    const path = require('path');
    const { parseString } = require('xml2js');
    
    const app = express();
    const PORT = process.env.PORT || 3000;
    
    // DATA CONTOH GUNUNG API
    const dataGunungApi = {
      "data": [
        { "nama": "Gunung Merapi", "level": 3, "level_text": "Siaga", "coordinates": [-7.541, 110.445] },
        { "nama": "Gunung Semeru", "level": 3, "level_text": "Siaga", "coordinates": [-8.108, 112.922] },
        { "nama": "Gunung Anak Krakatau", "level": 2, "level_text": "Waspada", "coordinates": [-6.102, 105.423] }
      ]
    };
    
    // Menyajikan semua file statis seperti index.html, script.js, dll.
    app.use(express.static(path.join(__dirname, 'public')));
    
    // Endpoint untuk data gempa
    app.get('/api/gempa', async (req, res) => {
      try {
        const response = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json');
        res.json(response.data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal ambil data gempa' });
      }
    });
    
    // Endpoint untuk data gunung api
    app.get('/api/gunungapi', (req, res) => {
      res.json(dataGunungApi);
    });
    
    // Endpoint untuk data cuaca
    app.get('/api/cuaca', async (req, res) => {
      try {
        const response = await axios.get('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-JawaBarat.xml');
        
        parseString(response.data, (err, result) => {
          if (err) {
            console.error("XML Parsing Error:", err.message);
            return res.status(500).json({ message: 'Gagal memproses data XML dari BMKG.' });
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
      console.log(`Server berjalan di port ${PORT}`);
    });
    
    function getNamaCuaca(code) {
        const kodeCuaca = {
            '0': 'Cerah', '1': 'Cerah Berawan', '3': 'Berawan', '4': 'Berawan Tebal',
            '60': 'Hujan Ringan', '61': 'Hujan Sedang', '63': 'Hujan Lebat'
        };
        return kodeCuaca[code] || 'Data tidak diketahui';
    }
    
