// Generated by CoffeeScript 1.3.3
/*
Maps keycodes to smileys
*/

var Smileys;

Smileys = (function() {

  function Smileys() {
    this.path = "/assets/images/smileys/";
    this.smileys = {
      ":)": "080.gif",
      "-_-": "107.gif",
      ":/": "003.gif",
      ":(": "030.gif",
      ":D": "074.gif",
      "xD": "049.gif",
      "XD": "049.gif",
      ";D": "073.gif",
      "&gt;.&lt;": "009.gif",
      "-.-": "064.gif",
      "-.-*": "064.gif",
      ";)": "083.gif",
      ":P": "048.gif",
      "^^": "055.gif",
      "x(": "010.gif",
      "&lt;3": "112.gif",
      ":blush:": "029.gif",
      ":evil:": "002.gif",
      "lol": "015.gif",
      ":'('": "004.gif",
      ":&gt;": "054.gif",
      "8)": "053.gif",
      "Oo": "031.gif",
      "oO": "031.gif"
    };
  }

  Smileys.prototype.get_smiley = function(key) {
    return this.path + this.smileys[key];
  };

  Smileys.prototype.get_smileys = function() {
    return this.smileys;
  };

  return Smileys;

})();
