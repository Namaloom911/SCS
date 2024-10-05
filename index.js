// index.js
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx'); // Kept as xlsx
const path = require('path');
const fs = require('fs');
const { calculateCommission } = require('./calculator'); // Import the commission calculator

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files (for serving the index.html)
app.use(express.static('public'));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Route for uploading Excel file
app.post('/upload', upload.single('excelFile'), (req, res) => {
    const { nameColumn, salesColumn } = req.body;

    // Read the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path); // Changed to xlsx
    const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); // Changed to xlsx

    // Initialize an object to hold the sales totals
    const salesTotals = {};

    // Find the index of the specified columns
    const nameIndex = data[0].indexOf(nameColumn);
    const salesIndex = data[0].indexOf(salesColumn);

    if (nameIndex === -1 || salesIndex === -1) {
        return res.status(400).json({ error: 'Invalid column names provided.' });
    }

    // Iterate through the rows and calculate sales totals
    for (let i = 1; i < data.length; i++) {
        const name = data[i][nameIndex];
        const salesValue = parseFloat(data[i][salesIndex]) || 0;

        if (name) {
            // Normalize the name: capitalize first letter of each word
            const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');

            // Sum the sales for the normalized name
            if (!salesTotals[normalizedName]) {
                salesTotals[normalizedName] = 0;
            }
            salesTotals[normalizedName] += salesValue;
        }
    }

    // Calculate commission for each total sales value
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

    // Send the results back to the frontend
    res.json(commissionResults);
});

// Serve the form page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
