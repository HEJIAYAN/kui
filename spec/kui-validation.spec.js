describe('range test', function () {
    var form = $('<div>');
    form.append('<input name="range" domain-type="[0, 1)" label="区间" value="0.234">');
    
    var elms = form.validate(form);
    expect(elms.length == 0).toBe(true);
});