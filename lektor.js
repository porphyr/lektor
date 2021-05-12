String.prototype.replaceAt = function(index, replacement) {
  if (index >= this.length) {
      return this.valueOf();
  }

  return this.substring(0, index) + replacement + this.substring(index + 1);
};

var count = 0;
var level = 0;

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

scanNormal = function(i) {
  var c = textarea.value[i];
  if ("\"'„“»«”‚‘".includes(c)) {
    console.log("Found quote at pos "+ i);
    count++;
    if (!i || "( >\n//".includes(textarea.value[i-1])) {
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
var textarea = document.getElementById("text");

doit = function() {
  level=0;

  for (var i = 0; i < textarea.value.length; ++i) {
    scanner(i);
  }
  console.log(count);
  textarea.focus();
  textarea.setSelectionRange(0,textarea.value.length);
};
