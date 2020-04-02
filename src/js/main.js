const { createDataTable, mainGraph, detailedGraph, dailyIncGraph, dailyStats} = require("./graphs");

const { loadJSON, loadHTML } = require("./utils");

// required modules
var $ = require('jquery');
var dt = require('datatables.net')(window, $);
var loaded=false;

/* Load HML Parts to be injected into index.html
loadHTML("summary_table.html",function(response){
    document.getElementById("summary_table").innerHTML = response;
});
loadHTML("top_page.html",function(response){
    document.getElementById("top_page").innerHTML = response;
});

loadHTML("graphs_section.html",function(response){
    document.getElementById("graphs_section").innerHTML = response;
});
*/


//LOAD JSON DATA then creates Data Table and Graphs

loadJSON("data/dpc-covid19-ita-andamento-nazionale.json", function (response) {
    // Parse JSON string into object
    //console.log("DATA=..." + response);
    var data = JSON.parse(response);
    var casi = [];
    var lab = [];
    var decessi = [];
    var guariti = [];
    var ospedalizzati = [];
    var domiciliari = [];
    var ricoverati = [];
    var intensiva = [];
    var tamponi = [];
    for (var i = 0; i < data.length; i++) {
        lab[i] = data[i].data;
        casi[i] = data[i].totale_casi;
        decessi[i] = data[i].deceduti;
        guariti[i] = data[i].dimessi_guariti;
        //details
        ospedalizzati[i] = data[i].totale_ospedalizzati;
        domiciliari[i] = data[i].isolamento_domiciliare;
        ricoverati[i] = data[i].ricoverati_con_sintomi;
        intensiva[i] = data[i].terapia_intensiva;
        tamponi[i] = data[i].tamponi / 10;
    }
    var diff_dead = [];
    var diff_casi = [];
    var diff_int = [];
    for (var i = 1; i < data.length; i++) {
        diff_dead[i] = decessi[i] - decessi[i - 1];
        diff_casi[i] = casi[i] - casi[i - 1];
        diff_int[i] = intensiva[i] - intensiva[i - 1];
    }
    // Create data table
    createDataTable(data)
    // Create Main Chart
    mainGraph(lab, casi, decessi, guariti);
    // Create DetailChart
    detailedGraph(lab, ospedalizzati, ricoverati, domiciliari, intensiva, tamponi);
    // Create Daily Increses 
    dailyIncGraph(lab, diff_int, diff_casi, diff_dead);
    dailyStats(data);
});






