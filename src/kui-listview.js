/**
 * 列表视图用于需要列表展示统一化的视图。
 * <p>
 * 必要的属性包括:
 * <ul>
 * <li>data-widget：listview</li>
 * <li>data-source：数据请求链接</li>
 * <li>data-template：数据视图模板</li>
 * <li>data-partial: 是或者否，部分加载，可滚动加载</li>
 * <li>data-binding: 时间绑定的回调函数，用于对每个模板单元绑定时间</li>
 * </ul>
 *
 */
+
function($) {
    'use strict';

    // AUTOVIEW CLASS DEFINITION
    // ======================

    var Listview = function(element, options) {
        this.options = $.extend({}, Autoview.DEFAULTS, options)

        this.$element = $(element);
        var self = this;
        var url = this.$element.attr('data-source');
        var source   = $("#" + this.$element.attr('data-template')).html();
        var template = Handlebars.compile(source);
        $.ajax({
            url: url,
            success: function (resp) {
                if (resp.error) return;
                var data = resp.data;
                for (var i = 0; i < data.length; i++) {
                    var html = template(data[i]);
                    $(element).append(html);
                }
            }
        });
    };

    // AUTOVIEW PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('kui.listview')
            var options = typeof option == 'object' && option

            if (!data) $this.data('kui.listview', (data = new Autoview(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.listview;

    $.fn.listview = Plugin;
    $.fn.listview.Constructor = Listview;
    
}(jQuery);