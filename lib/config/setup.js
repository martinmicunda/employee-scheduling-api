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
import db from './couchbase';

const logger = mmLogger(module);

/**
 * Checks if an instance bucket exists.
 *
 * @returns {boolean} return true if instance exists
 * @throws Will throw an error if it failed to connect to Couchbase instance.
 * @api private
 */
async function instanceExists() {
    logger.info(`    COUCHBASE INSTANCE: ${config.couchbase.host}:${config.couchbase.port}`);
    let data;

    try {
        data = await request.get({
            url: `http://${config.couchbase.host}:${config.couchbase.port}/pools/default/buckets`,
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
 * Provision a services with `kv,n1ql,index`.
 *
 * @throws Will throw an error if it failed to provision an services.
 * @api private
 */
async function provisionServices() {
    logger.info(`      PROVISION SERVICES STARTED`);

    try {
        await request.post({
            url: `http://${config.couchbase.host}:${config.couchbase.port}/node/controller/setupServices`,
            form: {
                services: 'kv,n1ql,index'
            }
        });
    } catch(error) {
        logger.info(`      PROVISION SERVICES FAILED`.red);
        throw error;
    }

    logger.info(`      PROVISION SERVICES COMPLETED`);
}

/**
 * Provision a couchbase memory.
 *
 * @throws Will throw an error if it failed to provision a couchbase memory.
 * @api private
 */
async function provisionMemory() {
    logger.info(`      PROVISION MEMORY STARTED`);

    try {
        await request.post({
            url: `http://${config.couchbase.host}:${config.couchbase.port}/pools/default`,
            form: {
                indexMemoryQuota: config.couchbase.indexMemQuota,
                memoryQuota: config.couchbase.dataMemQuota
            }
        });
    } catch(error) {
        logger.info(`      PROVISION MEMORY FAILED`.red);
        throw error;
    }

    logger.info(`      PROVISION MEMORY COMPLETED`);
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
            url: `http://${config.couchbase.host}:${config.couchbase.port}/settings/web`,
            form: {
                username: config.couchbase.username,
                password: config.couchbase.password,
                port: config.couchbase.port
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
            url: `http://${config.couchbase.host}:${config.couchbase.port}/pools/default/buckets`,
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
 * Check if index service is ready.
 *
 * @throws Will throw an error if index service is not ready.
 * @api private
 */
async function isAvailable(tryCount = 0) {
    logger.info(`        CHECKING IF INDEX SERVICE READY:ATTEMPT ${++tryCount}`);

    try {
        await request.get({
            url: `http://${config.couchbase.n1qlService}/query?statement=SELECT+name+FROM+system%3Akeyspaces`,
            auth: {
                user: config.couchbase.username,
                pass: config.couchbase.password
            },
            json: true
        });

        return true;
    } catch(error) {
        if(tryCount === 4) {
            logger.error(`       CHECKING IF INDEX SERVICE FAILED`.red);
            throw error;
        }

        return new Promise(resolve => setTimeout(resolve, config.couchbase.checkInterval)).then(() => isAvailable(tryCount));
    }
}

/**
 * Build an indexes.
 *
 * @throws Will throw an error if it failed to build an indexes.
 * @api private
 */
async function buildIndexes() {
    logger.info(`      CREATE PRIMARY INDEX STARTED`);
    const query = db.N1qlQuery.fromString(`CREATE PRIMARY INDEX ON \`${config.couchbase.bucket}\` USING GSI;`);

    try {
        await request.post({
            url: `http://${config.couchbase.n1qlService}/query/service?statement=CREATE PRIMARY INDEX ON \`${config.couchbase.bucket}\` USING GSI`,
            auth: {
                user: config.couchbase.username,
                pass: config.couchbase.password
            }
        });
    } catch(error) {
        logger.info(`      CREATE PRIMARY INDEX FAILED`.red);
        throw error;
    }

    logger.info(`      CREATE PRIMARY INDEX COMPLETED`);
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
            logger.info(`LOGIN AT http://${config.couchbase.host}:${config.couchbase.port} TO SEE COUCHBASE WEB UI CONSOLE`);
            return;
        }
        await provisionServices();
        await provisionMemory();
        await provisionAdmin();
        await provisionBucket();
        if(await isAvailable()) {
            await buildIndexes();
        }
    } catch(error) {
        logger.info(' ⇐ SETUP: FAILED');

        logger.error('====----===='.red);
        logger.error(`SETUP ERROR: ${error}`.red);
        logger.error('PLEASE CHECK config.js IS POINTING TO A VALID COUCHBASE INSTANCE'.red);
        logger.error('====----===='.red);
        process.exit(9);
    }

    logger.info(' ⇐ SETUP: DONE');
    logger.info(`LOGIN AT http://${config.couchbase.host}:${config.couchbase.port}`);
}

(() => setup())();
