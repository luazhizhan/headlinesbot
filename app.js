var TelegramBot = require('node-telegram-bot-api');
var apiai = require('apiai');
var TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
var options = {
    webHook: {
        port: process.env.PORT
    }
};


/**
 * Bot webhook set up
 */
var url = process.env.APP_URL || 'https://<app-name>.herokuapp.com:443';
var bot = new TelegramBot(TOKEN, options);
bot.setWebHook(`${url}/bot${TOKEN}`);

//api ai set up
var app = apiai("CLIENT-ACCESS-KEY");


/**
 * Bot methods
 */
bot.on('message', function onMessage(msg) {
    console.log("Incoming message object ===" + JSON.stringify(msg));
    var isBotCommand = checkForBotCommand(msg);
    console.log("isBotCommand: " + isBotCommand);
    if (isBotCommand) {
        switch (msg.text) {
            case "/sources":
                console.log("text: /sources");
                var options = {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "test 1",
                                    callback_data: "test_1"
                                },
                                {
                                    text: "test 2",
                                    callback_data: "test_2"
                                },
                                {
                                    text: "test 3",
                                    callback_data: "test_3"
                                }
                            ]
                        ]
                    }
                };
                bot.sendMessage(msg.chat.id, 'text: /sources', options);
                break;
            case "/help":
                console.log("text: /help");
                break;
            case "/restart":
                console.log("text: /restart");
                break;
        }
    }
    bot.sendMessage(msg.chat.id, 'I am alive on Heroku!');
});

bot.on('callback_query', function onCallback(msg) {
    console.log("callback_query incoming message object === " + JSON.stringify(msg));
    bot.sendMessage(msg.from.id, 'I am alive on Heroku! (callback_query)');
});


/**
 * Logic functions
 */
function checkForBotCommand(msgObj) {
    if (msgObj.entities !== undefined) {
        return true;
    }
    return false;
}