"use strict";

let salesforce = require('./salesforce'),
    messenger = require('./messenger'),
    formatter = require('./formatter');

exports.schedule_visit = (sender, values) => {
    salesforce.findProperties({id: values[1]}).then(properties => {
        messenger.send(formatter.formatAppointment(properties[0]), sender);
    });
};

exports.contact_broker = (sender, values) => {
    messenger.send({text: "Here is the broker information for this property"}, sender);
    messenger.send(formatter.formatBroker(), sender);
};

exports.more_info = (sender, values) => {
    console.log(values[1])
    messenger.send({text: "Here is more information about this property"}, sender);
    salesforce.findProperties({id: values[1]}).then(properties => {
        messenger.send(formatter.formatMoreInfo(properties[0]), sender);
    });
};

exports.confirm_visit = (sender, values) => {
    salesforce.findProperties({id: values[3]}).then(properties => {
        console.log(properties[0]);
        console.log(values[2]);
        console.log(properties[0].get('id'));
        console.log(properties[0].get('title__c'));

        // parse values[2]
        // ex. Tue May 24th at 10am
        var month;
        var time;

        var year = 2016;
        if (values[2].indexOf('Jan') >= 0){
            month = 0;
        }
        else if (values[2].indexOf('Feb') >= 0){
            month = 1;
        }
        else if (values[2].indexOf('Mar') >= 0){
            month = 2;
        }
        else if (values[2].indexOf('Apr') >= 0){
            month = 3;
        }
        else if (values[2].indexOf('May') >= 0){
            month = 4;
        }
        else if (values[2].indexOf('Jun') >= 0){
            month = 5;
        }
        else if (values[2].indexOf('Jul') >= 0){
            month = 6;
        }
        else if (values[2].indexOf('Aug') >= 0){
            month = 7;
        }
        else if (values[2].indexOf('Sep') >= 0){
            month = 8;
        }
        else if (values[2].indexOf('Oct') >= 0){
            month = 9;
        }
        else if (values[2].indexOf('Nov') >= 0){
            month = 10;
        }
        else if (values[2].indexOf('Dec') >= 0){
            month = 11;
        }
        console.log('month: ' + month);

        var date_short = values[2].substring(8);
        var dst = date_short.indexOf('st');
        var dnd = date_short.indexOf('nd');
        var drd = date_short.indexOf('rd');
        var dth = date_short.indexOf('th');
        var place = Math.max.apply(null,[dst, dnd, drd, dth]);
        var day = Number(date_short.substring(0, place));

        console.log('day: ' + day);

        var hour;
        if (values[2].indexOf('10am') >= 0){
            hour = 10;
        }
        else if(values[2].indexOf('9am') >= 0){
            hour = 9;
        }
        else if(values[2].indexOf('5pm') >= 0){
            hour = 17;
        }
        else if(values[2].indexOf('1pm') >= 0){
            hour = 13;
        }
        else if(values[2].indexOf('6pm') >= 0){
            hour = 18;
        }

        console.log('hour: ' + hour);

        var hv_date = new Date(Date.UTC(year, month, day, hour, 0, 0));

        hv_date.setUTCHours(hv_date.getUTCHours() + 420/60);
        console.log(hv_date);

        salesforce.createHomeViewing(properties[0].get('id'), properties[0].get('title__c'), sender, hv_date).then(() => {
            messenger.send({text: `OK, your appointment is confirmed for ${values[2]}. ${values[1]}.`}, sender);
        });
    });
        
};

exports.contact_me = (sender, values) => {
    let propertyId = values[1];
    messenger.getUserInfo(sender).then(response => {
        salesforce.createCase(properties[0].get('id'), response.first_name + " " + response.first_name, sender).then(() => {
            messenger.send({text: `Thanks for your interest, ${response.first_name}. I asked a broker to contact you asap.`}, sender);
        });
    });

};
