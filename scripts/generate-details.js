const fs = require('fs');
const path = require('path');

const drugsFile = path.join(__dirname, '../frontend/public/data/drugs.json');
const outputDir = path.join(__dirname, '../frontend/public/data/drug_details');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const drugsData = JSON.parse(fs.readFileSync(drugsFile, 'utf-8'));

const genericInfo = {
    'Paracetamol': {
        indications: "Fever, headache, common cold, toothache, and various types of mild to moderate pain.",
        dosage: "Adults: 500 mg to 1 g every 4-6 hours. Maximum 4 g per day. Children: 10-15 mg/kg body weight.",
        warnings: "Use with caution in liver disease. Avoid alcohol. High doses can cause severe liver damage.",
        sideEffects: "Usually minimal. Rare skin rashes or blood disorders.",
        interactions: "May interact with warfarin and other blood thinners.",
        faqs: [{ question: "Can I take it on an empty stomach?", answer: "Yes, paracetamol can be taken with or without food." }]
    },
    'Omeprazole': {
        indications: "GERD, gastric ulcer, duodenal ulcer, acid reflux, and Zollinger-Ellison syndrome.",
        dosage: "Standard dose is 20 mg once daily before meals for 4-8 weeks.",
        warnings: "Long-term use may lead to bone fractures or vitamin B12 deficiency.",
        sideEffects: "Headache, diarrhea, abdominal pain, nausea, and flatulence.",
        interactions: "May interact with clopidogrel and certain antifungal medications.",
        faqs: [{ question: "When is the best time to take it?", answer: "Usually 30-60 minutes before breakfast." }]
    }
};

const defaultInfo = {
    indications: "Used according to physician's advice for specific medical conditions.",
    dosage: "As directed by the registered physician.",
    warnings: "Keep out of reach of children. Store in a cool, dry place.",
    sideEffects: "Consult your doctor if any unusual symptoms occur.",
    interactions: "Tell your doctor about all other medicines you are taking.",
    faqs: [{ question: "How should I store this?", answer: "Store in a cool and dry place, away from light." }]
};

// Simple phonetic generator for pronunciation
function getPronunciation(brandName) {
    const map = {
        'Napa': 'NA-pa',
        'Ace': 'AYSS',
        'Seclo': 'SEK-lo',
        'Sergel': 'SER-jel',
        'Maxpro': 'MAX-pro',
        'Fexo': 'FEX-o'
    };
    return map[brandName] || brandName.split('').join('-');
}

drugsData.drugs.forEach(drug => {
    const info = genericInfo[drug.genericName] || defaultInfo;
    const detail = {
        ...drug,
        ...info,
        pronunciation: getPronunciation(drug.brandName)
    };
    
    fs.writeFileSync(
        path.join(outputDir, `${drug.slug}.json`),
        JSON.stringify(detail, null, 2)
    );
});

console.log('Generation complete with Pronunciation metadata.');
