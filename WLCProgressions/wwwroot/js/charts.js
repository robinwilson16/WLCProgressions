loadCharts();
function loadCharts() {
    return new Promise(resolve => {
        let dataToLoad = `/Charts/?handler=Json&level=2`;

        $.get(dataToLoad, function (data) {

        })
            .then(data => {
                try {
                    $("#ChartLoading").hide();
                    $("#OutcomesProgressChartContainer").removeClass("d-none");
                    doLoadCharts(data);
                    console.log(dataToLoad + " Loaded");
                    resolve(1);
                }
                catch (e) {
                    doErrorModal("Error Loading Outcomes Progress Chart", "Sorry an error occurred loading the Outcomes Progression Chart. Please refresh the page to try again.");
                    resolve(0);
                }
            })
            .fail(function () {
                let title = `Error Loading Courses`;
                let content = `Sorry an error occurred loading the list of courses. Please try again.`;

                doErrorModal(title, content);
            });
    });
}

function doLoadCharts(data) {
    let title = data.chartData[0].chartTitle;
    let labels = data.chartData.map(a => a.title);
    let values = data.chartData.map(a => a.value);

    var chartName = "OutcomesProgressChart";
    var ctx = document.getElementById(chartName).getContext('2d');
    var chartData = {
        labels: labels,
        datasets: [{
            label: title,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1,
            data: values
        },
        {
            label: "Target 0%",
            backgroundColor: [
                'transparent'
            ],
            borderColor: [
                'rgba(255,0,0,1)'
            ],
            type: 'line',
            borderWidth: 1,
            data: [0, 0, 0, 0, 0, 0]
        }]
    };

    var options = {
        maintainAspectRatio: true, //Do not set to true if hiding element
        scales: {
            xAxes: [{
                ticks: {
                    min: 0,
                    max: 1,
                    beginAtZero: true,
                    interval: 1,
                    callback: function (value) {
                        return (value / this.max * 100).toFixed(0) + '%'; // convert it to percentage
                    },
                },
                gridLines: {
                    display: true,
                    color: "rgba(255,99,164,0.2)"
                }
            }],
            yAxes: [{
                ticks: {
                    min: 0,
                    beginAtZero: true,
                    autoSkip: false
                },
                gridLines: {
                    display: false
                }
            }]
        },
        tooltips: {
            mode: 'label',
            label: 'mylabel',
            callbacks: {
                label: function (tooltipItem, data) {
                    return (tooltipItem.xLabel * 100).toFixed(1) + '%'; // convert it to percentage
                }
            }
        }
    };

    var myChart = new Chart(ctx, {
        options: options,
        data: chartData,
        type: 'horizontalBar'
    });
}