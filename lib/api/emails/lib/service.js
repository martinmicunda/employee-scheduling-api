/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import moment from 'moment';
import mmLogger from 'mm-node-logger';
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';
import activationTemplate from './templates/activation';

const logger = mmLogger(module);
const client = nodemailer.createTransport(sgTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

async function sendActivationAccountEmail(doc = {}) {
    doc.email = 'c_mmicunda@groupon.com';
    doc.firstName = 'Martin';
    doc.lastName = 'Micunda';
    doc.avatar = 'Micunda';

    const email = {
        from: 'support@e-scheduling.com',
        to: doc.email,
        subject: 'Employee Scheduling Account Activation',
        html: activationTemplate(doc)
    };

    try {
        await client.sendMail(email);
    } catch(error) {
        logger.error(`EMAIL activate account - ${doc.email} -`, error);
    }
}

export {sendActivationAccountEmail};
