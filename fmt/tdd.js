/*
  This file provides a class for representing a tdd file in memory
*/

class TDDDraft {
  constructor() {
    this.name   = "untitled draft";
    this.resetPalette();
    this.threadingColours = [
      ['1'],
      ['1'],
      ['1'],
      ['1']
    ];
    this.threading = [
      'Z'
    ];
    this.turning = [
      ['\\']
    ];
  }

  resetPalette() {
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
  }

  toString() {
    var r = "# tdd v1.0\n";
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

  addPicks(num) {
    var i;
    for (i=0; i < num; i++) {
      var arr = this.turning[0].slice();
      this.turning.unshift(arr);
    }
  }

  removePicks(num) {
    this.turning = this.turning.slice(num, this.picks());
  }

  addHoles(num) {
    var n = Math.min(num, 8 - this.holes());
    var i;
    for (i=0; i < n; i++) {
      var arr = this.threadingColours[this.holes() - 1].slice();
      this.threadingColours.push(arr);
    }
  }

  removeHoles(num) {
    this.threadingColours = this.threadingColours.slice(0, Math.max(this.holes() - num), 1);
  }

  addTabletsRight(num) {
    var i;
    var j;

    for (i=0; i < this.picks(); i++) {
      for (var j=0; j < num; j++) {
        this.turning[i].push(this.turning[i][this.turning[i].length - 1]);
      }
    }

    for (j=0; j < num; j++) {
      this.threading.push(this.threading[this.threading.length - 1]);

      for (i=0; i < this.threadingColours.length; i++) {
        var elem = this.threadingColours[i][this.threadingColours[i].length - 1];
        this.threadingColours[i].push(elem);
      }
    }
  }

  removeTabletsRight(num) {
    var i;
    for (i=0; i < this.picks(); i++) {
      this.turning[i] = this.turning[i].slice(0, Math.max(this.turning[i].length - num, 1));
    }
    for (i=0; i < this.holes(); i++) {
      this.threadingColours[i] = this.threadingColours[i].slice(0, Math.max(this.threadingColours[i].length - num, 1));
    }
    this.threading = this.threading.slice(0, Math.max(this.threading.length - num, 1));
  }

  addTabletsLeft(num) {
    var i;
    var j;

    for (i=0; i < this.picks(); i++) {
      for (var j=0; j < num; j++) {
        this.turning[i].unshift(this.turning[i][0]);
      }
    }

    for (j=0; j < num; j++) {
      this.threading.unshift(this.threading[0]);

      for (i=0; i < this.threadingColours.length; i++) {
        this.threadingColours[i].unshift(this.threadingColours[i][0]);
      }
    }
  }

  removeTabletsLeft(num) {
    var i;
    for (i=0; i < this.picks(); i++) {
      this.turning[i] = this.turning[i].slice(Math.min(num, this.turning[i].length - 1), this.turning[i].length);
    }
    for (i=0; i < this.holes(); i++) {
      this.threadingColours[i] = this.threadingColours[i].slice(Math.min(num, this.threadingColours[i].length - 1), this.threadingColours[i].length);
    }
    this.threading = this.threading.slice(Math.min(num, this.threading.length - 1), this.threading.length);
  }

  colour(num) {
    if (num >= 0 && num < 10) {
      return this.palette[num];
    } else if (num == 10) {
      return this.palette['a'];
    } else if (num == 11) {
      return this.palette['b'];
    } else {
      return undefined;
    }
  }

  setColour(num, c) {
    if (num >= 0 && num < 10) {
      this.palette[num] = c;
    } else if (num == 10) {
      this.palette['a'] = c;
    } else if (num == 11) {
      this.palette['b'] = c;
    }
  }

  reverse(tablet, pick) {
    var i;
    for (i=0; i < this.picks() - pick; i++) {
      var a = this.turning[i][tablet];
      if (a == '\\') {
        this.turning[i][tablet] = '/';
      } else if (a == '/') {
        this.turning[i][tablet] = '\\';
      }
    }
  }

  setThreadColour(tablet, hole, c) {
    if (c >= 0 && c < 10) {
      this.threadingColours[hole][tablet] = "" + c;
    } else if (c == 10) {
      this.threadingColours[hole][tablet] = "a";
    } else if (c == 11) {
      this.threadingColours[hole][tablet] = "b";
    } else {
      this.threadingColours[hole][tablet] = " ";
    }
  }

  threadColour(tablet, hole) {
    var c = this.threadingColours[hole][tablet];
    if (c != ' ')
      return this.palette[c];
    else
      return undefined;
  }

  flip(tablet) {
    if (this.threading[tablet] == "S") {
      this.threading[tablet] = "Z";
    } else {
      this.threading[tablet] = "S";
    }

    this.reverse(tablet, 0);
  }

  threadCount(c) {
    if (0 <= c && c < 10) {
      return this.threadingColours.reduce((count, colours) => (count + colours.filter(x => x == '' + c).length), 0);
    } else if (c == 10) {
      return this.threadingColours.reduce((count, colours) => (count + colours.filter(x => x == 'a').length), 0);
    } else if (c == 11) {
      return this.threadingColours.reduce((count, colours) => (count + colours.filter(x => x == 'b').length), 0);
    } else {
      return this.threadingColours.reduce((count, colours) => (count + colours.filter(x => x == ' ').length), 0);
    }
  }

  clearTurning() {
    for (var i = 0; i < this.tablets(); i++) {
      var val = '\\';
      if (this.threading[i] == 'S') {
        val = '/';
      }
      for (var j = 0; j < this.picks(); j++) {
        this.turning[j][i] = val;
      }
    }
  }

  describePick(num) {
    var desc = "";
    var dir = "F";
    var n = 0;

    for (var i = 0; i < this.tablets(); i++) {
      var new_dir;
      if ((this.turning[this.picks() - 1 - num][i] == "\\") == (this.threading[i] == "Z")) {
        new_dir = "F";
      } else {
        new_dir = "B";
      }

      if (new_dir == dir) {
        n += 1;
      } else {
        if (n >= 1) {
          desc += '' + n + dir + " "
        }
        dir = new_dir;
        n = 1;
      }
    }

    if (n >= 1) {
       desc += '' + n + dir;
    }

    return desc;
  }

  describeTablet (x, invertsz) {
    return (((this.threading[x] == "S") != invertsz)?"S":"Z") + " threaded tablet";
  }

  describeHole(x, y) {
    var c = this.threadColour(x, y);
    if (c == undefined) {
      return "Empty";
    } else {
      var n = ntc.name(c.getCSSHexadecimalRGB());
      return n[1] + " (" + c.getCSSHexadecimalRGB() + ")";
    }
  }
}

function TDDDraftFromString(raw) {
  var r = new TDDDraft();
  var lines = raw.split(/\r?\n/);

  // Read the header
  var match = lines.shift().match(/^#\s*tdd\s+v(\d+)\.(\d+)\s*$/);
  if (!match)
    throw "Not a valid tdd file";

  if (match[1] > 1 || (match[1] == 1 && match[2] > 0)) {
    alert("WARNING: Processing tdd file from future version of tdd. This may not work.")
  }

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
  while(line.match(/^(#.*)?$/)) {
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