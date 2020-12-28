/* This script contains a function that can convert a tdd structure to a data URL */

function svg_to_blob(svg) {
    var data = (new XMLSerializer()).serializeToString(svg);
    return new Blob([data], {type: "image/svg+xml;charset=utf-8"});
}

function svg_to_url(svg) {
    var DOMURL = window.URL || window.webkitURL || window;
    return DOMURL.createObjectURL(svg_to_blob(svg));
}

function draw_svg_to_canvas(
    svg,
    canvas,
    onload=function() {}
) {
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

function svg_to_img(
    svg,
    mimetype,
    width=1920,
    onload=function(url) {}
) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    draw_svg_to_canvas(svg, canvas, function () {
        var url = canvas.toDataURL(mimetype, 1.0);
        onload(url);
    });
}

function svg_to_img_blob(
    svg,
    mimetype,
    width=1920,
    onload=function(blob) {}
) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    draw_svg_to_canvas(svg, canvas, function () {
        canvas.toBlob(onload, mimetype, 1.0);
    });
}