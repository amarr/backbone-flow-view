require.config({
    paths : {
        'lib' : '../lib'
    }
});

require(['../FlowView'], function(FlowView) {
    // The external view
    var OneView = Backbone.View.extend({
        el : $('#state').get(0),

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

        render : function(state) {
            this.$el.children('#content').text(state);
        }
    });

    var oneview = new OneView();

    // Create the simple flow object.
    var flow = new FlowView({

        name : 'MyFlow',

        initialState : 'State1',

        flowEvents : [
            {name : 'next', from : 'State1', to : 'State2'},
            {name : 'next', from : 'State2', to : 'State3'},
            {name : 'next', from : 'State3', to : 'State4'},
            {name : 'next', from : 'State4'}
        ],

        onChangeState : function(event, from, to, isBrowserNavigating) {
            oneview.render(to);

        },

        getActiveView : function() {
            return oneview;
        }
    });

    Backbone.history.start();

    flow.render();
});