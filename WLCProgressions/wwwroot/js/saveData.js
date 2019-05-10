function recordDestination(system, academicYear, studentRef, destination) {
    let antiForgeryTokenID = $("#AntiForgeryTokenID").val();

    let destinationURL = "";

    if (system !== null) {
        destinationURL = "/Students/SetDestination/" + studentRef + "?system=" + system;
    }
    else {
        destinationURL = "/Students/SetDestination/" + studentRef;
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
            'Student.DestinationCode': destination,
            '__RequestVerificationToken': antiForgeryTokenID
        },
        success: function (data) {
            var audio = new Audio("/sounds/confirm.wav");
            audio.play();
            console.log("Destination '" + destination + "' recorded for " + studentRef + ' in Academic Year ' + academicYear + ' in ' + system + ' system');
        },
        error: function (error) {
            doCrashModal(error);
            console.error("Destination '" + destination + "' could not be recorded for " + studentRef + ' in Academic Year ' + academicYear + ' in ' + system + ' system');
        }
    });
}

async function saveProgressions(system, academicYear, students, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID) {
    var antiForgeryTokenID = $("#AntiForgeryTokenID").val();
    var numStudents = 0;
    var numProgressedStudents = 0;
    var numSaved = 0;
    var numErrors = 0;
    var studentRef = "0";

    for (let student in students) {
        numStudents += 1;

        studentRef = students[student].studentRef;
        progressLearner = students[student].progressLearner;

        if (studentRef <= "0") {
            console.log("Error saving progression for student " + studentRef + " to course " + courseToID + ", group " + groupToID + ' in ' + system + ' system');
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
        doErrorModal("Error Saving Progression (NAS: Not All Saved)", "Sorry an error occurred saving the progression for <strong>" + numErrors + "</strong> of the <strong>" + numStudents + "</strong> learners.<br />Please review the data and retry.");
    }
    else {
        doModal("Progressions Successfully Saved", "Progression data has been successfully recorded for all <strong>" + numProgressedStudents + "</strong> learners.");
    }
}

function saveProgression(system, academicYear, studentRef, courseFromID, groupFromID, courseToID, groupToID, progressionType, offerTypeID, offerConditionID, antiForgeryTokenID) {
    return new Promise(resolve => {
        var numSaved = 0;
        var numErrors = 0;

        let progressionURL = "";

        if (system !== null) {
            progressionURL = "/Students/SaveProgression/" + studentRef + "?system=" + system;
        }
        else {
            progressionURL = "/Students/SaveProgression/" + studentRef;
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
                console.log("Progression for '" + studentRef + "' saved for course " + courseToID + ", group " + groupToID + ' in ' + system + ' system');
                numSaved += 1;
                resolve(1);
            },
            error: function (error) {
                doCrashModal(error);
                console.log("Error saving progression for '" + studentRef + "' for course " + courseToID + ", group " + groupToID + ' in ' + system + ' system');
                numErrors += 1;
                //reject(0);
                resolve(0);
            }
        }); 
    });
}