require.config({
    paths : {
        'lib' : '../lib'
    }
});

require(['../FlowView'], function(FlowView) {

	test('initialize', function() {
		expect(2);

		// sanity checks
		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'}
			],

			initializeStateMachine : function() {
				ok(true, 'call init FSM');
			},

			initializeRouter : function() {
				ok(true, 'call init router');
			}
		});
	});

	test('Router', function() {
		expect(6);
		
		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'}
			]
		});

		// Simple case
		flow.invokeEvent = function(eventName, isBrowserNavigating, args) {
			equal(eventName, 'One', 'eventName');
			equal(isBrowserNavigating, true, 'browser nav');
			deepEqual(args, ['v1', 'v2'], 'simple args');
		};

		flow.router.callbackArgs('One', 'State1', 'State2', '%5B%22v1%22%2C%22v2%22%5D');

		// Args with object case
		flow.invokeEvent = function(eventName, isBrowserNavigating, args) {
			equal(eventName, 'One', 'eventName');
			equal(isBrowserNavigating, true, 'browser nav');
			deepEqual(args, ['v1', {sp1:'sv1'}, 'v2'], 'simple args');
		};

		flow.router.callbackArgs('One', 'State1', 'State2', '%5B%22v1%22%2C%7B%22sp1%22%3A%22sv1%22%7D%2C%22v2%22%5D');
	});

	test('isRelevantEvent', function() {
		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'},
				{name:'Two', from:'*', to:'State3'},
				{name:'Thr', from:['State3','State4','State5'], to:'State4'},
				{name:'Four:Success', from:'State4', to:'State5'}
			]
		});

		// Before starting
		equal(
			flow.isRelevantEvent(flow.flowEvents[0]) &&
			flow.isRelevantEvent(flow.flowEvents[1]) &&
			flow.isRelevantEvent(flow.flowEvents[2]) &&
			flow.isRelevantEvent(flow.flowEvents[3]), 
			false);

		flow.render();

		// While in State1
		equal(flow.isRelevantEvent(flow.flowEvents[0]), true);
		equal(flow.isRelevantEvent(flow.flowEvents[1]), true);
		equal(flow.isRelevantEvent(flow.flowEvents[2]), false);
		equal(flow.isRelevantEvent(flow.flowEvents[3]), false);

		flow.setCurrentState('State2')

		// While in State2
		equal(flow.isRelevantEvent(flow.flowEvents[0]), false);
		equal(flow.isRelevantEvent(flow.flowEvents[1]), true);
		equal(flow.isRelevantEvent(flow.flowEvents[2]), false);
		equal(flow.isRelevantEvent(flow.flowEvents[3]), false);

		flow.setCurrentState('State3')

		// While in State3
		equal(flow.isRelevantEvent(flow.flowEvents[0]), false);
		equal(flow.isRelevantEvent(flow.flowEvents[1]), true);
		equal(flow.isRelevantEvent(flow.flowEvents[2]), true);
		equal(flow.isRelevantEvent(flow.flowEvents[3]), false);

		flow.setCurrentState('State4')

		// While in State4
		equal(flow.isRelevantEvent(flow.flowEvents[0]), false);
		equal(flow.isRelevantEvent(flow.flowEvents[1]), true);
		equal(flow.isRelevantEvent(flow.flowEvents[2]), true);
		equal(flow.isRelevantEvent(flow.flowEvents[3]), true);
	});

	test('invokeEvent', function() {
		expect(19);

		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'},
				{name:'Two', from:'State2', to:'State3'},
				{name:'Thr', from:'State3', to:'State4'},
				{name:'Four:Success', from:'State4', to:'State5'}
			],

			onOne : function(event, from, to, isBrowserNavigating) {
				ok(event === 'One', 'onOne event');
				ok(from === 'State1', 'onOne from');
				ok(to === 'State2', 'onOne to');
				ok(isBrowserNavigating === false, 'onOne isBrowserNavigating');
			},

			onTwo : function(event, from, to, isBrowserNavigating, p1, p2, p3) {
				ok(event === 'Two', 'onTwo event');
				ok(from === 'State2', 'onTwo from');
				ok(to === 'State3', 'onTwo to');
				ok(isBrowserNavigating === false, 'onTwo isBrowserNavigating');
				ok(p1 === 'v1', 'onTwo p1');
				ok(p2 === 'v2', 'onTwo p2');
				deepEqual(p3, {v3:'s3'}, 'onTwo p3');
			},

			onThr : function(event, from, to, isBrowserNavigating, p1, p2, p3) {
				ok(event === 'Thr', 'onThr event');
				ok(from === 'State3', 'onThr from');
				ok(to === 'State4', 'onThr to');
				ok(isBrowserNavigating === true, 'onThr isBrowserNavigating');
			},

			onFourSuccess : function(event, from, to, isBrowserNavigating) {
				ok(event === 'Four:Success', 'onFour event');
				ok(from === 'State4', 'onFour from');
				ok(to === 'State5', 'onFour to');
				ok(isBrowserNavigating === false, 'onFour isBrowserNavigating');
			}
		});

		flow.render();

		flow.invokeEvent('One', false);

		flow.invokeEvent('Two', false, ['v1', 'v2', {v3:'s3'}]);

		flow.invokeEvent('Thr', true);

		flow.invokeEvent('Four:Success', false);
	});

	test('createFlowRoute', function() {
		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'}
			]
		});

		var route = flow.createFlowRoute('evt', 'fr', 'to', []);

		equal(route, 'UnnamedFlow/evt/fr/to');

		var route2 = flow.createFlowRoute('evt2', 'fr2', 'to2', ['myarg']);

		equal(route2, 'UnnamedFlow/evt2/fr2/to2/%5B%22myarg%22%5D');
	});

	test('_onChangeStateInternal', function() {
		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'},
				{name:'Two', from:'State2', to:'State3'}
			]
		});

		// We expect only to call navigate if not browser navigating 
		// and from is not same as to.
		expect(2);

		flow.router.navigate = function(route) {
			equal(route, flow.createFlowRoute('evt', 'fr', 'to', []), 'navigate');
		}

		// This one should work
		flow._onChangeStateInternal('evt', 'fr', 'to', false);

		// This should not
		flow._onChangeStateInternal('evt', 'fr', 'to', true);

		// And this should not
		flow._onChangeStateInternal('evt', 'fr', 'fr', false);

		// Ensure we properly pass additional args
		flow.router.navigate = function(route) {
			equal(route, flow.createFlowRoute('evt', 'fr', 'to', ['myarg']), 'navigate with additional arg');
		}

		flow._onChangeStateInternal('evt', 'fr', 'to', false, 'myarg');
	});

	test('_onEnd', function() {
		var testEventName = null;
		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'},
				{name:'Two', from:'State2', to:'State3'},
				{name:'Multi', from:['State2','State3'], to:'State4'},
				{name:'End', from:'State4', to:'State5'}
			]
		});

		// We verify by checking the Backbone.Events _callbacks object keys.
		// The expectation is that only relevant event names will show up in the keys.
		// This means the old ones were removed and the new ones were added.
		var _onEnd = flow._onEnd;
		flow._onEnd = function() {
			_onEnd.apply(flow, arguments);

			deepEqual(_.keys(flow._callbacks), testEventName, testEventName);
		};

		testEventName = ['One'];
		flow.render();
		
		testEventName = ['Two','Multi'];
		flow.__One__();

		testEventName = ['Multi'];
		flow.__Two__();

		// Check that nothing happens when we try a bad transition
		testEventName = ['Multi'];
		try {
			flow.__One__();
		}
		catch(e) {}

		testEventName = ['End'];
		flow.__Multi__();

		testEventName = [];
		flow.__End__();

		// Custom getActiveView() methods may not always return a view
		flow.getActiveView = function() {
			return null;
		};

		_onEnd.call(flow, 'a', 'b');
		ok(true, 'Passed null view test');
	});

	test('_onEnd with wildcard', function() {
		var testEventName = null;
		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'},
				{name:'Two', from:'*', to:'State3'},
				{name:'Multi', from:['State2','State3'], to:'State4'},
				{name:'End', from:'State4', to:'State5'}
			]
		});

		// We verify by checking the Backbone.Events _callbacks object keys.
		// The expectation is that only relevant event names will show up in the keys.
		// This means the old ones were removed and the new ones were added.
		var _onEnd = flow._onEnd;
		flow._onEnd = function() {
			_onEnd.apply(flow, arguments);

			deepEqual(_.keys(flow._callbacks), testEventName, testEventName);
		};

		testEventName = ['One','Two'];
		flow.render();
		
		testEventName = ['Two','Multi'];
		flow.__One__();

		testEventName = ['Two','Multi'];
		flow.__Two__();

		// Check that nothing happens when we try a bad transition
		testEventName = ['Two','Multi'];
		try {
			flow.__One__();
		}
		catch(e) {}

		testEventName = ['Two','End'];
		flow.__Multi__();

		testEventName = ['Two'];
		flow.__End__();

		// Custom getActiveView() methods may not always return a view
		flow.getActiveView = function() {
			return null;
		};

		_onEnd.call(flow, 'a', 'b');
		ok(true, 'Passed null view test');
	});

	test('startFlow', function() {
		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'}
			],

			onStart : function() {
				ok(true, 'started');
			}
		});

		// Make sure Start event only occurs once
		expect(1);

		flow.startFlow();
		flow.startFlow();
		flow.__One__();
		flow.startFlow();
	});
});