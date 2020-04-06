

// Load HTML portion
function loadRemoteFile(fileName, mimeType, callback) {
    var xobj = new XMLHttpRequest();
    xobj.open('GET', fileName, true);
    xobj.overrideMimeType(mimeType);
    xobj.setRequestHeader('Access-Control-Allow-Credentials', true);
    xobj.setRequestHeader('Access-Control-Allow-Origin', '*');
    xobj.setRequestHeader('Access-Control-Allow-Methods', 'GET');
    xobj.setRequestHeader('Access-Control-Allow-Headers', mimeType);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
exports.loadRemoteFile = loadRemoteFile;
