// The main script for the draft designer

var draft = new TDDDraft();
var fgcol = -1;

function updateDraft() {
    var picks   = parseInt($("#mainrowcontrols .readout").val());
    var holes   = parseInt($("#lowrowcontrols .readout").val());
    var tablets = parseInt($("#colcontrols .readout").val());

    if (picks < draft.picks()) {
        draft.removePicks(draft.picks() - picks);
    } else if (picks > draft.picks()) {
        draft.addPicks(picks - draft.picks());
    }

    if (holes < draft.holes()) {
        draft.removeHoles(draft.holes() - holes);
    } else if (holes > draft.holes()) {
        draft.addHoles(holes - draft.holes());
    }

    if (tablets < draft.tablets()) {
        draft.removeTablets(draft.tablets() - tablets);
    } else if (tablets > draft.tablets()) {
        draft.addTablets(tablets - draft.tablets());
    }
}

function redraw() {
    var scale = $('#scalecontrols .readout').val();
    var showovals = $("#showovals").prop("checked");
    var showlower = $("#showlower").prop("checked");
    var showreversal = $("#showreversal").prop("checked");
    var grey_saturation = 0x100 - $("#GREYSLIDER").val();

    $('#draftcanvas').text("");
    $('#draftcanvas').append(tdd_to_svg(
        draft,
        showlower,
        showovals,
        showreversal,
        grey_saturation
    ));
    var bbox = $('#draftcanvas svg')[0].getBBox();
    $('#draftcanvas svg').width(bbox.width * scale);
    $('#draftcanvas svg').height(bbox.height * scale);

    $('#draftcanvas svg').click(draftClick);
}

function redrawControls() {
    if (fgcol == -1) {
        $('#EMPTYBOX').addClass('selected');
    } else {
        $('#EMPTYBOX').removeClass('selected');
    }

    var i;
    for (i = 0; i < 12; i++) {
        $('#BOX' + (i+1)).css("background-color", draft.colour(i).getCSSHexadecimalRGB());
        if (fgcol != i) {
            $('#BOX' + (i+1)).removeClass("selected");
        } else {
            $('#BOX' + (i+1)).addClass("selected");
        }
    }

    if (fgcol != -1) {
        var c = draft.colour(fgcol).getIntegerRGB();
        $('#REDVAL').val(c.r);
        $('#REDSLIDE').val(c.r);
        $('#GREENVAL').val(c.g);
        $('#GREENSLIDE').val(c.g);
        $('#BLUEVAL').val(c.b);
        $('#BLUESLIDE').val(c.b);

        $('#REDVAL').prop( "disabled", false );
        $('#GREENVAL').prop( "disabled", false );
        $('#BLUEVAL').prop( "disabled", false );
        $('#REDSLIDE').prop( "disabled", false );
        $('#GREENSLIDE').prop( "disabled", false );
        $('#BLUESLIDE').prop( "disabled", false );
    } else {
        $('#REDVAL').val(0);
        $('#REDSLIDE').val(0);
        $('#GREENVAL').val(0);
        $('#GREENSLIDE').val(0);
        $('#BLUEVAL').val(0);
        $('#BLUESLIDE').val(0);

        $('#REDVAL').prop( "disabled", true );
        $('#GREENVAL').prop( "disabled", true );
        $('#BLUEVAL').prop( "disabled", true );
        $('#REDSLIDE').prop( "disabled", true );
        $('#GREENSLIDE').prop( "disabled", true );
        $('#BLUESLIDE').prop( "disabled", true );
    }
}

function draftClick(e) {
    const pt = this.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform( this.getScreenCTM().inverse() );
    var tablet = svg_coord_to_tablet(svgP.x);
    var pick = svg_coord_to_pick(svgP.y, draft);
    var hole = svg_coord_to_hole(svgP.y, draft);

    if (tablet >= 0) {
        if (pick >= 0) {
            draft.reverse(tablet, pick);
        } else if (hole >= 0) {
            draft.setThreadColour(tablet, hole, fgcol);
        } else {
            draft.flip(tablet);
        }

        redraw();
    }
}

function setupNumberInput(id, min_val, max_val, callback) {
    var validate = function(new_val, min_val, max_val) {
        if (min_val != undefined && new_val < min_val) {
            new_val = min_val;
        } else if (max_val != undefined && new_val > max_val) {
            new_val = max_val;
        }
        return new_val;
    };
    $("#" + id + " .readout").change(function() {
        var new_val = validate(parseInt($("#" + id + " .readout").val()), min_val, max_val);
        $("#" + id + " .readout").val(new_val);
        callback();
    });
    $("#" + id + " .minus").click(function() {
        var new_val = validate(parseInt($("#" + id + " .readout").val()) - 1, min_val, max_val);
        $("#" + id + " .readout").val(new_val);
        callback();
    });
    $("#" + id + " .plus").click(function() {
        var new_val = validate(parseInt($("#" + id + " .readout").val()) + 1, min_val, max_val);
        $("#" + id + " .readout").val(new_val);
        callback();
    });

    $("#" + id + " .readout").val(validate(parseInt($("#" + id + " .readout").val()), min_val, max_val));
}

function updateRed(r) {
    var c = draft.colour(fgcol).getIntegerRGB();
    draft.setColour(fgcol, new RGBColour(r, c.g, c.b));
}

function updateGreen(g) {
    var c = draft.colour(fgcol).getIntegerRGB();
    draft.setColour(fgcol, new RGBColour(c.r, g, c.b));
}

function updateBlue(b) {
    var c = draft.colour(fgcol).getIntegerRGB();
    draft.setColour(fgcol, new RGBColour(c.r, c.g, b));
}

function setControlsFromDraft() {
    $("#mainrowcontrols .readout").val(draft.picks());
    $("#lowrowcontrols .readout").val(draft.holes());
    $("#colcontrols .readout").val(draft.tablets());
    $("#draftname .readout").val(draft.name);
}

function loadFile() {
    var files = $('#fileio #load')[0].files;
    if (files.length > 0) {
        var reader = new FileReader();

        reader.onload = (function(is_tdd) {
            return function (e) {
                try {
                    var data = e.target.result;

                    if (is_tdd) {
                        draft = TDDDraftFromString(data);
                    } else {
                        draft = json_to_tdd(JSON.parse(data));
                    }
                } catch(err) {
                    alert("File is corrupted and could not be loaded.");
                    return;
                }
                setControlsFromDraft();
                redrawControls();
                redraw();
            };
        })(/^.*\.tdd$/.test(files[0].name));

        reader.readAsText(files[0]);
    }
}

function saveFile() {
    try {
        if (draft.name != "") {
            filename = draft.name + ".tdd";
        } else {
            filename = "draft.tdd";
        }
        var blob = new Blob([draft.toString()], { type: "text/plain;charset=utf-8"});
        saveAs(blob, filename);
    } catch (err) {
        alert("Could not save file, something went wrong");
        return;
    }
}

function reset() {
    draft = new TDDDraft();

    $('#scalecontrols .readout').val(1);
    $("#showovals").prop("checked", true);
    $("#showlower").prop("checked", true);
    $("#showreversal").prop("checked", true);
    $("#GREYSLIDER").val(144);

    setControlsFromDraft();
    redraw();
    redrawControls();
}

$(function() {
    Cookies.json = true;

    $("#draftname .readout").change(function () { draft.name = $("#draftname .readout").val(); });

    setupNumberInput("scalecontrols", 1, undefined, redraw);
    setupNumberInput("mainrowcontrols", 1, undefined, function() { updateDraft(); redraw(); });
    setupNumberInput("lowrowcontrols", 1, 8, function() { updateDraft(); redraw(); });
    setupNumberInput("colcontrols", 1, undefined, function() { updateDraft(); redraw(); });

    $("#showovals").change(function() { redraw(); });
    $("#showlower").change(function() { redraw(); });
    $("#showreversal").change(function() { redraw(); });

    $('#EMPTYBOX').click(function() { fgcol = -1; redrawControls(); });
    var i;
    for (i=0; i<12; i++) {
        (function (i) {
            $('#BOX' + (i+1)).click(function() { fgcol = i; redrawControls(); });
        })(i);
    }

    $('#REDVAL').change(function() { updateRed($('#REDVAL').val()); redraw(); redrawControls(); });
    $('#REDSLIDE').change(function() { updateRed($('#REDSLIDE').val()); redraw(); redrawControls(); });
    $('#GREENVAL').change(function() { updateGreen($('#GREENVAL').val()); redraw(); redrawControls(); });
    $('#GREENSLIDE').change(function() { updateGreen($('#GREENSLIDE').val()); redraw(); redrawControls(); });
    $('#BLUEVAL').change(function() { updateBlue($('#BLUEVAL').val()); redraw(); redrawControls(); });
    $('#BLUESLIDE').change(function() { updateBlue($('#BLUESLIDE').val()); redraw(); redrawControls(); });

    $('#GREYSLIDER').change(function() { redraw(); });

    $("#fileio #load").change(function() { loadFile(); });
    $("#fileio #save").click(function() { saveFile(); });

    $("#clear").click(function() { draft = new TDDDraft(); setControlsFromDraft(); redraw(); redrawControls(); });
    $("#reset").click(function() { reset(); });

    setControlsFromDraft();
    redraw();
    redrawControls();
})
