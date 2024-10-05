const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx'); 
const path = require('path');
const fs = require('fs');
const { calculateCommission } = require('./calculator'); 

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.single('excelFile'), (req, res) => {
    const { nameColumn, salesColumn } = req.body;

    const workbook = xlsx.readFile(req.file.path); 
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); 

    const salesTotals = {};

    const nameIndex = data[0].indexOf(nameColumn);
    const salesIndex = data[0].indexOf(salesColumn);

    if (nameIndex === -1 || salesIndex === -1) {
        return res.status(400).json({ error: 'Invalid column names provided.' });
    }

    for (let i = 1; i < data.length; i++) {
        const name = data[i][nameIndex];
        const salesValue = parseFloat(data[i][salesIndex]) || 0;

        if (name) {
            const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');

            if (!salesTotals[normalizedName]) {
                salesTotals[normalizedName] = 0;
            }
            salesTotals[normalizedName] += salesValue;
        }
    }

    const commissionResults = {};
    for (const [name, totalSales] of Object.entries(salesTotals)) {
        const salesArray = Array.isArray(totalSales) ? totalSales : [totalSales];
        const commission = calculateCommission(salesArray);
        commissionResults[name] = {
            totalSales,
            commission: commission.totalCommission,
            totalSalesCount: commission.y
        };
    }

    res.json(commissionResults);
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
