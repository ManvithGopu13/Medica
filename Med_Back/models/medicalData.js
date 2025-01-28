// backend/models/medicalData.js
const symptoms = {
    fever: {
        id: 'fever',
        name: 'Fever',
        questions: [
            {
                id: 'fever_severity',
                text: 'How severe is your fever?',
                options: [
                    { id: 'mild', text: 'Mild (Up to 100.4°F/38°C)' },
                    { id: 'moderate', text: 'Moderate (100.4-102.2°F/38-39°C)' },
                    { id: 'high', text: 'High (Above 102.2°F/39°C)' }
                ]
            },
            {
                id: 'fever_duration',
                text: 'How long have you had the fever?',
                options: [
                    { id: 'recent', text: 'Less than 24 hours' },
                    { id: 'few_days', text: '1-3 days' },
                    { id: 'long', text: 'More than 3 days' }
                ]
            }
        ]
    },
    cough: {
        id: 'cough',
        name: 'Cough',
        questions: [
            {
                id: 'cough_type',
                text: 'What type of cough do you have?',
                options: [
                    { id: 'dry', text: 'Dry cough' },
                    { id: 'wet', text: 'Wet cough with mucus' },
                    { id: 'severe', text: 'Severe cough with chest pain' }
                ]
            },
            {
                id: 'cough_duration',
                text: 'How long have you been coughing?',
                options: [
                    { id: 'recent', text: 'Less than a week' },
                    { id: 'few_weeks', text: '1-3 weeks' },
                    { id: 'chronic', text: 'More than 3 weeks' }
                ]
            }
        ]
    },
    headache: {
        id: 'headache',
        name: 'Headache',
        questions: [
            {
                id: 'headache_location',
                text: 'Where is your headache located?',
                options: [
                    { id: 'frontal', text: 'Front of the head' },
                    { id: 'temporal', text: 'Sides of the head' },
                    { id: 'whole', text: 'Whole head' }
                ]
            },
            {
                id: 'headache_type',
                text: 'What type of pain are you experiencing?',
                options: [
                    { id: 'throbbing', text: 'Throbbing pain' },
                    { id: 'constant', text: 'Constant pressure' },
                    { id: 'sharp', text: 'Sharp, intense pain' }
                ]
            }
        ]
    }
};

const conditions = {
    common_cold: {
        name: 'Common Cold',
        matches: {
            fever: { severity: ['mild'], duration: ['recent', 'few_days'] },
            cough: { type: ['dry', 'wet'], duration: ['recent'] },
            headache: { location: ['frontal'], type: ['constant'] }
        },
        urgency: 'low',
        recommendations: [
            'Rest and stay hydrated',
            'Over-the-counter cold medications may help',
            'Monitor symptoms for 3-4 days'
        ]
    },
    flu: {
        name: 'Influenza',
        matches: {
            fever: { severity: ['moderate', 'high'], duration: ['recent', 'few_days'] },
            cough: { type: ['dry'], duration: ['recent'] },
            headache: { location: ['whole'], type: ['throbbing'] }
        },
        urgency: 'medium',
        recommendations: [
            'Rest and isolate yourself',
            'Contact doctor if symptoms worsen',
            'Take fever reducers if needed'
        ]
    },
    bronchitis: {
        name: 'Bronchitis',
        matches: {
            fever: { severity: ['mild', 'moderate'], duration: ['few_days'] },
            cough: { type: ['wet'], duration: ['few_weeks', 'chronic'] },
            headache: { location: ['frontal'], type: ['constant'] }
        },
        urgency: 'medium',
        recommendations: [
            'See a doctor for proper diagnosis',
            'Use humidifier',
            'Avoid irritants like smoke'
        ]
    }
};

// Analyze symptoms and return possible conditions
const analyzeSymptoms = (userSymptoms) => {
    let possibleConditions = [];
    
    for (const [conditionId, condition] of Object.entries(conditions)) {
        let matchScore = 0;
        let totalSymptoms = 0;
        
        for (const [symptomId, responses] of Object.entries(userSymptoms)) {
            if (condition.matches[symptomId]) {
                totalSymptoms++;
                
                // Check each response for this symptom
                for (const [responseType, responseValue] of Object.entries(responses)) {
                    if (condition.matches[symptomId][responseType] && 
                        condition.matches[symptomId][responseType].includes(responseValue)) {
                        matchScore++;
                    }
                }
            }
        }
        
        if (totalSymptoms > 0) {
            const confidence = (matchScore / (totalSymptoms * 2)) * 100; // Multiply by 2 because each symptom has 2 questions
            if (confidence > 30) { // Only include if confidence is above 30%
                possibleConditions.push({
                    name: condition.name,
                    confidence: confidence,
                    urgency: condition.urgency,
                    recommendations: condition.recommendations
                });
            }
        }
    }
    
    return possibleConditions.sort((a, b) => b.confidence - a.confidence);
};

module.exports = {
    symptoms,
    analyzeSymptoms
};