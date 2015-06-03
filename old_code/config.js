'use strict';

var config = {};

// HTTP Port to run our web application
config.port = process.env.PORT || 2002;

// My own telephone number for notifications
config.ownNumber = process.env.TELEPHONE_NUMBER;

// Your Twilio account SID and auth token, both found at:
// https://www.twilio.com/user/account
//
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
config.twilioConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    // A Twilio number you control - choose one from:
    // https://www.twilio.com/user/account/phone-numbers/incoming
    number: process.env.TWILIO_NUMBER
};

// Google OAuth Configuration
config.googleConfig = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    redirectURL: 'http://localhost:2002/auth'
};

// MongoDB Settings
config.database = {
    ip: '127.0.0.1',
    port: 27017,
    name: 'twilio-pa'
};

// Export configuration object
module.exports = config;
