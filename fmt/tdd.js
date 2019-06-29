/*
  This file provides a class for representing a tdd file in memory
*/

class TDDDraft {
  constructor() {
    this.name   = "";
    this.palette = {
      '0': new RGBColour(255, 255, 255),
      '1': new RGBColour(0, 0, 0),
      '2': new RGBColour(255, 0, 0),
      '3': new RGBColour(0, 153, 0),
      '4': new RGBColour(0, 0, 255),
      '5': new RGBColour(221, 221, 221),
      '6': new RGBColour(153, 153, 153),
      '7': new RGBColour(255, 255, 0),
      '8': new RGBColour(0, 255, 255),
      '9': new RGBColour(153, 0, 153),
      'a': new RGBColour(255, 136, 0),
      'b': new RGBColour(255, 136, 136)
    };
    this.threadingColours = [
      ['1']
    ];
    this.threading = [
      'Z'
    ];
    this.turning = [
      ['\\']
    ];
  }

  toString() {
    var r = "# tdd v0.1\n";
    r += "# " + this.name + "\n";
    r += "\n";

    this.turning.forEach((row) => {
      row.forEach((col) => {
        r += col;
      });
      r += "\n";
    });
    r += "\n";

    this.threadingColours.forEach((row) => {
      row.forEach((col) => {
        r += col;
      });
      r += "\n";
    });

    this.threading.forEach((col) => {
      r += col;
    });
    r += "\n\n";

    Object.entries(this.palette).forEach(([key, value]) => {
      r += key + " - ";
      r += value.getCSSHexadecimalRGB();
      r += "\n";
    });

    return r;
  }

  picks() { return this.turning.length; }
  tablets() { return this.turning[0].length; }
  holes() { return this.threadingColours.length; }
}

function TDDDraftFromString(raw) {
  var r = new TDDDraft();
  var lines = raw.split(/\r?\n/);

  // Read the header
  var match = lines.shift().match(/^#\s*tdd\s+v0\.1\s*$/);
  if (!match)
    throw "Not a valid tdd file";

  match = lines.shift().match(/^#\s*(.+)\s*$/);
  if (match) {
    r.name = match[1];
  }

  // Discard empty lines
  var line = lines.shift();
  while(line.match(/^(#.*)?\s*$/)) {
    line = lines.shift();
  }

  // Read the turning diagram
  r.turning = [];
  while (!line.match(/^\s*$/)) {
    var row = [];
    for (let c of line) {
      if (c == '\\')
        row.push('\\');
      else
        row.push('/');
    }
    r.turning.push(row);

    line = lines.shift();
  }

  // Discard empty lines
  var line = lines.shift();
  while(line.match(/^(#.*)?\s*$/)) {
    line = lines.shift();
  }

  // Read the threading diagram
  r.threadingColours = [];
  while (!line.match(/^$/)) {
    if (line.match(/^[SZ]+$/)) {
      r.threading = [];
      for (let c of line) {
        r.threading.push(c);
      }
    } else {
      var row = [];
      for (let c of line) {
        row.push(c);
      }
      r.threadingColours.push(row);
    }

    line = lines.shift();
  }

  // Discard empty lines
  var line = lines.shift();
  while(line.match(/^(#.*)?\s*$/)) {
    line = lines.shift();
  }

  // Read the palette
  while (true) {
    var match = line.match(/^\s*(\w)\s*-\s*#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})\s*$/);
    if (!match) {
      break;
    }

    r.palette[match[1]] = new RGBColour(
      parseInt(match[2], 16),
      parseInt(match[3], 16),
      parseInt(match[4], 16)
    );

    line = lines.shift();
  }

  return r;
}