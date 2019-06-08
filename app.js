var TelegramBot = require('node-telegram-bot-api');
var request = require('request');

var TOKEN = process.env.TELEGRAM_TOKEN || '<YOUR TELEGRAM API KEY>';
var options = {
    webHook: {
        port: process.env.PORT
    }
};


/**
 * Bot webhook set up
 */
var url = process.env.APP_URL || '<YOUR HEROKU APP URL>';
var bot = new TelegramBot(TOKEN, options);
bot.setWebHook(`${url}/bot${TOKEN}`);


//third party api set up
var newsApiKey = "<NEWSAPI KEY>";

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
                txt = "I have been trained to understand what you are typing. You may try sending any of these to me." +
                    "\n- Show me google news \n- BBC news \n- Techcrunch news \n- National geographic news" +
                    "\n\nCommands: \n/categories - list of news categories📰 \n/help - help list🆘" +
                    "\n/rate - rate my bot⭐ \n/restart - back to beginning \n";
                break;
            case "/rate":
                options = {
                    parse_mode: "Markdown",
                    disable_web_page_preview: false
                };
                txt = "Please help to rate my bot. Thank you.😃 \n\n";
                txt += "[Click here to rate](https://telegram.me/storebot?start=headlinesbot)";
                break;
            case "/feedback":
                options = {
                    parse_mode: "Markdown",
                    disable_web_page_preview: false
                };
                txt = "Please fill up this form if you have any feedback. Thank you.😃 \n\n";
                txt += "[Fill up form](https://goo.gl/forms/pqHM87dD99xtYS7X2)";
                break;
            case "/restart":
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
                options = {
                    reply_markup: {
                        keyboard: getGeneralNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Business👔":
                options = {
                    reply_markup: {
                        keyboard: getBusinessNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Entertainment🎉":
                options = {
                    reply_markup: {
                        keyboard: getEntertainmentNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Sports🏅":
                options = {
                    reply_markup: {
                        keyboard: getSportsNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Technology📱":
                options = {
                    reply_markup: {
                        keyboard: getTechNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Science and nature🔬🏞️":
                options = {
                    reply_markup: {
                        keyboard: getScienceAndNatureNewsKeyboardMarkupArr()
                    }
                };
                bot.sendMessage(msg.chat.id, txt, options);
                break;
            case "Gaming🎮":
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
                var sourceStr = getNewsSourceStr(msg.text);
                if (sourceStr !== undefined) {
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
                        } else {
                            console.log('error:', error);
                            bot.sendMessage(msg.chat.id, "An error has occured, please try again later", options);
                        }
                    });
                } else {
                    txt = "Sorry, I do not understand what you are typing yet";
                    bot.sendMessage(msg.chat.id, txt);
                }
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
    var newsSourceStr = undefined;
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