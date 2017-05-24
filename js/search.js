window.onload = function() {
  var button = document.querySelector("#submit");
  button.addEventListener("click", makeSearch);
};

function makeSearch() {
  var url = getSearchUrl();
  var request = createCORSRequest("GET", url);
  var promise = makeRequest(request);
  promise.then(function(text) {
    var definitions = extractDefsFromText(text);
    insertToResultBox(definitions);
  }).catch(function(error) {
    console.log(error);
  });
}

function getSearchUrl() {
  var element = document.querySelector("#query");
  var url = "http://www.dictionary.com/browse/" + element.value + "?s=t";
  return url
}

function createCORSRequest(method, url) {
  var request = new XMLHttpRequest();
  if ("withCredentials" in request) {
    // Chrome/Firefox/Opera/Safari
    request.open(method, url);
  } else if (typeof XDomainRequest != "undefined") {
    // IE
    request = new XDomainRequest();
    request.open(method, url);
  } else {
    // CORS not supported
    request = null;
  }
  return request;
}

function makeRequest(request) {
  return new Promise(function(succeed, fail) {
    var result = "";
    if (request == null) {
      console.error("CORS not supported");
    } else {
      request.onload = function() {
        succeed(request.responseText);
      };
      request.onerror = function() {
        fail(new Error("Request failed: " + req.statusText));
      };
      request.addEventListener("error", function() {
        fail(new Error("Network error"));
      });
      request.send();
    }
  });
}

function extractDefsFromText(text) {
  var htmlResult = document.createElement('html');
  htmlResult.innerHTML = text;

  var result = [];
  htmlResult.querySelectorAll(".def-content").forEach(function(definition) {
    result.push(definition.innerHTML.trim());
  });
  return result;
}

function insertToResultBox(definitions) {
  var innerHtml = "";
  definitions.forEach(function(definition, index) {
    console.log(definition);
    innerHtml = innerHtml + "<div id=\"def-" + index + "\">" 
                    + definition + "</div>";
  });
  document.querySelector("#resultBox").innerHTML = innerHtml;
}
