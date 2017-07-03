/**
 * 表格设计器构造函数。
 *
 * @constructor
 */
function QueryBuilder(option) {
    this.container = $('#' + option.containerId);
    this.container.empty();
    this.initialize();
}

/**
 * 初始化所有事件和渲染。
 */
QueryBuilder.prototype.initialize = function () {
    var body = document.body,
        html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight );

    this.container.css('overflow-y', 'scroll');
    this.container.css('height', height + 'px');

    this.table = $('<table>');
    this.table.addClass('table');
    this.table.addClass('table-bordered');
    this.container.append(this.table);

    this.container.on('dragover', function(e) {
        var evt = e.originalEvent;
        evt.preventDefault();
    });
    var self = this;
    this.container.on('drop', function(e) {
        var evt = e.originalEvent;
        evt.preventDefault();
        var id = evt.dataTransfer.getData('text');
        if (id.indexOf('__th__') == 0 || id.indexOf('://') != -1) return;
        var data = $('#' + id).data();
        self.appendColumns(data);
    });

    this.table.on('drop', function(e) {
        var evt = e.originalEvent;
        var id = evt.dataTransfer.getData('text');
        if (id.indexOf('__th__') != 0) return;
        self.sortColumns(id, evt.clientX);
    });
};

/**
 * 添加列到表中。
 *
 * @param data
 *          节点数据
 *
 * @private
 */
QueryBuilder.prototype.appendColumns = function (data) {
    var self = this;
    if (this.container.find('#__th__' + data.id).length > 0) return;
    if (typeof data === 'undefined' || typeof data.children === 'undefined' || data.children.length == 0) {
        var th = $('<th>');
        th.attr('id', '__th__' + data.id);
        th.css('text-align', 'center');
        th.data(data);

        var a = $('<a href="#">');
        a.text(data.name);
        th.append(a);

        var i = $('<i style="margin-left 5px;" class="glyphicon glyphicon-remove"></i>');
        th.append(i);
        i.on('click', function (e) {
            $(this).parent().remove();
        });
        this.table.append(th);

        a.on('dragstart', function (e) {
            e.originalEvent.dataTransfer.setData('text', $(this).parent().attr('id'));
        });

        th.on('drop', function (e) {
            var evt = e.originalEvent;
            var id = evt.dataTransfer.getData('text');
            self.sortColumns(id, evt.clientX);
        });
        return;
    }
    for (var i = 0; i < data.children.length; i++) {
        this.appendColumns(data.children[i]);
    }
};

/**
 * 对列进行排序。
 *
 * @param id {string} - 列标识
 *
 * @param mouseX {integer} - 拖拽实践中最后放下时的鼠标X坐标
 */
QueryBuilder.prototype.sortColumns = function (id, mouseX) {
    var moving = $('#' + id);
    if (moving.prop('tagName') !== 'TH') return;
    moving.remove();
    var table = this.table;

    var before = [];
    var after = [];
    var self = this;
    table.find('th').each(function (idx, el) {
        var th = $(el);
        th.data($(el).data());
        var a = $(th.find('a'))

        // 只有这样才能获取某个元素在窗口中的位置。
        var offset = a.offset(); 
        var clientX = offset.left - $(window).scrollLeft();
        if (clientX >= mouseX) {
            after.push(th);
        } else {
            before.push(th);
        }
    });

    // 重新排序
    table.empty();
    for (var i = 0; i < before.length; i++) {
        table.append(before[i]);
    }
    table.append(moving);
    for (var i = 0; i < after.length; i++) {
        table.append(after[i]);
    }

    // 重置事件
    table.find('th a').each(function (idx, el) {
        $(el).on('dragstart', function (e) {
            ;
            e.originalEvent.dataTransfer.setData('text', $(this).parent().attr('id'));
        });
    });

    table.find('th i').each(function (idx, el) {
        $(el).on('click', function (e) {
            ;
            $(this).parent().remove();
        });
    });
};
