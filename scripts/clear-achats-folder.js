const mongoose = require('mongoose');
const dbConfig = require('../config/db');
const Account = require('../models/account.model');

async function main() {
    await mongoose.connect(dbConfig.globalDbUri);
    console.log('Connected to global database.');
    
    const account = await Account.findOne({ account_number: '5096' });
    if (!account) {
        console.error('Account 5096 not found.');
    } else {
        console.log('Initial driveFolders:', account.driveFolders);
        if (account.driveFolders && account.driveFolders.includes('Factures/Achats')) {
            account.driveFolders = account.driveFolders.filter(f => f !== 'Factures/Achats');
            await account.save();
            console.log('Removed "Factures/Achats". New driveFolders:', account.driveFolders);
        } else {
            console.log('"Factures/Achats" does not exist in driveFolders.');
        }
    }
    
    await mongoose.disconnect();
    console.log('Disconnected.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
