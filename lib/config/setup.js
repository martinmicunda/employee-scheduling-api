/**
 * This module provision and configure local instance of Couchbase Server.
 *
 * Usage: $ node setup
 * @see {@link http://developer.couchbase.com/documentation/server/4.0/rest-api/rest-endpoints-all.html}
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import config from './config';
import request from 'request-promise';
import mmLogger from 'mm-node-logger';

const logger = mmLogger(module);

/**
 * Checks if an instance bucket exists.
 *
 * @returns {boolean} return true if instance exists
 * @throws Will throw an error if it failed to connect to Couchbase instance.
 * @api private
 */
async function instanceExists() {
    logger.info(`    COUCHBASE INSTANCE: ${config.couchbase.endPoint}`);
    let data;

    try {
        data = await request.get({
            url: `http://${config.couchbase.endPoint}/pools/default/buckets`,
            auth: {
                user: config.couchbase.username,
                pass: config.couchbase.password
            },
            json: true
        });
    } catch(error) {
        logger.error(`   COUCHBASE INSTANCE: NOT FOUND`.red);
        throw error;
    }

    logger.info(`    COUCHBASE INSTANCE BUCKET: ${config.couchbase.bucket} CHECK IF PROVISIONED`);
    logger.info(`    COUCHBASE INSTANCE BUCKET COUNT: ${data.length} LISTED BELOW`);

    for (let i = 0; i < data.length; i++) {
        logger.info(`    COUCHBASE INSTANCE BUCKET: ${data[i].name}`);
        if (data[i].name == config.couchbase.bucket) {
            logger.info(`    COUCHBASE INSTANCE BUCKET: ${config.couchbase.bucket} ALREADY PROVISIONED, STOPPING`);
            return true;
        }
    }

    logger.info(`    COUCHBASE INSTANCE BUCKET: ${config.couchbase.bucket} NOT PROVISIONED, CONTINUING`);
    return false;
}

/**
 * Provision an admin.
 *
 * @throws Will throw an error if it failed to provision an admin.
 * @api private
 */
async function provisionAdmin() {
    logger.info(`      PROVISION ADMIN USER STARTED`);

    try {
        await request.post({
            url: `http://${config.couchbase.endPoint}/settings/web`,
            form: {
                username: config.couchbase.username,
                password: config.couchbase.password
            }
        });
    } catch(error) {
        logger.error(`     PROVISION ADMIN USER FAILED`.red);
        throw error;
    }

    logger.info(`      PROVISION ADMIN USER COMPLETED`);
}

/**
 * Provision a bucket.
 *
 * @throws Will throw an error if it failed to provision a bucket.
 * @api private
 */
async function provisionBucket() {
    logger.info(`      PROVISION BUCKET STARTED`);

    try {
        await request.post({
            url: `http://${config.couchbase.endPoint}/pools/default/buckets`,
            form: {
                authType: 'sasl',
                name: config.couchbase.bucket,
                flushEnabled: 1,
                bucketType: 'couchbase',
                ramQuotaMB: config.couchbase.bucketRamQuota
            },
            auth: {
                user: config.couchbase.username,
                pass: config.couchbase.password
            }
        });
    } catch(error) {
        logger.info(`      PROVISION BUCKET FAILED`.red);
        throw error;
    }

    logger.info(`      PROVISION BUCKET COMPLETED`);
}

/**
 * Setup and provision Couchbase.
 *
 * @api public
 */
async function setup() {
    logger.info(' ⇒ SETUP: INITIATED');

    try {
        const exists = await instanceExists();
        if(exists){
            logger.info(' ⇐ SETUP: DONE');
            logger.info(`LOGIN AT http://${config.couchbase.endPoint} TO SEE COUCHBASE WEB UI CONSOLE`);
            return;
        }
        await provisionAdmin();
        await provisionBucket();
    } catch(error) {
        logger.info(' ⇐ SETUP: FAILED');

        logger.error('====----===='.red);
        logger.error(`SETUP ERROR: ${error}`.red);
        logger.error('PLEASE CHECK config.js IS POINTING TO A VALID COUCHBASE INSTANCE'.red);
        logger.error('====----===='.red);
        process.exit(9);
    }

    logger.info(' ⇐ SETUP: DONE');
    logger.info(`LOGIN AT http://${config.server.host}:${config.server.port}`);
}

(() => setup())();
