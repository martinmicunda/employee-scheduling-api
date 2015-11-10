/**
 * This module flush and seed the bucket from set of .json files in ./fixtures directories.
 *
 * Usage: $ node seed
 * @see {@link ./setup.js}
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import glob from 'glob';
import path from 'path';
import request from 'request-promise';
import mmLogger from 'mm-node-logger';
import db from './couchbase';
import config from './config';

const logger = mmLogger(module);

/**
 * Flush a bucket.
 *
 * @throws Will throw an error if it failed to flush a bucket.
 * @api private
 */
async function flushBucket() {
    logger.info(`    FLUSH BUCKET ${config.couchbase.bucket} STARTED`);

    try {
        await request.post({
            url: `http://${config.couchbase.host}:${config.couchbase.port}/pools/default/buckets/${config.couchbase.bucket}/controller/doFlush`,
            auth: {
                user: config.couchbase.username,
                pass: config.couchbase.password
            }
        });
    } catch(error) {
        logger.error(`    FLUSH BUCKET ${config.couchbase.bucket} FAILED`);
        throw error;
    }

    logger.info(`    FLUSH BUCKET ${config.couchbase.bucket} COMPLETED`);
}

/**
 * Populate a bucket.
 *
 * @throws Will throw an error if it failed to populate a bucket.
 * @api private
 */
async function populateBucket() {
    logger.info(`    POPULATE BUCKET ${config.couchbase.bucket} STARTED`);

    try {
        const dir = path.join(__dirname, config.couchbase.seedGlob);
        const files = glob.sync(dir);
        const insertsOperations = [];

        // push the chain for each file to an array of generators
        files.forEach(file => {
            logger.info(`      LOADING SEED FILE ${file}`);
            insertsOperations.push(require(file));
        });

        let counter = 0;
        let totalInsertedRecords = 0;

        // run all inserts operations
        while(files.length > 0) {
            if (counter === insertsOperations.length) {break;}

            let records = await* insertsOperations[counter];
            totalInsertedRecords = totalInsertedRecords + records.length;

            counter++;
        }

        logger.info(`      TOTAL INSERTED RECORDS ${totalInsertedRecords}`);
    } catch(error) {
        logger.error(`   POPULATE BUCKET ${config.couchbase.bucket} FAILED`.red);
        throw error;
    }

    logger.info(`    POPULATE BUCKET ${config.couchbase.bucket} COMPLETED`);
}

/**
 * Flush and seed the bucket from set of .json files in ./fixtures directories.
 *
 * @api public
 */
async function seedBucket() {
    logger.info(' ⇒ SEED: INITIATED');

    try {
        await db.connect();
        await flushBucket();
        await populateBucket();
    } catch(error) {
        logger.info(' ⇐ SEED: FAILED');

        logger.error('====----===='.red);
        logger.error(`SEED ERROR: ${error}`.red);
        logger.error('PLEASE CHECK config.js IS POINTING TO A VALID COUCHBASE INSTANCE'.red);
        logger.error('====----===='.red);
        process.exit(9);
    } finally {
        db.disconnect();
    }

    logger.info(' ⇐ SEED: DONE');
}

(() => seedBucket())();
