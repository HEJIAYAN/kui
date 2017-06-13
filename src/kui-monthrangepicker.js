/*!
	ranegPicker v1.0
	(c) 2013 Yair Even Or

	MIT-style license.
*/

;(function($){
	"use strict";

	var $doc = $(document),
		MonthRangePicker,
		lastValue,
		// DOM structure
        Template = $('<div class="monthrangepicker dropdown-menu" style="z-index: 3300"> \
        				<div class="wrap"> \
							<div class="preset"></div> \
							<div class="custom"> \
								<div class="calendar from"><strong></strong></div> \
								<div class="calendar to"></div> \
								<footer> \
                                    <button type="button" class="cancel btn">取消</button> \
									<button type="button" class="confirm btn btn-success">确定</button> \
								</footer> \
							</div> \
						</div> \
					</div>');

		MonthRangePicker = function(obj, settings, callback){
			this.settings = settings;
			this.picker   = Template.clone();
			this.obj 	  = $(obj);
			this.callback = typeof callback == 'function' ? callback : null;
			this.result = {};
            
			// inject picker
			this.picker.insertAfter(this.obj);
            
            var now = moment();
            this.start = settings.start || now.year() + '-' + now.month();
            this.end = settings.end || now.year() + '-' + now.month();
            
			// for positioning
//			this.tether = new Tether({
//				element         : this.picker,
//				target          : this.obj,
//				attachment      : this.settings.RTL ? 'top right' : 'top left',
//				targetAttachment: this.settings.RTL ? 'bottom right' : 'bottom left',
//				constraints: [{
//			     	to: 'window',
//			     	attachment: 'together'
//			    }]
//			})
		};

		MonthRangePicker.prototype = {
			// prepare the DOM for a new picker
			init : function(){
                var i, len;
                
				// prevent bubbling of clicking inside the picker to the outside
				this.picker.add(this.obj).on('mousedown', function(e){ e.stopPropagation() });

                var starts = this.start.split('-');
                var ends = this.end.split('-');

                var startYear = parseInt(starts[0]);
                var startMonth = parseInt(starts[1]);
                var endYear = parseInt(ends[0]);
                var endMonth = parseInt(ends[1]);
                
                
                this.result.startYear = startYear;
                this.result.startMonth = startMonth;
                this.result.endYear = endYear;
                this.result.endMonth = endMonth;
                
				var that 		  = this,
					presetWrap    = this.picker.find('.preset'),
					presetDefault = null,
					years 		  = '',
					months 		  = '',
					totalYears    = endYear - startYear,
					month, button, i;

				// presets
				for( i = this.settings.presets.length; i--; ){
					presetWrap.prepend( "<button type='button' value='"+ this.settings.presets[i].value +"'>" + this.settings.presets[i].buttonText + "</button>" );
				}
				this.presets = presetWrap.find('button');

				// add indexes to match them for the right place in the this.result array
				this.calendar = {
					from : this.picker.find('.calendar.from'),
					to   : this.picker.find('.calendar.to')
				}

				// months
				for( i = 0, len = this.settings.months.length; i < len; i++ ){
                    month = '<button>'+ this.settings.months[i] + '</button>';
                    months += month;
				}
                
                var self = this;
                var yearSelector = $('<h4>').addClass('col-xs-12').css('text-align', 'center');
                var yearLeft = $('<i class="mpr-yeardown glyphicon glyphicon-circle-arrow-left pull-left" style="cursor: pointer">')
                var yearRight = $('<i class="mpr-yearup glyphicon glyphicon-circle-arrow-right pull-right" style="cursor: pointer"></i>');
                var yearShow = $('<span>');
                yearSelector.append(yearLeft);
                yearSelector.append(yearShow.append(startYear));
                yearSelector.append(yearRight);
                yearLeft.on('click', function() {
                    if (self.result.startYear === 0) return;
                    var $span = $($(this).parent().find('span'));
                    self.result.startYear = parseInt($span.text()) - 1;
                    $span.text(self.result.startYear);
                });
                yearRight.on('click', function() {
                    if (self.result.startYear === 9999) return;
                    var $span = $($(this).parent().find('span'));
                    self.result.startYear = parseInt($span.text()) + 1;
                    $span.text(self.result.startYear);
                    
                });
                
				this.calendar.from.append(yearSelector, $('<div>').addClass('months').html(months));
                
                var yearSelector2 = $('<h4>').addClass('col-xs-12').css('text-align', 'center');
                var yearLeft2 = $('<i class="mpr-yeardown glyphicon glyphicon-circle-arrow-left pull-left" style="cursor: pointer">')
                var yearRight2 = $('<i class="mpr-yearup glyphicon glyphicon-circle-arrow-right pull-right" style="cursor: pointer"></i>');
                var yearShow2 = $('<span>');
                yearSelector2.append(yearLeft2);
                yearSelector2.append(yearShow2.append(endYear));
                yearSelector2.append(yearRight2);
                yearLeft2.on('click', function() {
                    if (self.result.endYear === 0) return;
                    var $span = $($(this).parent().find('span'));
                    self.result.endYear = parseInt($span.text()) - 1;
                    $span.text(self.result.endYear);
                });
                yearRight2.on('click', function() {
                    if (self.result.endYear === 9999) return;
                    var $span = $($(this).parent().find('span'));
                    self.result.endYear = parseInt($span.text()) + 1;
                    $span.text(self.result.endYear);
                });
				this.calendar.to.append($('<strong>'), yearSelector2, $('<div>').addClass('months').html(months));

				this.bind();

				this.update(this.result);
			},

			bind : function() {
				var that = this;
				// when clicking the input object bound to this picker, show the picker
				this.obj.on('click', function(){ that.show.apply(that) });

				this.picker
					.on('click', '.preset > button', 	that.presetClick.bind(that))
					.on('click.dp', '.months > button', that.monthClick.bind(that))
					.on('change', 'select', 			that.changeYear.bind(that))
					.on('click', '.confirm',  			that.applyDate.bind(that))
					.on('click', '.cancel', 			that.cancel.bind(that))
			},

			destroy : function(){
				this.picker.remove();
				this.obj.removeData('_ranegPicker');
			},

			show : function(){
				var that = this;

				// hide all other pickers, if present on the page
				$('.monthrangepicker.show').removeClass('show');

				if( this.picker.hasClass('show') ){
					this.hide();
					return;
				}

				this.picker.addClass('show');
				// close picker when clicking outside
				setTimeout(function(){
					$doc.on('mousedown._rp', function(){ that.cancel.apply(that); });
				},100);

				this.obj.trigger('datePicker.show');
			},

			hide : function(){
				this.picker.removeClass('show');
				$doc.off('mousedown._rp');
			},

			cancel : function(){
				// reverse changes
				this.update( lastValue );
				this.hide();
			},

			monthClick : function(e){
				var calendarIdx =  $(e.target).parents('.calendar').index(),
					monthIdx = $(e.target).index();
                
				this.changeMonth(calendarIdx, monthIdx);
			},

			// when clicking the "apply" button
			applyDate : function(){
				this.update();

				if( this.settings.closeOnSelect )
					this.hide();

				this.obj.trigger('monthrangepicker.done', [this.result]);
			},

			presetClick : function(e){
				this.changePreset(e.target.value);
			},

			// change selected preset and remove the selection from the custom area
			changePreset : function(val){
				var presetWrap = this.presets.parent();
				this.summary();

				if(val){
					this.presets.removeClass('selected').filter('[value='+ val +']').addClass('selected');
					// set the result
					presetWrap.addClass('set');
					// remove the custom range selections

					if( val == 'custom' ){
						this.picker.addClass('custom');
						this.applyBtnState();
					} else {
                        var end = moment();
                        var start = moment();
                        var start = start.subtract(val, 'months');
                        
						this.result.startYear = start.year();
                        this.result.startMonth = start.month() + 1;
                        this.result.endYear = end.year();
                        this.result.endMonth = end.month() + 1;
                        
						this.picker.find('.months').find('.selected').removeClass('selected');
						this.picker.removeClass('custom');
						this.applyDate();
					}
				}
			},

			changeYear : function(e){
				var that = this,
					calendarIdx = this.yearSelectors.index(e.target); // FROM or TO range

				this.changePreset();

				if( typeof this.result != 'object' )
					this.result = {};

				// on year change, reset last selected month
				$(e.target).next('.months').find('.selected').removeAttr('class');
				this.result[calendarIdx][0] = undefined;

				// set the result
				this.result[calendarIdx][1] = e.target.value|0;

				// disable the dates of the "TO" calendar which are in the relative past
				if( calendarIdx == 1 )
					this.picker.find('.calendar.from').find('.selected').trigger('click.dp');

				this.summary();
				this.applyBtnState();
			},

			// validate months in one picker, relative to the other, to prevent "illegal" time-frame selections
			changeMonth : function(calendarIdx, monthIdx){
				var that = this,
					monthBtn = this.picker.find('.calendar').eq(calendarIdx).find('button').eq(monthIdx);

				monthBtn.addClass('selected').siblings().removeClass('selected');

				// it can also be a "string" when a preset was previously selected,so the result object needs to be reset
				if( typeof this.result != 'object' ){
					// this.result = [[undefined, this.yearSelectors[0].value|0],[undefined, this.yearSelectors[1].value|0]];
				}
                
                if (calendarIdx === 0) {
                    this.result.startMonth = monthIdx + 1;
                } else {
                    this.result.endMonth = monthIdx + 1;
                }

				this.changePreset();

				// if both month pickers are currently at the same year, disable the END month which are in the "relative" past
				// & only the START month picker should affect the END picker and disable its "past" buttons
				if( this.result.startMonth == this.result.endMonth && calendarIdx == 0 ){
					this.picker.find('.calendar.to').find('button').prop('disabled', false).slice(0, monthIdx ).prop('disabled', true).removeClass('selected');

					// update the result if the "TO" value is now invalid because it's in the relative PAST to the "FROM" value
					if( this.result.startYear > this.result.endYear )
						this.result.endYear = this.result.startYear;
				}

				this.applyBtnState( !this.validateResult() );
			},

			// update the state (disabled/enabled) of the control buttons (apply)
			applyBtnState : function(state){
				if( state !== false )
					state = (typeof this.result == 'string') || !this.validateResult();

				this.picker.find('.confirm').prop('disabled', state);
			},

			// validate the result object
			// disable the "apply" button if validation fails
			validateResult : function(result){
				result = result || this.result;

				if(result.startYear > result.endYear || (result.startYear == result.yearEnd && result.startMonth > result.endMonth))
				    return false;
				return true;
			},

			changeCalendar : function(result){
                if( !this.validateResult(result) )
                    return false;

				var that = this;


				// Months
				this.picker.find('.months').each(function(i){
                    if (i == 0)
                        that.changeMonth( i, result.startMonth - 1 );
                    else         
					    that.changeMonth( i, result.endMonth - 1 );
				});

				this.summary();
				return this;
			},

			summary : function(calendarIdx){
				if( !this.result )
					return this;

				var from = '',
				    to   = '';

				if( typeof this.result != 'string' ){
					from = '<span>'+ this.displayValue('%S') +'</span>';
					to = '<span>'+ this.displayValue('%E') +'</span>';	
				}

				this.calendar.from.find('strong').html(from);
				this.calendar.to.find('strong').html(to);
			},

			// human-readable format for custom date
			displayValue : function(format){
				format = format || '%S - %E';

				format = format.replace('%S', this.result.startYear + '年' + this.settings.months[this.result.startMonth - 1]);
				format = format.replace('%E', this.result.endYear + '年' + this.settings.months[this.result.endMonth - 1]);

				return format;
			},

			update: function(result){
				var displayValue = '';

                displayValue =  this.displayValue();
				if( displayValue != undefined )
					this.obj[0].value = displayValue;

				lastValue = (typeof result == 'string') ? result : $.extend(true, {},result );

				return this;
			}
		};


	////////////////////////////////////
	// jQuery plugin intitilization

	$.fn.monthrangepicker = function(settings, callback){
		return this.each(function(){
            var $obj = $(this),
				$settings,
				monthrangepicker;

			if( $obj.data('_monthrangepicker') ){
				monthrangepicker = $obj.data('_monthrangepicker');
				return this;
			}
			else
				$settings = $.extend( true, {}, $.fn.monthrangepicker.defaults, settings || {} );

			// when calling monthrangepicker without any settings, only callback
			if( typeof settings == 'function' )
				callback = settings;

            monthrangepicker = new MonthRangePicker($obj, $settings, callback);
            monthrangepicker.init();

            // save this instance on the element it's bound to
			$obj.data('_monthrangepicker', monthrangepicker);
        });
	};

})(window.jQuery);