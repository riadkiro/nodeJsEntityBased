const mongoose = require('mongoose');

// Global DB URI from config
const uri = "mongodb://127.0.0.1:27017/saasDemo";

const UserSchema = new mongoose.Schema({
    email: String,
    accounts: []
}, { strict: false });

async function checkUsers() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to Global DB");

        const User = mongoose.model('User', UserSchema);
        const users = await User.find({});

        console.log(`Users found: ${users.length}`);
        users.forEach(u => {
            console.log(`User: ${u.email}`);
            console.log(`Accounts: ${JSON.stringify(u.accounts)}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
