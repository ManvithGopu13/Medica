const express = require('express');
const cors = require('cors');
const { symptoms, analyzeSymptoms } = require('./models/medicalData');

const app = express();
app.use(cors());
app.use(express.json());

// Get available symptoms
app.get('/api/symptoms', (req, res) => {
    res.json(symptoms);
});

// Analyze symptoms
app.post('/api/analyze', (req, res) => {
    const analysis = analyzeSymptoms(req.body.symptoms);
    res.json(analysis);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});