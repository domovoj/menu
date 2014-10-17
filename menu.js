/*plugin menuImageCms for main menu shop*/
(function ($) {
    $.existsN = function (nabir) {
        return nabir.length > 0 && nabir instanceof jQuery;
    };
    $.exists = function (selector) {
        return $(selector).length > 0 && $(selector) instanceof jQuery;
    };
    var isTouch = 'ontouchstart' in document.documentElement;
    $.expr[':'].regex = function (elem, index, match) {
        var matchParams = match[3].split(','),
                validLabels = /^(data|css):/,
                attr = {
                    method: matchParams[0].match(validLabels) ?
                            matchParams[0].split(':')[0] : 'attr',
                    property: matchParams.shift().replace(validLabels, '')
                },
        regexFlags = 'ig',
                regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g, ''), regexFlags);
        return regex.test($(elem)[attr.method](attr.property));
    };
    var methods = {
        _position: function (menuW, $thisL, dropW, drop, $thisW, sub2, direction) {
            if ((menuW - $thisL < dropW && dropW < menuW && direction !== 'left') || direction === 'right') {
                drop.removeClass('left-drop');
                if (!sub2)
                    drop.css('right', 0).addClass('right-drop');
                else {
                    var right = menuW - $thisW - $thisL;
                    if ($thisL + $thisW < dropW) {
                        right = menuW - dropW;
                    }
                    drop.css('right', right).addClass('right-drop');
                }
            } else if (direction !== 'right' || direction === 'left') {
                drop.removeClass('right-drop');
                if (sub2 && dropW > menuW)
                    drop.css('left', $thisL).addClass('left-drop');
                else if (dropW >= menuW)
                    drop.css('left', 0).addClass('left-drop');
                else
                    drop.css('left', $thisL).addClass('left-drop');
            }
        },
        init: function (options) {
            this.each(function () {
                var menu = $(this);
                if ($.existsN(menu)) {
                    var opt = $.extend({}, $.menu.dP, options, menu.data());
                    menu.data('options', opt);
                    var
                            evLF = opt.evLF,
                            evLS = opt.evLS;

                    var
                            menuW = menu.width(),
                            menuItem = menu.find(opt.item),
                            dropOJ = menu.find(opt.drop),
                            itemMenuL = menuItem.length,
                            timeDurM = opt.duration;

                    //rewrite
                    if (opt.menuCache && !opt.refresh) {
                        menu.find('a').each(function () {//if start without cache and remove active item
                            var $this = $(this);
                            $this.closest('li').removeClass(opt.active);
                            $this.removeClass(opt.active);
                        });
                        var locHref = location.origin + location.pathname,
                                locationHref = opt.otherPage !== undefined ? opt.otherPage : locHref;
                        menu.find('a[href="' + locationHref + '"]').each(function () {
                            var $this = $(this);
                            $this.closest('li').addClass(opt.active);
                            $this.closest('li').addClass(opt.active).prev().addClass(opt.active);
                            $this.addClass(opt.active);
                        });
                    }
                    //rewrite end

                    if (isTouch) {
                        evLF = 'toggle';
                        evLS = 'toggle';
                    }

                    if (!opt.refresh) {
                        if (opt.columnClassPref2) {
                            dropOJ.find(opt.sub3Frame).each(function () {
                                var $this = $(this),
                                        columnsObj = $this.find(':regex(class,' + opt.columnClassPref2 + '([0-9]+))'),
                                        numbColumn = [];
                                columnsObj.each(function (i) {
                                    numbColumn[i] = $(this).attr('class').match(new RegExp(opt.columnClassPref2 + '([0-9]+)'))[0];
                                });
                                numbColumn = $.unique(numbColumn).sort();
                                var numbColumnL = numbColumn.length;
                                if (numbColumnL > 1) {
                                    if ($.inArray('0', numbColumn) === 0) {
                                        numbColumn.shift();
                                        numbColumn.push('0');
                                    }
                                    $.map(numbColumn, function (n, i) {
                                        var currC = columnsObj.filter('.' + n),
                                                classCuurC = currC.first().attr('class');
                                        $this.children().append('<li class="' + classCuurC + '" data-column="' + n + '"><ul></ul></li>');
                                        $this.find('[data-column="' + n + '"]').children().append(currC.clone());
                                        numbColumnL = numbColumnL > opt.maxC ? opt.maxC : numbColumnL;
                                        if (opt.sub2Frame)
                                            $this.addClass('x' + numbColumnL).css('width', numbColumnL * opt.widthColumn);
                                        else {
                                            $this.closest('li').addClass('x' + numbColumnL).attr('data-x', numbColumnL).css('width', numbColumnL * opt.widthColumn);
                                        }
                                    });
                                    columnsObj.remove();
                                }
                            });
                        }
                        if (opt.columnClassPref && !opt.sub2Frame)
                            dropOJ.each(function () {
                                var $this = $(this),
                                        columnsObj = $this.find(':regex(class,' + opt.columnClassPref + '([0-9]|-1+))'),
                                        numbColumn = [];
                                columnsObj.each(function (i) {
                                    numbColumn[i] = $(this).attr('class').match(/([0-9]|-1+)/)[0];
                                });
                                numbColumn = $.unique(numbColumn).sort();
                                var numbColumnL = numbColumn.length;
                                if (numbColumnL === 1 && $.inArray('0', numbColumn) === -1 || numbColumnL > 1) {
                                    if ($.inArray('-1', numbColumn) === 0) {
                                        numbColumn.shift();
                                        numbColumn.push('-1');
                                    }
                                    if ($.inArray('0', numbColumn) === 0) {
                                        numbColumn.shift();
                                        numbColumn.push('0');
                                    }
                                    $.map(numbColumn, function (n, i) {
                                        var $thisLi = columnsObj.filter('.' + opt.columnClassPref + n),
                                                sumx = 0;
                                        $thisLi.each(function () {
                                            var datax = +$(this).attr('data-x');
                                            sumx = parseInt(datax === 0 || !datax ? 1 : datax) > sumx ? parseInt(datax === 0 || !datax ? 1 : datax) : sumx;
                                        });
                                        $this.children().append('<li class="x' + sumx + '" data-column="' + n + '" data-x="' + sumx + '" style="' + (opt.widthColumn * sumx) + 'px;"><ul></ul></li>');
                                        $this.find('[data-column="' + n + '"]').children().append($thisLi.clone());
                                    });
                                    columnsObj.remove();
                                }
                                var sumx = 0;
                                $this.children().children().each(function () {
                                    var datax = +$(this).attr('data-x');
                                    sumx = sumx + parseInt(datax === 0 || !datax ? 1 : datax);
                                });
                                sumx = sumx > opt.maxC ? opt.maxC : sumx;
                                $this.addClass('x' + sumx).css('width', sumx * opt.widthColumn);
                            });
                        menu.trigger('columnRenderComplete.' + $.menu.nS, dropOJ);
                    }
                    var k = [];
                    if (!opt.vertical)
                        menuItem.add(menuItem.find('.helper:first')).css('height', '');

                    var sH = 0;
                    menuItem.each(function (index) {
                        var $this = $(this),
                                $thisW = $this.width(),
                                $thisL = $this.position().left,
                                $thisH = $this.height(),
                                $thisDrop = $this.find(opt.drop);
                        k[index] = false;
                        if ($thisH > sH)
                            sH = $thisH;
                        if ($.existsN($thisDrop)) {
                            menu.css('overflow', 'hidden');
                            var dropW = $thisDrop.show().width();
                            $thisDrop.hide();
                            menu.css('overflow', '');
                            methods._position(menuW, $thisL, dropW, $thisDrop, $thisW, opt.sub2Frame, opt.direction);
                        }
                    });
                    if (!opt.vertical)
                        menuItem.find('.helper:first').add(menuItem).css('height', sH);

                    menu.removeClass(opt.classRemove);
                    var hoverTO = '';

                    if (opt.evLF === 'toggle')
                        evLF = 'click';
                    else
                        evLF = 'mouseenter';
                    if (evLS === 'toggle')
                        evLS = 'click';
                    else
                        evLF = 'mouseleave';

                    menuItem.off('click').off('mouseenter')[evLF](
                            function (e) {
                                var $this = $(this);
                                if (evLF === 'click')
                                    e.stopPropagation();
                                if ($this.data("show") === "no" || !$this.data("show")) {
                                    $this.data("show", "yes");
                                    clearTimeout(hoverTO);
                                    var $thisI = $this.index(),
                                            $thisDrop = $this.find(opt.drop).first();
                                    $this.addClass(opt.hover);
                                    if ($thisI === 0)
                                        $this.addClass('firstH');
                                    if ($thisI === itemMenuL - 1)
                                        $this.addClass('lastH');
                                    if ($(e.relatedTarget).is(menuItem) || $.existsN($(e.relatedTarget).parents(menuItem)))
                                        k[$thisI] = true;
                                    if (k[$thisI]) {
                                        hoverTO = setTimeout(function () {
                                            $thisDrop[opt.effectOn](opt.durationOn, function (e) {
                                                menu.trigger('showDrop.' + $.menu.nS, $thisDrop);
                                                if ($thisDrop.length !== 0)
                                                    menu.addClass(opt.hover);
                                                if (opt.sub2Frame) {
                                                    var listDrop = $thisDrop.children();
                                                    $thisDrop.find(opt.sub2Frame).addClass('is-side');
                                                    listDrop.children().off('click').off('hover')[evLS](function (e) {
                                                        var $this = $(this);
                                                        if (evLS === 'click')
                                                            e.stopPropagation();
                                                        if ($this.data("show") === "no" || !$this.data("show")) {
                                                            $this.data("show", "yes");
                                                            subFrame = $this.find(opt.sub2Frame);
                                                            if (e.type !== 'click' && evLS !== 'click') {
                                                                $this.siblings().removeClass(opt.hover);
                                                            }
                                                            if ($.existsN(subFrame)) {
                                                                if (e.type === 'click' && evLS === 'click') {
                                                                    e.stopPropagation();
                                                                    $this.siblings().filter('.' + opt.hover).click();
                                                                    $this.addClass(opt.hover);
                                                                }
                                                                else
                                                                    $this.has(opt.sub2Frame).addClass(opt.hover);

                                                                $thisDrop.css('width', '');
                                                                listDrop.add(subFrame).css('height', '');
                                                                var dropW = $thisDrop.width(),
                                                                        sumW = dropW + subFrame.width(),
                                                                        subHL2 = subFrame.outerHeight(),
                                                                        dropDH = listDrop.height();
                                                                var addH = listDrop.outerHeight() - dropDH;
                                                                if (subHL2 < dropDH)
                                                                    subHL2 = dropDH;
                                                                if (opt.animatesub3) {
                                                                    listDrop.animate({
                                                                        'height': subHL2
                                                                    }, {
                                                                        queue: false,
                                                                        duration: opt.durationOnS,
                                                                        complete: function () {
                                                                            $thisDrop.animate({
                                                                                'width': sumW,
                                                                                'height': subHL2 + addH
                                                                            }, {
                                                                                queue: false,
                                                                                duration: opt.durationOnS
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    listDrop.css('height', subHL2);
                                                                    $thisDrop.css({
                                                                        'height': subHL2 + addH,
                                                                        'width': sumW
                                                                    });
                                                                }
                                                                subFrame[opt.effectOnS](opt.durationOnS, function () {
                                                                    subFrame.css('height', subHL2);
                                                                });
                                                            }
                                                            else
                                                                return true;
                                                        }
                                                        else {
                                                            $this.data("show", "no");
                                                            if (e.type === 'click' && evLS === 'click') {
                                                                e.stopPropagation();
                                                            }
                                                            var subFrame = $this.find(opt.sub2Frame);
                                                            if ($.existsN(subFrame)) {
                                                                subFrame.hide();
                                                                $thisDrop.css({
                                                                    'width': '',
                                                                    'height': ''
                                                                });
                                                                listDrop.add(subFrame).stop().css('height', '');
                                                                $this.removeClass(opt.hover);
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }, timeDurM);
                                    }
                                }
                                else {
                                    $this.data("show", "no");
                                    var $thisI = $this.index();
                                    k[$thisI] = true;
                                    if ($this.index() === 0)
                                        $this.removeClass('firstH');
                                    if ($this.index() === itemMenuL - 1)
                                        $this.removeClass('lastH');
                                    var $thisDrop = $this.find(opt.drop);
                                    console.log(opt)
                                    if ($.existsN($thisDrop)) {
                                        $thisDrop.stop(true, false)[opt.effectOff](opt.durationOff);
                                    }
                                    $this.removeClass(opt.hover);
                                }
                            });
                    menu.off('mouseenter.' + $.menu.nS).off('mouseleave.' + $.menu.nS).on('mouseenter.' + $.menu.nS, function (e) {
                        timeDurM = 0;
                    }).on('mouseleave.' + $.menu.nS, function (e) {
                        timeDurM = opt.duration;
                    });
                    $('body').off('click.' + $.menu.nS).on('click.' + $.menu.nS, function (e) {

                    }).off('keydown.' + $.menu.nS).on('keydown.' + $.menu.nS, function (e) {
                        if (!e)
                            var e = window.event;
                        if (e.keyCode === 27) {

                        }
                    });
                    dropOJ.find('a').off('click.' + $.menu.nS).on('click.' + $.menu.nS, function (e) {
                        if (evLS === 'click') {
                            if ($.existsN($(this).next()) && opt.sub2Frame) {
                                e.preventDefault();
                                return true;
                            }
                            e.stopPropagation();
                            return true;
                        }
                        else
                            e.stopPropagation();
                    });
                    menuItem.find('a:first').off('click.' + $.menu.nS).on('click.' + $.menu.nS, function (e) {
                        if (!$.existsN($(this).closest(opt.item).find(opt.drop)))
                            e.stopPropagation();
                        if (evLF === 'click' && $.existsN($(this).closest(opt.item).find(opt.drop)))
                            e.preventDefault();
                    });
                }
            }
            );
            return this;
        },
        refresh: function (optionsMenu) {
            methods.init.call(this, $.extend({}, optionsMenu ? optionsMenu : this.data('options'), {refresh: true}));
            return this;
        }
    };
    $.fn.menu = function (method) {
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.menuImageCms');
        }
    };
    $.menuInit = function () {
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
            item: 'li:first',
            direction: null,
            effectOn: 'fadeIn',
            effectOff: 'fadeOut',
            effectOnS: 'fadeIn',
            effectOffS: 'fadeOut',
            duration: 0,
            drop: 'li > ul',
            maxC: 10,
            sub3Frame: 'ul ul',
            columnClassPref: null,
            columnClassPref2: null,
            durationOn: 0,
            durationOff: 0,
            durationOnS: 0,
            animatesub3: false,
            sub2Frame: null,
            evLF: 'hover',
            evLS: 'hover',
            hover: 'hover',
            menuCache: false,
            active: 'active',
            refresh: false,
            otherPage: undefined,
            classRemove: 'not-js',
            vertical: false,
            witdthColumn: 200
        };
        this.setParameters = function (options) {
            $.extend(this.dP, options);
        };
    };
    $.menu = new $.menuInit();
    $(document).ready(function () {
        $('[data-rel="menu"]').menu();
    });
})(jQuery);
/*plugin menuImageCms end*/