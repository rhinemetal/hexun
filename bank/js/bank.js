(function($) {
    $.fn.sliding = function(o) {
        return this.each(function() {
            new $jc(this, o);
        });
    };

    var defaults = {
        vertical: false,
        start: 1,
        offset: 1,
        size: null,
        scroll: 3,
        visible: null,
        animation: 'normal',
        easing: 'swing',
        auto: 0,
        wrap: null,
        initCallback: null,
        reloadCallback: null,
        itemLoadCallback: null,
        itemFirstInCallback: null,
        itemFirstOutCallback: null,
        itemLastInCallback: null,
        itemLastOutCallback: null,
        itemVisibleInCallback: null,
        itemVisibleOutCallback: null,
        buttonNextHTML: '<div></div>',
        buttonPrevHTML: '<div></div>',
        buttonNextEvent: 'click',
        buttonPrevEvent: 'click',
        buttonNextCallback: null,
        buttonPrevCallback: null
    };

    $.sliding = function(e, o) {
        this.options    = $.extend({}, defaults, o || {});
        this.locked     = false;
        this.container  = null;
        this.clip       = null;
        this.list       = null;
        this.buttonNext = null;
        this.buttonPrev = null;

        this.wh = !this.options.vertical ? 'width' : 'height';
        this.lt = !this.options.vertical ? 'left' : 'top';

        var skin = '', split = e.className.split(' ');

        for (var i = 0; i < split.length; i++) {
            if (split[i].indexOf('sliding-skin') != -1) {
                $(e).removeClass(split[i]);
                var skin = split[i];
                break;
            }
        }

        if (e.nodeName == 'UL' || e.nodeName == 'OL') {
            this.list = $(e);
            this.container = this.list.parent();

            if (this.container.hasClass('sliding-clip')) {
                if (!this.container.parent().hasClass('sliding-container'))
                    this.container = this.container.wrap('<div></div>');

                this.container = this.container.parent();
            } else if (!this.container.hasClass('sliding-container'))
                this.container = this.list.wrap('<div></div>').parent();
        } else {
            this.container = $(e);
            this.list = $(e).find('>ul,>ol,div>ul,div>ol');
        }

        if (skin != '' && this.container.parent()[0].className.indexOf('sliding-skin') == -1)
        	this.container.wrap('<div class=" '+ skin + '"></div>');

        this.clip = this.list.parent();

        if (!this.clip.length || !this.clip.hasClass('sliding-clip'))
            this.clip = this.list.wrap('<div></div>').parent();

        this.buttonPrev = $('.sliding-prev', this.container);

        if (this.buttonPrev.size() == 0 && this.options.buttonPrevHTML != null)
            this.buttonPrev = this.clip.before(this.options.buttonPrevHTML).prev();

        this.buttonPrev.addClass(this.className('sliding-prev'));

        this.buttonNext = $('.sliding-next', this.container);

        if (this.buttonNext.size() == 0 && this.options.buttonNextHTML != null)
            this.buttonNext = this.clip.before(this.options.buttonNextHTML).prev();

        this.buttonNext.addClass(this.className('sliding-next'));

        this.clip.addClass(this.className('sliding-clip'));
        this.list.addClass(this.className('sliding-list'));
        this.container.addClass(this.className('sliding-container'));

        var di = this.options.visible != null ? Math.ceil(this.clipping() / this.options.visible) : null;
        var li = this.list.children('li');

        var self = this;

        if (li.size() > 0) {
            var wh = 0, i = this.options.offset;
            li.each(function() {
                self.format(this, i++);
                wh += self.dimension(this, di);
            });

            this.list.css(this.wh, wh + 'px');

            if (!o || o.size === undefined)
                this.options.size = li.size();
        }

        this.container.css('display', 'block');
        this.container.append('<div class="sliding-prev-c"></div><div class="sliding-next-c"></div>');
				$(this.buttonPrev).hover(function(event){$(".sliding-prev-c").attr("class","sliding-prev-c1");$(".sliding-next-c").attr("class","sliding-next-c1")},function(){$(".sliding-prev-c1").attr("class","sliding-prev-c");$(".sliding-next-c1").attr("class","sliding-next-c")});
				$(this.buttonNext).hover(function(event){$(".sliding-prev-c").attr("class","sliding-prev-c1");$(".sliding-next-c").attr("class","sliding-next-c1")},function(){$(".sliding-prev-c1").attr("class","sliding-prev-c");$(".sliding-next-c1").attr("class","sliding-next-c")});

        this.funcNext   = function() { self.next(); };
        this.funcPrev   = function() { self.prev(); };
        this.funcResize = function() { self.reload(); };

        if (this.options.initCallback != null)
            this.options.initCallback(this, 'init');

        if ($.browser.safari) {
            this.buttons(false, false);
            $(window).bind('load', function() { self.setup(); });
        } else
            this.setup();
    };

    var $jc = $.sliding;

    $jc.fn = $jc.prototype = {
        sliding: '0'
    };

    $jc.fn.extend = $jc.extend = $.extend;

    $jc.fn.extend({
        setup: function() {
            this.first     = null;
            this.last      = null;
            this.prevFirst = null;
            this.prevLast  = null;
            this.animating = false;
            this.timer     = null;
            this.tail      = null;
            this.inTail    = false;

            if (this.locked)
                return;

            this.list.css(this.lt, this.pos(this.options.offset) + 'px');
            var p = this.pos(this.options.start);
            this.prevFirst = this.prevLast = null;
            this.animate(p, false);

            $(window).unbind('resize', this.funcResize).bind('resize', this.funcResize);
        },

        reset: function() {
            this.list.empty();

            this.list.css(this.lt, '0px');
            this.list.css(this.wh, '10px');

            if (this.options.initCallback != null)
                this.options.initCallback(this, 'reset');

            this.setup();
        },

        reload: function() {
            if (this.tail != null && this.inTail)
                this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) + this.tail);

            this.tail   = null;
            this.inTail = false;

            if (this.options.reloadCallback != null)
                this.options.reloadCallback(this);

            if (this.options.visible != null) {
                var self = this;
                var di = Math.ceil(this.clipping() / this.options.visible), wh = 0, lt = 0;
                $('li', this.list).each(function(i) {
                    wh += self.dimension(this, di);
                    if (i + 1 < self.first)
                        lt = wh;
                });

                this.list.css(this.wh, wh + 'px');
                this.list.css(this.lt, -lt + 'px');
            }

            this.scroll(this.first, false);
        },

        lock: function() {
            this.locked = true;
            this.buttons();
        },

        unlock: function() {
            this.locked = false;
            this.buttons();
        },

        size: function(s) {
            if (s != undefined) {
                this.options.size = s;
                if (!this.locked)
                    this.buttons();
            }

            return this.options.size;
        },

        has: function(i, i2) {
            if (i2 == undefined || !i2)
                i2 = i;

            if (this.options.size !== null && i2 > this.options.size)
            	i2 = this.options.size;

            for (var j = i; j <= i2; j++) {
                var e = this.get(j);
                if (!e.length || e.hasClass('sliding-item-placeholder'))
                    return false;
            }

            return true;
        },

        get: function(i) {
            return $('.sliding-item-' + i, this.list);
        },

        add: function(i, s) {
            var e = this.get(i), old = 0, add = 0;

            if (e.length == 0) {
                var c, e = this.create(i), j = $jc.intval(i);
                while (c = this.get(--j)) {
                    if (j <= 0 || c.length) {
                        j <= 0 ? this.list.prepend(e) : c.after(e);
                        break;
                    }
                }
            } else
                old = this.dimension(e);

            e.removeClass(this.className('sliding-item-placeholder'));
            typeof s == 'string' ? e.html(s) : e.empty().append(s);

            var di = this.options.visible != null ? Math.ceil(this.clipping() / this.options.visible) : null;
            var wh = this.dimension(e, di) - old;

            if (i > 0 && i < this.first)
                this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) - wh + 'px');

            this.list.css(this.wh, $jc.intval(this.list.css(this.wh)) + wh + 'px');

            return e;
        },

        remove: function(i) {
            var e = this.get(i);

            if (!e.length || (i >= this.first && i <= this.last))
                return;

            var d = this.dimension(e);

            if (i < this.first)
                this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) + d + 'px');

            e.remove();

            this.list.css(this.wh, $jc.intval(this.list.css(this.wh)) - d + 'px');
        },

        next: function() {
            this.stopAuto();

            if (this.tail != null && !this.inTail)
                this.scrollTail(false);
            else
                this.scroll(((this.options.wrap == 'both' || this.options.wrap == 'last') && this.options.size != null && this.last == this.options.size) ? 1 : this.first + this.options.scroll);
        },

        prev: function() {
            this.stopAuto();

            if (this.tail != null && this.inTail)
                this.scrollTail(true);
            else
                this.scroll(((this.options.wrap == 'both' || this.options.wrap == 'first') && this.options.size != null && this.first == 1) ? this.options.size : this.first - this.options.scroll);
        },

        scrollTail: function(b) {
            if (this.locked || this.animating || !this.tail)
                return;

            var pos  = $jc.intval(this.list.css(this.lt));

            !b ? pos -= this.tail : pos += this.tail;
            this.inTail = !b;

            this.prevFirst = this.first;
            this.prevLast  = this.last;

            this.animate(pos);
        },

        scroll: function(i, a) {
            if (this.locked || this.animating)
                return;

            this.animate(this.pos(i), a);
        },

        pos: function(i) {
            if (this.locked || this.animating)
                return;

            i = $jc.intval(i);
            if (this.options.wrap != 'circular')
                i = i < 1 ? 1 : (this.options.size && i > this.options.size ? this.options.size : i);

            var back = this.first > i;
            var pos  = $jc.intval(this.list.css(this.lt));

            var f = this.options.wrap != 'circular' && this.first <= 1 ? 1 : this.first;
            var c = back ? this.get(f) : this.get(this.last);
            var j = back ? f : f - 1;
            var e = null, l = 0, p = false, d = 0;

            while (back ? --j >= i : ++j < i) {
                e = this.get(j);
                p = !e.length;
                if (e.length == 0) {
                    e = this.create(j).addClass(this.className('sliding-item-placeholder'));
                    c[back ? 'before' : 'after' ](e);
                }

                c = e;
                d = this.dimension(e);

                if (p)
                    l += d;

                if (this.first != null && (this.options.wrap == 'circular' || (j >= 1 && (this.options.size == null || j <= this.options.size))))
                    pos = back ? pos + d : pos - d;
            }

            var clipping = this.clipping();
            var cache = [];
            var visible = 0, j = i, v = 0;
            var c = this.get(i - 1);

            while (++visible) {
                e = this.get(j);
                p = !e.length;
                if (e.length == 0) {
                    e = this.create(j).addClass(this.className('sliding-item-placeholder'));
                    c.length == 0 ? this.list.prepend(e) : c[back ? 'before' : 'after' ](e);
                }

                c = e;
                var d = this.dimension(e);
                if (d == 0) {
                    return 0;
                }

                if (this.options.wrap != 'circular' && this.options.size !== null && j > this.options.size)
                    cache.push(e);
                else if (p)
                    l += d;

                v += d;

                if (v >= clipping)
                    break;

                j++;
            }

            for (var x = 0; x < cache.length; x++)
                cache[x].remove();

            if (l > 0) {
                this.list.css(this.wh, this.dimension(this.list) + l + 'px');

                if (back) {
                    pos -= l;
                    this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) - l + 'px');
                }
            }

            var last = i + visible - 1;
            if (this.options.wrap != 'circular' && this.options.size && last > this.options.size)
                last = this.options.size;

            if (j > last) {
                visible = 0, j = last, v = 0;
                while (++visible) {
                    var e = this.get(j--);
                    if (!e.length)
                        break;
                    v += this.dimension(e);
                    if (v >= clipping)
                        break;
                }
            }

            var first = last - visible + 1;
            if (this.options.wrap != 'circular' && first < 1)
                first = 1;

            if (this.inTail && back) {
                pos += this.tail;
                this.inTail = false;
            }

            this.tail = null;
            if (this.options.wrap != 'circular' && last == this.options.size && (last - visible + 1) >= 1) {
                var m = $jc.margin(this.get(last), !this.options.vertical ? 'marginRight' : 'marginBottom');
                if ((v - m) > clipping)
                    this.tail = v - clipping - m;
            }

            while (i-- > first)
                pos += this.dimension(this.get(i));

            this.prevFirst = this.first;
            this.prevLast  = this.last;
            this.first     = first;
            this.last      = last;

            return pos;
        },

        animate: function(p, a) {
            if (this.locked || this.animating)
                return;

            this.animating = true;

            var self = this;
            var scrolled = function() {
                self.animating = false;

                if (p == 0)
                    self.list.css(self.lt,  0);

                if (self.options.wrap == 'both' || self.options.wrap == 'last' || self.options.size == null || self.last < self.options.size)
                    self.startAuto();

                self.buttons();
                self.notify('onAfterAnimation');
            };

            this.notify('onBeforeAnimation');

            if (!this.options.animation || a == false) {
                this.list.css(this.lt, p + 'px');
                scrolled();
            } else {
                var o = !this.options.vertical ? {'left': p} : {'top': p};
                this.list.animate(o, this.options.animation, this.options.easing, scrolled);
            }
        },

        startAuto: function(s) {
            if (s != undefined)
                this.options.auto = s;

            if (this.options.auto == 0)
                return this.stopAuto();

            if (this.timer != null)
                return;

            var self = this;
            this.timer = setTimeout(function() { self.next(); }, this.options.auto * 1000);
        },

        stopAuto: function() {
            if (this.timer == null)
                return;

            clearTimeout(this.timer);
            this.timer = null;
        },

        buttons: function(n, p) {
            if (n == undefined || n == null) {
                var n = !this.locked && this.options.size !== 0 && ((this.options.wrap && this.options.wrap != 'first') || this.options.size == null || this.last < this.options.size);
                if (!this.locked && (!this.options.wrap || this.options.wrap == 'first') && this.options.size != null && this.last >= this.options.size)
                    n = this.tail != null && !this.inTail;
            }

            if (p == undefined || p == null) {
                var p = !this.locked && this.options.size !== 0 && ((this.options.wrap && this.options.wrap != 'last') || this.first > 1);
                if (!this.locked && (!this.options.wrap || this.options.wrap == 'last') && this.options.size != null && this.first == 1)
                    p = this.tail != null && this.inTail;
            }

            var self = this;

            this.buttonNext[n ? 'bind' : 'unbind'](this.options.buttonNextEvent, this.funcNext)[n ? 'removeClass' : 'addClass'](this.className('sliding-next-disabled')).attr('disabled', n ? false : true);
            this.buttonPrev[p ? 'bind' : 'unbind'](this.options.buttonPrevEvent, this.funcPrev)[p ? 'removeClass' : 'addClass'](this.className('sliding-prev-disabled')).attr('disabled', p ? false : true);

            if (this.buttonNext.length > 0 && (this.buttonNext[0].jcarouselstate == undefined || this.buttonNext[0].jcarouselstate != n) && this.options.buttonNextCallback != null) {
                this.buttonNext.each(function() { self.options.buttonNextCallback(self, this, n); });
                this.buttonNext[0].jcarouselstate = n;
            }

            if (this.buttonPrev.length > 0 && (this.buttonPrev[0].jcarouselstate == undefined || this.buttonPrev[0].jcarouselstate != p) && this.options.buttonPrevCallback != null) {
                this.buttonPrev.each(function() { self.options.buttonPrevCallback(self, this, p); });
                this.buttonPrev[0].jcarouselstate = p;
            }
        },

        notify: function(evt) {
            var state = this.prevFirst == null ? 'init' : (this.prevFirst < this.first ? 'next' : 'prev');

            this.callback('itemLoadCallback', evt, state);

            if (this.prevFirst !== this.first) {
                this.callback('itemFirstInCallback', evt, state, this.first);
                this.callback('itemFirstOutCallback', evt, state, this.prevFirst);
            }

            if (this.prevLast !== this.last) {
                this.callback('itemLastInCallback', evt, state, this.last);
                this.callback('itemLastOutCallback', evt, state, this.prevLast);
            }

            this.callback('itemVisibleInCallback', evt, state, this.first, this.last, this.prevFirst, this.prevLast);
            this.callback('itemVisibleOutCallback', evt, state, this.prevFirst, this.prevLast, this.first, this.last);
        },

        callback: function(cb, evt, state, i1, i2, i3, i4) {
            if (this.options[cb] == undefined || (typeof this.options[cb] != 'object' && evt != 'onAfterAnimation'))
                return;

            var callback = typeof this.options[cb] == 'object' ? this.options[cb][evt] : this.options[cb];

            if (!$.isFunction(callback))
                return;

            var self = this;

            if (i1 === undefined)
                callback(self, state, evt);
            else if (i2 === undefined)
                this.get(i1).each(function() { callback(self, this, i1, state, evt); });
            else {
                for (var i = i1; i <= i2; i++)
                    if (i !== null && !(i >= i3 && i <= i4))
                        this.get(i).each(function() { callback(self, this, i, state, evt); });
            }
        },

        create: function(i) {
            return this.format('<li></li>', i);
        },

        format: function(e, i) {
            var $e = $(e).addClass(this.className('sliding-item')).addClass(this.className('sliding-item-' + i));
            $e.attr('slidingindex', i);
            return $e;
        },

        className: function(c) {
            return c + ' ' + c + (!this.options.vertical ? '-horizontal' : '-vertical');
        },

        dimension: function(e, d) {
            var el = e.jquery != undefined ? e[0] : e;

            var old = !this.options.vertical ?
                el.offsetWidth + $jc.margin(el, 'marginLeft') + $jc.margin(el, 'marginRight') :
                el.offsetHeight + $jc.margin(el, 'marginTop') + $jc.margin(el, 'marginBottom');

            if (d == undefined || old == d)
                return old;

            var w = !this.options.vertical ?
                d - $jc.margin(el, 'marginLeft') - $jc.margin(el, 'marginRight') :
                d - $jc.margin(el, 'marginTop') - $jc.margin(el, 'marginBottom');

            $(el).css(this.wh, w + 'px');

            return this.dimension(el);
        },

        clipping: function() {
            return !this.options.vertical ?
                this.clip[0].offsetWidth - $jc.intval(this.clip.css('borderLeftWidth')) - $jc.intval(this.clip.css('borderRightWidth')) :
                this.clip[0].offsetHeight - $jc.intval(this.clip.css('borderTopWidth')) - $jc.intval(this.clip.css('borderBottomWidth'));
        },

        index: function(i, s) {
            if (s == undefined)
                s = this.options.size;

            return Math.round((((i-1) / s) - Math.floor((i-1) / s)) * s) + 1;
        }
    });

    $jc.extend({
        defaults: function(d) {
            return $.extend(defaults, d || {});
        },

        margin: function(e, p) {
            if (!e)
                return 0;

            var el = e.jquery != undefined ? e[0] : e;

            if (p == 'marginRight' && $.browser.safari) {
                var old = {'display': 'block', 'float': 'none', 'width': 'auto'}, oWidth, oWidth2;

                $.swap(el, old, function() { oWidth = el.offsetWidth; });

                old['marginRight'] = 0;
                $.swap(el, old, function() { oWidth2 = el.offsetWidth; });

                return oWidth2 - oWidth;
            }

            return $jc.intval($.css(el, p));
        },

        intval: function(v) {
            v = parseInt(v);
            return isNaN(v) ? 0 : v;
        }
    });

})(jQuery);

var MO = function(){
	var M$ = function(id){return document.getElementById(id)}, M$$ = function(c,p){return p.getElementsByTagName(c)};
	var FocusPic = function(o) {
		this.setting      = typeof o === 'object' ? o : {};
		this.target       = this.setting.targetElement;
		this.showControls = this.setting.showControls || false;
		this.timer        = null;
		this.currentTime  = null;
		this.ms           = 40;
		this.autoMs       = 3000;
		this.iTarget      = 0;
		this.nextTarget   = 0;
		this.speed        = 0;
		this.init();
		this.handleEvent();
	};
	FocusPic.prototype = {
		init: function() {
			this.obj      = M$(this.target);
			this.oUl      = M$$("ul",this.obj)[0];
			this.aUlLis   = M$$("li",this.oUl);
			this.width    = this.aUlLis[0].offsetWidth;
			this.number   = this.aUlLis.length;
			this.oUl.style.width = this.width * this.number + 'px';
			if(this.showControls) {
				this.oPrev = document.createElement('a');
				this.oNext = document.createElement('a');
				this.oPrevBg = document.createElement('div');
				this.oNextBg = document.createElement('div');
				this.oPrev.setAttribute("href","javascript:void(0)");
				this.oPrev.setAttribute("href","javascript:void(0)");
				this.oNext.setAttribute("target","_self");
				this.oPrev.setAttribute("target","_self");
				this.oPrev.setAttribute("onfocus","this.blur()");
				this.oNext.setAttribute("onfocus","this.blur()");
				this.oPrev.className = 'prev';
				this.oPrev.innerHTML = '&nbsp;';
				this.oPrevBg.className = 'prevBg';
				this.oPrevBg.innerHTML = '&nbsp;';
				this.oNext.className = 'next';
				this.oNext.innerHTML = '&nbsp;';
				this.oNextBg.className = 'nextBg';
				this.oNextBg.innerHTML = '&nbsp;';
				this.obj.appendChild(this.oPrev);
				this.obj.appendChild(this.oNext);
				this.obj.appendChild(this.oPrevBg);
				this.obj.appendChild(this.oNextBg);
			};
		},
		handleEvent: function() {
			var that = this;
			this.currentTime = setInterval(function() {
				that.autoPlay();
			}, this.autoMs);
			this.addEvent(this.obj, 'mouseover', function() {
				clearInterval(that.currentTime);
			});
			this.addEvent(this.obj, 'mouseout', function() {
				that.currentTime = setInterval(function() {
					that.autoPlay();
				}, that.autoMs);
			});
			if(this.showControls) {
				this.addEvent(this.oPrev, 'click', function() {
					that.fnPrev();
				});
				this.addEvent(this.oNext, 'click', function() {
					that.autoPlay();
				});
			};
		},
		addEvent: function(el, type, fn) {
			if(window.addEventListener) {
				el.addEventListener(type, fn, false);
			}
			else if(window.attachEvent) {
				el.attachEvent('on' + type, fn);
			};
		},
		fnPrev: function() {
			this.nextTarget--;
			if(this.nextTarget < 0) {
				this.nextTarget = this.number - 1;
			};
			this.goTime(this.nextTarget);
		},
		autoPlay: function() {
			this.nextTarget++;
			if(this.nextTarget >= this.number) {
				this.nextTarget = 0;
			};
			this.goTime(this.nextTarget);
		},
		goTime: function(index) {
			var that = this;
			this.iTarget = -index * this.width;
			if(this.timer) {
				clearInterval(this.timer);
			};
			this.timer = setInterval(function() {
				that.doMove(that.iTarget);
			}, this.ms);
		},
		doMove: function(target) {
			this.oUl.style.left = this.speed + 'px';
			this.speed += (target - this.oUl.offsetLeft) / 3;
			if(Math.abs(target - this.oUl.offsetLeft) === 0) {
				this.oUl.style.left = target + 'px';
				clearInterval(this.timer);
				this.timer = null;
			};
		}
	};
	return {focuspic:function(o){new FocusPic(o)}};
}



function lccp_jump(fname){
	document.getElementById(fname).target = "_blank";
	document.getElementById(fname).action = "http://data.bank.hexun.com/lccp/AllLccp.aspx?orderMark="+lccp_checkall();
}
function lccp_checkall(){
	try{
	var ret_str = "";
	var checkbox = new Array(document.lccp.lccp_bz,document.lccp.lccp_qx,document.lccp.lccp_lx,document.lccp.lccp_sy);
	for (var m=0;m<checkbox.length;m++ ){
		ret_str += "";
		var tmp = "0";
		for (var i=0;i<checkbox[m].length;i++ ){
			if(checkbox[m][i].checked==true)
				tmp += "1";
			else
				tmp += "0";
		}
		if(tmp=="0000000000"){
			tmp="1000000000";
		}
		else if(tmp=="000000"){
			tmp="100000";
		}
		else if(tmp=="000000000"){
			tmp="100000000";
		}
		else if(tmp=="0000000"){
			tmp="1000000";
		}
		ret_str += tmp+"-";
	}
	return ret_str;
	}
	catch (e)
	{
	return "100000000-100000-100000000-10000000";
	}
}
function jsonp(url,callback){
		var url = (url.indexOf('?') != -1) ? (url + '&') : (url + '?');
		var time = new Date().getTime();
		var name = 'hx_' + time;
		url += 'callback=' + name  ;
		window[name] = callback;		
		var road = document.createElement('script');
		road.type = 'text/javascript';
		road.charset = "gb2312";
		road.src = url;
		document.getElementsByTagName('head')[0].appendChild(road);
		if (road.readyState) {
			road.onreadystatechange = function () {
				if (road.readyState == 'loaded' || road.readyState == 'complete') {
					road.onreadystatechange = null;
					document.getElementsByTagName('head')[0].removeChild(road);
					window[name] = 'undefined';
					try {
						delete window[name];
					}
					catch (e) { }
					}
				}
		} else {
			road.onload = function () {
				document.getElementsByTagName('head')[0].removeChild(road);
				window[name] = 'undefined';
				try { delete window[name]; }
				catch (e) { }
			}
		}
}


var hxBank = {};
hxBank.vb={
	//今日金价换算select
	todayGoldSelectValue:1,
	//default //美元人民币汇率
	tdUSDCNY:7.3572,
	//存款数据
	bankCkData:"",
	//贷款数据
	bankDkData:"",
	//货币计算数据
	ForexDataForSelect:"",
	//默认汇率
	currstr3:"USD",currstr4:"CNY",
	//财报查询默认日期
	odateselectValue:"2014-06-30"
	};
	/*数据接口*/
	hxBank.ports={
	//人民币汇率接口
	inRmburl:"http://quote.forex.hexun.com/rest1/quote_jsonx.ashx?list=USDcny",
	//黄金数据接口
	inGold:"http://quote.forex.hexun.com/rest1/quote_jsonx.ashx?list=XAUUSD",
	//存款汇率接口
	inBankCk:"http://data.bank.hexun.com/rest/yh_ckll_json.ashx",
	//贷款汇率接口
	inBankDk:"http://data.bank.hexun.com/rest/yh_dkll_json.ashx",

	//月度货币供应量
	ydhbgylUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D106M",
	//月度人民币新增贷款
	ydrmbxzdkUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D112M",
	//外汇储备和外汇占款
	whcbhwhzkUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D204M",

	//银行家信心指数
	yhjxxzsUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D113M",
	//银行业景气指数
	yhyjqzsUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D114M",
	//货款需求景气指数
	dkxqjqzsUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D115M",
	//货币政策感受指数
	hbzcgszsUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D116M",
	
	//存款利率
	ckllUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D120M",
	//贷款利率
	dkllUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D121M",
	//人民币汇率
	rmbllUrl:"http://mac.hexun.com/rest/mac_json.ashx?tab=D109D",

	//Shibor
	cjllShiborUrl:"http://data.bank.hexun.com/rest/yh_cjll_hxdefault_json.ashx?b=2&m=1",
	//Libor
	cjllLiborUrl:"http://data.bank.hexun.com/rest/yh_cjll_hxdefault_json.ashx?b=1&m=2",
	//Chibor
	cjllChiborUrl:"http://data.bank.hexun.com/rest/yh_cjll_hxdefault_json.ashx?b=3&m=1",
	//Hibor
	cjllHiborUrl:"http://data.bank.hexun.com/rest/yh_cjll_hxdefault_json.ashx?b=4&m=3",
	//Sibor
	cjllSiborUrl:"http://data.bank.hexun.com/rest/yh_cjll_hxdefault_json.ashx?b=5&m=5",

	//存款储备金率
	ckzbjlUrl:"http://data.bank.hexun.com/rest/yh_ckjl_json.ashx?num=40",
	//银行财务数据
	yhcwsjUrl:"http://data.bank.hexun.com/rest/yh_cwsj_json.ashx?num=40",
	//银行股行情
	yhghqUrl:"http://webstock.quote.hermes.hexun.com/gb/a/quotelist?code=sse601009,sse600036,sse601166,sse600015,sse600000,sse002142,sse601169,sse601818,sse601998,sse600016,sse601988,sse601398,sse601328,szse000001,sse601288&column=code,name,price,Updown,LastClose,Open,High,Low,Volume,Amount"


};


/*--onload--*/
hxBank.onload={
	onload:function(){
		var hbtjsj     = document.getElementById("hbtjsj");				//货币统计数据
		var ydhbgyl    = document.getElementById("ydhbgyl");			//月度货币供应量.按钮
		var ydrmbxzdk  = document.getElementById("ydrmbxzdk");		//月度人民币新增贷款.按钮
		var whcbhwhzk  = document.getElementById("whcbhwhzk");		//外汇储备和外汇占款.按钮
		var jqdczs     = document.getElementById("jqdczs");				//景气调查指数
		var yhjxxzs    = document.getElementById("yhjxxzs");			//银行家信心指数.按钮
		var yhyjqzs    = document.getElementById("yhyjqzs");			//银行业景气指数.按钮
		var dkxqjqzs   = document.getElementById("dkxqjqzs");			//货款需求景气指数.按钮
		var hbzcgszs   = document.getElementById("hbzcgszs");			//货币政策感受指数.按钮
		var lvjlr      = document.getElementById("lvjlr");				//利率及利润
		var ckll       = document.getElementById("ckll");					//存款利率.按钮
		var dkll       = document.getElementById("dkll");					//贷款利率.按钮
		var rmbll      = document.getElementById("rmbll");				//人民币利率.按钮
		var ckzbjl     = document.getElementById("ckzbjl");				//存款储备金率.按钮

		var yhjtycjll  = document.getElementById("yhjtycjll");		//银行间同业拆借利率.按钮
		var cjllShibor = document.getElementById("cjllShibor");		//Shibor(上海银行间同业拆借).按钮
		var cjllLibor  = document.getElementById("cjllLibor");		//Libor(伦敦银行间同业拆借).按钮
		var cjllChibor = document.getElementById("cjllChibor");		//Chibor(中国银行间同业拆借).按钮
		var cjllHibor  = document.getElementById("cjllHibor");		//Hibor(香港银行间同业拆借).按钮
		var cjllSibor  = document.getElementById("cjllSibor");		//Sibor(新加坡银行间同业拆借).按钮

		var yhcwsj     = document.getElementById("yhcwsj");				//银行财务数据.按钮
		var yhghq      = document.getElementById("yhghq");				//银行股行情.按钮

		//获取黄金相关数据
		hxBank.ajaxEval.postAjax(hxBank.ports.inGold,hxBank.right.GetForexData);
		//加载存款汇率
		hxBank.ajaxEval.postAjax(hxBank.ports.inBankCk,hxBank.handEavl.HandleBankSelect);
		//加载贷款汇率
		hxBank.ajaxEval.postAjax(hxBank.ports.inBankDk,hxBank.handEavl.HandleBankSelect);
		//获取人民币汇率赋值给变量
		//hxBank.ajaxEval.postAjax(hxBank.ports.inRmburl,hxBank.right.rmbDdol);
		//加载人民币汇率计算器
		hxBank.right.DefaultCurrVal();
		//其它
		hxBank.other();
		//比特币
		new JinRong({containerID:"btnListQuote",iframeID:"quoteIframe"});
		//焦点图(首屏)
		var focuspic = new MO();
		focuspic.focuspic({"targetElement":"focuspic","showControls":true});
		//焦点图(尾屏)
		var focus2pic = new MO();
		focus2pic.focuspic({"targetElement":"focus2pic","showControls":true});
		//初使化加载 货币统计数据
		hxBankJR.ydhbgyl(hxBank.ports.ydhbgylUrl);


		//货币统计数据
		hbtjsj.onclick = function(){hxBankJR.ydhbgyl(hxBank.ports.ydhbgylUrl)};
		//月度货币供应量
		ydhbgyl.onclick = function(){hxBankJR.ydhbgyl(hxBank.ports.ydhbgylUrl)};
		//月度人民币新增贷款
		ydrmbxzdk.onclick = function(){hxBankJR.ydrmbxzdk(hxBank.ports.ydrmbxzdkUrl)};
		//外汇储备和外汇占款
		whcbhwhzk.onclick = function(){hxBankJR.whcbhwhzk(hxBank.ports.whcbhwhzkUrl)};


		//景气调查指数
		jqdczs.onclick = function(){hxBankJR.yhjxxzs(hxBank.ports.yhjxxzsUrl)};
		//银行家信心指数
		yhjxxzs.onclick = function(){hxBankJR.yhjxxzs(hxBank.ports.yhjxxzsUrl)};
		//银行业景气指数
		yhyjqzs.onclick = function(){hxBankJR.yhyjqzs(hxBank.ports.yhyjqzsUrl)};
		//货款需求景气指数
		dkxqjqzs.onclick = function(){hxBankJR.dkxqjqzs(hxBank.ports.dkxqjqzsUrl)};
		//货币政策感受指数
		hbzcgszs.onclick = function(){hxBankJR.hbzcgszs(hxBank.ports.hbzcgszsUrl)};

		//利率及利润
		lvjlr.onclick = function(){hxBankJR.ckll(hxBank.ports.ckllUrl)};
		//存款利率
		ckll.onclick = function(){hxBankJR.ckll(hxBank.ports.ckllUrl)};
		//贷款利率
		dkll.onclick = function(){hxBankJR.dkll(hxBank.ports.dkllUrl)};
		//人民币利率
		rmbll.onclick = function(){hxBankJR.rmbll(hxBank.ports.rmbllUrl)};

		//加载存款储备金率
		ckzbjl.onclick = function(){hxBankJR.ckzbjl(hxBank.ports.ckzbjlUrl)};

		//银行间同业拆借利率
		yhjtycjll.onclick = function(){hxBankJR.cjll(hxBank.ports.cjllShiborUrl,hxBank.moreUrl.yhjtycjll)};
		//Shibor(上海银行间同业拆借)		
		cjllShibor.onclick = function(){hxBankJR.cjll(hxBank.ports.cjllShiborUrl,hxBank.moreUrl.cjllShibor)};
		//Libor(伦敦银行间同业拆借)
		cjllLibor.onclick = function(){hxBankJR.cjll(hxBank.ports.cjllLiborUrl,hxBank.moreUrl.cjllLibor)};
		//Chibor(中国银行间同业拆借)
		cjllChibor.onclick = function(){hxBankJR.cjll(hxBank.ports.cjllChiborUrl,hxBank.moreUrl.cjllChibor)};
		//Hibor(香港银行间同业拆借)
		cjllHibor.onclick = function(){hxBankJR.cjll(hxBank.ports.cjllHiborUrl,hxBank.moreUrl.cjllHibor)};
		//Sibor(新加坡银行间同业拆借)
		cjllSibor.onclick = function(){hxBankJR.cjll(hxBank.ports.cjllSiborUrl,hxBank.moreUrl.cjllSibor)};
		
		//加载银行财务数据
		yhcwsj.onclick = function(){hxBankJR.yhcwsj(hxBank.ports.yhcwsjUrl)};
		//加载银行股行情
		yhghq.onclick = function(){hxBankJR.yhghq(hxBank.ports.yhghqUrl)};

		$(".phoneNew").append('<a target="_blank" href="http://h03.hxsame.hexun.com/c?z=hexun&amp;la=0&amp;si=1&amp;cg=88&amp;c=1433&amp;ci=78&amp;or=2226&amp;l=15364&amp;bg=15364&amp;b=15577&amp;u=http://mlt01.com/c.htm?pv=1&amp;sp=0,1255546,1287521,66487,0,1,1&amp;target=http://www.srcb.com/html/zt/10zn/index.html"><img src="http://itv.hexun.com/lbi-html/ly/2015sandi/huanan/nongshanghang/yinhangxinwenguanming250x20.jpg" style="position:absolute;top:0px;left:90px;"></a>');
		
};

hxBankJR = {
	//月度货币供应量
	ydhbgyl : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".ydhbgylTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.ydhbgyl)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+data.List[i-1].FMonth+'</p>'+
							'<p class="tr" style="width:140px"><span class="pr10">'+data.List[i-1].S0110+'</span></p>'+
							'<p class="tr" style="width:190px"><span class="pr10">'+data.List[i-1].S0120+'</span></p>'+
							'<p class="tr" style="width:130px"><span class="pr10">'+data.List[i-1].S0210+'</span></p>'+
							'<p class="tr" style="width:203px"><span class="pr10">'+data.List[i-1].S0220+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(385);
		});
	},

	//月度人民币新增贷款
	ydrmbxzdk : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".ydrmbxzdkTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.ydrmbxzdk)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+i+'</p>'+
							'<p class="tr" style="width:120px"><span class="pr10">'+data.List[i-1].FMonth+'</span></p>'+
							'<p class="tr" style="width:220px"><span class="pr10">'+data.List[i-1].S0100+'</span></p>'+
							'<p class="tr" style="width:323px"><span class="pr10">'+data.List[i-1].S0200+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},

	//外汇储备和外汇占款
	whcbhwhzk : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".whcbhwhzkTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.whcbhwhzk)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+data.List[i-1].FMonth+'</p>'+
							'<p class="tr" style="width:170px"><span class="pr10">'+data.List[i-1].S0200+'</span></p>'+
							'<p class="tr" style="width:200px"><span class="pr10">'+data.List[i-1].S0300+'</span></p>'+
							'<p class="tr" style="width:293px"><span class="pr10">'+data.List[i-1].S0400+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},
	
	//银行家信心指数
	yhjxxzs : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".yhjxxzsTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.yhjxxzs)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+i+'</p>'+
							'<p class="tr" style="width:140px"><span class="pr10">'+data.List[i-1].FSeason+'</span></p>'+
							'<p class="tr" style="width:160px"><span class="pr10">'+data.List[i-1].S0100+'</span></p>'+
							'<p class="tr" style="width:170px"><span class="pr10">'+data.List[i-1].S0200+'</span></p>'+
							'<p class="tr" style="width:193px"><span class="pr20">'+data.List[i-1].S0300+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},

	//银行业景气指数
	yhyjqzs : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".yhyjqzsTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.yhyjqzs)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+i+'</p>'+
							'<p class="tr" style="width:85px"><span class="pr10">'+data.List[i-1].FSeason+'</span></p>'+
							'<p class="tr" style="width:80px"><span class="pr10">'+data.List[i-1].S0100+'</span></p>'+
							'<p class="tr" style="width:100px"><span class="pr10">'+data.List[i-1].S0200+'</span></p>'+
							'<p class="tr" style="width:90px"><span class="pr10">'+data.List[i-1].S0300+'</span></p>'+
							'<p class="tr" style="width:90px"><span class="pr10">'+data.List[i-1].S0400+'</span></p>'+
							'<p class="tr" style="width:90px"><span class="pr10">'+data.List[i-1].S0500+'</span></p>'+
							'<p class="tr" style="width:128px"><span class="pr20">'+data.List[i-1].S0600+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},

	//货款需求景气指数
	dkxqjqzs : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".dkxqjqzsTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.dkxqjqzs)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+i+'</p>'+
							'<p class="tr" style="width:85px"><span class="pr10">'+data.List[i-1].FSeason+'</span></p>'+
							'<p class="tr" style="width:80px"><span class="pr10">'+data.List[i-1].S0100+'</span></p>'+
							'<p class="tr" style="width:100px"><span class="pr10">'+data.List[i-1].S0200+'</span></p>'+
							'<p class="tr" style="width:90px"><span class="pr10">'+data.List[i-1].S0300+'</span></p>'+
							'<p class="tr" style="width:90px"><span class="pr10">'+data.List[i-1].S0400+'</span></p>'+
							'<p class="tr" style="width:90px"><span class="pr10">'+data.List[i-1].S0500+'</span></p>'+
							'<p class="tr" style="width:128px"><span class="pr20">'+data.List[i-1].S0600+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},
	
	//货币政策感受指数
	hbzcgszs : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".hbzcgszsTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.hbzcgszs)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+i+'</p>'+
							'<p class="tr" style="width:85px"><span class="pr10">'+data.List[i-1].FSeason+'</span></p>'+
							'<p class="tr" style="width:150px"><span class="pr10">'+data.List[i-1].S0100+'</span></p>'+
							'<p class="tr" style="width:200px"><span class="pr10">'+data.List[i-1].S0200+'</span></p>'+
							'<p class="tr" style="width:228px"><span class="pr60">'+data.List[i-1].S0300+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},
	
	//存款利率
	ckll : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".ckllTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.ckll)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+i+'</p>'+
							'<p class="tc" style="width:90px">'+data.List[i-1].FDate+'</p>'+
							'<p class="tc" style="width:90px">'+data.List[i-1].S0100+'</p>'+
							'<p class="tr" style="width:90px"><span class="pr10">'+data.List[i-1].S0210+'</span></p>'+
							'<p class="tr" style="width:80px"><span class="pr10">'+data.List[i-1].S0220+'</span></p>'+
							'<p class="tr" style="width:80px"><span class="pr10">'+data.List[i-1].S0230+'</span></p>'+
							'<p class="tr" style="width:85px"><span class="pr10">'+data.List[i-1].S0240+'</span></p>'+
							'<p class="tr" style="width:73px"><span class="pr10">'+data.List[i-1].S0250+'</span></p>'+
							'<p class="tr" style="width:75px"><span class="pr10">'+data.List[i-1].S0260+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(385);
		});
	},
	
	//贷款利率
	dkll : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".dkllTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.dkll)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+data.List[i-1].FDate+'</p>'+
							'<p class="tr" style="width:90px">'+data.List[i-1].S0110+'</p>'+
							'<p class="tr" style="width:155px"><span class="pr10">'+data.List[i-1].S0120+'</span></p>'+
							'<p class="tr" style="width:125px"><span class="pr10">'+data.List[i-1].S0210+'</span></p>'+
							'<p class="tr" style="width:130px"><span class="pr10">'+data.List[i-1].S0220+'</span></p>'+
							'<p class="tr" style="width:164px"><span class="pr35">'+data.List[i-1].S0230+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(385);
		});
	},
	
	//人民币汇率
	rmbll : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".rmbllTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.rmbll)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.List.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.List.length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+data.List[i-1].FDate+'</p>'+
							'<p class="tr" style="width:95px">'+data.List[i-1].FB1+'</p>'+
							'<p class="tr" style="width:155px"><span class="pr10">'+data.List[i-1].FEur+'</span></p>'+
							'<p class="tr" style="width:130px"><span class="pr10">'+data.List[i-1].FHkd+'</span></p>'+
							'<p class="tr" style="width:130px"><span class="pr10">'+data.List[i-1].FJpn+'</span></p>'+
							'<p class="tr" style="width:153px"><span class="pr35">'+data.List[i-1].FUsd+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},

	//存款储备金率
	ckzbjl : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".ckzbjlTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.ckcbjl)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.length; i++) {
						carousel.add(i, '<p class="tl" style="width:70px"><span class="pl10">'+data[i-1].rq+'</span></p>'+
							'<p class="tr" style="width:310px"><span class="pr10">'+data[i-1].dxzbjl+'</span></p>'+
							'<p class="tr" style="width:353px"><span class="pr10">'+data[i-1].zxxzbjl+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},

	//银行间同业拆借利率(上海、伦敦、中国、香港、新加坡共用)
	cjll: function(url,moreUrl){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".cjllTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",moreUrl)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.length; i++) {
						carousel.add(i, '<p class="tr" style="width:120px">'+data[i-1].Date+'</p>'+
							'<p class="tr" style="width:170px"><span class="pr10">'+data[i-1].D1+'</span></p>'+
							'<p class="tr" style="width:190px"><span class="'+hxBankJR.fontColor(data[i-1].F1)+'">'+hxBankJR.toDecimal2(data[i-1].F1*100)+'</span></p>'+
							'<p class="tr" style="width:253px"><span class="'+hxBankJR.fontColor(data[i-1].F1)+' pr60">'+data[i-1].E1+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},

	//银行财务数据
	yhcwsj : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".yhcwsjTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.yhcwsj)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.length; i++) {
						carousel.add(i, '<p class="tc" style="width:86px">'+data[i-1].plq+'</p>'+
							'<p class="tc" style="width:70px">'+data[i-1].bname+'</p>'+
							'<p class="tr" style="width:90px"><span class="pr10">'+data[i-1].zzc+'</span></p>'+
							'<p class="tr" style="width:80px"><span class="pr10">'+data[i-1].jlr+'</span></p>'+
							'<p class="tr" style="width:90px"><span class="pr10">'+data[i-1].mgsy+'</span></p>'+
							'<p class="tr" style="width:110px"><span class="pr10">'+data[i-1].zbczl+'</span></p>'+
							'<p class="tr" style="width:110px"><span class="pr10">'+data[i-1].bldkbl+'</span></p>'+
							'<p class="tr" style="width:98px"><span class="pr10">'+data[i-1].bbfgl+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},

	//银行股行情
	yhghq : function(url){
		jsonp(url,function(data){
			$(".dataTableTit").html("<table>"+$(".yhghqTh").html()+"</table>");
			$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
			$("#dataMore").attr("href",hxBank.moreUrl.yhghq)
			$('#dataitem').sliding({
				vertical: true,
				scroll: 3,
				size:data.Data[0].length,
				itemLoadCallback:function(carousel, state){
					for (var i = 1; i <= data.Data[0].length; i++) {
						carousel.add(i, '<p class="tc" style="width:70px">'+data.Data[0][i-1][0]+'</p>'+
							'<p class="tc" style="width:60px">'+data.Data[0][i-1][1]+'</p>'+
							'<p class="tr" style="width:60px">'+hxBankJR.toDecimal2(data.Data[0][i-1][2]/100,2)+'</p>'+
							'<p class="tr" style="width:70px"><span class="'+hxBankJR.fontColor(data.Data[0][i-1][3])+'">'+hxBankJR.toDecimal2(data.Data[0][i-1][3]/100,2)+'</span></p>'+
							'<p class="tr" style="width:70px"><span class="'+hxBankJR.fontColor(data.Data[0][i-1][3])+'">'+hxBankJR.toDecimal2(data.Data[0][i-1][4]/100,2)+'</span></p>'+
							'<p class="tr" style="width:80px"><span class="'+hxBankJR.fontColor(data.Data[0][i-1][3])+'">'+hxBankJR.toDecimal2(data.Data[0][i-1][5]/100,2)+'</span></p>'+
							'<p class="tr" style="width:75px">'+hxBankJR.toDecimal2(data.Data[0][i-1][6]/100,2)+'</p>'+
							'<p class="tr" style="width:70px">'+hxBankJR.toDecimal2(data.Data[0][i-1][7]/100,2)+'</p>'+
							'<p class="tr" style="width:90px">'+data.Data[0][i-1][8]/100+'</p>'+
							'<p class="tr" style="width:88px"><span class="pr10">'+hxBankJR.toDecimal2(data.Data[0][i-1][9]/10000,2)+'</span></p>'
						);
					}
				}
			});
			hxBankJR.loading();
			hxBankJR.setSlidingHeight(420);
		});
	},

	
	setSliding:function(th,sum,callback){
		$(".dataTableTit").html("<table>"+$("."+th).html()+"</table>");
		$(".dataTableCon").html('<ul id="dataitem" class="sliding-skin"></ul>');
		$('#dataitem').sliding({
			vertical: true,
			scroll: 3,
			size:sum,
			itemLoadCallback:callback
		});
		hxBankJR.loading();
	},

	setSlidingHeight:function(h){
		$(".dataTableCon").height(h);$(".sliding-clip-vertical").height(h);
	},

	toDecimal2:function(x){
		var f = parseFloat(x);
		if (isNaN(f)){
			return "--";
		}  
		var f = Math.round(x*100)/100;
		var s = f.toString();
		var rs = s.indexOf('.'); 
		if (rs < 0){
			rs = s.length;
			s += '.';
		}
		while (s.length <= rs + 2){
			s += '0';  
		}
		return s;
	},
	
	loading: function(){
		$(".sliding-clip").append('<div class="loading"></div>');
		$(".loading").fadeTo(2000, 0);
		$(".sliding-skin").animate({opacity:"1"},1500);
		$("#dataMore").animate({opacity:"0"},0).animate({opacity:"1"},1500);
	},
	bindBn:function(){
		$(".dataTableCon").hover(function(event){$(this).find(".sliding-prev,.sliding-next,.sliding-prev-c,.sliding-next-c").show()},function(){$(this).find(".sliding-prev,.sliding-next,.sliding-prev-c,.sliding-next-c").hide()});
	},
	fontColor:function(n){
		var _color ="";
		if (n > 0){
			_color += "red";
		}else if(n < 0){
			_color += "green";
		}
		return _color;  
	}

}

hxBank.moreUrl = {
	hbtjsj    : "http://mac.hexun.com/Default.shtml?id=D106M",	//货币统计数据
	ydhbgyl   : "http://mac.hexun.com/Default.shtml?id=D106M",	//月度货币供应量
	ydrmbxzdk : "http://mac.hexun.com/Default.shtml?id=D112M",	//月度人民币新增贷款
	whcbhwhzk : "http://mac.hexun.com/Default.shtml?id=D",			//外汇储备和外汇占款
	jqdczs    : "http://mac.hexun.com/Default.shtml?id=D113M",	//景气调查指数
	yhjxxzs   : "http://mac.hexun.com/Default.shtml?id=D113M",	//银行家信心指数
	yhyjqzs   : "http://mac.hexun.com/Default.shtml?id=D114M",	//银行业景气指数
	dkxqjqzs  : "http://mac.hexun.com/Default.shtml?id=D115M",	//贷款需求景气指数
	hbzcgszs  : "http://mac.hexun.com/Default.shtml?id=D116M",	//货币政策感受指数
	lljlr     : "http://mac.hexun.com/Default.shtml?id=D120M",	//利率及利润
	ckll      : "http://mac.hexun.com/Default.shtml?id=D120M",	//存款利率
	dkll      : "http://mac.hexun.com/Default.shtml?id=D121M",	//贷款利率
	rmbll     : "http://mac.hexun.com/Default.shtml?id=D109D",	//人民币利率
	ckcbjl    : "http://data.bank.hexun.com/ckjl/ckjl.aspx",		//存款储备金率
	yhjtycjll : "http://data.bank.hexun.com/yhcj/cj.aspx?r=1000000000000000&t=21&typeMark1=8&timeMark1=1",	//银行间同业拆借利率
	cjllShibor: "http://data.bank.hexun.com/yhcj/cj.aspx?r=1000000000000000&t=21&typeMark1=8&timeMark1=1",  //Shibor(上海银行间同业拆借)
	cjllLibor : "http://data.bank.hexun.com/yhcj/cj.aspx?r=1000000000000000&t=12&typeMark1=2&timeMark1=1",  //Libor(伦敦银行间同业拆借)
	cjllChibor: "http://data.bank.hexun.com/yhcj/cj.aspx?r=1000000000000000&t=31&typeMark1=9&timeMark1=1",  //Chibor(中国银行间同业拆借)
	cjllHibor : "http://data.bank.hexun.com/yhcj/cj.aspx?r=0000100000000000&t=43&typeMark1=10&timeMark1=1", //Hibor(香港银行间同业拆借)
	cjllSibor : "http://data.bank.hexun.com/yhcj/cj.aspx?r=0000100000000000&t=55&typeMark1=11&timeMark1=1", //Sibor(新加坡银行间同业拆借)
	yhcwsj    : "http://data.bank.hexun.com/cwsj/yhcwsj.aspx",	//银行财务数据
	yhghq     : "http://quote.hexun.com/default.htm#stock"			//银行股行情
}


hxBank.other = function(){
	$(".searchProduct dd").click(function(event){
		if ($(this).hasClass("cur")){
			$(this).removeClass("cur");
			$(this).children("input").removeAttr('checked');
		}else {
			$(this).addClass("cur");
			$(this).children("input").attr('checked','checked');
		}
	});
	$(".className").click(function(event){
		$(this).addClass("s");
		$(this).siblings("").removeClass("s");
	});

	$(".subtitle li").click(function(event){
		$(this).addClass("ss");
		$(this).siblings("").removeClass("ss");
	});

	$(".hsk .del").click(function(event){
		$(this).hide();
		$(this).siblings(".code").hide();
		$(this).parent().css({"background":"none","height":"auto","border":"none"});
	});
	$(".hsk .hsktext").hover(function(event){
		$(this).siblings(".code").show();
		$(this).siblings(".del").show();
		$(this).parent().css({"background":"#fff","height":"163px","border":"1px solid #DEDEDE"});
	});
	$(".app").hover(function(event){$("#app2code1").show()});
	$(".phoneNew .a1").hover(function(event){
		$("#app2code2").show();
	});
	$("#app2code1 .del").click(function(event){
		$("#app2code1").hide();
		event.stopPropagation(); 
	});
	$("#app2code2 .del").click(function(event){
		$("#app2code2").hide();
		event.stopPropagation(); 
	});
	$(".sliding-item").hover(function(event){
		$(this).css({"background":"red"});
	},function(){
		$(this).css({"background":"#fff"});
	});
	$('#dataitem li').live('mouseover', 'li', function(){$(this).css({"background":"#F9FAFE"});});
	$('#dataitem li').live('mouseout', 'li', function(){$(this).css({"background":"#fff"});});
	
	hxBankJR.bindBn();

}


/*封装ajax*/
hxBank.ajaxEval={
	SetAjax:function(option){
		jQuery.ajax({dataType: "jsonp", type: "get", url:option.urlstr, success: function (str) {
				option.getresult(str);
			},
			error: function (msg) {
				option.getresult(msg);
			}
		});
	},
	postAjax:function(url,result){
		if(result!=""){
			try{
			var hs=eval(result)
			var option = {urlstr:url,getresult:function(data) {hs(data) }};
			}catch(e)
			{
			var option = {urlstr:url,getresult:function(data) {}};
			}
			}else
			{
			var option = {urlstr:url,getresult:function(data) {}};
			}
			this.SetAjax(option);
    }
};

/*回调函数*/
hxBank.handEavl={
	//银行汇率加载后
	HandleBankSelect:function(data){
		if(data.hq)
		{
			hxBank.vb.bankCkData = data;
			$("#bankclv").html(parseFloat(data.zczq1y).toFixed(2));
		}
		if(data.data1)
		{
			hxBank.vb.bankDkData = data;
			$("#bankdlv").html(parseFloat(data.data2).toFixed(2));
		}
	}
};


/*模拟select选择后返回*/
hxBank.HaveSele={
	cdEval:function(str){//存款select选中后bind
		var arrA=[];
		var arrB=[];
		if(str=="存款"){
			//$("#bankcklay").show();
			//$("#bankdklay").hide();
			$("#bankqx .s-name").html("选择期限");
			$("#banklx .s-name").html("选择类型");
			arrA.push('<li valt="3个月"><a href="javascript:void(0)"  target="_self">3个月</a></li><li valt="6个月"><a href="javascript:void(0)" target="_self">6个月</a></li><li valt="1年"><a href="javascript:void(0)" target="_self">1年</a></li><li valt="2年"><a href="javascript:void(0)" target="_self">2年</a></li><li valt="3年"><a href="javascript:void(0)" target="_self">3年</a></li><li valt="4年"><a href="javascript:void(0)" target="_self">4年</a></li><li valt="5年"><a href="javascript:void(0)" target="_self">5年</a></li>');
			$("#bankqxlist").html(arrA.join(''));
			arrB.push('<li valt="1"><a href="javascript:void(0)" target="_self">整存整取</a></li><li valt="2"><a href="javascript:void(0)" target="_self">零存整取</a></li>');
			$("#banklxlist").html(arrB.join(''));
		}
		if(str=="贷款"){
			//$("#bankdklay").show();
			//$("#bankcklay").hide();
			$("#bankqx .s-name").html("选择期限");
			$("#banklx .s-name").html("选择类型");
			arrA.push('<li valt="6个月内"><a href="javascript:void(0)" target="_self">6个月内</a></li><li valt="6个月至1年"><a href="javascript:void(0)" target="_self">6个月至1年</a></li><li valt="1年至3年"><a href="javascript:void(0)" target="_self">1年至3年</a></li><li valt="3年至5年"><a href="javascript:void(0)" target="_self">3年至5年</a></li><li valt="5年以上"><a href="javascript:void(0)" target="_self">5年以上</a></li>');
			$("#bankqxlist").html(arrA.join(''));
			arrB.push('<li valt="1"><a href="javascript:void(0)" target="_self">一般贷款</a></li><li valt="2"><a href="javascript:void(0)" target="_self">公积金贷款</a></li>');
			$("#banklxlist").html(arrB.join(''));
		}
	},
	bankEval:function(value){
		$("#con-bank-phone").find("span").html(value)
	},
	todayGoldType:function(val){
		hxBank.vb.todayGoldSelectValue=val;
			 if(val==1)
				{
				$("#toPriceRk").html("人民币/克");
				 }else
				{
				$("#toPriceRk").html("美元/盎司");
				 }
	},
	curreval:function(str){
		hxBank.vb.currstr3=str;
		hxBank.right.selFx(4,3);
		$("#bsRate").val(hxBank.right.Format6(parseFloat($("#exRate3").val())/parseFloat($("#exRate4").val())));	
	},
	curr2eval:function(str){
		hxBank.vb.currstr4=str;
		hxBank.right.selFx(4,4);
		$("#bsRate").val(hxBank.right.Format6(parseFloat($("#exRate3").val())/parseFloat($("#exRate4").val())));
	},
	cjresult:function(str){
		hxBank.vb.odateselectValue=str;
	}
};


/*右侧函数*/
hxBank.right={	
//黄金白银相关功能
GetForexData:function(data){//处理黄金白银dom
			var _data=data[0];
			var _upDown=_data.UpDown || _data.UpDownPrice;
			if(!_upDown){_upDown=0}
			var obj={
				price:_data.Price,
				upDown:_upDown
			};
	 hxBank.right.todayGold(obj.price,obj.upDown);
	},
rmbDdol:function(str){
	hxBank.vb.tdUSDCNY = parseFloat(str[0].Price);
		if($("#rmbddoll"))
		{
		$("#rmbddoll").html(hxBank.vb.tdUSDCNY);
		}
},
todayGold:function(price,updown){
		var _img = "http://www.hexun.com/images/con_r_gold_xup.jpg";
		if(updown>=0)
		{
			$("#lcal").css("color","#a00");
		}else
		{
			$("#lcal").css("color","#090");
			_img="http://www.hexun.com/images/con_r_gold_xdown.jpg";
		}
				$("#toPriceIco").html("<img src="+_img+" />")
				var dollar =hxBank.vb.tdUSDCNY;
				$("#bcal").val(price);
				var m1 = document.getElementById("bcal").value;
				var tmp = m1 * dollar / 31.1035;
				$("#lcal").html(Math.round(parseFloat(tmp)*100)/100);
	
},
todayGoldgo:function(){
		var dollar =hxBank.vb.tdUSDCNY;
		var m1 = document.getElementById("bcal").value;
		 m1 = parseInt(m1);
			if(!isNaN(m1)){
				if(hxBank.vb.todayGoldSelectValue==1)
				{
				var tmp = m1 * dollar / 31.1035;
				}
				else
				{
				var tmp = m1 / dollar * 31.1035;
				}
				
				$("#lcal").html(Math.round(parseFloat(tmp)*100)/100);
				}else{
				alert("必须数字！");
				}
},
//存款贷款相关功能
bankSeach:function(){
	//查询利率
	var oIpt1=$("#bankck .s-name").html();//存款
	var oIpt2=$("#bankqx .s-name").html();//期限
	var oIpt3=$("#banklx .s-name").html();//类型
		if(oIpt2=="选择期限")
		{
			alert("您还未选择期限");
		}
		else if(oIpt3=="选择类型")
		{
			alert("您还未选择类型");
		}else
		{
			if(oIpt1=="存款")
			{
					var str="3m"
					switch(oIpt2)
					{
						case "3个月":
						str = "3m";
						break;
						case "6个月":
						str = "6m";
						break;
						case "1年":
						str = "1y";
						break;
						case "2年":
						str = "2y";
						break;
						case "3年":
						str = "3y";
						break;
						case "4年":
						str = "4y";
						break;
						case "5年":
						str = "5y";
						break;
						default:
					}
				if(oIpt3=="整存整取")
				{
					this.getBamlSeacRsult("zczq"+str,"ck")
				}
				if(oIpt3=="零存整取")
				{
					this.getBamlSeacRsult("lczq"+str,"ck")
				}
			}
			if(oIpt1=="贷款")
			{
					var str="1"
					switch(oIpt2)
					{
						case "6个月内":
						str = "1";
						break;
						case "6个月至1年":
						str = "2";
						break;
						case "1年至3年":
						str = "3";
						break;
						case "3年至5年":
						str = "4";
						break;
						case "5年以上":
						str = "5";
						break;
						default:
					}
				if(oIpt3=="一般贷款")
				{
					this.getBamlSeacRsult("data"+str,"dk")
				}
				if(oIpt3=="公积金贷款")
				{
					if(str<5)
					{
					this.getBamlSeacRsult("data6","dk")
					}
					else
					{
					this.getBamlSeacRsult("data7","dk")
					}
				}
			}
		}
	},
getBamlSeacRsult:function(str,type)
	{
		if(type=="ck")
		{ 
		$("#bankdklay").hide();
		 if(hxBank.vb.bankCkData[str]=="" || typeof(hxBank.vb.bankCkData[str])=="undefined")
		 {
			 $("#bankclv").html("--");
		 }else
		 {
		 $("#bankclv").html(hxBank.vb.bankCkData[str]);
		 }
		 $("#bankcklay").show();
		}
		if(type=="dk")
		{ 
		$("#bankcklay").hide();
		 if(hxBank.vb.bankDkData[str]=="" || typeof(hxBank.vb.bankDkData[str])=="undefined")
		 {
			 $("#bankdlv").html("--");
		 }else
		 {
		 $("#bankdlv").html(hxBank.vb.bankDkData[str]);
		 }
		 $("#bankdklay").show();
		}
		$("#banktxt").html($("#bankqx .s-name").html()+"利率：");
	},
//汇率计算器相关
Format6:function(myFloat){
	return Math.round(myFloat*Math.pow(10,6))/Math.pow(10,6);
},
DefaultCurrVal:function(){
	var exr=parseFloat(100.0000);
	var exr1=hxBank.right.Format6(parseFloat(this.GetCurrCountData('USD',1)));
	var exr2 =hxBank.right.Format6(parseFloat(this.GetCurrCountData('USD',1))/parseFloat(100.0000));
	$("#exRate3").val(exr1);
	$("#exRate4").val(exr);
	$("#bsRate").val(exr2);
	$("#rmbddoll").html(exr2);//默认汇率赋值
	$("#curr-txt").val("1");
},
//货币计算
currCount:function(){
		var A = parseFloat($("#curr-txt").val()),
		R = parseFloat($("#bsRate").val());
		var C= '<font style="color:#a00">可兑换：</font><font style="font:20px/20px Arial;color:#a00" >'+hxBank.right.Format6( A * R )+'</font>'+" <font style='font:12px/20px Microsoft Yahei; font-weight:bold'>"+$("#curr2box").find(".s-name").html()+"</font>";
		$("#currCountResult").html(C);
},
//处理json数据
GetCurrCountData:function(code,num){
		for(var i=0;i<ForexDataForSelect.length;i++)
		{
			
			if(ForexDataForSelect[i].code==code)
			{
				
				switch(num.toString())
				{
					case "1":
					return ForexDataForSelect[i].data1;
					break;
					case "2":
					return ForexDataForSelect[i].data2;
					break;
					case "3":
					return ForexDataForSelect[i].data3;
					break;
					case "4":
					return ForexDataForSelect[i].data4;
					break;
					case "5":
					return ForexDataForSelect[i].data5;
					break;
					default:
					return ForexDataForSelect[i].data1;
				}
				
			}
		}
	},
selFx:function(m,n)
	{
		var currstr = "";
		n==3?currstr=hxBank.vb.currstr3:currstr=hxBank.vb.currstr4;
		$("#unit"+n).html(currstr);
		if (m==4){
		  switch(currstr){
			  case "CNY":
			  $("#exRate"+n).val(100);
			  break
			  case "GBP":
			  $("#exRate"+n).val(this.GetCurrCountData('GBP',1));
			  break
			  case "HKD":
			  $("#exRate"+n).val(this.GetCurrCountData('HKD',1));
			  break
			  case "USD":
			  $("#exRate"+n).val(this.GetCurrCountData('USD',1));
			  break
			  case "CHF":
			  $("#exRate"+n).val(this.GetCurrCountData('CHF',1));
			  break
			  case "SGD":
			  $("#exRate"+n).val(this.GetCurrCountData('SGD',1));
			  break
			  case "SEK":
			  $("#exRate"+n).val(this.GetCurrCountData('SEK',1));
			  break
			  case "DKK":
			  $("#exRate"+n).val(this.GetCurrCountData('DKK',1));
			  break
			  case "NOK":
			  $("#exRate"+n).val(this.GetCurrCountData('NOK',1));
			  break
			  case "JPY":
			  $("#exRate"+n).val(this.GetCurrCountData('JPY',1));
			  break
			  case "CAD":
			  $("#exRate"+n).val(this.GetCurrCountData('CAD',1)) ;
			  break
			  case "AUD":
			  $("#exRate"+n).val(this.GetCurrCountData('AUD',1)) ;
			  break
			  case "EUR":
			  $("#exRate"+n).val(this.GetCurrCountData('EUR',1));
			  break
			  case "MOP":
			  $("#exRate"+n).val(this.GetCurrCountData('MOP',1));
			  break
			  case "PHP":
			  $("#exRate"+n).val(this.GetCurrCountData('PHP',1));
			  break
			  case "THB":
			  $("#exRate"+n).val(this.GetCurrCountData('THB',1));
			  break
			  case "NZD":
			  $("#exRate"+n).val(this.GetCurrCountData('NZD',1));
			  break
			  case "KRW":
			  $("#exRate"+n).val(this.GetCurrCountData('KRW',1));
			  break
			  case "RUB":
			  $("#exRate"+n).val(this.GetCurrCountData('RUB',1));
			  break
		  }
		}
	}
};


hxBank.top={
	selectMenuList:function(fid,zid,result,w)
	{
		if(typeof(w)!="undefined" && w!=0 && w!="")
		{
			$("#"+zid).css("width",w);
		}
		else
		{
		$("#"+zid).css("width",$("#"+fid).width());
		}
		//模拟select特效
		if($("#"+zid).height() > 99 && zid!="sitlist")
		{
			$("#"+zid).css("height","99");
			$("#"+zid).css("overflow-y","auto");
			$("#"+zid).css("overflow-x","hidden");
		}
		$("#"+fid).addClass("hover");
		if($("#"+zid).css("display")=="block")
		{
		hxBank.top.mousout($("#"+fid),$("#"+zid));
		}
		else
		{
		$("#"+zid).slideDown(1);
		}
		$("#"+zid+" li").click(function(){
		var $this = $(this);
		$("#"+fid).find(".s-name").html($this.find("a").html());
		hxBank.top.mousout($("#"+fid),$(".hover #"+zid));
		if(typeof(result)!="undefined" && w!="")
		{
			try{
		hxBank.top.setResltEval($this.attr("valt"),result) 
			}catch(e)
			{
				//alert(e)
			}
		}
		 });
		$("#"+fid).mouseleave(function(){
		hxBank.top.mousout($("#"+fid),$("#"+zid));
		});
		$(document).click(function (e) {
				var drag = $("#"+fid),
					dragel = $("#"+fid)[0],
					target = e.target;
				if (dragel !== target && !$.contains(dragel, target)) {
					$("#"+zid).hide();
				}});
		return false;
	},
setResltEval:function(value,result)
	{
		var hs=eval(result)//回调函数
		var option ={ret:function(data){hs(data)}};
		option.ret(value);
	},
mousout:function(lid,tid){
		var timer;
		clearTimeout(timer);
		timer = setTimeout(function(){lid.removeClass("hover");tid.hide();},200);
		tid.hover(function(){
			clearTimeout(timer);
		});
	}

};

var JinRong=function(option){
	this.containerID=option && option.containerID;
	this.iframeID=option && option.iframeID;
	this.container=this.getID(this.containerID);
	this.iframe=this.getID(this.iframeID);
	this.init();
}
JinRong.prototype={
	init:function(){
		this.bindEvent();
	},
	codeList:{
		"0":{
			code:"Btcchina_BTC",
			market:"BTCOIN",
			e:"btc"
		},
		"1":{
			code:"Btcchina_LTC",
			market:"BTCOIN",
			e:"btc"
		},
		"2":{
			code:"Huobi_BTC",
			market:"BTCOIN",
			e:"btc"
		}
	},
	bindEvent:function(){
		var container=this.container;
		var btnList=container.getElementsByTagName("div");
		var _this=this;
		for(var i=0;i<btnList.length;i++){
			btnList[i].currentIndex=i;
			btnList[i].onclick=function(){
				for(var j=0;j<btnList.length;j++){
					btnList[j].className="";
				}
				this.className="current";
				_this.setSrc(this);
			}
		}
	},
	setSrc:function(obj){
		var iframe=this.iframe;
		var c=obj.getAttribute("data-code");
		var m=obj.getAttribute("data-market");
		var e=obj.getAttribute("data-e");
		var _url="http://flash.tool.hexun.com/flash_ma/20140121-24Hour/StockAnalyser24MINI.html?c="+c+"&m="+m+"&e="+e+"&ry=true&width=300&height=150&wmode=Opaque";
		iframe.src=_url;
	},
	getID:function(id){
		return document.getElementById(id);
	}
}

hxBank.onload.onload();

