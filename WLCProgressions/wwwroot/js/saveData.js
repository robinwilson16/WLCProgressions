﻿async function saveDestinations(system, progressionYear, students) {
    var antiForgeryTokenID = $("#AntiForgeryTokenID").val();
    var numStudents = 0;
    var numStudentsDestinationChanged = 0;
    var numSaved = 0;
    var numErrors = 0;
    var studentRef = "0";
    var destinationChanged = false;
    var destinationCode = null;
    var destinationName = null;

    for (let student in students) {
        numStudents += 1;

        studentRef = students[student].studentRef;
        destinationCode = students[student].destinationCode;
        destinationName = students[student].destinationName;
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

            var result = await saveDestination(system, academicYear, studentRef, destinationCode, destinationName, destinationChanged, antiForgeryTokenID);
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

function saveDestination(system, academicYear, studentRef, destinationCode, destinationName, destinationChanged, antiForgeryTokenID) {
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
    let numErrors = 0;
    let studentRef = "0";
    let progressLearner = false;
    let offerTypeID = 0;
    let offerConditionID = 0;

    for (let student in students) {
        numStudents += 1;

        studentRef = students[student].studentRef;
        progressLearner = students[student].progressLearner;
        offerTypeID = students[student].offerType;
        offerConditionID = students[student].offerCondition;

        if (studentRef <= "0") {
            console.log(`Error saving progression for student ${studentRef} to course ${courseToID}, group ${groupToID} in ${system} system`);
            numErrors += 1;
        }
        else if (progressLearner === false) {
            //Do nothing
        }
        else {
            numProgressedStudents += 1;

            var result = await saveProgression(system, academicYear, studentRef, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID, antiForgeryTokenID);
            numSaved += result;
        }
    }

    //Close modal
    $("#ProgressionModal").modal("hide");

    numErrors = numProgressedStudents - numSaved;
    if (numStudents === 0) {
        doErrorModal("Error Saving Progression (NSR: No Students Retrieved)", "Sorry an error occurred saving the progression of the learners.<br />Please try again.");
    }
    else if (numProgressedStudents === 0) {
        doErrorModal("Error Saving Progression (NSS: No Students Selected)", "No students were selected for progression.<br />Please review your selection and retry.");
    }
    else if (numSaved !== numProgressedStudents) {
        doErrorModal("Error Saving Progression (NAS: Not All Saved)", "Sorry an error occurred saving the progression for <strong>" + numErrors + "</strong> of the <strong>" + numProgressedStudents + "</strong> learners.<br />Please review the data and retry.");
    }
    else {
        doModal("Progressions Successfully Saved", "Progression data has been successfully recorded for all <strong>" + numProgressedStudents + "</strong> learners.");
    }
}

function saveProgression(system, academicYear, studentRef, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID, antiForgeryTokenID) {
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