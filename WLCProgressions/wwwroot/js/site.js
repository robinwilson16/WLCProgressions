//Load initial course list from database and store in local storage
var system = $("#SystemID").val();
var academicYear = $("#AcademicYearID").val();
var hasEnrols = true;
loadAllCourses(system, academicYear, hasEnrols);

$(function () {
    $('[data-toggle="popover"]').popover();
});

$("#AboutSystemLink").click(function (event) {
    let dataToLoad = `https://raw.githubusercontent.com/robinwilson16/WLCProgressions/master/README.md`;
    let title = `About WLC Progressions System`;

    $.get(dataToLoad, function (data) {

    })
        .then(data => {
            var markdown = marked(data);
            let content = `
                <p>WLC Progressions System &copy; Ealing and Hammersmith West London College</p>
                <div class="scrollable">${markdown}</div>`;

            doModal(title, content, "lg", "AboutInfo");
        })
        .fail(function () {
            let content = `Error loading content`;

            doErrorModal(title, content);
    });
    doModal(title, content);
});

$("#ChangelogLink").click(function (event) {
    let dataToLoad = `https://raw.githubusercontent.com/robinwilson16/WLCProgressions/master/CHANGELOG.md`;
    let title = `Changelog for WLC Progressions System`;

    $.get(dataToLoad, function (data) {

    })
        .then(data => {
            var markdown = marked(data);

            doModal(title, markdown, "lg", "ChangelogInfo");
    })
        .fail(function () {
            let content = `Error loading content`;

            doErrorModal(title, content);
    });
});

$("#AcademicYearID").change(function (event) {
    $("#ChangeAcademicYearID").submit();
});

//Controls what happens when searching for a course
$(".CourseSearchBox").keydown(function (event) {
    //Clear screen
    let defaultStudentsMsg = `
        <div class="alert alert-secondary text-center" role="alert">
            Please search for course above...
        </div>
        `;

    $("#StudentFromArea").html(defaultStudentsMsg);

    $(".CheckAllStudents").prop("disabled", true);
    $(".ProgressLearnerButton").addClass("disabled");

    

    if (event.keyCode === 13) {
        event.preventDefault();
        $(this).blur();
        return false;
    }
});

$(".CourseSearchBox").keyup(function (event) {
    event.preventDefault();
    
    var searchField = $(this);
    let searchTypeFld = $(this).attr("aria-label");
    let progressWithinFac = $("#ProgressWithinFac").val();
    let progressWithinTeam = $("#ProgressWithinTeam").val();
    let fac = null;
    let team = null;
    let outstandingOnly = false;

    let searchType = "";

    if (searchTypeFld === "SearchFromBox") {
        searchType = "From";
    }
    else {
        searchType = "To";
        //If progress within fac/team button selected then ensure list is filtered appropriately
        if (progressWithinFac === "Y") {
            fac = $("#CurrentFacCode").val();
        }

        if (progressWithinTeam === "Y") {
            team = $("#CurrentTeamCode").val();
        }
    }

    // Only perform search if enough characters have been entered
    if (searchField.val().length >= minSearchChars) {
        //loadCourseGroup(search);
        filterCourses(searchField, searchType, outstandingOnly, fac, team);
    }
    else {
        noResultsCourses(searchType);
    }
});

$(".OutstandingCoursesButton").click(function (event) {
    event.preventDefault();

    var searchField = null;
    let fac = null;
    let team = null;
    let searchType = "From";
    let outstandingOnly = true;

    $(".CourseSearchBox").val("");
    filterCourses(searchField, searchType, outstandingOnly, fac, team);
});


$(".CheckAllStudents").click(function (event) {
    let selectAllStudents = $(this).prop("checked");

    if (selectAllStudents === true) {
        //Tick all students
        $(".ProgressStudent").prop("checked", true);
        clearDestinationSelections();
    }
    else {
        //Untick all students
        $(".ProgressStudent").prop("checked", false);
        $(".DestinationOptions").removeClass("d-none");
    }

    //Update JSON data to tick/untick all
    let students = JSON.parse(localStorage.getItem("students"));

    try {
        for (let student in students) {
            students[student].progressLearner = selectAllStudents;
        }

        //Save students to storage
        localStorage.setItem("students", JSON.stringify(students));
    }
    catch {
        doErrorModal("Error Setting Progression", "Sorry an error occurred setting the progression of this student to" + progressStudent + ".<br />Please attempt the operation again.");
    }
});

//Open destination progression screen
$(".ProgressLearnerButton").click(function (event) {
    event.preventDefault();

    let currentFacCode = $("#CurrentFacCode").val();
    let currentTeamCode = $("#CurrentTeamCode").val();
    let isDestinationsButtonDisabled = $("#SaveDestinationButton").hasClass("disabled");
    let unsavedDestinationsExist = false;

    if (isDestinationsButtonDisabled === false) {
        unsavedDestinationsExist = true;
    }

    if ($(this).hasClass("ProgressWithinFac")) {
        $('#ProgressWithinFac').val("Y");
    }
    else {
        $('#ProgressWithinFac').val("N");
    }

    if ($(this).hasClass("ProgressWithinTeam")) {
        $('#ProgressWithinTeam').val("Y");
        $("#FormTitleID").val("Progression to Another Course in " + currentFacCode + " - " + currentTeamCode);
    }
    else {
        $('#ProgressWithinTeam').val("N");
        $("#FormTitleID").val("Progression to a Course in Another Area");
    }

    isButtonDisabled = $(this).hasClass("disabled");

    if (isButtonDisabled === false) {
        let numProgressingStudents = 0;
        let allStudents = JSON.parse(localStorage.getItem("students"));

        for (let student in allStudents) {
            if (allStudents[student].progressLearner === true) {
                numProgressingStudents += 1;
            }
        }

        //Record number progressing
        $('#NumStudentsProgressingID').val(numProgressingStudents);

        //Ensure at least 1 learner was selected
        if (numProgressingStudents > 0) {
            let saveChanges = $("#QuestionModalAnswerID").val();

            //First confirm if user wants to save changes to destinations if not already selected option
            if (unsavedDestinationsExist === true && saveChanges === "") {
                doQuestionModal("Unsaved Changes Exist", "Would you like to save your changes to learner destinations (selecting no will discard these)?");
            }
            else if (saveChanges === "Y") {
                $(".SaveDestinationButton").trigger("click");
                $('#ProgressionModal').modal();
            }
            else if (saveChanges === "N") {
                $('#ProgressionModal').modal();
            }
            else if (saveChanges === "C") {
                //Do nothing
            }
            else {
                //If no destinations set then is not asked question so should default to proceed
                $('#ProgressionModal').modal();
            }

            //Reset modal answer
            $("#QuestionModalAnswerID").val("");
        }
        else {
            doModal("No Students Selected", "Please select one or more students to progress.");
        }
    }
});

$("#ProgressionModal").on("shown.bs.modal", function () {
    var courseID = $("#ProgressFromCourseID").val();
    var groupID = $("#ProgressFromGroupID").val();
    var formTitle = $("#FormTitleID").val();
    var numStudentsProgressingID = $("#NumStudentsProgressingID").val();

    if (formTitle === "") {
        formTitle = "Progression to a New Course";
    }

    $("#ProgressionModalLabel").find(".title").html(formTitle);
    $("#NumLearnersSelected").html(numStudentsProgressingID);

    let system = $("#SystemID").val();
    let academicYear = $("#ProgressionYearID").val();
    let hasEnrols = false;
    //Load courses for next year
    loadAllCourses(system, academicYear, hasEnrols);
});

$("#ProgressionModal").on("hidden.bs.modal", function () {
    cancelProgression();

    let system = $("#SystemID").val();
    let academicYear = $("#AcademicYearID").val();
    let hasEnrols = true;
    //Load courses for current year
    loadAllCourses(system, academicYear, hasEnrols);
});

function doQuestionModalAction() {
    //If asked a question about saving destinations then need to return to progressions screen again
    let progressWithinFac = $('#ProgressWithinFac').val();

    if (progressWithinFac === "Y") {
        $("#ProgressWithinTeam").trigger("click");
    }
    else {
        $("#ProgressAnotherTeam").trigger("click");
    }
}

function cancelProgression() {
    $("#CourseSearchToBox").val("");
    noResultsCourses("To");
    $(".SelectedCourseDetails").addClass("d-none");
    $(".OfferConditionLabelCol").addClass("d-none");
    $(".OfferConditionSelectListCol").addClass("d-none");
    $("#OfferTypeSelectList").val(null);
    $("#OfferConditionSelectList").val(null);

    $("#ProgressToCourseID").val("");
    $("#ProgressToGroupID").val("");
    $("#FormTitleID").val("");
}

$(".CancelProgressionButton").click(function (event) {
    $("#CourseSearchToBox").val("");
});

$(".SaveProgressionButton").click(function (event) {
    let progressWithinTeam = $("#ProgressWithinTeam").val();

    let system = $("#SystemID").val();
    let academicYear = $("#AcademicYearID").val();
    let progressionYear = $("#ProgressionYearID").val();
    let students = JSON.parse(localStorage.getItem("students"));
    let courseFromID = $("#ProgressFromCourseID").val();
    let groupFromID = $("#ProgressFromGroupID").val();
    let courseToID = $("#ProgressToCourseID").val();
    let groupToID = $("#ProgressToGroupID").val();
    let progressionType = null;
    let offerTypeID = $("#OfferTypeSelectList").val();
    let offerConditionID = $("#OfferConditionSelectList").val();

    if (progressWithinTeam === "Y") {
        progressionType = "INTERNAL";
    }
    else {
        progressionType = "EXTERNAL";
    }

    isButtonDisabled = $(this).hasClass("disabled");

    if (isButtonDisabled === false) {
        saveProgressions(system, progressionYear, students, courseFromID, groupFromID, courseToID, groupToID, progressionType);
    }
    else {
        //If user has missed something
        let errors = "";

        if (courseToID === "") {
            errors += `
                <li>
                    Course to progress the learners to has not been chosen. Please search for, and pick a course from above
                </li>`;
        }

        let recordsOk = 0;
        let recordsErr = 0;
        $(".OfferTypeSelectList").each(function (event) {
            let thisStudentRef = $(this).attr("data-id");
            let thisOfferType = $(this);
            let thisOfferCondition = $("#OfferConditionSelectList-" + thisStudentRef);
            let thisOfferTypeVal = $(this).val();
            let thisOfferConditionVal = $("#OfferConditionSelectList-" + thisStudentRef).val();

            if (thisOfferTypeVal === "1") {
                recordsOk += 1;
                thisOfferType.removeClass("InputError");
                thisOfferCondition.removeClass("InputError");
            }
            else if (thisOfferTypeVal === "2" && thisOfferConditionVal !== null) {
                recordsOk += 1;
                thisOfferType.removeClass("InputError");
                thisOfferCondition.removeClass("InputError");
            }
            else if (thisOfferTypeVal === null) {
                recordsErr += 1;
                thisOfferType.addClass("InputError");
                thisOfferCondition.addClass("InputError");

                errors += `
                    <li>
                        Offer type for learner "${thisStudentRef}" not selected.
                    </li>`;
            }
            else {
                errors += `
                    <li>
                        Offer type for learner "${thisStudentRef}" is conditional but no condition selected.
                    </li>`;

                recordsErr += 1;
                thisOfferType.addClass("InputError");
                thisOfferCondition.addClass("InputError");
            }
        });

        errors = `
            <p>            
                Please correct the errors below and attempt to save again:
            </p>
            <ul>
                ${errors}
            </ul>`;

        doModal("Please Review Your Selection", errors);
    }
});

$(".SaveDestinationButton").click(function (event) {
    let system = $("#SystemID").val();
    let academicYear = $("#AcademicYearID").val();
    let progressionYear = $("#ProgressionYearID").val();
    let students = JSON.parse(localStorage.getItem("students"));
    let courseFromID = $("#ProgressFromCourseID").val();

    isButtonDisabled = $(this).hasClass("disabled");

    if (isButtonDisabled === false) {
        saveDestinations(system, progressionYear, students);
    }
    else {
        //If user has missed something
        let errors = "";

        if (courseFromID === "") {
            errors = `
                Course to progress the learners to has not been chosen. Please search for, and pick a course from above`;
        }
        else {
            errors = `There are no destinations to save. Please amend one or more destinations first.`;
        }

        doModal("Please Review Your Selection", errors);
    }
});

$("#ChartModal").on("shown.bs.modal", function () {
    let areaCode = $("#AreaCode").val();
    let areaLevel = $("#AreaLevel").val();
    let measureType = $("#MeasureType").val();

    loadCharts(areaLevel, "popup", measureType);
});

$("#ChartModal").on("hidden.bs.modal", function (e) {   
    $("#OutcomesProgressChartPopupContainer").addClass("d-none");
    $("#OutcomesProgressTablePopupContainer").addClass("d-none");
    $("#PopupLoading").show();
});