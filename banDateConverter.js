//read lists/listids.json foreach and convert bannedOn to unix timestamp
let fs = require('fs');
let listids = JSON.parse(fs.readFileSync('./lists/listids.json', 'utf8'));
let listidsConverted = [];
listids.forEach(ban => {
    let banDate = new Date(ban.bannedOn);
    let banDateUnix = banDate.getTime() / 1000;
    listidsConverted.push({
        steamid: ban.steamid,
        reason: ban.reason,
        bannedOn: banDateUnix,
        bannedBy: ban.bannedBy,
        banExpires: "permanent"
        

    });
});
fs.writeFileSync('./lists/listids.json', JSON.stringify(listidsConverted));
