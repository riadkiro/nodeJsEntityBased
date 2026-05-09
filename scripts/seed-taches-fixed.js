const mongoose = require('mongoose');

const ACCOUNT = process.argv[2] || '9194';
const DB_NAME = `saas_app_rb_${ACCOUNT}`;

async function main() {
    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${DB_NAME}`);
    await new Promise(r => conn.once('open', r));
    console.log('✅ Connected to', DB_NAME);

    const db = conn.db;

    // Check if entity already exists
    const existing = await db.collection('entities').findOne({
        $or: [{ slug: 'taches' }, { slug: 'tache' }]
    });
    if (existing) {
        console.log('⚠️ Tâches entity already exists:', existing.name);
        await conn.close();
        return;
    }

    // 1. Create classifications
    const statusClassId = new mongoose.Types.ObjectId();
    const priorityClassId = new mongoose.Types.ObjectId();
    const tagsClassId = new mongoose.Types.ObjectId();
    const listClassId = new mongoose.Types.ObjectId();

    const statusClass = {
        _id: statusClassId,
        name: 'Statut',
        key: 'task_status',
        type: 'single',
        options: [
            { _id: new mongoose.Types.ObjectId(), label: 'À faire', color: '#6366f1', order: 0 },
            { _id: new mongoose.Types.ObjectId(), label: 'En cours', color: '#f59e0b', order: 1 },
            { _id: new mongoose.Types.ObjectId(), label: 'En revue', color: '#3b82f6', order: 2 },
            { _id: new mongoose.Types.ObjectId(), label: 'Terminé', color: '#22c55e', order: 3 },
            { _id: new mongoose.Types.ObjectId(), label: 'Annulé', color: '#ef4444', order: 4 },
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const priorityClass = {
        _id: priorityClassId,
        name: 'Priorité',
        key: 'task_priority',
        type: 'single',
        options: [
            { _id: new mongoose.Types.ObjectId(), label: 'Basse', color: '#94a3b8', order: 0 },
            { _id: new mongoose.Types.ObjectId(), label: 'Normale', color: '#3b82f6', order: 1 },
            { _id: new mongoose.Types.ObjectId(), label: 'Haute', color: '#f97316', order: 2 },
            { _id: new mongoose.Types.ObjectId(), label: 'Urgente', color: '#ef4444', order: 3 },
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const tagsClass = {
        _id: tagsClassId,
        name: 'Tags',
        key: 'task_tags',
        type: 'multi',
        options: [
            { _id: new mongoose.Types.ObjectId(), label: 'Bug', color: '#ef4444', order: 0 },
            { _id: new mongoose.Types.ObjectId(), label: 'Amélioration', color: '#8b5cf6', order: 1 },
            { _id: new mongoose.Types.ObjectId(), label: 'Documentation', color: '#06b6d4', order: 2 },
            { _id: new mongoose.Types.ObjectId(), label: 'Design', color: '#ec4899', order: 3 },
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const listClass = {
        _id: listClassId,
        name: 'Liste',
        key: 'task_list',
        type: 'single',
        options: [
            { _id: new mongoose.Types.ObjectId(), label: 'Backlog', color: '#94a3b8', order: 0 },
            { _id: new mongoose.Types.ObjectId(), label: 'Sprint', color: '#4361ee', order: 1 },
            { _id: new mongoose.Types.ObjectId(), label: 'Idées', color: '#a855f7', order: 2 },
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    await db.collection('classifications').insertMany([statusClass, priorityClass, tagsClass, listClass]);
    console.log('✅ Created 4 classifications');

    // 2. Create entity
    const entityId = new mongoose.Types.ObjectId();
    const entity = {
        _id: entityId,
        name: 'Tâches',
        slug: 'taches',
        icon: 'solar:checklist-minimalistic-bold-duotone',
        color: '#4361ee',
        description: 'Gestion des tâches et suivi de projet',
        active: true,
        statusClassification: statusClassId,
        classifications: [priorityClassId, tagsClassId, listClassId],
        customFields: [],
        relations: [],
        enabledStandardFields: ['title', 'description', 'createdAt'],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    await db.collection('entities').insertOne(entity);
    console.log('✅ Created Tâches entity:', entityId.toString());

    // 3. Create demo records
    const demoTasks = [
        { title: 'Corriger le bug de la page d\'accueil', status: 0, priority: 2, tags: [0], list: 1 },
        { title: 'Rédiger la documentation API', status: 1, priority: 1, tags: [2], list: 1 },
        { title: 'Refactorer le module de notifications', status: 0, priority: 1, tags: [1], list: 0 },
        { title: 'Designer le nouveau dashboard', status: 1, priority: 2, tags: [3], list: 1 },
        { title: 'Optimiser les requêtes MongoDB', status: 3, priority: 3, tags: [1], list: 1 },
        { title: 'Ajouter les tests unitaires', status: 0, priority: 1, tags: [2], list: 0 },
        { title: 'Mettre à jour les dépendances', status: 0, priority: 0, tags: [], list: 2 },
    ];

    const records = demoTasks.map(task => ({
        _id: new mongoose.Types.ObjectId(),
        entityId: entityId,
        title: task.title,
        referenceTitle: task.title,
        classificationValues: [
            { classificationId: statusClassId.toString(), optionId: statusClass.options[task.status]._id.toString() },
            { classificationId: priorityClassId.toString(), optionId: priorityClass.options[task.priority]._id.toString() },
            ...task.tags.map(t => ({ classificationId: tagsClassId.toString(), optionId: tagsClass.options[t]._id.toString() })),
            { classificationId: listClassId.toString(), optionId: listClass.options[task.list]._id.toString() },
        ],
        customFields: [],
        relations: [],
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    await db.collection('records').insertMany(records);
    console.log(`✅ Created ${records.length} demo tasks`);

    await conn.close();
    console.log('🎉 Done! Visit /account/9194/tasks');
}

main().catch(console.error);
