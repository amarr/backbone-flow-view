/*
Copyright (c) 2012 Austin Marron and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function(window) {
    /**
     * The FlowView class body.
     * 
     * @class FlowView
     * @constructor
     */
    var FlowView = {
        /**
         * Version
         * 
         * @property {String} _FlowViewVersion
         * @private
         */
        _FlowViewVersion : '0.1.1',
        
        /**
         * The name of this flow.
         * 
         * @property {String} name
         */
        name : 'UnnamedFlow',
        
        /**
         * The internal router the flow will use to track the flow state if 
         * 'allowBrowserNavigation' is enabled.
         * 
         * @property {Backbone.Router} router
         * @private
         */
        router : null,
        
        /**
         * The name of the initial event that will occur to transition the flow 
         * into the 'initialState'
         * 
         * @property {String} initialEvent
         * @default Start
         */
        initialEvent : 'Start',
        
        /**
         * The initial state that will be entered when calling startFlow()
         * 
         * @property {String} initialState
         */
        initialState : null,
        
        /**
         * The flow's custom event definitions
         * 
         * @property {Array} flowEvents
         */
        flowEvents : null,
        
        /**
         * If true, the flow state is tracked in the url.
         * 
         * Untested with pushState
         * 
         * @property {Boolean} allowBrowserNavigation
         * @default true
         */
        allowBrowserNavigation : true,
        
        /**
         * Return this from an onLeaveState or onBeforeEvent callback to signal 
         * the flow should cancel the current event. No further action will occur.
         * 
         * @property {Boolean} CANCEL
         * @static
         */
        CANCEL : false,
        
        /**
         * Use this value in flow events 'from' property to indicate the event 
         * can be triggered from any state.
         * 
         * @property {String} WILDCARD
         * @static
         */
        WILDCARD: null,
        
        /**
         * Return this from an onLeaveState callback to signal the flow should 
         * wait for a call to transition() before proceeding to the next state.
         * 
         * @property {String} ASYNC
         * @static
         */
        ASYNC: null,
        
        /**
         * Means to inject the StateMachine class if using dependency management.
         *
         * @property {StateMachine} StateMachine
         * @static
         */
        StateMachine : null,
        
        /**
         * Convenience for code readability.
         * 
         * @property {Boolean} browserIsNavigating
         * @static
         */
        browserIsNavigating : true,
        
        /**
         * @method initialize
         * @param {Object} options
         *  @param {String} [options.initialState]
         */
        initialize : function(options) {
            options = options || {};
            
            // proxies
            this.WILDCARD = this.StateMachine.WILDCARD;
            this.ASYNC = this.StateMachine.ASYNC;
            
            _.extend(this, options);
            
            this.initializeStateMachine()
            
            this.initializeRouter();
        },
        
        /**
         * @method initializeStateMachine
         * @private
         */
        initializeStateMachine : function() {
            this.StateMachine.create({
                target : this.constructor.prototype,
                initial : {
                    state : this.initialState,
                    event : this.initialEvent,
                    defer : true
                },
                events : this.flowEvents
            });
        },
        
        /**
         * TODO: Route should be /:event/:from/:to(/:args) in Backbone 0.9.9
         *
         * @method initializeRouter
         * @private
         */
        initializeRouter : function() {
            if(!this.allowBrowserNavigation) {
                return;
            }
            
            var routes = {};
            routes[this.name + '/:event/:from/:to/:args'] = 'callbackArgs'
            routes[this.name + '/:event/:from/:to'] = 'callbackNoArgs'
            
            var Router = Backbone.Router.extend({
                flow : this,
                
                routes : routes,
                
                callbackArgs : function(event, from, to, args) {
                    var eventName = event;
                    this.flow.setCurrentState(from);
                    
                    args = JSON.parse(decodeURIComponent(args));
                    
                    this.flow.invokeEvent.call(this.flow, eventName, this.flow.browserIsNavigating, args);
                },
                
                callbackNoArgs : function(event, from, to) {
                    var eventName = event;
                    this.flow.setCurrentState(from);
                    
                    this.flow.invokeEvent.call(this.flow, eventName, this.flow.browserIsNavigating);
                }
            });
            
            this.router = new Router();
        },

        /**
         * See: Backbone.View.render - Simply starts the flow.
         *
         * Simply calls startFlow()
         *
         * You may wish to do something more interesting here.
         *
         * @method render
         */
        render : function() {
            this.startFlow();
        },
        
        /**
         * This should be called once you wish to transition the flow into the 
         * 'initialState'.
         * 
         * The default render() method calls this automatically. You only need 
         * to call this if you are overriding the default reender() method.
         *
         * @method startFlow
         */
        startFlow : function() {
            if(this.is('none')) {
                this.invokeEvent(this.initialEvent, !this.browserIsNavigating);
            }
        },

        /**
         * @method createFlowRoute
         * @param  {String} event 
         * @param  {String} from  
         * @param  {String} to    
         * @param  {Array} [args]  
         * @return {String}       Ready to use URI fragment
         * @private
         */
        createFlowRoute : function(event, from, to, args) {
            if(args.length == 0) {
                return this.name + '/' + event + '/' + from + '/' + to;
            }
            else {
                var argsStr = encodeURIComponent(JSON.stringify(args));
                
                return this.name + '/' + event + '/' + from + '/' + to + '/' + argsStr;
            }
        },
        
        /**
         * When any state changes we want to record the change in the browser 
         * history and cause the state to change to the 'to' state.
         *
         * @method onChangeStateInternal
         * @private
         */
        _onChangeStateInternal : function(event, from, to, isBrowserNavigating) {
            // If there are custom arguments, pull them into the array
            var args = arguments.length > 4 ? _.rest(Array.prototype.slice.call(arguments), 4) : [];
            
            if(from != to) {
                if(this.allowBrowserNavigation && !isBrowserNavigating) {
                    var route = this.createFlowRoute(event, from, to, args);
                    this.router.navigate(route);
                }
            }
        },

        /**
         * When an event completes, we gather all events relevant to the state 
         * and bind a listener to them.
         * 
         * The purpose of the listener is to translate the application event into 
         * a state event and invoke it.
         * 
         * This method is always invoked unless the transition is async to ensure 
         * we always stay hooked up to the active view.
         *
         * @method onEnd
         * @private
         */
        _onEnd : function(event, from, to, isBrowserNavigating) {
            var viewObj = this.getActiveView();

            if(!viewObj) {
                return;
            }

            var relevantEvents = [];

            // Remove all flow events from the viewObj first incase it is 
            // being re-used across multiple states.
            _.each(this.flowEvents, function(event) {
                viewObj.off(event.name);

                // Remember this event if it is actually relevant so that 
                // we can more efficiently re-add the listener later 
                // without looking at the whole event list again.
                if(this.isRelevantEvent(event)) {
                    relevantEvents.push(event);
                }
            }, this);

            _.each(relevantEvents, function(event) {
                // Listen for the viewObj to trigger this event
                viewObj.on(event.name, function() {
                    viewObj.off(event.name); // TODO: This is not needed in Backbone 0.9.9 - use once() to bind instead

                    this.invokeEvent(event.name, !this.browserIsNavigating, arguments);
                }, this);
            }, this);
        },

        /**
         * An event is relevant if it can be invoked from the given (or current 
         * if not given) state.
         *
         * 'from' contains this state name or wildcard.
         * 
         * @method isRelevantEvent
         * @param {Object} event
         *  @param {String} event.name
         *  @param {String} event.from
         *  @param {String} event.to
         * @param {String} [state] Current state if not provided
         */
        isRelevantEvent : function(event, state) {
            state = state || this.current;

            var froms = _.isArray(event.from) ? event.from : [event.from];
                
            for(var i = 0, l = froms.length; i < l; i++) {
                if(froms[i] == state || froms[i] == this.WILDCARD) {
                    return true;
                }
            }
            
            return false;
        },
        
        /**
         * Trigger the given event with any corresponding arguments.
         *
         * All event onvocations should go through this method.
         * 
         * @method invokeEvent
         */
        invokeEvent : function(eventName, isBrowserNavigating, args) {
            args = args || [];
            
            var argArray = _.isArguments(args) ? Array.prototype.slice.call(args) : args;
            
            argArray.unshift(isBrowserNavigating);
            
            // calls onChangeState followed by custom flow callbacks
            this[this.cleanFunc(eventName)].apply(this, argArray);
        },

        /**
         * This method should be overridden if the flow events will be 
         * triggered by a view other than the FlowView. Event listeners relevant 
         * to the current state will be attached to the returned view.
         * 
         * @method getActiveView
         * @return {View} The view currently triggering events
         */
        getActiveView : function() {
            return this;
        },
        
        /**
         * @method setCurrentState
         * @param {String} state
         */
        setCurrentState : function(state) {
            this.current = state;
        },
        
        /**
         * @method getCurrentState
         * @return {String} state
         */
        getCurrentState : function() {
            return this.current;
        }
    };
    
    /* Support optional AMD */
    if (_.isFunction(define)) {
        define(['lib/StateMachine'], function(StateMachine) {
            FlowView.StateMachine = StateMachine;
            
            return Backbone.View.extend(FlowView);
        });
    }
    else {
        FlowView.StateMachine = StateMachine;
            
        window.Backbone.FlowView = Backbone.View.extend(FlowView);
    }
})(this);
