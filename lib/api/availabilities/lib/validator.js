/**
 * The input and output validator for availability API.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import availabilitySchema from './schema';

const availabilityValidator = {
    find: {
        query: {
            start: availabilitySchema.date,
            end: availabilitySchema.date,
            employeeId: availabilitySchema.employeeId
        }
    },
    insert: {
        body: {
            start: availabilitySchema.date,
            end: availabilitySchema.date,
            employeeId: availabilitySchema.employeeId,
            availability: availabilitySchema.availability,
            note: availabilitySchema.note
        },
        type: 'cjson'
    }
};

export default availabilityValidator;
