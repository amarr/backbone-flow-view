require.config({
    paths : {
        'lib' : '../lib'
    }
});

require(['../FlowView'], function(FlowView) {
    var FirstNameScreen = Backbone.View.extend({
        el : $('#firstNameScreen').get(0),

        doNext : function() {
            var input = this.$el.find('input[name="name"]').val();
            
            if(input =='') {
                alert('Must not be empty');
            }
            else if(input.length <= 3) {
                this.model.set('firstName', input);
                this.trigger('ShortFirstName');
            }
            else {
                this.model.set('firstName', input);
                this.trigger('LongFirstName');
            }
        },

        render : function() {
            this.$el.show();
            this.$el.find('input[name="name"]').focus();
        }
    });

    var LastNameScreen = Backbone.View.extend({
        el : $('#lastNameScreen').get(0),

        doNext : function() {
            var input = this.$el.find('input[name="name"]').val();
            
            if(input =='') {
                alert('Must not be empty');
            }
            else {
                this.model.set('lastName', input);
                this.trigger('AnyLastName');
            }
        },

        render : function(content) {
            this.$el.find('.content').text(this.model.get('firstName') + content);
            this.$el.show();
            this.$el.find('input[name="name"]').focus();
        }
    });

    var HomeOwnerScreen = Backbone.View.extend({
        el : $('#homeOwnerScreen').get(0),

        initialize : function() {
            var that = this;
            $(document).keypress(function(e) {
                that.keypress.call(that, e);
            });
        },

        events : {
            'click button[name="yes"]' : 'yes',
            'click button[name="no"]' : 'no'
        },

        yes : function(e) {
            e.preventDefault();
        },

        no : function(e) {
            e.preventDefault();
        },

        keypress : function(e) {
            if(e.which == 121) {
                this.$el.find('button[name="yes"]').click();
            }
            else if(e.which == 110) {
                this.$el.find('button[name="no"]').click();
            }
        },

        render : function() {
            this.$el.show();
        }
    });

    var PersonalSummaryScreen = Backbone.View.extend({
        el : $('#personalSummaryScreen').get(0),

        render : function() {
            this.$el.find('.firstName').text(this.model.get('firstName'));
            this.$el.find('.lastName').text(this.model.get('lastName'));
            this.$el.show();
        }
    });

    var InterviewFlowView = FlowView.extend({
        el : $('#flow').get(0),

        activeView : null,

        events : {
            'click .previous a' : 'prev',
            'click .next a' : 'next',
            'keypress input[type="text"]' : 'next'
        },

        prev : function(e) {
            e.preventDefault();

            if(this.activeView.$el.find('.previous').hasClass('disabled')) {
                return;
            }

            window.history.back();
        },

        next : function(e) {
            if(e.type == 'keypress') {
                if(e.keyCode == 13) {
                    e.preventDefault();
                    if(this.activeView.$el.find('.next').hasClass('disabled')) {
                        return;
                    }
                    this.activeView.doNext();
                }
            }
            else {
                e.preventDefault();
                if(this.activeView.$el.find('.next').hasClass('disabled')) {
                    return;
                }
                this.activeView.doNext();
            }
        },

        name : 'MyFlow',

        initialState : 'GetFirstName',

        flowEvents : [
            {name : 'ShortFirstName', from : 'GetFirstName', to : 'GetLastName'},
            {name : 'LongFirstName', from : 'GetFirstName', to : 'GetLastName'},
            {name : 'AnyLastName', from : 'GetLastName', to : 'HomeOwner'},
            {name : 'IsHomeOwner', from : 'HomeOwner', to : 'PersonalSummary'},
            {name : 'IsNotHomeOwner', from : 'HomeOwner', to : 'PersonalSummary'}
        ],

        onStart : function() {
            this.setActiveView(FirstNameScreen);

            this.activeView.render();
        },

        onShortFirstName : function(event, from, to, isBrowserNavigating) {
            this.setActiveView(LastNameScreen);

            this.activeView.render(' is a short name');
        },

        onLongFirstName : function(event, from, to, isBrowserNavigating) {
            this.setActiveView(LastNameScreen);

            this.activeView.render(' is a long name');
        },

        onAnyLastName : function(event, from, to, isBrowserNavigating) {
            this.setActiveView(HomeOwnerScreen);

            this.activeView.render();
        },

        onIsHomeOwner : function(event, from, to, isBrowserNavigating) {
            this.setActiveView(HomeOwnerScreen);

            this.activeView.render();
        },

        onIsNotHomeOwner : function(event, from, to, isBrowserNavigating) {
            this.setActiveView(HomeOwnerScreen);

            this.activeView.render();
        },

        setActiveView : function(viewClass) {
            if(this.activeView) {
                this.activeView.undelegateEvents();
                this.activeView.$el.hide();
            }

            this.activeView = new viewClass({
                model : this.model
            });
        },

        getActiveView : function() {
            return this.activeView;
        }
    });

    var flow = new InterviewFlowView({
        model : new Backbone.Model()
    });

    Backbone.history.start();

    flow.render();

    console.log(flow);
});