

/**
 * 构造声明一个TreeView对象。
 *
 * @param option
 *          配置项
 *
 * @constructor
 */
function TreeView(option) {
    this.container = $("#" + option.containerId);
    // 是否支持过滤数据
    this.filterable = option.filterable || false;
    // 是否支持选择数据
    this.checkable = option.checkable || false;
    // 是否支持本地拖拽排序
    this.sortable = option.sortable || false;
    // 是否支持拖拉
    this.draggable = option.draggable || false;
    // 服务器端链接，数据来源，可以不定义。
    this.url = option.url;
    // 本地数据，数据源，可以不定义。数组对象。
    this.local = option.local || [];
    // 每个节点对应的数据对象中ID的标识
    this.idKey = option.idKey;
    // 每个节点对应的数据对象中文本的标识
    this.textKey = option.textKey;
}

/**
 * 渲染树到指定的容器。
 *
 * @public
 */
TreeView.prototype.render = function () {
    this.container.empty();
    this.root = $("<ul class='treeview treeview-tree'></ul>");
    this.container.append(this.root);
    var data = this.local;
    for (var i = 0; i < data.length; i++) {
        this.createNode(this.root, data[i]);
    }
};

/**
 * 创造树节点。
 *
 * @param data
 *          节点中的数据对象
 *
 * @private
 */
TreeView.prototype.createNode = function (parent, data) {
    var li = $("<li/>");
    var a = $("<a href='#'/>");
    li.append(a);
    a.text(data[this.textKey]);
    a.data(data);
    a.attr("id", "__li__a_" + data[this.idKey]);
    parent.append(li);

    if (this.draggable) {
        a.on("dragstart", function (e) {
            // WARNING: IE EDGE ONLY SUPPORTS TEXT AND URL FOR NOW
            e.originalEvent.dataTransfer.setData("text", "__li__a_" + $(this).data().id);
        });
    }
    if (typeof data.children !== "undefined") {
        li.addClass("tree-branch");
        li.on("click", function(e) {
            var icon = $(this).children('i:first');
            icon.toggleClass("glyphicon-plus-sign glyphicon-minus-sign");
            $(this).children().children().toggle();
        });
        li.prepend("<i class='tree-indicator glyphicon glyphicon-plus-sign'></i>");
        var ul = $("<ul></ul>");
        li.append(ul);
        for (var i = 0; i < data.children.length; i++) {
            this.createNode(ul, data.children[i]);
        }
        li.children().children().toggle();
    }
};