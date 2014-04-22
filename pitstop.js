/*
 * pitstop, conditional middleware grouping for express.js
 * http://github.com/chipersoft/pitstopjs
 *
 * Copyright (c) 2014, Jarvis Badgley
 * Released under an MIT license.
 */

module.exports = function pitstop (middlewares, precondition) {
	var stack = [];
	var condition;

	var pit = function (req, res, finished) {
		var step = -1, len = stack.length;

		// Create the iterator that will traverse the stack
		function next (err) {
			step++;

			// We've reached the end of the stack and can exit to express.
			if (step >= len) {
				return finished(err);
			}

			var fn = stack[step];

			if (err) {
				switch (fn.length) {
				case 4:
					return fn(err, req, res, next);
				case 2:
					return fn(err, next);
				default:
					// Current step is not an error handler, continue to next step
					return next(err);
				}
			} else {
				switch (fn.length) {
				case 3:
					return fn(req, res, next);
				case 1:
					return fn(next);
				default:
					// Current step is an error handler or non-middleware, continue to next step
					return next();
				}
			}
		}

		// If condition is not set, assume there is no condition and stack should run.
		// If condition is a function, run that function as a middleware function.
			// If the function yields true or nothing, run the stack.
			// If the function yields a non-false, exit the stack with the value returned.
		// If the function is not a function but is truthy, run the stack.
		if (condition === undefined || condition === null) {
			next();
		} else if (typeof condition === 'function') {
			condition(req, res, function (err) {
				if (err === false) {
					finished();
				} else if (err && err !== true) {
					finished(err);
				} else {
					next();
				}
			});
		} else if (condition) {
			next();
		}
	};

	pit.use = function use (middleware) {
		var i,c,arg;
		for (i = 0, c = arguments.length; i<c; i++) {
			arg = arguments[i];

			if (!arg) {continue;}
			
			if (Array.isArray(arg)) {
				use.apply(this, arg);
				continue;
			}

			if (typeof arg === 'function') {
				stack.push(arg);
				continue;
			}

			throw new TypeError('Argument was not a middleware function.');
		}

		return this;
	};

	pit.condition = function (fn) {
		condition = fn;
		return this;
	};

	pit.execute = function (req, res, next) {
		// Save the current condition and make the condition truthy.
		var prevCondition = condition;
		condition = true;

		// Run the stack.
		pit.apply(this, arguments);
		
		// Change condition back.
		condition = prevCondition;
	};

	// Load any default values defined on the constructor
	pit.use(middlewares);
	pit.condition(precondition);

	return pit;
};