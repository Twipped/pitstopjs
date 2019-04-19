# pitstop.js DEPRECATED

An express middleware for creating conditional groups of other middleware.

**This repository is no longer maintained and the library has been deprecated**

In modern express development this can be accomplished by putting your conditional middleware into an Express Router and only invoking that router for your condition, like so:

```js
app.use((req, res, next) => {
  if (someCondition) {
    return myRouter(req, res, next);
  }
  next();
}
```

## Installation

NPM: `npm install pitstop`

## Usage

### `pitstop([crew, [conditionFunction]])`

Creates the pitstop.  The initial middleware crew and run condition can be passed directly as arguments.  Returns the `pit` middleware function object.

### `pit.use(middleware)`

Adds a middleware to the pit crew.  Middleware can be added individually, as multiple arguments, or in an array.

```js
pit.use(morgan());
pit.use(cookieParser(), bodyParser());
pit.use([
	csrf(), errorHandler()
]);
```

Error handlers added to the pit will only catch errors that occur within the pit.  If no error handler is defined, errors will bubble up to Express.

### `pit.condition(null|function|truthy)`

Defines the condition for if the pit crew should run.  If the passed value is `undefined`, `null` or a truthy value, the crew will always run. If the passed value is false, the pit will be bypassed.

If a function is provided, the function will be executed as a middleware and receive the request, response and callback arguments.  Calling the callback with false or an error will bypass the pit. Calling without any value run the pit crew.

### `pit.execute`

`pit.execute` is a bypass middleware which will skip the condition and always run the pit crew.

## Example

The following example will only run session handling and user loading if a session cookie already exists on the request. Said cookie will only be created when the user logs into the site.

```js
var express = require('express');
var pitstop = require('pitstop');
var passport = require('passport');
var flash = require('connect-flash');

var expressCookies = require('cookie-parser');
var expressSession = require("express-session");

// Note, some passport setup code has been omitted, as it is not relevant to the example.

var userSession = pitstop();
    .condition(function (req, res, next) {
        if (req.cookies.session) {
            next();
        } else {
            next(false);
        }
    })
    .use(expressSession({
	    key: 'session'
	}))
    .use(flash())
    .use(passport.initialize())
    .use(passport.session())
    .use(function (req, res, next) {
    	if (req.isAuthenticated()) {
    		res.locals.user = req.user;
    	}
    	next();
    });


var app = express();

app.use(expressCookies);
app.use(userSession);

app.post('/login', userSession.execute, function (req, res) {
	// This route will always create/load a session.

	passport.authenticate('local', {
		successRedirect: req.session && req.session.goingTo || '/profile',
		failureRedirect: "/login",
		failureFlash: true
	})(req, res);
});

app.get('/', function (req, res) {
	// This route will only load a session if a session cookie exists,
	// which was created when they logged in.
});

```
