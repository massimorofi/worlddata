import { Database } from '../db/database';

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
    db: Database;
    firstLoad = true;

    load() {
        if (this.firstLoad) {
            this.db = new Database();
            this.db.load({
                fileName: '/data/covid-19-world.csv', key: 'countriesAndTerritories',
                fields: ['dateRep', 'cases', 'deaths', 'popData2018'],
                callback: () => {
                    this.calculateTotals();
                    this.createDataTable();
                    this.firstLoad = false;
                }
            });
        } else {
            console.log('Not first Load');
            this.createDataTable();
        }

    }
    createDataTable() {
        var db = this.db.getDB();
        console.log('Creating CW table...');
        var t = $('#covid-table-world').DataTable({
            deferRender: true,
            responsive: true,
            //pageLength: 300,
            order: [[1, "desc"]]
        });

        db.forEach((value, key, map) => {
            // create a new row
            var data = db.get(key);
            var l = data.get('dateRep').length - 1;
            //console.log(key);
            //console.log(value);
            //var time = new Date(data.get('dataRep')[l]);
            t.row.add([
                key,
                data.get('cases')[l],
                data.get('deaths')[l],
                data.get('popData2018')[l]
            ]).draw(false);
        });
    };
    private pad(s) { return (s < 10) ? '0' + s : s; };

    calculateTotals() {
        var db = this.db.getDB();
        db.forEach((value, key, map) => {
            // create a new row
            var data = db.get(key);
            var l = data.get('dateRep').length - 1;
            //console.log(key);
            //console.log(value);
            var totalDeaths = 0;
            var totalCases = 0;
            for (let i = 0; i < l; i++) {
                totalCases = totalCases + Number(data.get('cases')[i]);
                totalDeaths = Number(data.get('deaths')[i]) + totalDeaths;
            }
            var date = new Date(key);
            date.setDate(date.getDate() + 1);
            data.get('cases')[l + 1] = '' + totalCases;
            data.get('deaths')[l + 1] = '' + totalDeaths;
            data.get('popData2018')[l + 1] = Number(data.get('popData2018')[l]).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            data.get('dateRep')[l + 1] = date.toString();
        });
    }

}