async function saveDestinations(system, progressionYear, students) {
    var antiForgeryTokenID = $("#AntiForgeryTokenID").val();
    var numStudents = 0;
    var numStudentsDestinationChanged = 0;
    var numSaved = 0;
    var numErrors = 0;
    var studentRef = "0";
    var destinationChanged = false;
    var destinationCode = null;
    var destinationName = null;
    var isActualDestination = null;

    for (let student in students) {
        numStudents += 1;

        studentRef = students[student].studentRef;
        destinationCode = students[student].destinationCode;
        destinationName = students[student].destinationName;
        destinationIsActual = students[student].destinationIsActual;
        destinationChanged = students[student].destinationChanged;

        if (studentRef <= "0") {
            console.log(`Error saving destination for student ${studentRef} to "${destinationCode} - ${destinationName}" in ${system} system`);
            numErrors += 1;
        }
        else if (destinationChanged === false) {
            //Do nothing
        }
        else {
            numStudentsDestinationChanged += 1;

            var result = await saveDestination(system, academicYear, studentRef, destinationCode, destinationName, destinationIsActual, destinationChanged, antiForgeryTokenID);
            numSaved += result;
        }
    }

    numErrors = numStudentsDestinationChanged - numSaved;
    if (numStudents === 0) {
        doErrorModal("Error Saving Progression (NSRD: No Students Retrieved)", "Sorry an error occurred saving the destination of the learners.<br />Please try again.");
    }
    else if (numStudentsDestinationChanged === 0) {
        doErrorModal("Error Saving Progression (NSSD: No Students Selected)", "No student destinations were amended.<br />Please review your selection and retry.");
    }
    else if (numSaved !== numStudentsDestinationChanged) {
        doErrorModal("Error Saving Progression (NASD: Not All Saved)", "Sorry an error occurred saving the destination for <strong>" + numErrors + "</strong> of the <strong>" + numStudents + "</strong> learners.<br />Please review the data and retry.");
    }
    else {
        doModal("Destinations Successfully Saved", "Destinations have been successfully recorded for all <strong>" + numStudentsDestinationChanged + "</strong> learners.");
        //Now saved so disable button again
        $(".SaveDestinationButton").addClass("disabled");
    }
}

function saveDestination(system, academicYear, studentRef, destinationCode, destinationName, destinationIsActual, destinationChanged, antiForgeryTokenID) {
    return new Promise(resolve => {
        let numSaved = 0;
        let numErrors = 0;

        let destinationURL = "";

        if (system !== null) {
            destinationURL = `/Students/SetDestination/${studentRef}?system=${system}`;
        }
        else {
            destinationURL = `/Students/SetDestination/${studentRef}`;
        }

        $.ajax({
            type: "POST",
            url: destinationURL,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("RequestVerificationToken", antiForgeryTokenID);
            },
            data: {
                'Student.SystemDatabase': system,
                'Student.AcademicYear': academicYear,
                'Student.StudentRef': studentRef,
                'Student.DestinationCode': destinationCode,
                'Student.DestinationIsActual': destinationIsActual,
                '__RequestVerificationToken': antiForgeryTokenID
            },
            success: function (data) {
                var audio = new Audio("/sounds/confirm.wav");
                audio.play();
                console.log(`Destination "${destinationCode} - ${destinationName}" recorded for learner "${studentRef}" in Academic Year ${academicYear} in ${system} system`);
                numSaved += 1;
                resolve(1);
            },
            error: function (error) {
                //doCrashModal(error);
                console.error(`Error saving destination "${destinationCode} - ${destinationName}" for learner "${studentRef}" in Academic Year ${academicYear} in ${system} system`);
                numErrors += 1;
                //reject(0);
                resolve(0);
            }
        });
    });
}

async function saveProgressions(system, academicYear, students, courseFromID, groupFromID, courseToID, groupToID, progressionType) {
    let antiForgeryTokenID = $("#AntiForgeryTokenID").val();
    let numStudents = 0;
    let numProgressedStudents = 0;
    let numSaved = 0;
    let numAlreadyOnCourse = 0;
    let numErrors = 0;
    let studentRef = "0";
    let progressLearner = false;
    let offerTypeID = 0;
    let offerConditionID = 0;
    let alreadyProgressedStudents = [];

    for (let student in students) {
        numStudents += 1;
        
        studentRef = students[student].studentRef;
        progressLearner = students[student].progressLearner;
        offerTypeID = students[student].offerType;
        offerConditionID = students[student].offerCondition;
        readyToEnrol = students[student].readyToEnrol;
        readyToEnrolOption = students[student].readyToEnrolOption;

        if (studentRef <= "0") {
            console.log(`Error saving progression for student ${studentRef} to course ${courseToID}, group ${groupToID} in ${system} system`);
            numErrors += 1;
        }
        else if (progressLearner === false) {
            //Do nothing
        }
        else {
            numProgressedStudents += 1;
            let result;
            
            let hasAlreadyApplied = await hasStudentAlreadyApplied(system, academicYear, studentRef, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID, readyToEnrol, readyToEnrolOption, antiForgeryTokenID);

            if (hasAlreadyApplied === 1) {
                alreadyProgressedStudents.push(studentRef);
                numAlreadyOnCourse += 1
            }
            else {
                //Only attempt to save progression if student has not already been progressed to this course
                result = await saveProgression(system, academicYear, studentRef, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID, readyToEnrol, readyToEnrolOption, antiForgeryTokenID);
                numSaved += result;
            }
        }
    }

    //Close modal
    $("#ProgressionModal").modal("hide");

    let title = ``;
    let content = ``;

    numErrors = numProgressedStudents - numSaved - numAlreadyOnCourse;
    if (numStudents === 0) {
        let title = `Error Saving Progression (NSR: No Students Retrieved)`;
        let content = `
            Sorry an error occurred saving the progression of the learners.<br />
            Please try again.`;

        doErrorModal(title, content);
    }
    else if (numProgressedStudents === 0) {
        let title = `Error Saving Progression (NSS: No Students Selected)`;
        let content = `
            No students were selected for progression.<br />
            Please review your selection and retry.`;

        doErrorModal(title, content);
    }
    else if (numAlreadyOnCourse > 0) {
        let alreadyProgressedList = ``;
        alreadyProgressedList += `<ul>`;
        for (let student in students) {
            studentRef = students[student].studentRef;

            let isAlreadyProgressed = alreadyProgressedStudents.includes(studentRef);

            if (isAlreadyProgressed === true) {
                alreadyProgressedList += `<li>${students[student].surname}, ${students[student].forename} (${students[student].studentRef})</li>`;
            }
        }

        alreadyProgressedList += `</ul>`;

        let title = ``;
        let content = `
            <div class="alert alert-warning" role="alert">
                Sorry an error occurred saving the progression for the following <strong>${numAlreadyOnCourse}</strong> learners as they already have applications to the course:<br />
                ${alreadyProgressedList}
            </div>`;

        if (numSaved + numAlreadyOnCourse === numProgressedStudents) {
            title = `Error Saving Progression (NPR1: Some Learners Already Progressed)`;

            if (numProgressedStudents - numAlreadyOnCourse > 0) {
                content += `
                    <div class="alert alert-success" role="alert">
                        Progression data has been successfully recorded for all <strong>${numProgressedStudents - numAlreadyOnCourse}</strong> remaining learners.
                    </div>`;
            }
            
            content += `
                Please review the existing applications in ProSolution.`;
        }
        else {
            title = `Error Saving Progression (NPR2: Some Learners Already Progressed And Errors)`;
            content += `
                Also an error occurred saving the progression for <strong>${numErrors}</strong> of the <strong>${numProgressedStudents - numAlreadyOnCourse}</strong> remaining learners.<br />
                Please review the existing applications in ProSolution and retry.`;
        }

        if (numSaved + numAlreadyOnCourse === numProgressedStudents) {
            //If some already on course and rest all successful
            doModal(title, content);
        }
        else {
            //If some already on course but also other errors
            doErrorModal(title, content);
        }
    }
    else if (numSaved !== numProgressedStudents) {
        let title = `Error Saving Progression (NAS: Not All Saved)`;
        let content = `
            Sorry an error occurred saving the progression for <strong>${numErrors}</strong> of the <strong>${numProgressedStudents - numAlreadyOnCourse}</strong> learners.<br />
            Please review the data and retry.`;

        doErrorModal(title, content);
    }
    else {
        let title = `Progressions Successfully Saved`;
        let content = `
            Progression data has been successfully recorded for all <strong>${numSaved}</strong> learners.`;

        doModal(title, content);
    }
}

function hasStudentAlreadyApplied(system, academicYear, studentRef, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID, readyToEnrol, readyToEnrolOption, antiForgeryTokenID) {
    return new Promise(resolve => {
        let dataToLoad = "";

        if (system !== null) {
            dataToLoad = `/Students/Details/${studentRef}/${courseToID}/?handler=Json&system=${system}`;
        }
        else {
            dataToLoad = `/Students/Details/${studentRef}/${courseToID}/?handler=Json`;
        }

        $.get(dataToLoad, function (data) {

        })
            .then(data => {
                console.log(dataToLoad + " Loaded");

                let hasAppliedAlready = false;

                if (data.student !== null) { //Will be null if student has not yet been rolled forward
                    hasAppliedAlready = data.student.hasAlreadyApplied; 
                }

                if (hasAppliedAlready === true) {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        //Need to check and resolve 1 or 0
    });
}

function saveProgression(system, academicYear, studentRef, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID, readyToEnrol, readyToEnrolOption, antiForgeryTokenID) {
    return new Promise(resolve => {
        let numSaved = 0;
        let numErrors = 0;

        let progressionURL = "";

        if (system !== null) {
            progressionURL = `/Students/SaveProgression/${studentRef}?system=${system}`;
        }
        else {
            progressionURL = `/Students/SaveProgression/${studentRef}`;
        }

        $.ajax({
            type: "POST",
            url: progressionURL,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("RequestVerificationToken", antiForgeryTokenID);
            },
            data: {
                'Progression.SystemDatabase': system,
                'Progression.AcademicYear': academicYear,
                'Progression.StudentRef': studentRef,
                'Progression.CourseFromID': courseFromID,
                'Progression.GroupFromID': groupFromID,
                'Progression.CourseToID': courseToID,
                'Progression.GroupToID': groupToID,
                'Progression.ProgressionType': progressionType,
                'Progression.OfferTypeID': offerTypeID,
                'Progression.OfferConditionID': offerConditionID,
                'Progression.ReadyToEnrolOption': readyToEnrolOption,
                '__RequestVerificationToken': antiForgeryTokenID
            },
            success: function (data) {
                var audio = new Audio("/sounds/confirm.wav");
                audio.play();
                console.log(`Progression for "${studentRef}" saved for course "${courseToID}", group "${groupToID}" in ${system} system`);
                numSaved += 1;
                resolve(1);
            },
            error: function (error) {
                //doCrashModal(error);
                console.log(`Error saving progression for "${studentRef}" for course "${courseToID}", group "${groupToID}" in ${system} system`);
                numErrors += 1;
                //reject(0);
                resolve(0);
            }
        }); 
    });
}