require.config({
    paths : {
        'lib' : '../lib'
    }
});

require(['../FlowView'], function(FlowView) {
    // Create the simple flow object.
    var flow = new FlowView({
        el : $('#state').get(0),

        events : {
            'click #prev' : 'prev',
            'click #next' : 'next'
        },

        prev : function() {
            window.history.back();
        },

        next : function() {
            console.log('next');
            this.trigger('next');
        },

        update : function(state) {
            this.$el.children('#content').text(state);
        },

        name : 'MyFlow',

        initialState : 'State1',

        flowEvents : [
            {name : 'next', from : 'State1', to : 'State2'},
            {name : 'next', from : 'State2', to : 'State3'},
            {name : 'next', from : 'State3', to : 'State4'},
            {name : 'next', from : 'State4'}
        ],

        onEnterState1 : function(event, from, to) {
            console.log('Entered state1');
            this.update(to);
        },

        onEnterState2 : function(event, from, to) {
            console.log('Entered state2');
            this.update(to);
        },

        onEnterState3 : function(event, from, to) {
            console.log('Entered state3');
            this.update(to);
        },

        onEnterState4 : function(event, from, to) {
            console.log('Entered state4');
            this.update(to);
        }
    });

    Backbone.history.start();

    flow.render();
});