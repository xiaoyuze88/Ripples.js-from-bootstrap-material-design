/* Copyright 2014+, Federico Zivolo, LICENSE at https://github.com/FezVrasta/bootstrap-material-design/blob/master/LICENSE.md */
/* globals jQuery, navigator */

(function($, window, document, undefined) {

    "use strict";

    /**
     * Define the name of the plugin
     */
    var ripples = "ripples";


    /**
     * Get an instance of the plugin
     */
    var self = null;


    /**
     * Define the defaults of the plugin
     */
    var defaults = {};


    /**
     * Create the main plugin function
     */
    function Ripples(element, options) {
        self = this;

        this.element = $(element);

        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = ripples;

        this.init();
    }


    /**
     * Initialize the plugin
     */
    Ripples.prototype.init = function() {
        var $element = this.element;

        //****************************//
        // These part only need to be done once when initilizing
        // Put it out of the callback
        // By Xiao Yuze

        // Check whether the container element's position is static or not, if it's 'static', set it to 'relative',
        // because "ripple-wrapper"'s position is 'absolute', make it's offsetParent to be his parent element except the root element.
        // Add by Xiao Yuze
        if (getComputedStyle($element[0]).getPropertyValue('position') === 'static') {
            $element.css({
                position: 'relative'
            });
        }

        /**
         * Verify if the current element already has a ripple wrapper element and
         * creates if it doesn't
         */
        if (!($element.find(".ripple-wrapper").length)) {
            $element.append("<div class=\"ripple-wrapper\"></div>");
        }

        //****************************//

        $element.on("mousedown touchstart", function(event) {

            // Prevent inner ripples trigger the outter one
            event.stopPropagation();
            /**
             * Verify if the user is just touching on a device and return if so
             */
            if (self.isTouch() && event.type === "mousedown") {
                return;
            }

            // debugger
            /**
             * Find the ripple wrapper
             */
            var $wrapper = $element.children(".ripple-wrapper");

            /**
             * Get relY and relX positions
             */
            var relY = self.getRelY($wrapper, event);
            var relX = self.getRelX($wrapper, event);


            /**
             * If relY and/or relX are false, return the event
             */
            if (!relY && !relX) {
                return;
            }


            /**
             * Get the ripple color
             */
            var rippleColor = self.getRipplesColor($element);

            var $ripple = $("<div class='ripple'></div>")
                                .css({
                                    "left": relX,
                                    "top": relY,
                                    "background-color": rippleColor
                                });

            /**
             * Append the ripple to the wrapper
             */
            $wrapper.append($ripple);


            /**
             * Make sure the ripple has the styles applied (ugly hack but it works)
             */
            (function() {
                return window.getComputedStyle($ripple[0]).opacity;
            })();


            /**
             * Turn on the ripple animation
             */
            self.rippleOn($element, $ripple);


            /**
             * Call the rippleEnd function when the transition "on" ends
             */
            setTimeout(function() {
                self.rippleEnd($ripple);
            }, 500);


            /**
             * Detect when the user leaves the element
             */
            $element.one("mouseup mouseleave touchend", function() {
                $ripple.data("mousedown", "off");
                if ($ripple.data("animating") === "off") {
                    self.rippleOut($ripple);
                }
            });
        });
    };


    /**
     * Get the new size based on the element height/width and the ripple width
     */
    Ripples.prototype.getNewSize = function($element, $ripple) {

        return (Math.max($element.outerWidth(), $element.outerHeight()) / $ripple.outerWidth()) * 2.5;
    };


    /**
     * Get the relX
     */
    Ripples.prototype.getRelX = function($wrapper, event) {
        var wrapperOffset = $wrapper.offset();

        if (!self.isTouch()) {
            /**
             * Get the mouse position relative to the ripple wrapper
             */
            return event.pageX - wrapperOffset.left;
        } else {
            /**
             * Make sure the user is using only one finger and then get the touch
             * position relative to the ripple wrapper
             */
            event = event.originalEvent;

            if (event.touches.length === 1) {
                return event.touches[0].pageX - wrapperOffset.left;
            }

            return false;
        }
    };


    /**
     * Get the relY
     */
    Ripples.prototype.getRelY = function($wrapper, event) {
        var wrapperOffset = $wrapper.offset();

        if (!self.isTouch()) {
            /**
             * Get the mouse position relative to the ripple wrapper
             */
            return event.pageY - wrapperOffset.top;
        } else {
            /**
             * Make sure the user is using only one finger and then get the touch
             * position relative to the ripple wrapper
             */
            event = event.originalEvent;

            if (event.touches.length === 1) {
                return event.touches[0].pageY - wrapperOffset.top;
            }

            return false;
        }
    };


    /**
     * Get the ripple color
     */
    Ripples.prototype.getRipplesColor = function($element) {

        var color = $element.data("ripple-color") ? $element.data("ripple-color") : window.getComputedStyle($element[0]).color;

        return color;
    };


    /**
     * Verify if the client browser has transistion support
     */
    Ripples.prototype.hasTransitionSupport = function() {
        var thisBody = document.body || document.documentElement;
        var thisStyle = thisBody.style;

        var support = (
            thisStyle.transition !== undefined ||
            thisStyle.WebkitTransition !== undefined ||
            thisStyle.MozTransition !== undefined ||
            thisStyle.MsTransition !== undefined ||
            thisStyle.OTransition !== undefined
        );

        return support;
    };


    /**
     * Verify if the client is using a mobile device
     */
    Ripples.prototype.isTouch = function() {
        // return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        // Make it more accurate on verifying mobile devices 
        // Add by Xiao Yuze
        return "ontouchstart" in window && (/android|webos|ip(hone|ad|od)|opera (mini|mobi|tablet)|iemobile|windows.+(phone|touch)|mobile|fennec|kindle (Fire)|Silk|maemo|blackberry|playbook|bb10\; (touch|kbd)|Symbian(OS)|Ubuntu Touch/i.test(navigator.userAgent));
    };


    /**
     * End the animation of the ripple
     */
    Ripples.prototype.rippleEnd = function($ripple) {
        $ripple.data("animating", "off");

        if ($ripple.data("mousedown") === "off") {
            self.rippleOut($ripple);
        }
    };


    /**
     * Turn off the ripple effect
     */
    Ripples.prototype.rippleOut = function($ripple) {
        $ripple.off();

        if (self.hasTransitionSupport()) {
            $ripple.addClass("ripple-out");
        } else {
            $ripple.animate({
                "opacity": 0
            }, 100, function() {
                $ripple.trigger("transitionend");
            });
        }

        $ripple.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
            $ripple.remove();
        });
    };


    /**
     * Turn on the ripple effect
     */
    Ripples.prototype.rippleOn = function($element, $ripple) {
        var size = $element.data('rippleSize');
        
        // cache size, prevent layout from every click
        if(!size) {
            size = self.getNewSize($element, $ripple);
            $element.data('rippleSize', size);
        }
        
        if (self.hasTransitionSupport()) {
            $ripple
                .css({
                    "-ms-transform": "scale(" + size + ")",
                    "-moz-transform": "scale(" + size + ")",
                    "-webkit-transform": "scale(" + size + ")",
                    "transform": "scale(" + size + ")"
                })
                .addClass("ripple-on")
                .data("animating", "on")
                .data("mousedown", "on");
        } else {
            $ripple.animate({
                "width": Math.max($element.outerWidth(), $element.outerHeight()) * 2,
                "height": Math.max($element.outerWidth(), $element.outerHeight()) * 2,
                "margin-left": Math.max($element.outerWidth(), $element.outerHeight()) * (-1),
                "margin-top": Math.max($element.outerWidth(), $element.outerHeight()) * (-1),
                "opacity": 0.2
            }, 500, function() {
                $ripple.trigger("transitionend");
            });
        }
    };


    /**
     * Create the jquery plugin function
     */
    $.fn.ripples = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + ripples)) {
                $.data(this, "plugin_" + ripples, new Ripples(this, options));
            }
        });
    };

})(jQuery, window, document);
