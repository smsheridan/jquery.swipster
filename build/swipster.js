var Swipster;Swipster=function(){function t(t,i){this.element=t,this.slides=[],this.options=$.extend({},e,i),this.currentIndex=this.options.startPosition,this.classes={main:"swipster",inner:"swipster__inner",slide:{main:"swipster__slide",current:"swipster__slide--current",next:"swipster__slide--next",prev:"swipster__slide--prev"},controls:{main:"swipster__controls",next:"swipster__control--next",prev:"swipster__control--prev"},indicators:"swipster__indicators",counter:{main:"swipster__counter"}},this.init()}var e={startPosition:0,indicators:!0,controls:!0,counter:!0,basicMode:!1};return t.prototype.init=function(){this.$element=$(this.element),this.$element.children("."+this.classes.slide.main).each($.proxy(function(t,e){this.slides[t]=e},this)),this.touchObject={startX:0,startY:0,startTimer:0,stopTimer:0,currentX:0,currentY:0,initiated:!1},this.createDOM(),this.bindEvents()},t.prototype.createDOM=function(){var t=this._slideTemplate();this.options.indicators&&(t+=this._indicatorsTemplate()),this.options.controls&&(t+=this._controlsTemplate()),this.options.counter&&(t+=this._counterTemplate()),this.$element.children("."+this.classes.slide.main).remove().end().addClass(this.classes.main).append(t),this.$inner=this.$element.children("."+this.classes.inner),this.$indicators=this.$element.children("."+this.classes.indicators),this.$controls=this.$element.children("."+this.classes.controls.main),this.$currentSlide=this.$element.find("."+this.classes.slide.current),this.$prevSlide=this.$element.find("."+this.classes.slide.prev),this.$nextSlide=this.$element.find("."+this.classes.slide.next),this.$counterIndex=this.$element.find("."+this.classes.counter.main+" .current")},t.prototype._slideTemplate=function(){var t='<div class="'+this.classes.inner+'"><div class="'+this.classes.slide.prev+'">'+$(this.slides[this.slides.length-1]).html()+'</div><div class="'+this.classes.slide.current+'">'+$(this.slides[0]).html()+'</div><div class="'+this.classes.slide.next+'">'+$(this.slides[1]).html()+"</div></div>";return t},t.prototype._indicatorsTemplate=function(){for(var t='<ol class="'+this.classes.indicators+'">',e=0;e<this.slides.length;e++){var i=0==e?'class="active"':"",s=e+1;t+="<li "+i+' data-goto-slide="'+s+'"></li>'}return t+="</ol>"},t.prototype._controlsTemplate=function(){var t='<div class="'+this.classes.controls.main+'"><a href="#next" class="'+this.classes.controls.prev+'"></a><a href="#prev" class="'+this.classes.controls.next+'"></a></div>';return t},t.prototype._counterTemplate=function(){var t='<div class="'+this.classes.counter.main+'"><span class="current">'+(this.currentIndex+1)+'</span><span class="divider">/</span><span class="total">'+this.slides.length+"</span></div>";return t},t.prototype.bindEvents=function(){this.$element.on("click",$.proxy(this._handleClick,this)),$(document).on("keydown",$.proxy(this._handleKeyDown,this)),this.$inner.on("touchstart",$.proxy(this._onTouchStart,this)),this.$inner.on("touchmove",$.proxy(this._onTouchMove,this)),this.$inner.on("touchend",$.proxy(this._onTouchEnd,this))},t.prototype._handleClick=function(t){switch(t.type){case"click":$target=$(t.target),$target.attr("data-goto-slide")&&(this._indicatorClickHandler(t),t.preventDefault()),$target.hasClass(this.classes.controls.next)&&(this.next(),t.preventDefault()),$target.hasClass(this.classes.controls.prev)&&(this.prev(),t.preventDefault())}},t.prototype._indicatorClickHandler=function(t){var e=parseInt($(t.target).attr("data-goto-slide"))-1;$(t.target).hasClass("active")||this.$inner.hasClass("animating")||(this.options.basicMode?this.gotoSlide(slideKey):this.currentIndex<e?(this._setNextSlideContent(e),this._setIndex(e-1),this.$inner.addClass("animating animate-forward").transitionEnd($.proxy(this._nextAnimationEnd,this))):(this._setPrevSlideContent(e),this._setIndex(e+1),this.$inner.addClass("animating animate-back").transitionEnd($.proxy(this._prevAnimationEnd,this))))},t.prototype._handleKeyDown=function(t){var e=39,i=37;switch(t.keyCode){case e:this.next(t);break;case i:this.prev(t)}},t.prototype._onTouchStart=function(t){this.touchObject.initiated||(this.touchObject.startX=t.originalEvent.touches[0].clientX,this.touchObject.startY=t.originalEvent.touches[0].clientY,this.touchObject.stepsX=0,this.touchObject.stepsY=0,this.touchObject.initiated=!0,this.touchObject.directionLocked=!1,this.touchObject.startTimer=(new Date).getTime())},t.prototype._onTouchMove=function(t){if(this.touchObject.currentX=t.originalEvent.touches[0].clientX-this.touchObject.startX,this.touchObject.currentY=t.originalEvent.touches[0].clientY-this.touchObject.startY,this.touchObject.stepsX=Math.abs(this.touchObject.currentX),this.touchObject.stepsY=Math.abs(this.touchObject.currentY),!this.touchObject.directionLocked&&this.touchObject.stepsY>this.touchObject.stepsX)return this.touchObject.initiated=!1,void 0;this.touchObject.directionLocked=!0;var e=this.touchObject.currentX;this.$inner.hasClass("animating")||this.$inner.css({"-webkit-transform":"translate3d("+e+"px, 0, 0)"}),t.preventDefault()},t.prototype._onTouchEnd=function(t){if(this.touchObject.initiated){if(!this.touchObject.directionLocked)return this.$inner.trigger("click"),void 0;if(!this.$inner.hasClass("animating")){if(this.touchObject.initiated=!1,this.$inner.addClass("animating"),this.touchObject.stopTimer=(new Date).getTime(),this.touchObject.currentX<0)var e="-100%";else var e="100%";if(this.touchObject.stepsX<50)var e="0";this.$inner.css({"-webkit-transition":"all 0.3s ease","-webkit-transform":"translate3d("+e+", 0, 0)"}),this.$inner.transitionEnd($.proxy(this._touchAnimationEnd,this))}t.preventDefault()}},t.prototype._touchAnimationEnd=function(){this.$inner.removeClass("animating"),this.$inner.removeAttr("style"),this.touchObject.stepsX>=50&&(this.touchObject.currentX<0?this._renderNextSlide():this._renderPrevSlide())},t.prototype.next=function(){this.$inner.hasClass("animating")||(this.options.basicMode?this._renderNextSlide():this.$inner.addClass("animating animate-forward").transitionEnd($.proxy(this._nextAnimationEnd,this)))},t.prototype._nextAnimationEnd=function(){this.$inner.removeClass("animating animate-forward"),this._renderNextSlide()},t.prototype.prev=function(){this.$inner.hasClass("animating")||(this.options.basicMode?this._renderPrevSlide():this.$inner.addClass("animating animate-back").transitionEnd($.proxy(this._prevAnimationEnd,this)))},t.prototype._prevAnimationEnd=function(){this.$inner.removeClass("animating animate-back"),this._renderPrevSlide()},t.prototype.gotoSlide=function(t){this._setIndex(t),this._renderSlides(),this._renderIndicators()},t.prototype._renderSlides=function(){switch(this.currentIndex){case this.slides.length-1:this.$prevSlide.html(this.slides[this.slides.length-2]),this.$currentSlide.html(this.slides[this.slides.length-1]),this.$nextSlide.html(this.slides[0]);break;case 0:this.$prevSlide.html(this.slides[this.slides.length-1]),this.$currentSlide.html(this.slides[this.currentIndex]),this.$nextSlide.html(this.slides[this.currentIndex+1]);break;default:this.$prevSlide.html(this.slides[this.currentIndex-1]),this.$currentSlide.html(this.slides[this.currentIndex]),this.$nextSlide.html(this.slides[this.currentIndex+1])}},t.prototype._renderIndicators=function(){this.$indicators.find(".active").removeClass("active"),this.$indicators.find("[data-goto-slide="+(this.currentIndex+1)+"]").addClass("active")},t.prototype._renderCounter=function(){this.$counterIndex.text(this.currentIndex+1)},t.prototype._renderNextSlide=function(){this._incrementIndex(),this._renderSlides(),this._renderIndicators(),this._renderCounter()},t.prototype._renderPrevSlide=function(){this._decrementIndex(),this._renderSlides(),this._renderIndicators(),this._renderCounter()},t.prototype._incrementIndex=function(){this.currentIndex++,this.currentIndex>=this.slides.length&&(this.currentIndex=0)},t.prototype._decrementIndex=function(){this.currentIndex--,this.currentIndex<0&&(this.currentIndex=this.slides.length-1)},t.prototype._setIndex=function(t){t>=0&&t<this.slides.length&&(this.currentIndex=t)},t.prototype._setNextSlideContent=function(t){this.$nextSlide.html(this._getSlideHTML(this.slides[t]))},t.prototype._setPrevSlideContent=function(t){this.$prevSlide.html(this._getSlideHTML(this.slides[t]))},t.prototype._getSlideHTML=function(t){return $("<p />").append(t).html()},t.prototype.destroy=function(){this.$element.off("click",this._handleClick),this.$inner.off("touchstart",this._onTouchStart),this.$inner.off("touchmove",this._onTouchMove),this.$inner.off("touchend",this._onTouchEnd),this.$element.prepend(this.slides),this.$inner.remove(),this.$indicators.remove(),this.$controls.remove()},t}();