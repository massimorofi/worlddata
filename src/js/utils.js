// Load Jason data tables
function loadJSON(fileName, callback) {
    var xobj = new XMLHttpRequest();
    xobj.open('GET', fileName, true);
    xobj.overrideMimeType("application/json");
    xobj.setRequestHeader('Access-Control-Allow-Credentials', true);
    xobj.setRequestHeader('Access-Control-Allow-Origin', '*');
    xobj.setRequestHeader('Access-Control-Allow-Methods', 'GET');
    xobj.setRequestHeader('Access-Control-Allow-Headers', 'application/json');
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
exports.loadJSON = loadJSON;

// Load HTML portion
function loadHTML(fileName, callback) {
    var xobj = new XMLHttpRequest();
    xobj.open('GET', fileName, true);
    xobj.overrideMimeType("text/html");
    xobj.setRequestHeader('Access-Control-Allow-Credentials', true);
    xobj.setRequestHeader('Access-Control-Allow-Origin', '*');
    xobj.setRequestHeader('Access-Control-Allow-Methods', 'GET');
    xobj.setRequestHeader('Access-Control-Allow-Headers', 'text/html');
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
exports.loadHTML = loadHTML;
