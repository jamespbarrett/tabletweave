// The main script for the draft designer

var main_cells  = [];
var lower_cells = [];
var labels = [ "A", "B", "C", "D", "E", "F", "G", "H" ];

var cellwidth = 20;
var cellheight = 20;
var labelwidth = 20;
var cellborder = 2;
var intertablegap = 25;

function redrawCanvas() {
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
            ctx.fillStyle = main_cells[y][x].background_color;
            ctx.fillRect(labelwidth + cellborder + (cellborder + cellwidth)*x, cellborder + (cellborder + cellheight)*y, cellwidth, cellheight);
            ctx.strokeStyle = main_cells[y][x].color;
            ctx.beginPath();
            if (main_cells[y][x].direction == "left") {
                ctx.moveTo(labelwidth + cellborder + (cellborder + cellwidth)*x, cellborder + (cellborder + cellheight)*y);
                ctx.lineTo(labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth, cellborder + (cellborder + cellheight)*y + cellheight);
            } else {
                ctx.moveTo(labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth, cellborder + (cellborder + cellheight)*y);
                ctx.lineTo(labelwidth + cellborder + (cellborder + cellwidth)*x, cellborder + (cellborder + cellheight)*y + cellheight);
            }
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    }
    for (y = 0; y < nRowsLow; y++) {
        for (x = 0; x < nCols; x++) {
            ctx.fillStyle = lower_cells[y][x].background_color;
            ctx.fillRect(labelwidth + cellborder + (cellborder + cellwidth)*x, (cellborder + cellheight)*nRowsMain + intertablegap + cellborder + (cellborder + cellheight)*y, cellwidth, cellheight);
            ctx.strokeStyle = lower_cells[y][x].color;
            ctx.beginPath();
            if (main_cells[y][x].direction == "left") {
                ctx.moveTo(labelwidth + cellborder + (cellborder + cellwidth)*x, (cellborder + cellheight)*nRowsMain + intertablegap + cellborder + (cellborder + cellheight)*y);
                ctx.lineTo(labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth, (cellborder + cellheight)*nRowsMain + intertablegap + cellborder + (cellborder + cellheight)*y + cellheight);
            } else {
                ctx.moveTo(labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth, (cellborder + cellheight)*nRowsMain + intertablegap + cellborder + (cellborder + cellheight)*y);
                ctx.lineTo(labelwidth + cellborder + (cellborder + cellwidth)*x, (cellborder + cellheight)*nRowsMain + intertablegap + cellborder + (cellborder + cellheight)*y + cellheight);
            }
            ctx.lineWidth = 4;
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
        ctx.lineTo(labelwidth + (cellborder + cellwidth)*x, (cellborder + cellheight)*nRowsMain + intertablegap + (cellborder + cellheight)*nRowsMain);
    }
    ctx.lineWidth = cellborder;
    ctx.stroke();

    ctx.font = "15px Arial";
    for (y = 0; y < nRowsLow; y++) {
        ctx.fillText(labels[y], 2, (cellborder + cellheight)*nRowsMain + intertablegap + (cellborder + cellheight)*y + (cellheight + 15)/2);
    }
}

$(function() {
    // Setup the initial cells
    main_cells[0] = [ {
        background_color: "#FFFFFF",
        color: "#000000",
        direction:"left"
    } ];

    lower_cells[0] = [ {
        background_color: "#FFFFFF",
        color: "#000000",
        direction:"left"
    } ];
    redrawCanvas();
})
