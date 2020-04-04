var Chart = require('chart.js');
var $ = require('jquery');


//------------- DATA TABLES
function pad(s) { return (s < 10) ? '0' + s : s; }
function createDataTable(data) {
    $(document).ready(function () {
        var t = $('#data-table').DataTable({ "deferRender": true });
        for (var i = 0; i < data.length; i++) {
            // create a new row
            var time = new Date(data[i].data);
            t.row.add([
                pad(time.getMonth() + 1) + "-" + pad(time.getDate()),
                data[i].ricoverati_con_sintomi,
                data[i].terapia_intensiva,
                data[i].totale_ospedalizzati,
                data[i].isolamento_domiciliare,
                data[i].totale_positivi,
                data[i].nuovi_positivi,
                data[i].dimessi_guariti,
                data[i].deceduti,
                data[i].totale_casi,
                data[i].tamponi
            ]).draw(false);

        }
    });
}
exports.createDataTable = createDataTable;

function dailymovingAverage(data) {
    var mavg = [];
    mavg[0] = [data.lenght];
    mavg[1] = [data.lenght]
    for (let i = 2; i < data.length; i++) {
        mavg[0][i] = (data[i - 2].nuovi_positivi + data[i - 1].nuovi_positivi + data[i].nuovi_positivi) / 3;
        mavg[1][i] = (data[i - 2].deceduti + data[i - 1].deceduti + data[i].deceduti) / 3;
    }
    return mavg;
}

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
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            title: {
                display: true,
                text: 'Main Data'
            }
        }
    });
}
exports.mainGraph = mainGraph;

//------------- Detailed GRAPH
function detailedGraph(lab, ospedalizzati, ricoverati, domiciliari, intensiva, tamponi) {
    var ctx = document.getElementById('DetailsChart');
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
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0,
            title: {
                display: true,
                text: 'Detailed Stats'
            }
        }
    });
}
exports.detailedGraph = detailedGraph;

//------------- Daily INC GRAPH
function dailyIncGraph(data, lab, diff_int, diff_casi, diff_dead) {
    var mavg = dailymovingAverage(data);
    var ctx = document.getElementById('DailyInc');
    var dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: lab,
            datasets: [{
                type: 'bar',
                label: 'Critical',
                data: diff_int,
                fill: true,
                borderWidth: 1
            },
            {
                type: 'bar',
                label: 'Deads',
                data: diff_dead,
                fill: true,
                borderWidth: 1
            },
            {
                type: 'bar',
                label: 'New_Daily',
                data: diff_casi,
                fill: true,
            },
            {
                type: 'line',
                label: 'Trend',
                data: mavg[0],
                borderColor: 'lightgreen',
                fill: true,
            }
            ]
        },
        options: {
            responsive: true,
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0,
            title: {
                display: true,
                text: 'Indicators'
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
exports.dailyIncGraph = dailyIncGraph;
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
            return 'rgba(0, 128, 128, 1)';
            break;
        default:
    }
    return 'rgba(128, 255, 125, 1)';
}


function dailyStats(data) {
    $(document).ready(function () {
        var index=data.length-1;
        var latest = data[index];
        var newLocal = new Date(latest.data);
        document.getElementById("data.data").innerHTML = (newLocal).toDateString() + " at " + newLocal.toLocaleTimeString();
        document.getElementById("data.terapia_intensiva").innerHTML = "Intensive Care Unit: " + latest.terapia_intensiva;
        document.getElementById("data.totale_ospedalizzati").innerHTML = "Hospitalized: " + latest.totale_ospedalizzati;
        document.getElementById("data.isolamento_domiciliare").innerHTML = "At Home with symptoms: " + latest.isolamento_domiciliare;
        document.getElementById("data.totale_positivi").innerHTML = "Currently Infected: " + latest.totale_positivi;
        document.getElementById("data.nuovi_positivi").innerHTML = "New Cases: " + latest.nuovi_positivi;
        document.getElementById("data.dimessi_guariti").innerHTML = "Recovered: " + latest.dimessi_guariti;
        document.getElementById("data.deceduti").innerHTML = "Dead Toll: " + latest.deceduti;
        document.getElementById("data.totale_casi").innerHTML = " Total Number of Cases: " + latest.totale_casi;
        document.getElementById("data.tamponi").innerHTML = " Total Number of Tested: " + latest.tamponi;
        // stats below
        var closed = Number(latest.deceduti) + Number(latest.dimessi_guariti);
        var mortality = parseFloat((Number(latest.deceduti) / closed) * 100).toFixed(2);
        var recovery = parseFloat((Number(latest.dimessi_guariti) / closed) * 100).toFixed(2);
        //console.log(" #DATA: " + closed + "," + mortality + "," + recovery);
        document.getElementById("closed.cases").innerHTML = "Closed Cases: " + closed;
        document.getElementById("mortality").innerHTML = " Mortality Rate (current) " + mortality + "%";
        document.getElementById("recovery").innerHTML = " Recovery Rate: " + recovery + "%";

    });
}
exports.dailyStats = dailyStats;