//Load initial course list from database and store in local storage
var system = $("#SystemID").val();
var academicYear = $("#AcademicYearID").val();
var hasEnrols = 1;
loadAllCourses(system, academicYear, hasEnrols);

$(function () {
    $('[data-toggle="popover"]').popover();
})

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
    let hasEnrols = 0;
    //Load courses for next year
    loadAllCourses(system, academicYear, hasEnrols);
});

$("#ProgressionModal").on("hidden.bs.modal", function () {
    cancelProgression();

    let system = $("#SystemID").val();
    let academicYear = $("#AcademicYearID").val();
    let hasEnrols = 1;
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

$(".OfferTypeSelectList").change(function (event) {
    let offerType = $(this).val();

    if (offerType === "2") {
        //If offer is conditional then display list of conditions
        $(".OfferConditionLabelCol").removeClass("d-none");
        $(".OfferConditionSelectListCol").removeClass("d-none");
        $(".SaveProgressionButton").addClass("disabled");
    }
    else {
        $(".OfferConditionLabelCol").addClass("d-none");
        $(".OfferConditionSelectListCol").addClass("d-none");
        $("#OfferConditionSelectList").val(null);
        $(".SaveProgressionButton").removeClass("disabled");
    }
});

$(".OfferConditionSelectList").change(function (event) {
    let offerCondition = $(this).val();

    if (offerCondition === "") {
        //If offer is conditional then display list of conditions
        $(".SaveProgressionButton").addClass("disabled");
    }
    else {
        $(".SaveProgressionButton").removeClass("disabled");
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

    isButtonDisabled = $(this).hasClass("disabled");

    if (isButtonDisabled === false) {
        saveProgressions(system, progressionYear, students, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID);
    }
    else {
        //If user has missed something
        let errors = "";
        let offerType = $("#OfferTypeSelectList").val();
        let offerCondition = $("#OfferConditionSelectList").val();

        if (courseToID === "") {
            errors += `
                <li>
                    Course to progress the learners to has not been chosen. Please search for, and pick a course from above
                </li>`;
        }

        if (offerType == null) {
            errors += `
                <li>
                    The type of offer being made has not been selected. Please specify the type of offer (conditional/unconditional/etc.)
                </li>`;
        }

        if (offerType === "2" && offerCondition == null) {
            errors += `
                <li>
                    The offer type you selected is conditional but no condition has been selected.
                    If no condition is required select unconditional, otherwise please specify the condition
                </li>`;
        }

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