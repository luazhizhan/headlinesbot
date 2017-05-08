var botan = require('botanio')("APK-KEY-HERE");
var TelegramBot = require('node-telegram-bot-api');
var apiai = require('apiai');
var request = require('request');

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
var newsApiKey = "NEWS-API-KEY";


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
                        keyboard: getKeyboardMarkupArr()
                    }
                };
                break;
            case "/sources":
                botan.track(msg, '/sources');
                txt = getListOfNewsSources();
                options = {
                    parse_mode: "Markdown",
                    disable_web_page_preview: true,
                };
                break;
            case "/help":
                botan.track(msg, '/help');
                txt = "I have been trained to understand what you are typing. You may try sending any of these to me." +
                    "\n- Show me google news \n- BBC news \n- Techcrunch news \n- National geographic news" +
                    "\n\nCommands: \n/sources - list of news sources \n/help - help list \n/restart - back to beginning \n";
                break;
            case "/restart":
                botan.track(msg, '/restart');
                txt = getCommandStartTxt();
                options = {
                    reply_markup: {
                        keyboard: getKeyboardMarkupArr()
                    }
                };
                break;
            default:
                txt = "I do not understand that command." +
                    "\n\nCommands that I know: \n/sources - list of news sources \n/help - help list \n/restart - back to beginning \n";
                break;
        }
        bot.sendMessage(msg.chat.id, txt, options);
    } else {
        var apiaiRequest = apiaiApp.textRequest(msg.text, {
            sessionId: parseInt(msg.chat.id)
        });
        apiaiRequest.on('response', function (response) {
            console.log("apiai response: " + JSON.stringify(response));
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
                            txt = "*" + sourceTitle + "*\n\n" + "[Powered by News API](https://newsapi.org/)";
                            bot.sendMessage(msg.chat.id, txt, options);

                            var articlesLength = 0;
                            for (articlesLength; articlesLength < articles.length; articlesLength++) {
                                var articlesObj = articles[articlesLength];
                                txt = "*" + articlesObj.title + "*\n" + articlesObj.description +
                                    "\n[View full article here](" + articlesObj.url + ")\n\n";
                                bot.sendMessage(msg.chat.id, txt, options);
                            }
                        } else {
                            botan.track(msg, 'News Articles Intent Error');
                            console.log('error:', error);
                            bot.sendMessage(msg.chat.id, "An error has occured, please try again later", options);
                        }
                    });
                    break;
                case "News Sources Intent":
                    botan.track(msg, 'News Sources Intent');
                    txt = getListOfNewsSources();
                    options = {
                        parse_mode: "Markdown",
                        disable_web_page_preview: true,
                    };
                    bot.sendMessage(msg.chat.id, txt, options);
                    break;
                case "Default Fallback Intent":
                    botan.track(msg, 'Default Fallback Intent');
                    txt = response.result.fulfillment.messages[0].speech;
                    bot.sendMessage(msg.chat.id, txt, options);
                    break;
                default:
                    botan.track(msg, 'Unkonwn Intent');
                    txt = "Sorry, I do not understand you.";
                    break;
            }
        });
        apiaiRequest.on('error', function (error) {
            botan.track(msg, 'api ai request error');
            txt = "Sorry, an error has occur. Please try again later.";
            bot.sendMessage(msg.chat.id, txt, options);
        });
        apiaiRequest.end();
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

function getListOfNewsSources() {
    return "List of news sources \n" +
        "1. [ABC News](http://abcnews.go.com/) Your trusted source for breaking news, analysis, exclusive interviews, headlines, and videos at ABCNews.com \n\n" +
        "2. [BBC News](http://www.bbc.com/news) Visit BBC News for up-to-the-minute news, breaking news, video, audio and feature stories. BBC News provides trusted World and UK news as well as local and ... \n\n" +
        "3. [BBC Sport](http://www.bbc.com/sport) The home of BBC Sport online. Includes live sports coverage, breaking news \n\n" +
        "4. [CNN News](http://edition.cnn.com/) View the latest news and breaking news today for U.S., world, weather, entertainment, politics and health at CNN.com\n\n" +
        "5. [The Washington Post](https://www.washingtonpost.com/) Breaking news and analysis on politics, business, world national news, entertainment more. In-depth DC, Virginia, Maryland news coverage including traffic ... \n\n" +
        "6. [The New York Times](https://www.nytimes.com/) The New York Times: Find breaking news, multimedia, reviews & opinion on Washington, business, sports, movies, travel, books, jobs, education, real estate, ... \n\n" +
        "7. [Google News](https://news.google.com/) Comprehensive, up-to-date news coverage, aggregated from sources all over the world by Google News. \n\n" +
        "8. [Bloomberg](https://www.bloomberg.com) Bloomberg delivers business and markets news, data, analysis, and video to the world, featuring stories from Businessweek and Bloomberg News. \n\n" +
        "9. [Fox News](http://www.foxnews.com/) Breaking News, Latest News and Current News from FOXNews.com. Breaking news and video. Latest Current News: U.S., World, Entertainment, Health, ... \n\n" +
        "10. [The Independent](http://www.independent.co.uk/) Online newspaper. Includes culture, lifestyle, tech and sport. Offers various subscription packages. \n\n" +
        "11. [National Geographic](http://www.nationalgeographic.com/) Explore National Geographic. A world leader in geography, cartography and exploration.\n\n" +
        "12. [Techcrunch](https://techcrunch.com/) TechCrunch is a leading technology media property, dedicated to obsessively profiling startups, reviewing new Internet products, and breaking tech news. \n\n" +
        "13. [The Economist](http://www.economist.com/) The Economist offers authoritative insight and opinion on international news, politics, business, finance, science, technology and the connections between them. \n\n" +
        "14. [Business Insider](http://www.businessinsider.com/) Business Insider is a fast-growing business site with deep financial, media, tech, and other industry verticals. Launched in 2007, the site is now the largest ... \n\n" +
        "15. [Engadget](https://www.engadget.com/) Engadget is the original home for technology news and reviews. Since its founding in 2004, we've grown from an exhaustive source for consumer tech news to a ... \n\n" +
        "16. [The Wall Street Journal](https://www.wsj.com) WSJ online coverage of breaking news and current headlines from the US and around the world. Top stories, photos, videos, detailed analysis and in-depth ... \n\n" +
        "17. [The Telegraph](http://www.telegraph.co.uk/) Latest news, business, sport, comment, lifestyle and culture from the Daily Telegraph and Sunday Telegraph newspapers and video from Telegraph TV. \n\n" +
        "18. [The Lad Bible](http://www.ladbible.com/) LADbible is the home of entertainment, original video, viral content and news. We are the biggest community in the world for a social generation. \n\n" +
        "19. [IGN](http://ign.com/) IGN is your site for Xbox One, PS4, PC, Wii-U, Xbox 360, PS3, Wii, 3DS, PS Vita & iPhone games with expert reviews, news, previews, trailers, cheat codes, wiki ... \n\n" +
        "20. [Entertainment Weekly](http://ew.com/) Entertainment Weekly has all the latest news about TV shows, movies, and music, as well as exclusive behind the scenes content from the entertainment ... \n\n" +
        "21. *Hacker News* From different sources";
}

function getKeyboardMarkupArr() {
    return [
        ["ABC News"],
        ["BBC News"],
        ["BBC Sport"],
        ["CNN News"],
        ["The Washington Post"],
        ["The New York Times"],
        ["Google News"],
        ["Bloomberg"],
        ["Fox Sport"],
        ["The Independent"],
        ["National Geographic"],
        ["Techcrunch"],
        ["The Economist"],
        ["Business Insider"],
        ["Engadget"],
        ["The Wall Street Journal"],
        ["The Telegraph"],
        ["The Lad Bible"],
        ["IGN"],
        ["Entertainment Weekly"],
        ["Hacker News"]
    ];
}

function getCommandStartTxt() {
    return "Hi there, what can I do for you?" +
        "\n\nI have been trained to understand what you are typing. You may try sending any of these to me." +
        "\n- Show me google news \n- BBC news \n- Techcrunch news \n- National geographic news" +
        "\n\nCommands: \n/sources - list of news sources \n/help - help list \n/restart - back to beginning \n";
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
    }
    return newsSourceStr;
}