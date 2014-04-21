#pitstop.js

An express middleware for creating conditional groups of other middleware.

#Installation

NPM: `npm install pitstop`

##Usage

The following example will only run the session handling if a session cookie already exists on the request.

```js
var express = require('express');
var pitstop = require('pitstop');

var expressCookies = require('cookie-parser')();
var expressSession = require("express-session")({
    key: 'session'
});

var conditionalSession = pitstop()
    .condition(function (req, res, next) {
        if (req.cookies.session) {
            next();
        } else {
            next(false);
        }
    })
    .use(expressSession);


var app = express();

app.use(expressCookies);
app.use(conditionalSession);


```


##Running Unit Tests

From inside the repository root, run `npm install` to install the test dependencies.

Run `npm test` to execute the complete test suite.