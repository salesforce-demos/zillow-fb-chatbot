"use strict";

let salesforce = require('./salesforce'),
    messenger = require('./messenger'),
    formatter = require('./formatter'),
    fetchUrl = require('fetch').fetchUrl,
    pinterestAPI = require('pinterest-api'),
    request = require('request');

exports.searchHouse = (sender) => {
    console.log('searchHouse');
    messenger.send({text: `OK, looking for houses for sale around you...`}, sender);
    salesforce.findProperties().then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_City = (sender, values) => {
    console.log('searchHouse_City');
    messenger.send({text: `OK, looking for houses in ${values[1]}`}, sender);
    salesforce.findProperties({city: values[1]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Bedrooms_City_Range = (sender, values) => {
    console.log('searchHouse_Bedrooms_City_Range');
    messenger.send({text: `OK, looking for ${values[1]} bedrooms in ${values[2]} between ${values[3]} and ${values[4]}`}, sender);
    salesforce.findProperties({bedrooms: values[1], city: values[2]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Bedrooms_City = (sender, values) => {
    console.log('searchHouse_Bedrooms_City');
    messenger.send({text: `OK, looking for ${values[1]} bedroom houses in ${values[2]}`}, sender);
    salesforce.findProperties({bedrooms: values[1], city: values[2]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Bedrooms = (sender, values) => {
    console.log('searchHouse_Bedrooms');
    messenger.send({text: `OK, looking for ${values[1]} bedrooms`}, sender);
    salesforce.findProperties({bedrooms: values[1]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Range = (sender, values) => {
    console.log('searchHouse_Range');
    messenger.send({text: `OK, looking for houses between ${values[1]} and ${values[2]}`}, sender);
    salesforce.findProperties({priceMin: values[1], priceMax: values[2]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.priceChanges = (sender, values) => {
    console.log('priceChanges');
    messenger.send({text: `OK, looking for recent price changes...`}, sender);
    salesforce.findPriceChanges().then(priceChanges => {
        messenger.send(formatter.formatPriceChanges(priceChanges), sender);
    });
};

exports.hi = (sender) => {
    console.log('hi');
    messenger.getUserInfo(sender).then(response => {
        messenger.send({text: `Hello, ${response.first_name}, how can I help you today?`}, sender);
    });
};

exports.recentHouse = (sender) => {
    console.log('recentHouse');
    messenger.send({text: `Sure, here are the homes you recently viewed. Would you like to hear more?`}, sender);
    salesforce.findRecentProperties().then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
}

exports.notInterested = (sender) => {
    console.log('notInterested');
    messenger.send({text: `Absolutely. What are you looking for in your dream home? If you have a Pinterest board of your favorite homes, feel free to send that to me, and I’ll use my smarts to find you similar homes.`}, sender);
}

exports.pinterest = (sender, values) => {
    console.log('pinterest');
    
    const pinterest_api = 'https://staging.metamind.io/vision/classify';
    const pinterest_key = 'w2eiD3Hsg09oMQH3riBURXkXC1ybebn07uLYONsItq9Eeq4HZJ';
    const classifierId = 7377;

    // request.post({
    //     url: pinterest_api,
    //     headers: {
    //         Authorization: `Basic ${pinterest_key}`
    //     },
    //     timeout: 1500,
    //     body: JSON.stringify({image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Ellen_H._Swallow_Richards_House_Boston_MA_01.jpg', classifier_id: classifierId })
    // }, (err, res, body) => {
    //     console.log('>>>>>>>>>>>>>>>>>>');
    //     if(err) console.log(err);
    //     console.log(body);
    // })


    var finalUrl, pinterest_user, pinterest_board;
    fetchUrl(values.input, function(error, meta, body){
        console.log('>>>>>>>>>>>>>>>' + meta.finalUrl);
        finalUrl = meta.finalUrl;
        var ind = finalUrl.indexOf('pinterest.com');
        var pieces = finalUrl.substring(ind+13+1).split('/');
        pinterest_user = pieces[0];
        pinterest_board = pieces[1];

        console.log('>>>>> pinterest user: ' + pinterest_user);
        console.log('>>>>> pinterest board: ' + pinterest_board);
    
        // var pinterest = pinterestAPI(pinterest_user);
        var pinterest = pinterestAPI('juliana211');
        
        pinterest.getPinsFromBoard('my-dream-house', true, function (pins) {
            for (var i=0; i<pins.data.length; i++){
                console.log(pins.data[i].images['237x'].url);
            }

            messenger.send({text: `Thanks for sharing your Pinterest board. Taking a look...`}, sender);
            setTimeout(function(){
                messenger.send({text: 'Wow, great taste! We found contemporary themes in your Pinterest board. Here are some great listings to check out.'}, sender);
                salesforce.findProperties({Home_Style__c: 'Contemporary'}).then(properties => {
                    messenger.send(formatter.formatProperties(properties), sender);
                });
            }, 2222);
        });
    });
};

exports.help = (sender) => {
    console.log('help');
    messenger.send({text: `You can ask me questions like "Find houses in Boston", "3 bedrooms in Boston", "3 bedrooms in Boston between 500000 and 750000", "show me price changes"`}, sender);
};