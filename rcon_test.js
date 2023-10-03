//This script is only for you to test if your rcon is working
//require dotenv
let server = require('./config.json');
var Rcon = require('simple-rcon');

var client = new Rcon({
    host: server[0].ip,
    port: server[0].port,
    password: server[0].rcon_pass
}).exec('status', function (res) {
    //res.body should be json. convert it
    console.log(res.body)

    client.close();
}).connect();

client.on('authenticated', function () {
    console.log('Authenticated!');
}).on('connected', function () {
    console.log('Connected!');
}).on('disconnected', function () {
    console.log('Disconnected!');
});