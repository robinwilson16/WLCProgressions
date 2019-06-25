var chartValueDivider = " - ";
var chartMinHeight = 450;

loadCharts(2, null, "screen", "both");
function loadCharts(level, drill, displayType, measureType) {
    return new Promise(resolve => {
        let dataToLoad = `/Charts/?handler=Json&level=${level}`;

        if (drill !== null) {
            dataToLoad += `&drill=${drill}`;
        }

        $.get(dataToLoad, function (data) {

        })
            .then(data => {
                try {
                    switch (measureType) {
                        case "chart":
                            doLoadCharts(level, drill, displayType, data);
                            break;

                        case "table":
                            doLoadTables(level, drill, displayType, data);
                            break;

                        default:
                            doLoadCharts(level, drill, displayType, data);
                            doLoadTables(level, drill, displayType, data);
                    }

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
            })
            .then(data => {
                chartLoaded();
            });
    });
}

function doLoadCharts(level, drill, displayType, data) {
    return new Promise(resolve => {
        let title = data.chartData[0].chartTitle;
        let labels = data.chartData.map(a => a.title);
        let values = data.chartData.map(a => a.value);

        var chartName = null;

        if (displayType === "screen") {
            chartName = "OutcomesProgressChart";
            $("#ChartLoading").hide();
            $("#OutcomesProgressChartContainer").removeClass("d-none");
        }
        else {
            chartName = "OutcomesProgressChartPopup";
            $("#PopupLoading").hide();
            $("#OutcomesProgressChartPopupContainer").removeClass("d-none");
        }

        //Resize chart height depending on number of items
        if (displayType === "popup") {
            let numItems = data.chartData.length;
            let requiredHeight = numItems * 20;
            if (requiredHeight < chartMinHeight) {
                requiredHeight = chartMinHeight;
            }

            $("#OutcomesProgressChartPopup").height(requiredHeight);
        }

        //let dataset = "";
        //for (let bar of data.chartData) {
        //    dataset +=
        //        `{
        //            label: "${bar.title}",
        //            borderWidth: 1,
        //            data: ${bar.value}
        //        },`;
        //}

        //let datasets = [dataset];
        let colours = palette('qualitative', data.chartData.length, 0);

        var ctx = document.getElementById(chartName).getContext('2d');
        var chartData = {
            labels: labels,
            datasets: [{
                label: title,
                backgroundColor: colours.map(function (hex) {
                    return '#' + hex;
                }),
                //backgroundColor: [
                //    'rgba(255, 99, 132, 0.2)',
                //    'rgba(54, 162, 235, 0.2)',
                //    'rgba(255, 206, 86, 0.2)',
                //    'rgba(75, 192, 192, 0.2)',
                //    'rgba(153, 102, 255, 0.2)',
                //    'rgba(255, 159, 64, 0.2)',
                //    'rgba(255, 99, 132, 0.2)',
                //    'rgba(54, 162, 235, 0.2)'
                //],
                //borderColor: [
                //    'rgba(255,99,132,1)',
                //    'rgba(54, 162, 235, 1)',
                //    'rgba(255, 206, 86, 1)',
                //    'rgba(75, 192, 192, 1)',
                //    'rgba(153, 102, 255, 1)',
                //    'rgba(255, 159, 64, 1)',
                //    'rgba(255,99,132,1)',
                //    'rgba(54, 162, 235, 1)'
                //],
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
            responsive: true,
            maintainAspectRatio: false, //Do not set to true if hiding element
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
            },
            plugins: { //See https://nagix.github.io/chartjs-plugin-colorschemes/
                colorschemes: {
                    scheme: 'tableau.Summer8'
                }
            },
            events: ['click'],
            onClick: function (c, i) {
                let e = i[0];
                let itemID = e._index; 
                let xValue = this.data.labels[itemID];
                let yValue = this.data.datasets[0].data[itemID];

                //console.log(itemID);
                //console.log(xValue);
                //console.log(yValue);
                if (level >= 4) {
                    chartElementClickedToTable(level, xValue, yValue);
                }
                else {
                    chartElementClicked(level, xValue, yValue);
                }
            }
        };

        var myChart = new Chart(ctx, {
            options: options,
            data: chartData,
            type: 'horizontalBar'
        });

        resolve(1);
    });
}

function doLoadTables(level, drill, displayType, data) {
    return new Promise(resolve => {
        let drillLevel = data.chartData[0].level;
        let numOutstandingRecords = 0;
        let numCols = 6;
        let openModal = ``;
        let popupTable = ``;

        if (displayType !== "popup") {
            openModal = `
                 data-toggle="modal" data-target="#ChartModal"`;
        }
        else {
            popupTable = ` PopupTable`;
        }

        let drillColumns = `
            <th scope="col" class="text-left">Academic Year</th>`;

        let buttonColumns = ``;

        if (drillLevel === 2) {
            numCols += 2;
            drillColumns += `
                <th scope="col" class="text-left">Faculty Code</th>
                <th scope="col" class="text-left">Faculty Name</th>`;
        }
        else if (drillLevel === 3) {
            numCols += 4;
            drillColumns += `
                <th scope="col" class="text-left">Faculty Code</th>
                <th scope="col" class="text-left">Faculty Name</th>
                <th scope="col" class="text-left">Team Code</th>
                <th scope="col" class="text-left">Team Name</th>`;
        }
        else if (drillLevel === 4) {
            numCols += 6;
            drillColumns += `
                <th scope="col" class="text-left">Fac Code</th>
                <th scope="col" class="text-left">Team Code</th>              
                <th scope="col" class="text-left">Course Code</th>
                <th scope="col" class="text-left">Course Name</th>
                <th scope="col" class="text-left">Grp</th>`;

            buttonColumns += `
                <th scope="col">&nbsp;</th>`;
        }

        let tableData =
            `<table class="table table-hover table-sm">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col" colspan="${numCols}">${data.chartData[0].chartTitle}</th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        ${drillColumns}
                        <th scope="col" class="text-right">Remaining</th>
                        <th scope="col" class="text-right">Out Of</th>
                        <th scope="col" class="text-right">Value</th>

                    </tr>`;

        for (let area of data.chartData) {
            numOutstandingRecords += area.number;

            let drillRows = `
                <td class="text-left DrillTable${popupTable}"${openModal} aria-label="" aria-describedby="2"><a href="#">${area.academicYear}</a></td>`;

            let buttonRows = ``;

            if (drillLevel === 2) {
                drillRows += `
                <td class="text-left DrillTable${popupTable}"${openModal} aria-label="${area.facCode}" aria-describedby="3"><a href="#">${area.facCode}</a></td>
                <td class="text-left DrillTable${popupTable}"${openModal} aria-label="${area.facCode}" aria-describedby="3"><a href="#">${area.facName}</a></td>`;
            }
            else if (drillLevel === 3) {
                drillRows += `
                <td class="text-left DrillTable${popupTable}"${openModal} aria-label="${area.facCode}" aria-describedby="3"><a href="#">${area.facCode}</a></td>
                <td class="text-left DrillTable${popupTable}"${openModal} aria-label="${area.facCode}" aria-describedby="3"><a href="#">${area.facName}</a></td>
                <td class="text-left DrillTable${popupTable}"${openModal} aria-label="${area.teamCode}" aria-describedby="4"><a href="#">${area.teamCode}</a></td>
                <td class="text-left DrillTable${popupTable}"${openModal} aria-label="${area.teamCode}" aria-describedby="4"><a href="#">${area.teamName}</a></td>`;
            }
            else if (drillLevel === 4) {
                drillRows += `
                <td class="text-left DrillTable${popupTable}"${openModal} aria-label="${area.facCode}" aria-describedby="3"><a href="#">${area.facCode}</a></td>
                <td class="text-left DrillTable${popupTable}"${openModal} aria-label="${area.teamCode}" aria-describedby="4"><a href="#">${area.teamCode}</a></td>
                <td class="text-left">${area.courseCode}</td>
                <td class="text-left">${area.courseTitle}</td>
                <td class="text-left">${area.groupCode}</td>`;

                buttonRows += `
                <td>
                    <button type="button" class="btn btn-primary btn-sm ProgressLearnersButton CloseChart" data-id="${area.courseID}" aria-label="Progression from '${area.courseTitle}' to Another Course" data-target="${area.groupID}" aria-describedby="${area.facCode}" data-parent="${area.teamCode}" aria-labelledby="${area.academicYear}">
                        <i class="fas fa-users"></i> View Learners...
                    </button>
                </td>`;
            }

            tableData += `
                    <tr>
                        ${drillRows}
                        <td class="text-right">${area.number}</td>
                        <td class="text-right">${area.total}</td>
                        <td class="text-right">${ +(area.value * 100).toFixed(1) }&percnt;</td>
                        ${buttonRows}
                    </tr>`;
        }

        tableData += `
                </tbody>
            </table>`;

        if (displayType === "screen") {
            $("#TableLoading").hide();
            $("#OutcomesProgressTableContainer").removeClass("d-none");
            $("#OutcomesProgressTableContainer").html(tableData);
        }
        else {
            $("#PopupLoading").hide();
            $("#OutcomesProgressTablePopupContainer").removeClass("d-none");
            $("#OutcomesProgressTablePopupContainer").html(tableData);
        }

        if (displayType === "screen") {
            $('.CountUp').each(function () {
                var $this = $(this),
                    countTo = numOutstandingRecords;
                $({ countNum: $this.text() }).animate({
                    countNum: countTo
                },
                    {
                        duration: 2000,
                        easing: 'linear',
                        step: function () {
                            $this.text(Math.floor(this.countNum));
                        },
                        complete: function () {
                            $this.text(this.countNum);
                            //alert('finished');
                        }
                    });
            });
        }

        //$("#NumOutstandingRecords").html(numOutstandingRecords.toLocaleString());
        
        resolve(1);
    });
}

function chartLoaded() {
    listLoadedCourseFromFunctions();

    $(".CloseChart").click(function (event) {
        $('#ChartModal').modal("hide");
    });

    $(".DrillTable").click(function (event) {
        var areaCode = $(this).attr("aria-label");
        var areaLevel = $(this).attr("aria-describedby");
        $("#AreaCode").val(areaCode);
        $("#AreaLevel").val(areaLevel);
        $("#MeasureType").val("table");
    });

    $(".PopupTable").click(function (event) {
        var areaCode = $(this).attr("aria-label");
        var areaLevel = $(this).attr("aria-describedby");

        $("#OutcomesProgressTablePopupContainer").addClass("d-none");
        $("#PopupLoading").show();

        loadCharts(areaLevel, areaCode, "popup", "table");
    });
}

function chartElementClicked(level, xValue, yValue) {
    let chartIsPopup = $("#ChartIsPopup").val();
    level = parseInt(level) + 1;

    let dividerLength = chartValueDivider.length;
    let finalDivider = xValue.lastIndexOf(chartValueDivider);
    let previousDivider = xValue.substring(0, finalDivider).lastIndexOf(chartValueDivider);

    if (previousDivider === -1) {
        //If only has one divider then is top-level entity so make this start of value
        previousDivider = 0;
        dividerLength = 0;
    }

    let areaCode = xValue.substring(previousDivider + dividerLength, finalDivider);
    
    $("#AreaCode").val(areaCode);
    $("#AreaLevel").val(level);
    $("#MeasureType").val("chart");

    if (chartIsPopup === "Y") {
        $("#OutcomesProgressChartPopupContainer").addClass("d-none");
        $("#PopupLoading").show();
        loadCharts(level, areaCode, "popup", "chart");
    }
    else {
        $('#ChartModal').modal();
    }
}

function chartElementClickedToTable(level, xValue, yValue) {
    level = 4;

    let dividerLength = chartValueDivider.length;
    let firstDivider = xValue.indexOf(chartValueDivider);
    let secondDivider = xValue.substring(firstDivider + dividerLength, xValue.length - firstDivider - dividerLength).indexOf(chartValueDivider);

    if (secondDivider === -1) {
        //If only has one divider then is top-level entity so make this start of value
        secondDivider = xValue.length();
        dividerLength = 0;
    }

    let areaCode = xValue.substring(firstDivider + dividerLength, firstDivider + dividerLength + secondDivider);

    $("#AreaCode").val(areaCode);
    $("#AreaLevel").val(level);
    $("#MeasureType").val("chart");

    $("#OutcomesProgressChartPopupContainer").addClass("d-none");
    $("#PopupLoading").show();
    loadCharts(level, areaCode, "popup", "table");
}