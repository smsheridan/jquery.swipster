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
            slide: {
                main: 'swipster__slide',
                current: 'swipster__slide--current',
                next: 'swipster__slide--next',
                prev: 'swipster__slide--prev'
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
            this.$element.children().each($.proxy(function (i, v) {
                this.slides[i] = v;
            }, this));

            this.numberOfSlides = this.slides.length;
            this._maxSlide = this.numberOfSlides - 1;
            this._setIndex(this.options.startPosition);

            this.touchObject = {
                startX: 0,
                startY: 0,
                startTimer: 0,
                stopTimer: 0,
                currentX: 0,
                currentY: 0,
                initiated: false
            };

            this.createDOM();
            this.bindEvents();
        },

        destroy: function () {
            this.$element.off('click', this._handleClick);
            this.$inner.off('touchstart', this._onTouchStart);
            this.$inner.off('touchmove', this._onTouchMove);
            this.$inner.off('touchend', this._onTouchEnd);

            this.$element.prepend(this.slides);
            this.$inner.remove();
            this.$indicators.remove();
            this.$controls.remove();
            this.$counter.remove();
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

        _slideTemplate: function () {
            var i, slideClass, template = '<div class="' + this.classes.inner + '">';

            for (i = 0; i < this.numberOfSlides; i++) {
                slideClass = this.classes.slide.main;

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

            return template + '</div>';
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
         * @TODO: Bind on Swipster main wrapper, delegate events
         * @TODO: Check if touch events exists before attaching them
         */
        bindEvents: function () {
            this.$element.on('click', $.proxy(this._handleClick, this));

            this.$inner.on('touchstart', $.proxy(this._onTouchStart, this));
            this.$inner.on('touchmove', $.proxy(this._onTouchMove, this));
            this.$inner.on('touchend', $.proxy(this._onTouchEnd, this));
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

        /* ======================================================================
         * Public methods
         * ====================================================================== */

        slideTo: function (index) {
            if (this.$inner.hasClass('animating')) {
                return false;
            }

            if (this.options.basicMode) {
                this._gotoNoAnimation(index);
            } else {
                this._gotoWithAnimation(index);
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

        _gotoNoAnimation: function (index) {
            this._setIndex(index);
            this._renderSlides();
            this._renderIndicators();
            this._renderCounter();
        },

        _gotoWithAnimation: function (index) {
            var slideClass, animationClass, $upcommingSlide, $wrongUpcommingSlide, classesToRemove;

            classesToRemove = [
                this.classes.slide.main,
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
             * Verify that the correct slide has the correct class, this is crucial
             * for when we are animating to a specific slide, e.g slideTo(x).
             */
            if (!$upcommingSlide.hasClass(slideClass)) {
                $wrongUpcommingSlide
                    .removeClass(slideClass)
                    .addClass(this.classes.slide.main);

                $upcommingSlide
                    .removeClass(classesToRemove)
                    .addClass(slideClass);
            }

            // Perform actual animation
            this.$inner.addClass('animating ' + animationClass).transitionEnd($.proxy(this._animationEnd, this));
        },

        _animationEnd: function (event) {
            this.$inner.removeClass('animating animate-to-next animate-to-prev');
            this._renderSlides();
            this._renderIndicators();
            this._renderCounter();
        },

        /* ======================================================================
         * Touch Handlers & Animations
         * ====================================================================== */

        /**
         * @TODO: Better touch handling
         * @TODO: Remove commented code
         * @TODO: One event handler for touch
         * @TODO: Skip this stuff and just enable regular swipe if there are only two slides
         */
        _onTouchStart: function (event) {
            if (this.touchObject.initiated) {
                return;
            }

            this.touchObject.startX = event.originalEvent.touches[0].clientX;
            this.touchObject.startY = event.originalEvent.touches[0].clientY;
            this.touchObject.stepsX = 0;
            this.touchObject.stepsY = 0;
            this.touchObject.initiated = true;
            this.touchObject.directionLocked = false;
            this.touchObject.startTimer = new Date().getTime();
        },

        _onTouchMove: function (event) {
            this.touchObject.currentX = event.originalEvent.touches[0].clientX - this.touchObject.startX;
            this.touchObject.currentY = event.originalEvent.touches[0].clientY - this.touchObject.startY;
            this.touchObject.stepsX = Math.abs(this.touchObject.currentX);
            this.touchObject.stepsY = Math.abs(this.touchObject.currentY);

            /*if (this.touchObject.stepsX < 10 && this.touchObject.stepsY < 10) {
                return;
            }*/

            if (!this.touchObject.directionLocked && (this.touchObject.stepsY > this.touchObject.stepsX)) {
                this.touchObject.initiated = false;
                return;
            }

            this.touchObject.directionLocked = true;
            var touchOffset = this.touchObject.currentX;

            /*if (this.touchObject.currentX > 0) {
                touchOffset = this.touchObject.currentX - 10;
            } else {
                touchOffset = this.touchObject.currentX + 10;
            }*/

            if (!this.$inner.hasClass('animating')) {
                this.$inner.css({
                    'transform': 'translate3d(' + touchOffset + 'px, 0, 0)'
                });
            }

            event.preventDefault();
        },

        _onTouchEnd: function (event) {
            var transitionDirection;

            if (!this.touchObject.initiated) {
                return;
            }

            if (!this.touchObject.directionLocked) {
                this.$inner.trigger('click');
                return;
            }

            if (!this.$inner.hasClass('animating')) {
                this.touchObject.initiated = false;
                this.$inner.addClass('animating');
                this.touchObject.stopTimer = new Date().getTime();

                if (this.touchObject.currentX < 0) {
                    transitionDirection = '-100%';
                } else {
                    transitionDirection = '100%';
                }

                if (this.touchObject.stepsX < 50) {
                    transitionDirection = '0';
                }

                this.$inner.css({
                    'transition': 'all 0.3s ease',
                    'transform': 'translate3d(' + transitionDirection + ', 0, 0)'
                });

                this.$inner.transitionEnd($.proxy(this._touchAnimationEnd, this));
            }

            event.preventDefault();
        },

        _touchAnimationEnd: function (event) {
            this.$inner.removeClass('animating');
            this.$inner.removeAttr('style');
            
            if (this.touchObject.stepsX >= 50) {
                if (this.touchObject.currentX < 0) {
                    this._incrementIndex();
                    this._renderSlides();
                    this._renderIndicators();
                    this._renderCounter();
                } else {
                    this._decrementIndex();
                    this._renderSlides();
                    this._renderIndicators();
                    this._renderCounter();
                }
            }
        },

        /* ======================================================================
         * Some render functions
         * ====================================================================== */

        _renderSlides: function () {
            this.$inner.children().each($.proxy(function (index, element) {
                var className = this.classes.slide.main;

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
                    this.classes.slide.main,
                    this.classes.slide.current,
                    this.classes.slide.prev,
                    this.classes.slide.next
                ].join(' ')).addClass(className);
            }, this));
        },

        _renderIndicators: function () {
            this.$indicators
                .children('.active').removeClass('active').end()
                .children('[data-slide-to=' + this._index.current + ']').addClass('active');
        },

        _renderCounter: function () {
            this.$counter.children('.' + this.classes.counter.current).text(this._index.current + 1);
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
            var i, b = document.body || document.documentElement, s = b.style;
         
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
