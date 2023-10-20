//import .env file
require('dotenv').config();

const Discord = require('discord.js'); //import discord.js
const {
    inherits
} = require('util');
const fs = require('fs');
const {
    Client,
    Partials,
    GatewayIntentBits,
    SlashCommandBuilder,
    PermissionFlagsBits,
} = require('discord.js');
const { fstat } = require('fs');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const SteamID = require('steamid');
const steamIdResolver = require("steamid-resolver");

let globalPlayers = [];
let servers;

function getGlobalPlayers(localGlobalPlayers) {
    globalPlayers = localGlobalPlayers;
}
function getServers(localServers) {
    servers = localServers;
}
function addTimeToUnix(time) {
    var unix = Math.round(new Date().getTime() / 1000);
    if (time.slice(-1) == "h") {
        //add unix plus time.slice-1 (hours)
        unix = unix + time.slice(0, -1) * 60 * 60;
    } else if (time.slice(-1) == "d") {
        //add unix plus time.slice-1 (days)
        unix = unix + time.slice(0, -1) * 60 * 60 * 24;
    } else if (time.slice(-1) == "m") {
        //add unix plus time.slice-1 (months)
        unix = unix + time.slice(0, -1) * 60 * 60 * 24 * 30;
    } else if (time == "permanent" || time == "perm" || time == "perma") {
        unix = "permanent";
    }
    return unix;
}
async function anythingToSteamid3(steamid) {
    if (steamid === undefined) return "INVALID";
    if (steamid === "BOT") return "INVALID";
    if (steamid.startsWith('https://steamcommunity.com/profiles/')) {
        //get everything after /profiles and ensure, use regex to get only numbers
        let steamid64 = steamid.match(/(?<=\/profiles\/)\d+/)[0];
        //convert steamid64 to steamid3
        let steamid3 = new SteamID(steamid64);
        return steamid3.getSteam3RenderedID();
    } else if (steamid.startsWith('https://steamcommunity.com/id/')) {
        try {
            let steamid64 = await steamIdResolver.customUrlToSteamID64(steamid);
            //convert steamid64 to steamid3
            let steamid3 = new SteamID(steamid64);
            return steamid3.getSteam3RenderedID();
        } catch (error) {
            return "INVALID";
        }
    } else if (new SteamID(steamid).isValid()) {
        let steamid3 = new SteamID(steamid);
        return steamid3.getSteam3RenderedID();
    } else if (steamid.startsWith('[U:1') || steamid.startsWith('[U:0')) {
        let steamid3 = new SteamID(steamid);
        return steamid3.getSteam3RenderedID();
    } else if (steamid.startsWith('STEAM_')) {
        let steamid3 = new SteamID(steamid);
        return steamid3.getSteam3RenderedID();
    } else {
        return "INVALID";
    }
}
function banPlayer(steamid3, bannedOn, banExpires, bannedBy, reason, message) {
    fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            obj = JSON.parse(data);
            var index = obj.findIndex(x => x.steamid === steamid3);
            if (index !== -1) {
                message.reply('User: https://steamcommunity.com/profiles/' + steamid3 + ' is already banned.');
            } else {
                //ban the player steamid3
                obj.push({
                    steamid: steamid3,
                    reason: reason,
                    bannedBy: bannedBy,
                    bannedOn: bannedOn,
                    banExpires: banExpires
                });
                json = JSON.stringify(obj);
                fs.writeFile('./lists/listids.json', json, 'utf8', function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                message.react("👍");
            }
        }
    });

}
function unbanPlayer(steamid3, message) {
    fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            obj = JSON.parse(data);
            var index = obj.findIndex(x => x.steamid === steamid3);
            if (index !== -1) {
                obj.splice(index, 1);
                json = JSON.stringify(obj);
                fs.writeFile('./lists/listids.json', json, 'utf8', function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                message.react("👍");
            }
        }
    });

}
function findBan(steamid3, message) {
    //steamid3 to steamid64
    let steamid64 = new SteamID(steamid3).getSteamID64();
    fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            obj = JSON.parse(data);
            var index = obj.findIndex(x => x.steamid === steamid3);
            if (index !== -1) {
                //if obj[index].banExpires is not undefined
                if (obj[index].banExpires !== undefined) {
                    if (obj[index].banExpires == "permanent") {
                        message.reply('User: <https://steamcommunity.com/profiles/' + steamid64 + '> is banned by: **' + obj[index].bannedBy + '**. Reason: **' + obj[index].reason + '**. Date: **' + obj[index].bannedOn + '**. Expires: **permanent**');
                    } else {
                        message.reply('User: <https://steamcommunity.com/profiles/' + steamid64 + '> is banned by: **' + obj[index].bannedBy + '**. Reason: **' + obj[index].reason + '**. Date: ** <t:' + obj[index].bannedOn + ':R>**. Expires: **<t:' + obj[index].banExpires + ':R>**');
                    }
                } else {
                    message.reply('User: <https://steamcommunity.com/profiles/' + steamid64 + '> is banned by: **' + obj[index].bannedBy + '**. Reason: **' + obj[index].reason + '**. Date: **' + obj[index].bannedOn + '**. Expires: **no expiration provided**');
                }
            } else {
                message.reply('User: <https://steamcommunity.com/profiles/' + steamid64 + '> is not banned.');
            }
        }
    });

}
function addVip(steamid3, nickname, expires, message) {
    let steamid64 = new SteamID(steamid3).getSteamID64();
    fs.readFile('./lists/vips.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            obj = JSON.parse(data);
            var index = obj.findIndex(x => x.steamid === steamid3);
            if (index !== -1) {
                message.reply('User: <https://steamcommunity.com/profiles/' + steamid64 + '> is already VIP.');
            } else {
                //ban the player steamid3
                obj.push({
                    steamid: steamid3,
                    nickname: nickname,
                    addedBy: message.author.username,
                    addedOn: Math.floor(new Date().getTime() / 1000),
                    expiresOn: expires
                });
                json = JSON.stringify(obj);
                fs.writeFile('./lists/vips.json', json, 'utf8', function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                message.react("👍");
            }
        }
    });
}
function removeVip(steamid3, message) {
    let steamid64 = new SteamID(steamid3).getSteamID64();
    fs.readFile('./lists/vips.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            obj = JSON.parse(data);
            var index = obj.findIndex(x => x.steamid === steamid3);
            if (index !== -1) {
                obj.splice(index, 1);
                json = JSON.stringify(obj);
                fs.writeFile('./lists/vips.json', json, 'utf8', function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                message.react("👍");
            }
        }
    });

}
client.once('ready', () => {
    console.log('Ready!');
    client.on('messageCreate', async message => {
        //ignore messages from bots
        if (message.author.bot) return;
        //ignore messages from other channels
        if (message.channel.id !== process.env.DISCORD_CHANNEL) return;

        if (message.content.startsWith('$help')) {
            message.reply('```$ban <time> <profile> <reason>\n$ban 1d https://steamcommunity.com/id/memopekc/ Cheating\n$ban 1d https://steamcommunity.com/profiles/76561197989444628 Cheating\n$ban 1d [U:1:29178900] Cheating\n$ban 1d 76561197989444628 Cheating\n^you can use perma/permanent for the ban timer as timer.\n\n$unban <profile>\n$unban https://steamcommunity.com/id/memopekc/\n$unban https://steamcommunity.com/profiles/76561197989444628\n$unban [U:1:29178900]\n$unban 76561197989444628\n\n$findban <profile>\n$findban https://steamcommunity.com/id/memopekc/\n$findban https://steamcommunity.com/profiles/76561197989444628\n$findban [U:1:29178900]\n$findban 76561197989444628\n\n$players - List players accross all servers.\n$servers - Shows players per server.\n\n$kick <profile>\n$kick https://steamcommunity.com/id/memopekc/\n$kick https://steamcommunity.com/profiles/76561197989444628\n$kick [U:1:29178900]\n$kick 76561197989444628\n\n$addVip <time> <profile> <nickname>\n$addVip 1d https://steamcommunity.com/id/memopekc/ memopekc\n$addVip 1d https://steamcommunity.com/profiles/76561197989444628 memopekc\n$addVip 1m [U:1:29178900] memopekc\n$addVip 1d 76561197989444628 memopekc\n\n$removeVip <profile>\n$removeVip https://steamcommunity.com/id/memopekc/\n$removeVip https://steamcommunity.com/profiles/76561197989444628\n$removeVip [U:1:29178900]\n$removeVip 76561197989444628\n\n$vipList or $listVip or $vips\n\nTimer help:\nTimer lenghts are as follows: h = hour(s), d = 1 day(s), 1m = 1 month(s).\nExample: 1h, 12h; 1d, 2d; 1m, 2m```');

        } else if (message.content.startsWith('$ban')) {

            var args = message.content.split(' ');
            if (args[1] === undefined || args[2] === undefined || args[3] === undefined) {
                message.reply('Invalid arguments. Use:```$ban <time> <profile> <reason>\n$ban 1d https://steamcommunity.com/id/memopekc/ Cheating\n$ban 1d https://steamcommunity.com/profiles/76561197989444628 Cheating\n$ban 1d [U:1:29178900] Cheating\n$ban 1d 76561197989444628 Cheating\n ^you can use perma/permanent for the ban timer as timer.```');
                return;
            }
            var time = args[1];
            if (time == "perma" || time == "permanent") {
                expireTime = "permanent";
            } else {
                var expireTime = addTimeToUnix(time);
            }
            var steamid3 = await anythingToSteamid3(args[2]);
            console.log(steamid3);
            var reason = args.slice(3).join(' ');
            //if args 1, 2 or 3 is undefined, reply and return

            if (steamid3 === "INVALID") {
                message.reply('Invalid profile link');
                return;
            }
            //ban the player steamid3
            banPlayer(steamid3, Math.floor(new Date().getTime() / 1000), expireTime, message.author.username, reason, message);
        } else if (message.content.startsWith('$unban')) {
            //if profile is requested
            var args = message.content.split(' ');
            var profile = await anythingToSteamid3(args[1]);
            if (profile === "INVALID") {
                message.reply('Invalid arguments. Use:\n```$unban <profile>\n$unban https://steamcommunity.com/id/memopekc/\n$unban https://steamcommunity.com/profiles/76561197989444628\n$unban [U:1:29178900]\n$unban 76561197989444628```');
                return;
            } else {
                unbanPlayer(profile, message);
            }


        } else if (message.content.startsWith('$findban')) {
            //if profile is requested
            var args = message.content.split(' ');
            var profile = await anythingToSteamid3(args[1]);
            if (profile === "INVALID") {
                message.reply('Invalid arguments. Use:\n```$findban <profile>\n$findban https://steamcommunity.com/id/memopekc/\n$findban https://steamcommunity.com/profiles/76561197989444628\n$findban [U:1:29178900]\n$findban 76561197989444628```');
                return;
            } else {
                findBan(profile, message);
            }


        } else if (message.content.startsWith('$players')) {
            //get players from globalPlayers
            var players = globalPlayers;
            var reply = 'Players: - ' + players.length + '\n ```';
            //foreach players

            players.forEach(player => {
                reply += player.nickname + ' - ' + player.steamid + '\n';
            });

            for (var i = 0; i < players.length; i++) {
                //reply += players[i].nickname + ' - '+players[i].steamid+'\n';
            }
            reply += ' ```';
            message.reply(reply);

        } else if (message.content.startsWith('$servers')) {
            Object.keys(servers).forEach(server => {
                let players = "";
                servers[server].players.forEach(player => {
                    players += player.nickname + ' - ' + new SteamID(player.steamid).getSteamID64() + '\n';
                });
                message.reply('Server: ' + servers[server].name + ' - ' + servers[server].players.length + ' players\n``` ' + players + ' ```');
                //console.table(servers[server].players)
            });
        } else if (message.content.startsWith('$kick')) {
            //if profile is requested
            var args = message.content.split(' ');
            var profile = args[1];
            if (profile.startsWith('https://steamcommunity.com/profiles/')) {
                //get everything after /profiles and ensure, use regex to get only numbers
                let steamid = profile.match(/(?<=\/profiles\/)\d+/)[0];
                //convert steamid64 to steamid3
                let steamid3 = new SteamID(steamid);
                ////////// TUK KICKVAME
                Object.keys(servers).forEach(server => {
                    servers[server].realrcon(`kickid "${steamid3.getSteam3RenderedID()}"`);
                });
            } else if (profile.startsWith('https://steamcommunity.com/id/')) {
                let steamid = steamIdResolver.customUrlToSteamID64(profile).then((steamid) => {
                    //convert steamid64 to steamid3
                    let steamid3 = new SteamID(steamid);
                    Object.keys(servers).forEach(server => {
                        servers[server].realrcon(`kickid "${steamid3.getSteam3RenderedID()}"`);
                    });
                }
                ).catch((error) => {
                    message.reply('Profile not found OR steam returned some error.');
                });
            } else if (new SteamID(profile).isValid()) {
                let steamid3 = new SteamID(profile);
                Object.keys(servers).forEach(server => {
                    servers[server].realrcon(`kickid "${steamid3.getSteam3RenderedID()}"`);
                });
            } else {
                message.reply('Invalid profile link');
                return;
            }
            message.react("👍");
        } else if (message.content.startsWith('$addVip')) {

            var args = message.content.split(' ');
            //if args 1, 2 or 3 is undefined, reply and return
            if (args[1] === undefined || args[2] === undefined || args[3] === undefined) {

                message.reply('Invalid arguments. Use: ```$addVip <time> <profile> <nickname>\n$addVip 1d https://steamcommunity.com/id/memopekc/ memopekc\n$addVip 1d https://steamcommunity.com/profiles/76561197989444628 memopekc\n$addVip 1m [U:1:29178900] memopekc\n$addVip 1d 76561197989444628 memopekc```');
                return;
            }
            var time = args[1];
            var expireTime = addTimeToUnix(time);
            var profile = await anythingToSteamid3(args[2]);
            var nickname = args[3];
            if (profile === "INVALID") {
                message.reply('Invalid profile link');
                return;
            }
            //add the player to vip list
            addVip(profile, nickname, expireTime, message);




        } else if (message.content.startsWith('$removeVip')) {
            //find if the steamid is in vips.json and if it is, remove it
            var args = message.content.split(' ');
            if (args[1] === undefined) {
                message.reply('Invalid arguments. Use:```$removeVip <profile>\n$removeVip https://steamcommunity.com/id/memopekc/\n$removeVip https://steamcommunity.com/profiles/76561197989444628\n$removeVip [U:1:29178900]\n$removeVip 76561197989444628```');
                return;
            }
            var profile = await anythingToSteamid3(args[1]);
            if (profile === "INVALID") {
                message.reply('Invalid arguments. Use:\n```$removeVip <profile>\n$removeVip https://steamcommunity.com/id/memopekc/\n$removeVip https://steamcommunity.com/profiles/76561197989444628\n$removeVip [U:1:29178900]\n$removeVip 76561197989444628```');
                return;
            } else {
                removeVip(profile, message);
            }


        } else if (message.content.startsWith('$vipList') || message.content.startsWith('$vips') || message.content.startsWith('$listVip')) {
            //get players from globalPlayers
            var vips = [];
            fs.readFile('./lists/vips.json', 'utf8', function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    vips = JSON.parse(data);
                    var reply = 'VIP List: ' + vips.length + '\n';
                    //foreach players
                    vips.forEach(vip => {
                        reply += "**" + vip.nickname + `** \`\`${vip.steamid}\`\` added on: <t:${vip.addedOn}:R>, expires: <t:${vip.expiresOn}:R> by: **${vip.addedBy}**\n`;
                    });
                    message.reply(reply);
                }
            });

        }

    });
    //setinterval 10 seconds to check if ban has been expired
    setInterval(() => {
        //idbanlist fs read from file .../lists/listids.json
        fs.readFile('./lists/listids.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            idBanList = JSON.parse(data);
            idBanList.forEach(ban => {
                if (ban.banExpires !== "permanent") {
                    if (ban.banExpires < Math.round(new Date().getTime() / 1000)) {
                        //remove ban
                        unbanPlayer(ban.steamid);
                        //send message to discord
                        let steamid64 = new SteamID(ban.steamid).getSteamID64();
                        client.channels.cache.get(process.env.DISCORD_CHANNEL).send('Ban:  <https://steamcommunity.com/profiles/' + steamid64 + '/> has expired. Unbanned.');
                        console.log("Ban:  <https://steamcommunity.com/profiles/" + steamid64 + "/> has expired. Unbanned.");
                    }
                }
            });
        });
    }, 10000);
    //setinterval 10 seconds to check if vip has been expired
    setInterval(() => {
        //idbanlist fs read from file .../lists/listids.json
        fs.readFile('./lists/vips.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            idVipsList = JSON.parse(data);
            idVipsList.forEach(vip => {
                if (vip.expiresOn < Math.round(new Date().getTime() / 1000)) {
                    let steamid64 = new SteamID(vip.steamid).getSteamID64();
                    //remove vip
                    removeVip(vip.steamid);
                    //send message to discord
                    client.channels.cache.get(process.env.DISCORD_CHANNEL).send('VIP: ' + vip.nickname + ' - <https://steamcommunity.com/profiles' + steamid64 + '/> has expired. Auto removed VIP.');
                    console.log("VIP: " + vip.nickname + ' - ' + vip.steamid + ' has expired. Auto removed VIP.');
                }
            });
        });
    }, 10000);
});











client.login(process.env.DISCORD_TOKEN);
exports.client = client;
exports.getGlobalPlayers = getGlobalPlayers;
exports.getServers = getServers;