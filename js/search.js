window.onload = function() {
  let form = document.querySelector("#searchBox");
  form.addEventListener("submit", function(event) {
    makeSearch();
    event.preventDefault();
  });
};

/** Perform a search using the content of the text field. */
function makeSearch() {
  let url = getSearchUrl();
  let request = createCORSRequest("GET", url);
  let promise = makeRequest(request);
  promise.then(function(text) {
    let definitions = extractDefsFromText(text);
    insertToResultBox(definitions);
  }).catch (function(error) {
    console.log(error);
  });
}

/** 
 * Get the url of the online dictionary website 
 * @return {string} The url of the query to the dictionary website
 */
function getSearchUrl() {
  let element = document.querySelector("#query");
  let url = "http://www.dictionary.com/browse/" + encodeURI(element.value);
  return url
}

/** 
 * Create a http request, cross-origin resource
 * @param {string} method The type of request (PUT, GET, etc.)
 * @param {string} url The url of the dictionary website
 * @return {XMLHttpRequest} The created request object
 */
function createCORSRequest(method, url) {
  let request = new XMLHttpRequest();
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
    let result = "";
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
 * @param {string} text The string in html format
 * @return {Array} An array of string, each is a definition
 */
function extractDefsFromText(text) {
  let htmlResult = document.createElement('html');
  htmlResult.innerHTML = text;

  let result = [];
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
  let innerHtml = "";
  definitions.forEach(function(definition, index) {
    innerHtml = innerHtml + "<div id=\"def-" + index + "\">" 
                    + definition + "</div>";
  });
  document.querySelector("#resultBox").innerHTML = innerHtml;
}
