/*! Swipster */

var Swipster;

Swipster = (function() {
    function Swipster(options) {
        this.el = options.el;
        this.slides = [];

        this.currentIndex = options.startPosition || 0;
        this.indicators = (typeof options.indicators === 'undefined') ? true : options.indicators;
        this.controls = (typeof options.controls === 'undefined') ? true : options.controls;
        this.counter = (typeof options.counter === 'undefined') ? true : options.counter;
        this.basicMode = (typeof options.basicMode === 'undefined') ? false : options.basicMode;

        this.mainClass = 'swipster';
        this.innerClass = 'swipster__inner';
        this.slideClass = 'swipster__slide';
        this.pageClass = 'swipster__page';
        this.currentPageClass = 'swipster__page--current';
        this.nextPageClass = 'swipster__page--next';
        this.prevPageClass = 'swipster__page--prev';
        this.controlsClass = 'swipster__controls';
        this.buttonPrevClass = 'swipster__button--prev';
        this.buttonNextClass = 'swipster__button--next';
        this.buttonFullScreenClass = 'swipster__button--fullscreen';
        this.indicatorsClass = 'swipster__indicators';
        this.counterClass = 'swipster__counter';
        this.thumbnailsClass = 'swipster__thumbnails';
        this.thumbnailClass = 'swipster__thumbnail';
    }

    Swipster.prototype.init = function() {
        // Bind some jQuery stuff
        this.$el = $(this.el);
        this.$body = $('body');

        // Other variables
        this.$el.find('.' + this.slideClass).each($.proxy(function(i, element) {
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
        this.$el.addClass(this.mainClass);

        this._appendSlides();

        if (this.indicators) {
            this._appendIndicators();
        }

        if (this.controls) {
            this._appendControls();
        }
        
        if (this.counter) {
            this._appendCounter();
        }

        // Bind on elements created dynamically
        this.$inner = this.$el.find('.' + this.innerClass);
        this.$indicators = this.$el.find('.' + this.indicatorsClass);
        this.$controls = this.$el.find('.' + this.controlsClass);
        this.$currentSlide = this.$el.find('.' + this.currentPageClass);
        this.$prevSlide = this.$el.find('.' + this.prevPageClass);
        this.$nextSlide = this.$el.find('.' + this.nextPageClass);
        this.$buttonNext = this.$el.find('.' + this.buttonNextClass);
        this.$buttonPrev = this.$el.find('.' + this.buttonPrevClass);
        this.$counterIndex = this.$el.find('.' + this.counterClass + ' .current');
    };

    Swipster.prototype._appendSlides = function() {
        /**
         * Wierd issue with removing elements with this.$inner.html(''), leads
         * to reference errors in IE. Resulting in slides being added as empty.
         */
        this.$el.find('.' + this.slideClass).each(function() {
            $(this).remove();
        });

        var template = ''
            + '<div class="' + this.innerClass + '">'
                + '<div class="' + this.prevPageClass + '">' + this._getSlideHTML(this.slides[this.slides.length - 1]) + '</div>'
                + '<div class="' + this.currentPageClass + '">' + this._getSlideHTML(this.slides[0]) + '</div>'
                + '<div class="' + this.nextPageClass + '">' + this._getSlideHTML(this.slides[1]) + '</div>'
            + '</div>';

        /**
         * Appending the template allows us to add static resources in the html,
         * like the swipster__fixed stuff.
         */
        this.$el.append(template);
    };

    Swipster.prototype._appendIndicators = function() {
        var template = '<ol class="' + this.indicatorsClass + '">';

        for (var i = 0; i < this.slides.length; i++) {
            var classes = (i == 0 ? 'class="active"' : '');
            var index = i + 1;

            template += '<li ' + classes + ' data-goto-page="' + index + '"></li>';
        }

        template += '</ol>';

        this.$el.append(template);
    };

    Swipster.prototype._appendControls = function() {
        var template = ''
            + '<div class="' + this.controlsClass + '">'
            +   '<a href="#next" class="' + this.buttonPrevClass + '"></a>'
            +   '<a href="#prev" class="' + this.buttonNextClass + '"></a>'
            + '</div>'
        
        this.$el.append(template);
    };
    
    Swipster.prototype._appendCounter = function() {
        var template = ''
            + '<div class="' + this.counterClass + '">'
            +   '<div class="' + this.counterClass + '__wrapper">'
            +     '<span class="current">' + (this.currentIndex + 1) + '</span>'
            +     '<span class="divider"></span>'
            +     '<span class="total">' + this.slides.length + '</span>'
            +   '</div>'
            + '</div>'
        
        this.$el.append(template);
    };

    Swipster.prototype._appendThumbnails = function() {
        var template = '<div class="' + this.thumbnailsClass + '">';

        for (var i = 0; i < this.slides.length; i++) {
            var backgroundImageString = this.slides[i].find('.swipster__background-image').attr('style')
              , startPosition = backgroundImageString.indexOf('\'') + 1
              , endPosition = backgroundImageString.indexOf('\'', startPosition)
              , imageSource = backgroundImageString.substring(startPosition, endPosition);

            template += '<img class="' + this.thumbnailClass + '" src="' + imageSource + '">';
        }

        template += '</div>';

        this.$el.append(template);
    };

    /* ======================================================================
     * Event Binding
     * ====================================================================== */

    /**
     * @TODO: Bind on Swipster main wrapper, delegate events
     */
    Swipster.prototype.bindEvents = function() {
        this.$buttonPrev.on('click', $.proxy(this.prev, this));
        this.$buttonNext.on('click', $.proxy(this.next, this));
        this.$indicators.on('click', 'li', $.proxy(this._indicatorClickHandler, this));
        $(document).on('keydown', $.proxy(this._handleKeyDown, this));

        this.$inner.on('touchstart', $.proxy(this._onTouchStart, this));
        this.$inner.on('touchmove', $.proxy(this._onTouchMove, this));
        this.$inner.on('touchend', $.proxy(this._onTouchEnd, this));
    };

    Swipster.prototype._indicatorClickHandler = function(event) {
        var slideIndex = parseInt($(event.target).attr('data-goto-page')) - 1

        if (!$(event.target).hasClass('active') && !this.$inner.hasClass('animating')) {
            if (!this.basicMode) {
                if (this.currentIndex < slideIndex) {
                    this._setNextSlideContent(slideIndex);
                    this._setIndex(slideIndex - 1);

                    this.$inner
                        .addClass('animating animate-forward')
                        .transitionEnd($.proxy(this._nextAnimationEnd, this));
                } else {
                    this._setPrevSlideContent(slideIndex);
                    this._setIndex(slideIndex + 1);

                    this.$inner
                        .addClass('animating animate-back')
                        .transitionEnd($.proxy(this._prevAnimationEnd, this));
                }
            } else {
                this.gotoSlide(slideKey);    
            }
        }

        event.preventDefault();
    };

    /* ======================================================================
     * Keyboard Navigation
     * ====================================================================== */

    /**
     * @TODO: Add check if current slideshow is in viewport
     */
    Swipster.prototype._handleKeyDown = function(event) {
        if (!this.$inner.hasClass('animating')) {
            var KEY_RIGHTARROW = 39, KEY_LEFTARROW = 37, KEY_ESC = 27;
            
            switch(event.keyCode) {
                case KEY_RIGHTARROW:
                    this.next(event);

                    break;

                case KEY_LEFTARROW:
                    this.prev(event);

                    break;
            }
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

    Swipster.prototype.next = function(event) {
        if (!this.$inner.hasClass('animating')) {
            if (!this.basicMode) {
                this.$inner
                    .addClass('animating animate-forward')
                    .transitionEnd($.proxy(this._nextAnimationEnd, this));
            } else {
                this._renderNextSlide();
            }
        }

        event.preventDefault();
    };

    Swipster.prototype._nextAnimationEnd = function(event) {
        this.$inner.removeClass('animating animate-forward');
        this._renderNextSlide();
    };

    /* ======================================================================
     * Public prev() Method, slides to previous slide
     * ====================================================================== */

    Swipster.prototype.prev = function(event) {
        if (!this.$inner.hasClass('animating')) {
            if (!this.basicMode) {
                this.$inner
                    .addClass('animating animate-back')
                    .transitionEnd($.proxy(this._prevAnimationEnd, this));
            } else {
                this._renderPrevSlide();
            }
        }

        event.preventDefault();
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
        this.$indicators.find('[data-goto-page=' + (this.currentIndex + 1) + ']').addClass('active');
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
        this.$buttonPrev.off('click', this.prev);
        this.$buttonNext.off('click', this.next);
        this.$indicators.off('click', 'li', this._indicatorClickHandler);
        this.$inner.off('touchstart', this._onTouchStart);
        this.$inner.off('touchmove', this._onTouchMove);
        this.$inner.off('touchend', this._onTouchEnd);

        this.$el.prepend(this.slides);
        this.$inner.remove();
        this.$indicators.remove();
        this.$controls.remove();
    };

    return Swipster;
})();


