function pm(){};

c = {
    events : {
        SCREEN_LOAD_SUCCESS : 'sls'
    }
};

app = {
    
    csn : null,
    
    cs : null,
    
    toScreen : function(sn) {
        _.defer(function(that) {
            that.csn = sn;
            that.cs = new Backbone.ScreenView({
                name : sn
            });

            console.info('toScreen(%s)', sn);

            that.trigger(c.events.SCREEN_LOAD_SUCCESS, sn);
            
            var charat = sn.charAt(4);

            $('#cs').html(that.csn + '<br/>').append($('<a>').attr({'onclick': "app.cs.trigger('Screen"+charat+":Success', 'a', 'b')", 'href' : 'javascript:void(0);'}).text('click'));
        }, this);
    },
    
    getCurrentScreenName : function() {
        return this.csn;
    },
    
    getCurrentScreen : function() {
        return this.cs;
    }
};

_.extend(app, Backbone.Events);

require.config({
    baseUrl: "../../../../main/webapp/app/"
});

require([
    'base/ScreenView',
    "views/flows/TestFlow",
    'Constants'
], 
function(ScreenView, TestFlow, consts) {
    Backbone.ScreenView = ScreenView;    
    
    var tf = new TestFlow();
    
    window.tf = tf;
    
    Backbone.history.start();
    //console.log(caf);
    
    tf.render();
    
    //caf.fsm.CreateAccountSuccess();
});