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
}