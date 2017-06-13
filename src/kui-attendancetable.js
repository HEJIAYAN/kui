function AttendanceTable2(options) {
    this.url = options.url;
    this.limit = options.limit || 15;
    this.containerId = options.containerId;
    this.year = options.year;
    this.month = options.month;
    this.boundedQuery = options.boundedQuery;
    this.headerColumns = options.headerColumns || [];
    this.footerColumns = options.footerColumns || [];
    
    this.dateCellDisplayFunction = options.dateCellDisplayFunction;
    this.filters = [];
};

/**
 * 生成PaginationTable所需要的列。
 * 
 * @private
 */
AttendanceTable2.prototype.columns = function (year, month) {
    var ret = [];
    var hcols = this.headerColumns;
    var fcols = this.footerColumns;
    for (var i = 0; i < hcols.length; i++) {
        ret.push(hcols[i]);
    }
    // 插入月份日期
    var days = new Date(year, month + 1, 0).getDate();
    for (var i = 1; i <= days; i++) {
        var title = i;
        if (i < 10) title = "0" + title;
        ret.push({title: title, displayFunction: this.dateCellDisplayFunction});
    }
    for (var i = 0; i < fcols.length; i++) {
        ret.push(fcols[i]);
    }
    return ret;
};

AttendanceTable2.prototype.render = function (elementId, params) {
	$('#' + elementId).empty();
    this.table = new PaginationTable({
    	limit: this.limit,
    	containerId: this.containerId,
    	boundedQuery: this.boundedQuery,
        url: this.url,
        columns: this.columns(this.year, this.month)
    });
    this.table.render(elementId, params);
};

AttendanceTable2.prototype.request = function (params) {
    this.table.request(params);
};