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
 * @return {Array.<Object>} An array of array of definition groups
 */
function extractDefsFromText(text) {
  let htmlResult = document.createElement('html');
  htmlResult.innerHTML = text;

  let result = [];
  let sourceData = htmlResult.querySelector(".source-data");
  let defTypes = sourceData.querySelectorAll(".def-pbk.ce-spot"); 
                                             // definition group
  defTypes.forEach(function(defType) {
    let group = {};
    group.type = defType.querySelector(".dbox-pg").textContent.trim(); 
                                       // word type class
    group.defList = [];
    defType.querySelectorAll(".def-content").forEach(function(definition) {
      group.defList.push(definition.textContent.trim());
    });
    result.push(group);
  });
  htmlResult.remove();
  return result;
}

/**
 * Change the content of the result div to the newly fetch definitions
 * @param {Array.<Object>} definitions An array of definition groups
 */
function insertToResultBox(defGroup) {
  let innerHtml = "";
  defGroup.forEach(function(group) {
    innerHtml += "<div class=\"def-group\">" 
                   + "<div class=\"def-type\"> <strong>" 
                   + group.type 
                   + "</strong> </div>";
    group.defList.forEach(function(definition) {
      innerHtml += "<div class=\"def-item\">" + definition + "</div>";
    });
    innerHtml += "</div>";
  });
  document.querySelector("#resultBox").innerHTML = innerHtml;
}
