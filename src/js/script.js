var Chart=require('../../node_modules/chart.js/dist/Chart.js');

//load Json

loadJSON("data/dpc-covid19-ita-andamento-nazionale.json", function (response) {
    // Parse JSON string into object
    //console.log("DATA=..." + response);
    var data = JSON.parse(response);
    console.log(data.length);
    var ds = [];
    var lab = [];
    var decessi = [];
    var guariti = [];
    for (var i = 0; i < data.length; i++) {
        lab[i] = data[i].data;
        ds[i] = data[i].totale_casi;
        decessi[i] = data[i].deceduti;
        guariti[i] = data[i].dimessi_guariti;
    }

    // Create Main Chart
    var ctx = document.getElementById('MainChart');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: lab,
            datasets: [{
                label: 'Totale Casi',
                data: ds,
                fill: false,
                borderColor: [
                    'rgba(0, 0, 255, 1)'
                ],
                borderWidth: 3
            },
            {
                label: 'Decessi',
                data: decessi,
                fill: false,
                borderColor: [
                    'rgba(255, 0, 0, 1)'
                ],
                borderWidth: 3
            },
            {
                label: 'Guariti',
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
});




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