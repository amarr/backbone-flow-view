require(['FlowView'], function(FlowView) {
    var ScreenView = Backbone.View.extend({
        events : {
            'click #prev' : 'prev',
            'click #next' : 'next'
        },

        prev : function() {
            window.history.back();
        },

        next : function() {
            this.trigger('next');
        },

        update : function(state) {
            this.$el.children('#content').text(state);
        }
    });

    var screen = new ScreenView({
        el : $('#state').get(0)
    });

    var flow = new FlowView({
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
        },

        onEnterState2 : function(event, from, to) {
            console.log('Entered state2');
        },

        onEnterState3 : function(event, from, to) {
            console.log('Entered state3');
        },

        onEnterState4 : function(event, from, to) {
            console.log('Entered state4');
        },

        doStateChange : function(event, from, to, isBrowserNavigating) {
            screen.update(to);
            this.onStateChangeSuccess(to, screen);
        }
    });

    Backbone.history.start();

    flow.startFlow();
});