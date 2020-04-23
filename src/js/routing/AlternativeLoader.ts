


export class AlternativeLoader {
    static async loadFile(url: string, func: (window: Window, response: string) => void) {
        var script = document.createElement('script');
        script.type = 'text/xml';
        script.src = url;
        //script.crossOrigin='';
        var name = 'loader' + Math.random();
        window[name] = function (response) {
            func.call(window, response);
            document.getElementsByTagName('head')[0].removeChild(script);
            script = null;
            delete window[name];
        };
        // Load FILE
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}