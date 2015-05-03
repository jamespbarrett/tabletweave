// The main script for the draft designer

var main_cells  = [];
var lower_cells = [];
var labels = [ "A", "B", "C", "D", "E", "F", "G", "H" ];

var cellwidth = 20;
var cellheight = 20;
var labelwidth = 20;
var cellborder = 2;
var intertablegap = 25;

var fgcol = "none";
var bgcol = "none";

var defaultcell = {
    "background_color": "#FFFFFF",
    "color": "#000000",
    "direction":"left"
};

function drawOval(ctx, x, y, length, bredth, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(bredth/length,1);
    ctx.arc(0, 0, length/2, 2*Math.PI, false);
    ctx.restore();
}

function redrawCanvas() {
    Cookies.set("tablet-draft", { "main" : main_cells, "lower" : lower_cells}, { expires: 366 });

    var c = $("#draftcanvas");
    var ctx = c[0].getContext("2d");

    var nRowsMain = main_cells.length;
    var nRowsLow  = lower_cells.length;
    var nCols     = main_cells[0].length;

    c.attr("width",  labelwidth + cellborder + (cellborder + cellwidth)*nCols);
    c.attr("height", cellborder + (cellborder + cellheight)*nRowsMain + intertablegap + cellborder + (cellborder + cellheight)*nRowsLow);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0, labelwidth + cellborder + (cellborder + cellwidth)*nCols, cellborder + (cellborder + cellheight)*nRowsMain + intertablegap + cellborder + (cellborder + cellheight)*nRowsLow);

    for (y = 0; y < nRowsMain; y++) {
        for (x = 0; x < nCols; x++) {
            ctx.fillStyle = main_cells[y][x]["background_color"];
            ctx.fillRect(labelwidth + (cellborder + cellwidth)*x, (cellborder + cellheight)*y, cellwidth + cellborder, cellheight + cellborder);
            ctx.fillStyle = main_cells[y][x]["color"];
            ctx.beginPath();
            if (main_cells[y][x]["direction"] == "left") {
                drawOval(ctx,
                         labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
                         cellborder + (cellborder + cellheight)*y + cellheight/2,
                         cellwidth, cellwidth/2, -Math.PI/4);
            } else {
                drawOval(ctx,
                         labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
                         cellborder + (cellborder + cellheight)*y + cellheight/2,
                         cellwidth, cellwidth/2, Math.PI/4);
            }
            ctx.lineWidth = 4;
            ctx.fill();
        }
    }
    for (y = 0; y < nRowsLow; y++) {
        for (x = 0; x < nCols; x++) {
            ctx.fillStyle = "#ffffff";//lower_cells[y][x]["background_color"];
            ctx.fillRect(labelwidth + (cellborder + cellwidth)*x, (cellborder + cellheight)*nRowsMain + intertablegap + (cellborder + cellheight)*y, cellwidth + cellborder, cellheight + cellborder);
            ctx.fillStyle = lower_cells[y][x]["color"];
            ctx.beginPath();
            if (lower_cells[y][x]["direction"] == "left") {
                drawOval(ctx,
                         labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
                         (cellborder + cellheight)*nRowsMain + intertablegap + cellborder + (cellborder + cellheight)*y + cellheight/2,
                         cellwidth, cellwidth/2, -Math.PI/4);
            } else {
                drawOval(ctx,
                         labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
                         (cellborder + cellheight)*nRowsMain + intertablegap + cellborder + (cellborder + cellheight)*y + cellheight/2,
                         cellwidth, cellwidth/2, Math.PI/4);
            }
            ctx.lineWidth = 4;
            ctx.fill();
        }
    }
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";

    ctx.beginPath();
    for (y = 0; y < nRowsMain + 1; y++) {
        ctx.moveTo(labelwidth, y*(cellborder + cellheight));
        ctx.lineTo(labelwidth + (cellborder + cellwidth)*nCols, y*(cellborder + cellheight))
    }
    for (x = 0; x < nCols + 1; x++) {
        ctx.moveTo(labelwidth + (cellborder + cellwidth)*x, 0);
        ctx.lineTo(labelwidth + (cellborder + cellwidth)*x, (cellborder + cellheight)*nRowsMain);
    }

    for (y = 0; y < nRowsLow + 1; y++) {
        ctx.moveTo(labelwidth, (cellborder + cellheight)*nRowsMain + intertablegap + y*(cellborder + cellheight));
        ctx.lineTo(labelwidth + (cellborder + cellwidth)*nCols, (cellborder + cellheight)*nRowsMain + intertablegap + y*(cellborder + cellheight))
    }
    for (x = 0; x < nCols + 1; x++) {
        ctx.moveTo(labelwidth + (cellborder + cellwidth)*x, (cellborder + cellheight)*nRowsMain + intertablegap);
        ctx.lineTo(labelwidth + (cellborder + cellwidth)*x, (cellborder + cellheight)*nRowsMain + intertablegap + (cellborder + cellheight)*nRowsLow);
    }
    ctx.lineWidth = cellborder;
    ctx.stroke();

    ctx.font = "15px Arial";
    for (y = 0; y < nRowsLow; y++) {
        ctx.fillText(labels[y], 2, (cellborder + cellheight)*nRowsMain + intertablegap + (cellborder + cellheight)*y + (cellheight + 15)/2);
    }
}

function updateSizes(m,l,c) {
    if (m < 1)
        m = 1;
    if (l < 1)
        l = 1;
    if (l > 8)
        l = 8;
    if (c < 1)
        c = 1;

    $("#mainrowcontrols .readout").val(m);
    $("#lowrowcontrols .readout").val(l);
    $("#colcontrols .readout").val(c);

    if (main_cells.length > m) {
        main_cells = main_cells.slice(main_cells.length - m, main_cells.length);
    } else if (main_cells.length < m) {
        for (y = 0; y < m - main_cells.length; y++) {
            var row = [];
            for (x = 0; x < c; x++) {
                row[x] = JSON.parse(JSON.stringify(defaultcell));
            }
            main_cells.unshift(row);
        }
    }

    if (lower_cells.length > l) {
        lower_cells = lower_cells.slice(0,l);
    } else if (lower_cells.length < l) {
        for (y = lower_cells.length; y < l; y++) {
            var row = [];
            for (x = 0; x < c; x++) {
                row[x] = JSON.parse(JSON.stringify(defaultcell));
            }
            lower_cells[y] = row;
        }
    }

    for (y = 0; y < main_cells.length; y++) {
        if (main_cells[y].length > c) {
            main_cells[y] = main_cells[y].slice(0,c);
        } else if (main_cells[y].length < c) {
            for (x = main_cells[y].length; x < c; x++) {
                main_cells[y][x] = JSON.parse(JSON.stringify(defaultcell));
            }
        }
    }

    for (y = 0; y < lower_cells.length; y++) {
        if (lower_cells[y].length > c) {
            lower_cells[y] = lower_cells[y].slice(0,c);
        } else if (lower_cells[y].length < c) {
            for (x = lower_cells[y].length; x < c; x++) {
                lower_cells[y][x] = JSON.parse(JSON.stringify(defaultcell));
            }
        }
    }

    redrawCanvas();
}

function cellClick(g,x,y) {
    var cell;
    if (g == 0) {
        cell = main_cells[y][x];

        if (fgcol != "none") {
            cell["color"] = fgcol;
        }
        if (bgcol != "none") {
            cell["background_color"] = bgcol;
        }

        if (fgcol == "none" && bgcol == "none") {
            if (cell["direction"] == "left") {
                cell["direction"] = "right";
            } else {
                cell["direction"] = "left";
            }
        }
    } else {
        cell = lower_cells[y][x];

        if (fgcol != "none") {
            cell["color"] = fgcol;
        } else {
            if (cell["direction"] == "left") {
                for (Y = 0; Y < lower_cells.length; Y++) {
                    lower_cells[Y][x]["direction"] = "right";
                }
            } else {
                for (Y = 0; Y < lower_cells.length; Y++) {
                    lower_cells[Y][x]["direction"] = "left";
                }
            }
        }
    }

    redrawCanvas();
}

function canvasClick(e) {
    var offs = $(this).offset();
    var x = e.pageX - offs.left;
    var y = e.pageY - offs.top;

    var nRowsMain = main_cells.length;
    var nRowsLow  = lower_cells.length;
    var nCols     = main_cells[0].length;

    if (x > labelwidth && y < (cellborder + cellheight)*nRowsMain) {
        var col = Math.floor((x - labelwidth - cellborder)/(cellwidth + cellborder));
        var row = Math.floor((y - cellborder)/(cellheight + cellborder));
        cellClick(0,col,row);
    }

    if (x > labelwidth && y > (cellborder + cellheight)*nRowsMain + intertablegap) {
        var col = Math.floor((x - labelwidth - cellborder)/(cellwidth + cellborder));
        var row = Math.floor((y - (cellborder + cellheight)*nRowsMain - intertablegap - cellborder)/(cellheight + cellborder));
        cellClick(1,col,row);
    }
}

function setForegroundColor(id) {
    if (id == "EMPTYBOX") {
        fgcol = "none";
    } else {
        fgcol = $("#palete #fg #" + id).css('backgroundColor');
    }

    $("#palete #fg .colorbox").each(function() {
        $(this).removeClass("selected");
    });
    $("#palete #fg #" + id).addClass("selected");
}

function setBackgroundColor(id) {
    if (id == "EMPTYBOX") {
        bgcol = "none";
    } else if (id == "WHITEBOX") {
        bgcol = "#ffffff";
    } else if (id == "GREYBOX") {
        bgcol = "#cccccc";
    }

    $("#palete #bg .colorbox").each(function() {
        $(this).removeClass("selected");
    });
    $("#palete #bg #" + id).addClass("selected");
}

function exportImage(mimetype) {
    Cookies.set("tablet-draft", { "main" : main_cells, "lower" : lower_cells}, { expires: 366 });
    var c = $("#draftcanvas")[0];
    var image = c.toDataURL(mimetype);
    window.open(image);
}

$(function() {
    Cookies.json = true;
    if (Cookies.get("tablet-draft") == undefined) {

        // Setup the initial cells
        main_cells[0] = [ JSON.parse(JSON.stringify(defaultcell)) ];

        lower_cells[0] = [ JSON.parse(JSON.stringify(defaultcell)) ];

        Cookies.set("tablet-draft", { "main" : main_cells, "lower" : lower_cells}, { expires: 366 });
    } else {
        var data = Cookies.get("tablet-draft");
        main_cells = data["main"];
        lower_cells = data["lower"];
        Cookies.set("tablet-draft", { "main" : main_cells, "lower" : lower_cells}, { expires: 366 });
    }

    $("#clear").click(function() {
        main_cells[0] = [ JSON.parse(JSON.stringify(defaultcell)) ];

        lower_cells[0] = [ JSON.parse(JSON.stringify(defaultcell)) ];

        updateSizes(1,1,1);
    });

    $("#mainrowcontrols .readout").val(main_cells.length);
    $("#lowrowcontrols .readout").val(lower_cells.length);
    $("#colcontrols .readout").val(main_cells[0].length);

    $("#mainrowcontrols .readout").change(function() { updateSizes(parseInt($("#mainrowcontrols .readout").val()),
                                                                   parseInt($("#lowrowcontrols .readout").val()),
                                                                   parseInt($("#colcontrols .readout").val())) });
    $("#mainrowcontrols .minus").click(function() { updateSizes(parseInt($("#mainrowcontrols .readout").val()) - 1,
                                                                parseInt($("#lowrowcontrols .readout").val()),
                                                                parseInt($("#colcontrols .readout").val())) });
    $("#mainrowcontrols .plus").click(function() { updateSizes(parseInt($("#mainrowcontrols .readout").val()) + 1,
                                                               parseInt($("#lowrowcontrols .readout").val()),
                                                               parseInt($("#colcontrols .readout").val())) });
    
    $("#lowrowcontrols .readout").change(function() { updateSizes(parseInt($("#mainrowcontrols .readout").val()),
                                                                  parseInt($("#lowrowcontrols .readout").val()),
                                                                  parseInt($("#colcontrols .readout").val())) });
    $("#lowrowcontrols .minus").click(function() { updateSizes(parseInt($("#mainrowcontrols .readout").val()),
                                                               parseInt($("#lowrowcontrols .readout").val()) - 1,
                                                               parseInt($("#colcontrols .readout").val())) });
    $("#lowrowcontrols .plus").click(function() { updateSizes(parseInt($("#mainrowcontrols .readout").val()),
                                                              parseInt($("#lowrowcontrols .readout").val()) + 1,
                                                              parseInt($("#colcontrols .readout").val())) });
    
    $("#colcontrols .readout").change(function() { updateSizes(parseInt($("#mainrowcontrols .readout").val()),
                                                               parseInt($("#lowrowcontrols .readout").val()),
                                                               parseInt($("#colcontrols .readout").val())) });
    $("#colcontrols .minus").click(function() { updateSizes(parseInt($("#mainrowcontrols .readout").val()),
                                                            parseInt($("#lowrowcontrols .readout").val()),
                                                            parseInt($("#colcontrols .readout").val()) - 1) });
    $("#colcontrols .plus").click(function() { updateSizes(parseInt($("#mainrowcontrols .readout").val()),
                                                           parseInt($("#lowrowcontrols .readout").val()),
                                                           parseInt($("#colcontrols .readout").val()) + 1) });

    $("#palete #fg .colorbox").click(function() {
        setForegroundColor($(this).attr("id"));
    });

    $("#palete #bg .colorbox").click(function() {
        setBackgroundColor($(this).attr("id"));
    });

    $("#export #jpeg").click(function() { exportImage("image/jpeg"); });

    $("#draftcanvas").mousedown(canvasClick);
    redrawCanvas();
})
