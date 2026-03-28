const item = {
    "_id": "69c646fec932856e50ea5b44",
    "title": "Doliprane 1000mg",
    "lineDefaults": [
        {
            "schemaId": "69c232cd0fa7abd357abd677",
            "defaults": {
                "moment": [ "morning" ],
                "frequency": [ "3x_day" ],
                "duration": [ "7_days" ],
                "instructions": "Prendre pendant les repas"
            },
            "excludedColumns": [],
            "_id": "69c646fec932856e50ea5b44"
        }
    ]
};

const schemaId = "69c232cd0fa7abd357abd677";

function resolveLineDefaults(item, schemaId) {
    if (!item || !item.lineDefaults || !schemaId) return null

    const match = item.lineDefaults.find(ld => {
        return ld.schemaId === schemaId ||
               ld.schemaId?._id === schemaId ||
               ld.schemaId?.toString() === schemaId?.toString() ||
               (ld.schemaId && ld.schemaId._id && ld.schemaId._id.toString() === schemaId.toString())
    })

    if (!match) {
        console.log('[DynamicTable] No lineDefaults found for schema', schemaId, 
            'available:', Array.isArray(item.lineDefaults) 
                ? item.lineDefaults.map(ld => ld.schemaId) 
                : item.lineDefaults.schemaId)
        return null
    }

    console.log('[DynamicTable] Found lineDefaults for schema', schemaId, ':', match.defaults)
    return {
        defaults: match.defaults || {},
        availableOptions: match.availableOptions || {},
        excludedColumns: match.excludedColumns || []
    }
}

console.log("Result:", resolveLineDefaults(item, schemaId));
