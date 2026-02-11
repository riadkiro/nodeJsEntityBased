/**
 * Fix Sarah & Karim passwords: hash with bcryptjs (same as passport.js uses)
 * The seed script used 'bcrypt' (native) but passport.js uses 'bcryptjs' (pure JS).
 */
const mongoose = require("mongoose");
require("dotenv").config();
const dbConfig = require("../config/db");
const bcryptjs = require("bcryptjs");

async function fix() {
    await mongoose.connect(dbConfig.globalDbUri);
    console.log("Connected to global DB");

    const db = mongoose.connection.db;
    const usersCol = db.collection("users");

    const hashedPassword = bcryptjs.hashSync("test", 10);
    console.log("New hashed password (bcryptjs):", hashedPassword);

    // Fix Sarah
    const sarah = await usersCol.findOneAndUpdate(
        { email: "sarah.test@demo.com" },
        { $set: { password: hashedPassword } },
        { returnDocument: "after" }
    );
    console.log("Sarah fixed:", sarah.value?.email, "pwd hash:", sarah.value?.password?.substring(0, 20) + "...");

    // Fix Karim
    const karim = await usersCol.findOneAndUpdate(
        { email: "karim.test@demo.com" },
        { $set: { password: hashedPassword } },
        { returnDocument: "after" }
    );
    console.log("Karim fixed:", karim.value?.email, "pwd hash:", karim.value?.password?.substring(0, 20) + "...");

    // Verify bcryptjs can compare
    const verify = bcryptjs.compareSync("test", hashedPassword);
    console.log("\nbcryptjs verify 'test':", verify);

    // Also check Riad's password with bcryptjs
    const riad = await usersCol.findOne({ email: "boukirou6@hotmail.com" });
    const riadVerify = bcryptjs.compareSync("test", riad.password);
    console.log("Riad's password verify with bcryptjs:", riadVerify);

    await mongoose.connection.close();
    process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });
