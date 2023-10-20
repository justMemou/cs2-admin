# cs2-admin
cs2 ban system. sloppy code, might not be working properly.

Contributions are welcome.

# Sample diagram

![sample diagram](https://raw.githubusercontent.com/justMemou/cs2-admin/master/diagram.png)

## Installation
1. Move/copy `config.json-sample` to `config.json` and edit it. (CS2 server config)(!!!supports multiple servers!!!)

2. Move/copy `.env-sample` to `.env` and edit it. (discord bot)

3. Invite the discord bot to your server ID and setup the channel ID in .env

4. Run `npm install`

5. Run `node server.js`

6. Once you ensure that your nodejs server (waiting for events from the cs2 server (you can open `http://<YOUR-NODE-SERVER>:8080` and you SHOULD RECEIVE "Cannot GET /" ⬅️ THIS IS EXPECTED)) is running you can:

5. Put the following in your server.cfg

```
log on;
mp_logdetail 3;
mp_logmoney 1;
mp_logdetail_items 1;
logaddress_add_http "http://<YOUR-NODE-SERVER>:8080";
```



7. Change map on server so server.cfg config gets loaded.

## Available discord commands:
![discord commands](https://raw.githubusercontent.com/justMemou/cs2-admin/master/help.png)
Currently all of the listed functions **should** be fully functional.

The VIP system is **experimental**. It is only reserving slots. When a server hits 29 players - it starts refusing NON-VIP users.
Will try to improve it in few days/weeks.