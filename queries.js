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

function logEvent(org, object, replayId, operation, recordId) {
    db.one('insert into public.logtable(org, object, eventdate, replayid, operation, recordid, status) VALUES($1, $2, NOW(), $3, $4, $5, $6) RETURNING logid',
            [org, object, replayId, operation, recordId, 'RECEIVED'])
        .then((data) => {
            console.log(`logEvent for ${replayId} success`);
            return data.logid;
        })
        .catch((err) => {
            console.console.error(`**logEvent for ${replayId} error: ${err}`);
            return 0;
        });
}

module.exports = {
    logEvent
};