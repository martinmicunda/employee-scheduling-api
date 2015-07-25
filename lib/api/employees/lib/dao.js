/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var logger    = require('mm-node-logger')(module);
import co from 'co';
import uuid from 'node-uuid';
import { mainBucket as db, errors as dbErrors, N1qlQuery } from '../../../config/couchbase';

const DOC_TYPE = 'employee';
const SALT_WORK_FACTOR = 10;

function insert(doc) {
    doc.id = `${DOC_TYPE}::${uuid.v1()}`;
    doc.type = DOC_TYPE; // map-reduces

    // referential document to lookup partner 'email' and prevent duplicates
    const refDocId = `${DOC_TYPE}::email::${doc.email.replace(/ /g,'').toLowerCase()}`;
    const refDoc = {
        type: `${DOC_TYPE}::email`,
        employeeId: doc.id
    };

    return new Promise((resolve, reject) => {
        // insert referential document first
        db.insert(refDocId, refDoc, (error) => {
            if(error) {
                if(error.code === dbErrors.keyAlreadyExists) {
                    error.statusCode = 409;
                } else {
                    error.statusCode = 500;
                }

                logger.error(`DB insert - ${refDoc.type}: `, error.message);

                return reject(error);
            }

            // insert employee document
            db.insert(doc.id, doc, (error, result) => {
                if(error) {
                    if(error.code === dbErrors.keyAlreadyExists) {
                        error.statusCode = 409;
                    } else {
                        error.statusCode = 500;
                    }

                    logger.error(`DB insert - ${doc.type}: `, error.message);

                    return reject(error);
                }

                result.id = doc.id;
                result.version = result.cas;
                delete result.cas;

                return resolve(result);
            });
        });
    });

    co(function*() {
        try {
            var salt = yield bcrypt.genSalt();
            var hash = yield bcrypt.hash(this.password, salt);
            this.password = hash;
            done();
        }
        catch (err) {
            done(err);
        }
    }).call(this, done);

    // password changed so we need to hash it (generate a salt)
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) { return next(err); }

        // TODO (martin): is it good idea to store salt?
        // store salt
        user.salt = salt;

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) { return next(err); }

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
}
// https://github.com/dozoisch/koa-react-full-example/blob/master/src%2Fmodels%2Fuser.js

//export {findByID, find, insert, update, remove};

