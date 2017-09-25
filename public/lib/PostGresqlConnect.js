/**
 * Created by Swaniti-Initiative on 5/18/17.
 */
const pg = require('pg');

function getpostGresqlClient()
{
    var connection = "postgres://nkmwcsojylisco:5eedea401b8b832a4a32732ed7bb3be45ed43a8dc9e7b73a779465d38dfd7e00@ec2-54-221-255-153.compute-1.amazonaws.com:5432/df53kncj9plqh9?ssl=true";

    var client = new pg.Client(connection);
    client.connect();
    return client;
}

module.exports.getpostGresqlClient = getpostGresqlClient;