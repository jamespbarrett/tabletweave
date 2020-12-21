// The main script for the draft designer

var draft = new TDDDraft();

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

    $('#draftcanvas').text("");
    $('#draftcanvas').append(tdd_to_svg(draft, showlower, showovals, showreversal));
    var bbox = $('#draftcanvas svg')[0].getBBox();
    $('#draftcanvas svg').width(bbox.width * scale);
    $('#draftcanvas svg').height(bbox.height * scale);
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

$(function() {
    Cookies.json = true;

    setupNumberInput("scalecontrols", 1, undefined, redraw);
    setupNumberInput("mainrowcontrols", 1, undefined, function() { updateDraft(); redraw(); });
    setupNumberInput("lowrowcontrols", 1, 8, function() { updateDraft(); redraw(); });
    setupNumberInput("colcontrols", 1, undefined, function() { updateDraft(); redraw(); });

    $("#showovals").change(function() { redraw(); });
    $("#showlower").change(function() { redraw(); });
    $("#showreversal").change(function() { redraw(); });

    redraw();
})
