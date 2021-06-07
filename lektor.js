String.prototype.replaceAt = function(index, replacement) {
  if (index >= this.length) {
      return this.valueOf();
  }

  return this.substring(0, index) + replacement + this.substring(index + 1);
};

var count = 0;
var level = 0;
var starts = [];

showError = function(pos, msg) {
   textarea.focus();
   textarea.setSelectionRange(pos-1,pos+1);
   var charsPerRow = textarea.cols;
   var selectionRow = (pos - (pos % charsPerRow)) / charsPerRow;
   var lineHeight = textarea.clientHeight / textarea.rows;
   textarea.scrollTop = lineHeight * selectionRow;
   alert(msg);
   throw "error";
};

processStartQuote = function(i) {
  starts[level] = i;
  if (level == 0) {
    textarea.value = textarea.value.replaceAt(i, "„");
  } else if (level == 1) {
    textarea.value = textarea.value.replaceAt(i, "»");
  } else {
    showError(i, "Zu viele öffnende Anführungszeichen");
  }
  level++;
};

processEndQuote = function(i) {
  if (level == 1) {
    textarea.value = textarea.value.replaceAt(i, "“");
  } else if (level == 2) {
    textarea.value = textarea.value.replaceAt(i, "«");
  } else {
    showError(i, "Zu viele schließende Anführungszeichen");
  }
  level--;
}

var lastChar=null;
scanNormal = function(i) {
  var c = textarea.value[i];
  if (c == "'" && lastChar != null && lastChar.match(/[a-z]/i) && textarea.value[i+1].match(/[a-z]/i) ) {
	  lastChar = c;
	  return;
  }

  if ("\"'„“»«”‚‘".includes(c)) {
    console.log("Found quote at pos "+ i);
    count++;
    if (lastChar == null || "( \n//".includes(lastChar)) {
      processStartQuote(i);
    } else {
      processEndQuote(i);
    }
  }

  if ("€%".includes(c) && textarea.value[i-1] != " ") {
    textarea.value = [textarea.value.slice(0, i), " ", textarea.value.slice(i)].join('');
  }
 
  if ("§".includes(c) && textarea.value[i+1] != " ") {
    textarea.value = [textarea.value.slice(0, i+1), " ", textarea.value.slice(i+1)].join('');
  }

  if (c == "<") {
    scanner = scanElement;
    return;
  }
  if (c == "[") {
    scanner = scanElement2;
    return;
  }
  lastChar = c;
};

scanElement = function(i) {
  var c = textarea.value[i];
  if (c == ">") {
    scanner = scanNormal;
  }
}

scanElement2 = function(i) {
  var c = textarea.value[i];
  if (c == "]") {
    scanner = scanNormal;
  }
}

var scanner = scanNormal;
var textarea

doit = function() {
  if(!textarea) textarea = document.getElementById("text");
  level=0;
  lastChar = null;
  
  // replace all redundant whitespaces
  textarea.value = textarea.value.replaceAll(/  /ig, " ");
  
  textarea.value = 	textarea.value.replaceAll(/\( *(<a href=\"[^>]*\">) *([^ ].*[^ ]) *<\/a> *\)/g, "($1$2</a>)");
  textarea.value = 	textarea.value.replaceAll(/ *(<a href=\"[^>]*\">) *\(* ([^ ].*[^ ]) *\) *<\/a> */g, " ($1$2</a>) ");

  for (var i = 0; i < textarea.value.length; ++i) {
    scanner(i);
  }
  
  if (level) {
	showError(starts[level-1], "Fehlendes schließendes Anführungszeichen");
  }
  
  console.log(count);
  textarea.focus();
  textarea.setSelectionRange(0,textarea.value.length);
};
