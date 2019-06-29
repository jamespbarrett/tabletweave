/*
  This script provides a function that transforms the old json format into the new .tdd format
  */

const colorids = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' ];

function json_to_tdd(json) {
  var r = new TDDDraft();

  if (json['lower_cells'].length < 1) {
    /* This is a fall back for impossible values */
    r.threading = [ 'Z' ];
    r.threadingColours = [['0']];
  } else {
    /* This decodes the old json threading diagram to make the new one */
    r.threading = [];
    for (var x of json['lower_cells'][0]) {
      if (x['direction'] == "left") {
        r.threading.push('Z');
      } else {
        r.threading.push('S');
      }
    }

    r.threadingColours = [];
    for (var y of json['lower_cells']) {
      var row = [];
      for (var x of y) {
        if (x['colorid'] >= 0 && x['colorid'] < 16) {
          row.push(colorids[x['colorid']])
        } else if (x['colorid'] == -1) {
          row.push(' ');
        } else {
          row.push('?');
        }
      }
      r.threadingColours.push(row);
    }
  }

  /* This fills out the palette */
  for (var n = 0; n < json['palette'].length; n++) {
    const regex = /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)/;
    var found = json['palette'][n].match(regex);
    if (found) {
      r.palette[colorids[n]] = new RGBColour(found[1], found[2], found[3]);
    }
  }

  /* The turning diagram can now be decoded (since it needed the threading diagram first) */
  r.turning = [];
  for (var y = 0; y < json['main_cells'].length; y++) {
    r.turning[y] = [];
    for (var x = 0; x < json['main_cells'][y].length; x++) {
      r.turning[y][x] = '\\';
    }
  }

  for (var x = 0; x < r.turning[0].length; x++) {
    var dir = (r.threading[x] == 'Z') ? '\\' : '/';;
    for (var y = r.turning.length - 1; y >= 0; y--) {
      if (json.main_cells[y][x]) {
        dir = (dir == '\\')?'/':'\\';
      }
      r.turning[y][x] = dir;
    }
  }

  return r;
}