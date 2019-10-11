//Format numbers to add commas
var numFormatted = new Intl.NumberFormat('en-GB', {
    style: 'decimal'
});


const chartValueDivider = " - ";
const chartMinHeight = 450;
const chartDefaultLevel = 2;
const chartDefaultMeasureMethod = 'OUTSTANDING';
$("#AreaLevel").val(chartDefaultLevel);

//Canvas must be visible initially to be able to load chart
showHideCharts("show", "chart", "screen");
showHideCharts("show", "chart", "popup");

//Define charts
var pageChartCanvas = document.getElementById("OutcomesProgressChart").getContext('2d');
var popupChartCanvas = document.getElementById("OutcomesProgressChartPopup").getContext('2d');

var chartData1 = {
    datasets: [{
        label: "Outstanding Progressions",
        borderWidth: 1
    },
    {
        label: "Target 0%",
        backgroundColor: [
            'rgba(255,0,0,1)'
        ],
        borderColor: [
            'rgba(255,0,0,1)'
        ],
        type: 'line',
        borderWidth: 1
    }]
};

var chartData2 = {
    datasets: [{
        label: "Outstanding Progressions",
        borderWidth: 1
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
        borderWidth: 1
    }]
};

var options = {
    responsive: true,
    maintainAspectRatio: false, //Do not set to true if hiding element
    xAxisID: chartDefaultLevel,
    scales: {
        xAxes: [{
            ticks: {
                min: 0,
                max: 1,
                beginAtZero: true,
                interval: 1,
                callback: function (value) {
                    return (value / this.max * 100).toFixed(0) + '%'; // convert it to percentage
                }
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
        if (typeof e !== "undefined") {
            //Ensure user did not click outside bar
            //level = this.options.xAxisID + 1;
            level = parseInt($("#AreaLevel").val());
            level += 1;

            let itemID = e._index;
            let xValue = this.data.labels[itemID];
            let yValue = this.data.datasets[0].data[itemID];

            if (level > 4) {
                level = 4;
                chartElementClickedToTable(level, xValue, yValue);
            }
            else {
                chartElementClicked(level, xValue, yValue);
            }
        }
    }
};

var pageChart = new Chart(pageChartCanvas, {
    options: options,
    data: chartData1,
    type: 'horizontalBar'
});

var popupChart = new Chart(popupChartCanvas, {
    options: options,
    data: chartData2,
    type: 'horizontalBar'
});

$(".ToggleOutstandingChart").click(function (event) {
    let isChecked = $(this).is(":checked");
    let measureMethod = null;

    if (isChecked === true) {
        measureMethod = 'REMAINING';
    }
    else {
        measureMethod = 'OUTSTANDING';
    }

    $("#MeasureMethod").val(measureMethod);
    getChartData("screen");
});

//Load chart data
$("#AreaLevel").val(chartDefaultLevel);
getChartData("screen");

function getChartData(displayType) {
    return new Promise(resolve => {
        let academicYear = $("#AcademicYearID").val();
        let level = $("#AreaLevel").val();
        let drill = $("#AreaCode").val();
        let measureType = $("#MeasureType").val();
        let measureMethod = $("#MeasureMethod").val();

        //Defaults
        if (level < 1) {
            level = chartDefaultLevel;
        }

        if (measureMethod === "") {
            measureMethod = chartDefaultMeasureMethod;
        }

        if (displayType === "") {
            displayType = "popup";
        }

        let dataToLoad = `/Charts/?handler=Json&academicYear=${academicYear}&level=${level}`;

        if (measureMethod !== "") {
            dataToLoad += `&measure=${measureMethod}`;
        }

        if (drill !== "") {
            dataToLoad += `&drill=${drill}`;
        }

        let chartToRefresh = null;

        if (displayType === "screen") {
            chartToRefresh = pageChart;
        }
        else {
            chartToRefresh = popupChart;
        }

        showHideCharts("hide", "both", displayType);
        $.get(dataToLoad, function (data) {

        })
            .then(data => {
                console.log(dataToLoad + " Loaded");
                showHideCharts("show", measureType, displayType);

                try {
                    buildBreadcrumb(data);

                    switch (measureType) {
                        case "chart":
                            populateChart(chartToRefresh, data);
                            resizeChart(displayType, data);
                            break;

                        case "table":
                            doLoadTables(level, drill, displayType, measureMethod, data);
                            break;

                        default:
                            populateChart(chartToRefresh, data);
                            resizeChart(displayType, data);
                            doLoadTables(level, drill, displayType, measureMethod, data);
                    }

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

function populateChart(chart, data) {
    let title = data.chartData[0].chartTitle;
    let level = data.chartData[0].level;
    let labels = data.chartData.map(a => a.title);
    let values = data.chartData.map(a => a.value);

    let colours = palette('qualitative', data.chartData.length, 0);

    //Update chart
    chart.data.labels = labels;
    chart.data.datasets[0].label = title;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].backgroundColor = colours.map(function (hex) {
        return '#' + hex;
    });
    chart.options.xAxisID = level;
    chart.update();
}

function resizeChart(displayType, data) {
    return new Promise(resolve => {
        //Resize chart height depending on number of items
        if (displayType === "popup") {
            let numItems = data.chartData.length;
            let requiredHeight = numItems * 20;
            if (requiredHeight < chartMinHeight) {
                requiredHeight = chartMinHeight;
            }

            $("#OutcomesProgressChartPopup").height(requiredHeight);
        }

        resolve(1);
    });
}

function buildBreadcrumb(data) {
    let level = data.chartData[0].level;
    let level1Code = data.chartData[0].academicYear;
    let level2Code = data.chartData[0].facCode;
    let level3Code = data.chartData[0].teamCode;
    let level4Code = data.chartData[0].courseCode;

    let bCrumb = ``;

    if (level >= 2 && level1Code !== null) {
        bCrumb += `
            <a href="#" class="BreadCrumb" aria-level="1">${level1Code}</a>`;
    }

    if (level >= 3 && level2Code !== null) {
        bCrumb += `
             <i class="fas fa-chevron-right"></i> <a href="#" class="BreadCrumb" aria-level="2">${level2Code}</a>`;
    }

    if (level >= 4 && level3Code !== null) {
        bCrumb += `
             <i class="fas fa-chevron-right"></i> <a href="#" class="BreadCrumb" aria-level="3">${level3Code}</a>`;
    }

    if (level >= 5 && level4Code !== null) {
        bCrumb += `
             <i class="fas fa-chevron-right"></i> <a href="#" class="BreadCrumb" aria-level="4">${level4Code}</a>`;
    }

    $("#BreadcrumbBar").html(bCrumb);

    $(".BreadCrumb").click(function (event) {
        let level = $(this).attr("aria-level");
        $("#AreaLevel").val(level);
        getChartData("popup");
    });
}

function showHideCharts(showHide, measureType, displayType) {
    if (showHide === "") {
        showHide = "show";
    }

    switch (showHide) {
        case "show":
            if (displayType === "screen") {
                if (measureType === "chart") {
                    $("#ChartLoading").hide();
                    $("#OutcomesProgressChartContainer").removeClass("d-none");
                }
                else if (measureType === "table") {
                    $("#TableLoading").hide();
                    $("#OutcomesProgressTableContainer").removeClass("d-none");
                }
                else {
                    $("#ChartLoading").hide();
                    $("#TableLoading").hide();
                    $("#OutcomesProgressChartContainer").removeClass("d-none");
                    $("#OutcomesProgressTableContainer").removeClass("d-none");
                }
            }
            else {
                $("#PopupLoading").hide();
                if (measureType === "chart") {
                    $("#OutcomesProgressChartPopupContainer").removeClass("d-none");
                }
                else if (measureType === "table") {
                    $("#OutcomesProgressTablePopupContainer").removeClass("d-none");
                }
                else {
                    $("#OutcomesProgressChartPopupContainer").removeClass("d-none");
                    $("#OutcomesProgressTablePopupContainer").removeClass("d-none");
                }
            }
            break;

        case "hide":
            if (displayType === "screen") {
                if (measureType === "chart") {
                    $("#ChartLoading").show();
                    $("#OutcomesProgressChartContainer").addClass("d-none");
                }
                else if (measureType === "table") {
                    $("#TableLoading").show();
                    $("#OutcomesProgressTableContainer").addClass("d-none");
                }
                else {
                    $("#ChartLoading").show();
                    $("#TableLoading").show();
                    $("#OutcomesProgressChartContainer").addClass("d-none");
                    $("#OutcomesProgressTableContainer").addClass("d-none");
                }
            }
            else {
                $("#PopupLoading").show();
                if (measureType === "chart") {
                    $("#OutcomesProgressChartPopupContainer").addClass("d-none");
                }
                else if (measureType === "table") {
                    $("#OutcomesProgressTablePopupContainer").addClass("d-none");
                }
                else {
                    $("#OutcomesProgressChartPopupContainer").addClass("d-none");
                    $("#OutcomesProgressTablePopupContainer").addClass("d-none");
                }
            }
            break;
    }
}

function doLoadTables(level, drill, displayType, measureMethod, data) {
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

        let measureColTitle = null;

        if (measureMethod === "OUTSTANDING" || measureMethod === "") {
            measureColTitle = "Remaining";
        }
        else {
            measureColTitle = "Completed";
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
                        <th scope="col" class="text-right">${measureColTitle}</th>
                        <th scope="col" class="text-right">Out Of</th>
                        <th scope="col" class="text-right">Percent</th>

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
                        <td class="text-right">${numFormatted.format(area.number)}</td>
                        <td class="text-right">${numFormatted.format(area.total)}</td>
                        <td class="text-right">${ +(area.value * 100).toFixed(1) }&percnt;</td>
                        ${buttonRows}
                    </tr>`;
        }

        tableData += `
                </tbody>
            </table>`;

        if (displayType === "screen") {
            $("#OutcomesProgressTableContainer").html(tableData);
        }
        else {
            $("#OutcomesProgressTablePopupContainer").html(tableData);
        }

        if (displayType === "screen") {
            let numOutstandingRecordsText = null;

            if (measureMethod === "OUTSTANDING" || measureMethod === "") {
                numOutstandingRecordsText = "records to go";
            }
            else {
                numOutstandingRecordsText = "records so far";
            }

            $("#NumOutstandingRecordsText").html(numOutstandingRecordsText);

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
                            $this.text(numFormatted.format(Math.floor(this.countNum)));
                        },
                        complete: function () {
                            $this.text(numFormatted.format(this.countNum));
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

        showHideCharts("hide", "table", "popup");

        getChartData("popup");
    });
}

function chartElementClicked(level, xValue, yValue) {
    let chartIsPopup = $("#ChartIsPopup").val();

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
        getChartData("popup");
    }
    else {
        $('#ChartModal').modal();
    }
}

function chartElementClickedToTable(level, xValue, yValue) {
    let dividerLength = chartValueDivider.length;
    let firstDivider = xValue.indexOf(chartValueDivider);
    let secondDivider = xValue.substring(firstDivider + dividerLength, xValue.length - firstDivider - dividerLength).indexOf(chartValueDivider);

    if (secondDivider === -1) {
        //If only has one divider then is top-level entity so make this start of value
        secondDivider = xValue.length;
        dividerLength = 0;
    }

    let areaCode = xValue.substring(firstDivider + dividerLength, firstDivider + dividerLength + secondDivider);

    $("#AreaCode").val(areaCode);
    $("#AreaLevel").val(level);
    $("#MeasureType").val("table");

    getChartData("popup");
}