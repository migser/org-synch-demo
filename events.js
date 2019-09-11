const db = require('./queries');

function processEvent(schema, event) {
    // 0- Logar y auditar
    // 1- Llamar a copiar record
    // 2- Disparar evento
    // 3- actualizar audit
    // (org, object, replayId, operation, recordId)
    db.logEvent(schema, event.payload.object, event.event.replayId, event.payload.operation, event.payload.recordId)
        .then((logid) => {
            console.log(`LOG ID: ${logid}`);
            db.updateEvent(logid, 'OK');
        });


}

module.exports = {
    processEvent
};