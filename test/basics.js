require.config({
    paths : {
        'lib' : '../lib'
    }
});

require(['../FlowView'], function(FlowView) {

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

	test('startFlow', function() {
		var flow = new FlowView({
			initialState : 'State1',

			flowEvents : [
				{name:'One', from:'State1', to:'State2'}
			],

			onStart : function() {
				ok(true, true);
			}
		});

		// Make sure Start event only occurs once
		expect(1);

		flow.startFlow();
		flow.startFlow();
		flow.One();
		flow.startFlow();
	});
});