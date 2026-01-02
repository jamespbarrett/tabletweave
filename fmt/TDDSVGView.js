// This file contains a class that can represent the SVG-based rendering of a TDDDraft

const cellwidth = 20;
const cellheight = 20;
const cellborder = 2;
const rulerwidth = 3;
const intertablegap = 25;

const labelpadding = 3;

const hole_labels = [ "A", "B", "C", "D", "E", "F", "G", "H" ];

emptycellColour = new RGBColour(0xFF, 0xFF, 0xFF);

class TDDSVGView {
    constructor () {
        var parent = document.createElement("div");
        $(parent).svg();
        this.svg = $(parent).svg('get');

        this.labelwidth = 30;

        this.needs_full_redraw = true;

        // Height and width will really be set when we
        // conform to a draft, for now set some defaults
        const fullheight = (
            cellborder +
            (cellborder + cellheight)*1 +
            cellborder +
            cellheight +
            (
                intertablegap +
                cellborder +
                (cellborder + cellheight)*4
            )
        );

        const fullwidth = (
            this.labelwidth +
            cellborder +
            (cellborder + cellwidth)*1
        );

        if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            // This is needed in Firefox to make image export work, but breaks image export in other browsers
            $(this.svg.root()).attr('width', fullwidth);
            $(this.svg.root()).attr('height', fullheight);
        }

        this.svg.root().setAttribute('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);

        // Create the background
        this.bg = this.svg.rect(
            0, 0, fullwidth, fullheight,
            {fill: "#ffffff", stroke: "#000000", strokeWidth: 0}
        );

        var fillpat = this.svg.pattern("fillpat", 0, 0, 4, 4, {patternUnits: "userSpaceOnUse"});
        this.svg.rect(fillpat, 0, 0, 2, 2, {fill: "#000000", stroke: "#000000", strokeWidth: 0});
        this.svg.rect(fillpat, 2, 2, 2, 2, {fill: "#000000", stroke: "#000000", strokeWidth: 0});

        // The Twist diagram
        this.twist = [];

        // The turning diagram
        this.turning = [];

        // The threading diagram
        this.threading = [];

        // The labels
        this.labels = {
            picks: [],
            tablets: [],
            holes: []
        }

        // Settings
        this.show_turning=true;
        this.show_threading=true;
        this.showing_turning=true;
        this.showing_threading=true;
        this.showing_twist=true;
        this.show_ovals=true;
        this.show_squares=true;
        this.show_twist=true;
        this.show_reversals=true;
        this.show_grid=true;
        this.show_idling=true;
        this.labelholescw=true;
        this.labelingholescw=true;
        this.invertsz=false;
        this.invertingsz=false;
        var grey_saturation=0x99;
        this.hruler_position=undefined;
        this.vruler_position=undefined;

        this.forwardcolour = new RGBColour(0xFF, 0xFF, 0xFF);
        this.backwardcolour = new RGBColour(
            grey_saturation,
            grey_saturation,
            grey_saturation
        );

        this.start_pick=undefined;
        this.end_pick=undefined;
        this.repeats=undefined;

        // Stuctural elements for arranging the svg
        this.twist_group = this.svg.group();
        this.main_group = this.svg.group();
        this.tablet_label_group = this.svg.group();
        this.overlay = this.svg.group();
        this.threading_group = this.svg.group();
        this.ruler_group = this.svg.group();
        this.threading_main_group = this.svg.group(this.threading_group);
        this.threading_ruler_group = this.svg.group(this.threading_group);
        this.idling_group = this.svg.group(this.threading_group);

        this.hruler = this.svg.line(
            this.ruler_group,
            this.labelwidth - cellborder,
            0,
            this.labelwidth + cellborder + (cellborder + cellwidth),
            0,
            {stroke: "#000000", strokeWidth: cellborder*4}
        );

        const threading_start_y = (
            (cellborder + cellheight) +
            intertablegap
        );

        this.vruler = {
            turning: this.svg.line(
                this.ruler_group,
                this.labelwidth,
                0,
                this.labelwidth,
                (cellheight + cellborder) + cellborder,
                {stroke: "#000000", strokeWidth: cellborder*4}
            ),
            threading: this.svg.line(
                this.threading_ruler_group,
                this.labelwidth,
                threading_start_y,
                this.labelwidth,
                threading_start_y + (cellheight + cellborder)*4 + cellborder,
                {stroke: "#000000", strokeWidth: cellborder*4}
            )
        }
    }

    showThreading(val) {
        this.show_threading = val;
    }

    showTurning(val) {
        this.show_turning = val;
    }

    showOvals(val) {
        this.show_ovals = val;
    }

    showSquares(val) {
        this.show_squares = val;
    }

    showTwist(val) {
        this.show_twist = val;
    }

    showReversals(val) {
        this.show_reversals = val;
    }

    showGrid(val) {
        if(this.show_grid != val) {
            this.needs_full_redraw = true;
        }
        this.show_grid = val;
    }

    showIdling(val) {
        if(this.show_idling != val) {
            this.needs_full_redraw = true;
        }
        this.show_idling = val;
    }

    labelHolesCW(val) {
        this.labelholescw = val;
    }

    invertSZ(val) {
        this.invertsz = val;
    }

    greySaturation(val) {
        this.backwardcolour = new RGBColour(
            val,
            val,
            val
        );
    }

    hRuler(y) {
        this.hruler_position = y;
    }

    vRuler(x) {
        this.vruler_position = x;
    }

    startPick(y) {
        this.start_pick = y;
    }

    endPick(y) {
        this.end_pick = y;
    }

    setRepeats(n) {
        this.repeats = n;
    }

    root () {
        return this.svg.root();
    }

    conform (draft) {
        const num_picks = (this.repeats == undefined)?draft.picks():(this.end_pick - this.start_pick + 1)*this.repeats;
        const labelwidth = ((this.show_turning)?(("" + num_picks).length * 10):10) + labelpadding*2;
        if (this.labelwidth != labelwidth) {
            this.labelwidth = labelwidth;
            while (this.labels.picks.length > 0) {
                $(this.labels.picks.pop()).remove();
            }
            while (this.labels.holes.length > 0) {
                $(this.labels.holes.pop()).remove();
            }
            while (this.labels.tablets.length > 0) {
                $(this.labels.tablets.pop()).remove();
            }
            while (this.turning.length > 0) {
                var row = this.turning.pop();
                while (row.length > 0) {
                    this.remove_cell(row.pop());
                }
            }
            while (this.threading.length > 0) {
                var tablet = this.threading.pop();
                $(tablet.direction).remove();
                $(tablet.phase).remove();
                while (tablet.holes.length > 0) {
                    this.remove_cell(tablet.holes.pop());
                }
            }
        }

        if (
            this.needs_full_redraw ||
            (
                this.repeats != undefined &&
                (
                    this.turning.length != (this.end_pick - this.start_pick + 1)*this.repeats
                )
            ) ||
            (
                this.repeats == undefined &&
                this.turning.length != draft.picks()
            ) ||
            this.threading.length != draft.tablets() ||
            (this.threading.length > 0 && this.threading[0].holes.length != draft.holes()) ||
            (this.show_threading != this.showing_threading) ||
            (this.show_turning != this.showing_turning) ||
            (this.show_twist != this.showing_twist) ||
            (this.labelholescw != this.labelingholescw) ||
            (this.invertsz != this.invertingholessz)
        ) {
            this.conform_size(draft);
        }

        this.conform_twist(draft);
        this.conform_threading(draft);
        this.conform_turning(draft);
        this.conform_rulers(draft);

        this.needs_full_redraw = false;
    }

    conform_size(draft) {
        const num_picks = (this.repeats == undefined)?draft.picks():(this.end_pick - this.start_pick + 1)*this.repeats;

        // First calculate the sizes
        const turning_start_y = (this.show_twist)?(
            cellborder + cellheight
        ):0;
        const threading_start_y = turning_start_y + (
            (this.show_turning)?(
                (cellborder + cellheight)*num_picks +
                intertablegap
            ):intertablegap
        );

        const fullheight = (
            (
                (this.show_twist)?
                (
                    cellborder +
                    cellheight +
                    cellborder
                ):0
            ) + (
                (this.show_turning)?
                (
                    cellborder +
                    (cellborder + cellheight)*num_picks +
                    cellborder +
                    cellheight
                ):intertablegap 
            ) + (
              (this.show_threading)?
              (
                intertablegap +
                cellborder +
                (cellborder + cellheight)*(draft.holes() + (this.show_idling ? 1 : 0))
              ):0
            )
        );

        const fullwidth = (
            this.labelwidth +
            cellborder +
            (cellborder + cellwidth)*draft.tablets()
        );

        $(this.svg.root()).width(fullwidth);
        $(this.svg.root()).height(fullheight);

        this.svg.root().setAttribute('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);

        // Resize background
        $(this.bg).attr('width', fullwidth);
        $(this.bg).attr('height', fullheight);

        // Conform the labels -- picks first
        while (this.labels.picks.length > num_picks) {
            $(this.labels.picks.pop()).remove();
        }
        for (var y = 0; y < this.labels.picks.length; y++) {
            $(this.labels.picks[y]).attr('x', this.labelwidth - labelpadding);
            $(this.labels.picks[y]).attr('y', turning_start_y + (cellborder + cellheight)*(num_picks - y) - 5);
            if (this.repeats != undefined) {
                $(this.labels.picks[y]).text("" + ((y%(this.end_pick - this.start_pick + 1)) + this.start_pick));
            }
        }
        while (this.labels.picks.length < num_picks) {
            y = this.labels.picks.length;
            var label = "" + (y + 1);
            if (this.repeats != undefined) {
                label = "" + ((y%(this.end_pick - this.start_pick + 1)) + this.start_pick);
            }
            this.labels.picks.push(this.svg.text(
                this.main_group,
                this.labelwidth - labelpadding,
                turning_start_y + (cellborder + cellheight)*(num_picks - y) - 5,
                label,
                {stroke: "#000000", style: "font: 15px Arial; text-anchor: end;"}
            ));
        }

        // Next the holes
        while (this.labels.holes.length > draft.holes()) {
            $(this.labels.holes.pop()).remove();
        }
        for (y = 0; y < this.labels.holes.length; y++) {
            const hole_label = this.labelholescw?hole_labels[y]:hole_labels[draft.holes() - y - 1];
            $(this.labels.holes[y]).attr('x', this.labelwidth - labelpadding);
            $(this.labels.holes[y]).attr('y', threading_start_y + (cellborder + cellheight)*(y + 1) - 5);
            $(this.labels.holes[y]).text(hole_label);
        }
        while (this.labels.holes.length < draft.holes()) {
            y = this.labels.holes.length;
            const hole_label = this.labelholescw?hole_labels[y]:hole_labels[draft.holes() - y - 1];
            this.labels.holes.push(this.svg.text(
                this.threading_main_group,
                this.labelwidth - labelpadding,
                threading_start_y + (cellborder + cellheight)*(y + 1) - 5,
                hole_label,
                {stroke: "#000000", style: "font: 15px Arial; text-anchor: end;"}
            ));
        }
        this.labelingholescw = this.labelholescw;

        // Finally the tablets
        while (this.labels.tablets.length > draft.tablets()) {
            $(this.labels.tablets.pop()).remove();
        }
        for (var x = 0; x < this.labels.tablets.length; x++) {
            $(this.labels.tablets[x]).attr('x', this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2);
            $(this.labels.tablets[x]).attr('y', threading_start_y - cellborder - 2);
        }
        while (this.labels.tablets.length < draft.tablets()) {
            x = this.labels.tablets.length;
            this.labels.tablets.push(this.svg.text(
                this.tablet_label_group,
                this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
                threading_start_y - cellborder - 2,
                "" + (x + 1),
                {stroke: "#000000", style: "font: 15px Arial; text-anchor: middle;"}
            ));
        }

        // Now we conform the labels of the twist diagram
        while (draft.tablets() < this.twist.length) {
            $(this.twist.pop()).remove();
        }
        for(var x = 0; x < this.twist.length; x++) {
            $(this.twist[x]).attr('x', this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2);
            $(this.twist[x]).attr('y', turning_start_y - cellborder - 2);
        }
        while(this.twist.length < draft.tablets()) {
            x = this.twist.length;
            this.twist.push(this.svg.text(
                this.twist_group,
                this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
                turning_start_y - cellborder - 2,
                "✅",
                {stroke: "#000000", style: "font: 10px Arial; text-anchor: middle;"}
            ));
        }

        // Now we conform the cells of the turning diagram
        for (y = 0; y < num_picks; y++) {
            if (y >= this.turning.length) {
                this.turning.push([]);
            }
            for (x = 0; x < draft.tablets(); x++) {
                if (x >= this.turning[y].length) {
                    this.turning[y].push(
                        this.create_cell(x, y, turning_start_y)
                    );
                }
                this.move_cell(this.turning[y][x], x, y, turning_start_y);
                // Conform cell
            }
            while (draft.tablets() < this.turning[y].length) {
                this.remove_cell(this.turning[y].pop());
            }
        }
        while (num_picks < this.turning.length) {
            var row = this.turning.pop();
            while (row.length > 0) {
                this.remove_cell(row.pop());
            }
        }

        // And the threading diagram
        for (x = 0; x < draft.tablets(); x++) {
            if (x >= this.threading.length) {
                this.threading.push({
                    direction: this.svg.text(
                        this.threading_main_group,
                        this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
                        threading_start_y + (cellborder + cellheight)*draft.holes() + 15,
                        "S",
                        {stroke: "#000000", style: "font: 15px Arial; text-anchor: middle;"}
                    ),
                    phase: this.svg.text(
                        this.idling_group,
                        this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
                        threading_start_y + (cellborder + cellheight)*(draft.holes() + 1) + 15,
                        "T",
                        {stroke: "#000000", style: "font: 15px Arial; text-anchor: middle;"}
                    ),
                    holes: []
                });
            }
            $(this.threading[x].direction).attr('x', this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2);
            $(this.threading[x].direction).attr('y', threading_start_y + (cellborder + cellheight)*draft.holes() + 15);
            $(this.threading[x].phase).attr('x', this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2);
            $(this.threading[x].phase).attr('y', threading_start_y + (cellborder + cellheight)*(draft.holes() + 1) + 15);
            for (y = 0; y < draft.holes(); y++) {
                if (y >= this.threading[x].holes.length) {
                    this.threading[x].holes.push(
                        this.create_cell(x, y, threading_start_y, this.threading_main_group, false)
                    );
                }
                this.move_cell(this.threading[x].holes[y], x, y, threading_start_y);
                // Conform cell
            }
            while (this.threading[x].holes.length > draft.holes()) {
                this.remove_cell(this.threading[x].holes.pop());
            }
        }
        while (this.threading.length > draft.tablets()) {
            var tablet = this.threading.pop();
            $(tablet.direction).remove();
            $(tablet.phase).remove();
            while (tablet.holes.length > 0) {
                this.remove_cell(tablet.holes.pop());
            }
        }
    }

    conform_twist (draft) {
        if (this.show_twist) {
            $(this.root()).append(this.twist_group);
            $(this.twist_group).attr('visibility', 'visible');

            for (var x = 0; x < draft.tablets(); x++) {
                var twist = 0;
                for (var y = 0; y < draft.picks(); y++) {
                    if(draft.turning[y][x] == "/") {
                        if (draft.threadingPhases[x] == 'T' || (
                            (draft.threadingPhases[x] == 'E') == ((y + 1 - draft.picks()) % 2 == 0)
                        )) {
                            twist++;
                        }
                    }
                    else if (draft.turning[y][x] == "\\") {
                        if (draft.threadingPhases[x] == 'T' || (
                            (draft.threadingPhases[x] == 'O') == ((y + 1 - draft.picks()) % 2 == 0)
                        )) {
                            twist--;
                        }
                    }
                }

                if (twist < 0) {
                    $(this.twist[x]).text("" + (-twist) + "B");
                }
                else if (twist == 0) {
                    $(this.twist[x]).text("✅");
                }
                else {
                    $(this.twist[x]).text("" + twist + "F");
                }
            }
            this.showing_twist = true;
        } else {
            $(this.twist_group).detach();
            this.showing_twist = false;
        }
    }

    conform_threading (draft) {
        if (this.show_threading) {
            if (this.show_idling) {
                $(this.root()).append(this.idling_group);
                $(this.idling_group).attr('visibility', 'visible');
            } else {
                $(this.idling_group).detach();
            }
            $(this.root()).append(this.threading_group);
            $(this.threading_group).attr('visibility', 'visible');

            for (var x = 0; x < draft.tablets(); x++) {
                $(this.threading[x].direction).text(((draft.threading[x] == "S") != this.invertsz)?"S":"Z");
                $(this.threading[x].phase).text(draft.threadingPhases[x]);

                for (var y = 0; y < draft.holes(); y++) {
                    if (draft.threading[x] == "S")
                        this.set_cell_direction(this.threading[x].holes[y], "/");
                    else
                        this.set_cell_direction(this.threading[x].holes[y], "\\");

                    if (this.show_ovals)
                        this.set_cell_colour(this.threading[x].holes[y], draft.threadColour(x, y));
                    else
                        this.set_cell_colour(this.threading[x].holes[y], undefined);
                }
            }
            this.invertingsz = this.invertsz;
            this.showing_threading = true;
        } else {
            $(this.threading_group).detach();
            $(this.idling_group).detach();
            this.showing_threading = false;
        }
    }

    conform_turning (draft) {
        if (this.show_turning) {
            $(this.root()).append(this.main_group);
            $(this.root()).append(this.overlay);
            $(this.main_group).attr('visibility', 'visible');
            
            var tablet_position = [];
            for (var x = 0; x < draft.tablets(); x++) {
                tablet_position[x] = draft.holes() - 1;
            }

            if (this.repeats != undefined) {
                var y;
                for (y = draft.picks() - 1; y > draft.picks() - this.start_pick; y--) {
                    if ((draft.threading[x] == "S") == (draft.turning[y][x] == "/")) {
                        tablet_position[x] = (tablet_position[x] + draft.holes() - 1) % draft.holes();
                    } else {
                        tablet_position[x] = (tablet_position[x] + 1) % draft.holes();
                    }
                }
                const ppr = this.end_pick - this.start_pick + 1;
                var cell = this.turning.length - 1;

                while (cell >= 0) {
                    for (y = draft.picks() - this.start_pick; y >= draft.picks() - this.end_pick; y--) {
                        //alert("y: " + y + " cell: " + cell);

                        for (var x = 0; x < draft.tablets(); x++) {
                            this.turning[cell][x].i = false;
                            this.set_cell_background(this.turning[cell][x], this.forwardcolour);
                            if ((draft.threading[x] == "S") == (draft.turning[y][x] == "/")) {
                                this.turning[cell][x].fg = draft.threadColour(x, tablet_position[x]);
                                this.turning[cell][x].b = false;
                                if (draft.threadingPhases[x] == 'T' || (
                                    (draft.threadingPhases[x] == 'O') == ((cell + 1 - this.turning.length) % 2 == 0)
                                )) {
                                    tablet_position[x] = (tablet_position[x] + draft.holes() - 1) % draft.holes();
                                } else {
                                    this.turning[cell][x].i = true;
                                }
                            } else {
                                this.turning[cell][x].fg = draft.threadColour(x, (tablet_position[x] + 1)%draft.holes());
                                this.turning[cell][x].b = true;
                                if (draft.threadingPhases[x] == 'T' || (
                                    (draft.threadingPhases[x] == 'E') == ((cell + 1 - this.turning.length) % 2 == 0)
                                )) {
                                    tablet_position[x] = (tablet_position[x] + 1) % draft.holes();
                                } else {
                                    this.turning[cell][x].i = true;
                                }
                            }
                            if (!this.turning[cell][x].i) {
                                this.set_cell_direction(this.turning[cell][x], draft.turning[y][x]);
                            } else {
                                this.set_cell_direction(this.turning[cell][x], '|');
                                if (cell != this.turning.length - 1) {
                                    this.turning[cell][x].fg = this.turning[cell + 1][x].fg;
                                } else {
                                    this.turning[cell][x].fg = undefined;
                                }
                            }
                            this.set_cell_colour(this.turning[cell][x], this.turning[cell][x].fg);
                            this.set_cell_reverse_marker(this.turning[cell][x], false);
                        }

                        cell--;
                    }
                }
            } else {
                for (var y = draft.picks() - 1; y >= 0; y--) {
                    for (var x = 0; x < draft.tablets(); x++) {
                        this.turning[y][x].i = false;
                        if ((draft.threading[x] == "S") == (draft.turning[y][x] == "/")) {
                            this.turning[y][x].fg = draft.threadColour(x, tablet_position[x]);
                            if (draft.threadingPhases[x] == 'T' || (
                                (draft.threadingPhases[x] == 'O') == ((y + 1 - draft.picks()) % 2 == 0)
                            )) {
                                tablet_position[x] = (tablet_position[x] + draft.holes() - 1) % draft.holes();
                            } else {
                                this.turning[y][x].i = true;
                            }
                            this.turning[y][x].b = false;
                        } else {
                            this.turning[y][x].fg = draft.threadColour(x, (tablet_position[x] + 1)%draft.holes());
                            if (draft.threadingPhases[x] == 'T' || (
                                (draft.threadingPhases[x] == 'E') == ((y + 1 - draft.picks()) % 2 == 0)
                            )) {   
                                tablet_position[x] = (tablet_position[x] + 1) % draft.holes();
                            }
                            else {
                                this.turning[y][x].i = true;
                            }
                            this.turning[y][x].b = true;
                        }
                        if (this.turning[y][x].i) {
                            if (y != draft.picks() - 1) {
                                this.turning[y][x].fg = this.turning[y+1][x].fg;
                            } else {
                                this.turning[y][x].fg = undefined;
                            }
                        }
                        if(this.show_squares) {
                            this.set_cell_background(this.turning[y][x], this.turning[y][x].fg);
                        } else {
                            this.set_cell_background(this.turning[y][x], this.turning[y][x].b ? this.backwardcolour : this.forwardcolour);
                        }
                        if (!this.show_squares && this.show_ovals) {
                            if (!this.turning[y][x].i) {
                                this.set_cell_direction(this.turning[y][x], draft.turning[y][x]);
                            } else {
                                this.set_cell_direction(this.turning[y][x], '|');
                            }
                            this.set_cell_colour(this.turning[y][x], this.turning[y][x].fg);
                        } else {
                            this.set_cell_colour(this.turning[y][x], undefined);
                        }
                        
                        this.set_cell_reverse_marker(this.turning[y][x], (
                            (y != draft.picks() - 1) &&
                            (this.turning[y][x].b != this.turning[y+1][x].b) &&
                            this.show_reversals
                        ));
                    }
                }
            }
            this.showing_turning = true;
        } else {
            $(this.main_group).detach();
            $(this.overlay).detach();
            this.showing_turning = false;
        }
    }

    conform_rulers (draft) {
        const num_picks = (this.repeats == undefined)?draft.picks():(this.end_pick - this.start_pick + 1)*this.repeats;

        const turning_start_y = (this.show_twist)?(
            cellborder + cellheight
        ):0;
        const threading_start_y = turning_start_y + (
            (this.show_turning)?(
                (cellborder + cellheight)*num_picks +
                intertablegap
            ):intertablegap
        );

        if (this.hruler_position == undefined || (!this.showing_turning && this.hruler_position > 0) || (!this.show_threading && this.hruler_position <= 0)) {
            $(this.hruler).attr('visibility', 'hidden');
            $(this.hruler).attr('x1', this.labelwidth - cellborder);
            $(this.hruler).attr('x2', this.labelwidth + cellborder + (cellborder + cellwidth)*draft.tablets());
            $(this.hruler).attr('y1', threading_start_y);
            $(this.hruler).attr('y2', threading_start_y);
        } else {
            $(this.hruler).attr('x1', this.labelwidth - cellborder);
            $(this.hruler).attr('x2', this.labelwidth + cellborder + (cellborder + cellwidth)*draft.tablets());

            if (this.hruler_position > 0) {
                $(this.hruler).attr('visibility', 'visible');
                $(this.hruler).attr('y1', turning_start_y + (cellborder + cellheight)*(draft.picks() - this.hruler_position + 1));
                $(this.hruler).attr('y2', turning_start_y + (cellborder + cellheight)*(draft.picks() - this.hruler_position + 1));
                this.ruler_group.append(this.hruler);
            } else {
                $(this.hruler).attr('visibility', 'visible');
                $(this.hruler).attr('y1', threading_start_y - (cellborder + cellheight)*this.hruler_position);
                $(this.hruler).attr('y2', threading_start_y - (cellborder + cellheight)*this.hruler_position);
                this.threading_ruler_group.append(this.hruler);
            }
        }

        if (this.vruler_position == undefined) {
            $(this.vruler.turning).attr('visibility', 'hidden');
            $(this.vruler.turning).attr('x1', this.labelwidth);
            $(this.vruler.turning).attr('y1', turning_start_y);
            $(this.vruler.turning).attr('x2', this.labelwidth);
            $(this.vruler.turning).attr('y2', turning_start_y);

            $(this.vruler.threading).attr('visibility', 'hidden');
            $(this.vruler.threading).attr('x1', this.labelwidth);
            $(this.vruler.threading).attr('y1', threading_start_y);
            $(this.vruler.threading).attr('x2', this.labelwidth);
            $(this.vruler.threading).attr('y2', threading_start_y);
        } else {
            if (this.show_turning) {
                $(this.vruler.turning).attr('visibility', 'visible');
                $(this.vruler.turning).attr('x1', this.labelwidth + (cellwidth + cellborder)*(this.vruler_position - 1));
                $(this.vruler.turning).attr('y1', turning_start_y);
                $(this.vruler.turning).attr('x2', this.labelwidth + (cellwidth + cellborder)*(this.vruler_position - 1));
                $(this.vruler.turning).attr('y2', turning_start_y + (cellheight + cellborder)*draft.picks() + cellborder);
            } else {
                $(this.vruler.turning).attr('visibility', 'hidden');
                $(this.vruler.turning).attr('x1', this.labelwidth);
                $(this.vruler.turning).attr('y1', turning_start_y);
                $(this.vruler.turning).attr('x2', this.labelwidth);
                $(this.vruler.turning).attr('y2', turning_start_y);
            }

            if (this.show_threading) {
                $(this.vruler.threading).attr('visibility', 'visible');

                $(this.vruler.threading).attr('x1', this.labelwidth + (cellwidth + cellborder)*(this.vruler_position - 1));
                $(this.vruler.threading).attr('y1', threading_start_y);
                $(this.vruler.threading).attr('x2', this.labelwidth + (cellwidth + cellborder)*(this.vruler_position - 1));
                $(this.vruler.threading).attr('y2', threading_start_y + (cellheight + cellborder)*draft.holes() + cellborder);
            } else {
                $(this.vruler.threading).attr('visibility', 'hidden');
                $(this.vruler.threading).attr('x1', this.labelwidth);
                $(this.vruler.threading).attr('y1', threading_start_y);
                $(this.vruler.threading).attr('x2', this.labelwidth);
                $(this.vruler.threading).attr('y2', threading_start_y);
            }
        }
        $(this.root()).append(this.ruler_group);
        $(this.root()).append(this.threading_ruler_group);
    }

    create_cell (x, y, offset=0, group=this.main_group, overlay=this.overlay) {
        var rect = this.svg.rect(
            group,
            this.labelwidth + (cellborder + cellwidth)*x,
            offset + (cellborder + cellheight)*y,
            cellwidth + cellborder,
            cellheight + cellborder,
            {
              fill: this.forwardcolour.getCSSHexadecimalRGB(),
              strokeWidth: this.show_grid ? cellborder : 0,
              stroke: "#000000"
            }
        );

        var revline = undefined;
        if (overlay) {
            revline = this.svg.line(
                overlay,
                this.labelwidth + (cellborder + cellwidth)*x,
                offset + (cellborder + cellheight)*y + cellheight + cellborder,
                this.labelwidth + (cellborder + cellwidth)*x + cellwidth + cellborder,
                offset + (cellborder + cellheight)*y + cellheight + cellborder,
                {
                    strokeWidth: cellborder,
                    stroke: "#FF0000",
                    visibility: 'hidden',
                    strokeWidth: cellborder
                }
            );
        }

        const X_coord = this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2;
        const Y_coord = offset + cellborder + (cellborder + cellheight)*y + cellheight/2;

        var g = this.svg.group(
            group,
            {
                transform: "translate(" + X_coord + "," + Y_coord + ") " +
                           "rotate(45)"
            });

        var ell = this.svg.ellipse(
            g,
            0,
            0,
            cellheight/2,
            cellheight/4,
            {
              fill: "#000000",
              stroke: "#000000",
              strokeWidth: 1
            }
          );

        return {
            rect: rect,
            g: g,
            ell: ell,
            x: X_coord,
            y: Y_coord,
            b: false,
            fg: undefined,
            i: false,
            revline: revline
        };
    }

    remove_cell (cell) {
        $(cell.rect).remove();
        $(cell.ell).remove();
        $(cell.g).remove();
        $(cell.revline).remove();
    }

    move_cell(cell, x, y, offset=0) {
        $(cell.rect).attr('x', this.labelwidth + (cellborder + cellwidth)*x);
        $(cell.rect).attr('y', offset + (cellborder + cellheight)*y);
        $(cell.rect).css("strokeWidth", this.show_grid ? cellborder : 0);
        $(cell.revline).attr('x1', this.labelwidth + (cellborder + cellwidth)*x);
        $(cell.revline).attr('y1', offset + (cellborder + cellheight)*(y + 1));
        $(cell.revline).attr('x2', this.labelwidth + (cellborder + cellwidth)*(x + 1));
        $(cell.revline).attr('y2', offset + (cellborder + cellheight)*(y + 1));

        cell.x = this.labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2;
        cell.y = offset + cellborder + (cellborder + cellheight)*y + cellheight/2;

        $(cell.g).attr("transform",
            "translate(" + cell.x + "," + cell.y + ") " +
            "rotate(45)");
    }

    set_cell_direction(cell, dir) {
        var rotate = {
            '\\': 45,
            '/' : -45,
            '|' : 90
        }[dir];
        $(cell.g).attr("transform",
            "translate(" + cell.x + "," + cell.y + ") " +
            "rotate(" + rotate + ")");
    }

    set_cell_colour(cell, colour) {
        if (colour == undefined) {
            $(cell.ell).attr('visibility', 'hidden');
        } else {
            $(cell.ell).removeAttr('visibility');
            $(cell.ell).attr('fill', colour.getCSSHexadecimalRGB());
        }
    }

    set_cell_background (cell, colour) {
        if (colour == undefined) {
            $(cell.rect).attr('fill', "url(#fillpat)");
        }
        else {
            $(cell.rect).attr('fill', colour.getCSSHexadecimalRGB());
        }
    }

    set_cell_reverse_marker(cell, val) {
        if (val) {
            $(cell.revline).attr('visibility', 'visible');
        } else {
            $(cell.revline).attr('visibility', 'hidden');
        }
    }

    svg_coord_to_tablet(x, view, draft) {
        const num_picks = (view.repeats == undefined)?draft.picks():(view.end_pick - view.start_pick + 1)*view.repeats;
        const labelwidth = ((this.show_turning)?(("" + num_picks).length * 10):10) + 2*labelpadding;
    
        if (x < labelwidth + cellborder/2) {
          return -1;
        } else {
          return parseInt((x - labelwidth)/(cellborder + cellwidth));
        }
    }
    
    svg_coord_to_pick(y, draft) {
        const turning_start_y = (this.show_twist)?(
            cellborder + cellheight
        ):0;
        if (!this.show_turning || y >= (turning_start_y + (cellborder + cellheight)*draft.picks())) {
          return -1;
        } else {
          return draft.picks() - parseInt((y - turning_start_y)/(cellborder + cellheight)) - 1;
        }
    }
    
    svg_coord_to_hole(y, draft) {
        const turning_start_y = (this.show_twist)?(
            cellborder + cellheight
        ):0;
        const threading_start_y = turning_start_y + (
            (this.show_turning)?(
            (cellborder + cellheight)*draft.picks() +
            intertablegap
            ):0
        );
    
        const threading_end_y = (
          threading_start_y +
          (cellborder + cellheight)*draft.holes()
        );
    
        if (y < threading_start_y) {
          return -1;
        } else if (y < threading_end_y) {
          return parseInt((y - threading_start_y)/(cellborder + cellheight));
        } else {
          return -1;
        }
    }

    svg_coord_to_control(y, draft) {
        const turning_start_y = (this.show_twist)?(
            cellborder + cellheight
        ):0;
        const threading_start_y = turning_start_y + (
            (this.show_turning)?(
            (cellborder + cellheight)*draft.picks() +
            intertablegap
            ):0
        );
    
        const threading_end_y = (
          threading_start_y +
          (cellborder + cellheight)*draft.holes()
        );

        const sz_end_y = (
          threading_start_y +
          (cellborder + cellheight)*(draft.holes() + 1)
        );

        if (y < threading_start_y) {
          return "turning";
        } else if (y < threading_end_y) {
          return "threading"
        } else if (y < sz_end_y) {
          return "SZ";
        } else {
          return "TOE";
        }
    }
}

