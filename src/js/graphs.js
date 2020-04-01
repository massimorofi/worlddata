var Chart = require('chart.js');
var $ = require('jquery');


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
}
exports.mainGraph = mainGraph;
;
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
}
exports.detailedGraph = detailedGraph;
;
//------------- Daily INC GRAPH
function dailyIncGraph(lab, diff_int, diff_casi, diff_dead) {
    var ctx = document.getElementById('DailyInc').getContext("2d");
    var detailChart = new Chart(ctx, {
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
                label: 'Daily',
                data: diff_casi,
                fill: true,
            },
            {
                type: 'line',
                label: 'Outlook',
                data: diff_casi,
                borderColor: 'lightgreen',
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
            return 'rgba(0, 255, 0, 1)';
            break;
        default:
    }
    return 'rgba(128, 255, 125, 1)';
}
