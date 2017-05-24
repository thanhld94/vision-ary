window.onload = function() {
  var button = document.querySelector("#submit");
  button.addEventListener("click", makeSearch);
};

/** Perform a search using the content of the text field. */
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

/** 
 * Get the url of the online dictionary website 
 * @return {String} The url of the query to the dictionary website
 */
function getSearchUrl() {
  var element = document.querySelector("#query");
  var url = "http://www.dictionary.com/browse/" + element.value + "?s=t";
  return url
}

/** 
 * Create a http request, cross-origin resource
 * @param {String} method The type of request (PUT, GET, etc.)
 * @param {String} url The url of the dictionary website
 * @return {XMLHttpRequest} The created request object
 */
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

/**
 * Send out the query request
 * @param {XMLHttpRequest} request The request object
 * @return {Promise} The promise object of the response
 */
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

/**
 * Extract the result definitions from a string of html
 * @param {String} text The string in html format
 * @return {Array} An array of string, each is a definition
 */
function extractDefsFromText(text) {
  var htmlResult = document.createElement('html');
  htmlResult.innerHTML = text;

  var result = [];
  htmlResult.querySelectorAll(".def-content").forEach(function(definition) {
    result.push(definition.innerHTML.trim());
  });
  htmlResult.remove();
  return result;
}

/**
 * Change the content of the result div to the newly fetch definitions
 * @param {Array} definintions An array of strings, each is a defintion
 */
function insertToResultBox(definitions) {
  var innerHtml = "";
  definitions.forEach(function(definition, index) {
    innerHtml = innerHtml + "<div id=\"def-" + index + "\">" 
                    + definition + "</div>";
  });
  document.querySelector("#resultBox").innerHTML = innerHtml;
}
