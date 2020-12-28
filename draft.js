// The main script for the draft designer

var draft = new TDDDraft();
var view = new TDDSVGView();
var fgcol = -1;

function control_vals() {
    var accordion = {};
    $('.accordion').each(function () {
        var id = $(this).parent().attr('id');
        var active = $(this).hasClass('active');
        accordion[id] = active;
    });

    return {
        fgcol: fgcol,
        scale: $('#scalecontrols .readout').val(),
        showovals: $("#showovals").prop("checked"),
        showlower: $("#showlower").prop("checked"),
        showreversal: $("#showreversal").prop("checked"),
        grey_saturation: $("#GREYSLIDER").val(),
        showhruler: $("#showhruler").prop("checked"),
        showvruler: $("#showvruler").prop("checked"),
        hruler: $("#hruler .readout").val(),
        vruler: $("#vruler .readout").val(),
        export_width: $('#export_width').val(),
        accordion: accordion,
    };
}

function saveToLocal() {
    localStorage.setItem("tdd-controls", JSON.stringify(control_vals()));
    localStorage.setItem("tdd-draft", draft.toString());
}

function loadFromLocal() {
    var local_controls = localStorage.getItem("tdd-controls");
    var local_draft = localStorage.getItem("tdd-draft");

    if (local_controls != undefined) {
        var controls = JSON.parse(local_controls);

        fgcol = (controls.fgcol != undefined)?controls.fgcol:-1;

        $('#scalecontrols .readout').val((controls.scale != undefined)?controls.scale:0);
        $("#showovals").prop("checked", ((controls.showovals != undefined)?controls.showovals:true));
        $("#showlower").prop("checked", ((controls.showlower != undefined)?controls.showlower:true));
        $("#showreversal").prop("checked", ((controls.showreversal != undefined)?controls.showreversal:true));
        $("#GREYSLIDER").val(((controls.grey_saturation != undefined)?controls.grey_saturation:144));
        $("#showhruler").prop("checked", ((controls.showhruler != undefined)?controls.showhruler:true));
        $("#showvruler").prop("checked", ((controls.showvruler != undefined)?controls.showvruler:true));
        $("#hruler .readout").val((controls.hruler != undefined)?controls.hruler:0);
        $("#vruler .readout").val((controls.vruler != undefined)?controls.vruler:0);
        $("#export_width").val((controls.export_width != undefined)?controls.export_width:1920);

        if (controls.accordion) {
            for (const [key, value] of Object.entries(controls.accordion)) {
                var but = $("#" + key + " .accordion");
                if (value) {
                    but.addClass('active');
                } else {
                    but.removeClass('active');
                }
            }
        }
    }

    if (local_draft != undefined) {
        draft = TDDDraftFromString(local_draft);
    }
}

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

    if ($("#hruler .readout").val() > draft.picks() + 1) {
        $("#hruler .readout").val(draft.picks() + 1);
    } else if ($("#hruler .readout").val() < -draft.holes()) {
        $("#hruler .readout").val(-draft.holes());
    }

    if ($("#vruler .readout").val() > draft.tablets() + 1) {
        $("#vruler .readout").val(draft.tablets() + 1);
    }

    saveToLocal();
}

function redraw() {
    var scale = Math.pow(2, parseInt($('#scalecontrols .readout').val()) / 10);
    var showovals = $("#showovals").prop("checked");
    var showlower = $("#showlower").prop("checked");
    var showreversal = $("#showreversal").prop("checked");
    var grey_saturation = 0x100 - $("#GREYSLIDER").val();
    var hruler_position = ($("#showhruler").prop("checked"))?$("#hruler .readout").val():undefined;
    var vruler_position = ($("#showvruler").prop("checked"))?$("#vruler .readout").val():undefined;

    view.conform(draft);

    var bbox = $('#draftcanvas svg')[0].getBBox();
    $('#draftcanvas svg').width(bbox.width * scale);
    $('#draftcanvas svg').height(bbox.height * scale);

    var i;
    for (i=0; i <= 12; i++) {
        $("#NUM" + (i)).text(draft.threadCount(i-1));
    }
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

        saveToLocal();
        redraw();
    }
}

function setupNumberInput(id, min_val, max_val, callback, increment=1) {
    var validate = function(new_val, min_val, max_val) {
        if (typeof(min_val) == "function") {
            min_val = min_val();
        }
        if (typeof(max_val) == "function") {
            max_val = max_val();
        }
        if (min_val != undefined && new_val < min_val) {
            new_val = min_val;
        } else if (max_val != undefined && new_val > max_val) {
            new_val = max_val;
        }
        return new_val;
    };
    $("#" + id + " .readout").change(function() {
        var new_val = validate(Math.round(parseFloat($("#" + id + " .readout").val())/increment)*increment, min_val, max_val);
        $("#" + id + " .readout").val(new_val);
        callback();
    });
    $("#" + id + " .minus").click(function() {
        var new_val = validate((Math.round(parseFloat($("#" + id + " .readout").val())/increment) - 1)*increment, min_val, max_val);
        $("#" + id + " .readout").val(new_val);
        callback();
    });
    $("#" + id + " .plus").click(function() {
        var new_val = validate((Math.round(parseFloat($("#" + id + " .readout").val())/increment) + 1)*increment, min_val, max_val);
        $("#" + id + " .readout").val(new_val);
        callback();
    });

    $("#" + id + " .readout").val(validate(Math.round(parseFloat($("#" + id + " .readout").val())/increment)*increment, min_val, max_val));
}

function updateRed(r) {
    var c = draft.colour(fgcol).getIntegerRGB();
    draft.setColour(fgcol, new RGBColour(r, c.g, c.b));
    saveToLocal();
}

function updateGreen(g) {
    var c = draft.colour(fgcol).getIntegerRGB();
    draft.setColour(fgcol, new RGBColour(c.r, g, c.b));
    saveToLocal();
}

function updateBlue(b) {
    var c = draft.colour(fgcol).getIntegerRGB();
    draft.setColour(fgcol, new RGBColour(c.r, c.g, b));
    saveToLocal();
}

function setControlsFromDraft() {
    $("#mainrowcontrols .readout").val(draft.picks());
    $("#lowrowcontrols .readout").val(draft.holes());
    $("#colcontrols .readout").val(draft.tablets());
    $("#draftname .readout").val(draft.name);

    if ($("#hruler .readout").val() > draft.picks() + 1) {
        $("#hruler .readout").val(draft.picks() + 1);
    } else if ($("#hruler .readout").val() < -draft.holes()) {
        $("#hruler .readout").val(-draft.holes());
    }

    if ($("#vruler .readout").val() > draft.tablets() + 1) {
        $("#vruler .readout").val(draft.tablets() + 1);
    }
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

                saveToLocal();
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

    $('#scalecontrols .readout').val(0);
    $("#showovals").prop("checked", true);
    $("#showlower").prop("checked", true);
    $("#showreversal").prop("checked", true);
    $("#GREYSLIDER").val(144);

    $("#showhruler").prop("checked", false);
    $("#showvruler").prop("checked", false);

    $("#hruler .readout").val(0);
    $("#vruler .readout").val(0);

    $("#export_width").val(1920);

    saveToLocal();
    setControlsFromDraft();
    redraw();
    redrawControls();
}

function exportDraft(mimetype) {
    var width = parseInt($("#export_width").val());
    var showovals = $("#showovals").prop("checked");
    var showlower = $("#showlower").prop("checked");
    var showreversal = $("#showreversal").prop("checked");
    var grey_saturation = 0x100 - $("#GREYSLIDER").val();
    var hruler_position = ($("#showhruler").prop("checked"))?$("#hruler .readout").val():undefined;
    var vruler_position = ($("#showvruler").prop("checked"))?$("#vruler .readout").val():undefined;

    var process_blob = function(blob) {
        var extension;
        var filename;

        if (mimetype == "image/jpeg") {
            extension = ".jpg";
        } else if (mimetype == "image/png") {
            extension = ".png";
        } else {
            extension = "";
        }
        if (draft.name != "") {
            filename = draft.name + extension;
        } else {
            filename = "draft" + extension;
        }
        saveAs(blob, filename);
    };

    if (mimetype == "image/svg+xml") {
        process_blob(svg_to_blob(view.root()));
    } else {
        svg_to_img_blob(
            view.root(),
            mimetype,
            width,
            process_blob);
    }
}

function applyAccordian() {
    $(".accordion").each(function () {
        if ($(this).hasClass("active")) {
            $(this).next().show();
        } else {
            $(this).next().hide();
        }
    });
}

$(function() {
    Cookies.json = true;

    $("#draftname .readout").change(function () { draft.name = $("#draftname .readout").val(); saveToLocal(); });

    setupNumberInput("scalecontrols", -100, 100, function() { saveToLocal(); redraw(); });
    setupNumberInput("mainrowcontrols", 1, undefined, function() { updateDraft(); redraw(); });
    setupNumberInput("lowrowcontrols", 1, 8, function() { updateDraft(); redraw(); });
    setupNumberInput("colcontrols", 1, undefined, function() { updateDraft(); redraw(); });

    setupNumberInput("hruler", function() { return -draft.holes(); }, function() { return draft.picks() + 1; }, function() {
        view.hRuler($('#showhruler').prop('checked')?$('#hruler .readout').val():undefined); saveToLocal(); redraw();
    });
    setupNumberInput("vruler", 1, function() { return draft.tablets() + 1; }, function() {
        view.vRuler($('#showvruler').prop('checked')?$('#vruler .readout').val():undefined); saveToLocal(); redraw();
    });
    $("#showhruler").change(function() {
        view.hRuler($('#showhruler').prop('checked')?$('#hruler .readout').val():undefined); saveToLocal(); redraw();
    });
    $("#showvruler").change(function() {
        view.vRuler($('#showvruler').prop('checked')?$('#vruler .readout').val():undefined); saveToLocal(); redraw();
    });

    $("#showovals").change(function() { view.showOvals($("#showovals").prop('checked')); saveToLocal(); redraw(); });
    $("#showlower").change(function() { view.showThreading($("#showlower").prop('checked')); saveToLocal(); redraw(); });
    $("#showreversal").change(function() { view.showReversals($("#showreversal").prop('checked')); saveToLocal(); redraw(); });

    $('#EMPTYBOX').click(function() { fgcol = -1; saveToLocal(); redrawControls(); });
    var i;
    for (i=0; i<12; i++) {
        (function (i) {
            $('#BOX' + (i+1)).click(function() { fgcol = i; saveToLocal(); redrawControls(); });
        })(i);
    }

    $('#REDVAL').change(function() { updateRed($('#REDVAL').val()); redraw(); redrawControls(); });
    $('#REDSLIDE').change(function() { updateRed($('#REDSLIDE').val()); redraw(); redrawControls(); });
    $('#GREENVAL').change(function() { updateGreen($('#GREENVAL').val()); redraw(); redrawControls(); });
    $('#GREENSLIDE').change(function() { updateGreen($('#GREENSLIDE').val()); redraw(); redrawControls(); });
    $('#BLUEVAL').change(function() { updateBlue($('#BLUEVAL').val()); redraw(); redrawControls(); });
    $('#BLUESLIDE').change(function() { updateBlue($('#BLUESLIDE').val()); redraw(); redrawControls(); });

    $('#GREYSLIDER').change(function() { view.greySaturation(0x100 - $('#GREYSLIDER').val()); saveToLocal(); redraw(); });

    $("#fileio #load").change(function() { loadFile(); saveToLocal(); });
    $("#fileio #save").click(function() { saveFile(); });

    $("#clear").click(function() { draft.clearTurning(); setControlsFromDraft(); saveToLocal(); redraw(); redrawControls(); });
    $("#reset").click(function() { reset(); });

    $('#draftexport #svg').click(function() { exportDraft('image/svg+xml'); });
    $('#draftexport #jpeg').click(function() { exportDraft('image/jpeg'); });
    $('#draftexport #png').click(function() { exportDraft('image/png'); });

    $('#export_width').change(function() { saveToLocal(); });

    $('.accordion').click(function() { $(this).toggleClass("active"); applyAccordian(); saveToLocal(); });

    loadFromLocal();

    view.showOvals($("#showovals").prop('checked'));
    view.showThreading($("#showlower").prop('checked'));
    view.showReversals($("#showreversal").prop('checked'));
    view.greySaturation(0x100 - $('#GREYSLIDER').val()) ;
    view.hRuler($('#showhruler').prop('checked')?$('#hruler .readout').val():undefined);
    view.vRuler($('#showvruler').prop('checked')?$('#vruler .readout').val():undefined);

    applyAccordian();

    setControlsFromDraft();

    $('#draftcanvas').append(view.root());
    $('#draftcanvas svg').click(draftClick);

    redraw();
    redrawControls();
})
