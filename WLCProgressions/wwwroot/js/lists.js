//Set options
var minSearchChars = 3;
var numItemsPerPage = 10;
var numPagesEitherSide = 3;
var numPages = 1;
var curPage = 1;
var numItems = 10;

function loadAllCourses(system, academicYear, hasEnrols) {
    return new Promise(resolve => {
        let dataToLoad = `/CourseGroups/?handler=Json&academicYear=${academicYear}&hasEnrols=${hasEnrols}`;

        if (system !== "") {
            dataToLoad += `&system=${system}`;
        }

        $.get(dataToLoad, function (data) {
            
        })
            .then(data => {
                numItems = data.courses.length;
                numPages = Math.ceil(numItems / numItemsPerPage);

                try {
                    localStorage.setItem("courses", JSON.stringify(data));
                    console.log(dataToLoad + " Loaded");
                    resolve(1);
                }
                catch (e) {
                    doErrorModal("Error Storing Data in Browser", "Sorry an error occurred storing data in your web browser. Please check the local storage settings and your available disk space.");
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

function filterCourses(searchField, searchType, outstandingOnly, fac, team) {
    return new Promise(resolve => {
        let allCourses = JSON.parse(localStorage.getItem("courses"));
        let filteredCourses = allCourses.courses;

        let searchFieldVal = null;

        //Filter the list
        //filteredCourses = filteredCourses.filter(courses => courses.courseCode === "STOXX11001-SPA");

        if (searchField !== null && typeof searchField !== "undefined") {
            searchFieldVal = searchField.val().toLowerCase();

            filteredCourses = filteredCourses.filter(
                courses =>
                    courses.courseTitle.toLowerCase().indexOf(searchFieldVal) !== -1
                    || courses.courseCode.toLowerCase().indexOf(searchFieldVal) !== -1
            );
        }

        if (outstandingOnly === true) {
            filteredCourses = filteredCourses.filter(courses => courses.outstandingRecords > 0);
        }

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

        resolve(1);
    });
}

function displayCourses(searchType) {
    return new Promise(resolve => {
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
                        <th scope="col">Processed So Far</th>
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
            let completedRecordsPer = courses[i].completedRecordsPer;

            let progressRate = "";

            if (completedRecordsPer === 1) {
                progressRate = "Excellent";
            }
            else if (completedRecordsPer >= 0.9000 && completedRecordsPer <= 0.9999) {
                progressRate = "Good";
            }
            else if (completedRecordsPer >= 0.8500 && completedRecordsPer <= 0.8900) {
                progressRate = "Poor";
            }
            else if (completedRecordsPer < 0.8500) {
                progressRate = "VeryPoor";
            }
            else {
                progressRate = "VeryPoor";
            }

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
                        <td class="text-center">
                            <div class="ProgressPercent ${progressRate}">
                                <div class="ProgressValue">${+(completedRecordsPer * 100).toFixed(1)}&percnt;</div>
                                <div class="ProgressBar" style="width: ${completedRecordsPer * 100}%">
                                </div>
                            </div>
                        </td>
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

        resolve(1);
    });
}

function loadCourseGroup(search) {
    let system = $("#SystemID").val();
    let academicYear = $("#AcademicYearID").val();

    let dataToLoad = `/CourseGroups/${search}&academicYear=${academicYear}`;

    if (system !== "") {
        dataToLoad += `&system=${system}`;
    }

    $.get(dataToLoad, function (data) {
        
    })
        .then(data => {
            var searchData = $(data).find("#SearchResults");
            $("#SearchFromArea").html(searchData);

            console.log(dataToLoad + " Loaded");
        })
        .fail(function () {
            let title = `Error Loading Search Results`;
            let content = `Sorry an error occurred loading the list of courses. Please try again.`;

            doErrorModal(title, content);
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
        let systemILP = $("#SystemILPID").val();
        let academicYear = $("#AcademicYearID").val();
        let progressionYear = $("#ProgressionYearID").val();

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

        displayStudents(system, systemILP, academicYear, progressionYear, courseID, groupID);

        //Scroll down page
        $("html, body").animate({ scrollTop: $("#StudentFromArea").offset().top }, "slow");
    });
}

function listLoadedCourseToFunctions() {
    $(".SelectCourseToProgressButton").click(function (event) {        
        //Display details of course being 
        let academicYear = $("#AcademicYearID").val();
        let progressionYear = $("#ProgressionYearID").val();
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

        //Now get list of students to display in list
        let students = JSON.parse(localStorage.getItem("students"));
        let studentsHtml = "";

        studentsHtml += `
            <table id="ProgressorsList" class="table table-sm table-hover">
                <thead>
                    <tr>
                        <th scope="col">Student<br />Ref</th>                                
                        <th scope="col">Surname</th>
                        <th scope="col">Forename</th>
                        <th scope="col">Age 31<sup>st</sup><br />Aug ${academicYear.substring(3, 5)}</th>
                        <th scope="col" class="text-center">Offer Details</th>
                    </tr>
                </thead>
                <tbody>`;

        try {
            for (let student in students) {
                if (students[student].progressLearner === true) {
                    studentsHtml += `
                    <tr>
                        <th scope="row">${students[student].studentRef}</th>
                        <td>${students[student].surname}</td>
                        <td>${students[student].forename}</td>
                        <td class="text-center">${students[student].age31stAug + 1}</td>
                        <td>
                            <div class="row">
                                <div class="col-md">
                                    <select id="OfferTypeSelectList-${students[student].studentRef}" class="form-control form-control-sm custom-select ProgressionInputField OfferTypeSelectList" data-id="${students[student].studentRef}">
                                        <option value="" hidden disabled selected>Offer Type...</option>
                                    </select>
                                </div>
                                <div id="OfferConditionSelectListCol-${students[student].studentRef}" class="col-md d-none OfferConditionSelectListCol">
                                    <select id="OfferConditionSelectList-${students[student].studentRef}" class="form-control form-control-sm custom-select ProgressionInputField OfferConditionSelectList" data-id="${students[student].studentRef}">
                                        <option value="" hidden disabled selected>Offer Condition...</option>
                                    </select>
                                </div>
                                <div id="OfferReadyToEnrolCol-${students[student].studentRef}" class="col-md d-none OfferReadyToEnrolCol">
                                    <div class="custom-control custom-switch">
                                        <input id="OfferReadyToEnrol-${students[student].studentRef}" type="checkbox" class="custom-control-input ProgressionInputField OfferReadyToEnrol" data-id="${students[student].studentRef}">
                                        <label class="custom-control-label" for="OfferReadyToEnrol-${students[student].studentRef}">Ready To Enrol</label>
                                    </div>
                                </div>
                                <div id="OfferReadyToEnrolSelectListCol-${students[student].studentRef}" class="col-md-12 d-none OfferReadyToEnrolSelectListCol">
                                    <select id="OfferReadyToEnrolSelectList-${students[student].studentRef}" class="form-control form-control-sm custom-select ProgressionInputField OfferReadyToEnrolSelectList" data-id="${students[student].studentRef}">
                                        <option value="" hidden disabled selected>Please Select...</option>
                                    </select>
                                </div>
                            </div>
                        </td>
                    </tr>`;
                }
            }

            studentsHtml += `
                </tbody>
            </table>`;

            $("#StudentToArea").html(studentsHtml);

            let domain = "APPLICATION_OFFER";
            let selectList = ".OfferTypeSelectList";
            populateDropDown(system, progressionYear, domain, selectList);

            domain = "APPLICATION_CONDITION";
            selectList = ".OfferConditionSelectList";
            populateDropDown(system, progressionYear, domain, selectList);

            domain = "READY_TO_ENROL_OPTIONS";
            selectList = ".OfferReadyToEnrolSelectList";
            populateDropDown(system, progressionYear, domain, selectList);

            //Check input as fields are changed
            $(".ProgressionInputField").change(function (event) {
                let studentRef = $(this).attr("data-id");
                let offerType = $("#OfferTypeSelectList-" + studentRef).val();
                let offerCondition = $("#OfferConditionSelectList-" + studentRef).val();
                let readyToEnrol = $("#OfferReadyToEnrol-" + studentRef).prop('checked');
                let readyToEnrolOption = $("#OfferReadyToEnrolSelectList-" + studentRef).val();

                //Check if input is valid for all learners
                checkOfferDetails();

                //Update details for student
                recordOfferJson(studentRef, offerType, offerCondition, readyToEnrol, readyToEnrolOption);
            });

            $(".OfferTypeSelectList").change(function (event) {
                let studentRef = $(this).attr("data-id");
                let offerType = $(this).val();

                if (offerType === "2") {
                    $("#OfferConditionSelectListCol-" + studentRef).removeClass("d-none");
                }
                else if (offerType > "0") {
                    $("#OfferConditionSelectListCol-" + studentRef).addClass("d-none");
                    $("#OfferConditionSelectList-" + studentRef).val("");
                    $("#OfferReadyToEnrolCol-" + studentRef).removeClass("d-none");
                }
                else {
                    $("#OfferConditionSelectListCol-" + studentRef).addClass("d-none");
                    $("#OfferConditionSelectList-" + studentRef).val("");
                    $("#OfferReadyToEnrolCol-" + studentRef).addClass("d-none");
                }
            });

            $(".OfferConditionSelectList").change(function (event) {
                let studentRef = $(this).attr("data-id");
                let offerCondition = $(this).val();
                $("#OfferReadyToEnrolCol-" + studentRef).removeClass("d-none");
            });

            $(".OfferReadyToEnrol").change(function (event) {
                let studentRef = $(this).attr("data-id");
                let readyToEnrol = $(this).prop('checked');
                let readyToEnrolOption = $("#OfferReadyToEnrolSelectList-" + studentRef).val();

                if (readyToEnrol === true) {
                    $("#OfferReadyToEnrolSelectListCol-" + studentRef).removeClass("d-none");
                }
                else {
                    $("#OfferReadyToEnrolSelectListCol-" + studentRef).addClass("d-none");
                    $("#OfferReadyToEnrolSelectList-" + studentRef).val("");
                }
            });

            //Scroll down page
            //$(".modal#ProgressionModal .modal-body").scrollTop($("#ProgressToArea").offset().top);
            $(".modal#ProgressionModal .modal-body").animate({ scrollTop: $("#ProgressToArea").offset().top }, "slow");
        }
        catch {
            doErrorModal("Error Loading List of Learners", "Sorry an error occurred loading the list of learners.<br />Please attempt the operation again.");
        }
    });
}

function checkOfferDetails() {
    let inputComplete = false;
    let recordsOk = 0;
    let recordsErr = 0;
    $(".OfferTypeSelectList").each(function (event) {
        let thisStudentRef = $(this).attr("data-id");
        let thisOfferTypeVal = $(this).val();
        let thisOfferConditionVal = $("#OfferConditionSelectList-" + thisStudentRef).val();
        let thisReadyToEnrolFld = $("#OfferReadyToEnrol-" + thisStudentRef);
        let thisReadyToEnrolVal = thisReadyToEnrolFld.prop('checked');
        let thisReadyToEnrolOptionFld = $("#OfferReadyToEnrolSelectList-" + thisStudentRef);
        let thisReadyToEnrolOptionVal = thisReadyToEnrolOptionFld.val();

        if (thisOfferTypeVal === null) {
            recordsErr += 1;
        }
        else if (thisOfferTypeVal === "2" && thisOfferConditionVal === null) {
            recordsErr += 1;
        }
        else if (thisReadyToEnrolVal === true && thisReadyToEnrolOptionVal === null) {
            recordsErr += 1;
        }
        else {
            recordsOk += 1;
        }
    });

    if (recordsOk > 0 && recordsErr === 0) {
        $(".SaveProgressionButton").removeClass("disabled");
        inputComplete = true;
    }
    else {
        $(".SaveProgressionButton").addClass("disabled");
        inputComplete = false;
    }

    return inputComplete;
}

function displayStudents(system, systemILP, academicYear, progressionYear, courseID, groupID) {
    let dataToLoad = "";

    if (groupID <= 0) {
        dataToLoad = `/Students/${courseID}/?handler=Json&academicYear=${academicYear}`;
    }
    else {
        dataToLoad = `/Students/${courseID}/${groupID}/?handler=Json&academicYear=${academicYear}`;
    }

    if (system !== "") {
        dataToLoad += `&system=${system}&systemILP=${systemILP}`;
    }

    $.get(dataToLoad, function (data) {
        
    })
        .then(data => {
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
                <table id="EnrolmentList" class="table table-sm table-hover">
                    <thead>
                        <tr>
                            <th scope="col" colspan="11" class="alert alert-primary">
                                <h5 class="alert-heading">${students[0].collegeCode} <i class="fas fa-chevron-right"></i> ${students[0].facCode} <i class="fas fa-chevron-right"></i> ${students[0].teamCode} <i class="fas fa-chevron-right"></i> <i class="fas fa-graduation-cap"></i> ${students[0].courseCode} - ${students[0].courseTitle}</h5>
                            </th>
                        </tr>
                        <tr>
                            <th scope="col" class="THSmall">Student<br />Ref</th>                                
                            <th scope="col" class="THSmall">Surname</th>
                            <th scope="col" class="THSmall">Forename</th>
                            <th scope="col" class="THSmall">Age 31<sup>st</sup><br />Aug ${academicYear.substring(3, 5)}</th>
                            <th scope="col" class="THSmall">Completion</th>
                            <th scope="col" class="text-center THSmall">Attend %</th>
                            <th scope="col" class="text-center THSmall">On Track To Achieve</th>
                            <th scope="col" class="text-center THSmall">${progressionYear} Apps<br />and Enrols</th>
                            <th scope="col" class="text-center THSmall">Progress</th>
                            <th scope="col" class="text-center THSmall">Destination</th>
                        </tr>
                    </thead>
                    <tbody>`;

            for (let student in students) {
                let dateOfBirth = new Date(students[student].dob);
                let dateOfBirthStr = ("0" + dateOfBirth.getDate()).slice(-2) + "/" + ("0" + (dateOfBirth.getMonth() + 1)).slice(-2) + "/" + dateOfBirth.getFullYear();
                let attendPer = students[student].attendPer;
                let appsButton = "";
                let enrolsButton = "";

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

                let attendSummary = `
                <ul class='AttendSummary'>
                    <li>Planned: ${students[student].classesPlanned}</li>
                    <li>Counted: ${students[student].classesCounted}</li>
                    <li>Neutral (not counted): ${students[student].classesNeutral}</li>
                    <li>Marked: ${students[student].classesMarked}</li>
                    <li>Unmarked: ${students[student].classesUnmarked}</li>
                    <li>Present: ${students[student].classesPresent}</li>
                    <li>Absent: ${students[student].classesAbsent}</li>
                    <li>Authorised Absence: ${students[student].classesAuthAbsence}</li>
                    <li>Late: ${students[student].classesLate}</li>
                    <li><strong>Attendance: ${+(attendPer * 100).toFixed(1)}&percnt;</strong></li>
                    <li><strong>Category: ${attendRate}</strong></li>
                </ul>`;

                let onTrackToAchieveSummary = `
                <ul class='RiskSummary'>
                    <li>RAG: ${students[student].onTrackToAchieveCode}</li>
                    <li>RAG Colour: ${students[student].onTrackToAchieveColour}</li>
                    <li>RAG Term: ${students[student].onTrackToAchieveTerm}</li>
                </ul>`;

                let appsArr = null;
                let appsList = "";

                if (students[student].appliedCoursesNextYear != null) {
                    appsArr = students[student].appliedCoursesNextYear.split(",");

                    for (let app of appsArr) {
                        appsList += `<li>${app}</li>`;
                    }

                    appsList = `<ul>${appsList}</ul>`;
                }

                let enrolsArr = null;
                let enrolsList = "";

                if (students[student].enrolledCoursesNextYear != null) {
                    enrolsArr = students[student].enrolledCoursesNextYear.split(",");

                    for (let enrol of enrolsArr) {
                        enrolsList += `<li>${enrol}</li>`;
                    }

                    enrolsList = `<ul>${enrolsList}</ul>`;
                }

                if (students[student].numAppsNextYear > 0) {
                    appsButton = `
                    <button type="button" class="btn btn-outline-primary btn-sm LearnerPopover" data-toggle="popover" aria-describedby="${progressionYear} Applications for ${students[student].forename} ${students[student].surname}" data-content="${appsList}">
                        <i class="fas fa-envelope-open-text"></i> ${students[student].numAppsNextYear}
                    </button>`;
                }
                else {
                    appsButton = `
                    <button type="button" class="btn btn-outline-primary btn-sm disabled">
                        <i class="fas fa-envelope-open-text"></i> ${students[student].numAppsNextYear}
                    </button>`;
                }

                if (students[student].numEnrolsNextYear > 0) {
                    enrolsButton = `
                    <button type="button" class="btn btn-outline-primary btn-sm LearnerPopover" data-toggle="popover" aria-describedby="${progressionYear} Enrolments for ${students[student].forename} ${students[student].surname}" data-content="${enrolsList}">
                        <i class="fas fa-user-graduate"></i> ${students[student].numEnrolsNextYear}
                    </button>`;
                }
                else {
                    enrolsButton = `
                    <button type="button" class="btn btn-outline-primary btn-sm disabled">
                        <i class="fas fa-user-graduate"></i> ${students[student].numEnrolsNextYear}
                    </button>`;
                }

                htmlData += `
                        <tr>
                            <th scope="row">${students[student].studentRef}</th>
                            <td>${students[student].surname}</td>
                            <td>${students[student].forename}</td>
                            <td class="text-center">${students[student].age31stAug + 1}</td>
                            <td>${students[student].completion}</td>
                            <td class="text-center">
                                <div class="AttendPercent ${attendRate} LearnerPopover" data-toggle="popover" aria-describedby="${academicYear} Attendance for ${students[student].forename} ${students[student].surname}" data-content="${attendSummary}">
                                    <div class="AttendValue">${+(attendPer * 100).toFixed(1)}&percnt;</div>
                                    <div class="AttendBar" style="width: ${attendPer * 100}%">
                                    </div>
                                </div>
                            </td>
                            <td class="text-center">
                                <div class="RiskIndicator ${students[student].onTrackToAchieveColour} LearnerPopover" data-toggle="popover" aria-describedby="${academicYear} RAG Rating for ${students[student].forename} ${students[student].surname}" data-content="${onTrackToAchieveSummary}"></div>
                            </td>
                            <td class="text-center">
                                ${appsButton}
                                ${enrolsButton}
                            </td>
                            <td class="text-center">
                                <label class="switch-sm">
                                    <input type="checkbox" class="ProgressStudent" data-id="${students[student].studentRef}">
                                    <span class="slider-sm round"></span>
                                </label>
                            </td>
                            <td class="text-center">
                                <div class="DestinationOptions" id="DestinationOptions-${students[student].studentRef}">
                                    <div class="custom-control custom-checkbox custom-control-inline" id="DestinationOptionsCheckbox-${students[student].studentRef}">
                                        <input type="checkbox" id="RecordDestination-${students[student].studentRef}" class="custom-control-input RecordDestination" data-id="${students[student].studentRef}" />
                                        <label class="custom-control-label" for="RecordDestination-${students[student].studentRef}">Record Destination</label>
                                    </div>
                                    <div class="row">
                                        <div class="col-md">
                                            <select id="DestinationOptionsSelectList-${students[student].studentRef}" class="form-control form-control-sm custom-select d-none DestinationOptionsSelectList" data-id="${students[student].studentRef}">
                                                <option value="" hidden disabled selected>Please select...</option>
                                            </select>
                                        </div>
                                        <div class="col-md">
                                            <select id="DestinationIntendedActualSelectList-${students[student].studentRef}" class="form-control form-control-sm custom-select d-none DestinationIntendedActualSelectList" data-id="${students[student].studentRef}">
                                                <option value="" hidden disabled selected>Please select...</option>
                                            </select>
                                        </div>
                                    </div>
                                    <input type="hidden" id="DestinationOptionsExistingID-${students[student].studentRef}" value="${students[student].destinationCode}" />
                                    <input type="hidden" id="DestinationIntendedActualExistingID-${students[student].studentRef}" value="${students[student].destinationIsActual}" />
                                </div>
                            </td>
                        </tr>`;
            }

            htmlData += `
                    </tbody>
                </table>`;

            $("#StudentFromArea").html(htmlData);

            console.log(dataToLoad + " Loaded");

            listLoadedStudentFunctions();
        })
        .fail(function () {
            let title = `Error Loading Learners`;
            let content = `Sorry an error occurred loading the list of learners. Please try again.`;

            doErrorModal(title, content);
        });
}

function listLoadedStudentFunctions() {
    let system = $("#SystemID").val();
    let academicYear = $("#AcademicYearID").val();
    let progressionYear = $("#ProgressionYearID").val();

    $(".CheckAllStudents").prop("disabled", false);
    $(".ProgressLearnerButton").removeClass("disabled");

    $(".LearnerPopover").click(function (event) {
        //Close any existing popups
        $(".LearnerPopover").popover("hide");

        let title = $(this).attr('aria-describedby');
        $(this).popover({
            title: function () {
                return title +
                    '<span class="close">&times</span>';
            },
            container: "#EnrolmentList",
            sanitize: false,
            html: true
        }).popover("show");
    });

    $(".LearnerPopover").on('shown.bs.popover', function (e) {
        //Functionality for close button
        var curPopover = $('#' + $(e.target).attr('aria-describedby'));

        curPopover.find('.close').click(function () {
            $(".LearnerPopover").popover("hide");
        });
    });

    $(".popover span.close").click(function () {
        $(this).popover("toggle");
    });

    $(".ProgressStudent").click(function (event) {
        let studentRef = $(this).attr("data-id");
        let progressStudent = $(this).prop("checked");

        //Hide/show destination
        let destinationOptions = $("#DestinationOptions-" + studentRef);

        if (progressStudent === true) {
            clearDestinationSelections(studentRef);
            destinationOptions.addClass("d-none");
        }
        else {
            destinationOptions.removeClass("d-none");
        }

        recordProgressionJson(studentRef, progressStudent);
    });

    $(".RecordDestination").change(function (event) {
        let system = $("#SystemID").val();
        let academicYear = $("#AcademicYearID").val();
        let progressionYear = $("#ProgressionYearID").val();

        let studentRef = $(this).attr("data-id");
        let notProgressing = $(this).prop("checked");
        let destinationSelectList = $("#DestinationOptionsSelectList-" + studentRef);
        let destinationIntendedActualSelectList = $("#DestinationIntendedActualSelectList-" + studentRef);
        let destinationCode = destinationSelectList.val();
        let destinationName = destinationSelectList.children("option:selected").text();
        let isActualDestination = destinationIntendedActualSelectList.val();

        if (notProgressing === true) {
            destinationSelectList.removeClass("d-none");
            destinationIntendedActualSelectList.removeClass("d-none");

            //No longer saving to DB on change
            //recordDestination(system, progressionYear, studentRef, destinationCode);
            recordDestinationJson(studentRef, destinationCode, destinationName, isActualDestination);
        }
        else {
            //If progressing then do not record a destination and remove any recorded today by the system
            destinationSelectList.addClass("d-none");
            destinationSelectList.val(null);
            destinationIntendedActualSelectList.addClass("d-none");
            destinationIntendedActualSelectList.val(null);

            //No longer saving to DB on change
            recordDestinationJson(studentRef, null, null, null);
            var antiForgeryTokenID = $("#AntiForgeryTokenID").val();
            saveDestination(system, progressionYear, studentRef, null, null, null, "Y", antiForgeryTokenID);
        }
    });

    
    $(".DestinationOptionsSelectList").change(function (event) {
        let system = $("#SystemID").val();
        let academicYear = $("#AcademicYearID").val();
        let progressionYear = $("#ProgressionYearID").val();      
        let studentRef = $(this).attr("data-id");
        let destinationCode = $(this).val();
        let destinationName = $(this).children("option:selected").text();
        let isActualDestinationFld = $(this).parent().parent().find(".DestinationIntendedActualSelectList");
        let isActualDestinationVal = isActualDestinationFld.val();

        //If intended/actual not set then set to intended
        if (isActualDestinationVal === null) {
            isActualDestinationVal = 0;
            isActualDestinationFld.val(isActualDestinationVal);
        }
        //No longer saving to DB on change
        //recordDestination(system, progressionYear, studentRef, destinationCode);

        recordDestinationJson(studentRef, destinationCode, destinationName, isActualDestinationVal);
    });

    $(".DestinationIntendedActualSelectList").change(function (event) {
        let system = $("#SystemID").val();
        let academicYear = $("#AcademicYearID").val();
        let progressionYear = $("#ProgressionYearID").val();
        let studentRef = $(this).attr("data-id");
        let destinationCode = $(this).parent().parent().find(".DestinationOptionsSelectList").val();
        let destinationName = $(this).parent().parent().find(".DestinationOptionsSelectList").children("option:selected").text();
        let isActualDestination = $(this).val();

        //No longer saving to DB on change
        //recordDestination(system, progressionYear, studentRef, destinationCode);

        recordDestinationJson(studentRef, destinationCode, destinationName, isActualDestination);
    });

    let domain = null;
    let selectList = null;

    domain = "DESTINATION";
    selectList = ".DestinationOptionsSelectList";
    populateDropDown(system, progressionYear, domain, selectList)
        .then(function (value) {
            domain = "DESTINATION_INTENDED_ACTUAL";
            selectList = ".DestinationIntendedActualSelectList";
            populateDropDown(system, progressionYear, domain, selectList)
                .then(function (value) {
                    setExistingDestinations();
                });
        });
}

function populateDropDown(system, academicYear, domain, selectList) {
    return new Promise(resolve => {
        try {
            let dataToLoad = `/SelectLists/${domain}/?handler=Json&academicYear=${academicYear}`;

            if (system !== "") {
                dataToLoad += `&system=${system}`;
            }

            $.get(dataToLoad, function (data) {
                
            }).then(data => {
                let selectOptions = data.selectOptions;

                //$(".DestinationOptionsSelectList").find('option').remove(); 

                for (let option in selectOptions) {
                    let selectOption =
                        `<option value="${selectOptions[option].code}">${selectOptions[option].description}</option>`;
                    $(selectList).append(selectOption);
                }

                console.log(dataToLoad + " Loaded");

                //setExistingDestinations();
                resolve(1);
            })
                .fail(function () {
                    let title = `Error Loading Drop Down Options`;
                    let content = `Sorry an error occurred loading the list of dropdown values for "${domain}". Please try again.`;

                    doErrorModal(title, content);
                });
        }
        catch (e) {
            resolve(0);
        }
    });
}

function setExistingDestinations() {
    //If a destination was previously recorded ensure it is set here
    let studentRef = null;
    let existingDestination = null;
    let isActualDestination = null;
    var destinationSelect = document.querySelectorAll('.DestinationOptionsSelectList');

    destinationSelect.forEach(function (select) {
        studentRef = select.dataset.id;
        existingDestination = document.getElementById("DestinationOptionsExistingID-" + studentRef).value;
        existingIntendedActual = document.getElementById("DestinationIntendedActualExistingID-" + studentRef).value;
        isActualDestinationFld = document.getElementById("DestinationOptionsExistingID-" + studentRef).parentElement.parentElement.getElementsByClassName("DestinationIntendedActualSelectList")[0];

        if (existingDestination !== "null") {
            select.value = existingDestination;
            isActualDestinationFld.value = existingIntendedActual;
            document.getElementById("RecordDestination-" + studentRef).checked = true;
            select.classList.remove("d-none");
            isActualDestinationFld.classList.remove("d-none");
        }
    });
}

function clearDestinationSelections(studentRef) {
    if (studentRef != null) {
        $("#RecordDestination-" + studentRef).prop("checked", false);
        $("#RecordDestination-" + studentRef).trigger("change");
        $("#DestinationOptionsSelectList-" + studentRef).val(null);
        $("#DestinationOptionsSelectList-" + studentRef).addClass("d-none");
        $("#DestinationIntendedActualSelectList-" + studentRef).val(null);
        $("#DestinationIntendedActualSelectList-" + studentRef).addClass("d-none");
        $(".DestinationOptions-" + studentRef).removeClass("d-none");
    }
    else {
        $(".RecordDestination").prop("checked", false);
        $(".DestinationOptionsSelectList").val(null);
        $(".DestinationOptionsSelectList").addClass("d-none");
        $(".DestinationIntendedActualSelectList").val(null);
        $(".DestinationIntendedActualSelectList").addClass("d-none");
        $(".DestinationOptions").addClass("d-none");
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

function recordDestinationJson(studentRef, destinationCode, destinationName, destinationIsActual) {
    /*Loads student list, updates with destination 
     * and saves list back to storage*/
    let students = JSON.parse(localStorage.getItem("students"));

    try {
        for (let student in students) {
            if (students[student].studentRef === studentRef) {
                //Only update destination if different
                if (students[student].destinationCode !== destinationCode || students[student].destinationIsActual !== destinationIsActual) {
                    students[student].destinationCode = destinationCode;
                    students[student].destinationName = destinationName;
                    students[student].destinationIsActual = destinationIsActual
                    students[student].destinationChanged = true;

                    //As null destinations are saved straight away only enable button if not null
                    if (destinationCode != null) {
                        $(".SaveDestinationButton").removeClass("disabled");
                    }
                }
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
        doErrorModal("Error Setting Progression", "Sorry an error occurred setting the progression of this student to " + progressStudent + ".<br />Please attempt the operation again.");
    }
}

function recordOfferJson(studentRef, offerType, offerCondition, readyToEnrol, readyToEnrolOption) {
    /*Loads student list, updates with destination 
     * and saves list back to storage*/
    let students = JSON.parse(localStorage.getItem("students"));

    try {
        for (let student in students) {
            if (students[student].studentRef === studentRef) {
                //Only update destination if different
                if (
                    students[student].offerType !== offerType
                    || students[student].offerCondition !== offerCondition
                    || students[student].readyToEnrol !== readyToEnrol
                    || students[student].readyToEnrolOption !== readyToEnrolOption
                ) {
                    students[student].offerType = offerType;
                    students[student].offerCondition = offerCondition;
                    students[student].readyToEnrol = readyToEnrol;
                    students[student].readyToEnrolOption = readyToEnrolOption;
                }
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
        doErrorModal("Error Setting Offer Type", "Sorry an error occurred setting the offer details of this student to " + offerType + " - " + offerCondition + ".<br />Please attempt the operation again.");
    }
}