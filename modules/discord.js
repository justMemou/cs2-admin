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

function getGlobalPlayers(localGlobalPlayers) {
    globalPlayers = localGlobalPlayers;
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
            var reason = args[2];
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
                            message.reply('Banning: https://steamcommunity.com/profiles/' + steamid3.getSteam3RenderedID());
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

        } else if (message.content == "$help") {
            message.reply('Commands:\n$```$ban <profile link> <reason>\n -Example: $ban https://steamcommunity.com/id/memopekc/ just-a-prank\n\n $unban <profile link>\n -Example: $unban https://steamcommunity.com/id/memopekc/\n\n $findban <profile link>\n -Example: $findban https://steamcommunity.com/id/memopekc/\n\n $help \n -OBVIOUSLY THIS MENU```');
        }

    });
});











client.login(process.env.DISCORD_TOKEN);
exports.client = client;
exports.getGlobalPlayers = getGlobalPlayers;
