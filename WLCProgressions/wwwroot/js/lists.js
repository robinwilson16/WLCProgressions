//Set options
var minSearchChars = 3;
var numItemsPerPage = 10;
var numPagesEitherSide = 3;
var numPages = 1;
var curPage = 1;
var numItems = 10;

function loadAllCourses(system, academicYear) {
    return new Promise(function (fulfill, reject) {
        let dataToLoad = `/CourseGroups/?handler=Json&academicYear=${academicYear}`;

        if (system !== "") {
            dataToLoad += `&system=${system}`;
        }

        var loadedCourses = $.get(dataToLoad, function (data) {
            numItems = data.courses.length;
            numPages = Math.ceil(numItems / numItemsPerPage);

            try {
                localStorage.setItem("courses", JSON.stringify(data));
                console.log(dataToLoad + " Loaded");
                fulfill(dataToLoad + " Loaded");
            }
            catch (e) {
                doErrorModal("Error Storing Data in Browser", "Sorry an error occurred storing data in your web browser. Please check the local storage settings and your available disk space.");
                reject(dataToLoad + " Not Loaded");
            }
        });
    });
}

function filterCourses(searchField, searchType, fac, team) {
    return new Promise(function (fulfill, reject) {
        let allCourses = JSON.parse(localStorage.getItem("courses"));
        let filteredCourses = allCourses.courses;

        let searchFieldVal = searchField.val().toLowerCase();

        //Filter the list
        //filteredCourses = filteredCourses.filter(courses => courses.courseCode === "STOXX11001-SPA");
        filteredCourses = filteredCourses.filter(
            courses =>
                courses.courseTitle.toLowerCase().indexOf(searchFieldVal) !== -1
                || courses.courseCode.toLowerCase().indexOf(searchFieldVal) !== -1
        );

        if (fac != null) {
            filteredCourses = filteredCourses.filter(courses => courses.facCode === fac);
        }

        if (team != null) {
            filteredCourses = filteredCourses.filter(courses => courses.teamCode === team);
        }

        //console.log(filteredCourses);
        

        try {
            localStorage.setItem("filteredCourses", JSON.stringify(filteredCourses));
        }
        catch (e) {
            doErrorModal("Error Storing Data in Browser", "Sorry an error occurred storing data in your web browser. Please check the local storage settings and your available disk space.");
        }

        let numItems = filteredCourses.length;

        if (numItems > 0) {
            displayCourses(searchType);
        }
        else {
            noResultsCourses(searchType);
        }

        fulfill("Filter Applied");
    });
}

function displayCourses(searchType) {
    return new Promise(function (fulfill, reject) {
        //Reset page to 1
        //curPage = 1;

        let courses = JSON.parse(localStorage.getItem("filteredCourses"));
        numItems = courses.length;
        numPages = Math.ceil(numItems / numItemsPerPage);
        let startItem = numItemsPerPage * curPage - numItemsPerPage;
        let endItem = numItemsPerPage * curPage - 1;
        let htmlData = "";
        let htmlNavData = "";

        htmlData += `
            <table class="table table-sm table-hover CourseSearchResults">
                <thead>
                    <tr>`;

        if (searchType === "From") {
            htmlData += `
                        <th scope="col">Faculty</th>
                        <th scope="col">Team</th>
                        <th scope="col">Course Code</th>
                        <th scope="col">Course Title</th>
                        <th scope="col">Group</th>
                        <th scope="col">Enrols</th>
                        <th scope="col">Progress</th>`;
        }
        else {
            htmlData += `
                        <th scope="col">Faculty</th>
                        <th scope="col">Team</th>
                        <th scope="col">Course Code</th>
                        <th scope="col">Course Title</th>
                        <th scope="col">Group</th>
                        <th scope="col">Progress</th>`;
        }

        htmlData += `
                    </tr>
                </thead>
                <tbody>`;

        for (let i = startItem; i <= endItem; i++) {
            if (i >= numItems) {
                //exit loop if max items per page reached
                break;
            }

            let courseGroup = courses[i].courseCode;

            if (courses[i].groupCode !== null) {
                courseGroup += "-" + courses[i].groupCode;
            }

            if (searchType === "From") {
                htmlData += `
                    <tr>
                        <td>${courses[i].facName}</td>
                        <td>${courses[i].teamName}</td>
                        <th scope="row">${courses[i].courseCode}</th>
                        <td>${courses[i].courseTitle}</td>
                        <td>${courses[i].groupCode}</td>
                        <td>${courses[i].enrolments}</td>
                        <td>`;

                if (courses[i].enrolments > 0) {
                    htmlData += `
                            <button type="button" class="btn btn-primary btn-sm ProgressLearnersButton" data-id="${courses[i].courseID}" aria-label="Progression from '${courses[i].courseTitle}' to Another Course" data-target="${courses[i].groupID}" aria-describedby="${courses[i].facCode}" data-parent="${courses[i].teamCode}" aria-labelledby="${courses[i].academicYear}">
                                <i class="fas fa-users"></i> View Learners...
                            </button>`;
                }
                else {
                    htmlData += `
                            <button type="button" class="btn btn-secondary btn-sm disabled ProgressLearnersButtonDisabled">
                                <i class="fas fa-user-slash"></i> No Learners
                            </button>`;
                }

                htmlData += `
                        </td>
                    </tr>`;
            }
            else {
                htmlData += `
                    <tr>
                        <td>${courses[i].facName}</td>
                        <td>${courses[i].teamName}</td>
                        <th scope="row">${courses[i].courseCode}</th>
                        <td>${courses[i].courseTitle}</td>
                        <td>${courses[i].groupCode}</td>
                        <td>
                            <button type="button" class="btn btn-primary btn-sm SelectCourseToProgressButton" data-id="${courses[i].courseID}" data-target="${courses[i].groupID}" aria-describedby="${courses[i].facName}" data-parent="${courses[i].teamName}" aria-label="${courses[i].courseCode}" aria-labelledby="${courses[i].courseTitle}">
                                <i class="fas fa-book"></i> Progress to ${courseGroup}
                            </button>
                        </td>
                    </tr>`;
            }
        }

        htmlData += `
                </tbody>
            </table>`;

        htmlNavData += `
            ${pagesHtml(numPages, curPage, numPagesEitherSide)}`;

        if (searchType === "From") {
            $("#SearchFromArea").html(htmlData);
            $("#CoursePageFromNav").html(htmlNavData);

            listLoadedCourseFromFunctions();
        }
        else {
            $("#SearchToArea").html(htmlData);
            $("#CoursePageToNav").html(htmlNavData);

            listLoadedCourseToFunctions();
        }
        listLoadedCourseFunctions(searchType);

        fulfill("Courses Loaded");
    });
}

function loadCourseGroup(search) {
    let system = $("#SystemID").val();
    let academicYear = $("#AcademicYearID").val();

    let dataToLoad = `/CourseGroups/${search}&academicYear=${academicYear}`;

    if (system !== "") {
        dataToLoad += `&system=${system}`;
    }

    var loadSearchResults = $.get(dataToLoad, function (data) {
        var searchData = $(data).find("#SearchResults");
        $("#SearchFromArea").html(searchData);

        console.log(dataToLoad + " Loaded");
    });
}

function noResultsCourses(searchType) {
    htmlData = `
        <div class="alert alert-secondary text-center" role="alert">
            No results...
        </div>`;

    if (searchType === "From") {
        $("#SearchFromArea").html(htmlData);
    }
    else {
        $("#SearchToArea").html(htmlData);
    }
}

function pagesHtml(numPages, curPage, numPagesEitherSide) {
    let htmlData = "";
    let buttonStyle = "";
    let suffix = "";
    let startPage = +curPage - +numPagesEitherSide;
    let endPage = +curPage + +numPagesEitherSide;

    //Ensure start and end pages are not too small/large
    if (startPage < 1) {
        startPage = 1;
    }

    if (endPage > numPages) {
        endPage = numPages;
    }

    if (curPage !== 1) {
        htmlData += `
            <button class="btn btn-outline-secondary PageNav" aria-label="1">First</button>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        //Highlight current page
        if (i === +curPage) {
            buttonStyle = "btn-secondary";
        }
        else {
            buttonStyle = "btn-outline-secondary";
        }

        //If last page then add ... to indicate more pages if there are
        if (i === +curPage + 3 && numPages > i) {
            suffix = "...";
        }
        else {
            suffix = "";
        }

        htmlData += `
            <button class="btn ${buttonStyle} PageNav" aria-label="${i}">${i}${suffix}</button>`;
    }

    if (curPage !== numPages) {
        htmlData += `
        <button class="btn btn-outline-secondary PageNav" aria-label="${numPages}">Last</button>`;
    }

    return htmlData;
}

function listLoadedCourseFunctions(searchType) {
    $(".PageNav").click(function (event) {
        curPage = $(this).attr("aria-label");
        displayCourses(searchType);
    });
}

function listLoadedCourseFromFunctions() {
    $(".ProgressLearnersButton").click(function (event) {
        let system = $("#SystemID").val();
        let academicYear = $("#AcademicYearID").val();

        let facCode = $(this).attr("aria-describedby");
        let teamCode = $(this).attr("data-parent");
        let courseID = $(this).attr("data-id");
        let groupID = $(this).attr("data-target");
        let formTitleID = $(this).attr("aria-label");

        //Record selected course in hidden inputs
        $("#ProgressFromCourseID").val(courseID);
        $("#ProgressFromGroupID").val(groupID);
        $("#FormTitleID").val(formTitleID);
        $("#CurrentFacCode").val(facCode);
        $("#CurrentTeamCode").val(teamCode);
        $("#AcademicYearID").val(academicYear);

        displayStudents(system, academicYear, courseID, groupID);
    });
}

function listLoadedCourseToFunctions() {
    $(".SelectCourseToProgressButton").click(function (event) {
        $(".OfferTypeLabelCol").removeClass("d-none");
        $(".OfferTypeSelectListCol").removeClass("d-none");

        //Display details of course being 
        let faculty = $(this).attr("aria-describedby");
        let team = $(this).attr("data-parent");
        let courseID = $(this).attr("data-id");
        let courseCode = $(this).attr("aria-label");
        let courseTitle = $(this).attr("aria-labelledby");
        let groupID = $(this).attr("data-target");

        //Record selected course in hidden inputs
        $("#ProgressToCourseID").val(courseID);
        $("#ProgressToGroupID").val(groupID);

        $("#FacultyNameID").html(faculty);
        $("#TeamNameID").html(team);
        $("#CourseCodeID").html(courseCode);
        $("#CourseTitleID").html(courseTitle);
        $("#ProgressToCourseButtonTextID").html(" to " + courseCode);

        $(".SelectedCourseDetails").removeClass("d-none");
    });
}

function displayStudents(system, academicYear, courseID, groupID) {
    let dataToLoad = "";

    if (groupID <= 0) {
        dataToLoad = `/Students/${courseID}/?handler=Json&academicYear=${academicYear}`;
    }
    else {
        dataToLoad = `/Students/${courseID}/${groupID}/?handler=Json&academicYear=${academicYear}`;
    }

    if (system !== "") {
        dataToLoad += `&system=${system}&systemILP=${system}`;
    }

    var loadedStudents = $.get(dataToLoad, function (data) {
        let students = data.students;

        try {
            localStorage.setItem("students", JSON.stringify(students));
        }
        catch (e) {
            doErrorModal("Error Storing Data in Browser", "Sorry an error occurred storing data in your web browser. Please check the local storage settings and your available disk space.");
        }

        let htmlData = "";

        //console.log(students);
        htmlData += `
                <table class="table table-sm table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Student Ref</th>                                
                            <th scope="col">Surname</th>
                            <th scope="col">Forename</th>
                            <th scope="col">Age 31<sup>st</sup> Aug ${academicYear.substring(3, 5)}</th>
                            <th scope="col">Completion</th>
                            <th scope="col">Attend %</th>
                            <th scope="col">Risk</th>
                            <th scope="col">Progress</th>
                            <th scope="col">Destination</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (let student in students) {
            let dateOfBirth = new Date(students[student].dob);
            let dateOfBirthStr = ("0" + dateOfBirth.getDate()).slice(-2) + "/" + ("0" + (dateOfBirth.getMonth() + 1)).slice(-2) + "/" + dateOfBirth.getFullYear();
            let attendPer = students[student].attendPer;

            let attendRate = "";

            if (attendPer === 1) {
                attendRate = "Excellent";
            }
            else if (attendPer >= 0.9000 && attendPer <= 0.9999) {
                attendRate = "Good";
            }
            else if (attendPer >= 0.8500 && attendPer <= 0.8900) {
                attendRate = "Poor";
            }
            else if (attendPer < 0.8500) {
                attendRate = "VeryPoor";
            }
            else {
                attendRate = "VeryPoor";
            }

            htmlData += `
                        <tr>
                            <th scope="row">${students[student].studentRef}</th>
                            <td>${students[student].surname}</td>
                            <td>${students[student].forename}</td>
                            <td>${students[student].age31stAug + 1}</td>
                            <td>${students[student].completion}</td>
                            <td>
                                <div class="AttendPercent ${attendRate}">
                                    <div class="AttendValue">${+(attendPer * 100).toFixed(1)}%</div>
                                    <div class="AttendBar" style="width: ${attendPer * 100}%">
                                    </div>
                                </div>
                            </td>
                            <td><div class="RiskIndicator ${students[student].riskColour}"></div></td>
                            <td class="text-center">
                                <label class="switch-sm">
                                    <input type="checkbox" class="ProgressStudent" data-id="${students[student].studentRef}">
                                    <span class="slider-sm round"></span>
                                </label>
                            </td>
                            <td class="text-center">
                                <div class="DestinationOptions" id="DestinationOptions-${students[student].studentRef}">
                                    <div class="custom-control custom-checkbox custom-control-inline" id="DestinationOptionsCheckbox-${students[student].studentRef}">
                                        <input type="checkbox" id="HasCompleted-${students[student].studentRef}" class="custom-control-input HasCompleted" data-id="${students[student].studentRef}" />
                                        <label class="custom-control-label" for="HasCompleted-${students[student].studentRef}">Not Progressing</label>
                                    </div>
                                    <select id="DestinationOptionsSelectList-${students[student].studentRef}" class="form-control form-control-sm custom-select d-none DestinationOptionsSelectList" asp-items="ViewBag.OfferID" data-id="${students[student].studentRef}">
                                        <option value="" hidden disabled selected>Please select...</option>
                                    </select>
                                    <input type="hidden" id="DestinationOptionsExistingID-${students[student].studentRef}" value="${students[student].destinationCode}" />
                                </div>
                            </td>
                        </tr>`;
        }

        htmlData += `
                    </tbody>
                </table>`;

        $("#StudentArea").html(htmlData);
        console.log(dataToLoad + " Loaded");

        listLoadedStudentFunctions();
    });
}

function listLoadedStudentFunctions() {
    let system = $("#SystemID").val();
    let academicYear = $("#AcademicYearID").val();
    let progressionYear = $("#ProgressionYearID").val();

    $(".CheckAllStudents").prop("disabled", false);
    $(".ProgressLearnerButton").removeClass("disabled");

    $(".ProgressStudent").click(function (event) {
        let studentRef = $(this).attr("data-id");
        let progressStudent = $(this).prop("checked");

        //Hide/show destination
        let destinationOptions = $("#DestinationOptions-" + studentRef);

        if (progressStudent === true) {
            clearDestinationSelections(studentRef);
            destinationOptions.hide();
        }
        else {
            destinationOptions.show();
        }

        recordProgressionJson(studentRef, progressStudent);
    });

    $(".HasCompleted").click(function (event) {
        let system = $("#SystemID").val();
        let academicYear = $("#AcademicYearID").val();
        let progressionYear = $("#ProgressionYearID").val();

        let studentRef = $(this).attr("data-id");
        let notProgressing = $(this).prop("checked");
        let destinationSelectList = $("#DestinationOptionsSelectList-" + studentRef);

        if (notProgressing === true) {
            destinationSelectList.removeClass("d-none");

            recordDestination(system, progressionYear, studentRef, destinationSelectList.val());
        }
        else {
            destinationSelectList.addClass("d-none");
            destinationSelectList.val(null);
            recordDestination(system, progressionYear, studentRef, null);
        }
    });

    $(".DestinationOptionsSelectList").change(function (event) {
        let system = $("#SystemID").val();
        let academicYear = $("#AcademicYearID").val();
        let progressionYear = $("#ProgressionYearID").val();      
        let studentRef = $(this).attr("data-id");

        recordDestination(system, progressionYear, studentRef, $(this).val());
    });

    populateDestinations(system, progressionYear);
}

function populateDestinations(system, academicYear) {
    let dataToLoad = `/SelectLists/DESTINATION/?handler=Json&academicYear=${academicYear}`;

    if (system !== "") {
        dataToLoad += `&system=${system}`;
    }

    var destinationOptions = $.get(dataToLoad, function (data) {
        let selectOptions = data.selectOptions;

        //$(".DestinationOptionsSelectList").find('option').remove(); 

        for (let option in selectOptions) {
            let selectOption =
                `<option value="${selectOptions[option].code}">${selectOptions[option].description}</option>`;
            $(".DestinationOptionsSelectList").append(selectOption);
        }

        console.log(dataToLoad + " Loaded");

        setExistingDestinations();
    });
}

function setExistingDestinations() {
    //If a destination was previously recorded ensure it is set here
    let studentRef = null;
    let selectedDestination = null;
    $(".DestinationOptionsSelectList").each(function (index, value) {
        let dropDown = $(this);
        studentRef = dropDown.attr("data-id");
        selectedDestination = $("#DestinationOptionsExistingID-" + studentRef).val();
        if (selectedDestination !== "null") {
            dropDown.val(selectedDestination);

            let destinationSelectList = $("#DestinationOptionsSelectList-" + studentRef);
            $("#HasCompleted-" + studentRef).prop("checked", true);
            destinationSelectList.removeClass("d-none");
        }
    });
}

function clearDestinationSelections(studentRef) {
    if (studentRef != null) {
        $("#HasCompleted-" + studentRef).prop("checked", false);
        $("#DestinationOptionsSelectList-" + studentRef).val(null);
        $("#DestinationOptionsSelectList-" + studentRef).addClass("d-none");
    }
    else {
        $(".HasCompleted").prop("checked", false);
        $(".DestinationOptionsSelectList").val(null);
        $(".DestinationOptions").addClass("d-none");
        $(".DestinationOptionsSelectList").addClass("d-none");
    }
}

function recordProgressionJson(studentRef, progressStudent) {
    /*Loads student list, updates with checkmark where marked 
     * to be progressed and saves list back to storage*/
    let students = JSON.parse(localStorage.getItem("students"));

    try {
        for (let student in students) {
            if (students[student].studentRef === studentRef) {
                students[student].progressLearner = progressStudent;
            }
        }

        //Save students back to storage
        try {
            localStorage.setItem("students", JSON.stringify(students));
        }
        catch (e) {
            doErrorModal("Error Storing Data in Browser", "Sorry an error occurred storing data in your web browser. Please check the local storage settings and your available disk space.");
        }
    }
    catch {
        doErrorModal("Error Setting Progression", "Sorry an error occurred setting the progression of this student to" + progressStudent + ".<br />Please attempt the operation again.");
    }
}