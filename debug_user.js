const mongoose = require('mongoose');
const dbConfig = require('./config/db');

async function check() {
    await mongoose.connect(dbConfig.globalDbUri);
    const User = require('./models/user.model');
    const user = await User.findOne({}); // Get the first user
    if (user) {
        console.log("User:", user.email);
        console.log("Accounts:", JSON.stringify(user.accounts, null, 2));
    } else {
        console.log("No user found");
    }
    process.exit();
}

check();
