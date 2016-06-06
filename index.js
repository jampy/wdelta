var DiffMatchPatch = require('diff-match-patch');


function deltaEncode(from, to) {

  // https://code.google.com/p/google-diff-match-patch/wiki/API

  var dmp = new DiffMatchPatch();
  var tx = dmp.diff_main(from, to);
  dmp.diff_cleanupEfficiency(tx);

  var diff = [];
  var count = tx.length;
  
  for (var idx = 0; idx < count; idx++) {
    var text = tx[idx][1];
    switch (tx[idx][0]) {

      case -1:  // deletion
        diff.push("D" + text.length);
        break;

      case 0:  // equality
        diff.push("E" + text.length);
        break;

      case +1:  // insertion
        diff.push("I" + text.length + ':' + text);
        break;

      default:
        throw new Error("Unknown diff type (" + type + ")")
    }
  }

  return diff.join(",");
}


function deltaDecode(from, delta) {

  var dlen = delta.length;
  var outData = "";
  var deltaPos = 0;
  var inPos = 0;

  function getNumberToDelimiter(delimiter) {
    var endPos = delta.indexOf(delimiter, deltaPos);
    var str;

    if (endPos < 0) {
      str = delta.substr(deltaPos + 1);
    } else {
      str = delta.substr(deltaPos + 1, endPos - deltaPos - 1);
    }

    deltaPos += (str.length + 2);

    var res = parseInt(str, 10);

    if (isNaN(res))
      throw new Erorr("Syntax error in delta at position " + deltaPos);

    return res;
  }


  while (deltaPos < dlen) {
    var command = delta.substr(deltaPos, 1);

    switch (command) {
      case "D":
      {
        inPos += getNumberToDelimiter(',');
        break;
      }

      case "E":
      {
        var len = getNumberToDelimiter(',');
        outData += refData.substr(inPos, len);
        inPos += len;
        break;
      }

      case "I":
      {
        var len = getNumberToDelimiter(':');
        outData += delta.substr(deltaPos, len);
        deltaPos += (len + 1);
        break;
      }

      default:
        throw new Error("Syntax error in delta at position " + deltaPos);
    }

  }
  
  return outData;
}

module.exports.deltaEncode = deltaEncode;
module.exports.deltaDecode = deltaDecode;
 