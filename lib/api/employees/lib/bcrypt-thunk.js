/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';


function genSalt(rounds, ignore) {
    return new Promise(function (resolve, reject) {
        bcrypt.genSalt(rounds, ignore, function (error, salt) {
            if (error) { return reject(error); }
            return resolve(salt);
        });
    });
};

// https://github.com/joeybloggs/nodejs-koa/blob/development/app%2Fmodels%2Fuser.js

// https://medium.com/@poeticninja/authentication-and-authorization-with-hapi-5529b5ecc8ec
// https://www.npmjs.com/package/boom
