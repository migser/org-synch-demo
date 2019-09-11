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

    return db.one('insert into public.logtable(org, object, eventdate, replayid, operation, recordid, status) VALUES($1, $2, NOW(), $3, $4, $5, $6) RETURNING logid',
            [org, object, replayId, operation, recordId, 'RECEIVED'])
        .then((data) => {
            console.log(`logEvent for ${replayId} success logid: ${data.logid}`);
            return Promise.resolve(data.logid);
        })
        .catch((err) => {
            console.console.error(`**logEvent for ${replayId} error: ${err}`);
            return Promise.reject(err);
        });
}

async function updateEvent(logid, status) {
    return db.tx(t => {
            t.none('UPDATE public.logtable SET status = $1 WHERE logid = $2', [status, logid]);
        })
        .then((data) => {
            console.log(`updateEvent for ${logid} success`);
            return Promise.resolve(logid);
        })
        .catch((err) => {
            console.log('ERROR:', err);
            return Promise.reject(err);
        });
}

module.exports = {
    logEvent,
    updateEvent
};