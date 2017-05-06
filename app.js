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
                var text = "List of news sources \n" +
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
                    "17. *Hacker News* From different sources \n\n\n" +
                    "To get news articles from a particular news source, " +
                    "try these commands. \n- Show me the latest google news \n- Top bbc news \n- Techcrunch news right now \n- Popular national geographic news";
                var options = {
                    parse_mode: "Markdown",
                    disable_web_page_preview: true
                };
                bot.sendMessage(msg.chat.id, text, options);
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