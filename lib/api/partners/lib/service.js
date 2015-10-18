/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import * as partnerDAO from './dao';

/**
 *
 * @param id
 * @returns {{data: {}, statusCode: number}} --- @return {GeneratorFunction}
 */
async function findByID(id) {
    //let respond = {data: {}, statusCode: 200};

    try {
        respond.data = await partnerDAO.findByID(id);
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

async function find() {
    let respond = {data: {}, statusCode: 200};

    try {
        respond.data = await partnerDAO.find();
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

async function insert(data) {
    let respond = {data: {}, statusCode: 201};

    try {
        respond.data = await partnerDAO.insert(data);
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

async function update(data) {
    let respond = {data: {}, statusCode: 200};

    try {
        respond.data = await partnerDAO.update(data);
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

async function remove(id) {
    let respond = {data: {}, statusCode: 204};

    try {
        await partnerDAO.remove(id);
    } catch(error) {
        respond.statusCode = error.statusCode;
    }

    return respond;
}

export {findByID, find, insert, update, remove};
