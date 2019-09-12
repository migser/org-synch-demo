const db = require('./queries');

function processEvent(schema, event) {
    // 0- Logar y auditar
    // 1- Llamar a copiar record
    // 2- Disparar evento ? 
    // 3- actualizar audit
    // (org, object, replayId, operation, recordId)

    db.logEvent(schema, event.payload.object__c, event.event.replayId, event.payload.operation__c, event.payload.recordId__c)
        .then((logid) => {
            console.log(`LOG ID: ${logid}`);
            return db.updateEvent(logid, 'PROCESSED');
        })
        .then((logid) => {
            console.log(`Synch: ${logid} ${schema} ${event.payload.operation__c} ${event.payload.object__c} ${event.payload.recordId__c}`);
            return db.syncRecord(logid, schema, ((schema.equals('orga')) ? 'orgb' : 'orga'), event.payload.operation__c, event.payload.object__c, event.payload.recordId__c);
        })
        .then((logid) => {
            console.log('Update original row --> Shared')
        })
        .then((logid) => {
            return db.updateEvent(logid, 'DONE');
        })
        .catch((err) => {
            return db.updateEvent(err.logid, 'ERROR');
        })



}

module.exports = {
    processEvent
};