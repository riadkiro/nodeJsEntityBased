const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const uploadTo = require("../middleware/upload");
const upload = uploadTo((req) => `public/uploads/${req.account_number}/chat`);

// Full-page chat view
router.get("/", chatController.chatPage);

// REST API endpoints
router.get("/api/conversations", chatController.listConversations);
router.post("/api/conversations", chatController.createConversation);
router.get("/api/conversations/:id", chatController.getConversation);
router.get("/api/users", chatController.listUsers);

// File upload for chat attachments
router.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `/uploads/${req.account_number}/chat/${req.file.filename}`;
    res.json({
        url: fileUrl,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
    });
});

module.exports = router;
