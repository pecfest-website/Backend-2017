
const pg = require('pg');

function getpostGresqlClient()
{
    var connection = "";

    var client = new pg.Client(connection);
    client.connect();
    return client;
}

module.exports.getpostGresqlClient = getpostGresqlClient;