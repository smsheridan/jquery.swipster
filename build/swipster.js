var Swipster;Swipster=function(){"use strict";function s(s,i){this.element=s,this.$element=$(this.element),this.slides=[],this.numberOfSlides=0,this._maxSlide=0,this._thread=null,this._index={},this.options=$.extend({},e,i),this.options.basicMode=!this._supports("transition"),this.classes={main:"swipster",inner:"swipster__inner",wrapper:"swipster__wrapper",slide:{main:"swipster__slide",current:"swipster__slide--current",next:"swipster__slide--next",prev:"swipster__slide--prev",hidden:"swipster__slide--hidden"},controls:{main:"swipster__controls",next:"swipster__control--next",prev:"swipster__control--prev"},indicators:"swipster__indicators",counter:{main:"swipster__counter",current:"swipster__digit--current",total:"swipster__digit--total"}},this.init()}var e={startPosition:0,indicators:!0,controls:!0,counter:!0,basicMode:!1,interval:5e3};return s.prototype={init:function(){this.$element.children("."+this.classes.slide.main).each($.proxy(function(s,e){this.slides[s]=e},this)),this.numberOfSlides=this.slides.length,this._maxSlide=this.numberOfSlides-1,this._setIndex(this.options.startPosition),this.createDOM(),this.bindEvents()},destroy:function(){this.unbindEvents(),this.destroyDOM()},start:function(){this._thread=setInterval($.proxy(function(){this.slideToNext()},this),this.options.interval)},stop:function(){clearInterval(this._thread)},createDOM:function(){var s=this._slideTemplate();this.options.indicators&&(s+=this._indicatorsTemplate()),this.options.controls&&(s+=this._controlsTemplate()),this.options.counter&&(s+=this._counterTemplate()),this.$element.children("."+this.classes.slide.main).remove().end().addClass(this.classes.main).append(s),this.$inner=this.$element.find("."+this.classes.inner),this.$indicators=this.$element.children("."+this.classes.indicators),this.$controls=this.$element.children("."+this.classes.controls.main),this.$counter=this.$element.children("."+this.classes.counter.main)},destroyDOM:function(){this.$element.prepend(this.slides),this.$inner.remove(),this.$indicators.remove(),this.$controls.remove(),this.$counter.remove()},_slideTemplate:function(){var s,e,i='<div class="'+this.classes.wrapper+'"><div class="'+this.classes.inner+'">';for(s=0;s<this.numberOfSlides;s++)e=this.classes.slide.hidden,s==this._index.current&&(e=this.classes.slide.current),this._index.next!=this._index.prev&&(s==this._index.next?e=this.classes.slide.next:s==this._index.prev&&(e=this.classes.slide.prev)),i+='<div class="'+e+'">'+this.slides[s].innerHTML+"</div>";return i+"</div></div>"},_indicatorsTemplate:function(){var s,e,i='<ol class="'+this.classes.indicators+'">';for(s=0;s<this.numberOfSlides;s++)e=s==this._index.current?"active":"",i+='<li class="'+e+'" data-slide-to="'+s+'"></li>';return i+"</ol>"},_controlsTemplate:function(){return'<div class="'+this.classes.controls.main+'"><a href="#next" class="'+this.classes.controls.prev+'"></a><a href="#prev" class="'+this.classes.controls.next+'"></a></div>'},_counterTemplate:function(){return'<div class="'+this.classes.counter.main+'"><span class="'+this.classes.counter.current+'">'+(this._index.current+1)+'</span><span class="divider">/</span><span class="'+this.classes.counter.total+'">'+this.numberOfSlides+"</span></div>"},bindEvents:function(){this.$element.on("click",$.proxy(this._handleClick,this))},unbindEvents:function(){this.$element.off("click",this._handleClick)},_handleClick:function(s){switch(s.type){case"click":var e=$(s.target);e.parent().hasClass(this.classes.indicators)&&(e.hasClass("active")||this.slideTo(e.data("slide-to")),s.preventDefault()),e.hasClass(this.classes.controls.next)&&(this.slideToNext(),s.preventDefault()),e.hasClass(this.classes.controls.prev)&&(this.slideToPrev(),s.preventDefault())}},slideTo:function(s){return this.$inner.hasClass("animating")?!1:(this.options.basicMode?this._slideToSimple(s):this._slideToAnimation(s),void 0)},slideToNext:function(){this.slideTo(this._index.current+1)},slideToPrev:function(){this.slideTo(this._index.current-1)},_slideToSimple:function(s){var e="";e=this._index.current<s?"-100%":"100%",this._setIndex(s),this.$inner.addClass("animating").animate({left:e},500,$.proxy(function(){this.$inner.removeClass("animating").css("left",""),this._renderAll()},this))},_slideToAnimation:function(s){var e,i,t,n,r;r=[this.classes.slide.hidden,this.classes.slide.prev,this.classes.slide.next].join(" "),this._index.current<s?(i="animate-to-next",e=this.classes.slide.next):(i="animate-to-prev",e=this.classes.slide.prev),this._setIndex(s),t=this.$inner.children().eq(this._index.current),n=this.$inner.children("."+e),t.hasClass(e)||(n.removeClass(e).addClass(this.classes.slide.hidden),t.removeClass(r).addClass(e)),this.$inner.addClass("animating "+i).transitionEnd("transitionend",$.proxy(this._animationEnd,this))},_animationEnd:function(){this.$inner.removeClass("animating animate-to-next animate-to-prev"),this._renderAll()},_renderSlides:function(){this.$inner.children().each($.proxy(function(s,e){var i=this.classes.slide.hidden;s==this._index.current&&(i=this.classes.slide.current),this._index.next!=this._index.prev&&(s==this._index.next?i=this.classes.slide.next:s==this._index.prev&&(i=this.classes.slide.prev)),$(e).removeClass([this.classes.slide.hidden,this.classes.slide.current,this.classes.slide.prev,this.classes.slide.next].join(" ")).addClass(i)},this))},_renderIndicators:function(){return this.options.indicators?(this.$indicators.children(".active").removeClass("active").end().children("[data-slide-to="+this._index.current+"]").addClass("active"),void 0):!1},_renderCounter:function(){return this.options.counter?(this.$counter.children("."+this.classes.counter.current).text(this._index.current+1),void 0):!1},_renderAll:function(){this._renderSlides(),this._renderIndicators(),this._renderCounter()},_incrementIndex:function(){this._setIndex(this._index.current+1)},_decrementIndex:function(){this._setIndex(this._index.current-1)},_setIndex:function(s){var e,i,t=s;t>this._maxSlide?t=0:0>t&&(t=this._maxSlide),e=t-1,0>e&&(e=this._maxSlide),i=t+1,i>this._maxSlide&&(i=0),this._index={prev:e,current:t,next:i}},_supports:function(s,e){var i,t,n=document.body||document.documentElement,r=n.style;if("undefined"==typeof r)return!1;if("string"==typeof r[s])return e?s:!0;for(i=["Moz","Webkit","Khtml","O","ms","Icab"],s=s.charAt(0).toUpperCase()+s.substr(1),t=0;t<i.length;t++)if("string"==typeof r[i[t]+s])return e?i[t]+s:!0}},s}();