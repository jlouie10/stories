'use strict';

$(function () {
    $('.save-btn').on('click', function () {
        event.preventDefault();

        var _id = $(this).attr('data-id');
        var save = $(this).attr('data-save');
        var story = {};

        if (save === 'true') {
            story.bookmark = false;
        } else {
            story.bookmark = true;
        }

        // Update save state using POST request
        $.post('/api/stories/' + _id, story)
            .then(function (res) {
                var attrSelector = '[data-id=' + res._id + ']';
                var button = $(attrSelector);
                var icon = $(attrSelector + ' i');

                if (res.bookmark === true) {
                    button.attr('data-save', 'true');
                    icon.removeClass('far').addClass('fas');
                } else {
                    button.attr('data-save', 'false');
                    icon.removeClass('fas').addClass('far');
                }
            });
    });
});