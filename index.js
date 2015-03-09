'use strict';

var pkg     = require('./package.json');
var logger  = require('mm-node-logger')(module);

var redis     = require('./lib/config/redis');
//import koa from 'koa';
var koa = require('koa');
let app = koa();

function Person () {

    let fullName = null;

    this.getName = function () {
        return fullName;
    };

    this.setName = function (name) {
        fullName = name;
        return this;
    };
}

let jon = new Person();
jon.setName("Jon Doe");

app.use(function *(){
    let test = 'Hello Word';
    logger.info('process ' + process.env.MYSQL_DB);
    this.body = test;
    logger.info(jon.getName());
    var arr = ['a', 'e', 'i', 'o', 'u'];
    arr.forEach(vowel => {
        console.log(vowel);
    });
});
//expressApp.route(apiVersion + '/package')
//    .get(function(req, res) {
//        res.status(200).send(require('../package'));
//    });

app.listen(process.env.APP_PORT, function () {
    var serverBanner = ['',
    '*************************************' + ' KOA SERVER '.yellow + '********************************************',
    '*',
    `* ${pkg.description}`,
        `* @version ${pkg.version}`,
        `* @author ${pkg.author.name}`,
        `* @copyright 2014-${new Date().getFullYear()} ${pkg.author.name}`,
        `* @license ${pkg.license.type}, ${pkg.license.url}`,
        '*',
    '*' + ` App started on port: ${process.env.APP_PORT} - with environment: ${process.env.APP_ENV}`.blue,
    '*',
    '*************************************************************************************************'.green,
    ''].join('\n');
    logger.info(serverBanner);
});

