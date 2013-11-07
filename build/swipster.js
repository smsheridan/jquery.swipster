var Swipster;Swipster=function(){"use strict";function t(t,e){this.element=t,this.$element=$(this.element),this.slides=[],this.numberOfSlides=0,this._maxSlide=0,this._thread=null,this._index={},this.options=$.extend({},s,e),this.options.basicMode=!this._supports("transition"),this.classes={main:"swipster",inner:"swipster__inner",slide:{main:"swipster__slide",current:"swipster__slide--current",next:"swipster__slide--next",prev:"swipster__slide--prev"},controls:{main:"swipster__controls",next:"swipster__control--next",prev:"swipster__control--prev"},indicators:"swipster__indicators",counter:{main:"swipster__counter",current:"swipster__digit--current",total:"swipster__digit--total"}},this.init()}var s={startPosition:0,indicators:!0,controls:!0,counter:!0,basicMode:!1,interval:5e3};return t.prototype={init:function(){this.$element.children().each($.proxy(function(t,s){this.slides[t]=s},this)),this.numberOfSlides=this.slides.length,this._maxSlide=this.numberOfSlides-1,this._setIndex(this.options.startPosition),this.touchObject={startX:0,startY:0,startTimer:0,stopTimer:0,currentX:0,currentY:0,initiated:!1},this.createDOM(),this.bindEvents()},destroy:function(){this.$element.off("click",this._handleClick),this.$inner.off("touchstart",this._onTouchStart),this.$inner.off("touchmove",this._onTouchMove),this.$inner.off("touchend",this._onTouchEnd),this.$element.prepend(this.slides),this.$inner.remove(),this.$indicators.remove(),this.$controls.remove(),this.$counter.remove()},start:function(){this._thread=setInterval($.proxy(function(){this.slideToNext()},this),this.options.interval)},stop:function(){clearInterval(this._thread)},createDOM:function(){var t=this._slideTemplate();this.options.indicators&&(t+=this._indicatorsTemplate()),this.options.controls&&(t+=this._controlsTemplate()),this.options.counter&&(t+=this._counterTemplate()),this.$element.children("."+this.classes.slide.main).remove().end().addClass(this.classes.main).append(t),this.$inner=this.$element.children("."+this.classes.inner),this.$indicators=this.$element.children("."+this.classes.indicators),this.$controls=this.$element.children("."+this.classes.controls.main),this.$counter=this.$element.children("."+this.classes.counter.main)},_slideTemplate:function(){var t,s,e='<div class="'+this.classes.inner+'">';for(t=0;t<this.numberOfSlides;t++)s=this.classes.slide.main,t==this._index.current&&(s=this.classes.slide.current),this._index.next!=this._index.prev&&(t==this._index.next?s=this.classes.slide.next:t==this._index.prev&&(s=this.classes.slide.prev)),e+='<div class="'+s+'">'+this.slides[t].innerHTML+"</div>";return e+"</div>"},_indicatorsTemplate:function(){var t,s,e='<ol class="'+this.classes.indicators+'">';for(t=0;t<this.numberOfSlides;t++)s=t==this._index.current?"active":"",e+='<li class="'+s+'" data-slide-to="'+t+'"></li>';return e+"</ol>"},_controlsTemplate:function(){return'<div class="'+this.classes.controls.main+'"><a href="#next" class="'+this.classes.controls.prev+'"></a><a href="#prev" class="'+this.classes.controls.next+'"></a></div>'},_counterTemplate:function(){return'<div class="'+this.classes.counter.main+'"><span class="'+this.classes.counter.current+'">'+(this._index.current+1)+'</span><span class="divider">/</span><span class="'+this.classes.counter.total+'">'+this.numberOfSlides+"</span></div>"},bindEvents:function(){this.$element.on("click",$.proxy(this._handleClick,this)),this.$inner.on("touchstart",$.proxy(this._onTouchStart,this)),this.$inner.on("touchmove",$.proxy(this._onTouchMove,this)),this.$inner.on("touchend",$.proxy(this._onTouchEnd,this))},_handleClick:function(t){switch(t.type){case"click":var s=$(t.target);s.parent().hasClass(this.classes.indicators)&&(s.hasClass("active")||this.slideTo(s.data("slide-to")),t.preventDefault()),s.hasClass(this.classes.controls.next)&&(this.slideToNext(),t.preventDefault()),s.hasClass(this.classes.controls.prev)&&(this.slideToPrev(),t.preventDefault())}},slideTo:function(t){return this.$inner.hasClass("animating")?!1:(this.options.basicMode?this._gotoNoAnimation(t):this._gotoWithAnimation(t),void 0)},slideToNext:function(){this.slideTo(this._index.current+1)},slideToPrev:function(){this.slideTo(this._index.current-1)},_gotoNoAnimation:function(t){this._setIndex(t),this._renderSlides(),this._renderIndicators(),this._renderCounter()},_gotoWithAnimation:function(t){var s,e,i,n,r;r=[this.classes.slide.main,this.classes.slide.prev,this.classes.slide.next].join(" "),this._index.current<t?(e="animate-to-next",s=this.classes.slide.next):(e="animate-to-prev",s=this.classes.slide.prev),this._setIndex(t),i=this.$inner.children().eq(this._index.current),n=this.$inner.children("."+s),i.hasClass(s)||(n.removeClass(s).addClass(this.classes.slide.main),i.removeClass(r).addClass(s)),this.$inner.addClass("animating "+e).transitionEnd($.proxy(this._animationEnd,this))},_animationEnd:function(){this.$inner.removeClass("animating animate-to-next animate-to-prev"),this._renderSlides(),this._renderIndicators(),this._renderCounter()},_onTouchStart:function(t){this.touchObject.initiated||(this.touchObject.startX=t.originalEvent.touches[0].clientX,this.touchObject.startY=t.originalEvent.touches[0].clientY,this.touchObject.stepsX=0,this.touchObject.stepsY=0,this.touchObject.initiated=!0,this.touchObject.directionLocked=!1,this.touchObject.startTimer=(new Date).getTime())},_onTouchMove:function(t){if(this.touchObject.currentX=t.originalEvent.touches[0].clientX-this.touchObject.startX,this.touchObject.currentY=t.originalEvent.touches[0].clientY-this.touchObject.startY,this.touchObject.stepsX=Math.abs(this.touchObject.currentX),this.touchObject.stepsY=Math.abs(this.touchObject.currentY),!this.touchObject.directionLocked&&this.touchObject.stepsY>this.touchObject.stepsX)return this.touchObject.initiated=!1,void 0;this.touchObject.directionLocked=!0;var s=this.touchObject.currentX;this.$inner.hasClass("animating")||this.$inner.css({transform:"translate3d("+s+"px, 0, 0)"}),t.preventDefault()},_onTouchEnd:function(t){var s;if(this.touchObject.initiated){if(!this.touchObject.directionLocked)return this.$inner.trigger("click"),void 0;this.$inner.hasClass("animating")||(this.touchObject.initiated=!1,this.$inner.addClass("animating"),this.touchObject.stopTimer=(new Date).getTime(),s=this.touchObject.currentX<0?"-100%":"100%",this.touchObject.stepsX<50&&(s="0"),this.$inner.css({transition:"all 0.3s ease",transform:"translate3d("+s+", 0, 0)"}),this.$inner.transitionEnd($.proxy(this._touchAnimationEnd,this))),t.preventDefault()}},_touchAnimationEnd:function(){this.$inner.removeClass("animating"),this.$inner.removeAttr("style"),this.touchObject.stepsX>=50&&(this.touchObject.currentX<0?(this._incrementIndex(),this._renderSlides(),this._renderIndicators(),this._renderCounter()):(this._decrementIndex(),this._renderSlides(),this._renderIndicators(),this._renderCounter()))},_renderSlides:function(){this.$inner.children().each($.proxy(function(t,s){var e=this.classes.slide.main;t==this._index.current&&(e=this.classes.slide.current),this._index.next!=this._index.prev&&(t==this._index.next?e=this.classes.slide.next:t==this._index.prev&&(e=this.classes.slide.prev)),$(s).removeClass([this.classes.slide.main,this.classes.slide.current,this.classes.slide.prev,this.classes.slide.next].join(" ")).addClass(e)},this))},_renderIndicators:function(){this.$indicators.children(".active").removeClass("active").end().children("[data-slide-to="+this._index.current+"]").addClass("active")},_renderCounter:function(){this.$counter.children("."+this.classes.counter.current).text(this._index.current+1)},_incrementIndex:function(){this._setIndex(this._index.current+1)},_decrementIndex:function(){this._setIndex(this._index.current-1)},_setIndex:function(t){var s,e,i=t;i>this._maxSlide?i=0:0>i&&(i=this._maxSlide),s=i-1,0>s&&(s=this._maxSlide),e=i+1,e>this._maxSlide&&(e=0),this._index={prev:s,current:i,next:e}},_supports:function(t,s){var e,i=document.body||document.documentElement,n=i.style;if("undefined"==typeof n)return!1;if("string"==typeof n[t])return s?t:!0;for(v=["Moz","Webkit","Khtml","O","ms","Icab"],t=t.charAt(0).toUpperCase()+t.substr(1),e=0;e<v.length;e++)if("string"==typeof n[v[e]+t])return s?v[e]+t:!0}},t}();