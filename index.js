require(['FlowView'], function(FlowView) {
    var flow = new FlowView({
        name : 'MyFlow',
        initialState : 'State1',
        flowEvents : [
            {name : 'State1Success', from : 'State1', to : 'State2'},
            {name : 'State2Success', from : 'State2', to : 'State3'},
            {name : 'State3Success', from : 'State3', to : 'State4'},
            {name : 'State4Success', from : 'State4'}
        ],
        onEnterState1 : function(event, from, to) {
            console.log('Entered state1');
            _.delay(function(that) {
                that.trigger('State1Success');
            }, 1500, this);
        },
        onEnterState2 : function(event, from, to) {
            console.log('Entered state2');
            //_.delay(function(that) {
                //this.trigger('State2Success');
            //}, 1500, this);
        }
    });

    Backbone.history.start();

    flow.startFlow();
});