var pitstop = require('../pitstop');

exports['empty pitstop continues normally'] = function (test) {
	
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['using non-middleware throws error'] = function (test) {
	
	var ps = pitstop();

	test.throws(function () {
		ps.use({});
	});

	test.done();

};

exports['single item pitstop without condition'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};

	test.expect(4);

	var middle1 = function (req, res, next) {
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 1 invoked');
		next();
	};

	ps.use(middle1);

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['two item pitstop, second item is single arg middleware'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};
	var order = 0;

	test.expect(7);

	var middle1 = function (req, res, next) {
		test.strictEqual(++order, 1);
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 1 invoked');
		next();
	};

	var middle2 = function (next) {
		test.strictEqual(++order, 2);
		test.ok(true, 'Middleware 2 invoked');
		next();
	};

	ps.use(middle1);
	ps.use(middle2);

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['two item pitstop, use with array'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};
	var order = 0;

	test.expect(9);

	var middle1 = function (req, res, next) {
		test.strictEqual(++order, 1);
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 1 invoked');
		next();
	};

	var middle2 = function (req, res, next) {
		test.strictEqual(++order, 2);
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 2 invoked');
		next();
	};

	ps.use([middle1, middle2]);

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['two item pitstop, second item is error handler, no error'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};
	var oerr = {error: true};
	var order = 0;

	test.expect(5);

	var middle1 = function (req, res, next) {
		test.strictEqual(++order, 1);
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 1 invoked');
		next();
	};

	var middle2 = function (err, req, res, next) {
		order++;
		test.ok(false, 'Middleware 2 invoked');
		next();
	};

	ps.use(middle1);
	ps.use(middle2);

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['two item pitstop, second item is error handler, with error'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};
	var oerr = {error: true};
	var order = 0;

	test.expect(10);

	var middle1 = function (req, res, next) {
		test.strictEqual(++order, 1);
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 1 invoked');
		next(oerr);
	};

	var middle2 = function (err, req, res, next) {
		test.strictEqual(++order, 2);
		test.deepEqual(err, oerr);
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 2 invoked');
		next();
	};

	ps.use(middle1);
	ps.use(middle2);

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['three item pitstop, third item is error handler, with error'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};
	var oerr = {error: true};
	var order = 0;

	test.expect(8);

	var middle1 = function (req, res, next) {
		test.strictEqual(++order, 1);
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 1 invoked');
		next(oerr);
	};

	var middle2 = function (req, res, next) {
		order++;
		test.ok(false, 'Middleware 2 invoked');
		next();
	};

	var middle3 = function (err, next) {
		test.strictEqual(++order, 2);
		test.deepEqual(err, oerr);
		test.ok(true, 'Middleware 3 invoked');
		next();
	};

	ps.use(middle1, middle2, middle3);

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['single item pitstop with truthy condition'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};

	test.expect(4);

	var middle1 = function (req, res, next) {
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 1 invoked');
		next();
	};

	ps.use(middle1);
	ps.condition(true);

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['single item pitstop with function condition, yielding empty'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};

	test.expect(7);

	var middle1 = function (req, res, next) {
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 1 invoked');
		next();
	};

	ps.use(middle1);
	ps.condition(function (req, res, next) {
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Condition invoked');
		next();
	});

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['single item pitstop with function condition, yielding true'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};

	test.expect(7);

	var middle1 = function (req, res, next) {
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Middleware 1 invoked');
		next();
	};

	ps.use(middle1);
	ps.condition(function (req, res, next) {
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Condition invoked');
		next(true);
	});

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};

exports['single item pitstop with function condition, yielding error'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};
	var oerr = {error: true};

	test.expect(4);

	var middle1 = function (req, res, next) {
		test.ok(false, 'Middleware 1 invoked');
		next();
	};

	ps.use(middle1);
	ps.condition(function (req, res, next) {
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Condition invoked');
		next(oerr);
	});

	ps(oreq, ores, function (err) {
		test.strictEqual(err, oerr);
		test.done();
	});
};

exports['single item pitstop with function condition, yielding false'] = function (test) {
	var ps = pitstop();
	var ores = {response: true};
	var oreq = {request: true};
	var oerr = {error: true};

	test.expect(4);

	var middle1 = function (req, res, next) {
		test.ok(false, 'Middleware 1 invoked');
		next();
	};

	ps.use(middle1);
	ps.condition(function (req, res, next) {
		test.deepEqual(req, oreq);
		test.deepEqual(res, ores);
		test.ok(true, 'Condition invoked');
		next(false);
	});

	ps(oreq, ores, function (err) {
		test.strictEqual(err, undefined);
		test.done();
	});
};