require.config({
    paths : {
        'lib' : '../lib'
    }
});

require(['../FlowView'], function(FlowView) {
    var State1 = Backbone.View.extend({
        el : $('#state1').get(0),

        doNext : function() {
            var input = this.$el.find('input[name="name"]').val();
            
            if(input =='') {
                alert('Must not be empty');
            }
            else if(input.length < 3) {
                this.trigger('ShortName', input);
            }
            else {
                this.trigger('LongName', input);
            }
        },

        render : function() {
            this.$el.show();
        }
    });

    var State2 = Backbone.View.extend({
        el : $('#state2').get(0),

        render : function(content) {
            this.$el.find('.content').text(content);
            this.$el.show();
        }
    });

    var LogicFlowView = FlowView.extend({
        el : $('#flow').get(0),

        activeView : null,

        events : {
            'click .prev' : 'prev',
            'click .next' : 'next'
        },

        prev : function() {
            window.history.back();
        },

        next : function() {
            this.activeView.doNext();
        },

        name : 'MyFlow',

        initialState : 'InputName',

        flowEvents : [
            {name : 'ShortName', from : 'InputName', to : 'HasShortName'},
            {name : 'LongName', from : 'InputName', to : 'HasLongName'}
        ],

        onChangeState : function(event, from, to, isBrowserNavigating) {
            if(this.activeView) {
                this.activeView.undelegateEvents();
                this.activeView.$el.hide();
            }
        },

        onStart : function() {
            this.activeView = new State1();

            this.activeView.render();
        },

        onShortName : function(event, from, to, isBrowserNavigating, name) {
            this.activeView = new State2();

            this.activeView.render(name + ' is a short name');
        },

        onLongName : function(event, from, to, isBrowserNavigating, name) {
            this.activeView = new State2();

            this.activeView.render(name + ' is a long name');
        },

        getActiveView : function() {
            return this.activeView;
        }
    });

    var flow = new LogicFlowView();

    Backbone.history.start();

    flow.render();
});