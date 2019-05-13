function doModal(title, text) {
    console.log(text);

    html = '<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<h5 class="modal-title" id="confirm-modal"><i class="fas fa-info-circle"></i> ' + title + '</h5>';
    html += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
    html += '<span aria-hidden="true">&times;</span>';
    html += '</button>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<p>' + text + '</p>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<span class="btn btn-primary" data-dismiss="modal">Close</span>';
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('body').append(html);
    $("#dynamicModal").modal();
    $("#dynamicModal").modal('show');

    $('#dynamicModal').on('hidden.bs.modal', function (e) {
        $(this).remove();
    });
}

function doQuestionModal(title, text) {
    console.log(text);

    html = '<div id="dynamicQuestionModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="question-modal" aria-hidden="true">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<h5 class="modal-title" id="question-modal"><i class="fas fa-question-circle"></i> ' + title + '</h5>';
    html += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
    html += '<span aria-hidden="true">&times;</span>';
    html += '</button>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<p>' + text + '</p>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<span class="btn btn-success QuestionModal Yes" data-dismiss="modal">Yes</span>';
    html += '<span class="btn btn-danger QuestionModal No" data-dismiss="modal">No</span>';
    html += '<span class="btn btn-secondary QuestionModal Cancel" data-dismiss="modal">Cancel</span>';
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('body').append(html);
    $("#dynamicQuestionModal").modal();
    $("#dynamicQuestionModal").modal('show');

    $('#dynamicQuestionModal').on('shown.bs.modal', function (e) {
        $(".QuestionModal").click(function (event) {
            let QuestionModalAnswerID = $("#QuestionModalAnswerID");

            if ($(this).hasClass("Yes")) {
                QuestionModalAnswerID.val("Y");
            }
            else if ($(this).hasClass("No")) {
                QuestionModalAnswerID.val("N");
            }
            else if ($(this).hasClass("Cancel")) {
                QuestionModalAnswerID.val("C");
            }
            else {
                QuestionModalAnswerID.val("X");
                doErrorModal("Invalid Option", "An invalid choice was detected. Please review your selection and try again");
            }

            doQuestionModalAction();
        });
    });

    $('#dynamicQuestionModal').on('hidden.bs.modal', function (e) {
        $(this).remove();
    });
}

function doErrorModal(title, text) {
    console.log(text);

    html = '<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<h5 class="modal-title" id="customerModalLabel"><i class="fas fa-exclamation-triangle"></i> ' + title + '</h5>';
    html += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
    html += '<span aria-hidden="true">&times;</span>';
    html += '</button>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<p>An unexpected error has occurred which could indicate a defect with the system</p>';
    html += '<div class="alert alert-danger" role="alert">';
    html += '<i class="fas fa-bug"></i> ' + text;
    html += '</div>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<span class="btn btn-primary" data-dismiss="modal">Close</span>';
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('body').append(html);
    $("#dynamicModal").modal();
    $("#dynamicModal").modal('show');

    $('#dynamicModal').on('hidden.bs.modal', function (e) {
        $(this).remove();
    });

    var audio = new Audio("/sounds/error.wav");
    audio.play();
}

function doCrashModal(error) {
    var stackError = $(error.responseText).find(".stackerror").html() || "Unknown error";
    var stackTrace = $(error.responseText).find(".rawExceptionStackTrace").html() || "";
    console.log(stackTrace);

    html = '<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<h5 class="modal-title" id="customerModalLabel"><i class="fas fa-exclamation-triangle"></i> An application error has occurred</h5>';
    html += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
    html += '<span aria-hidden="true">&times;</span>';
    html += '</button>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<p>An unexpected error has occurred which could indicate a defect with the system</p>';
    html += '<div class="alert alert-danger" role="alert">';
    html += '<i class="fas fa-bug"></i> ' + stackError;
    html += '</div>';
    html += '<div class="pre-scrollable small">';
    html += '<p><code>' + stackTrace + '</code></p>';
    html += '</div>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<span class="btn btn-primary" data-dismiss="modal">Close</span>';
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('body').append(html);
    $("#dynamicModal").modal();
    $("#dynamicModal").modal('show');

    $('#dynamicModal').on('hidden.bs.modal', function (e) {
        $(this).remove();
    });

    var audio = new Audio("/sounds/error.wav");
    audio.play();
}