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



export class CovidWorld {
    dbEU: Database;
    wmDB: Database;
    firstLoad = true;

    load() {
        if (this.firstLoad) {
            this.dbEU = new Database();
            this.dbEU.load({
                fileName: '/data/world-covid.csv', key: 'COUNTRIESANDTERRITORIES',
                fields: ['COUNTRIESANDTERRITORIES', 'DATEREP', 'CASES', 'DEATHS', 'POPDATA2018'],
                callback: () => {
                    //this.calculateTotals();
                    this.createDataTable();
                    this.firstLoad = false;
                }
            });
            // WM Database
            this.wmDB = new Database();
            this.wmDB.load({
                fileName: '/data/covid-stats.csv', key: 'DATE',
                fields: ['COUNTRY', 'TOT_CASES_1M_POP', 'DEATHS_1M_POP', 'TESTS_1M_POP'],
                callback: () => {
                    this.statGraph();
                    this.firstLoad = false;
                }
            });
        } else {
            console.log('Not first Load');
            this.statGraph();
            this.createDataTable();
        }
    }

    statGraph() {
        var ctx = document.getElementById('covid-stats-world');
        var dataset = Array.from(this.wmDB.getDB().keys());
        var lastUpdate = dataset[0];
        document.getElementById('covid-stats-lastupdate').innerText = lastUpdate;
        console.log(this.wmDB.getDB());
        console.log(dataset)
        var latest = dataset[dataset.length - 1];
        var data = this.wmDB.getDB().get(latest);
        console.log(latest);
        //console.log(data);
        var cases = data.get('TOT_CASES_1M_POP');
        var deaths = data.get('DEATHS_1M_POP');
        var tampons = data.get('TESTS_1M_POP');
        var lab = data.get('COUNTRY');
        var regionalChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: lab,
                datasets: [{
                    label: 'Infects',
                    data: cases,
                    fill: true,
                    borderColor: 'blue',
                    backgroundColor: 'blue',
                    borderWidth: 1
                },
                {
                    label: 'Deaths',
                    data: deaths,
                    fill: true,
                    borderColor: 'red',
                    backgroundColor: 'red',
                    borderWidth: 1
                },
                {
                    label: 'Tested',
                    data: tampons,
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
                    text: 'Global COVID-19 Stats per Million of Population. Updated [' + lastUpdate + ']'
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



    /**
     * Create the table from EU Open Data 
     */
    createDataTable() {
        var db = this.dbEU.getDB();
        //console.log(db);
        //console.log('Creating CW table...');
        var t = $('#covid-table-world').DataTable({
            deferRender: true,
            responsive: true,
            //pageLength: 300,
            order: [[1, "desc"]]
        });

        db.forEach((value, key, map) => {
            // create a new row
            var data = db.get(key);
            var l = 0;
            //console.log(key);
            //console.log(value);
            //var time = new Date(data.get('dataRep')[l]);
            t.row.add([
                key,
                data.get('CASES')[l],
                data.get('DEATHS')[l],
                Number(data.get('POPDATA2018')[l]).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            ]).draw(false);
        });
        $('#covid-world-lastupdate').text(db.get('Italy').get('DATEREP')[0]);
    };
    private pad(s) { return (s < 10) ? '0' + s : s; };
    /**
     * Calculate the total... not usen anymore
     */
    calculateTotals() {
        var db = this.dbEU.getDB();
        db.forEach((value, key, map) => {
            // create a new row
            var data = db.get(key);
            var l = data.get('DATEREP').length - 1;
            //console.log(key);
            //console.log(value);
            var totalDeaths = 0;
            var totalCases = 0;
            for (let i = 0; i < l; i++) {
                totalCases = totalCases + Number(data.get('CASES')[i]);
                totalDeaths = Number(data.get('DEATHS')[i]) + totalDeaths;
            }
            var date = new Date(key);
            date.setDate(date.getDate() + 1);
            data.get('CASES')[l + 1] = '' + totalCases;
            data.get('DEATHS')[l + 1] = '' + totalDeaths;
            data.get('POPDATA2018')[l + 1] = Number(data.get('POPDATA2018')[l]).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            data.get('DATEREP')[l + 1] = date.toString();
        });
    }

}