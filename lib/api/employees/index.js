/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var koa    = require('koa');
var router = require('koa-joi-router');

var employeeValidator  = require('./lib/validator');
//var employeeController = require('./controller');

var app = koa();
var api = router();

const routes = [
    {
        method: 'GET',
        path: '/employees/:id',
        validate: employeeValidator.findByID,
        //handler: [ yourMiddleware, yourHandler ],
        handler: function *(){
            this.body = 'hello  GET/id ';
        }
    },
    {
        method: 'GET',
        path: '/employees',
        //validate : employeeValidator.find,
        //handler: employeeController.find
        handler: function *(){
            this.body = 'hello joi-router!';
        }
    }
];


for(let route of routes) {
    api.route(route);
}
app.use(api.middleware());

//module.exports = routes;
module.exports = app;
