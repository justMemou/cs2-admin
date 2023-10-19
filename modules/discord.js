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
client.once('ready', () => {
    console.log('Ready!');



    //on message

    client.on('messageCreate', message => {
        //if message is from bot, return
        if (message.author.bot) return;
        //if message in DISCORD_CHANNEL
        if (message.channel.id !== process.env.DISCORD_CHANNEL) return;
        if (message.content.startsWith('$ban')) {
            //if profile is requested
            var args = message.content.split(' ');
            var profile = args[1];
            //reason = every argument after profile
            var reason = args.slice(2).join(' ');

            //var reason = args[2];
            if (args[2] === undefined) {
                reason = "No reason provided";
            }
            if (profile.startsWith('https://steamcommunity.com/profiles/')) {
                //get everything after /profiles and ensure, use regex to get only numbers
                let steamid = profile.match(/(?<=\/profiles\/)\d+/)[0];
                //convert steamid64 to steamid3
                let steamid3 = new SteamID(steamid);
                fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data);
                        var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                        if (index !== -1) {
                            message.reply('User: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID() + ' is already banned.');
                        } else {
                            //ban the player steamid3
                            obj.push({
                                steamid: steamid3.getSteam3RenderedID(),
                                reason: reason,
                                bannedBy: message.author.username,
                                bannedOn: new Date().toLocaleString()
                            });
                            json = JSON.stringify(obj);
                            fs.writeFile('./lists/listids.json', json, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            message.reply('User: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID() + " have been banned.");
                        }
                    }
                });
            } else if (profile.startsWith('https://steamcommunity.com/id/')) {
                let steamid = steamIdResolver.customUrlToSteamID64(profile).then((steamid) => {
                    //convert steamid64 to steamid3
                    let steamid3 = new SteamID(steamid);
                    //check if steamid3 is already banned
                    fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            obj = JSON.parse(data);
                            var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                            if (index !== -1) {
                                message.reply('User: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID() + ' is already banned.');
                            } else {
                                //ban the player steamid3
                                obj.push({
                                    steamid: steamid3.getSteam3RenderedID(),
                                    reason: reason,
                                    bannedBy: message.author.username,
                                    bannedOn: new Date().toLocaleString()
                                });
                                json = JSON.stringify(obj);
                                fs.writeFile('./lists/listids.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                message.reply('Banning:' + steamid3.getSteam3RenderedID());
                            }
                        }
                    });
                }
                ).catch((error) => {
                    message.reply('Profile not found OR steam returned some error.');
                });
            } else if (new SteamID(profile).isValid()) {
                let steamid3 = new SteamID(profile);
                //check if steamid3 is already banned
                fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data);
                        var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                        if (index !== -1) {
                            message.reply('SteamID3: ' + steamid3.getSteam3RenderedID() + ' is already banned.');
                        } else {
                            //ban the player steamid3
                            obj.push({
                                steamid: steamid3.getSteam3RenderedID(),
                                reason: reason,
                                bannedBy: message.author.username,
                                bannedOn: new Date().toLocaleString()
                            });
                            json = JSON.stringify(obj);
                            fs.writeFile('./lists/listids.json', json, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            message.reply('Banning:' + steamid3.getSteam3RenderedID());
                        }
                    }
                });
            } else {
                message.reply('Invalid profile link');
                return;
            }
        } else if (message.content.startsWith('$unban')) {
            //if profile is requested
            var args = message.content.split(' ');
            var profile = args[1];
            if (profile.startsWith('https://steamcommunity.com/profiles/')) {
                //get everything after /profiles and ensure, use regex to get only numbers
                let steamid = profile.match(/(?<=\/profiles\/)\d+/)[0];
                //convert steamid64 to steamid3
                let steamid3 = new SteamID(steamid);
                fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data);
                        var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                        if (index !== -1) {
                            obj.splice(index, 1);
                            json = JSON.stringify(obj);
                            fs.writeFile('./lists/listids.json', json, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            message.reply('Unbanned: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID());
                        } else {
                            message.reply('User: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID() + ' is not banned.');
                        }
                    }
                });
            } else if (profile.startsWith('https://steamcommunity.com/id/')) {
                let steamid = steamIdResolver.customUrlToSteamID64(profile).then((steamid) => {
                    //convert steamid64 to steamid3
                    let steamid3 = new SteamID(steamid);
                    //check if steamid3 is already banned
                    fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            obj = JSON.parse(data);
                            var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                            if (index !== -1) {
                                obj.splice(index, 1);
                                json = JSON.stringify(obj);
                                fs.writeFile('./lists/listids.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                message.reply('Unbaning: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID());
                            } else {
                                message.reply('SteamID3: ' + steamid3.getSteam3RenderedID() + ' is not banned');
                            }
                        }
                    }
                    );
                }
                ).catch((error) => {
                    message.reply('Profile not found OR steam returned some error.');
                });
            } else if (new SteamID(profile).isValid()) {
                let steamid3 = new SteamID(profile);
                //check if steamid3 is already banned
                fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data);
                        var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                        if (index !== -1) {
                            obj.splice(index, 1);
                            json = JSON.stringify(obj);
                            fs.writeFile('./lists/listids.json', json, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            message.reply('Unbaning: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID());
                        } else {
                            message.reply('SteamID3: ' + steamid3.getSteam3RenderedID() + ' is not banned');
                        }
                    }
                });
            }
            else {
                message.reply('Invalid profile link');
                return;
            }

        } else if (message.content.startsWith('$findban')) {
            //if profile is requested
            var args = message.content.split(' ');
            var profile = args[1];
            if (profile.startsWith('https://steamcommunity.com/profiles/')) {
                //get everything after /profiles and ensure, use regex to get only numbers
                let steamid = profile.match(/(?<=\/profiles\/)\d+/)[0];
                //convert steamid64 to steamid3
                let steamid3 = new SteamID(steamid);
                fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data);
                        var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                        if (index !== -1) {
                            message.reply('User: <https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID() + '> is banned by: **' + obj[index].bannedBy + '**. Reason: **' + obj[index].reason + '**. Date: **' + obj[index].bannedOn + '**');
                        } else {
                            message.reply('User: <https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID() + '> is not banned.');
                        }
                    }
                });
            } else if (profile.startsWith('https://steamcommunity.com/id/')) {
                let steamid = steamIdResolver.customUrlToSteamID64(profile).then((steamid) => {
                    //convert steamid64 to steamid3
                    let steamid3 = new SteamID(steamid);
                    //check if steamid3 is already banned
                    fs.readFile('./lists/listids.json', 'utf8', function readFileCallback(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            obj = JSON.parse(data);
                            var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                            if (index !== -1) {
                                message.reply('SteamID3: ' + steamid3.getSteam3RenderedID() + ' is banned by: **' + obj[index].bannedBy + '**. Reason: **' + obj[index].reason + '**. Date: **' + obj[index].bannedOn + '**');
                            } else {
                                message.reply('SteamID3: ' + steamid3.getSteam3RenderedID() + ' is not banned');
                            }
                        }
                    }
                    );
                }
                ).catch((error) => {
                    message.reply('Profile not found OR steam returned some error.');
                });
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
        } else if (message.content.startsWith('$testTimer')) {
            //if profile is requested
            var args = message.content.split(' ');
            var time = args[1];
            var unix = addTimeToUnix(time);
            var currentUnixTime = Math.floor(new Date().getTime() / 1000);
            message.reply(`Current unix time <t:${currentUnixTime}:R>. The timer after penalty <t:${unix}:R>`);

        } else if (message.content.startsWith('$addVip')) {
            //add vip to vips.json if its not found
            console.log("add vip called");
            var args = message.content.split(' ');
            var time = args[1];
            var expireTime = addTimeToUnix(time);
            var profile = args[2];
            var nickname = args[3];
            //if args 1, 2 or 3 is undefined, reply and return
            if (args[1] === undefined || args[2] === undefined || args[3] === undefined) {
                message.reply('Invalid arguments. Use: $addVip <time> <profile> <nickname>');
                return;
            }
            if (profile.startsWith('https://steamcommunity.com/profiles/')) {
                //get everything after /profiles and ensure, use regex to get only numbers
                let steamid = profile.match(/(?<=\/profiles\/)\d+/)[0];
                //convert steamid64 to steamid3
                let steamid3 = new SteamID(steamid);
                //check if steamid3 is already banned
                fs.readFile('./lists/vips.json', 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data);
                        var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                        if (index !== -1) {
                            message.reply('User: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID() + ' is already VIP.');
                        } else {
                            //ban the player steamid3
                            obj.push({
                                steamid: steamid3.getSteam3RenderedID(),
                                addedBy: message.author.username,
                                addedOn: Math.floor(new Date().getTime() / 1000),
                                expiresOn: expireTime,
                                nickname: nickname
                            });
                            json = JSON.stringify(obj);
                            fs.writeFile('./lists/vips.json', json, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            message.reply('Adding VIP: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID());
                        }
                    }
                });
            } else if (profile.startsWith('https://steamcommunity.com/id/')) {
                let steamid = steamIdResolver.customUrlToSteamID64(profile).then((steamid) => {
                    //convert steamid64 to steamid3
                    let steamid3 = new SteamID(steamid);
                    //check if steamid3 is already banned
                    fs.readFile('./lists/vips.json', 'utf8', function readFileCallback(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            obj = JSON.parse(data);
                            var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                            if (index !== -1) {
                                message.reply('User: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID() + ' is already VIP.');

                            } else {
                                //ban the player steamid3
                                obj.push({
                                    steamid: steamid3.getSteam3RenderedID(),
                                    addedBy: message.author.username,
                                    addedOn: Math.floor(new Date().getTime() / 1000),
                                    expiresOn: expireTime,
                                    nickname: nickname
                                });
                                json = JSON.stringify(obj);
                                fs.writeFile('./lists/vips.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                message.reply('Adding VIP: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID());
                            }
                        }
                    });
                });
            }
        } else if (message.content.startsWith('$removeVip')) {
            //find if the steamid is in vips.json and if it is, remove it
            var args = message.content.split(' ');
            var profile = args[1];
            if (profile.startsWith('https://steamcommunity.com/profiles/')) {
                //get everything after /profiles and ensure, use regex to get only numbers
                let steamid = profile.match(/(?<=\/profiles\/)\d+/)[0];
                //convert steamid64 to steamid3
                let steamid3 = new SteamID(steamid);
                //check if steamid3 is already banned
                fs.readFile('./lists/vips.json', 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data);
                        var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                        if (index !== -1) {
                            obj.splice(index, 1);
                            json = JSON.stringify(obj);
                            fs.writeFile('./lists/vips.json', json, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            message.reply('Removing VIP: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID());
                        } else {
                            message.reply('User: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID() + ' is not VIP.');
                        }
                    }
                });
            } else if (profile.startsWith('https://steamcommunity.com/id/')) {
                let steamid = steamIdResolver.customUrlToSteamID64(profile).then((steamid) => {
                    //convert steamid64 to steamid3
                    let steamid3 = new SteamID(steamid);
                    //check if steamid3 is already banned
                    fs.readFile('./lists/vips.json', 'utf8', function readFileCallback(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            obj = JSON.parse(data);
                            var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                            if (index !== -1) {
                                obj.splice(index, 1);
                                json = JSON.stringify(obj);
                                fs.writeFile('./lists/vips.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                message.reply('Removing VIP: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID());
                            }
                        }
                    });
                });
            } else if (profile.startsWith('[U:1') || profile.startsWith('[U:0')) {
                let steamid3 = new SteamID(profile);
                //check if steamid3 is already banned
                fs.readFile('./lists/vips.json', 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data);
                        var index = obj.findIndex(x => x.steamid === steamid3.getSteam3RenderedID());
                        if (index !== -1) {
                            obj.splice(index, 1);
                            json = JSON.stringify(obj);
                            fs.writeFile('./lists/vips.json', json, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            message.reply('Removing VIP: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID());
                        }
                    }
                });
            }
        } else if (message.content.startsWith('$vipList')) {
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
});











client.login(process.env.DISCORD_TOKEN);
exports.client = client;
exports.getGlobalPlayers = getGlobalPlayers;
exports.getServers = getServers;