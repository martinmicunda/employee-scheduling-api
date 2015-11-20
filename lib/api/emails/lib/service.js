/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import mmLogger from 'mm-node-logger';
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';
import config from '../../../config/config';
import activationTemplate from './templates/activation';
import passwordResetTemplate from './templates/passwod-reset';

const logger = mmLogger(module);
const client = nodemailer.createTransport(sgTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

async function sendAccountActivationEmail(doc, token) {
    const options = {
        from: config.email.support,
        to: doc.email,
        subject: `${config.email.projectName} Account Activation`,
        html: activationTemplate(doc, token)
    };

    try {
        await client.sendMail(options);
        logger.info(`EMAIL ACCOUNT ACTIVATION SENT TO ${doc.email}`);
    } catch(error) {
        logger.error(`EMAIL ACCOUNT ACTIVATION NOT SENT TO ${doc.email}`, error.message);
        throw error;
    }
}

async function sendPasswordResetEmail(doc, token) {
    const options = {
        from: config.email.support,
        to: doc.email,
        subject: `${config.email.projectName} Password Reset`,
        html: passwordResetTemplate(doc, token)
    };

    try {
        await client.sendMail(options);
        logger.info(`EMAIL PASSWORD RESET SENT TO ${doc.email}`);
    } catch(error) {
        logger.error(`EMAIL PASSWORD RESET NOT SENT TO ${doc.email}`, error.message);
        throw error;
    }
}

export {sendAccountActivationEmail, sendPasswordResetEmail};
