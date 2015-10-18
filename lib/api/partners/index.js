/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import koa from 'koa';
import router from 'koa-joi-router';
import validator from './lib/validator';
import * as service from './lib/service';
import * as partnerDAO from './lib/dao';

const app = koa();
const api = router();

const routes = [
    {
        method: 'GET',
        path: '/partners/:id',
        validate: validator.findByID,
        handler: function *() {
            try {
                this.body = yield partnerDAO.findByID(this.params.id);
            } catch(error) {
                this.body = error;
                this.status = error.status;
            }
        }
    },
    {
        method: 'GET',
        path: '/partners',
        validate : service.find,
        handler: function *() {
            try {
                this.body = yield partnerDAO.find();
            } catch(error) {
                this.body = error;
                this.status = error.status;
            }
        }
    },
    {
        method: 'POST',
        path: '/partners',
        validate: validator.insert,
        handler: function *() {
            try {
                this.body = yield partnerDAO.insert(this.request.body);
                this.status = 201;
            } catch(error) {
                this.body = error;
                this.status = error.status;
            }
        }
    },
    {
        method: 'PUT',
        path: '/partners',
        validate: validator.update,
        handler: function *() {
            try {
                this.body = yield partnerDAO.update(this.request.body);
            } catch(error) {
                this.body = error;
                this.status = error.status;
            }
        }
    },
    {
        method: 'DELETE',
        path: '/partners/:id',
        //validate: validator.remove,
        handler: function *() {
            try {
                this.body = yield partnerDAO.remove(this.params.id);
                this.status = 204;
            } catch(error) {
                this.body = error;
                this.status = error.status;
            }
        }
    }
];

for(let route of routes) {
    api.route(route);
}
app.use(api.middleware());

export default app;
// !!!https://nemisj.com/using-generators-for-node-js-style-callbacks/

// !!! READ this article https://programmaticponderings.wordpress.com/2015/05/18/building-a-microservices-based-rest-api-with-restexpress-java-and-mongodb-part-1/


// !!! API DOC https://github.com/cliftonc/seguir/blob/master/server%2Findex.js !!!!!
