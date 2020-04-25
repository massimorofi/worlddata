export class Transformer {

    static getFields(json: Object, k: string, fields: string[]) {
        var data = <Object[]>json;
        // Map<k,Map<fieldName,[...values...]>
        var result = new Map<string, Map<string, string[]>>();
        //console.log(data.length);
        for (let i = 0; i < data.length; i++) {
            var element = data[i];
            // get the value of the key to grou by it
            var keyValue = element[k];
            // Get Inner map
            var keyMapOld = result.get(keyValue);
            var keyMap = new Map<string, string[]>();
            if (keyMapOld != null) {
                keyMap = keyMapOld;
            }
            for (let j = 0; j < fields.length; j++) {
                var oldList = keyMap.get(fields[j]);
                //console.log(oldList);
                var list: string[] = [];
                if (oldList != null) {
                    list = oldList;
                }
                var value: string = '' + data[i][fields[j]];
                //console.log(fields[j]+value);
                list.push(value);
                keyMap.set(fields[j], list);
            }
            result.set(keyValue, keyMap);
        }
        return result;
    }
}