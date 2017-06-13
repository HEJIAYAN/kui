/**
 * SumTable构造函数
 */
var SumTable = function(opts) {
    // 远程数据源
    this.url = opts.url;
    
    // 绑定查询
    this.boundedQuery = opts.boundedQuery;
    
    //是否只显示获取的数据长度对应的表格行数
    this.showDataRowLength = opts.showDataRowLength || false;
    
    // 容器标识
    this.containerId = null;
    // 图表显示的容器标识
    this.echartContainerId = opts.echartContainerId;

    this.afterLoad = opts.afterLoad || function(obj) {
    };
    /**
     * [{ title: "", children: [], template: "<a href='${where}'>${displayName}</a>", params: {where: "", displayName:
     * "default"} rowspan: 1 }]
     */
    this.columns = opts.columns || []; //所有一级列数量
    this.allcolumns = 0; //所有的列数量（包含了嵌套列)）
    this.columnMatrix = [];
    var max = 0;
    for (var i = 0; i < this.columns.length; ++i) {
        var col = this.columns[i];
        max = Math.max(max, (col.rowspan || 1));
        if(typeof col.colspan != "undefined"){
            this.allcolumns += col.colspan;
        }else{
            this.allcolumns++;
        }
    }
    this.mappingColumns = [];
    this.filters = {};
    this.headRowCount = max;
    this.start = 0;
    this.rollbackStart = 0;
    this.total = 0;
    this.table = null;
    this.result = null;
    for (var i = 0; i < max; ++i) {
        this.columnMatrix.push([]);
    }
    this.buildMatrix(this.columns, 0);
    this.buildMappingColumns(this.columns);

    this.rotateconfig = {
        len: 25, //图像每次旋转的角度
        brushtm: 70, //旋转的间隙时间
        maxptnum: 10, //提示文字后面.的最长数量
        textcololor: "#629BA0"
    }
};

/**
 * Renders the table in the web brower.
 * 
 * @param {string}
 *            containerId - the container id in the dom.
 */
SumTable.prototype.render = function(containerId, params) {
    this.containerId = containerId;
    if (typeof params === "undefined" || params == '' || params == '{}') {
        this.beforeRequest();
        this.request(ps);
        this.afterRequest();
    } else {
        var ps = $.parseJSON(params);
        this.beforeRequest(ps);
        this.request(ps);
        this.afterRequest();
    }
};

SumTable.prototype.beforeRequest = function (initParams) {
    var _this = this;
    $('#' + this.containerId).append(this.root(initParams));

    //var loadding = $("<h6> 正在加载数据，请稍候....</h6>");
    var loaddingct = $("<div></div>");
    loaddingct.attr("class","loaddingct");
    var loadding = $("<img/>");
    var loaddingtext= $("<h6>数据正在加载，请稍候</h6>");
    loaddingtext.css("color",_this.rotateconfig.textcololor);
    loaddingct.append(loaddingtext);
    var len = 0,ptnum=0;
    
    window.setInterval(function(){
        len += _this.rotateconfig.len;
        $("#"+loadding.attr("id")).css({
            '-webkit-transform' : "rotate(" + len +"deg)",
            '-moz-transform'    : "rotate(" + len +"deg)",
            '-ms-transform'     : "rotate(" + len +"deg)",
            '-o-transform'      : "rotate(" + len +"deg)",
            'transform'         : "rotate(" + len +"deg)",
        });

        if(ptnum++ < _this.rotateconfig.maxptnum )
            loaddingtext.html(loaddingtext.html()+".");
        else{
            ptnum = 0;
            loaddingtext.html("数据正在加载，请稍候");
        }
    }, _this.rotateconfig.brushtm);
    
    this.table.append($("<tr></tr>").append($("<td></td>").attr("colspan",this.allcolumns).append(loaddingct)));
};

SumTable.prototype.afterRequest = function () {
    
};

SumTable.prototype.requestError = function () {
    this.table.find("div.loaddingct").html('<h6 style="color:red">数据加载出错，请联系管理员解决...</h6>');
};
/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
SumTable.prototype.root = function(initParams) {
    if (typeof initParams === "undefined") {
        initParams = {};
    }
    this.table = $("<table></table>");
    this.table.css("overflow", "auto");
    this.table.addClass("table table-bordered");
    var self = this;
    for (var i = 0; i < this.columnMatrix.length; ++i) {
        var tr = $("<tr></tr>");
        for (var j = 0; j < this.columnMatrix[i].length; ++j) {
            var col = this.columnMatrix[i][j];
            var th = $('<th></th>');
            var span = $("<span class='pull-right glyphicon glyphicon-sort'></span>");
            span.css("opacity", "0.3");
            span.on("click", function(evt) {
                var sorting = "asc";
                var span = $(evt.target);
                if (span.hasClass("glyphicon-sort")) {
                    span.removeClass("glyphicon-sort");
                    span.addClass("glyphicon-sort-by-attributes");
                    span.css("opacity", "0.6");
                    sorting = "asc";
                } else if (span.hasClass("glyphicon-sort-by-attributes")) {
                    span.removeClass("glyphicon-sort-by-attributes");
                    span.addClass("glyphicon-sort-by-attributes-alt");
                    sorting = "desc";
                } else if (span.hasClass("glyphicon-sort-by-attributes-alt")) {
                    span.removeClass("glyphicon-sort-by-attributes-alt");
                    span.addClass("glyphicon-sort-by-attributes");
                    sorting = "asc";
                }
                // 其余的重置
                if (!span.hasClass("glyphicon-sort")) {
                    self.table.find("th span").each(function (idx, elm) {
                        if (span.attr("data-order") == $(elm).attr("data-order")) return;
                        $(elm).removeClass("glyphicon-sort-by-attributes");
                        $(elm).removeClass("glyphicon-sort-by-attributes-alt");
                        $(elm).addClass("glyphicon-sort");
                        $(elm).css("opacity", "0.3");
                    });
                }
                // 请求数据
                self.filters["orderBy"] = span.attr("data-order");
                self.filters["sorting"] = sorting;
                self.request();
            });
            th.attr('rowspan', col.rowspan || 1);
            th.attr('colspan', col.colspan || 1);
            th.attr('style', col.style || "text-align: center; vertical-align: middle;");
            if (typeof col.headerClick === "undefined") {
                //th.text(col.title);
                th.append(col.title);
            } else {
                var a = $('<a>');
                a.on('click', col.headerClick);
                th.append(a);
                a.css("cursor", "default");
                a.text(col.title);
            }
            // 如果定义了data-order属性，则添加
            if (typeof col.order !== "undefined") {
                span.attr("data-order", col.order);
                // 根据初始化的过滤条件中，显示图标
                if (col.order === initParams["orderBy"]) {
                    span.removeClass("glyphicon-sort");
                    if (initParams["sorting"] === "asc") {
                        span.addClass("glyphicon-sort-by-attributes");
                    } else {
                        span.addClass("glyphicon-sort-by-attributes-alt");
                    }
                }
                th.append(span);
            }
            tr.append(th);
        }
        this.table.append(tr);
    }
    return this.table;
};

/**
 * Gets the max col span for the given column.
 * 
 * @param {object}
 *            column - the column object
 * 
 * @private
 */
SumTable.prototype.maxColSpan = function(column) {
    var ret = 1;
    var max = 0;
    for (var i = 0; column.children && i < column.children.length; ++i) {
        max = Math.max(max, this.maxColSpan(column.children[i]));
    }
    ret += max;
    return ret;
};

/**
 * Clears all data rows.
 * 
 * @private
 */
SumTable.prototype.clear = function() {
    this.table.find("thead").remove(); // 如果手动添加了表格头部
    this.table.find("tr:gt(" + (this.headRowCount - 1) + ")").remove();
};

/**
 * Builds the direct columns which are used to map values with result.
 * 
 * @param {array}
 *            columns - the columns
 * 
 * @private
 */
SumTable.prototype.buildMappingColumns = function(columns) {
    for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
        if (!col.children || col.children.length == 0) {
            this.mappingColumns.push(col);
        } else {
            this.buildMappingColumns(col.children);
        }
    }
};

/**
 * Builds column matrix.
 * 
 * @param {object}
 *            parent - the parent column
 * 
 * @param {integer}
 *            index - the matrix row index
 * 
 * @private
 */
SumTable.prototype.buildMatrix = function(columns, index) {
    if (!columns)
        return;
    var currentIndex = index;

    // add column children
    for (var i = 0; i < columns.length; ++i) {
        var col = columns[i];
        if (col.children && col.children.length > 0) {
            col.colspan = col.colspan || 1;
            this.buildMatrix(col.children, index + 1);
        }
        this.columnMatrix[currentIndex].push(col);
    }
};

/**
 * 
 */
SumTable.prototype.request = function(others) {
    var self = this;
    var params = {};
    if (self.boundedQuery != null) {
        var ft = self.boundedQuery.formdata();
        for (var k in ft) {
            this.filters[k] = ft[k];
        }
    }
    if (typeof others !== "undefined") {
        for (var k in others) {
            if (k == "start") {
                this.start = parseInt(others[k])
            } else if (k == "limit") {
                this.limit = parseInt(others[k]);
            } else {
                this.filters[k] = others[k];
            }
        }
    }
    for ( var k in this.filters) {
        params[k] = this.filters[k];
    }
    params['start'] = 0;
    params['limit'] = -1;
    for (var k in this.filters) {
        params[k] = this.filters[k];
    }
    // params['criteria'] = JSON.stringify(this.filters);
    // this.setCookie();
    if (typeof this.url !== "undefined") {
        $.ajax({
            url: this.url,
            type: 'POST',
            data: params,
            success: function(resp) {
                var result;
                if (typeof resp === "string") {
                    result = $.parseJSON(resp);
                } else {
                    result = resp;
                }
                self.total = result.total;
                self.fill(result);
                self.afterLoad(result);
                if (self.fixedColumns > 0) {
                    self.table.tableHeaderFixer({
                        head: true,
                        foot: false,
                        left: self.fixedColumns,
                        right: 0
                    });
                }
            },
            error: function(resp) {
                self.start = self.rollbackStart;
                self.requestError();
            }
        });
        return;
    }
    this.loadLocal();
};

SumTable.prototype.addFilter = function(name, value) {
    this.filters[name] = value;
};

SumTable.prototype.clearFilters = function() {
    this.filters = {};
};

SumTable.prototype.replace = function(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 */
SumTable.prototype.fill = function(result) {
    this.clear();
    var mappingColumns = this.mappingColumns;
    if(result.data && result.data[0]) {
        var totals = {};
        for (var i = 0; i < result.data.length; i++) {
            var row = result.data[i];
            for (var k in row) {
                if (!isNaN(row[k])) {
                    if (typeof totals[k] === 'undefined') totals[k] = row[k];
                    else totals[k] += row[k];
                } else totals[k] = '总计';
            }
        }
        result.data.push(totals);
        for (var i = 0; i < result.data.length; ++i) {
            var tr = $("<tr></tr>");
            var row = result.data[i];
            for (var j = 0; j < mappingColumns.length; ++j) {
                var col = mappingColumns[j];
                var td = $("<td></td>");
                if (col.style) {
                    td.attr("style", col.style);
                }else{
                    td.attr("style", "text-align: center;vertical-align:middle");
                }
                if (col.template) {
                    var html = col.template.toString();
                    for (k in row) {
                        row[k] = row[k] == null ? "" : row[k];
                        html = this.replace(html, "\\{" + k + "\\}", row[k]);
                    }
                    if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
                        html = '';
                    }
                    if (i == result.data.length - 1) {
                    	if (typeof col.totalText !== 'undefined' || col.total === true)
                    		td.html(html);
                    }
                    else 
                    	td.html(html);
                    
                }
                if (col.displayFunction) {
                    col.displayFunction(row, td, j);
                }
                tr.append(td);
            }
            this.table.append(tr);
        }
    }

};
