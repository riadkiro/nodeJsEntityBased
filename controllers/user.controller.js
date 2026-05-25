const mongoose = require("mongoose");
const User = require("../models/user.model");
const Account = require("../models/account.model");
const dbConfig = require("../config/db");
const { ensureSystemEntities } = require("../utils/system-entities");

module.exports = {
  addForm: async (req, res) => {
    res.render("user/user-add");
  },

  delete: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.send("Deleted");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error");
    }
  },

  delete_Api: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error" });
    }
  },

  editForm: async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render("user/user-edit", { user });
  },

  list: async (req, res) => {
    const userAll = await User.find({});
    res.send({ userAll });
  },

  list_Api: async (req, res) => {
    const userAll = await User.find({});
    res.send({ userAll });
  },

  save: async (req, res) => {
    const user = req.body;
    const newUser = new User(user);
    await newUser.save();
    res.redirect("/user/list");
  },

  save_Api: async (req, res) => {
    const user = req.body;
    const newUser = new User(user);
    await newUser.save();
    res.json({ success: true, user: newUser });
  },

  singlePage: async (req, res) => {
    const user = await User.findById(req.params.id);
    res.send("User single Page");
  },

  singlePage_Api: async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
  },

  update: async (req, res) => {
    res.send("Edit function here");
  },

  update_Api: async (req, res) => {
    res.send("Edit function here");
  },

  userAccounts: async (req, res) => {
    if (!req.user) return res.redirect("/auth/login");

    // Find pending invitations for this user's email
    let pendingInvitations = [];
    try {
      const accountsWithInvites = await Account.find({
        'invitations.email': req.user.email.toLowerCase(),
        'invitations.status': 'pending',
      }).select('name icon account_number invitations').lean();

      pendingInvitations = accountsWithInvites.flatMap(acc => {
        return acc.invitations
          .filter(i => i.email === req.user.email.toLowerCase() && i.status === 'pending'
            && (!i.expiresAt || new Date() < new Date(i.expiresAt)))
          .map(i => ({
            token: i.token,
            accountName: acc.name,
            accountIcon: acc.icon || 'solar:buildings-2-bold-duotone',
            accountNumber: acc.account_number,
            role: i.role,
            invitedAt: i.invitedAt,
          }));
      });
    } catch (e) {
      console.error('[UserAccounts] Pending invitations lookup error:', e.message);
    }

    res.render("user/user-accounts", {
      accounts: req.user.accounts,
      user: req.user,
      layout: false,
      pendingInvitations,
    });
  },

  createAccount: async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/auth/login");
      }

      const { name, icon } = req.body;

      if (!name || !name.trim()) {
        return res.redirect("/user/accounts?error=Name is required");
      }

      // Check plan limits
      const currentAccountCount = req.user.accounts?.length || 0;
      const maxAccounts = req.user.membership?.maxAccounts || 1;
      if (maxAccounts > 0 && currentAccountCount >= maxAccounts) {
        return res.redirect("/user/accounts?error=Limite d'espaces atteinte pour votre plan. Passez en Premium.");
      }

      // Generate unique account number (5xxx-9xxx format)
      let account_number;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        account_number = (5000 + Math.floor(Math.random() * 5000)).toString();
        const existing = await Account.findOne({ account_number });
        if (!existing) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        return res.redirect("/user/accounts?error=Could not generate unique account number");
      }

      // Create the Account document
      const newAccount = new Account({
        name: name.trim(),
        icon: icon?.trim() || 'solar:home-2-bold-duotone',
        ownerId: req.user._id,
        users: [{
          userId: req.user._id.toString(),
          email: req.user.email,
          role: 'owner',
          status: 'active',
        }],
        account_number,
        status: 'active',
        created_on: new Date()
      });

      await newAccount.save();

      // Add account to user's accounts array
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          accounts: {
            name: name.trim(),
            account_number,
            icon: icon?.trim() || 'solar:home-2-bold-duotone',
            role: 'owner',
          }
        }
      });

      // Auto-provision system entities (Tâches, Notes) in the new tenant DB
      try {
        const dbUrl = `${dbConfig.uri}saas_app_rb_${account_number}`;
        const tenantDb = mongoose.createConnection(dbUrl);
        await new Promise(resolve => tenantDb.once('open', resolve));
        await ensureSystemEntities(tenantDb);
        await tenantDb.close();
        console.log(`[CreateAccount] System entities provisioned for account ${account_number}`);
      } catch (sysErr) {
        console.warn('[CreateAccount] System entities provisioning error (non-blocking):', sysErr.message);
      }

      res.redirect("/user/accounts");

    } catch (error) {
      console.error("Error creating account:", error);
      res.redirect("/user/accounts?error=Failed to create account");
    }
  },

  // ── Accept Invitation ──────────────────────────────────────
  acceptInvitation: async (req, res) => {
    try {
      if (!req.user) return res.redirect("/auth/login");

      const { token } = req.body;
      if (!token) return res.redirect("/user/accounts?error=Token manquant");

      const account = await Account.findOne({
        'invitations.token': token,
        'invitations.status': 'pending',
      });

      if (!account) return res.redirect("/user/accounts?error=Invitation invalide ou expir\u00e9e");

      const invitation = account.invitations.find(
        inv => inv.token === token && inv.status === 'pending'
      );

      if (!invitation || (invitation.expiresAt && new Date() > new Date(invitation.expiresAt))) {
        if (invitation) invitation.status = 'expired';
        await account.save();
        return res.redirect("/user/accounts?error=Invitation expir\u00e9e");
      }

      // Check if already a member
      const alreadyMember = account.users?.some(
        u => u.userId === req.user._id.toString() || u.email === req.user.email.toLowerCase()
      );
      if (alreadyMember) {
        invitation.status = 'accepted';
        await account.save();
        // Still sync user.accounts in case it's out of date
        const user = await User.findById(req.user._id);
        const alreadyLinked = user?.accounts?.some(
          a => a.account_number === account.account_number
        );
        if (user && !alreadyLinked) {
          user.accounts.push({
            account_number: account.account_number,
            name: account.name,
            icon: account.icon || 'solar:home-2-bold-duotone',
            role: alreadyMember.role || invitation.role,
            joinedAt: new Date(),
          });
          await user.save();
        }
        if ((alreadyMember.role || invitation.role) === 'guest') {
          return res.redirect(`/account/${account.account_number}/shared-with-you`);
        }
        return res.redirect("/user/accounts");
      }

      // Add user to account
      account.users.push({
        userId: req.user._id.toString(),
        email: req.user.email,
        role: invitation.role,
        status: 'active',
        invitedBy: invitation.invitedBy,
        joinedAt: new Date(),
      });
      invitation.status = 'accepted';
      await account.save();

      // Add account to user's accounts
      const user = await User.findById(req.user._id);
      const alreadyLinked = user.accounts?.some(
        a => a.account_number === account.account_number
      );
      if (!alreadyLinked) {
        user.accounts.push({
          account_number: account.account_number,
          name: account.name,
          icon: account.icon || 'solar:home-2-bold-duotone',
          role: invitation.role,
          joinedAt: new Date(),
        });
        await user.save();
      }

      console.log(`[Invitation] ${req.user.email} accepted invite to account ${account.account_number}`);
      if (invitation.role === 'guest') {
        return res.redirect(`/account/${account.account_number}/shared-with-you`);
      }
      res.redirect("/user/accounts");
    } catch (error) {
      console.error("[Invitation] Accept error:", error);
      res.redirect("/user/accounts?error=Erreur lors de l'acceptation");
    }
  },

  // ── Decline Invitation ─────────────────────────────────────
  declineInvitation: async (req, res) => {
    try {
      if (!req.user) return res.redirect("/auth/login");

      const { token } = req.body;
      if (!token) return res.redirect("/user/accounts?error=Token manquant");

      const account = await Account.findOne({
        'invitations.token': token,
        'invitations.status': 'pending',
      });

      if (account) {
        const invitation = account.invitations.find(
          inv => inv.token === token && inv.status === 'pending'
        );
        if (invitation) {
          invitation.status = 'expired';
          await account.save();
          console.log(`[Invitation] ${req.user.email} declined invite to account ${account.account_number}`);
        }
      }

      res.redirect("/user/accounts");
    } catch (error) {
      console.error("[Invitation] Decline error:", error);
      res.redirect("/user/accounts?error=Erreur lors du refus");
    }
  },

  // ── Leave Account ──────────────────────────────────────────
  leaveAccount: async (req, res) => {
    try {
      if (!req.user) return res.redirect("/auth/login");

      const { accountNumber } = req.body;
      if (!accountNumber) return res.redirect("/user/accounts?error=Compte manquant");

      const account = await Account.findOne({ account_number: accountNumber });
      if (!account) return res.redirect("/user/accounts?error=Compte introuvable");

      // Cannot leave if you are the owner
      const member = account.users?.find(u => u.userId === req.user._id.toString());
      if (member?.role === 'owner') {
        return res.redirect("/user/accounts?error=Impossible de quitter un compte dont vous \u00eates propri\u00e9taire");
      }

      // Remove user from account
      await Account.updateOne(
        { account_number: accountNumber },
        { $pull: { users: { userId: req.user._id.toString() } } }
      );

      // Remove account from user's accounts
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { accounts: { account_number: accountNumber } } }
      );

      console.log(`[Account] ${req.user.email} left account ${accountNumber}`);
      res.redirect("/user/accounts");
    } catch (error) {
      console.error("[Account] Leave error:", error);
      res.redirect("/user/accounts?error=Erreur lors de la sortie du compte");
    }
  },

  savePreferences: async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/auth/login");
      }

      const { name, icon } = req.body;

      if (!name || !name.trim()) {
        return res.redirect("/user/accounts?error=Name is required");
      }

      // Check plan limits
      const currentAccountCount = req.user.accounts?.length || 0;
      const maxAccounts = req.user.membership?.maxAccounts || 1;
      if (maxAccounts > 0 && currentAccountCount >= maxAccounts) {
        return res.redirect("/user/accounts?error=Limite d'espaces atteinte pour votre plan. Passez en Premium.");
      }

      // Generate unique account number (5xxx-9xxx format)
      let account_number;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        account_number = (5000 + Math.floor(Math.random() * 5000)).toString();
        const existing = await Account.findOne({ account_number });
        if (!existing) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        return res.redirect("/user/accounts?error=Could not generate unique account number");
      }

      // Create the Account document
      const newAccount = new Account({
        name: name.trim(),
        icon: icon?.trim() || 'solar:home-2-bold-duotone',
        ownerId: req.user._id,
        users: [{
          userId: req.user._id.toString(),
          email: req.user.email,
          role: 'owner',
          status: 'active',
        }],
        account_number,
        status: 'active',
        created_on: new Date()
      });

      await newAccount.save();

      // Add account to user's accounts array
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          accounts: {
            name: name.trim(),
            account_number,
            icon: icon?.trim() || 'solar:home-2-bold-duotone',
            role: 'owner',
          }
        }
      });

      // Auto-provision system entities (Tâches, Notes) in the new tenant DB
      try {
        const dbUrl = `${dbConfig.uri}saas_app_rb_${account_number}`;
        const tenantDb = mongoose.createConnection(dbUrl);
        await new Promise(resolve => tenantDb.once('open', resolve));
        await ensureSystemEntities(tenantDb);
        await tenantDb.close();
        console.log(`[CreateAccount] System entities provisioned for account ${account_number}`);
      } catch (sysErr) {
        console.warn('[CreateAccount] System entities provisioning error (non-blocking):', sysErr.message);
      }

      res.redirect("/user/accounts");

    } catch (error) {
      console.error("Error creating account:", error);
      res.redirect("/user/accounts?error=Failed to create account");
    }
  },

  savePreferences: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ error: "Key is required" });
      }

      const update = {};
      update[`preferences.${key}`] = value;

      await User.findByIdAndUpdate(req.user._id, { $set: update });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server Error" });
    }
  },
};
