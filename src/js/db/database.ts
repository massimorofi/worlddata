import { Transformer } from './JSONTransformer';
const csv = require('jquery-csv');


export class Database {
    /** 
     *  Map<k,Map<fieldName,[...values...]>
     * */
    data: Map<string, Map<string, string[]>>;
    //jsonObj: any;
    rawData: string;

    constructor() {
        this.data = new Map<string, Map<string, string[]>>();
    }

    /**
     * return a map 
     */
    getDB() {
        return this.data;
    }

    getCSV() {
        return csv.toArray(this.rawData);
    }

    getJsonDB() {
        return csv.toObjects(this.rawData);
    }

    /**
     * 
     * @param 
     */
    load({ fileName, key, fields, callback }: { fileName: string; key: string; fields: string[]; callback: (rawdata: Map<string, Map<string, string[]>>) => any; }) {
        this.loadRemoteFile(fileName, "text/csv", (response: string) => {
            this.rawData = response;
            var jsonData = csv.toObjects(response);
            //console.log(jsonData);
            this.data = Transformer.getFields(jsonData, key, fields);
            if (callback != null) {
                //console.log(this.data);
                callback(this.data);
            }
        })
    }
    /**
     * 
     * @param fileName name of the  file containing the data
     * @param mimeType text/csv or others 
     * @param callback function called once the async response is arrived
     */
    loadRemoteFile(fileName: string, mimeType: string, callback: (data: string) => any) {
        var xobj = new XMLHttpRequest();
        xobj.open('GET', fileName, true);
        xobj.overrideMimeType(mimeType);
        xobj.setRequestHeader('Access-Control-Allow-Credentials', 'true');
        xobj.setRequestHeader('Access-Control-Allow-Origin', '*');
        xobj.setRequestHeader('Access-Control-Allow-Methods', 'GET');
        xobj.setRequestHeader('Access-Control-Allow-Headers', mimeType);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == 200) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }


}
