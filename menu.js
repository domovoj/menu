(function ($) {
    Array.prototype.sortUnique = function () {
        var arr = this.sort(function (a, b) {
            return a * 1 - b * 1;
        });
        var ret = [arr[0]];
        for (var i = 1; i < arr.length; i++)
            if (arr[i - 1] !== arr[i])
                ret.push(arr[i]);
        return ret;
    };
    var actual = function () {
        if (arguments.length && typeof arguments[0] === 'string') {
            var dim = arguments[0],
                clone = this.clone();
            if (arguments[1] === undefined)
                clone.css({
                    position: 'absolute',
                    top: '-9999px'
                }).show().appendTo($('body'));
            var dimS = clone[dim]();
            clone.remove();
            return dimS;
        }
        return undefined;
    };
    var existsN = function (nabir) {
        return nabir.length > 0 && nabir instanceof jQuery;
    };
    var exists = function (selector) {
        return $(selector).length > 0 && $(selector) instanceof jQuery;
    };
    var isTouch = document.createTouch !== undefined;
    var methods = {
        destroy: function () {
            return this.each(function () {
                var menu = $(this);
                if (!existsN(menu) || !menu.data('menu'))
                    return false;

                var opt = menu.data('menu');
                menu.find('a').off('click.' + $.menu.nS);
                for (var i in opt.items) {
                    if (opt.levels[i].triggerOn) {
                        if (isTouch)
                            opt.levels[i].triggerOn = 'click';
                        opt.items[i].off(opt.levels[i].triggerOn + '.' + $.menu.nS);
                    }
                    if (opt.levels[i].triggerOff)
                        opt.items[i].off(opt.levels[i].triggerOff + '.' + $.menu.nS);
                }
                menu.find('[data-column]').each(function () {
                    var $this = $(this);
                    $this.children().children().appendTo($this.parent());
                    $this.remove();
                });

                menu.find('.' + opt.hoverClass).removeClass(opt.hoverClass);
                menu.find('.' + opt.activeClass).removeClass(opt.activeClass);
                menu.find('.' + opt.openClass).removeClass(opt.openClass);
                menu.find('[style]').removeAttr('style');

                menu.removeData('menu');
            });
        },
        init: function (options) {
            return methods.destroy.call(this).each(function () {
                    var menu = $(this);
                    if (!existsN(menu))
                        return false;

                    var opt = $.extend({}, $.menu.dP, options, menu.data());
                    menu.data('menu', opt).css('position', 'relative').attr('data-menu', '');
                    opt.drops = {};
                    opt.items = {};
                    opt.anchors = {};
                    opt.levels = opt.levels || {};

                    //Definition 4 above main objects initialized
                    methods._getElements.call(menu, opt);

                    //set data sub for handler event click for links
                    for (var i in opt.anchors)
                        opt.anchors[i].each(function () {
                            var sub = $(this).closest(opt.items[i]).find(opt.drops[+i + 1]);
                            if (existsN(sub))
                                $(this).data('sub', sub);
                        });

                    methods._outerDefinePosition.call(menu, opt);

                    menu.find('a').off('click.' + $.menu.nS).on('click.' + $.menu.nS, function (e) {
                        if ($(this).data('sub'))
                            e.preventDefault();
                        else
                            e.stopPropagation();
                    });

                    // define columns
                    if (!opt.refresh)
                        for (var i = opt.countLevels - 1; i >= 0; i--) {
                            if (!opt.levels[i].columnClassPref)
                                continue;
                            opt.drops[i].each(function () {
                                var drop = $(this),
                                    columnsObj = drop.find(opt.items[i].filter('[class*=' + opt.levels[i].columnClassPref + ']'));

                                if (!existsN(columnsObj))
                                    return false;

                                var numbColumn = [];

                                columnsObj.each(function (j) {
                                    var $this = $(this);
                                    numbColumn[j] = $this.attr('class').match(new RegExp(opt.levels[i].columnClassPref + '([0-9]|-1+)'))[1];
                                });
                                numbColumn = numbColumn.sortUnique();
                                var numbColumnL = numbColumn.length;

                                numbColumnL = numbColumnL <= opt.levels[i].maxCountColumn ? numbColumnL : opt.levels[i].maxCountColumn;

                                if (numbColumnL === 1 && $.inArray('0', numbColumn) === -1 || numbColumnL > 1) {
                                    if ($.inArray('-1', numbColumn) === 0) {
                                        numbColumn.shift();
                                        numbColumn.push('-1');
                                    }
                                    if ($.inArray('0', numbColumn) === 0) {
                                        numbColumn.shift();
                                        numbColumn.push('0');
                                    }

                                    $.map(numbColumn, function (n, j) {
                                        var currC = columnsObj.filter('.' + opt.levels[i].columnClassPref + n),
                                            $this = $('<' + opt.levels[i].itemColumn + '>', {
                                                'data-column': n,
                                                'style': 'width: ' + opt.levels[i].widthColumn + 'px; box-sizing: content-box;',
                                                'class': opt.levels[i].itemColumnClass
                                            })
                                                .append('<' + opt.levels[i].wrapperColumn + ' class="' + opt.levels[i].wrapperColumnClass + '" style="display: block;">')
                                                .appendTo(drop.css('float', 'left'));

                                        $this.children().append(currC.clone(true));
                                        var w = numbColumnL * opt.levels[i].widthColumn;
                                        drop.css({width: w, 'box-sizing': 'content-box'}).data('width', w);
                                    });
                                    columnsObj.remove();
                                }
                            });
                        }

                    methods._getElements.call(menu, opt);
                    methods._outerDefinePosition.call(menu, opt);

                    //add for items activeClass
                    if (!opt.refresh) {
                        for (var i in opt.anchors)
                            $(opt.anchors[i].removeClass(opt.activeClass).closest(opt.items[i])).removeClass(opt.activeClass);

                        var locHref = opt.otherPage !== undefined ? opt.otherPage : location.origin + location.pathname,
                            itemsActive = $([]);
                        menu.find('a[href="' + locHref + '"]').each(function () {
                            var $this = $(this);
                            for (var i in opt.anchors)
                                if (existsN(opt.anchors[i].filter($this)))
                                    for (var j = i + 1; j >= 0; j--) {
                                        $this.closest(opt.items[j]).addClass(opt.activeClass);
                                        itemsActive = itemsActive.add($this.closest(opt.items[j]));
                                    }
                        });
                    }

                    // set handler for opening and closing
                    for (var i in opt.items)
                        (function (i) {
                            if (opt.levels[i].triggerOn) {
                                if (isTouch)
                                    opt.levels[i].triggerOn = 'click';
                                opt.items[i].off(opt.levels[i].triggerOn + '.' + $.menu.nS).on(opt.levels[i].triggerOn + '.' + $.menu.nS, function (e) {
                                        e.stopPropagation();
                                        var $this = $(this);

                                        if (opt.levels[i].closeIdenticLevel && !$this.data('close'))
                                            methods.hide.call($this.closest(opt.drops[i]).find(opt.items[i]).not($this), i, opt, e);

                                        methods.show.call($this, i, opt, e);
                                    }
                                );
                            }
                            if (opt.levels[+i + 1] && opt.levels[i].triggerOff)
                                opt.items[i].off(opt.levels[i].triggerOff + '.' + $.menu.nS).on(opt.levels[i].triggerOff + '.' + $.menu.nS, function (e) {
                                    e.stopPropagation();
                                    methods.hide.call($(this).data('close', true), i, opt, e);
                                });
                        })(i);

                    //show subs which have active link
                    if (opt.showActive && itemsActive)
                        methods.show.call(itemsActive.data('firstActive', true), null, opt);
                }
            );
        },
        show: function (j, opt, e) {
            if (!existsN(this))
                return false;
            opt = opt ? opt : this.closest('[data-menu]').data('menu');
            return this.addClass(opt.hoverClass).each(function () {
                var $this = $(this),
                    i = j ? j : methods._getIndex.call($this, opt.items),
                    sub = $this.find(opt.drops[+i + 1]);

                if (!existsN(sub))
                    return false;

                (function (i, sub) {
                    methods._clearTimeouts.call($this);

                    $this.data().timeout = setTimeout($.proxy(function () {
                        this.css({
                            'width': this.data('width'),
                            'box-sizing': 'content-box'
                        }).addClass(opt.openClass)[opt.levels[i].effectOn](!j ? 0 : opt.levels[i].durationOn, function () {
                            methods.sizeDrop.call($(this).css('overflow', ''));
                            methods.sizeDrop.call($(this).find('.' + opt.openClass + ':visible').last());
                        });
                    }, sub), !j ? 0 : opt.levels[i].delay);
                })(i, sub);

                i = undefined;
            });
        },
        hide: function () {
            var _hide = arguments.callee;
            if (!existsN(this))
                return false;
            (function (i, opt, e) {
                methods._clearTimeouts.call(this);
                this.data().timeoutClose = setTimeout($.proxy(function () {
                    opt = opt ? opt : $(this).closest('[data-menu]').data('menu');
                    $(this).removeClass(opt.hoverClass).each(function () {
                        i = i ? i : methods._getIndex.call($(this), opt.items);
                        var sub = $(this).find(opt.drops[+i + 1]);

                        if (!existsN(sub))
                            return false;

                        if ($(this).data('firstActive') && !opt.hideActive)
                            return false;

                        (function (i, sub) {
                            sub.removeClass(opt.openClass).stop()[opt.levels[i].effectOff](opt.levels[i].durationOff, function () {
                                var $this = $(this).css({
                                    height: '',
                                    width: '',
                                    'box-sizing': 'content-box'
                                });
                                delete $this.data('close');
                                methods.sizeDrop.call($this.data('parent').filter(':visible'));
                                if (opt.levels[i].closeInsideLevel)
                                    _hide.call($this.find('.' + opt.hoverClass).first());
                            });
                        })(i, sub);

                        i = undefined;
                    });
                }, this), opt.levels[i].delayClose);
            }).apply(this, arguments);
            return this;
        },
        sizeDrop: function () {
            var width = 0,
                height = 0;

            [].reverse.call(this).each(function () {
                var $this = $(this),
                    data = $this.data();

                $this.css({
                    height: '',
                    width: '',
                    'box-sizing': 'content-box'
                });
                if (data.parent) {
                    var h = actual.call($this, 'height');
                    height = height > h ? height : h
                    width = width > data.width ? width : data.width;

                    $this.css({
                        height: height,
                        width: width,
                        'box-sizing': 'content-box'
                    });

                    height += !data.side ? $this.position('top').top : 0;
                    width += data.marginSide ? data.marginSide : 0;

                    if (data.relative)
                        arguments.callee.call(data.parent);
                }
                else {
                    width = 0;
                    height = 0;
                }
            });
        },
        refresh: function (opt) {
            methods.init.call(this, $.extend({}, opt ? opt : this.data('menu'), {
                refresh: true
            }));
            return this;
        },
        _getIndex: function (obj) {
            for (var i in obj)
                if (this.is(obj[i]))
                    return +i;
        },
        _getElements: function (opt) {
            opt.countLevels = 0;
            (function () {
                var level = 0;
                return function (container) {
                    if (existsN(container)) {
                        if (opt.items[level - 1])
                            container = opt.items[level - 1];

                        opt.levels[level] = $.extend({}, $.menu.dP.defaultLevel, opt.defaultLevel, opt.levels[level]);
                        opt.drops[level] = container.find(opt.levels[level].container + ':first');

                        if (opt.drops[level] && existsN(opt.drops[level])) {
                            if (opt.drops[level - 1])
                                opt.drops[level].each(function () {
                                    $(this).data({
                                        parent: $(this).closest(opt.drops[level - 1]),
                                        relative: opt.levels[level].relative,
                                        side: opt.levels[level].side,
                                        level: level
                                    });
                                });

                            opt.drops[level].css({
                                'position': 'absolute',
                                'z-index': level
                            });

                            if (!exists('.menu-item-level' + level))
                                opt.items[level] = opt.drops[level].children().addClass('menu-item-level' + level).css('position', level > 0 ? 'relative' : 'static');
                            else //for second call after render menu columns
                                opt.items[level] = opt.drops[level].find('.menu-item-level' + level).css('position', level > 0 ? 'relative' : 'static');

                            opt.anchors[level] = opt.items[level].find('a:first');
                            level++;
                            opt.countLevels++;
                            arguments.callee(opt.drops[level - 1]);
                        }
                        else {
                            delete opt.levels[level];
                            delete opt.drops[level];
                        }
                    }
                    return false;
                };
            })()(this);
            return this;
        },
        _positionSub: function (pos, opt) {
            for (var i in opt.drops) {
                var children = this.children();

                this.find('[data-column]').css('float', pos);

                if (exists('.menu-item-level' + i))
                    children = this.find('.menu-item-level' + i);

                if (opt.levels[i].side)
                    children.css('position', 'relative');

                this.find(opt.drops[i]).css({'left': 'auto', 'right': 'auto', 'top': 0}).each(function () {
                    var $this = $(this),
                        w = opt.levels[i].widthColumn;

                    if (opt.levels[i].side)
                        $this.css(pos, w).data('marginSide', w);

                    else
                        $this.css('top', '100%');
                });
            }
        },
        _position: function (menu, item, drop, dropsW, opt) {
            var menuW = menu.outerWidth(),
                menuL = menu.offset().left,
                $thisL = item.offset().left,
                $thisW = item.outerWidth(),
                direction = opt.direction;

            drop.removeClass(opt.classPosL).removeClass(opt.classPosR).css({
                'left': 'auto',
                'right': 'auto',
                'position': 'absolute'
            });

            var l = menuW - ($thisL - menuL);
            if ((l < dropsW && l > $thisL - menuL + $thisW || direction === 'left') && direction !== 'right') {
                var left = $thisL - menuL;
                drop.css('left', left).addClass(opt.classPosL);
                methods._positionSub.call(drop, 'left', menu.data('menu'));
            } else if (!direction || direction === 'right') {
                var right = menuW - ($thisL - menuL) - $thisW;
                drop.css({'right': right}).addClass(opt.classPosR);
                methods._positionSub.call(drop, 'right', menu.data('menu'));
            }
        },
        _outerDefinePosition: function (opt) {
            var _self = this;

            opt.items[0].each(function () {
                var $this = $(this),
                    drop = $this.find(opt.drops[1]);

                if (existsN(drop)) {
                    var w = drop.data('width') ? drop.data('width') : opt.levels[0].widthColumn,
                        dropss = drop.data('width', w).css('width', w),
                        sub0 = drop;

                    _self.css('overflow', 'hidden');

                    for (var i = 2; i < opt.countLevels; i++)
                        if (opt.levels && opt.levels[i]) {
                            drop = drop.add(drop.find(opt.drops[i]).first());
                            var _drop = dropss.find(opt.drops[i]),
                                w = _drop.data('width') ? _drop.data('width') : opt.levels[i].widthColumn;
                            _drop.data('width', w).css('width', w);
                        }

                    drop.css('display', 'block');

                    var last = drop.last();
                    methods._position(_self, $this, sub0, last.outerWidth() + Math.abs(last.offset().left), opt);

                    drop.css('display', '');
                    _self.css('overflow', '');
                }
            });
        },
        _clearTimeouts: function () {
            clearTimeout(this.data('timeoutClose'));
            clearTimeout(this.data('timeout'));
            return this;
        }
    };
    $.fn.menu = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.menu');
        }
    };
    function menuInit() {
        this.nS = 'menu';
        this.method = function (m) {
            if (!/_/.test(m))
                return methods[m];
        };
        this.methods = function () {
            var newM = {};
            for (var i in methods) {
                if (!/_/.test(i))
                    newM[i] = methods[i];
            }
            return newM;
        };
        this.dP = {
            defaultLevel: {
                container: 'ul',
                delay: 200,
                delayClose: 100,
                durationOn: 200,
                durationOff: 100,
                effectOn: 'slideDown',
                effectOff: 'slideUp',
                columnClassPref: 'column_',
                itemColumn: 'li',
                itemColumnClass: 'item',
                wrapperColumn: 'ul',
                wrapperColumnClass: 'nav',
                widthColumn: 200,
                maxCountColumn: 5,
                triggerOn: 'mouseenter',
                triggerOff: 'mouseleave',
                relative: true,
                side: false,
                closeIdenticLevel: true,
                closeInsideLevel: false
            },
            direction: null,
            classPosL: 'dropdown-menu-left',
            classPosR: 'dropdown-menu-right',
            hoverClass: 'hover',
            activeClass: 'active',
            openClass: 'open',
            refresh: false,
            showActive: true,
            hideActive: false
        };
        this.setParameters = function (opt) {
            $.extend(this.dP, opt);
        };
    }

    $.menu = new menuInit;
    $(document).ready(function () {
        $('[data-rel="menu"]').menu();
    });
})(jQuery);