var Swipster;Swipster=function(){function t(t,e){this.element=t,this.$element=$(this.element),this.slides=[],this.thread=null,this.index={},this.options=$.extend({},s,e),this._supports("transition")||(this.options.basicMode=!0),this.classes={main:"swipster",inner:"swipster__inner",slide:{main:"swipster__slide",current:"swipster__slide--current",next:"swipster__slide--next",prev:"swipster__slide--prev"},controls:{main:"swipster__controls",next:"swipster__control--next",prev:"swipster__control--prev"},indicators:"swipster__indicators",counter:{main:"swipster__counter",current:"swipster__digit--current",total:"swipster__digit--total"}},this.init()}var s={startPosition:0,indicators:!0,controls:!0,counter:!0,basicMode:!1,interval:5e3};return t.prototype={init:function(){this.$element.children("."+this.classes.slide.main).each($.proxy(function(t,s){this.slides[t]=s},this)),this.index={prev:this.slides.length-1,current:0,next:1},this.touchObject={startX:0,startY:0,startTimer:0,stopTimer:0,currentX:0,currentY:0,initiated:!1},this.createDOM(),this.bindEvents()},destroy:function(){this.$element.off("click",this._handleClick),this.$inner.off("touchstart",this._onTouchStart),this.$inner.off("touchmove",this._onTouchMove),this.$inner.off("touchend",this._onTouchEnd),this.$element.prepend(this.slides),this.$inner.remove(),this.$indicators.remove(),this.$controls.remove(),this.$counter.remove()},start:function(){this.thread=setInterval($.proxy(function(){this.next()},this),this.options.interval)},stop:function(){clearInterval(this.thread)},createDOM:function(){var t=this._slideTemplate();this.options.indicators&&(t+=this._indicatorsTemplate()),this.options.controls&&(t+=this._controlsTemplate()),this.options.counter&&(t+=this._counterTemplate()),this.$element.children("."+this.classes.slide.main).remove().end().addClass(this.classes.main).append(t),this.$inner=this.$element.children("."+this.classes.inner),this.$currentSlide=this.$inner.children("."+this.classes.slide.current),this.$prevSlide=this.$inner.children("."+this.classes.slide.prev),this.$nextSlide=this.$inner.children("."+this.classes.slide.next),this.$indicators=this.$element.children("."+this.classes.indicators),this.$controls=this.$element.children("."+this.classes.controls.main),this.$counter=this.$element.children("."+this.classes.counter.main)},_slideTemplate:function(){for(var t='<div class="'+this.classes.inner+'">',s=0;s<this.slides.length;s++){var e=this.classes.slide.main;0==s&&(e=this.classes.slide.current),1==s&&s!=this.slides.length-1&&(e=this.classes.slide.next),s==this.slides.length-1&&1!=s&&(e=this.classes.slide.prev),t+='<div class="'+e+'">'+$(this.slides[s]).html()+"</div>"}return t+="</div>"},_indicatorsTemplate:function(){for(var t='<ol class="'+this.classes.indicators+'">',s=0;s<this.slides.length;s++){var e=0==s?'class="active"':"",i=s+1;t+="<li "+e+' data-goto-slide="'+i+'"></li>'}return t+="</ol>"},_controlsTemplate:function(){var t='<div class="'+this.classes.controls.main+'"><a href="#next" class="'+this.classes.controls.prev+'"></a><a href="#prev" class="'+this.classes.controls.next+'"></a></div>';return t},_counterTemplate:function(){var t='<div class="'+this.classes.counter.main+'"><span class="'+this.classes.counter.current+'">'+(this.index.current+1)+'</span><span class="divider">/</span><span class="'+this.classes.counter.total+'">'+this.slides.length+"</span></div>";return t},bindEvents:function(){this.$element.on("click",$.proxy(this._handleClick,this)),$(document).on("keydown",$.proxy(this._handleKeyDown,this)),this.$inner.on("touchstart",$.proxy(this._onTouchStart,this)),this.$inner.on("touchmove",$.proxy(this._onTouchMove,this)),this.$inner.on("touchend",$.proxy(this._onTouchEnd,this))},_handleClick:function(t){switch(t.type){case"click":$target=$(t.target),$target.parent().hasClass(this.classes.indicators)&&($target.hasClass("active")||this.animateToSlide($target.data("goto-slide")),t.preventDefault()),$target.hasClass(this.classes.controls.next)&&(this.next(),t.preventDefault()),$target.hasClass(this.classes.controls.prev)&&(this.prev(),t.preventDefault())}},_handleKeyDown:function(t){var s=39,e=37;switch(t.keyCode){case s:this.next(),t.preventDefault();break;case e:this.prev(),t.preventDefault()}},gotoSlide:function(t){this._setIndex(t),this._renderSlides(),this._renderIndicators(),this._renderCounter()},animateToSlide:function(t){if(this.$inner.hasClass("animating"))return!1;if(t-=1,this.options.basicMode)this.gotoSlide(t);else if(this.index.current<t)this._setNextSlideContent(t),this._setIndex(t-1),this.$inner.addClass("animating animate-forward").transitionEnd($.proxy(this._nextAnimationEnd,this));else{var s=t;t==this.slides.length-1&&(s=0),this._setPrevSlideContent(s),this._setIndex(t+1),this.$inner.addClass("animating animate-back").transitionEnd($.proxy(this._prevAnimationEnd,this))}},next:function(){this.$inner.hasClass("animating")||(this.options.basicMode?this._renderNextSlide():(this.slides.length<3&&(0==this.index.current?this.$inner.children().eq(1).removeClass(this.classes.slide.prev+" "+this.classes.slide.main).addClass(this.classes.slide.next):this.$inner.children().eq(0).removeClass(this.classes.slide.prev+" "+this.classes.slide.main).addClass(this.classes.slide.next)),this.$inner.addClass("animating animate-forward").transitionEnd($.proxy(this._nextAnimationEnd,this))))},_nextAnimationEnd:function(){this.$inner.removeClass("animating animate-forward"),this._renderNextSlide()},prev:function(){this.$inner.hasClass("animating")||(this.options.basicMode?this._renderPrevSlide():(this.slides.length<3&&(0==this.index.current?this.$inner.children().eq(1).removeClass(this.classes.slide.next+" "+this.classes.slide.main).addClass(this.classes.slide.prev):this.$inner.children().eq(0).removeClass(this.classes.slide.next+" "+this.classes.slide.main).addClass(this.classes.slide.prev)),this.$inner.addClass("animating animate-back").transitionEnd($.proxy(this._prevAnimationEnd,this))))},_prevAnimationEnd:function(){this.$inner.removeClass("animating animate-back"),this._renderPrevSlide()},_onTouchStart:function(t){this.touchObject.initiated||(this.touchObject.startX=t.originalEvent.touches[0].clientX,this.touchObject.startY=t.originalEvent.touches[0].clientY,this.touchObject.stepsX=0,this.touchObject.stepsY=0,this.touchObject.initiated=!0,this.touchObject.directionLocked=!1,this.touchObject.startTimer=(new Date).getTime())},_onTouchMove:function(t){if(this.touchObject.currentX=t.originalEvent.touches[0].clientX-this.touchObject.startX,this.touchObject.currentY=t.originalEvent.touches[0].clientY-this.touchObject.startY,this.touchObject.stepsX=Math.abs(this.touchObject.currentX),this.touchObject.stepsY=Math.abs(this.touchObject.currentY),!this.touchObject.directionLocked&&this.touchObject.stepsY>this.touchObject.stepsX)return this.touchObject.initiated=!1,void 0;this.touchObject.directionLocked=!0;var s=this.touchObject.currentX;this.$inner.hasClass("animating")||this.$inner.css({transform:"translate3d("+s+"px, 0, 0)"}),t.preventDefault()},_onTouchEnd:function(t){if(this.touchObject.initiated){if(!this.touchObject.directionLocked)return this.$inner.trigger("click"),void 0;if(!this.$inner.hasClass("animating")){if(this.touchObject.initiated=!1,this.$inner.addClass("animating"),this.touchObject.stopTimer=(new Date).getTime(),this.touchObject.currentX<0)var s="-100%";else var s="100%";if(this.touchObject.stepsX<50)var s="0";this.$inner.css({transition:"all 0.3s ease",transform:"translate3d("+s+", 0, 0)"}),this.$inner.transitionEnd($.proxy(this._touchAnimationEnd,this))}t.preventDefault()}},_touchAnimationEnd:function(){this.$inner.removeClass("animating"),this.$inner.removeAttr("style"),this.touchObject.stepsX>=50&&(this.touchObject.currentX<0?this._renderNextSlide():this._renderPrevSlide())},_renderSlides:function(){var t=this;this.$inner.children().each(function(){$(this).removeClass(t.classes.slide.main+" "+t.classes.slide.current+" "+t.classes.slide.prev+" "+t.classes.slide.next)}),this.$inner.children().eq(this.index.current).addClass(this.classes.slide.current),this.index.prev!=this.index.next&&(this.$inner.children().eq(this.index.next).addClass(this.classes.slide.next),this.$inner.children().eq(this.index.prev).addClass(this.classes.slide.prev)),this.$inner.children().each(function(){$(this).attr("class").length<=0&&$(this).addClass(t.classes.slide.main)})},_renderIndicators:function(){this.$indicators.find(".active").removeClass("active"),this.$indicators.find("[data-goto-slide="+(this.index.current+1)+"]").addClass("active")},_renderCounter:function(){this.$counter.children("."+this.classes.counter.current).text(this.index.current+1)},_renderNextSlide:function(){this._incrementIndex(),this._renderSlides(),this._renderIndicators(),this._renderCounter()},_renderPrevSlide:function(){this._decrementIndex(),this._renderSlides(),this._renderIndicators(),this._renderCounter()},_incrementIndex:function(){this._setIndex(this.index.current+1)},_decrementIndex:function(){this._setIndex(this.index.current-1)},_setIndex:function(t){var s=t;s>this.slides.length-1&&(s=0),0>s&&(s=this.slides.length-1);var e=s-1,i=s+1;0>e&&(e=this.slides.length-1),i>this.slides.length-1&&(i=0),this.index={prev:e,current:s,next:i}},_setNextSlideContent:function(t){var s=this.index.current-this.slides.length+1;this.$inner.children().eq(s).removeClass(this.classes.slide.next).addClass(this.classes.slide.main),this.$inner.children().eq(t).removeClass(this.classes.slide.main).addClass(this.classes.slide.next)},_setPrevSlideContent:function(t){var s=this.index.current-1;this.$inner.children().eq(s).removeClass(this.classes.slide.prev).addClass(this.classes.slide.main),this.$inner.children().eq(t).removeClass(this.classes.slide.main+" "+this.classes.slide.next).addClass(this.classes.slide.prev)},_supports:function(t,s){var e=document.body||document.documentElement,i=e.style;if("undefined"==typeof i)return!1;if("string"==typeof i[t])return s?t:!0;v=["Moz","Webkit","Khtml","O","ms","Icab"],t=t.charAt(0).toUpperCase()+t.substr(1);for(var n=0;n<v.length;n++)if("string"==typeof i[v[n]+t])return s?v[n]+t:!0}},t}();