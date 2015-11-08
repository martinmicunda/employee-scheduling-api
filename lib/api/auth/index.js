/**
 * The `partners` API module that provides functionality to create, read, update and delete partner.
 *
 * @module partners
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import koa from 'koa';
import jwt from 'koa-jwt';
import router from 'koa-joi-router';
import config from '../../config/config';
import validator from './lib/validator';
import * as service from '../employees/lib/service';

const app = koa();
const api = router();

const routes = [
    {
        method: 'POST',
        path: '/login',
        validate: validator.login,
        handler: function *() {
            const profile = yield service.authenticate(this.request.body.email, this.request.body.password);
            /**
             * Token is divided in 3 parts:
             *  - header
             *  - payload (It contains some additional information that
             *  we can pass with token e.g. {user: 2, admin: true}. This
             *  gets encoded into base64.)
             *  - signature
             *
             * Token is something like xxxxxxxxxxx.yyyy.zzzzzzzzzzzz. Where the x is
             * the encoded header, the y is the encoded payload and
             * the z is the signature. So on front-end we can decode
             * the yyyy part (the payload) if we need.
             */
            const token = jwt.sign(profile, config.token.secret, { expiresInMinutes: config.token.expiration });

            // TODO: store only id in token and add additional information role, name, avatar into respond and front end should store this details into localcelstorage
            this.body = {token: token};
        }
    },
    {
        method: 'GET',
        path: '/logout',
        validate : {},
        handler: function *() {
            delete this.state.user;
            this.status = 204;
        }
    }
];

api.prefix('/api/auth');
api.route(routes);
app.use(api.middleware());

export default app;

// https://sendgrid.com/blog/json-web-tokens-koa-js/
// !! https://github.com/NikolayGalkin/koa-boilerplate/blob/a0fee9c92ec61a142f0bb083083aabe0d1db0c26/app%2Fcontrollers%2Fauth.js
// https://auth0.com/blog/2015/03/31/critical-vulnerabilities-in-json-web-token-libraries/

// https://stormpath.com/blog/password-security-right-way/
// https://medium.com/@poeticninja/authentication-and-authorization-with-hapi-5529b5ecc8ec
// http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
// https://stormpath.com/blog/the-pain-of-password-reset/
