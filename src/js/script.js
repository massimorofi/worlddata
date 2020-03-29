// required modules
var Chart = require('../../node_modules/chart.js/dist/Chart.js');
var $ = require('jquery');
var dt = require('datatables.net')(window, $);



//LOAD JSON DATA then creates Data Table and Graphs

loadJSON("data/dpc-covid19-ita-andamento-nazionale.json", function (response) {
    // Parse JSON string into object
    //console.log("DATA=..." + response);
    var data = JSON.parse(response);
    console.log(data.length);
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
});


//------------- DATA TABLES
function pad(s) { return (s < 10) ? '0' + s : s; }

function createDataTable(data) {
    $(document).ready(function () {
        var t = $('#data-table').DataTable();
        var table = document.getElementById('data-table');
        for (var i = 0; i < data.length; i++) {
            // create a new row

            var time = new Date(data[i].data);
            t.row.add([
                pad(time.getMonth()+1)+"-"+pad(time.getDate()),
                data[i].ricoverati_con_sintomi,
                data[i].terapia_intensiva,
                data[i].totale_ospedalizzati,
                data[i].isolamento_domiciliare,
                data[i].totale_attualmente_positivi,
                data[i].nuovi_attualmente_positivi,
                data[i].dimessi_guariti,
                data[i].deceduti,
                data[i].totale_casi,
                data[i].tamponi
            ]).draw(false);
        }
    });


};

//------------- MAIN GRAPH

function mainGraph(lab, casi, decessi, guariti) {
    var ctx = document.getElementById('MainChart');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: lab,
            datasets: [{
                label: 'Total Cases',
                data: casi,
                fill: false,
                borderColor: [
                    'rgba(0, 0, 255, 1)'
                ],
                borderWidth: 3
            },
            {
                label: 'Deceased',
                data: decessi,
                fill: false,
                borderColor: [
                    'rgba(255, 0, 0, 1)'
                ],
                borderWidth: 3
            },
            {
                label: 'Recovered',
                data: guariti,
                fill: false,
                borderColor: [
                    'rgba(0,255, 0, 1)'
                ],
                borderWidth: 3
            }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
};

//------------- Detailed GRAPH

function detailedGraph(lab, ospedalizzati, ricoverati, domiciliari, intensiva, tamponi) {
    var ctx = document.getElementById('Details');
    var detailChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: lab,
            datasets: [{
                label: 'Total Hospital',
                data: ospedalizzati,
                fill: false,
                borderColor: [
                    'rgba(0, 0, 255, 1)'
                ],
                stack: 'Stack 0'
            },
            {
                label: 'Critical',
                data: intensiva,
                fill: false,
                borderColor: [
                    'rgba(255, 0, 0, 1)'
                ],
                stack: 'Stack 1'
            },
            {
                label: 'Mild',
                data: ricoverati,
                fill: false,
                borderColor: [
                    'rgba(0,255, 255, 1)'
                ],
                stack: 'Stack 2'
            },
            {
                label: 'Home',
                data: domiciliari,
                fill: false,
                borderColor: [
                    'rgba(0,255, 0, 1)'
                ],
                stack: 'Stack 3'
            },
            {
                label: 'Tampons X 10',
                data: tamponi,
                fill: false,
                borderColor: [
                    'rgba(255,255, 0, 1)'
                ],
                stack: 'Stack 4'
            }
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Detailed Stats'
            }
        }
    });
};

//------------- Daily INC GRAPH
function dailyIncGraph(lab, diff_int, diff_casi, diff_dead) {
    var ctx = document.getElementById('DailyInc').getContext("2d");
    var detailChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: lab,
            datasets: [{
                label: 'Critical',
                data: diff_int,
                fill: true,
                borderWidth: 1
            },
            {
                label: 'Deads',
                data: diff_dead,
                fill: true,
                borderWidth: 1
            },
            {
                label: 'Home',
                data: diff_casi,
                fill: true,
            }
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Detailed Stats'
            },
            elements: {
                rectangle: {
                    backgroundColor: colorize.bind(null),
                    borderColor: colorize.bind(null),
                    borderWidth: 1
                }
            }
        }
    });
}

function colorize(ctx) {
    //console.log(ctx);
    switch (ctx.datasetIndex) {
        case 0:
            return 'rgba(0, 0, 255, 1)';
            break;
        case 1:
            return 'rgba(255, 0, 0, 1)';
            break;
        case 2:
            return 'rgba(0, 255, 0, 1)';
            break;
        default:
    }
    return 'rgba(128, 255, 125, 1)';
}

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