/**
 * 年份、月份、日期等时间段选择控件。
 * 
 * @author <a href="mailto:guo.guo.gan@gmail.com">甘果</a>
 * 
 * @see <a href="http://www.daterangepicker.com/">http://www.daterangepicker.com/</a> 
 */
+
function($) {
    'use strict';

    /**
     * 时间段选择控件构造函数。
     * 
     * @param {object} element - 控件容器，定义了控件的必要属性
     * 
     * @param {object} options - 构建容器的配置项
     * 
     * @constructor
     */
    var RangePicker = function(element, options) {
        this.options = $.extend({}, {}, options);

        this.$element = $(element);
        this.setup(element);
    };
    
    RangePicker.prototype.setup = function(element) {
        var $elm = $(element);
        var type = $elm.attr('data-rangepicker-type');
        switch (type) {
            case 'year':
            case 'month':
                this.monthrangepicker(element);
                break;
            case 'date':
                this.daterangepicker(element);
                break;
            case 'time':
            case 'datetime':
            case 'integer':
                break;
        }
    };
    
    RangePicker.prototype.daterangepicker = function(element) {
        var $elm = $(element);
        var callback = $elm.attr('data-callback');
        var start = $elm.attr('data-rangepicker-start');
        var end = $elm.attr('data-rangepicker-end');
        $elm.daterangepicker({
            locale: {
                format: 'YYYY年MM月DD日',
                separator: ' - ',
                applyLabel: '确定',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                customRangeLabel: '自定义',
                daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                firstDay: 1
            },
            ranges: {
               '当月': [moment().startOf('month'), moment()],
               '三个月': [moment().subtract(3, 'month').startOf('month'), moment()],
               '半年': [moment().subtract(6, 'month').startOf('month'), moment()],
               '一年': [moment().subtract(1, 'year').startOf('year'), moment()],
               '三年': [moment().subtract(3, 'year').startOf('year'), moment()],
               '五年': [moment().subtract(5, 'year').startOf('year'), moment()]
            },
            alwaysShowCalendars: true,
            startDate: start,
            endDate: end
        }, function(start, end, label) {
            if (typeof callback !== 'undefined') callback(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'), label);
        });
    };
    
    RangePicker.prototype.monthrangepicker = function(element) {
        var $elm = $(element);
        var callback = $elm.attr('data-callback');
        var start = $elm.attr('data-rangepicker-start');
        var end = $elm.attr('data-rangepicker-end');
        $elm.monthrangepicker({
            RTL : false,
            closeOnSelect : true,
            presets : [{
                buttonText  : '当月',
                displayText : '当月',
                value       : '0'
            },{
                buttonText  : '三个月',
                displayText : '三个月',
                value       : '2'
            },{
                buttonText  : '半年',
                displayText : '半年',
                value       : '5'
            },{
                buttonText  : '一年',
                displayText : '一年',
                value       : '11',
            },{
                buttonText  : '三年',
                displayText : '三年',
                value       : '35',
            },{
                buttonText  : '五年',
                displayText : '五年',
                value       : '59',
            },{
                buttonText  : '自定义',
                displayText : '自定义',
                value       : 'custom'
            }],
            months 	: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            start: start,
            end: end
        });
    };

    // AUTOVIEW PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('kui.rangepicker')
            var options = typeof option == 'object' && option

            if (!data) $this.data('kui.rangepicker', (data = new RangePicker(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.rangepicker;

    $.fn.rangepicker = Plugin;
    $.fn.rangepicker.Constructor = RangePicker;


    // AUTOVIEW DATA-API
    // ==============
    $(window).on('load', function() {
        $(this).find('[data-widget=rangepicker]').each(function() {
            Plugin.call($(this), data)
        })
    });
    
}(jQuery);