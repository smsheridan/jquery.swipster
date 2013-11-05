/*! Swipster */

var Swipster;

Swipster = (function() {
    var defaults = {
        startPosition: 0,
        indicators: true,
        controls: true,
        counter: true,
        basicMode: false
    }

    function Swipster(element, options) {
        this.element = element;
        this.slides = [];

        this.options = $.extend({}, defaults, options);
        this.currentIndex = this.options.startPosition;

        if (!this.supports('transition')) {
            this.options.basicMode = true;
        }

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
                main: 'swipster__counter'
            }
        };

        this.init();
    }

    Swipster.prototype.init = function() {
        // Bind some jQuery stuff
        this.$element = $(this.element);

        // Other variables
        this.$element.children('.' + this.classes.slide.main).each($.proxy(function(i, element) {
            this.slides[i] = element;
        }, this));

        // Create touch object
        this.touchObject = {
            startX: 0,
            startY: 0,
            startTimer: 0,
            stopTimer: 0,
            currentX: 0,
            currentY: 0,
            initiated: false
        };

        // Create DOM
        this.createDOM();

        // Bind them events
        this.bindEvents();
    };

    /* ======================================================================
     * Initial DOM manipulation and template structure
     * ====================================================================== */

    Swipster.prototype.createDOM = function() {
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
        this.$currentSlide = this.$element.find('.' + this.classes.slide.current);
        this.$prevSlide = this.$element.find('.' + this.classes.slide.prev);
        this.$nextSlide = this.$element.find('.' + this.classes.slide.next);
        this.$counterIndex = this.$element.find('.' + this.classes.counter.main + ' .current');
    };

    Swipster.prototype._slideTemplate = function() {
        var template = ''
            + '<div class="' + this.classes.inner + '">'
            +     '<div class="' + this.classes.slide.prev + '">' + $(this.slides[this.slides.length - 1]).html() + '</div>'
            +     '<div class="' + this.classes.slide.current + '">' + $(this.slides[0]).html() + '</div>'
            +     '<div class="' + this.classes.slide.next + '">' + $(this.slides[1]).html() + '</div>'
            + '</div>';

        return template;
    };

    Swipster.prototype._indicatorsTemplate = function() {
        var template = '<ol class="' + this.classes.indicators + '">';

        for (var i = 0; i < this.slides.length; i++) {
            var classes = (i == 0 ? 'class="active"' : '');
            var index = i + 1;

            template += '<li ' + classes + ' data-goto-slide="' + index + '"></li>';
        }

        template += '</ol>';

        return template;
    };

    Swipster.prototype._controlsTemplate = function() {
        var template = ''
            + '<div class="' + this.classes.controls.main + '">'
            +     '<a href="#next" class="' + this.classes.controls.prev + '"></a>'
            +     '<a href="#prev" class="' + this.classes.controls.next + '"></a>'
            + '</div>'
        
        return template;
    };
    
    Swipster.prototype._counterTemplate = function() {
        var template = ''
            + '<div class="' + this.classes.counter.main + '">'
            +     '<span class="current">' + (this.currentIndex + 1) + '</span>'
            +     '<span class="divider">/</span>'
            +     '<span class="total">' + this.slides.length + '</span>'
            + '</div>'
        
        return template;
    };

    /* ======================================================================
     * Event Binding
     * ====================================================================== */

    /**
     * @TODO: Bind on Swipster main wrapper, delegate events
     */
    Swipster.prototype.bindEvents = function() {
        this.$element.on('click', $.proxy(this._handleClick, this));
        $(document).on('keydown', $.proxy(this._handleKeyDown, this));

        this.$inner.on('touchstart', $.proxy(this._onTouchStart, this));
        this.$inner.on('touchmove', $.proxy(this._onTouchMove, this));
        this.$inner.on('touchend', $.proxy(this._onTouchEnd, this));
    };

    Swipster.prototype._handleClick = function(event) {
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
    };

    Swipster.prototype.animateToSlide = function(index) {
        if (this.$inner.hasClass('animating')) {
            return false;
        }

        index = index - 1;

        if (!this.options.basicMode) {
            if (this.currentIndex < index) {
                this._setNextSlideContent(index);
                this._setIndex(index - 1);

                this.$inner
                    .addClass('animating animate-forward')
                    .transitionEnd($.proxy(this._nextAnimationEnd, this));
            } else {
                this._setPrevSlideContent(index);
                this._setIndex(index + 1);

                this.$inner
                    .addClass('animating animate-back')
                    .transitionEnd($.proxy(this._prevAnimationEnd, this));
            }
        } else {
            this.gotoSlide(index);
        }
    };

    /* ======================================================================
     * Keyboard Navigation
     * ====================================================================== */

    /**
     * @TODO: Add check if current slideshow is in viewport
     */
    Swipster.prototype._handleKeyDown = function(event) {
        var KEY_RIGHTARROW = 39, KEY_LEFTARROW = 37, KEY_ESC = 27;
        
        switch(event.keyCode) {
            case KEY_RIGHTARROW:
                this.next(event);

                break;

            case KEY_LEFTARROW:
                this.prev(event);

                break;
        }
    };

    /* ======================================================================
     * Touch Handlers & Animations
     * ====================================================================== */

    /**
     * @TODO: Better touch handling
     * @TODO: Remove commented code
     */
    Swipster.prototype._onTouchStart = function(event) {
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
    };

    Swipster.prototype._onTouchMove = function(event) {
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
                '-webkit-transform': 'translate3d(' + touchOffset + 'px, 0, 0)'
            });
        }

        event.preventDefault();
    };

    Swipster.prototype._onTouchEnd = function(event) {
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
                '-webkit-transition': 'all 0.3s ease',
                '-webkit-transform': 'translate3d(' + transitionDirection + ', 0, 0)'
            });

            this.$inner.transitionEnd($.proxy(this._touchAnimationEnd, this));
        }

        event.preventDefault();
    };

    Swipster.prototype._touchAnimationEnd = function(event) {
        this.$inner.removeClass('animating');
        this.$inner.removeAttr('style');
        
        if (this.touchObject.stepsX >= 50) {
            if (this.touchObject.currentX < 0) {
                this._renderNextSlide();
            } else {
                this._renderPrevSlide();
            }
        }
    };

    /* ======================================================================
     * Public next() Method, slides to next slide
     * ====================================================================== */

    Swipster.prototype.next = function() {
        if (!this.$inner.hasClass('animating')) {
            if (!this.options.basicMode) {
                this.$inner
                    .addClass('animating animate-forward')
                    .transitionEnd($.proxy(this._nextAnimationEnd, this));
            } else {
                this._renderNextSlide();
            }
        }
    };

    Swipster.prototype._nextAnimationEnd = function(event) {
        this.$inner.removeClass('animating animate-forward');
        this._renderNextSlide();
    };

    /* ======================================================================
     * Public prev() Method, slides to previous slide
     * ====================================================================== */

    Swipster.prototype.prev = function() {
        if (!this.$inner.hasClass('animating')) {
            if (!this.options.basicMode) {
                this.$inner
                    .addClass('animating animate-back')
                    .transitionEnd($.proxy(this._prevAnimationEnd, this));
            } else {
                this._renderPrevSlide();
            }
        }
    };

    Swipster.prototype._prevAnimationEnd = function(event) {
        this.$inner.removeClass('animating animate-back');
        this._renderPrevSlide();
    };

    /* ======================================================================
     * Public gotoSlide(index) Method, goes to specific slide
     * ====================================================================== */

    Swipster.prototype.gotoSlide = function(index) {
        this._setIndex(index)
        this._renderSlides();
        this._renderIndicators();
        this._renderCounter();
    };

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
    Swipster.prototype.supports = function(p, rp) {
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
    };

    /* ======================================================================
     * Some render functions
     * ====================================================================== */

    Swipster.prototype._renderSlides = function() {
        /**
         * It seems as if jQuery is smart. If prev and next is the same jQuery will
         * see them as the same slide. This means that it will first set the html of
         * prev slide and then move it to next.
         *
         * This will result in a blank prev slide. Cloning the slide is the initial
         * solution, but it seems to affect performance.
         *
         * @TODO: Fix issue with going backwards if there is only two slides.
         */
        switch(this.currentIndex) {
            case this.slides.length - 1:
                this.$prevSlide.html(this.slides[this.slides.length - 2]);
                this.$currentSlide.html(this.slides[this.slides.length - 1]);
                this.$nextSlide.html(this.slides[0]);

                break;

            case 0:
                this.$prevSlide.html(this.slides[this.slides.length - 1]);
                this.$currentSlide.html(this.slides[this.currentIndex]);
                this.$nextSlide.html(this.slides[this.currentIndex + 1]);

                break;

            default:
                this.$prevSlide.html(this.slides[this.currentIndex - 1]);
                this.$currentSlide.html(this.slides[this.currentIndex]);
                this.$nextSlide.html(this.slides[this.currentIndex + 1]);

                break;
        }
    };

    Swipster.prototype._renderIndicators = function() {
        this.$indicators.find('.active').removeClass('active');
        this.$indicators.find('[data-goto-slide=' + (this.currentIndex + 1) + ']').addClass('active');
    };

    Swipster.prototype._renderCounter = function() {
        this.$counterIndex.text(this.currentIndex + 1);
    };

    Swipster.prototype._renderNextSlide = function() {
        this._incrementIndex();
        this._renderSlides();
        this._renderIndicators();
        this._renderCounter();
    };

    Swipster.prototype._renderPrevSlide = function() {
        this._decrementIndex();
        this._renderSlides();
        this._renderIndicators();
        this._renderCounter();
    };

    /* ======================================================================
     * Some nice helpers
     * ====================================================================== */

    Swipster.prototype._incrementIndex = function() {
        this.currentIndex++;

        if (this.currentIndex >= this.slides.length) {
            this.currentIndex = 0;
        }
    };

    Swipster.prototype._decrementIndex = function() {
        this.currentIndex--;

        if (this.currentIndex < 0) {
            this.currentIndex = this.slides.length - 1;
        }
    };

    Swipster.prototype._setIndex = function(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentIndex = index;
        }
    };

    Swipster.prototype._setNextSlideContent = function(index) {
        this.$nextSlide.html(this._getSlideHTML(this.slides[index]));
    };

    Swipster.prototype._setPrevSlideContent = function(index) {
        this.$prevSlide.html(this._getSlideHTML(this.slides[index]));
    };

    Swipster.prototype._getSlideHTML = function(element) {
        return $('<p />').append(element).html();
    };
    
    Swipster.prototype.destroy = function() {
        this.$element.off('click', this._handleClick);
        this.$inner.off('touchstart', this._onTouchStart);
        this.$inner.off('touchmove', this._onTouchMove);
        this.$inner.off('touchend', this._onTouchEnd);

        this.$element.prepend(this.slides);
        this.$inner.remove();
        this.$indicators.remove();
        this.$controls.remove();
    };

    return Swipster;
})();


