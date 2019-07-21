'use strict';

$(function () {
    // Scrape website for new stories using GET request and render stories
    $.get('/api/v2/scrape')
        .then(function (res) {
            if (res.message !== 'No new stories') {
                var storiesLength = res.length;

                for (var i = 0; i < storiesLength; i++) {
                    var stories = $('.story-list');
                    var listItem = $('<li>');
                    var anchor = $('<a>');
                    var button = $('<button>');
                    var icon = $('<i>');

                    anchor.text(res[i].title)
                        .addClass('story-link')
                        .attr('href', res[i].link)
                        .attr('target', '_blank');

                    icon.addClass('far fa-star');

                    button.addClass('save-btn')
                        .attr('type', 'button')
                        .attr('data-id', res[i]._id)
                        .attr('data-save', 'false')
                        .append(icon);

                    listItem.append(anchor)
                        .append(button);

                    stories.prepend(listItem);
                }
            }
        });

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

    $('.remove-btn').on('click', function () {
        event.preventDefault();

        var _id = $(this).attr('data-id');
        var story = { bookmark: false };

        // Update save state to false using POST request and removes story from view
        $.post('/api/stories/' + _id, story)
            .then(function (res) {
                return $('[data-id=' + res._id + ']')
                    .parent() // Resolve addition of new <div> wrapping story
                    .parent()
                    .remove();
            });
    });

    $('.submit-btn').on('click', function () {
        event.preventDefault();

        var comment = {
            author: $(this).parent().find('.author').val().trim(),
            text: $(this).parent().find('.comment').val().trim(),
            story: $(this).parent().attr('data-story')
        }

        if (comment.author === '') {
            comment.author = 'Anonymous';
        }

        // Create comment using POST request and render comment
        $.post('/api/comments', comment)
            .then(function (res) {
                var comments = $('#story-' + res.story).find('.comment-list');
                var listItem = $('<li>');
                var heading = $('<h6>');
                var paragraph = $('<p>');

                paragraph.text(res.text);
                heading.text(res.author);

                listItem.append(heading).append(paragraph);
                comments.append(listItem);

                return $('[data-story=' + res.story + ']')[0].reset();
            });
    });
});