/**
 * The `availabilities` API module that provides functionality to create, update and read availabilities.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import koa from 'koa';
import router from 'koa-joi-router';
import validator from './lib/validator';
import * as dao from './lib/dao';
import * as service from './lib/service';

const app = koa();
const api = router();

const routes = [
    {
        method: 'GET',
        path: '/',
        validate : {}, // validator.find FIXME: waiting till this pull request is merged https://github.com/pebble/koa-joi-router/pull/9
        handler: function *() {
            this.body = yield dao.find(this.request.query.start, this.request.query.end, this.request.query.employeeId);
        }
    },
    {
        method: 'POST',
        path: '/',
        validate: validator.insert,
        handler: function *() {
            yield service.createOrReplace(this.request.body);
            this.status = 204;
        }
    }
];

api.prefix('/api/availabilities');
api.route(routes);
app.use(api.middleware());

export default app;

