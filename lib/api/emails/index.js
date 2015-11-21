/**
 * The `emails` API module that provides functionality to send emails.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import koa from 'koa';
import router from 'koa-joi-router';
import validator from './lib/validator';
import * as service from './lib/service';

const app = koa();
const api = router();

const routes = [
    {
        method: 'POST',
        path: '/',
        validate: validator.insert,
        handler: function *() {
            this.body = yield service.sendMessageEmail(this.request.body);
        }
    }
];

api.prefix('/api/emails');
api.route(routes);
app.use(api.middleware());

export default app;
