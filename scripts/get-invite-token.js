const mongoose = require('mongoose');
const Account = require('../models/account.model');

async function getInviteToken() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saasDemo?directConnection=true');
    
    const account = await Account.findOne({
        'invitations.email': 'newinviteduser@example.com',
        'invitations.status': 'pending'
    }).lean();
    
    if (!account) {
        console.log('No pending invitation found for newinviteduser@example.com');
        await mongoose.disconnect();
        return;
    }
    
    const inv = account.invitations.find(i => i.email === 'newinviteduser@example.com' && i.status === 'pending');
    if (inv) {
        console.log('TOKEN=' + inv.token);
        console.log('ACCOUNT=' + account.account_number);
        console.log('INVITE_URL=http://localhost:3000/auth/invite/' + inv.token);
        console.log('REGISTER_URL=http://localhost:3000/auth/register?invite=' + inv.token + '&account=' + account.account_number);
    }
    
    await mongoose.disconnect();
}

getInviteToken().catch(console.error);
