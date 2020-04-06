const { createDataTable, mainGraph, detailedGraph, dailyIncGraph, dailyStats, regionalGraph } = require("./graphs");
const { loadRemoteFile } = require("./utils");


// required modules
var $ = require('../../node_modules/jquery/dist/jquery.js');
var csv = require('../../node_modules/jquery-csv/src/jquery.csv.min.js');
//var dt = require('datatables.net')(window, $);


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


//LOAD CSV DATA then creates Data Table and Graphs
loadRemoteFile("/data/dpc-covid19-ita-andamento-nazionale.csv", "text/csv", function (response) {
    // Parse JSON string into object
    //console.log("DATA=..." + response);
    //var data = JSON.parse(response);
    var data = csv.toObjects(response);
    //console.log(data);
    var casi = [];
    var lab = [];
    var deceduti = [];
    var guariti = [];
    var ospedalizzati = [];
    var domiciliari = [];
    var ricoverati = [];
    var intensiva = [];
    var tamponi = [];
    for (var i = 0; i < data.length; i++) {
        var day = new Date(data[i].data);
        lab[i] = day.getDate() + "-" + (day.getMonth() + 1);
        casi[i] = Number(data[i].totale_casi);
        deceduti[i] = Number(data[i].deceduti);
        guariti[i] = Number(data[i].dimessi_guariti);
        //details
        ospedalizzati[i] = Number(data[i].totale_ospedalizzati);
        domiciliari[i] = Number(data[i].isolamento_domiciliare);
        ricoverati[i] = Number(data[i].ricoverati_con_sintomi);
        intensiva[i] = Number(data[i].terapia_intensiva);
        tamponi[i] = Number(data[i].tamponi) / 10;
    }
    lab[data.length] = "+1";
    lab[data.length + 1] = "+2";
    lab[data.length + 2] = "+3";
    // Calculate differences
    var diff_dead = [];
    var diff_casi = [];
    var diff_int = [];
    for (var i = 1; i < data.length; i++) {
        diff_dead[i] = deceduti[i] - deceduti[i - 1];
        diff_casi[i] = casi[i] - casi[i - 1];
        diff_int[i] = intensiva[i] - intensiva[i - 1];
    }

    // Create data table
    createDataTable(data)
    // Create Main Chart
    mainGraph(lab, casi, deceduti, guariti);
    // Create DetailChart
    detailedGraph(lab, ospedalizzati, ricoverati, domiciliari, intensiva, tamponi);
    // Create Daily Increses 
    dailyIncGraph(data, lab, diff_int, diff_casi, diff_dead);
    dailyStats(data);
});


// Regional Table
loadRemoteFile("data/dpc-covid19-ita-regioni-latest.csv", "text/csv", function (response) {
    var data = csv.toObjects(response);
    // console.log(data);
    var totale_casi = [];
    var lab = [];
    var deceduti = [];
    var guariti = [];
    var ospedalizzati = [];
    var domiciliari = [];
    var ricoverati = [];
    var intensiva = [];
    var tamponi = [];
    for (var i = 0; i < data.length; i++) {
        lab[i] = data[i].denominazione_regione;
        totale_casi[i] = Number(data[i].totale_casi);
        deceduti[i] = Number(data[i].deceduti);
        guariti[i] = Number(data[i].dimessi_guariti);
        //details
        ospedalizzati[i] = Number(data[i].totale_ospedalizzati);
        domiciliari[i] = Number(data[i].isolamento_domiciliare);
        ricoverati[i] = Number(data[i].ricoverati_con_sintomi);
        intensiva[i] = Number(data[i].terapia_intensiva);
        tamponi[i] = Number(data[i].tamponi) / 10;
    }
    // Display Graph
    regionalGraph(lab, totale_casi, deceduti, guariti);
    //console.log(totale_casi)

});







