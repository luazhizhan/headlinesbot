var botan = require('botanio')("API-KEY");
var TelegramBot = require('node-telegram-bot-api');
var apiai = require('apiai');
var request = require('request');

var TOKEN = process.env.TELEGRAM_TOKEN || 'TOKEN';
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


//third party api set up
var apiaiApp = apiai("API-KEY");
var newsApiKey = "API-KEY";
var radbotsApiKey = "API-KEY";

/**
 * Bot methods
 */
bot.on('message', function onMessage(msg) {
    var isBotCommand = checkForBotCommand(msg);
    var txt = "";
    var options = {};
    if (isBotCommand) {
        switch (msg.text) {
            case "/start":
                botan.track(msg, '/start');
                txt = getCommandStartTxt();
                options = {
                    reply_markup: {
                        keyboard: getMainKeyBoardMarkupArr()
                    }
                };
                break;
            case "/categories":
                txt = "Here is a list of news categories.";
                options = {
                    reply_markup: {
                        keyboard: getMainKeyBoardMarkupArr()
                    }
                };
                break;
            case "/help":
                botan.track(msg, '/help');
                txt = "I have been trained to understand what you are typing. You may try sending any of these to me." +
                    "\n- Show me google news \n- BBC news \n- Techcrunch news \n- National geographic news" +
                    "\n\nCommands: \n/categories - list of news categories📰 \n/help - help list🆘" +
                    "\n/rate - rate my bot⭐ \n/restart - back to beginning \n";
                break;
            case "/rate":
                botan.track(msg, '/rate');
                options = {
                    parse_mode: "Markdown",
                    disable_web_page_preview: false
                };
                txt = "Please help to rate my bot. Thank you.😃 \n\n";
                txt += "[Click here to rate](https://telegram.me/storebot?start=headlinesbot)";
                break;
            case "/feedback":
                botan.track(msg, '/feedback');
                options = {
                    parse_mode: "Markdown",
                    disable_web_page_preview: false
                };
                txt = "Please fill up this form if you have any feedback. Thank you.😃 \n\n";
                txt += "[Fill up form](https://goo.gl/forms/pqHM87dD99xtYS7X2)";
                break;
            case "/restart":
                botan.track(msg, '/restart');
                txt = getCommandStartTxt();
                options = {
                    reply_markup: {
                        keyboard: getMainKeyBoardMarkupArr()
                    }
                };
                break;
            default:
                txt = "I do not understand that command." +
                    "\n\nCommands that I know: \n/categories - list of news categories📰 \n/help - help list🆘" +
                    "\n/rate - rate my bot⭐ \n/restart - back to beginning \n";
                break;
        }
        bot.sendMessage(msg.chat.id, txt, options);
    } else {
        txt = "Please select a news source";
        switch (msg.text) {
            case "General☀️":
                botan.track(msg, '/categories');
                options = {
                    reply_markup: {
                        keyboard: getGeneralNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Business👔":
                botan.track(msg, '/categories');
                options = {
                    reply_markup: {
                        keyboard: getBusinessNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Entertainment🎉":
                botan.track(msg, '/categories');
                options = {
                    reply_markup: {
                        keyboard: getEntertainmentNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Sports🏅":
                botan.track(msg, '/categories');
                options = {
                    reply_markup: {
                        keyboard: getSportsNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Technology📱":
                botan.track(msg, '/categories');
                options = {
                    reply_markup: {
                        keyboard: getTechNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Science and nature🔬🏞️":
                botan.track(msg, '/categories');
                options = {
                    reply_markup: {
                        keyboard: getScienceAndNatureNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Gaming🎮":
                botan.track(msg, '/categories');
                options = {
                    reply_markup: {
                        keyboard: getGamingNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Back":
                txt = "Please select a news category";
                options = {
                    reply_markup: {
                        keyboard: getMainKeyBoardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            default:
                var apiaiRequest = apiaiApp.textRequest(msg.text, {
                    sessionId: parseInt(msg.chat.id)
                });
                apiaiRequest.on('response', function (response) {
                    switch (response.result.metadata.intentName) {
                        case "Default Welcome Intent":
                            botan.track(msg, 'Default Welcome Intent');
                            txt = response.result.fulfillment.messages[0].speech;
                            bot.sendMessage(msg.chat.id, txt, options);
                            break;
                        case "News Articles Intent":
                            botan.track(msg, 'News Articles Intent');
                            var sourceTitle = response.result.parameters.source[0];
                            var sourceStr = getNewsSourceStr(sourceTitle);
                            var url = "https://newsapi.org" + "/v1/articles?source=" + sourceStr + "&apiKey=" + newsApiKey;
                            request(url, function (error, response, body) {
                                if (error === null) {
                                    var jsonData = JSON.parse(body);
                                    var articles = jsonData.articles;
                                    options = {
                                        parse_mode: "Markdown",
                                        disable_web_page_preview: false
                                    };
                                    var articlesLength = 0;
                                    for (articlesLength; articlesLength < articles.length; articlesLength++) {
                                        var articlesObj = articles[articlesLength];
                                        txt = "*" + articlesObj.title + "*\n" + articlesObj.description +
                                            "\n[View full article here](" + articlesObj.url + ")\n\n";
                                        bot.sendMessage(msg.chat.id, txt, options);
                                    }
                                    var adsURL = "https://radbots.com/api/ads?agent_key=" + radbotsApiKey + "&media_type=image&persona_id=" + msg.chat.id;
                                    request(adsURL, function (error, response, body) {
                                        var adsJSONData = JSON.parse(body);
                                        var photoOptions = {
                                            caption: '(AD) ' + adsJSONData.ad.cta_long,
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{
                                                        text: "Find out more",
                                                        url: adsJSONData.ad.url
                                                    }]
                                                ]
                                            }
                                        };
                                        bot.sendPhoto(msg.chat.id, adsJSONData.ad.media.url.medium, photoOptions);
                                    });
                                } else {
                                    botan.track(msg, 'News Articles Intent Error');
                                    console.log('error:', error);
                                    bot.sendMessage(msg.chat.id, "An error has occured, please try again later", options);
                                }
                            });
                            break;
                        case "News Categories Intent":
                            botan.track(msg, 'News Categories Intent');
                            txt = "Here is a list of news categories.";
                            options = {
                                reply_markup: {
                                    keyboard: getMainKeyBoardMarkupArr()
                                }
                            };
                            bot.sendMessage(msg.chat.id, txt, options);
                            break;
                        case "Default Fallback Intent":
                            botan.track(msg, 'Default Fallback Intent');
                            txt = response.result.fulfillment.messages[0].speech;
                            options = {
                                reply_markup: {
                                    keyboard: getMainKeyBoardMarkupArr()
                                }
                            };
                            bot.sendMessage(msg.chat.id, txt, options);
                            break;
                        default:
                            botan.track(msg, 'Unkonwn Intent');
                            txt = "Sorry, I do not understand you.";
                            options = {
                                reply_markup: {
                                    keyboard: getMainKeyBoardMarkupArr()
                                }
                            };
                            bot.sendMessage(msg.chat.id, txt, options);
                            break;
                    }
                });
                apiaiRequest.on('error', function (error) {
                    botan.track(msg, 'api ai request error');
                    txt = "Sorry, an error has occur. Please try again later.";
                    bot.sendMessage(msg.chat.id, txt, options);
                });
                apiaiRequest.end();
                break;
        }
    }
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

function getCommandStartTxt() {
    return "Hey there! What type of news would you like to read?" +
        "\n\nCommands: \n/categories - list of news categories📰 \n/help - help list🆘" +
        "\n/rate - rate my bot⭐  \n/feedback - give feedback \n/restart - back to beginning \n";
}

function getNewsSourceStr(sourceTitle) {
    var newsSourceStr = null;
    switch (sourceTitle) {
        case "ABC News":
            newsSourceStr = "abc-news-au";
            break;
        case "BBC News":
            newsSourceStr = "bbc-news";
            break;
        case "BBC Sport":
            newsSourceStr = "bbc-sport";
            break;
        case "CNN News":
            newsSourceStr = "cnn";
            break;
        case "The Washington Post":
            newsSourceStr = "the-washington-post";
            break;
        case "The New York Times":
            newsSourceStr = "the-new-york-times";
            break;
        case "Google News":
            newsSourceStr = "google-news";
            break;
        case "Bloomberg":
            newsSourceStr = "bloomberg";
            break;
        case "Fox News":
            newsSourceStr = "fox-sports";
            break;
        case "The Independent":
            newsSourceStr = "independent";
            break;
        case "National Geographic":
            newsSourceStr = "national-geographic";
            break;
        case "Techcrunch":
            newsSourceStr = "techcrunch";
            break;
        case "The Economist":
            newsSourceStr = "the-economist";
            break;
        case "Business Insider":
            newsSourceStr = "business-insider";
            break;
        case "Engadget":
            newsSourceStr = "engadget";
            break;
        case "The Wall Street Journal":
            newsSourceStr = "the-wall-street-journal";
            break;
        case "The Telegraph":
            newsSourceStr = "the-telegraph";
            break;
        case "The Lad Bible":
            newsSourceStr = "the-lad-bible";
            break;
        case "IGN":
            newsSourceStr = "ign";
            break;
        case "Entertainment Weekly":
            newsSourceStr = "entertainment-weekly";
            break;
        case "Hacker News":
            newsSourceStr = "hacker-news";
            break;
        case "New Scientist":
            newsSourceStr = "new-scientist";
            break;
        case "TechRadar":
            newsSourceStr = "techradar";
            break;
        case "The Next Web":
            newsSourceStr = "the-next-web";
            break;
        case "BuzzFeed":
            newsSourceStr = "buzzfeed";
            break;
        case "ESPN":
            newsSourceStr = "espn";
            break;
        case "talkSport":
            newsSourceStr = "talksport";
            break;
        case "SPORTbible":
            newsSourceStr = "the-sport-bible";
            break;
        case "CNBC":
            newsSourceStr = "cnbc";
            break;
        case "Fortune":
            newsSourceStr = "fortune";
            break;
        case "The Guardian (AU)":
            newsSourceStr = "the-guardian-au";
            break;
        case "The Guardian (UK)":
            newsSourceStr = "the-guardian-uk";
            break;
    }
    return newsSourceStr;
}



/**
 * Keyboard markup functions
 */
function getMainKeyBoardMarkupArr() {
    return [
        ["General☀️"],
        ["Business👔"],
        ["Entertainment🎉"],
        ["Sports🏅"],
        ["Technology📱"],
        ["Science and nature🔬🏞️"],
        ["Gaming🎮"]
    ];
}

function getGeneralNewsKeyboardMarkupArr() {
    return [
        ["ABC News"],
        ["BBC News"],
        ["CNN News"],
        ["The Washington Post"],
        ["The Guardian (AU)"],
        ["The Guardian (UK)"],
        ["The New York Times"],
        ["Google News"],
        ["The Independent"],
        ["The Telegraph"],
        ["Back"]
    ];
}

function getEntertainmentNewsKeyboardMarkupArr() {
    return [
        ["The Lad Bible"],
        ["Entertainment Weekly"],
        ["BuzzFeed"],
        ["Back"]
    ];
}

function getSportsNewsKeyboardMarkupArr() {
    return [
        ["ESPN"],
        ["talkSport"],
        ["SPORTbible"],
        ["BBC Sport"],
        ["Fox Sport"],
        ["Back"]
    ];
}

function getScienceAndNatureNewsKeyboardMarkupArr() {
    return [
        ["National Geographic"],
        ["New Scientist"],
        ["Back"]
    ];
}

function getBusinessNewsKeyboardMarkupArr() {
    return [
        ["Bloomberg"],
        ["CNBC"],
        ["The Economist"],
        ["Business Insider"],
        ["Fortune"],
        ["The Wall Street Journal"],
        ["Back"]
    ];
}

function getTechNewsKeyboardMarkupArr() {
    return [
        ["Techcrunch"],
        ["Engadget"],
        ["TechRadar"],
        ["The Next Web"],
        ["Hacker News"],
        ["Back"]
    ];
}

function getGamingNewsKeyboardMarkupArr() {
    return [
        ["IGN"],
        ["Back"]
    ];
}