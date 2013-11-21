/*! Swipster */

var Swipster;

Swipster = (function () {
    'use strict';

    var defaults = {
        startPosition: 0,
        indicators: true,
        controls: true,
        counter: true,
        basicMode: false,
        interval: 5000
    };

    /**
     * @TODO: Add support for dispatching events that other components can listen to
     */
    function Swipster(element, options) {
        this.element = element;
        this.$element = $(this.element);
        this.slides = [];
        this.numberOfSlides = 0;
        this._maxSlide = 0;

        /**
         * This object is only used for internal tracking of the
         * setInterval thread.
         */
        this._thread = null;

        /**
         * The index object should be considered immutable, only
         * change the properties of the object through following methods:
         *
         * _setIndex()
         * _incrementIndex()
         * _decrementIndex()
         */
        this._index = {};

        this.options = $.extend({}, defaults, options);
        this.options.basicMode = !this._supports('transition');

        this.classes = {
            main: 'swipster',
            inner: 'swipster__inner',
            wrapper: 'swipster__wrapper',
            slide: {
                main: 'swipster__slide',
                current: 'swipster__slide--current',
                next: 'swipster__slide--next',
                prev: 'swipster__slide--prev',
                hidden: 'swipster__slide--hidden'
            },
            controls: {
                main: 'swipster__controls',
                next: 'swipster__control--next',
                prev: 'swipster__control--prev'
            },
            indicators: 'swipster__indicators',
            counter: {
                main: 'swipster__counter',
                current: 'swipster__digit--current',
                total: 'swipster__digit--total'
            }
        };
        
        this.init();
    }

    Swipster.prototype = {
        init: function () {
            this.$element.children('.' + this.classes.slide.main).each($.proxy(function (i, v) {
                this.slides[i] = v;
            }, this));

            this.numberOfSlides = this.slides.length;
            this._maxSlide = this.numberOfSlides - 1;
            this._setIndex(this.options.startPosition);

            /*this.touch = {
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
                lastX: 0,
                lastY: 0,
                direction: '',
                distanceX: 0,
                distanceY: 0,
                initiated: false,
                directionLocked: false
            };*/

            this.createDOM();
            this.bindEvents();
        },

        destroy: function () {
            this.unbindEvents();
            this.destroyDOM();
        },

        start: function () {
            this._thread = setInterval($.proxy(function () {
                this.slideToNext();
            }, this), this.options.interval);
        },

        stop: function () {
            clearInterval(this._thread);
        },

        /* ======================================================================
         * Initial DOM manipulation and template structure
         * ====================================================================== */

        createDOM: function () {
            var template = this._slideTemplate();

            if (this.options.indicators) {
                template += this._indicatorsTemplate();
            }

            if (this.options.controls) {
                template += this._controlsTemplate();
            }
            
            if (this.options.counter) {
                template += this._counterTemplate();
            }

            /**
             * Wierd issue with removing elements with this.$inner.html(''), leads
             * to reference errors in IE. Resulting in slides being added as empty.
             *
             * This statement first finds all the available slides, then it
             * removes them. Afterwards it adds classes and templates.
             */
            this.$element
                .children('.' + this.classes.slide.main)
                .remove()
                .end()
                .addClass(this.classes.main)
                .append(template);

            // Bind on elements created dynamically
            this.$inner = this.$element.children('.' + this.classes.inner);
            this.$indicators = this.$element.children('.' + this.classes.indicators);
            this.$controls = this.$element.children('.' + this.classes.controls.main);
            this.$counter = this.$element.children('.' + this.classes.counter.main);
        },

        destroyDOM: function () {
            this.$element.prepend(this.slides);
            this.$inner.remove();
            this.$indicators.remove();
            this.$controls.remove();
            this.$counter.remove();
        },

        _slideTemplate: function () {
            var i,
                slideClass,

            template = '<div class="' + this.classes.wrapper + '">' +
                            '<div class="' + this.classes.inner + '">';

            for (i = 0; i < this.numberOfSlides; i++) {
                slideClass = this.classes.slide.hidden;

                if (i == this._index.current) {
                    slideClass = this.classes.slide.current;
                }

                if (this._index.next != this._index.prev) {
                    if (i == this._index.next) {
                        slideClass = this.classes.slide.next;
                    } else if (i == this._index.prev) {
                        slideClass = this.classes.slide.prev;
                    }
                }

                template += '<div class="' + slideClass + '">' + this.slides[i].innerHTML + '</div>';
            }

            return template + '</div></div>';
        },

        _indicatorsTemplate: function () {
            var i, className, template = '<ol class="' + this.classes.indicators + '">';

            for (i = 0; i < this.numberOfSlides; i++) {
                className = (i == this._index.current ? 'active' : '');
                template += '<li class="' + className + '" data-slide-to="' + i + '"></li>';
            }

            return template + '</ol>';
        },

        _controlsTemplate: function () {
            return  '<div class="' + this.classes.controls.main + '">' +
                        '<a href="#next" class="' + this.classes.controls.prev + '"></a>' +
                        '<a href="#prev" class="' + this.classes.controls.next + '"></a>' +
                    '</div>';
        },
        
        _counterTemplate: function () {
            return  '<div class="' + this.classes.counter.main + '">' +
                        '<span class="' + this.classes.counter.current + '">' + (this._index.current + 1) + '</span>' +
                        '<span class="divider">/</span>' +
                        '<span class="' + this.classes.counter.total + '">' + this.numberOfSlides + '</span>' +
                    '</div>';
        },

        /* ======================================================================
         * Event Binding
         * ====================================================================== */

        /**
         * @TODO: Check if touch events exists before attaching them
         */
        bindEvents: function () {
            this.$element.on('click', $.proxy(this._handleClick, this));
            //this.$inner.on('touchstart touchmove touchend', $.proxy(this._handleTouch, this));
        },

        unbindEvents: function () {
            this.$element.off('click', this._handleClick);
            //this.$inner.off('touchstart touchmove touchend', this._handleTouch);
        },

        _handleClick: function (event) {
            switch (event.type) {
                case 'click':
                    var $target = $(event.target);

                    if ($target.parent().hasClass(this.classes.indicators)) {
                        if (!$target.hasClass('active')) {
                            this.slideTo($target.data('slide-to'));
                        }
                        
                        event.preventDefault();
                    }

                    if ($target.hasClass(this.classes.controls.next)) {
                        this.slideToNext();
                        event.preventDefault();
                    }

                    if ($target.hasClass(this.classes.controls.prev)) {
                        this.slideToPrev();
                        event.preventDefault();
                    }

                    break;
            }
        },

        /**
         * @TODO: Create separate functions for touchstart, touchmove and touchend.
         */
        /*_handleTouch: function (event) {
            var touchEvent = event.originalEvent.touches[0];

            switch (event.type) {
                case 'touchstart':
                    if (this.touch.initiated) {
                        return;
                    }

                    this.touch = {
                        startX: touchEvent.pageX,
                        startY: touchEvent.pageY,
                        currentX: 0,
                        currentY: 0,
                        lastX: 0,
                        lastY: 0,
                        direction: '',
                        distanceX: 0,
                        distanceY: 0,
                        initiated: true,
                        directionLocked: false
                    };
                    
                    break;

                case 'touchmove':
                    if (!this.touch.initiated) {
                        return;
                    }

                    this.touch.currentX = touchEvent.pageX - this.touch.startX;
                    this.touch.currentY = touchEvent.pageY - this.touch.startY;

                    if (this.touch.currentX != this.touch.lastX) {
                        this.touch.distanceX = this.touch.distanceX + 1;
                    }

                    if (this.touch.currentY != this.touch.lastY) {
                        this.touch.distanceY = this.touch.distanceY + 1;
                    }

                    this.touch.lastY = this.touch.currentY;
                    this.touch.lastX = this.touch.currentX;

                    // Dont track super small touch moves
                    if (this.touch.distanceX < 10 && this.touch.distanceY < 10) {
                        return;
                    }

                    // Check if we are traveling down instead of swiping
                    if (!this.touch.directionLocked && (this.touch.distanceY > this.touch.distanceX)) {
                        this.touch.initiated = false;
                        return false;
                    }

                    event.preventDefault();
                    this.touch.directionLocked = true;

                    break;

                case 'touchend':
                    if (!this.touch.initiated) {
                        return;
                    }

                    if (Math.abs(this.touch.currentX) > 25) {
                        if (this.touch.currentX < 0) {
                            this.slideToNext();
                        } else {
                            this.slideToPrev();
                        }
                    }

                    this.touch.initiated = false;
                    break;
            }
        },*/

        /* ======================================================================
         * Public methods
         * ====================================================================== */

        slideTo: function (index) {
            if (this.$inner.hasClass('animating')) {
                return false;
            }

            if (this.options.basicMode) {
                this._slideToSimple(index);
            } else {
                this._slideToAnimation(index);
            }
        },

        slideToNext: function () {
            this.slideTo(this._index.current + 1);
        },

        slideToPrev: function () {
            this.slideTo(this._index.current - 1);
        },

        /* ======================================================================
         * Internal slide handling
         * ====================================================================== */

        _slideToSimple: function (index) {
            this._setIndex(index);
            this._renderAll();
        },

        _slideToAnimation: function (index) {
            var slideClass, animationClass, $upcommingSlide, $wrongUpcommingSlide, classesToRemove;

            classesToRemove = [
                this.classes.slide.hidden,
                this.classes.slide.prev,
                this.classes.slide.next
            ].join(' ');

            // Check if in which direction we are supposed to animate
            if (this._index.current < index) {
                animationClass = 'animate-to-next';
                slideClass = this.classes.slide.next;
            } else {
                animationClass = 'animate-to-prev';
                slideClass = this.classes.slide.prev;
            }

            // Update index after the direction check
            this._setIndex(index);

            $upcommingSlide = this.$inner.children().eq(this._index.current);
            $wrongUpcommingSlide = this.$inner.children('.' + slideClass);

            /**
             * Verify that the upcomming slide has the correct class, this is crucial
             * for animating to a specific slide, e.g slideTo(x).
             */
            if (!$upcommingSlide.hasClass(slideClass)) {
                $wrongUpcommingSlide
                    .removeClass(slideClass)
                    .addClass(this.classes.slide.hidden);

                $upcommingSlide
                    .removeClass(classesToRemove)
                    .addClass(slideClass);
            }

            // Perform actual animation
            this.$inner.addClass('animating ' + animationClass).transitionEnd('transitionend', $.proxy(this._animationEnd, this));
        },

        _animationEnd: function (event) {
            this.$inner.removeClass('animating animate-to-next animate-to-prev');
            this._renderAll();
        },

        /* ======================================================================
         * Some render functions
         * ====================================================================== */

        _renderSlides: function () {
            this.$inner.children().each($.proxy(function (index, element) {
                var className = this.classes.slide.hidden;

                if (index == this._index.current) {
                    className = this.classes.slide.current;
                }

                if (this._index.next != this._index.prev) {
                    if (index == this._index.next) {
                        className = this.classes.slide.next;
                    } else if (index == this._index.prev) {
                        className = this.classes.slide.prev;
                    }
                }

                $(element).removeClass([
                    this.classes.slide.hidden,
                    this.classes.slide.current,
                    this.classes.slide.prev,
                    this.classes.slide.next
                ].join(' ')).addClass(className);
            }, this));
        },

        _renderIndicators: function () {
            if (!this.options.indicators) {
                return false;
            }

            this.$indicators
                .children('.active').removeClass('active').end()
                .children('[data-slide-to=' + this._index.current + ']').addClass('active');
        },

        _renderCounter: function () {
            if (!this.options.counter) {
                return false;
            }

            this.$counter.children('.' + this.classes.counter.current).text(this._index.current + 1);
        },

        _renderAll: function () {
            this._renderSlides();
            this._renderIndicators();
            this._renderCounter();
        },

        /* ======================================================================
         * Some nice helpers
         * ====================================================================== */

        _incrementIndex: function () {
            this._setIndex(this._index.current + 1);
        },

        _decrementIndex: function () {
            this._setIndex(this._index.current - 1);
        },

        _setIndex: function (index) {
            var prev, next, current = index;

            if (current > this._maxSlide) {
                current = 0;
            } else if (current < 0) {
                current = this._maxSlide;
            }

            prev = current - 1;

            if (prev < 0) {
                prev = this._maxSlide;
            }

            next = current + 1;

            if (next > this._maxSlide) {
                next = 0;
            }

            this._index = {
                prev: prev,
                current: current,
                next: next
            };
        },

        /**
         * https://gist.github.com/jackfuchs/556448
         * To verify that a CSS property is supported (or any of its browser-specific implementations)
         *
         * @param string p - css property name
         * [@param] bool rp - optional, if set to true, the css property name will be returned, instead of a boolean support indicator
         *
         * @Author: Axel Jack Fuchs (Cologne, Germany)
         * @Date: 08-29-2010 18:43
         *
         * Example: $.support.cssProperty('boxShadow');
         * Returns: true
         *
         * Example: $.support.cssProperty('boxShadow', true);
         * Returns: 'MozBoxShadow' (On Firefox4 beta4)
         * Returns: 'WebkitBoxShadow' (On Safari 5)
         */
        _supports: function (p, rp) {
            var v, i, b = document.body || document.documentElement, s = b.style;
         
            // No css support detected
            if (typeof s == 'undefined') {
                return false;
            }
         
            // Tests for standard prop
            if (typeof s[p] == 'string') {
                return rp ? p : true;
            }
         
            // Tests for vendor specific prop
            v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms', 'Icab'],
            p = p.charAt(0).toUpperCase() + p.substr(1);

            for (i = 0; i < v.length; i++) {
                if (typeof s[v[i] + p] == 'string') {
                    return rp ? (v[i] + p) : true;
                }
            }
        }
    };

    return Swipster;
})();
