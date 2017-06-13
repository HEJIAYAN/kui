$.fn.rsrrz = function (option) {
    var $cntr = $(this);
    var svgurl = option.svgurl;
    var maxdmhg = option.maxdmhg;
    var crel = option.crel;
    var cbel = option.cbel;
    var rz = option.rz;
    var drz = option.drz;
    var w = option.w || 0;
    var contextPath = option.contextPath || '';
    var dsfllv = option.dsfllv;
    var chfllv = option.chfllv;
    
    var ddwl = option.ddwl;
    var flsscnwl = option.flsscnwl;
    var nrstlv = option.nrstlv;
    var chfllv = option.chfllv;
    
    if (typeof maxdmhg === 'undefined') {
        console.log('未设置最大坝高');
        return;
    }
    
    if (typeof crel === 'undefined') {
        console.log('未设置坝顶高程');
        return;
    }
    
    // 土石坝或者混凝土坝
    this.DAM = {
        gaugeX: 7,
        gaugeY: 40.7,
        lbX: 25.7,
        lbY: 40.7,
        rbX: 206.5,
        rbY: 40.7,
        ltX: 112.3,
        ltY: 6,
        rtX: 124,
        rtY: 6
    };
    
    var cbel = crel - maxdmhg;
    
    var dam = this.DAM;
    
    var self = this;
    
    // 先被5除
    var maxdmhgBy5 = parseInt(maxdmhg / 5);
    var maxdmhgResi = maxdmhg % 5;
    if (maxdmhgResi != 0) maxdmhgBy5 += 1;
    
    // 每米的实际坐标
    var scale1m = (dam.lbY - dam.ltY) / maxdmhg;
    
    // 距离坝底最近的能够被5除尽
    var cbelBy5 = parseInt(cbel / 5);
    var scaleEl = cbelBy5 * 5 + maxdmhgBy5;
    
    var scales = [];
    for (var i = 0; i < 5; i++) {
        scales.push({el: scaleEl, offsetY: (scaleEl- cbel) * scale1m});
        scaleEl += maxdmhgBy5;
    }
    
    var distanceY = scales[1].offsetY - scales[0].offsetY;
    
    // 计算水位在图中坐标
    var rzY = dam.lbY - (rz - cbel) * scale1m;
    
    var rzX = (dam.ltX - dam.lbX) * (dam.lbY - rzY) / (dam.lbY - dam.ltY) + dam.lbX;
    
    // 下游水位
    var drzY = 0;
    var drzX = 0;
    if (typeof drz !== 'undefined') {
        drzY = dam.lbY - (drz - cbel) * scale1m;
        drzX = dam.rbX - (dam.rbX - dam.rtX) * (dam.lbY - drzY) / (dam.lbY - dam.ltY);
    } 
    
    /**
     * 画水尺。
     */
    this.draw = function (svg) {
        // 坝前水位
        svg.polygon([[0, dam.lbY], [dam.lbX, dam.lbY], [rzX, rzY], [0, rzY]], {fill: '#74ccf4', stroke: '#74ccf4', strokeWidth: 0.02});
        if (w === 0) {
        	svg.text(rzX - 20, rzY - 1, '坝前水位：' + rz + '米', {fontSize: 2, fontWeight: 'bold', fill: 'blue'});
        } else {
        	svg.text(rzX - 45, rzY - 1, '坝前水位：' + rz + '米，蓄水量：' + w + '万立方', {fontSize: 2, fontWeight: 'bold', fill: 'blue'});
        }
        if (drzY !== 0) {
            svg.polygon([[210, dam.lbY], [dam.rbX, dam.rbY], [drzX, drzY], [210, drzY]], {fill: '#74ccf4', stroke: '#74ccf4', strokeWidth: 0.02});
            svg.text(drzX - 7, drzY - 1, '下游水位：' + drz + '米', {fontSize: 2, fontWeight: 'bold', fill: 'blue'});
        }
        // 整数刻度
        // 竖线
        svg.line(dam.gaugeX, dam.gaugeY, dam.gaugeX, dam.ltY, {fill: 'blue', stroke: 'blue', strokeWidth: 0.4});
        for (var i = 0; i < scales.length; i++) {
            if (scales[i].el > crel) break;
            var scale = scales[i];
            var y = dam.gaugeY - scale.offsetY;
            // 大于了坝顶高程，刻度不画出来
            svg.line(dam.gaugeX, y, dam.gaugeX + 3.0, y, {fill: 'blue', stroke: 'blue', strokeWidth: 0.4});
            svg.text(2, y, '' + scale.el, {fontSize: 2, fontWeight: 'bold'});
            // 标注高程文字
            for (var j = 1; j < 5; j++) {
                if (scale.el + j > crel) break;
                y = dam.gaugeY - scale.offsetY - distanceY / 5 * j;
                svg.line(dam.gaugeX, y, dam.gaugeX + 1.5, y, {fill: 'blue', stroke: 'blue', strokeWidth: 0.4});
            }
        }
        var el = scales[0].el;
        var j = 0;
        // 最下面的刻度到坝底
        while (el > cbel) {
            y = dam.gaugeY - scales[0].offsetY + distanceY / 5 * j;
            svg.line(dam.gaugeX, y, dam.gaugeX + 1.5, y, {fill: 'blue', stroke: 'blue', strokeWidth: 0.4});
            el -= parseInt(maxdmhgBy5 / 5);
            j++;
        }
        // 特征水位
        svg.text(dam.ltX, dam.ltY - 2, '坝顶高程：' + crel + '米', {fontSize: 2, fontWeight: 'bold'});
        svg.text(dam.ltX, 28, '最大坝高：' + maxdmhg + '米', {fontSize: 2, fontWeight: 'bold'});
        if (typeof ddwl !== 'undefined') {
            var ddwlY = dam.lbY - (ddwl - cbel) * scale1m;
            svg.text(12, ddwlY, '死水位：' + ddwl + '米', {fontSize: 2, fontWeight: 'bold'});
        }
        if (typeof flsscnwl !== 'undefined') {
            var flsscnwlY = dam.lbY - (flsscnwl - cbel) * scale1m;
            if (nrstlv !== flsscnwl) 
                svg.text(12, flsscnwlY, '汛限水位：' + flsscnwl + '米', {fontSize: 2, fontWeight: 'bold'});
            else
                svg.text(12, flsscnwlY, '汛限水位、正常蓄水位：' + flsscnwl + '米', {fontSize: 2, fontWeight: 'bold'});
        }
        if (typeof nrstlv !== 'undefined' && typeof flsscnwl === 'undefined') {
        	var nrstlvY = dam.lbY - (flsscnwl - cbel) * scale1m;
        	svg.text(12, nrstlvY, '正常水位：' + nrstlv + '米', {fontSize: 2, fontWeight: 'bold'});
        }
        var top = 2;
        if (typeof chfllv !== 'undefined') {
            svg.text(12, 2, '校核洪水位：' + chfllv + '米', {fontSize: 2, fontWeight: 'bold'});
        }
        if (typeof dsfllv !== 'undefined') {
            svg.text(12, 4, '设计洪水位：' + dsfllv + '米', {fontSize: 2, fontWeight: 'bold'});
        }
        
    };
    
    if (contextPath == '/') contextPath = '';
    
    $cntr.svg({loadURL: svgurl, onLoad: function(svg) {
        self.draw(svg);
    }});
    
};

function isInt(n) {
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}