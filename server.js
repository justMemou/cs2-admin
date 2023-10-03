//log on;mp_logdetail 3;mp_logmoney 1;mp_logdetail_items 1;logaddress_add_http "http://beta.memo.gg:8080"
var Rcon = require('simple-rcon');
const SteamID = require('steamid');

let serverList = require('./config.json');
let servers = require('./modules/server.js').servers;
let Server = require('./modules/server.js').Server;
let discord = require('./modules/discord.js');

let globalPlayers = [];
discord.getGlobalPlayers(globalPlayers);


serverList.forEach(server => {
    servers[server.ip + ':' + server.port] = new Server(server.ip, server.port, server.rcon_pass, globalPlayers);
});


const express = require('express');
var bodyParser = require('body-parser')
const app = express();

app.use(express.text({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.post('/', (req, res) => {
    //check if req.headers['x-server-addr'] exists and if does continue
    //if not return 403
    if (req.headers['x-server-addr'] === undefined) {
    
    } else {
        //if req.headers['x-server-addr'] is not in serverList return 404
        if (servers[req.headers['x-server-addr']] === undefined) {
            res.sendStatus(404);
        }
        req.body.split('\n').forEach(
            line => handleEvent(line, req.headers['x-server-addr'])
        );
        res.sendStatus(200);
    }


});

app.listen(8080, '0.0.0.0', () => {
    console.log('Server is listening on 0.0.0.0:8080');
});

function handleEvent(event, serverAddr) {
    switch (true) {
        //on player join add the player
        case event.includes("entered the game"):
            var regex = /(?<date>\d{2}\/\d{2}\/\d{4}) - (?<time>\d{2}:\d{2}:\d{2}.\d{3}) - "(?<nickname>.*)<(?<serverId>\d+)><(?<steamid>.*)><>" entered the game/gm;
            var match = regex.exec(event);
            if (match !== null) {
                servers[serverAddr].joinPlayer(match.groups);
            }
            break;
        //on disconnect remove player from list
        case event.includes("disconnected ("):
            var regex = /(?<date>\d{2}\/\d{2}\/\d{4}) - (?<time>\d{2}:\d{2}:\d{2}.\d{3}) - "(?<nickname>.*)<(?<serverId>\d+)><(?<steamid>.*)><(?<team>.*)>" disconnected \(reason "(?<dcreason>.*)"\)/gm;
            var match = regex.exec(event);
            if (match !== null) {
                servers[serverAddr].leavePlayer(match.groups);
            }
            break;
        //on map change reset users list
        case event.includes("Loading map"):
            var regex = /(?<date>\d{2}\/\d{2}\/\d{4}) - (?<time>\d{2}:\d{2}:\d{2}.\d{3}) - Loading map/gm;
            var match = regex.exec(event);
            if (match !== null) {
                servers[serverAddr].resetPlayers();
                
            }
            break;
        //pending connection
        case event.includes(" connected, address "):
            var regex = /(?<date>\d{2}\/\d{2}\/\d{4}) - (?<time>\d{2}:\d{2}:\d{2}.\d{3}) - "(?<nickname>.*)<(?<serverId>\d+)><(?<steamid>.*)><(?<team>.*)>" connected, address "(?<ipClient>.*):\d+"/gm;
            var match = regex.exec(event);
            if (match !== null) {
            }
            break;
        case event.includes("left buyzone"):
            var regex = /(?<date>\d{2}\/\d{2}\/\d{4}) - (?<time>\d{2}:\d{2}:\d{2}): "(?<nickname>.*)<(?<serverId>\d+)><(?<steamid>.*)><(?<team>.*)>"/gm;
            var match = regex.exec(event);
            if (match !== null) {
                servers[serverAddr].checkIfPlayerIsInList(match.groups);
            }

            break;
        case event.includes("picked up"):
            var regex = /(?<date>\d{2}\/\d{2}\/\d{4}) - (?<time>\d{2}:\d{2}:\d{2}): "(?<nickname>.*)<(?<serverId>\d+)><(?<steamid>.*)><(?<team>.*)>/gm;
            var match = regex.exec(event);
            if (match !== null) {
                servers[serverAddr].checkIfPlayerIsInList(match.groups);
            }
            break;

        default:
        //console.log(serverAddr + " no match - " + event);
    }
}

//all exceptions handler
process.on('uncaughtException', function (err) {
    console.log(err);
});
