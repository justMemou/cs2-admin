//spamming that a player is banned

var Rcon = require('simple-rcon');
const fs = require('fs');
//require dotenv
require('dotenv').config();
//get host from dotenv
const host = process.env.HOST;
//get port from dotenv
const nodePort = process.env.PORT;

function Server(address, port, rconPassword, globalPlayers) {
    this.address = address;
    this.port = port;
    this.rconPassword = rconPassword;
    this.rcon = new Rcon({
        host: address,
        port: port,
        password: rconPassword
    });
    //get servers from main server.js


    this.players = [];
    this.globalPlayers = globalPlayers;
    this.bannedids = [];
    //checking for banned players every 3 seconds
    setInterval(() => {
        this.players.forEach(player => {
            if (player.steamid != "BOT") {
                //if player is in this.bannedids array
                if (this.bannedids.includes(player.steamid)) {
                    this.realrcon('kickid "' + player.steamid + '"');
                    this.realrcon("say \x01The player \x07" + player.nickname + " \x01has been banned from the server.");
                    console.log("Kicking banned player (from setinterval) - " + player.nickname + " - " + player.steamid);
                    //remove banned player from players and globalplayers 
                    this.players[this.players.indexOf(this.players.find(p => p.steamid === player.steamid))] = player;
                    this.globalPlayers[this.globalPlayers.indexOf(this.globalPlayers.find(p => p.steamid === player.steamid))] = player;
                }
            }
        });
    }, 3000);

    setInterval(() => {
        //idbanlist fs read from file .../lists/listids.json
        fs.readFile('./lists/listids.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            this.bannedids = [];
            idBanList = JSON.parse(data);
            idBanList.forEach(ban => {
                this.bannedids.push(ban.steamid);
            });
        });
    }, 2000);
    this.realrcon = function (cmd) {
        if (cmd === undefined) return;
        var conn = new Rcon({
            host: this.address,
            port: this.port,
            password: this.rconPassword
        });
        conn.on('authenticated', function () {
            cmd = cmd.split(';');
            for (var i in cmd) {
                conn.exec(String(cmd[i]));
            }
            conn.close();
        }).on('error', function (err) {
            //console.log('err);
        });
        conn.connect();
    }
    //this is for testing purposes
    //this.realrcon('logaddress_delall_http;log on;mp_logdetail 3;mp_logmoney 1;mp_logdetail_items 1;logaddress_add_http "'+host+':'+nodePort+'"');
    this.joinPlayer = function (player) {
        if (player.steamid != "BOT") {
            if (this.players.find(p => p.steamid === player.steamid) === undefined) {

                playerAdd = {
                    steamid: player.steamid,
                    nickname: player.nickname,
                    joinDate: player.date + " " + player.time
                }
                this.players.push(playerAdd);
                this.globalPlayers.push(playerAdd);
                if (this.bannedids.includes(playerAdd.steamid)) {
                    this.realrcon('kickid "' + player.steamid + '"');
                    console.log("Kicking banned player - " + player.nickname + " - " + playerAdd.steamid);
                }
            } else {
                //this.players[this.players.indexOf(this.players.find(p => p.steamid === player.steamid))] = player;
            }
        }
    }
    this.leavePlayer = function (player) {
        if (player.steamid != "BOT") {
            //find player.steamid in this.players (exact match) and remove him
            this.players.splice(this.players.indexOf(this.players.find(p => p.steamid === player.steamid)), 1);
            //find player.steamid in this.globalPlayers (exact match) and remove him
            this.globalPlayers.splice(this.globalPlayers.indexOf(this.globalPlayers.find(p => p.steamid === player.steamid)), 1);
        }
    }
    this.checkIfPlayerIsInList = function (player) {
        
        if (player.steamid != "BOT") {
            if (this.players.find(p => p.steamid === player.steamid) === undefined) {
                playerAdd = {
                    steamid: player.steamid,
                    nickname: player.nickname,
                    joinDate: player.date + " " + player.time
                }
                this.players.push(playerAdd);
                this.globalPlayers.push(playerAdd);
            } else {

            }
        }
    }
    this.resetPlayers = function () {
        console.log("Map change.");
    }
    this.resetPlayersList = function () {

    }

}

const servers = {};

exports.Server = Server;
exports.servers = servers;
