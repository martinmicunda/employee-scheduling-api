/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var partnerDAO = require('./dao');

/**
 *
 * @param id
 * @returns {{data: {}, statusCode: number}} --- @return {GeneratorFunction}
 */
function *findByID(id) {
    let respond = {data: {}, statusCode: 200};

    try {
        respond.data = yield partnerDAO.findByID(id);
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

function *find() {
    let respond = {data: {}, statusCode: 200};

    try {
        respond.data = yield partnerDAO.find();
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

function *insert(data) {
    let respond = {data: {}, statusCode: 201};

    try {
        respond.data = yield partnerDAO.insert(data);
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

function *update(data) {
    let respond = {data: {}, statusCode: 200};

    try {
        respond.data = yield partnerDAO.update(data);
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

function *remove(id) {
    let respond = {data: {}, statusCode: 204};

    try {
        yield partnerDAO.remove(id);
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

module.exports = {findByID, find, insert, update, remove};
