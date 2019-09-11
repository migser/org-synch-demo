const promise = require('bluebird');


const options = {
    // Initialization Options
    promiseLib: promise
};

const pgp = require('pg-promise')(options);

const connectionString = process.env.DATABASE_URL;
pgp.pg.defaults.ssl = true;
const db = pgp(connectionString);
console.log('Conectado a la BBDD');
// add query functions

async function logEvent(org, object, replayId, operation, recordId) {
    let result;
    return db.one('insert into public.logtable(org, object, eventdate, replayid, operation, recordid, status) VALUES($1, $2, NOW(), $3, $4, $5, $6) RETURNING logid',
            [org, object, replayId, operation, recordId, 'RECEIVED'])
        .then((data) => {
            result = data.logid;
            console.log(`logEvent for ${replayId} success logid: ${result}`);
            return Promise.resolve(result);
        })
        .catch((err) => {
            console.console.error(`**logEvent for ${replayId} error: ${err}`);
            return Promise.reject(err);
        });
}

function updateEvent(logid, status) {
    db.tx(t => {
            t.none('UPDATE public.logtable SET status = $1 WHERE logid = $2', [status, logid]);
        })
        .then(data => {
            console.log(`updateEvent for ${logid} success`);
        })
        .catch(error => {
            console.log('ERROR:', error);
        });
}

module.exports = {
    logEvent,
    updateEvent
};