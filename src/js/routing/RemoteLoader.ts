import { Route } from './Router';


export class RemoteLoader {
    static async loadFile(url: string, mimeType: string, func: (xobj: XMLHttpRequest) => void) {
        //console.log(source);
        //console.log(this.map)
        //var fileName = r.path;
        var xobj = new XMLHttpRequest();
        // console.log(window.location);
        xobj.open('GET', url, true);
        xobj.overrideMimeType(mimeType);
        //xobj.setRequestHeader('Access-Control-Allow-Credentials', 'true');
        //xobj.setRequestHeader('Access-Control-Allow-Origin', '*');
        //xobj.setRequestHeader('Access-Control-Allow-Methods', 'GET');
        // xobj.setRequestHeader('Access-Control-Allow-Headers', 'Origin,Access-Control-Allow-Origin,Access-Control-Allow-Methods,X-Requested-With,Access-Control-Allow-Headers,Content-Type,Authorization');
        //xobj.setRequestHeader("Content-Type", mimeType);
        //xobj.setRequestHeader('Origin', 'ITRMIGSPRI382BA');
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == 200) {
                func(xobj);
            }
        };
        xobj.send(null);
    }
}