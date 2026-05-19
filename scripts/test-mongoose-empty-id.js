const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    const docSchema = new mongoose.Schema({
        name: String,
        entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' },
        entityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entity' }]
    });
    const TestDoc = mongoose.model('TestDoc', docSchema);
    
    try {
        const doc = new TestDoc({ name: 'test1', entityId: "", entityIds: [""] });
        await doc.save();
        console.log("Saved doc:", doc);
    } catch (e) {
        console.error("Error:", e.message);
    }
    
    await mongoose.disconnect();
}
test();
