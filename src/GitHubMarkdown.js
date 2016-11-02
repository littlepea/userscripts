// ==UserScript==
// @name         GitHub Markdown
// @version      0.1
// @description  Adds markdown representation for GitHub entities which can be copied into wikis. Example: [Git Commit: dc94bb4 - update README](https://github.com/org/repo/commit/dc94bb4)
// @author       Evgeny Demchenko
// @match        https://github.com/*/*/*
// @require		 https://code.jquery.com/jquery-3.1.1.min.js
// @website		https://github.com/littlepea/userscripts
// ==/UserScript==

(function() {
    'use strict';

    var DEBUG = false;

    function log(msg) {
        if( DEBUG === false ) {
            return;
        }

        console.log(msg);
    }

    function getContent(markdown) {
        log(markdown);
        var content = [
            '<div class="float-right" style="margin-right:20px;">',
            'Markdown: ',
            '<input id="markdown-text" type="text" value="',
            markdown,
            '"/>',
            ' <a id="markdown-copy" href="#">copy</a>',
            '</div>'
        ];
        return content.join('');
    }

    function parseURL(separator, length) {
        var url = {};
        var parts = window.location.href.split(separator);
        var repoURL = parts[0];
        var id = parts[1].split('/')[0].substring(0, length);
        return {
            'repoUrl': repoURL,
            'id': id,
            'url': [repoURL, id].join(separator)
        };
    }

    function cleanTitle(title) {
        return title.replace(/#\d+\s+/mg, '').replace(/[,]?\s+time:\d+/mg, '').trim();
    }

    function getPRTitle() {
        var title = $('.js-issue-title').text();
        return cleanTitle(title);
    }

    function getPullRequestMarkdown() {
        var PR = parseURL('/pull/', 4);
        log(PR);
        return ['[Pull Request on GitHub: #', PR.id, ' - ', getPRTitle(),'](', PR.url, ')'].join('');
    }

    function getCommitTitle() {
        var title = $('.commit-title').text();
        return cleanTitle(title);
    }

    function getCommitMarkdown() {
        var commit = parseURL('/commit/', 7);
        log(commit);
        return ['[Git Commit: ', commit.id, ' - ', getCommitTitle(),'](', commit.url, ')'].join('');
    }

    function selectMarkdownText() {
        $('#markdown-text').select();
    }

    function copyMarkdown(e) {
        e.stopPropagation();
        selectMarkdownText();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            log('Copying text command was ' + msg);
        } catch (err) {
            log('Oops, unable to copy');
        }

        return false;
    }

    function init() {
        log('init();');
        var content;
        var url = window.location.href;

        if( url.indexOf('/pull/') > 0 ) {
            log('PR');
            content = getContent(getPullRequestMarkdown());
            $('.TableObject-item--primary').append(content);
        } else if( url.indexOf('/commit/') > 0 ) {
            log('Commit');
            content = getContent(getCommitMarkdown());
            $('#toc > .BtnGroup').after(content);
        }

        $('#markdown-text').focus(selectMarkdownText);
        $('#markdown-copy').click(copyMarkdown);
    }

    init();
})();
