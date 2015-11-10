/**
 * An application config.
 *
 * @module config
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license	  GPL-3.0
 */
'use strict';

// https://forums.couchbase.com/t/error-cannot-perform-operations-on-a-shutdown-bucket-when-calling-remote-server/4820/13
const isLinux = !(/^win/.test(process.platform) || /^darwin/.test(process.platform));

const config = Object.freeze({
    environment: process.env.NODE_ENV || 'development',

    // Token settings
    token: {
        secret: process.env.TOKEN_SECRET || 'employee-scheduling',
        expiration: process.env.TOKEN_EXPIRATION || 60*60*24 // 24 hours
    },

    // Server settings
    server: {
        host: process.env.NODE_HOST  || 'localhost',
        port: process.env.NODE_PORT || process.env.PORT || 3000
    },

    // Couchbase settings
    couchbase: {
        host: process.env.COUCHBASE_HOST || 'localhost',
        port: process.env.COUCHBASE_PORT || '8091',
        seedGlob: process.env.COUCHBASE_SEED_GLOB || '../**/fixtures/**/*.js',
        bucketRamQuota: process.env.COUCHBASE_BUCKET_RAM_QUOTA || 100,
        endPoint: isLinux ? 'couchbase://localhost' : `${process.env.COUCHBASE_HOST || 'localhost'}:${process.env.COUCHBASE_PORT || '8091'}`,
        n1qlService: `${process.env.COUCHBASE_HOST || 'localhost'}:${process.env.COUCHBASE_N1QL_PORT || '8093'}`,
        bucket: process.env.COUCHBASE_BUCKET || 'employee-scheduling',
        username: process.env.COUCHBASE_USERNAME || 'Administrator',
        password: process.env.COUCHBASE_PASSWORD || 'password',
        checkInterval: process.env.COUCHBASE_CHECK_INTERVAL || 3000,
        thresholdItemCount: 31565, // How much many items should be in the bucket,
        indexMemQuota: 1024,
        dataMemQuota: 512
    }
});

export default config;
