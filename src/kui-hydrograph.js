var content = {
	title : [],
	series : [],
	time : []
};

var Hydrograph = function(option) {
	this.symbols = ['emptyCircle', 'emptyRect', 'emptyTriangle', 'emptyDiamond', 'emptyPin', 'emptyArrow', 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'];
    this.colors = [];
	this.containerId = option.containerId;
	this.container = $("#" + option.containerId);
	this.url = option.url;
	this.title = option.title;
	// 用于表格显示的数据
    // deprecated
	this.tableOption = option.tableOption;
    
	// 查询的 SQL
	this.sqlIds = option.sqlIds;
	this.dateField = option.dateField;
	this.groupField = option.groupField;
	this.method = option.method;
	this.sorting = option.sorting || "asc";
	this.maxValue = option.maxValue;
	this.minValue = option.minValue;

	this.charts = option.charts || [];
}

Hydrograph.prototype.render = function (filter) {
	var self = this;
	this.container.empty();
	var params = {};
	for (var k in filter) {
		params[k] = filter[k];
	}
	params.sorting = this.sorting;
	params.method = this.method;
	params.dateField = this.dateField;
	params.groupField = this.groupField;
	params["sqlIds[]"] = this.sqlIds;
    $("#" + self.containerId).empty();
    var echart = echarts.init(document.getElementById(self.containerId));
    echart.showLoading();
	$.ajax({
		url: this.url,
		method: "post",
		dataType: "json",
		data: params,
		success: function (resp) {
            echart.hideLoading();
			var data = resp.data;
			var opt = self.initCharts(data);

            echart.setOption(opt);
			if (typeof self.tableOption !== "undefined") {
				$("#" + self.tableOption.containerId).empty();
				self.tableOption.local = data;
				var table = new PaginationTable(self.tableOption);
				table.render(self.tableOption.containerId);
			}
		}
	});
};

/**
 * 根据数据集，重新初始化charts的个数。
 *
 * @param data
 *          从服务器端取回的结果集
 *
 * @return {object} echarts的options结构
 */
Hydrograph.prototype.initCharts = function (data) {
	// 图表布局的对象结构
	var grid = [];
	var xAxis = [];
	var yAxis = [];
	var series = [];
	var legend = [];
	var dataZoom = [];
	var color = [];

	var xAxisIndex = [];
	var splitedData = this.split(data);
	// 图表之间的间隔设置
	var top = 10;
	var base = 90 - (this.charts.length - 1) * 5;
	// 为dataZoom提前准备数据
	for (var i = 0; i < this.charts.length; i++) {
		xAxisIndex.push(i);
	}
	// 前一个图占了几个Y轴
	var prevYAxisCount = 0;
	for (var i = 0; i < this.charts.length; i++) {
	    var chart = this.charts[i];
		if (i == 0) {
			dataZoom.push({
				show: false,
	            realtime: true,
	            start: 0,
	            end: 100,
	            xAxisIndex: xAxisIndex
			});
		} else {
			dataZoom.push({
				type: "inside",
	            realtime: true,
	            start: 0,
	            end: 100,
	            xAxisIndex: xAxisIndex
			});
		}

		if (typeof chart.grouping !== 'undefined') {
			// 临时分组变量
			var groups = {};
			// 以下算法才能得到最全的列
            for (var j = 0; j < data.length; j++) {
                var d = data[j];
                for (var k in d) {
                    if (k.indexOf("-" + this.groupField) != -1) {
                    	// 如果是分组列
						groups[k.substring(0, k.lastIndexOf("-"))] = d[k];
                    } else if (Object.prototype.toString.call(chart.item) === '[object Array]') {
                    	// 如果直接是监测值
                    	for (var m = 0; m < chart.item.length; m++) {
                    		if (k == chart.item[m]) {
                    			groups[k] = d[k];
                    			break;
                    		}
                    	}
                    }
                }
            }
			// 在分组中重新组合legend和series
        	var kIndexMap = {};
        	for (var k in groups) {
    			if (typeof splitedData[k] === "undefined") {
    				kIndexMap[k] = {group: k + "-" + chart.grouping}
    			} else {
    				kIndexMap[k] = {group: k};
    			}
    		}
        	var firstType;
        	var chartTypeIndex = {};
        	for (var j = 0; j < chart.type.length; j++) {
        		if (j == 0) {
        			firstType = chart.type[j];
        			chartTypeIndex[firstType] = 0;
        			continue;
        		}
        		if (chart.type[j] !== firstType) {
        			chartTypeIndex[chart.type[j]] = 1;
        		}
        	}
        	for (var j = 0; j < chart.item.length; j++) {
        		var itm = chart.item[j];
        		for (var k in kIndexMap) {
        			if (kIndexMap[k].group.indexOf(itm) > 1) {
        				kIndexMap[k].color = chart.color[j];
            			kIndexMap[k].name = k;
            			kIndexMap[k].chartType = chart.type[j];
            			kIndexMap[k].yAxisIndex = chartTypeIndex[chart.type[j]];
            		} else if (kIndexMap[k].group.indexOf(itm) == 0) {
            			kIndexMap[k].color = chart.color[j];
            			kIndexMap[k].name = chart.name[j];
            			kIndexMap[k].chartType = chart.type[j];
            			kIndexMap[k].yAxisIndex = chartTypeIndex[chart.type[j]];
            		}
        		}
        	}
        	var symbolIndex = 0;
        	for (var k in groups) {
        		if (typeof kIndexMap[k].name === 'undefined') continue;
        		legend.push(kIndexMap[k].name);
				color.push(kIndexMap[k].color);
        		var seriesData = splitedData[k];
        		if (typeof seriesData === 'undefined') {
        			seriesData = splitedData[k + "-" + chart.grouping];
        		}
				series.push({
					name: kIndexMap[k].name,
					type: kIndexMap[k].chartType,
					showSymbol: true,
					symbolSize: 7,
					symbol: this.symbols[symbolIndex++],
					hoverAnimation: false,
					xAxisIndex: i,
					yAxisIndex: kIndexMap[k].yAxisIndex + prevYAxisCount,
					data: seriesData,
					barGap: '50%'
				});
				if (typeof this.tableOption !== "undefined") {
					if (typeof splitedData[k] === "undefined") {
						this.tableOption.columns.push({
							title: k,
							template: "{" + k + "-" + chart.grouping + "}"
						});
					} else {
						this.tableOption.columns.push({
							title: kIndexMap[k].name,
							template: "{" + k + "}"
						});
					}
				}
        	}
            for (var k in chartTypeIndex) {
            	// 累计的Y轴数量累加
            	prevYAxisCount++;
            }
			for (var j = 0; j < chart.axis.length; j++) {
				var yAxisOpt = {
					gridIndex: i,
					name : chart.axis[j],
					type : 'value',
					scale: true,
                    boundaryGap: [0,'80%']
					// min: minValueInGroupingChart
				};
				if (chart.axis[j].indexOf('雨量') !== -1) {
					yAxisOpt.inverse = true;
					yAxisOpt.nameLocation = 'start';
					yAxisOpt.boundaryGap = [0,'50%'];
				}

				yAxis.push(yAxisOpt);
			}
        } else {
        	// 没有分组存在的情况
			var innerYAxis = [];
			for (var j = 0; j < chart.item.length; j++) {
				legend.push(chart.name[j]);
				color.push(chart.color[j]);
				if (j < chart.axis.length) {
					var yAxisOpt = {
						gridIndex: i,
						name : chart.axis[j],
						type : 'value',
						scale: true,
                        boundaryGap: [0,'80%']
					};
					// FIXME
					if (chart.axis[j].indexOf('雨量') !== -1) {
						yAxisOpt.inverse = true;
						yAxisOpt.nameLocation = 'start';
                        yAxisOpt.boundaryGap = [0,'50%'];
					}
					yAxis.push(yAxisOpt);
				}
				series.push({
					name: chart.name[j],
					type: chart.type[j],
					xAxisIndex: i,
					yAxisIndex: yAxis.length - 1,
					showSymbol: false,
					hoverAnimation: false,
					data: splitedData[chart.item[j]],
					barGap: '50%'
				});
				if (typeof this.tableOption !== "undefined") {
					this.tableOption.columns.push({
						title: chart.name[j],
						template: "{" + chart.item[j] + "}"
					});
				}
			}
		} // if (chart.grouping)
		xAxis.push({
			gridIndex: i,
			type : 'category',
            boundaryGap: true,
            axisLine: {onZero: true},
			splitLine: {show: false},
            data: splitedData[this.dateField]
		});
		grid.push({
			left: 50,
	        right: 50,
	        top: top + "%",
	        height: (base / this.charts.length - 5) + "%"
		});
		top += (base / this.charts.length) + 6;
    }
	// 单独处理雨量
	/*
	for (var i = 0; i < series.length; i++) {
		if (series[i].type == 'bar') {
			series[i].label = {
				normal: {
					show: true, 
					position: 'bottom',
					formatter: function(val) {
						if (parseInt(val.value) == 0) return '';
						return val.value;
					}
				}};
		}
	}
	*/
	var ret = {
	    /*
		title: {
	        text: this.title,
	        x: 'center'
	    },
	    */
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
	            animation: false
	        }
	    },
		color: color,
		backgroundColor: '#fff',
	    animation: false,
	    legend: {
            left: 'center',
            top: 10,
            data: legend
        },
		// 屏蔽掉dataZoom
        // dataZoom: dataZoom,
        grid: grid,
        yAxis: yAxis,
        xAxis: xAxis,
        series: series
	};
	return ret;
};

/**
 * 拆分成echarts显示的数据结构。
 *
 * @param data
 * 			从数据库查询出的源数据
 *
 * @returns {object} 用各个标识分组的数据
 */
Hydrograph.prototype.split = function (data) {
	var ret = {};
	ret[this.dateField] = [];
	var scales = {};
	for (var i = 0; i < this.charts.length; i++) {
		if (Object.prototype.toString.call(this.charts[i].item) === '[object Array]') {
			for (var j = 0; j < this.charts[i].item.length; j++) {
				ret[this.charts[i].item[j]] = [];
				scales[this.charts[i].item] = (typeof this.charts[i].scale === "undefined") ? 2 : this.charts[i].scale;
			}
		} else {
			ret[this.charts[i].item] = [];
			scales[this.charts[i].item] = (typeof this.charts[i].scale === "undefined") ? 2 : this.charts[i].scale;
		}
	}
	// 获得最大列
	var maxCols = {};
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        for (var k in row) {
            maxCols[k] = k;
			ret[k] = [];
        }
    }
	for (var i = 0; i < data.length; i++) {
		var row = data[i];
		for (var k in maxCols) {
			if (typeof ret[k] !== "undefined") {
				if (typeof row[k] === "undefined") row[k] = null;
				if (row[k] != null && !isNaN(row[k]) && k !== this.dateField) {
					// 雨量只保留以为小数
					if (k == 'drp' || k == 'dyp') {
						row[k] = parseFloat(row[k]).toFixed(1);
					} else {
						row[k] = parseFloat(row[k]).toFixed(2);
					}
				}
				ret[k].push(row[k]);
			}
		}
	}
	return ret;
};

Hydrograph.prototype.max = function (data) {
	var ret = 0;
	for (var i = 0; i < data.length; i++) {
		if (data[i] == null) continue;
		if (ret < parseFloat(data[i])) {
			ret = parseFloat(data[i]);
		}
	}
	return ret;
};

Hydrograph.prototype.min = function (data) {
	var ret = 0;
	for (var i = 0; i < data.length; i++) {
        if (data[i] == null) continue;
		if (ret == 0) ret = parseFloat(data[i]);
		if (ret > parseFloat(data[i])) {
			ret = parseFloat(data[i]);
		}
	}
	return ret;
};

