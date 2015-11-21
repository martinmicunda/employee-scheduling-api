/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import mmLogger from 'mm-node-logger';
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';
import i18n from '../../../config/i18n';
import config from '../../../config/config';
import * as messageTemplate from './templates/message';
import * as activationTemplate from './templates/activation';
import * as passwordResetTemplate from './templates/passwod-reset';

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
        subject: `${config.email.projectName} ${i18n.__('EMAIL_ACCOUNT_ACTIVATION')}`,
        text: activationTemplate.text(doc, token),
        html: activationTemplate.html(doc, token)
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
        subject: `${config.email.projectName} ${i18n.__('EMAIL_PASSWORD_RESET')}`,
        text: passwordResetTemplate.text(doc, token),
        html: passwordResetTemplate.html(doc, token)
    };

    try {
        await client.sendMail(options);
        logger.info(`EMAIL PASSWORD RESET SENT TO ${doc.email}`);
    } catch(error) {
        logger.error(`EMAIL PASSWORD RESET NOT SENT TO ${doc.email}`, error.message);
        throw error;
    }
}

async function sendMessageEmail(doc) {
    const options = {
        from: config.email.support,
        to: doc.to,
        subject: doc.subject,
        text: messageTemplate.text(doc),
        html: messageTemplate.html(doc)
    };

    try {
        await client.sendMail(options);
        logger.info(`EMAIL MESSAGE SENT TO ${doc.to}`);
    } catch(error) {
        logger.error(`EMAIL MESSAGE NOT SENT TO ${doc.to}`, error.message);
        throw error;
    }
}

export {sendAccountActivationEmail, sendPasswordResetEmail, sendMessageEmail};
