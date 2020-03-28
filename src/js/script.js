var Chart = require('../../node_modules/chart.js/dist/Chart.js');



//load Json
window.onload = function () {
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
        }


        // Create Main Chart
        mainGraph(lab, casi, decessi, guariti);

        // Create DetailChart
        detailedGraph(lab, ospedalizzati, ricoverati, domiciliari, intensiva);

    })
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

function detailedGraph(lab, ospedalizzati, ricoverati, domiciliari, intensiva) {
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
}

function loadJSON(fileName, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', fileName, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}