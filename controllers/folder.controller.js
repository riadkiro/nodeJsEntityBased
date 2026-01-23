const tenantCollection = require("../middleware/tenant").tenantCollection;
const mongoose = require("mongoose");

module.exports = {
    list: async (req, res) => {
        try {
            const Folder = await tenantCollection(req, "Folder");
            constfolders = await Folder.find({});
            res.render("folder/folder-list", {
                folders,
                account_number: req.account_number,
                layout: "layout-app",
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    addForm: async (req, res) => {
        // Support pre-filling parent space or folder
        const { spaceId, folderId } = req.query;

        res.render("folder/folder-add", {
            account_number: req.account_number,
            layout: "layout-app",
            spaceId: spaceId || null,
            parentFolderId: folderId || null
        });
    },

    save: async (req, res) => {
        try {
            const Folder = await tenantCollection(req, "Folder");
            const folderData = req.body;

            if (req.file) {
                folderData.icon = `/uploads/${req.account_number}/${req.file.filename}`;
            }

            // Ensure references are arrays if coming from hidden inputs
            if (req.body.spaceId) {
                folderData.spaces = [req.body.spaceId];
            }
            if (req.body.parentFolderId) {
                folderData.parentFolders = [req.body.parentFolderId];
            }

            const newFolder = new Folder(folderData);
            await newFolder.save();
            res.redirect(`/account/${req.account_number}/folder/list`); // Or back to hierarchy
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    editForm: async (req, res) => {
        try {
            const Folder = await tenantCollection(req, "Folder");
            const folder = await Folder.findById(req.params.id);
            if (!folder) return res.status(404).send("Folder not found");

            res.render("folder/folder-edit", {
                folder,
                account_number: req.account_number,
                layout: "layout-app",
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    update: async (req, res) => {
        try {
            const Folder = await tenantCollection(req, "Folder");
            const folderData = req.body;

            if (req.file) {
                folderData.icon = `/uploads/${req.account_number}/${req.file.filename}`;
            }

            await Folder.findByIdAndUpdate(req.params.id, folderData);
            res.redirect(`/account/${req.account_number}/folder/list`);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    delete: async (req, res) => {
        try {
            const Folder = await tenantCollection(req, "Folder");
            await Folder.findByIdAndDelete(req.params.id);
            res.redirect(`/account/${req.account_number}/folder/list`);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
};
