/**
 * dd support for kissy, drag for dd
 * @author: yiminghe@gmail.com
 */
KISSY.add('dd-draggable', function(S) {

    var UA = S.UA,Node = S.Node;

    /*
     拖放纯功能类
     */
    function Draggable() {
        Draggable.superclass.constructor.apply(this, arguments);
        this._init();
    }

    Draggable.ATTRS = {
        /**
         * 拖放节点
         */
        node: {
            setter:function(v) {
                return new Node(v);
            }
        },

        /**
         * handler 集合，注意暂时必须在 node 里面
         */
        handlers:{
            setter:function(vs) {
                if (vs) {
                    for (var i = 0; i < vs.length; i++) {
                        vs[i] = new Node(vs[i]);
                    }
                }
            }
        }
    };

    S.extend(Draggable, S.Base, {

        _init: function() {
            var self = this,
                node = self.get('node'),
                handlers = self.get('handlers');

            if (S.isEmptyObject(handlers)) {
                handlers[node[0].id] = node;
            }

            for (var h in handlers) {
                if (!handlers.hasOwnProperty(h)) continue;
                var hl = handlers[h],
                    ori = hl.css('cursor');
                if (hl[0] != node[0]) {
                    if (!ori || ori === 'auto')
                        hl.css('cursor', 'move');
                }
            }
            node.on('mousedown', self._handleMouseDown, self);
        },

        destroy:function() {
            var self = this,
                node = self.get('node'),
                handlers = self.get('handlers');
            for (var h in handlers) {
                if (!handlers.hasOwnProperty(h)) continue;
                var hl = handlers[h];
                if (hl.css("cursor") == "move") {
                    hl.css("cursor", "auto");
                }
            }
            node.detach('mousedown', self._handleMouseDown, self);
        },

        _check: function(t) {
            var handlers = this.get('handlers');

            for (var h in handlers) {
                if (!handlers.hasOwnProperty(h)) continue;
                if (handlers[h].contains(t)
                    ||
                    //子区域内点击也可以启动
                    handlers[h][0] == t[0]) return true;
            }
            return false;
        },

        /**
         * 鼠标按下时，查看触发源是否是属于 handler 集合，
         * 保存当前状态
         * 通知全局管理器开始作用
         * @param ev
         */
        _handleMouseDown: function(ev) {
            var self = this,
                t = new S.Node(ev.target);
            if (!self._check(t)) return;
            //chrome 阻止了 flash 点击？？
            if (!UA.webkit) {
                //firefox 默认会拖动对象地址
                ev.preventDefault();
            }

            S.DD.DDM._start(self);

            var node = self.get("node"),
                mx = ev.pageX,
                my = ev.pageY,
                nxy = node.offset();
            self.startMousePos = {
                left:mx,
                top:my
            };
            self.startNodePos = nxy;
            self._diff = {
                left:mx - nxy.left,
                top:my - nxy.top
            };
            self.set("diff", self._diff);

        },

        _move: function(ev) {
            var self = this,
                diff = self.get("diff"),
                left = ev.pageX - diff.left,
                top = ev.pageY - diff.top;

            this.fire("drag", {
                left:left,
                top:top
            });
        },

        _end: function() {
            this.fire("dragend");
        },

        _start: function() {
            this.fire("dragstart");
        }

    });

    S.Draggable = Draggable;

}, { host: 'dd' });
