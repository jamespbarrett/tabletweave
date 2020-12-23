/* This script contains a function that can convert a tdd structure to a data URL */

function svg_to_blob(svg) {
    var data = (new XMLSerializer()).serializeToString(svg);
    return new Blob([data], {type: "image/svg+xml;charset=utf-8"});
}

function svg_to_url(svg) {
    var DOMURL = window.URL || window.webkitURL || window;
    return DOMURL.createObjectURL(svg_to_blob(svg));
}

function tdd_to_svg_blob(
    draft,
    show_threading=true,
    show_ovals=true,
    show_reversals=true,
    grey_saturation=0x99
) {
    return svg_to_blob(
        tdd_to_svg(
            draft,
            show_threading,
            show_ovals,
            show_reversals,
            grey_saturation));
}

function draw_tdd_to_canvas(
    draft,
    canvas,
    onload=function() {},
    show_threading=true,
    show_ovals=true,
    show_reversals=true,
    grey_saturation=0x99,
) {
    var svg = tdd_to_svg(draft, show_threading, show_ovals, show_reversals, grey_saturation);

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var img = new Image();
    img.onload = function () {
        height = img.naturalHeight * (canvas.width / img.naturalWidth);
        canvas.height = height;
        ctx.drawImage(img, 0, 0, canvas.width, height);
        onload();
    };
    img.src = svg_to_url(svg);
}

function tdd_to_img(
    draft,
    mimetype,
    width=1920,
    onload=function(url) {},
    show_threading=true,
    show_ovals=true,
    show_reversals=true,
    grey_saturation=0x99,
) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    draw_tdd_to_canvas(draft, canvas, function () {
        var url = canvas.toDataURL(mimetype, 1.0);
        onload(url);
    }, show_threading, show_ovals, show_reversals, grey_saturation);
}

function tdd_to_img_blob(
    draft,
    mimetype,
    width=1920,
    onload=function(blob) {},
    show_threading=true,
    show_ovals=true,
    show_reversals=true,
    grey_saturation=0x99,
) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    draw_tdd_to_canvas(draft, canvas, function () {
        canvas.toBlob(onload, mimetype, 1.0);
    }, show_threading, show_ovals, show_reversals, grey_saturation);
}