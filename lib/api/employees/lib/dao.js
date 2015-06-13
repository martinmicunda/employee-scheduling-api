/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var employeeSchema = require('./schema');

var db = require('../../config/couchbase').mainBucket;

/**
 * Finds a country by name.
 * @author Martin Micunda
 *
 * @method findByName
 * @param {Object}   params      Key value pair object to escape in sql query
 * @param {String}   params.name The country name
 * @param {Function} callback    Callback function
 */
function findByName(params, callback) {
    var values = [
        params.name
    ];

    var sql = 'SELECT code FROM country WHERE name = ?';

    db.query({
        sql : sql,
        values: values,
        callback : callback
    });
}

function insert(params, callback) {
    var values = [
        params.userId,
        params.description
    ];

    var sql = "insert into task "+
        " (userId, description)"+
        " values (?,?)";

    db.query({
        sql : sql,
        values: values,
        callback : callback
    });

    db.upsert('testdoc', {name:'Frank'}, function(err, result) {
        if (err) throw err;

        db.get('testdoc', function(err, result) {
            if (err) throw err;

            console.log(result.value);
            // {name: Frank}
        });
    });
}

module.exports = {
    findByName: findByName
};
