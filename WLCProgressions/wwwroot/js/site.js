//Load initial course list from database and store in local storage
var system = $("#SystemID").val();
var academicYear = $("#AcademicYearID").val();
loadAllCourses(system, academicYear);

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

    $("#StudentArea").html(defaultStudentsMsg);

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
        filterCourses(searchField, searchType, fac, team);
    }
    else {
        noResultsCourses(searchType);
    }
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
            $('#ProgressionModal').modal();
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
    //Load courses for next year
    loadAllCourses(system, academicYear);
});

$("#ProgressionModal").on("hidden.bs.modal", function () {
    cancelProgression();

    let system = $("#SystemID").val();
    let academicYear = $("#AcademicYearID").val();
    //Load courses for current year
    loadAllCourses(system, academicYear);
});

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

$(".OfferTypeSelectList").change(function (event) {
    let offerType = $(this).val();

    if (offerType === "2") {
        //If offer is conditional then display list of conditions
        $(".OfferConditionLabelCol").removeClass("d-none");
        $(".OfferConditionSelectListCol").removeClass("d-none");
    }
    else {
        $(".OfferConditionLabelCol").addClass("d-none");
        $(".OfferConditionSelectListCol").addClass("d-none");
        $("#OfferConditionSelectList").val(null);
    }
});

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

    saveProgressions(system, progressionYear, students, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID);
});