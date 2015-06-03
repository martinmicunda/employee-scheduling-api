'use strict';

var pkg     = require('./package.json');
var logger  = require('mm-node-logger')(module);

//import koa from 'koa';
var koa = require('koa');
let app = koa();



var couchbase = require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
var bucket = cluster.openBucket('default');

//bucket.upsert('testdoc', {name:'Frank'}, function(err, result) {
//    if (err) throw err;
//
//    bucket.get('testdoc', function(err, result) {
//        if (err) throw err;
//
//        console.log(result.value);
//        // {name: Frank}
//    });
//});

app.use(function *(){
    let test = 'Hello Word';
    this.body = test;
     //var arr = ['a', 'e', 'i', 'o', 'u'];
    //arr.forEach(vowel => {
    //    console.log(vowel);
    //});
});
//expressApp.route(apiVersion + '/package')
//    .get(function(req, res) {
//        res.status(200).send(require('../package'));
//    });

app.listen(3000, function () {
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
    '*************************************************************************************************',
    ''].join('\n');
    logger.info(serverBanner);
});
