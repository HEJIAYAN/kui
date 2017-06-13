/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // AUTOVIEW CLASS DEFINITION
    // ======================

    var Autoview = function(element, options) {
        this.options = $.extend({}, Autoview.DEFAULTS, options)

        this.$element = $(element);
        var self = this;
        this.$element.find('[data-url]').each(function(idx, elm) {
            self.view(elm);
        });
    };
    
    Autoview.prototype.view = function(elm) {
        if ($(elm).attr('data-lazy') === 'true') return;
        var url = $(elm).attr('data-url');
        $.ajax({
            url: url,
            method: "GET",
            success: function(html) {
                $(elm).html(html);
                $(elm).autoview();
            }
        });
    }

    // AUTOVIEW PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('kui.autoview')
            var options = typeof option == 'object' && option

            if (!data) $this.data('kui.autoview', (data = new Autoview(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.autoview;

    $.fn.autoview = Plugin;
    $.fn.autoview.Constructor = Autoview;
    
}(jQuery);