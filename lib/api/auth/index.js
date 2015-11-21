/**
 * The `auth` API module that provides functionality to login, logout and reset password.
 *
 * @module partners
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import koa from 'koa';
import router from 'koa-joi-router';
import config from '../../config/config';
import validator from './lib/validator';
import * as service from './lib/service';

const app = koa();
const api = router();

const routes = [
    {
        method: 'POST',
        path: '/login',
        validate: validator.login,
        handler: function *() {
            const credentials = JSON.parse(new Buffer(this.request.body.credentials, 'base64').toString('binary'));
            const res = validator.credentials.validate(credentials);
            if(res.error) {
                throw res.error;
            }

            this.body = yield service.authenticate(credentials.email, credentials.password);
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
    },
    {
        method: 'POST',
        path: '/forgot',
        validate : validator.forgot,
        handler: function *() {
            this.body = yield service.forgot(this.request.body.email);
            this.status = 200;
        }
    },
    {
        method: 'POST',
        path: '/password/:token',
        validate : validator.login,
        handler: function *() {
            const credentials = JSON.parse(new Buffer(this.request.body.credentials, 'base64').toString('binary'));
            const res = validator.passwordReset.validate(credentials);
            if(res.error) {
                throw res.error;
            }

            this.body = yield service.reset(credentials.password, this.params.token);
            this.status = 200;
        }
    },
    {
        method: 'PUT',
        path: '/password/:userId',
        validate : validator.login,
        handler: function *() {
            const credentials = JSON.parse(new Buffer(this.request.body.credentials, 'base64').toString('binary'));
            const res = validator.passwordUpdate.validate(credentials);
            if(res.error) {
                throw res.error;
            }

            this.body = yield service.update(credentials, this.params.userId);
            this.status = 200;
        }
    }
];

api.prefix('/api/auth');
api.route(routes);
app.use(api.middleware());

export default app;

// !! https://github.com/NikolayGalkin/koa-boilerplate/blob/a0fee9c92ec61a142f0bb083083aabe0d1db0c26/app%2Fcontrollers%2Fauth.js
// https://auth0.com/blog/2015/03/31/critical-vulnerabilities-in-json-web-token-libraries/
// https://stormpath.com/blog/password-security-right-way/
// https://medium.com/@poeticninja/authentication-and-authorization-with-hapi-5529b5ecc8ec
