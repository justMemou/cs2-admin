# cs2-admin
cs2 ban system. sloppy code, might not be working properly.
contributions are welcome.
## Installation
1.Move config.json-sample to config.json and edit it. (CS2 server config)
2.Move .env-sample to .env and edit it. (discord bot)
3.Run `npm install`
4. put:
```
log on;
mp_logdetail 3;
mp_logmoney 1;
mp_logdetail_items 1;
logaddress_add_http "http://<YOUR-NODE-SERVER>:8080";
```
in your server.cfg
5. Run `node server.js`

6. Invite the discord bot to your server ID and setup the channel ID in .env