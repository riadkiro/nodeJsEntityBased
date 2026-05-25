const mongoose = require('mongoose');

const uri = "mongodb://127.0.0.1:27017/saasDemo";

const UserSchema = new mongoose.Schema({
    email: String,
    accounts: []
}, { strict: false });

async function fixPermissions() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to Global DB");

        const User = mongoose.model('User', UserSchema);
        const users = await User.find({});

        for (const user of users) {
            console.log(`Checking user: ${user.email}`);
            let has5001 = false;

            // Normalize accounts structure
            if (!user.accounts) user.accounts = [];

            // Check if 5001 exists
            const accounts = user.accounts.map(a => {
                if (a.account_number == 5001) has5001 = true;
                return a;
            });

            if (!has5001) {
                console.log(` - Adding account 5001 to ${user.email}`);
                // Verify structure of account object from existing
                const newAccount = {
                    account_number: 5001,
                    name: "Dexapp Dev",
                    role: "owner"
                };

                await User.updateOne(
                    { _id: user._id },
                    { $push: { accounts: newAccount } }
                );
            } else {
                console.log(` - User already has 5001`);
            }
        }
        console.log("Permissions update complete.");

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

fixPermissions();
