const mongoose = require('mongoose');
const dbConfig = require('../config/db');
const Account = require('../models/account.model');

async function main() {
    await mongoose.connect(dbConfig.globalDbUri);
    console.log('Connected to global database.');
    
    const account = await Account.findOne({ account_number: '5096' }).lean();
    if (!account) {
        console.error('Account 5096 not found.');
    } else {
        console.log('Account Name:', account.name);
        console.log('driveFolders:', account.driveFolders);
    }
    
    await mongoose.disconnect();
    console.log('Disconnected.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
