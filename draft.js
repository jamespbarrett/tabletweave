// The main script for the draft designer

var main_cells  = [];
var lower_cells = [];
var labels = [ "A", "B", "C", "D", "E", "F", "G", "H" ];
var palette = [ ];
var default_palette = [ 'rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(255, 0, 0)', 'rgb(0, 153, 0)', 'rgb(0, 0, 255)', 'rgb(221, 221, 221)', 'rgb(153, 153, 153)', 'rgb(255, 255, 0)', 'rgb(0, 255, 255)', 'rgb(153, 0, 153)', 'rgb(255, 136, 0)', 'rgb(255, 136, 136)' ];

var cellwidth = 20;
var cellheight = 20;
var labelwidth = 20;
var cellborder = 2;
var intertablegap = 25;
var copyrightheight = 20;
var copyrightwidth = 416;

var fgcol = "none";
var fgid = 0;
var reverse = "false";

var greycolour = "#909090";

var defaultcell = {
    "colorid" : 1,
    "color": "rgb(0, 0, 0)",
    "direction":"left",
};

function drawOval(ctx, x, y, length, bredth, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(bredth/length,1);
    ctx.arc(0, 0, length/2, 2*Math.PI, false);
    ctx.restore();
}

function max(a,b) { return (a > b)?a:b; }

function redrawCanvas() {
    save();

    var showovals = $("#showovals").prop("checked");

    var c = $("#draftcanvas");
    var ctx = c[0].getContext("2d");

    var nRowsMain = main_cells.length;
    var nRowsLow  = lower_cells.length;
    var nCols     = main_cells[0].length;

    var fullheight = cellborder + (cellborder + cellheight)*nRowsMain +
        intertablegap +
        cellborder + (cellborder + cellheight)*(nRowsLow + 1)
        + copyrightheight;
    var fullwidth = max(labelwidth + cellborder + (cellborder + cellwidth)*nCols, copyrightwidth);

    c.attr("width",  fullwidth);
    c.attr("height", fullheight);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0, fullwidth, fullheight);

    for (x = 0; x < nCols; x++) {
        n = nRowsLow - 1;
        reverse = 0;
        dir = "left";
        for (y = nRowsMain - 1; y >= 0; y--) {
            if (!reverse && !main_cells[y][x]) {
                bg = "#ffffff";
                fg = palette[lower_cells[n][x]["colorid"]];
                dir = lower_cells[n][x]["direction"];
                reverse = false;
                n = (nRowsLow + n - 1) % nRowsLow;
            } else if (reverse && !main_cells[y][x]) {
                bg = greycolour;
                fg = palette[lower_cells[n][x]["colorid"]];
                dir = lower_cells[n][x]["direction"];
                reverse = true;
                n = (n + 1) % nRowsLow;
            } else if (!reverse && main_cells[y][x]) {
                bg = greycolour;
                reverse = true;
                n = (n + 1) % nRowsLow;
                fg = palette[lower_cells[n][x]["colorid"]];
                dir = lower_cells[n][x]["direction"];
                n = (n + 1) % nRowsLow;
            } else {
                bg = "#ffffff";
                n = (nRowsLow + n - 1) % nRowsLow;
                reverse = false;
                fg = palette[lower_cells[n][x]["colorid"]];
                dir = lower_cells[n][x]["direction"];
                n = (nRowsLow + n - 1) % nRowsLow;
            }
            lower_cells[n][x]["color"] = fg;
            ctx.fillStyle = bg;
            ctx.fillRect(labelwidth + (cellborder + cellwidth)*x, (cellborder + cellheight)*y, cellwidth + cellborder, cellheight + cellborder);
            if (showovals) {
                ctx.fillStyle = fg;
                ctx.strokeStyle = "0x000000";
                ctx.beginPath();
                if (((dir == "left") != (reverse))) {
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
                ctx.lineWidth = 1;
                ctx.fill();
                ctx.stroke();
            }
        }
    }
    for (y = 0; y < nRowsLow; y++) {
        for (x = 0; x < nCols; x++) {
            ctx.fillStyle = "#ffffff";//lower_cells[y][x]["background_color"];
            ctx.fillRect(labelwidth + (cellborder + cellwidth)*x, (cellborder + cellheight)*nRowsMain + intertablegap + (cellborder + cellheight)*y, cellwidth + cellborder, cellheight + cellborder);
            ctx.fillStyle = palette[lower_cells[y][x]["colorid"]];
            ctx.strokeStyle = "0x000000";
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
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.stroke();
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
    for (x = 0; x < nCols; x++) {
        ctx.fillText(x + 1,  labelwidth + (cellborder + cellwidth)*x +  (cellwidth - 8)/2,
                     (cellborder + cellheight)*nRowsMain + intertablegap - 3);
    }
    for (y = 0; y < nRowsMain; y++) {
        ctx.fillText("" + (nRowsMain - y), 2, (cellborder + cellheight)*y + (cellheight + 15)/2);
    }
    for (y = 0; y < nRowsLow; y++) {
        ctx.fillText(labels[y], 2, (cellborder + cellheight)*nRowsMain + intertablegap + (cellborder + cellheight)*y + (cellheight + 15)/2);
    }
    for (x = 0; x < nCols; x++) {
        if (lower_cells[0][x]["direction"] == "left") {
            ctx.fillText("Z", labelwidth + (cellborder + cellwidth)*x +  (cellwidth - 8)/2,
                         (cellborder + cellheight)*nRowsMain + intertablegap + (cellborder + cellheight)*nRowsLow + (cellheight + 15)/2);
        } else {
            ctx.fillText("S", labelwidth + (cellborder + cellwidth)*x +  (cellwidth - 8)/2,
                         (cellborder + cellheight)*nRowsMain + intertablegap + (cellborder + cellheight)*nRowsLow + (cellheight + 15)/2);
        }
    }

    ctx.font = "10px Arial";
    ctx.fillText("Made using Tablet Weaving Draft Designer v0.1 http://http://www.bazzalisk.org/tabletweave/",
                 2,
                 fullheight - 10);

    for (clr = 0; clr < palette.length; clr++) {
        n = 0;
        for (row = 0; row < lower_cells.length; row++) {
            for (col = 0; col < lower_cells[row].length; col++) {
                if (lower_cells[row][col]['colorid'] == clr)
                    n++;
            }
        }
        $("#NUM" + (clr + 1)).text(n);
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
                row[x] = 0;
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
                main_cells[y][x] = 0;
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

    for (y = 1; y < lower_cells.length; y++) {
        for (x = 0; x < lower_cells[y].length; x++) {
            lower_cells[y][x]["direction"] = lower_cells[0][x]["direction"];
        }
    }

    redrawCanvas();
}

function cellClick(g,x,y) {
    var cell;
    if (g == 0) {
        main_cells[y][x] = !main_cells[y][x];
    } else {
        if (y < lower_cells.length && fgcol != "none") {
            cell = lower_cells[y][x];
            cell["color"] = fgcol;
            cell["colorid"] = fgid;
        } else if (y <= lower_cells.length) {
            cell = lower_cells[0][x];
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
        fgid = -1;
    } else {
        fgcol = $("#palete #fg #" + id).css('backgroundColor');
        fgid = parseInt(id.slice(3)) - 1;
    }

    $("#palete #fg .colorbox").each(function() {
        $(this).removeClass("selected");
    });
    $("#palete #fg #" + id).addClass("selected");

    var rgb = /rgb\((\d+), (\d+), (\d+)\)/.exec(fgcol);

    $("#REDSLIDE").val(rgb[1]);
    $("#REDVAL").val(rgb[1]);

    $("#GREENSLIDE").val(rgb[2]);
    $("#GREENVAL").val(rgb[2]);

    $("#BLUESLIDE").val(rgb[3]);
    $("#BLUEVAL").val(rgb[3]);
}

function save() {
    localStorage.setItem("tablet-draft-main", JSON.stringify(main_cells));
    localStorage.setItem("tablet-draft-lower", JSON.stringify(lower_cells));
    localStorage.setItem("tablet-draft-palette", JSON.stringify(palette));
}

function save_file() {
    var tmp = { 'main_cells'  : main_cells,
                'lower_cells' : lower_cells,
                'palette'     : palette };
    var link = document.createElement('a');
    link.download = "draft.json";
    link.href = 'data:application/json;charset=utf-8,' + escape(JSON.stringify(tmp));
    link.click();
}

function load_file() {
    var x = document.getElementById("load");

    if (x.files.length > 0) {
        var reader = new FileReader();
        reader.onload = (function(f) {
            return function (e) {
                tmp = JSON.parse(e.target.result);
                main_cells = tmp['main_cells'];
                lower_cells = tmp['lower_cells'];
                if (tmp['palette'] != undefined) {
                    palette = tmp['palette'];
                } else {
                    palette = JSON.parse(JSON.stringify(default_palette));
                }
                for (r = 0; r < lower_cells.length; r++) {
                    for (c = 0; c < lower_cells[r].length; c++) {
                        if (lower_cells[r][c]['colorid'] == undefined) {
                            for (i = 0; i < palette.length; i++) {
                                if (lower_cells[r][c]['color'] == palette[i]) {
                                    lower_cells[r][c]['colorid'] = i;
                                }
                            }
                            if (lower_cells[r][c]['colorid'] == undefined) {
                                lower_cells[r][c]['colorid'] = 0;
                            }
                        }
                    }
                }
                updateSizes(main_cells.length, lower_cells.length, main_cells[0].length);
                save();
                redrawCanvas();
            };
        })(x.files[0]);

        reader.readAsText(x.files[0]);
    }
}

function load() {
    if (localStorage.getItem("tablet-draft-main") == undefined) {

        // Setup the initial cells
        main_cells[0] = [ JSON.parse(JSON.stringify(defaultcell)) ];

        lower_cells[0] = [ JSON.parse(JSON.stringify(defaultcell)) ];
    } else {
        main_cells  = JSON.parse(localStorage.getItem("tablet-draft-main"));
        lower_cells = JSON.parse(localStorage.getItem("tablet-draft-lower"));
    }

    if (localStorage.getItem("tablet-draft-palette") == undefined) {
        palette = JSON.parse(JSON.stringify(default_palette));
    } else {
        paletter = JSON.parse(localStorage.getItem("tablet-draft-palette"));
    }
    for (r = 0; r < lower_cells.length; r++) {
        for (c = 0; c < lower_cells[r].length; c++) {
            if (lower_cells[r][c]['colorid'] == undefined) {
                for (i = 0; i < palette.length; i++) {
                    if (lower_cells[r][c]['color'] == palette[i]) {
                        lower_cells[r][c]['colorid'] = i;
                    }
                }
                if (lower_cells[r][c]['colorid'] == undefined) {
                    lower_cells[r][c]['colorid'] = 0;
                }
            }
        }
    }

    save();
}

function exportImage(mimetype) {
    save();
    var c = $("#draftcanvas")[0];
    var image = c.toDataURL(mimetype);
    $("#preview").attr("src", image);
    $("#messagepopup").show();
    $(".closepreview").focus();
}

function updatePalette(r,g,b) {
    palette[fgid] = "rgb(" + r + ", " + g + " ," + b + ")";
    $("#REDSLIDE").val(r);
    $("#REDVAL").val(r);
    $("#GREENSLIDE").val(g);
    $("#GREENVAL").val(g);
    $("#BLUESLIDE").val(b);
    $("#BLUEVAL").val(b);
    $("#BOX" + (fgid + 1)).css("background-color", palette[fgid]);
    redrawCanvas();
}

$(function() {
    Cookies.json = true;
    palette = JSON.parse(JSON.stringify(default_palette));
    load();

    $("#reset").click(function() {
        updateSizes(1,1,1);

        main_cells[0] = [ false ];

        lower_cells[0] = [ JSON.parse(JSON.stringify(defaultcell)) ];

        palette = JSON.parse(JSON.stringify(default_palette));

        redrawCanvas();
    });

    $("#clear").click(function() {
        for (y = 0; y < main_cells.length; y++) {
            for (x = 0; x < main_cells[y].length; x++) {
                main_cells[y][x] = false;
            }
        }

        redrawCanvas();
    });

    $("#showovals").change(function() { redrawCanvas(); });

    $("#mainrowcontrols .readout").val(main_cells.length);
    $("#lowrowcontrols .readout").val(lower_cells.length);
    $("#colcontrols .readout").val(main_cells[0].length);

    $("#REDSLIDE").change(function() { updatePalette($("#REDSLIDE").val(), $("#GREENSLIDE").val(), $("#BLUESLIDE").val()); });
    $("#REDVAL").change(function() { updatePalette($("#REDVAL").val(), $("#GREENSLIDE").val(), $("#BLUESLIDE").val()); });
    $("#GREENSLIDE").change(function() { updatePalette($("#REDSLIDE").val(), $("#GREENSLIDE").val(), $("#BLUESLIDE").val()); });
    $("#GREENVAL").change(function() { updatePalette($("#REDSLIDE").val(), $("#GREENVAL").val(), $("#BLUESLIDE").val()); });
    $("#BLUESLIDE").change(function() { updatePalette($("#REDSLIDE").val(), $("#GREENSLIDE").val(), $("#BLUESLIDE").val()); });
    $("#BLUEVAL").change(function() { updatePalette($("#REDSLIDE").val(), $("#GREENSLIDE").val(), $("#BLUEVAL").val()); });

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
    $("#messagepopup .closepreview").click(function() { $("#messagepopup").hide(); });

    $("#palete #fg .colorbox").each(function() {
        for (i = 0; i < palette.length; i++)
            if ($(this).attr("id") == "BOX" + (i + 1))
                $(this).css("background-color", palette[i]);
    });

    $("#palete #fg .colorbox").click(function() {
        setForegroundColor($(this).attr("id"));
    });

    $("#export #jpeg").click(function() { exportImage("image/jpeg"); });
    $("#export #png").click(function() { exportImage("image/png"); });

    $("#fileio #save").click(function() { save_file(); });

    $("#fileio #load").change(function() { load_file(); });

    $("#draftcanvas").mousedown(canvasClick);
    redrawCanvas();
})
