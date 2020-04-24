import { RemoteLoader } from '../routing/RemoteLoader';
var $ = require('jquery');


export class News {
    static node = '#rss-feed';

    static loadFeeds(urls: string[], max: number) {
        $(this.node).empty();
        var group = $(this.node).append("<div class=\"card-columns\"></div>");
        for (let i = 0; i < urls.length; i++) {
            const feed = urls[i];
            this.loadSingleFeed(feed, max, group);
        }
    }

    static loadSingleFeed(url: string, max: number, group: Element) {
        RemoteLoader.loadFile(url, 'text/xml', (response: XMLHttpRequest) => {
            //console.log('@@@@' + response);
            var rss = (new DOMParser()).parseFromString(response.responseText, 'text/xml');
            var items = rss.getElementsByTagName('item');
            //console.log(items[0]);
            var l = items.length;
            if (l > max) {
                l = max;
            }
            for (let i = 0; i < l; i++) {
                var element = items[i];
                var title = this.getNodeContent(rss, element, 'title');
                var description = (this.getNodeContent(rss, element, 'description')).substr(0, 800) + " ... ";
                var link = element.getElementsByTagName('link')[0].childNodes[0].textContent;
                var pubDate = element.getElementsByTagName('pubDate')[0].childNodes[0].textContent;
                var card = `
                <div id="news-card" class="card rounded mx-auto my-auto shadow-lg" style="max-width: 24rem;" >
                <div class="card-header">
                   <strong><a href="${link}" target="_blank" class="card-link"> ${title}</a></strong>
                </div>
                <div class="card-body">
                  <p class="card-text" >${description}</p>
                </div> 
                    <div class="card-footer"><small class="text-muted">Last updated [${pubDate}]</small></div>
                </div>`;
                $(group).append(card);
            }
        })
    };

    private static getNodeContent(rss: XMLDocument, node: Element, tagName: string) {

        const tag = node.getElementsByTagName(tagName);
        if (tag[0] == null) {
            return "";
        }
        if (tag[0].childNodes[0] == null) {
            return "";
        }
        return tag[0].childNodes[0].textContent;
    }

}

