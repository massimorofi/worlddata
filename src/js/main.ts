import { Router, Route } from './routing/Router';
import { CovidDataITA } from './pages/covid-ita';
import { CovidWorld } from './pages/covid-world';
import { News } from './pages/news';


var mainRouter = new Router();
/**
 * Add dynamically sections to the main DOM
 */
function menuRoutingDefinition() {

    var covid = new CovidDataITA();
    // Define single route to be reused (covid italy)
    var covitaRoute = new Route('covid-ita-shortcut', 'panel', 'html/covid-ita.html', () => {
        covid.loadData();
    });
    mainRouter.addSingleRoute(covitaRoute);
    // Add Navigation Menu Routes
    //router.addRoute(<ID>: source html element, <HTML Element>: destination html element ID, <Path to HTML File>,<Function>));
    mainRouter.addRoute('news', 'panel', 'html/news.html', () => {
        mainRouter.addSingleRoute(covitaRoute);
        News.loadFeeds(['data/RSS_News.xml'], 20);
    });
    mainRouter.addRoute('covid-ita', 'panel', 'html/covid-ita.html', () => {
        covid.loadData();
    });
    mainRouter.addRoute('contacts', 'panel', 'html/contacts.html', null);
    // covid-world-shortcut
    var covidWorld = new CovidWorld();
    mainRouter.addRoute('covid-main', 'panel', 'html/Covid-world.html', () => {
        covidWorld.load();
    });

}


/* Set the width of the side navigation to 0 */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
function addMenuListeners() {
    document.getElementById('open-btn').addEventListener('click', () => { openNav(); });
    document.getElementById('close-btn').addEventListener('click', () => { closeNav(); });
    document.getElementById('mySidenav').addEventListener('click', () => { closeNav(); });
}

/**
 * set initial page
 * if url has target i.e.: http://host/index.html#covid-ita will open that page
 * otherwise a default news page will be opened. Routing is used for it 
 */
async function setInitPage() {
    const targetPage = window.location.href.split('#')[1];
    if (targetPage != undefined) {
        console.log('Setting main Page:::' + targetPage);
        mainRouter.route(targetPage);
    }
    else {
        mainRouter.route('news');
    }
}


/**
 * >>>>>>>> MAIN FUNCTION <<<<<<<<<<<<
 */
function main() {
    // define the routes.
    menuRoutingDefinition();
    // set eventlisteners
    addMenuListeners();
    setInitPage();
}

// Run main function
main();






