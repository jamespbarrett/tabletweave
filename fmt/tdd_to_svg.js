/* This script contains a function that can draw a tdd structure as an svg image */

function tdd_to_svg(
    draft,
    show_threading=true,
    show_ovals=true,
    show_reversals=true,
    grey_saturation=0x99,
  ) {
  var parent = document.createElement("div");
  $(parent).svg();
  var svg = $(parent).svg('get');

  const cellwidth = 20;
  const cellheight = 20;
  const labelwidth = 20;
  const cellborder = 2;
  const rulerwidth = 3;
  const intertablegap = 25;
  const forwardcolour = new RGBColour(0xFF, 0xFF, 0xFF);
  const reversecolour = new RGBColour(
    grey_saturation,
    grey_saturation,
    grey_saturation
  );
  const labels = [ "A", "B", "C", "D", "E", "F", "G", "H" ];

  const threading_start_y = (
    (cellborder + cellheight)*draft.picks() +
    intertablegap
  );

  const fullheight = (
    cellborder +
    (cellborder + cellheight)*draft.picks() +
    cellborder +
    cellheight +
    (
      (show_threading)?
      (
        intertablegap +
        cellborder +
        (cellborder + cellheight)*draft.holes()
      ):0
    )
  );

  const fullwidth = (
    labelwidth +
    cellborder +
    (cellborder + cellwidth)*draft.tablets()
  );

  $(svg.root()).width(fullwidth);
  $(svg.root()).height(fullheight);

  // Background
  svg.rect(0, 0, fullwidth, fullheight,
    {fill: "#ffffff", stroke: "#000000", strokeWidth: 0});

  // draw the grids

  // Turning diagram
  for (var y = 0; y < draft.picks() + 1; y++) {
    svg.line(
      labelwidth,
      y*(cellborder + cellheight),
      labelwidth + (cellborder + cellwidth)*draft.tablets(),
      y*(cellborder + cellheight),
      {stroke: "#000000", strokeWidth: cellborder}
    );
  }
  for (var x = 0; x < draft.tablets() + 1; x++) {
    svg.line(
      labelwidth + (cellborder + cellwidth)*x,
      0,
      labelwidth + (cellborder + cellwidth)*x,
      (cellborder + cellheight)*draft.picks(),
      {stroke: "#000000", strokeWidth: cellborder}
    );
  }

  // Threading diagram
  if (show_threading) {
    for (var y = 0; y < draft.holes() + 1; y++) {
      svg.line(
        labelwidth,
        threading_start_y + y*(cellborder + cellheight),
        labelwidth + (cellborder + cellwidth)*draft.tablets(),
        threading_start_y + y*(cellborder + cellheight),
        {stroke: "#000000", strokeWidth: cellborder}
      );
    }
    for (var x = 0; x < draft.tablets() + 1; x++) {
      svg.line(
        labelwidth + (cellborder + cellwidth)*x,
        threading_start_y,
        labelwidth + (cellborder + cellwidth)*x,
        threading_start_y + (cellborder + cellheight)*draft.holes(),
        {stroke: "#000000", strokeWidth: cellborder}
      );
    }
  }

  // Draw some labels
  for (var y = 0; y < draft.picks(); y++) {
    svg.text(
      labelwidth - 3,
      (cellborder + cellheight)*(y + 1) - 5,
      "" + (draft.picks() - y),
      {stroke: "#000000", style: "font: 15px Arial; text-anchor: end;"}
    );
  }

  for (var y = 0; y < draft.holes(); y++) {
    svg.text(
      labelwidth - 3,
      threading_start_y + (cellborder + cellheight)*(y + 1) - 5,
      labels[y],
      {stroke: "#000000", style: "font: 15px Arial; text-anchor: end;"}
    );
  }

  // Next draw the ovals. This is essentially
  // a virtual loom that loops through the data
  // generating the turning diagram and maintaining
  // tablet state.
  for (var x = 0; x < draft.tablets(); x++) {
    /* This represents which hole is uppermost */
    var tablet_position = draft.holes() - 1;
    var backwards = undefined;

    // The ovals for the turning diagram
    for (var y = draft.picks() - 1; y >= 0; y--) {
      var dir = draft.turning[y][x];
      var old_backwards = backwards;
      backwards = (
        ((draft.threading[x] == 'Z')?'\\':'/') != dir
      );
      var fg;
      if (!backwards)
        fg = draft.threadingColours[tablet_position][x];
      else
        fg = draft.threadingColours[
          (tablet_position + 1)%draft.holes()
        ][x];

      const reversal_point = (old_backwards != undefined) && (backwards != old_backwards);

      /* Draw the background */
      if (backwards) {
        svg.rect(
          labelwidth + (cellborder + cellwidth)*x + 1,
          (cellborder + cellheight)*y + 1,
          cellwidth + cellborder - 2,
          cellheight + cellborder - 2,
          {
            fill: reversecolour.getCSSHexadecimalRGB(),
            strokeWidth: 0
          }
        );
      }

      /* Draw the Oval */
      if (show_ovals && fg != ' ') {
        const X_coord = labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2;
        const Y_coord = cellborder + (cellborder + cellheight)*y + cellheight/2;

        var g = svg.group({
          transform: "translate(" + X_coord + "," + Y_coord + ") " +
            "rotate(" + (dir == '\\'?"45":"-45") + ")"
        });

        svg.ellipse(
          g,
          0,
          0,
          cellheight/2,
          cellheight/4,
          {
            fill: draft.palette[fg].getCSSHexadecimalRGB(),
            stroke: "#000000",
            strokeWidth: 1
          }
        );
      }

      /* Draw the reversal point marker */
      if (show_reversals && reversal_point) {
        svg.line(
          labelwidth + x*(cellborder + cellwidth),
          (y+1)*(cellborder + cellheight),
          labelwidth + (x+1)*(cellborder + cellwidth),
          (y+1)*(cellborder + cellheight),
          {stroke: "#FF0000", strokeWidth: cellborder}
        );
      }

      /* Turm the tablet */
      if (backwards) {
        tablet_position = (tablet_position + 1) % draft.holes();
      } else {
        tablet_position = (tablet_position + draft.holes() - 1) % draft.holes();
      }
    }

    // The tablet numbers
    svg.text(
      labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
      threading_start_y - cellborder - 1,
      "" + (x + 1),
      {stroke: "#000000", style: "font: 15px Arial; text-anchor: middle;"}
    );

    // The ovals for the threading diagrame
    var dir = (draft.threading[x] == 'Z')?'\\':'/';
    for (var y = 0; y < draft.holes(); y++) {
      var fg = draft.threadingColours[y][x];

      if (show_ovals && fg != ' ') {
        const X_coord = labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2;
        const Y_coord = threading_start_y + cellborder + (cellborder + cellheight)*y + cellheight/2;

        var g = svg.group({
          transform: "translate(" + X_coord + "," + Y_coord + ") " +
            "rotate(" + (dir == '\\'?"45":"-45") + ")"
        });

        svg.ellipse(
          g,
          0,
          0,
          cellheight/2,
          cellheight/4,
          {
            fill: draft.palette[fg].getCSSHexadecimalRGB(),
            stroke: "#000000",
            strokeWidth: 1
          }
        );
      }
    }

    // The tablet numbers
    svg.text(
      labelwidth + cellborder + (cellborder + cellwidth)*x + cellwidth/2,
      threading_start_y + (cellborder + cellheight)*draft.holes() + 15,
      draft.threading[x],
      {stroke: "#000000", style: "font: 15px Arial; text-anchor: middle;"}
    );
  }

  return svg.root();
}