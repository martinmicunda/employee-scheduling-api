/**
 * An application config.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license	  GPL-3.0
 */
'use strict';

const config = Object.freeze({
    environment: process.env.NODE_ENV || 'development',

    // Upload files in memory
    uploadFilesInMemory: process.env.UPLOAD_FILES_IN_MEMORY || false,

    // Populate the DB with sample data
    seedDB: false,

    // Token settings
    token: {
        secret: process.env.TOKEN_SECRET || 'employee-scheduling',
        expiration: process.env.TOKEN_EXPIRATION || 60*60*24 // 24 hours
    },

    // Server settings
    server: {
        host: '0.0.0.0',
        port: process.env.NODE_PORT || process.env.PORT || 3000
    },

    // Couchbase settings
    couchbase: {
        hosts: process.env.COUCHBASE_URI || 'couchbase://127.0.0.1',
        n1qlService: process.env.COUCHBASE_N1QL_URI || 'localhost:8093',
        bucket: process.env.COUCHBASE_BUCKET || 'default',
        user: 'Administrator',
        password: process.env.COUCHBASE_PASSWORD || 'password',
        indexType: 'GSI',
        thresholdItemCount: 31565
    }
});

export default config;
