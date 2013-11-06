/*! Swipster */

var Swipster;

Swipster = (function() {
    var defaults = {
        startPosition: 0,
        indicators: true,
        controls: true,
        counter: true,
        basicMode: false,
        interval: 5000
    }

    function Swipster(element, options) {
        this.element = element;
        this.$element = $(this.element);
        this.slides = [];
        this.thread = null;
        this.index = {};

        this.options = $.extend({}, defaults, options);

        if (!this._supports('transition')) {
            this.options.basicMode = true;
        }
        
        //this.currentIndex = this.options.startPosition;

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
        init: function() {
            this.$element.children('.' + this.classes.slide.main).each($.proxy(function(i, element) {
                this.slides[i] = element;
            }, this));

            this.index = {
                prev: this.slides.length - 1,
                current: 0,
                next: 1
            };

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

        destroy: function() {
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

        start: function() {
            this.thread = setInterval($.proxy(function() {
                this.next();
            }, this), this.options.interval);
        },

        stop: function() {
            clearInterval(this.thread);
        },

        /* ======================================================================
         * Initial DOM manipulation and template structure
         * ====================================================================== */

        createDOM: function() {
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
            this.$currentSlide = this.$inner.children('.' + this.classes.slide.current);
            this.$prevSlide = this.$inner.children('.' + this.classes.slide.prev);
            this.$nextSlide = this.$inner.children('.' + this.classes.slide.next);

            this.$indicators = this.$element.children('.' + this.classes.indicators);
            this.$controls = this.$element.children('.' + this.classes.controls.main);
            this.$counter = this.$element.children('.' + this.classes.counter.main);
        },

        _slideTemplate: function() {
            /*var template = ''
                + '<div class="' + this.classes.inner + '">'
                +     '<div class="' + this.classes.slide.prev + '">' + $(this.slides[this.slides.length - 1]).html() + '</div>'
                +     '<div class="' + this.classes.slide.current + '">' + $(this.slides[0]).html() + '</div>'
                +     '<div class="' + this.classes.slide.next + '">' + $(this.slides[1]).html() + '</div>'
                + '</div>';*/

            var template = '<div class="' + this.classes.inner + '">';

            for (var i = 0; i < this.slides.length; i++) {
                var slideClass = this.classes.slide.main;

                if (i == 0) {
                    slideClass = this.classes.slide.current;
                }

                if (i == 1 && i != (this.slides.length - 1)) {
                    slideClass = this.classes.slide.next;
                }

                if (i == (this.slides.length - 1) && i != 1) {
                    slideClass = this.classes.slide.prev;
                }

                template += '<div class="' + slideClass + '">' + $(this.slides[i]).html() + '</div>';
            }

            template += '</div>';

            return template;
        },

        _indicatorsTemplate: function() {
            var template = '<ol class="' + this.classes.indicators + '">';

            for (var i = 0; i < this.slides.length; i++) {
                var classes = (i == 0 ? 'class="active"' : '');
                var index = i + 1;

                template += '<li ' + classes + ' data-goto-slide="' + index + '"></li>';
            }

            template += '</ol>';

            return template;
        },

        _controlsTemplate: function() {
            var template = ''
                + '<div class="' + this.classes.controls.main + '">'
                +     '<a href="#next" class="' + this.classes.controls.prev + '"></a>'
                +     '<a href="#prev" class="' + this.classes.controls.next + '"></a>'
                + '</div>'
            
            return template;
        },
        
        _counterTemplate: function() {
            var template = ''
                + '<div class="' + this.classes.counter.main + '">'
                +     '<span class="' + this.classes.counter.current + '">' + (this.index.current + 1) + '</span>'
                +     '<span class="divider">/</span>'
                +     '<span class="' + this.classes.counter.total + '">' + this.slides.length + '</span>'
                + '</div>'
            
            return template;
        },

        /* ======================================================================
         * Event Binding
         * ====================================================================== */

        /**
         * @TODO: Bind on Swipster main wrapper, delegate events
         */
        bindEvents: function() {
            this.$element.on('click', $.proxy(this._handleClick, this));
            $(document).on('keydown', $.proxy(this._handleKeyDown, this));

            this.$inner.on('touchstart', $.proxy(this._onTouchStart, this));
            this.$inner.on('touchmove', $.proxy(this._onTouchMove, this));
            this.$inner.on('touchend', $.proxy(this._onTouchEnd, this));
        },

        _handleClick: function(event) {
            switch (event.type) {
                case 'click':
                    $target = $(event.target);

                    if ($target.parent().hasClass(this.classes.indicators)) {
                        if (!$target.hasClass('active')) {
                            this.animateToSlide($target.data('goto-slide'));
                        }
                        
                        event.preventDefault();
                    }

                    if ($target.hasClass(this.classes.controls.next)) {
                        this.next();
                        event.preventDefault();
                    }

                    if ($target.hasClass(this.classes.controls.prev)) {
                        this.prev();
                        event.preventDefault();
                    }

                    break;
            }
        },

        /**
         * @TODO: Add check if current slideshow is in viewport
         */
        _handleKeyDown: function(event) {
            var KEY_RIGHTARROW = 39 , KEY_LEFTARROW = 37;
            
            switch(event.keyCode) {
                case KEY_RIGHTARROW:
                    this.next();
                    event.preventDefault();

                    break;

                case KEY_LEFTARROW:
                    this.prev();
                    event.preventDefault();

                    break;
            }
        },

        /* ======================================================================
         * gotoSlide(index) or animateToSlide
         * ====================================================================== */

        gotoSlide: function(index) {
            this._setIndex(index)
            this._renderSlides();
            this._renderIndicators();
            this._renderCounter();
        },

        animateToSlide: function(index) {
            if (this.$inner.hasClass('animating')) {
                return false;
            }

            index = index - 1;

            if (!this.options.basicMode) {
                if (this.index.current < index) {
                    this._setNextSlideContent(index);
                    this._setIndex(index - 1);

                    this.$inner
                        .addClass('animating animate-forward')
                        .transitionEnd($.proxy(this._nextAnimationEnd, this));
                } else {
                    var prevIndex = index;

                    if (index == (this.slides.length - 1)) {
                        prevIndex = 0
                    }

                    this._setPrevSlideContent(prevIndex);
                    this._setIndex(index + 1);

                    this.$inner
                        .addClass('animating animate-back')
                        .transitionEnd($.proxy(this._prevAnimationEnd, this));
                }
            } else {
                this.gotoSlide(index);
            }
        },

        /* ======================================================================
         * Public next() Method, slides to next slide
         * ====================================================================== */

        next: function() {
            if (!this.$inner.hasClass('animating')) {
                if (!this.options.basicMode) {
                    if (this.slides.length < 3) {
                        if (this.index.current == 0) {
                            this.$inner.children().eq(1).removeClass(this.classes.slide.prev + ' ' + this.classes.slide.main).addClass(this.classes.slide.next);
                        } else {
                            this.$inner.children().eq(0).removeClass(this.classes.slide.prev + ' ' + this.classes.slide.main).addClass(this.classes.slide.next);
                        }
                    }

                    this.$inner
                        .addClass('animating animate-forward')
                        .transitionEnd($.proxy(this._nextAnimationEnd, this));
                } else {
                    this._renderNextSlide();
                }
            }
        },

        _nextAnimationEnd: function(event) {
            this.$inner.removeClass('animating animate-forward');
            this._renderNextSlide();
        },

        /* ======================================================================
         * Public prev() Method, slides to previous slide
         * ====================================================================== */

        prev: function() {
            if (!this.$inner.hasClass('animating')) {
                if (!this.options.basicMode) {
                    if (this.slides.length < 3) {
                        if (this.index.current == 0) {
                            this.$inner.children().eq(1).removeClass(this.classes.slide.next + ' ' + this.classes.slide.main).addClass(this.classes.slide.prev);
                        } else {
                            this.$inner.children().eq(0).removeClass(this.classes.slide.next + ' ' + this.classes.slide.main).addClass(this.classes.slide.prev);
                        }
                    }

                    this.$inner
                        .addClass('animating animate-back')
                        .transitionEnd($.proxy(this._prevAnimationEnd, this));
                } else {
                    this._renderPrevSlide();
                }
            }
        },

        _prevAnimationEnd: function(event) {
            this.$inner.removeClass('animating animate-back');
            this._renderPrevSlide();
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
        _onTouchStart: function(event) {
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

        _onTouchMove: function(event) {
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

        _onTouchEnd: function(event) {
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
                    var transitionDirection = '-100%'
                } else {
                    var transitionDirection = '100%';
                }

                if (this.touchObject.stepsX < 50) {
                    var transitionDirection = '0';
                }

                this.$inner.css({
                    'transition': 'all 0.3s ease',
                    'transform': 'translate3d(' + transitionDirection + ', 0, 0)'
                });

                this.$inner.transitionEnd($.proxy(this._touchAnimationEnd, this));
            }

            event.preventDefault();
        },

        _touchAnimationEnd: function(event) {
            this.$inner.removeClass('animating');
            this.$inner.removeAttr('style');
            
            if (this.touchObject.stepsX >= 50) {
                if (this.touchObject.currentX < 0) {
                    this._renderNextSlide();
                } else {
                    this._renderPrevSlide();
                }
            }
        },

        /* ======================================================================
         * Some render functions
         * ====================================================================== */

        /**
         * @TODO: Optimize this
         */
        _renderSlides: function() {
            var self = this;

            this.$inner.children().each(function(index, value) {
                $(this).removeClass(
                    self.classes.slide.main + ' ' +
                    self.classes.slide.current + ' ' +
                    self.classes.slide.prev + ' ' +
                    self.classes.slide.next
                );
            });

            this.$inner.children().eq(this.index.current).addClass(this.classes.slide.current);

            if (this.index.prev != this.index.next) {
                this.$inner.children().eq(this.index.next).addClass(this.classes.slide.next);
                this.$inner.children().eq(this.index.prev).addClass(this.classes.slide.prev);
            }

            this.$inner.children().each(function(index, value) {
                if ($(this).attr('class').length <= 0) {
                    $(this).addClass(self.classes.slide.main)
                }
            });
        },

        _renderIndicators: function() {
            this.$indicators.find('.active').removeClass('active');
            this.$indicators.find('[data-goto-slide=' + (this.index.current + 1) + ']').addClass('active');
        },

        _renderCounter: function() {
            this.$counter.children('.' + this.classes.counter.current).text(this.index.current + 1);
        },

        _renderNextSlide: function() {
            this._incrementIndex();
            this._renderSlides();
            this._renderIndicators();
            this._renderCounter();
        },

        _renderPrevSlide: function() {
            this._decrementIndex();
            this._renderSlides();
            this._renderIndicators();
            this._renderCounter();
        },

        /* ======================================================================
         * Some nice helpers
         * ====================================================================== */

        _incrementIndex: function() {
            this._setIndex(this.index.current + 1);
        },

        _decrementIndex: function() {
            this._setIndex(this.index.current - 1);
        },

        _setIndex: function(index) {
            var current = index;

            if (current > this.slides.length - 1) {
                current = 0;
            }

            if (current < 0) {
                current = this.slides.length - 1;
            }

            var prev = current - 1;
            var next = current + 1;

            if (prev < 0) {
                prev = this.slides.length - 1;
            }

            if (next > this.slides.length - 1) {
                next = 0;
            }

            this.index = {
                prev: prev,
                current: current,
                next: next
            }
        },

        _setNextSlideContent: function(index) {
            var nextIndex = this.index.current - this.slides.length + 1;

            this.$inner.children().eq(nextIndex).removeClass(this.classes.slide.next).addClass(this.classes.slide.main);
            this.$inner.children().eq(index).removeClass(this.classes.slide.main).addClass(this.classes.slide.next);
        },

        _setPrevSlideContent: function(index) {
            var prevIndex = this.index.current - 1;

            this.$inner.children().eq(prevIndex).removeClass(this.classes.slide.prev).addClass(this.classes.slide.main);
            this.$inner.children().eq(index).removeClass(this.classes.slide.main + ' ' + this.classes.slide.next).addClass(this.classes.slide.prev);
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
        _supports: function(p, rp) {
            var b = document.body || document.documentElement,
            s = b.style;
         
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

            for(var i = 0; i < v.length; i++) {
                if (typeof s[v[i] + p] == 'string') {
                    return rp ? (v[i] + p) : true;
                }
            }
        }
    };

    return Swipster;    
})();


