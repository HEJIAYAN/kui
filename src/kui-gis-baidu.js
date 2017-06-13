if (typeof gis === 'undefined') var gis = {};

/**
 * 
 */
gis.baidu = function (options) {
	var containerId = options.containerId;
	gis.map = BMap.map(containerId);
};

/**
 * 
 * @param opt {any} - 结构体，包括{lat, lng, icon, info}
 */
gis.point = function (opt, clickCallback) {
    
};