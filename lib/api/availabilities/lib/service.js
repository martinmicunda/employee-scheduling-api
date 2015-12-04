/**
 * AvailabilityService module mediate the communication between requests and data manipulation.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import moment from 'moment';
import * as dao from './dao';

async function createOrReplace(doc) {
    let date, id;
    const dateRangeLength = moment(doc.end).diff(moment(doc.start), 'days');
    const startDate = moment(doc.start); // make `availability.start` object immutable for add function
    const employeeId = doc.employeeId;

    // delete `start` and `end` date as it should not exist in the db
    delete doc.end;
    delete doc.start;
    delete doc.employeeId;

    for(let i = 0; i < dateRangeLength; i++) {
        // moment(startDate) makes `this.availability.start` object immutable for add function
        date = i ? moment(startDate).add(i, 'day').format('YYYYMMDD') : startDate.format('YYYYMMDD');
        id = `${employeeId}::${date}`;

        await dao.insert(doc, id);
    }
}

export {createOrReplace};
