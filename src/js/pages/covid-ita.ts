import { Database } from '../db/database';


// Require JS libraries that have no datatypes definition
const Chart = require('chart.js');
const $ = require('jquery');
var dt = require('datatables.net');
var dt_bs = require('datatables.net-bs4');
var dt_resp = require('datatables.net-responsive-bs4');

// in this call we're attaching Datatables as a jQuery plugin
// without this step $().DataTable is undefined
dt(window, $);
// we need to do the same step for the datatables bootstrap an responsive plugins
dt_bs(window, $);
dt_resp(window, $);



/**
 * Covid Italy data
 */
export class CovidDataITA {
    dbNazionale: Database;
    dbRegioni: Database;
    diff_dead = [];
    diff_casi = [];
    diff_int = [];
    lab = [];
    firstLoad: boolean;

    constructor() {
        this.firstLoad = true;
    }

    loadData() {
        if (this.firstLoad) {
            this.dbRegioni = new Database();
            this.dbRegioni.load({
                fileName: '/data/dpc-covid19-ita-regioni.csv', key: 'data', fields: ['denominazione_regione', 'totale_casi', 'deceduti', 'dimessi_guariti'], callback: (data: any) => {
                    //console.log(data);
                    this.regionalGraph();
                }
            });
            this.dbNazionale = new Database();
            this.dbNazionale.load({
                fileName: '/data/dpc-covid19-ita-andamento-nazionale.csv', key: 'stato', fields: ['data', 'totale_casi', 'deceduti', 'dimessi_guariti', 'totale_ospedalizzati',
                    'isolamento_domiciliare', 'ricoverati_con_sintomi', 'nuovi_positivi', 'totale_positivi',
                    'terapia_intensiva', 'tamponi'], callback: (data: any) => {
                        this.calcdatiNazionali();
                        this.dailyStats();
                        this.dailyIncGraph();
                        this.createDataTable();
                        //console.log(data);
                        this.firstLoad = false;
                    }
            });
        } else {
            this.dailyStats();
            this.dailyIncGraph();
            this.createDataTable();
            this.regionalGraph();
        }

    }

    private calcdatiNazionali() {
        const dbValues = this.dbNazionale.data.get('ITA');
        var deceduti = dbValues.get('deceduti');
        var intensiva = dbValues.get('terapia_intensiva');
        var casi = dbValues.get('totale_casi');
        var data = dbValues.get('data');
        var l = casi.length;
        for (var i = 1; i < l; i++) {
            var day = new Date(data[i]);
            this.lab[i] = day.getDate() + "-" + (day.getMonth() + 1);
            this.diff_dead[i] = Number(deceduti[i]) - Number(deceduti[i - 1]);
            this.diff_casi[i] = Number(casi[i]) - Number(casi[i - 1]);
            this.diff_int[i] = Number(intensiva[i]) - Number(intensiva[i - 1]);
        }
        this.lab[data.length] = "+1";
        this.lab[data.length + 1] = "+2";
        this.lab[data.length + 2] = "+3";
    }

    private dailymovingAverage() {
        var mavg = [];
        var length = this.dbNazionale.data.get('ITA').get('data').length;
        var nuovi_positivi = this.dbNazionale.data.get('ITA').get('nuovi_positivi');

        mavg[0] = [(length + 2)];
        mavg[1] = [(length + 2)];
        for (let i = 0; i < 2; i++) {
            mavg[0][i] = 0;
            mavg[1][i] = 0;
        }
        for (let i = 2; i < length; i++) {
            mavg[0][i] = (Number(nuovi_positivi[i - 2]) + Number(nuovi_positivi[i - 1]) + Number(nuovi_positivi[i])) / 3;
            mavg[1][i] = (this.diff_dead[i - 2] + this.diff_dead[i - 1] + this.diff_dead[i]) / 3;
        }
        for (let i = length; i < (length + 3); i++) {
            mavg[0][i] = (mavg[0][i - 3] + mavg[0][i - 2] + mavg[0][i - 1]) / 3;
            mavg[1][i] = (mavg[1][i - 3] + mavg[1][i - 2] + mavg[1][i - 1]) / 3;
        }

        return mavg;
    }

    //------------- Daily INC GRAPH
    dailyIncGraph() {
        var mavg = this.dailymovingAverage();
        var ctx = document.getElementById('covid-ita-charts');
        var dailyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.lab,
                datasets: [{
                    type: 'bar',
                    label: 'Critical',
                    data: this.diff_int,
                    fill: true,
                    borderWidth: 1
                },
                {
                    type: 'bar',
                    label: 'Deads',
                    data: this.diff_dead,
                    fill: true,
                    borderWidth: 1
                },
                {
                    type: 'bar',
                    label: 'New_Daily',
                    data: this.diff_casi,
                    fill: true,
                },
                {
                    type: 'line',
                    label: 'Trend',
                    data: mavg[0],
                    borderColor: 'lightgreen',
                    fill: true,
                },
                {
                    type: 'line',
                    label: 'Death-Trend',
                    data: mavg[1],
                    borderColor: 'red',
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
                        backgroundColor: this.colorize.bind(null),
                        borderColor: this.colorize.bind(null),
                        borderWidth: 1
                    }
                }
            }
        });
    }

    private colorize(ctx) {
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



    // Top pane with data and statistics insidetop_page.html
    dailyStats() {
        var jsonDB = this.dbNazionale.getJsonDB();
        var index = this.dbNazionale.getDB().get('ITA').get('data').length-1;
        var latest = jsonDB[index];
        //console.log(latest);
        var newLocal = new Date(latest.data);
        document.getElementById("data.data").innerHTML = (newLocal).toDateString() + " at " + newLocal.toLocaleTimeString();
        document.getElementById("data.terapia_intensiva").innerHTML = "Intensive Care Unit: " + latest.terapia_intensiva;
        document.getElementById("data.totale_ospedalizzati").innerHTML = "Hospitalized: " + latest.totale_ospedalizzati;
        document.getElementById("data.isolamento_domiciliare").innerHTML = "At Home: " + latest.isolamento_domiciliare;
        document.getElementById("data.totale_positivi").innerHTML = "Currently Infected: " + latest.totale_positivi;
        document.getElementById("data.nuovi_positivi").innerHTML = "New Cases: " + latest.nuovi_positivi;
        document.getElementById("data.dimessi_guariti").innerHTML = "Recovered: " + latest.dimessi_guariti;
        document.getElementById("data.deceduti").innerHTML = "Deaths: " + latest.deceduti;
        document.getElementById("data.totale_casi").innerHTML = " Total Cases: " + latest.totale_casi;
        document.getElementById("data.tamponi").innerHTML = " Total Tested: " + latest.tamponi;
        // stats below
        var closed = Number(latest.deceduti) + Number(latest.dimessi_guariti);
        var mortality = ((latest.deceduti / closed) * 100).toFixed(2);
        var recovery = ((latest.dimessi_guariti / closed) * 100).toFixed(2);
        //console.log(" #DATA: " + closed + "," + mortality + "," + recovery);
        document.getElementById("closed.cases").innerHTML = "Closed Cases: " + closed;
        document.getElementById("mortality").innerHTML = " Mortality Rate (current) " + mortality + "%";
        document.getElementById("recovery").innerHTML = " Recovery Rate: " + recovery + "%";
    }

    /**
     * Populate data table
     * @param data 
     */
    createDataTable() {
        var data = this.dbNazionale.data.get('ITA');

        var t = $('#data-table').DataTable({
            deferRender: true,
            responsive: true,
            order: [[0, "desc"]]
        });
        var l = data.get('data').length;
        for (var i = 0; i < l; i++) {
            // create a new row
            var time = new Date(data.get('data')[i]);
            t.row.add([
                this.pad(time.getMonth() + 1) + "-" + this.pad(time.getDate()),
                data.get('tamponi')[i],
                data.get('totale_casi')[i],
                data.get('nuovi_positivi')[i],
                data.get('totale_positivi')[i],
                data.get('deceduti')[i],
                data.get('ricoverati_con_sintomi')[i],
                data.get('terapia_intensiva')[i],
                data.get('totale_ospedalizzati')[i],
                data.get('isolamento_domiciliare')[i],
                data.get('dimessi_guariti')[i]
            ]).draw(false);
        };
    }
    private pad(s) { return (s < 10) ? '0' + s : s; };


    regionalGraph() {
        var ctx = document.getElementById('covid-regional-ita');
        var dataset = Array.from(this.dbRegioni.getDB().keys());
        //console.log(dataset)
        var latest = dataset[dataset.length - 1];
        var data = this.dbRegioni.getDB().get(latest);
        //console.log(latest);
        //console.log(data);
        var totale_casi = data.get('totale_casi');
        var deceduti = data.get('deceduti');
        var guariti = data.get('dimessi_guariti');
        var lab = data.get('denominazione_regione');
        var regionalChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: lab,
                datasets: [{
                    label: 'Total Infects',
                    data: totale_casi,
                    fill: true,
                    borderColor: 'blue',
                    backgroundColor: 'blue',
                    borderWidth: 1
                },
                {
                    label: 'Deads',
                    data: deceduti,
                    fill: true,
                    borderColor: 'red',
                    backgroundColor: 'red',
                    borderWidth: 1
                },
                {
                    label: 'Healed',
                    data: guariti,
                    fill: true,
                    borderColor: 'green',
                    backgroundColor: 'green',
                    borderWidth: 1
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
                    text: 'Regional BreakDown'
                },
                elements: {
                    rectangle: {
                        borderWidth: 2,
                    }
                },
                scales: {
                    x: {
                        suggestedMin: 0,
                        suggestedMax: 55000
                    }
                }
            }
        });
    };

}
