if (typeof ajax === 'undefined') ajax = {};

/**
 * 保存数据。
 * 
 * @param {string} uri - 请求保存路径
 * 
 * @param {object} form - JQuery表单对象
 * 
 * @param {function} callback - 回调函数
 */
ajax.save = function(uri, form, callback) {
	var errors = form.validate();
	if (errors.length > 0) {
		layer.alert(errs[0].message, {icon: 2, skin: 'layer-ext-moon'});
		return;
	}
	var data = form.formdata();
	$.ajax({
		url: uri,
		data: data,
		method: "POST",
		dataType: json,
		success: function (resp) {
			if (typeof resp.error !== 'undefined') {
                layer.alert('保存出错！', {icon: 2, skin: 'layer-ext-moon'});
                return;
            }
			if (typeof callback !== 'undefined') {
				callback(resp);
			}
		}
	});
};

ajax.view = function(uri, cntr, data, callback) {
	if (typeof data === 'undefined') data = {};
	$.ajax({
		url: uri,
		data: data,
		success: function(html) {
			cntr.empty();
			cntr.html(html);
            if (callback) callback(html);
		}
	});
};

ajax.svg = function(uri, cntr, data, callback) {
    if (typeof data === 'undefined') data = {};
	$.ajax({
		url: uri,
		data: data,
		success: function(xml) {
			cntr.empty();
            var html = new XMLSerializer().serializeToString(xml.documentElement);
			cntr.html(html);
            if (callback) callback(xml);
		}
	});
};

/**
 * 直接打开页面窗口。
 * 
 * @param {string} uri - 资源链接
 * 
 * @param {object} data - 请求参数数据
 *
 * @param {string} title - 标题
 * 
 * @param {integer} width - 宽度
 * 
 * @param {integer} height - 高度
 */
ajax.dialog = function(uri, data, title, width, height) {
	$.ajax({
		url: uri,
		data: data,
		success: function (html) {
			layer.open({
				type: 1,
				skin: 'layui-layer-rim', //加上边框
				area: [width + 'px', height + 'px'], //宽高
				content: html
			});
		}
	});
};

/**
 * 直接打开视频窗口。
 * 
 * @param {string} uri - 资源链接
 * 
 * @param {object} data - 请求参数数据
 * 
 * @param {integer} width - 宽度
 * 
 * @param {integer} height - 高度
 */
ajax.video = function(uri, data, width, height) {
	layer.open({
	    type: 2,
	    title: false,
	    closeBtn: 1, //不显示关闭按钮
	    shade: [0],
	    area: [width + 'px', height + 'px'],
	    offset: 'rb', //右下角弹出
	    anim: 2,
	    content: [uri, 'no'] //iframe的url，no代表不显示滚动条
	});
};