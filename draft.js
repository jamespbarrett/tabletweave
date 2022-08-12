// The main script for the draft designer

var draft = new TDDDraft();
var view = new TDDSVGView();
var repeat = new TDDSVGView();
var fgcol = -1;

function control_vals() {
    var accordion = {};
    $('.accordion').each(function () {
        var id = $(this).parent().attr('id');
        var active = $(this).hasClass('active');
        accordion[id] = active;
    });

    return {
        addright: $("#addright").prop("checked"),
        lockdraft: $("#lockdraft").prop("checked"),
        fgcol: fgcol,
        scale: $('#scalecontrols .readout').val(),
        showtext: $("#showtext").prop("checked"),
        showovals: $("#showovals").prop("checked"),
        showupper: $("#showupper").prop("checked"),
        showlower: $("#showlower").prop("checked"),
        showreversal: $("#showreversal").prop("checked"),
        labelholescw: $("#labelholescw").prop("checked"),
        grey_saturation: $("#GREYSLIDER").val(),
        showhruler: $("#showhruler").prop("checked"),
        showvruler: $("#showvruler").prop("checked"),
        hruler: $("#hruler .readout").val(),
        vruler: $("#vruler .readout").val(),
        export_width: $('#export_width').val(),
        showrepeats: $("#showrepeats").prop("checked"),
        repeatstart: $("#repeatstart .readout").val(),
        repeatend: $("#repeatend .readout").val(),
        numrepeats: $("#numrepeats .readout").val(),
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

    var controls = (local_controls != undefined) ? JSON.parse(local_controls) : {};

    fgcol = (controls.fgcol != undefined) ? controls.fgcol : -1;

    $('#scalecontrols .readout').val((controls.scale != undefined) ? controls.scale : 0);
    $("#addright").prop("checked", ((controls.addright != undefined) ? controls.addright : true));
    $("#lockdraft").prop("checked", ((controls.lockdraft != undefined) ? controls.lockdraft : false));
    $("#showovals").prop("checked", ((controls.showovals != undefined) ? controls.showovals : true));
    $("#showtext").prop("checked", ((controls.showtext != undefined) ? controls.showtext : false));
    $("#showupper").prop("checked", ((controls.showupper != undefined) ? controls.showupper : true));
    $("#showlower").prop("checked", ((controls.showlower != undefined) ? controls.showlower : true));
    $("#showreversal").prop("checked", ((controls.showreversal != undefined) ? controls.showreversal : true));
    $("#GREYSLIDER").val(((controls.grey_saturation != undefined) ? controls.grey_saturation : 144));
    $("#labelholescw").prop("checked", ((controls.labelholescw != undefined) ? controls.labelholescw : true));
    $("#showhruler").prop("checked", ((controls.showhruler != undefined) ? controls.showhruler : true));
    $("#showvruler").prop("checked", ((controls.showvruler != undefined) ? controls.showvruler : true));
    $("#hruler .readout").val((controls.hruler != undefined) ? controls.hruler : 0);
    $("#vruler .readout").val((controls.vruler != undefined) ? controls.vruler : 0);
    $("#export_width").val((controls.export_width != undefined) ? controls.export_width : 1920);
    $("#showrepeats").prop("checked", ((controls.showrepeats != undefined) ? controls.showrepeats : false));
    $("#repeatstart .readout").val((controls.repeatstart != undefined) ? controls.repeatstart : 1);
    $("#repeatend .readout").val((controls.repeatend != undefined) ? controls.repeatend : 1);
    $("#numrepeats .readout").val((controls.numrepeats != undefined) ? controls.numrepeats : 1);

    if (controls.accordion) {
        for (const [key, value] of Object.entries(controls.accordion)) {
            var but = $("#" + key + " .accordion");
            if (value) {
                but.addClass('active');
                if (key === "controlbar") {
                    $("#" + key).addClass('open');
                }
            } else {
                but.removeClass('active');
            }
        }
    }

    if (local_draft != undefined) {
        draft = TDDDraftFromString(local_draft);
    }
}

function updateDraft() {
    var picks = parseInt($("#mainrowcontrols .readout").val());
    var holes = parseInt($("#lowrowcontrols .readout").val());
    var tablets = parseInt($("#colcontrols .readout").val());
    var addright = $("#addright").prop("checked");

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

    if (addright) {
        if (tablets < draft.tablets()) {
            draft.removeTabletsRight(draft.tablets() - tablets);
        } else if (tablets > draft.tablets()) {
            draft.addTabletsRight(tablets - draft.tablets());
        }
    } else {
        if (tablets < draft.tablets()) {
            draft.removeTabletsLeft(draft.tablets() - tablets);
        } else if (tablets > draft.tablets()) {
            draft.addTabletsLeft(tablets - draft.tablets());
        }
    }

    if ($("#hruler .readout").val() > draft.picks() + 1) {
        $("#hruler .readout").val(draft.picks() + 1);
    } else if ($("#hruler .readout").val() < -draft.holes()) {
        $("#hruler .readout").val(-draft.holes());
    }

    if ($("#vruler .readout").val() > draft.tablets() + 1) {
        $("#vruler .readout").val(draft.tablets() + 1);
    }

    if ($("#repeatstart .readout").val() > draft.picks()) {
        $("#repeatstart .readout").val(draft.picks());
    }

    if ($("#repeatend .readout").val() > draft.picks()) {
        $("#repeatend .readout").val(draft.picks());
    }

    saveToLocal();
}

function redraw() {
    var scale = Math.pow(2, parseInt($('#scalecontrols .readout').val()) / 10);

    view.conform(draft);
    if ($('#showrepeats').prop('checked')) {
        repeat.conform(draft);
    }

    var bbox = $('#draftcanvas svg')[0].getBBox();
    $('#draftcanvas svg').width(bbox.width * scale);
    $('#draftcanvas svg').height(bbox.height * scale);

    var i;
    for (i = 0; i <= 12; i++) {
        $("#NUM" + (i)).text(draft.threadCount(i - 1));
    }

    if ($('#showrepeats').prop('checked')) {
        $('#repeatsection').addClass('show');
    } else {
        $('#repeatsection').removeClass('show');
    }

    $('#threadinginstructions').text("");

    if ($('#showtext').prop('checked')) {
        for (i = 0; i < draft.tablets(); i++) {
            $('#threadinginstructions').append("<li class=\"instruction\">" + draft.describeTablet(i) + " (" + ($('#labelholescw').prop('checked') ? '&#x21BB;' : '&#x21BA;') + ")</li>");
            $('#threadinginstructions li').last().append('<ol type="A"></ol>');
            var ol = $('#threadinginstructions li').last().children().last();
            for (var j = 0; j < draft.holes(); j++) {
                if ($('#labelholescw').prop('checked')) {
                    ol.append('<li>' + draft.describeHole(i, j) + '</li>');
                } else {
                    ol.append('<li>' + draft.describeHole(i, draft.holes() - j - 1) + '</li>');
                }
            }
        }

        $('#turninginstructions').text("");
        for (i = 0; i < draft.picks(); i++) {
            $('#turninginstructions').append("<li class=\"instruction\">" + draft.describePick(i) + "</li>");
        }

        $('#textinstructions').addClass("show");
    } else {
        $('#textinstructions').removeClass("show");
    }

    if ($('#showrepeats').prop('checked')) {
        bbox = $('#repeatcanvas svg')[0].getBBox();
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
        $('#BOX' + (i + 1)).css("background-color", draft.colour(i).getCSSHexadecimalRGB());
        if (fgcol != i) {
            $('#BOX' + (i + 1)).removeClass("selected");
        } else {
            $('#BOX' + (i + 1)).addClass("selected");
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

        $('#REDVAL').prop("disabled", false);
        $('#GREENVAL').prop("disabled", false);
        $('#BLUEVAL').prop("disabled", false);
        $('#REDSLIDE').prop("disabled", false);
        $('#GREENSLIDE').prop("disabled", false);
        $('#BLUESLIDE').prop("disabled", false);
        $('#colourname').text(ntc.name(draft.colour(fgcol).getCSSHexadecimalRGB())[1]);
    } else {
        $('#REDVAL').val(0);
        $('#REDSLIDE').val(0);
        $('#GREENVAL').val(0);
        $('#GREENSLIDE').val(0);
        $('#BLUEVAL').val(0);
        $('#BLUESLIDE').val(0);

        $('#REDVAL').prop("disabled", true);
        $('#GREENVAL').prop("disabled", true);
        $('#BLUEVAL').prop("disabled", true);
        $('#REDSLIDE').prop("disabled", true);
        $('#GREENSLIDE').prop("disabled", true);
        $('#BLUESLIDE').prop("disabled", true);

        $('#colourname').text("");
    }
}

function draftClick(e) {
    if (!$("#lockdraft").prop("checked")) {
        const pt = this.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(this.getScreenCTM().inverse());
        var tablet = view.svg_coord_to_tablet(svgP.x, view, draft);
        var pick = view.svg_coord_to_pick(svgP.y, draft);
        var hole = view.svg_coord_to_hole(svgP.y, draft);

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
}

function setupNumberInput(id, min_val, max_val, callback, increment = 1) {
    var validate = function (new_val, min_val, max_val) {
        if (typeof (min_val) == "function") {
            min_val = min_val();
        }
        if (typeof (max_val) == "function") {
            max_val = max_val();
        }
        if (min_val != undefined && new_val < min_val) {
            new_val = min_val;
        } else if (max_val != undefined && new_val > max_val) {
            new_val = max_val;
        }
        return new_val;
    };
    $("#" + id + " .readout").change(function () {
        var new_val = validate(Math.round(parseFloat($("#" + id + " .readout").val()) / increment) * increment, min_val, max_val);
        $("#" + id + " .readout").val(new_val);
        callback();
    });
    $("#" + id + " .minus").click(function () {
        var new_val = validate((Math.round(parseFloat($("#" + id + " .readout").val()) / increment) - 1) * increment, min_val, max_val);
        $("#" + id + " .readout").val(new_val);
        callback();
    });
    $("#" + id + " .plus").click(function () {
        var new_val = validate((Math.round(parseFloat($("#" + id + " .readout").val()) / increment) + 1) * increment, min_val, max_val);
        $("#" + id + " .readout").val(new_val);
        callback();
    });

    $("#" + id + " .readout").val(validate(Math.round(parseFloat($("#" + id + " .readout").val()) / increment) * increment, min_val, max_val));
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
    view.hRuler($('#showhruler').prop('checked') ? $('#hruler .readout').val() : undefined);

    if ($("#vruler .readout").val() > draft.tablets() + 1) {
        $("#vruler .readout").val(draft.tablets() + 1);
    }
    view.vRuler($('#showvruler').prop('checked') ? $('#vruler .readout').val() : undefined);

    if ($("#repeatstart .readout").val() > draft.picks()) {
        $("#repeatstart .readout").val(draft.picks());
    }

    if ($("#repeatend .readout").val() > draft.picks()) {
        $("#repeatend .readout").val(draft.picks());
    }
}

function loadFile() {
    var files = $('#fileio #load')[0].files;
    if (files.length > 0) {
        var reader = new FileReader();

        reader.onload = (function (is_tdd) {
            return function (e) {
                try {
                    var data = e.target.result;

                    if (is_tdd) {
                        draft = TDDDraftFromString(data);
                    } else {
                        draft = json_to_tdd(JSON.parse(data));
                    }
                } catch (err) {
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
        var blob = new Blob([draft.toString()], { type: "text/plain;charset=utf-8" });
        saveAs(blob, filename);
    } catch (err) {
        alert("Could not save file, something went wrong");
        return;
    }
}

function reset() {
    draft = new TDDDraft();

    $('#scalecontrols .readout').val(0);
    $("#lockdraft").prop("checked", false);
    $("#showovals").prop("checked", true);
    $("#showupper").prop("checked", true);
    $("#showlower").prop("checked", true);
    $("#showreversal").prop("checked", true);
    $("#showtext").prop("checked", false);
    $("#GREYSLIDER").val(144);
    $("#addright").prop("checked", true);
    $("#labelholescw").prop("checked", true);

    $("#showhruler").prop("checked", false);
    $("#showvruler").prop("checked", false);

    $("#export_width").val(1920);

    $("#showrepeats").prop("checked", false);
    $("#repeatstart .readout").val(1);
    $("#repeatend .readout").val(1);
    $("#numrepeats .readout").val(1);

    saveToLocal();
    setControlsFromDraft();
    redraw();
    redrawControls();
}

function textDescriptionString() {
    var desc = " " + draft.name;
    desc += "\n" + ("=".repeat(draft.name.length + 2));

    desc += "\n\nThreading:";
    for (var i = 0; i < draft.tablets(); i++) {
        desc += "\n * " + draft.describeTablet(i) + " (" + String.fromCharCode($('#labelholescw').prop('checked') ? 0x21BB : 0x21BA) + ")";
        for (var j = 0; j < draft.holes(); j++) {
            var char = String.fromCharCode("A".charCodeAt(0) + j);
            desc += "\n    " + char + ": ";
            if ($('#labelholescw').prop('checked')) {
                desc += draft.describeHole(i, j);
            } else {
                desc += draft.describeHole(i, draft.holes() - j - 1);
            }
        }
    }
    desc += "\n\nTurning:";
    for (i = 0; i < draft.picks(); i++) {
        desc += "\n " + (i + 1) + ". " + draft.describePick(i);
    }
    desc += "\n";
    return desc;
}

function exportTextDescription() {
    var filename;
    if (draft.name != "") {
        filename = draft.name + ".txt";
    } else {
        filename = "draft.txt";
    }
    saveAs(new Blob([textDescriptionString()], { type: "text/plain" }), filename);
}

function exportDraft(mimetype, root) {
    var width = parseInt($("#export_width").val());

    var process_blob = function (blob) {
        var extension;
        var filename;

        if (mimetype == "image/jpeg") {
            extension = ".jpg";
        } else if (mimetype == "image/png") {
            extension = ".png";
        } else if (mimetype == "image/svg+xml") {
            extension = ".svg";
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
        process_blob(svg_to_blob(root));
    } else {
        svg_to_img(
            root,
            mimetype,
            width,
            process_blob);
    }
}

function applyAccordian() {
    $(".accordion").each(function () {
        if ($(this).hasClass("active")) {
            $(this).next().addClass("show");
        } else {
            $(this).next().removeClass("show");
        }
    });
}

$(function () {
    Cookies.json = true;

    $("#draftname .readout").change(function () { draft.name = $("#draftname .readout").val(); saveToLocal(); });

    setupNumberInput("scalecontrols", -100, 100, function () { saveToLocal(); redraw(); });
    setupNumberInput("mainrowcontrols", 1, undefined, function () { updateDraft(); redraw(); });
    setupNumberInput("lowrowcontrols", 1, 8, function () { updateDraft(); redraw(); });
    setupNumberInput("colcontrols", 1, undefined, function () { updateDraft(); redraw(); });
    $("#addright").change(function () { saveToLocal(); });
    $("#lockdraft").change(function () { saveToLocal(); });

    setupNumberInput("hruler", function () { return -draft.holes(); }, function () { return draft.picks() + 1; }, function () {
        view.hRuler($('#showhruler').prop('checked') ? $('#hruler .readout').val() : undefined); saveToLocal(); redraw();
    });
    setupNumberInput("vruler", 1, function () { return draft.tablets() + 1; }, function () {
        view.vRuler($('#showvruler').prop('checked') ? $('#vruler .readout').val() : undefined); saveToLocal(); redraw();
    });
    $("#showhruler").change(function () {
        view.hRuler($('#showhruler').prop('checked') ? $('#hruler .readout').val() : undefined); saveToLocal(); redraw();
    });
    $("#showvruler").change(function () {
        view.vRuler($('#showvruler').prop('checked') ? $('#vruler .readout').val() : undefined); saveToLocal(); redraw();
    });

    $("#showovals").change(function () { view.showOvals($("#showovals").prop('checked')); saveToLocal(); redraw(); });
    $("#showupper").change(function () { view.showTurning($("#showupper").prop('checked')); saveToLocal(); redraw(); });
    $("#showlower").change(function () { view.showThreading($("#showlower").prop('checked')); saveToLocal(); redraw(); });
    $("#showreversal").change(function () { view.showReversals($("#showreversal").prop('checked')); saveToLocal(); redraw(); });
    $("#showtext").change(function () { saveToLocal(); redraw(); });
    $("#labelholescw").change(function () { view.labelHolesCW($("#labelholescw").prop('checked')); saveToLocal(); redraw(); });

    $('#EMPTYBOX').click(function () { fgcol = -1; saveToLocal(); redrawControls(); });
    var i;
    for (i = 0; i < 12; i++) {
        (function (i) {
            $('#BOX' + (i + 1)).click(function () { fgcol = i; saveToLocal(); redrawControls(); });
        })(i);
    }

    $("#showrepeats").change(function () { saveToLocal(); redraw(); });
    setupNumberInput("repeatstart", 1, function () { return $("#repeatend .readout").val(); }, function () { repeat.startPick(parseInt($("#repeatstart .readout").val())); saveToLocal(); redraw(); });
    setupNumberInput("repeatend", function () { return $("#repeatstart .readout").val(); }, function () { return draft.picks(); }, function () { repeat.endPick(parseInt($("#repeatend .readout").val())); saveToLocal(); redraw(); });
    setupNumberInput("numrepeats", 1, undefined, function () { repeat.setRepeats(parseInt($("#numrepeats .readout").val())); saveToLocal(); redraw(); });

    $('#REDVAL').change(function () { updateRed($('#REDVAL').val()); redraw(); redrawControls(); });
    $('#REDSLIDE').change(function () { updateRed($('#REDSLIDE').val()); redraw(); redrawControls(); });
    $('#GREENVAL').change(function () { updateGreen($('#GREENVAL').val()); redraw(); redrawControls(); });
    $('#GREENSLIDE').change(function () { updateGreen($('#GREENSLIDE').val()); redraw(); redrawControls(); });
    $('#BLUEVAL').change(function () { updateBlue($('#BLUEVAL').val()); redraw(); redrawControls(); });
    $('#BLUESLIDE').change(function () { updateBlue($('#BLUESLIDE').val()); redraw(); redrawControls(); });

    $('#GREYSLIDER').change(function () { view.greySaturation(0x100 - $('#GREYSLIDER').val()); saveToLocal(); redraw(); });

    $("#fileio #load").change(function () { loadFile(); saveToLocal(); });
    $("#fileio #save").click(function () { saveFile(); });

    $("#clear").click(function () { draft.clearTurning(); setControlsFromDraft(); saveToLocal(); redraw(); redrawControls(); });
    $("#reset").click(function () { reset(); });
    $("#resetpallette").click(function () { draft.resetPalette(); setControlsFromDraft(); saveToLocal; redraw(); redrawControls(); })

    $('#draftexport #svg').click(function () { exportDraft('image/svg+xml', view.root()); });
    $('#draftexport #jpeg').click(function () { exportDraft('image/jpeg', view.root()); });
    $('#draftexport #png').click(function () { exportDraft('image/png', view.root()); });
    $('#draftexport #txt').click(function () { exportTextDescription(); });

    $('#repeatexport #svg').click(function () { exportDraft('image/svg+xml', repeat.root()); });
    $('#repeatexport #jpeg').click(function () { exportDraft('image/jpeg', repeat.root()); });
    $('#repeatexport #png').click(function () { exportDraft('image/png', repeat.root()); });

    $('#export_width').change(function () { saveToLocal(); });

    $('.accordion').click(function () {
        $(this).toggleClass("active");
        if ($(this).parent().attr("id") === 'controlbar') {
            $(this).parent().toggleClass('open');
        }
        applyAccordian();
        saveToLocal();
    });

    loadFromLocal();

    view.showOvals($("#showovals").prop('checked'));
    view.showTurning($("#showupper").prop('checked'));
    view.showThreading($("#showlower").prop('checked'));
    view.showReversals($("#showreversal").prop('checked'));
    view.greySaturation(0x100 - $('#GREYSLIDER').val());
    view.labelHolesCW($("#labelholescw").prop('checked'));
    view.hRuler($('#showhruler').prop('checked') ? $('#hruler .readout').val() : undefined);
    view.vRuler($('#showvruler').prop('checked') ? $('#vruler .readout').val() : undefined);

    repeat.showOvals(true);
    repeat.showThreading(false);
    repeat.showReversals(false);
    repeat.greySaturation(0xFF);
    repeat.hRuler(undefined);
    repeat.vRuler(undefined);

    repeat.startPick(parseInt($('#repeatstart .readout').val()));
    repeat.endPick(parseInt($('#repeatend .readout').val()));
    repeat.setRepeats(parseInt($('#numrepeats .readout').val()));

    applyAccordian();

    setControlsFromDraft();

    $('#draftcanvas').append(view.root());
    $('#draftcanvas svg').click(draftClick);

    $('#repeatcanvas').append(repeat.root());


    redraw();
    redrawControls();
})
