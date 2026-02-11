/**
 * Seed Script: Chat System Demo Data
 * 
 * Creates:
 * 1. A second test user (if not exists) for testing conversations
 * 2. Demo conversations between the two users
 * 3. Demo messages in each conversation
 * 
 * Usage: node scripts/seed-chat.js [accountNumber]
 * Default account: 5001
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Load env
require("dotenv").config();
const dbConfig = require("../config/db");

const accountNumber = process.argv[2] || "5001";

async function seed() {
    console.log("=== Chat Seed Script ===");
    console.log(`Account: ${accountNumber}`);

    // Connect to global DB
    await mongoose.connect(dbConfig.globalDbUri, { useNewUrlParser: true });
    console.log("[Seed] Connected to global DB");

    const User = require("../models/user.model");

    // 1. Find or create the main test user
    let mainUser = await User.findOne({ email: "boukirou6@hotmail.com" });
    if (!mainUser) {
        console.error("[Seed] Main user boukirou6@hotmail.com not found! Please login first.");
        process.exit(1);
    }
    console.log(`[Seed] Main user: ${mainUser.name || mainUser.email} (${mainUser._id})`);

    // Update name if not set
    if (!mainUser.name) {
        mainUser.name = "Riad Boukirou";
        await mainUser.save();
        console.log("[Seed] Updated main user name to 'Riad Boukirou'");
    }

    // 2. Create second test user (for chat testing)
    let testUser = await User.findOne({ email: "sarah.test@demo.com" });
    if (!testUser) {
        const hashedPassword = await bcrypt.hash("test", 10);
        testUser = await User.create({
            email: "sarah.test@demo.com",
            password: hashedPassword,
            name: "Sarah Martin",
            role: "user",
            accounts: [
                {
                    account_number: accountNumber,
                    name: "Demo Account",
                    icon: "solar:buildings-bold-duotone",
                },
            ],
        });
        console.log(`[Seed] Created test user: Sarah Martin (${testUser._id})`);
    } else {
        console.log(`[Seed] Test user already exists: Sarah Martin (${testUser._id})`);
        // Ensure the test user has access to this account
        const hasAccount = testUser.accounts.some(a => a.account_number === accountNumber);
        if (!hasAccount) {
            testUser.accounts.push({
                account_number: accountNumber,
                name: "Demo Account",
                icon: "solar:buildings-bold-duotone",
            });
            await testUser.save();
            console.log(`[Seed] Added account ${accountNumber} to test user`);
        }
    }

    // 3. Create third test user for group chat
    let thirdUser = await User.findOne({ email: "karim.test@demo.com" });
    if (!thirdUser) {
        const hashedPassword = await bcrypt.hash("test", 10);
        thirdUser = await User.create({
            email: "karim.test@demo.com",
            password: hashedPassword,
            name: "Karim Benali",
            role: "user",
            accounts: [
                {
                    account_number: accountNumber,
                    name: "Demo Account",
                    icon: "solar:buildings-bold-duotone",
                },
            ],
        });
        console.log(`[Seed] Created test user: Karim Benali (${thirdUser._id})`);
    } else {
        console.log(`[Seed] Test user already exists: Karim Benali (${thirdUser._id})`);
        const hasAccount = thirdUser.accounts.some(a => a.account_number === accountNumber);
        if (!hasAccount) {
            thirdUser.accounts.push({
                account_number: accountNumber,
                name: "Demo Account",
                icon: "solar:buildings-bold-duotone",
            });
            await thirdUser.save();
        }
    }

    // 4. Connect to tenant DB
    const tenantDbUrl = `${dbConfig.uri}saas_app_rb_${accountNumber}`;
    const tenantConn = await mongoose.createConnection(tenantDbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await new Promise((resolve) => tenantConn.once("open", resolve));
    console.log(`[Seed] Connected to tenant DB: saas_app_rb_${accountNumber}`);

    // Register models on tenant connection
    const ConversationModel = require("../models/conversation.model");
    const MessageModel = require("../models/message.model");
    const Conversation = tenantConn.model("Conversation", ConversationModel.schema);
    const Message = tenantConn.model("Message", MessageModel.schema);

    // 5. Create conversation 1: Direct chat between main user and Sarah
    const mainUserId = String(mainUser._id);
    const testUserId = String(testUser._id);
    const thirdUserId = String(thirdUser._id);

    let conv1 = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [mainUserId, testUserId] },
    });

    if (!conv1) {
        conv1 = await Conversation.create({
            type: "direct",
            participants: [
                {
                    userId: mainUserId,
                    name: mainUser.name || mainUser.email,
                    email: mainUser.email,
                    avatar: mainUser.avatar || "",
                    role: "admin",
                },
                {
                    userId: testUserId,
                    name: testUser.name,
                    email: testUser.email,
                    avatar: "",
                    role: "member",
                },
            ],
        });
        console.log(`[Seed] Created direct conversation: ${conv1._id}`);
    } else {
        console.log(`[Seed] Direct conversation already exists: ${conv1._id}`);
    }

    // 6. Clear existing messages for fresh seed
    await Message.deleteMany({ conversationId: conv1._id });

    // 7. Create demo messages in conversation 1
    const now = new Date();
    const messages1 = [
        {
            conversationId: conv1._id,
            senderId: testUserId,
            senderName: testUser.name,
            type: "text",
            text: "Bonjour ! Comment ça va aujourd'hui ?",
            createdAt: new Date(now - 3600000 * 2), // 2h ago
        },
        {
            conversationId: conv1._id,
            senderId: mainUserId,
            senderName: mainUser.name || mainUser.email,
            type: "text",
            text: "Salut Sarah ! Ça va bien merci, et toi ?",
            createdAt: new Date(now - 3600000 * 1.9),
        },
        {
            conversationId: conv1._id,
            senderId: testUserId,
            senderName: testUser.name,
            type: "text",
            text: "Très bien ! Tu as vu la nouvelle mise à jour du projet ?",
            createdAt: new Date(now - 3600000 * 1.8),
        },
        {
            conversationId: conv1._id,
            senderId: mainUserId,
            senderName: mainUser.name || mainUser.email,
            type: "text",
            text: "Oui, j'ai implémenté le système de chat avec WebSocket ! 🚀",
            createdAt: new Date(now - 3600000 * 1.7),
        },
        {
            conversationId: conv1._id,
            senderId: testUserId,
            senderName: testUser.name,
            type: "text",
            text: "C'est génial ! J'ai hâte de le tester. On peut partager des fichiers aussi ?",
            createdAt: new Date(now - 3600000),
        },
        {
            conversationId: conv1._id,
            senderId: mainUserId,
            senderName: mainUser.name || mainUser.email,
            type: "text",
            text: "Oui, images et fichiers sont supportés 📎",
            createdAt: new Date(now - 1800000), // 30 min ago
        },
        {
            conversationId: conv1._id,
            senderId: testUserId,
            senderName: testUser.name,
            type: "text",
            text: "Super ! On devrait organiser une réunion pour la suite du planning.",
            createdAt: new Date(now - 600000), // 10 min ago
        },
    ];

    await Message.insertMany(messages1);
    console.log(`[Seed] Created ${messages1.length} messages in direct conversation`);

    // Update conversation last message
    const lastMsg1 = messages1[messages1.length - 1];
    await Conversation.findByIdAndUpdate(conv1._id, {
        lastMessage: {
            text: lastMsg1.text,
            senderId: lastMsg1.senderId,
            senderName: lastMsg1.senderName,
            sentAt: lastMsg1.createdAt,
            type: "text",
        },
        updatedAt: lastMsg1.createdAt,
    });

    // 8. Create conversation 2: Direct chat between main user and Karim
    let conv2 = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [mainUserId, thirdUserId] },
    });

    if (!conv2) {
        conv2 = await Conversation.create({
            type: "direct",
            participants: [
                {
                    userId: mainUserId,
                    name: mainUser.name || mainUser.email,
                    email: mainUser.email,
                    avatar: mainUser.avatar || "",
                    role: "admin",
                },
                {
                    userId: thirdUserId,
                    name: thirdUser.name,
                    email: thirdUser.email,
                    avatar: "",
                    role: "member",
                },
            ],
        });
        console.log(`[Seed] Created direct conversation with Karim: ${conv2._id}`);
    }

    await Message.deleteMany({ conversationId: conv2._id });

    const messages2 = [
        {
            conversationId: conv2._id,
            senderId: thirdUserId,
            senderName: thirdUser.name,
            type: "text",
            text: "Salut ! Tu es dispo cet après-midi pour un point rapide ?",
            createdAt: new Date(now - 7200000),
        },
        {
            conversationId: conv2._id,
            senderId: mainUserId,
            senderName: mainUser.name || mainUser.email,
            type: "text",
            text: "Oui, à 15h ça te va ?",
            createdAt: new Date(now - 5400000),
        },
        {
            conversationId: conv2._id,
            senderId: thirdUserId,
            senderName: thirdUser.name,
            type: "text",
            text: "Parfait ! Je prépare les specs.",
            createdAt: new Date(now - 3600000),
        },
    ];

    await Message.insertMany(messages2);
    console.log(`[Seed] Created ${messages2.length} messages in Karim conversation`);

    const lastMsg2 = messages2[messages2.length - 1];
    await Conversation.findByIdAndUpdate(conv2._id, {
        lastMessage: {
            text: lastMsg2.text,
            senderId: lastMsg2.senderId,
            senderName: lastMsg2.senderName,
            sentAt: lastMsg2.createdAt,
            type: "text",
        },
        updatedAt: lastMsg2.createdAt,
    });

    // 9. Summary
    console.log("\n=== Seed Complete ===");
    console.log(`Main user: ${mainUser.email} (pwd: test)`);
    console.log(`Test user 1: sarah.test@demo.com (pwd: test)`);
    console.log(`Test user 2: karim.test@demo.com (pwd: test)`);
    console.log(`Conversations: 2 (direct)`);
    console.log(`Total messages: ${messages1.length + messages2.length}`);
    console.log(`\nTest URL: http://localhost:3000/account/${accountNumber}/chat`);

    await tenantConn.close();
    await mongoose.connection.close();
    process.exit(0);
}

seed().catch((err) => {
    console.error("[Seed] Error:", err);
    process.exit(1);
});
