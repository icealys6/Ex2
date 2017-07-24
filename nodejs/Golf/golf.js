window.GolfApp = (function (window, document, undefined) {
    'use strict';

    var app = {};
    var setRows = {};
    var setCols = {};

    app.$players = [];

    app.tableRows = [0, 1, 2];

    app.holeData = [
        'Holes', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'Out', 10, 11, 12, 13, 14, 15, 16, 17, 18, 'In', 'Total'
    ];

    app.tee = [
        'Tee 3', 480, 150, 359, 320, 348, 380, 337, 187, 323, 2884, 337, 391, 166, 409, 136, 518, 348, 383, 459, 3147, 6031
    ];

    app.par = [
        'Par', 5, 3, 4, 4, 4, 4, 4, 3, 4, 35, 4, 4, 3, 4, 3, 5, 4, 4, 5, 36, 71
    ];

    app.tControls = [
        '<input type="button" id="generate_data" value="Generate Test Data">',
        '<input type="button" id="add_player" value="Add Player">',
    ];

    app.bControls = [
        '<input type="button" id="reset_values" value="Reset Values">',
        '<input type="submit">',
    ];

    app.cache = function () {
        app.form = document.getElementById('scoreform');
        app.table = document.getElementById('scoreCard');
        app.top_controls = document.getElementById('top_controls');
        app.bottom_controls = document.getElementById('bottom_controls');
    };

    app.init = function () {
        app.cache();

        app.init_controls();
        app.init_table();

        app.form.addEventListener("submit", function (e) {
            e.preventDefault();
            app.calculate_scores();
        });

        document.getElementById("reset_values").addEventListener("click", function (e) {
            app.trigger_reset(e);
        });

        document.getElementById("generate_data").addEventListener("click", function (e) {
            app.generate_data(e);
        });

        document.getElementById("add_player").addEventListener("click", function (e) {
            app.add_player(e);
        });
    };

    app.add_player = function (e) {
        e.preventDefault();
        var player = prompt("Enter Player Name: ");
        if (player != null) {
            app.$players.push(player);
            app.tableRows.push(player);
        }

        app.initPlayer(player);
    };

    app.initPlayer = function (playerName) {
        var playerRow = app.table.insertRow();
        playerRow.className = 'player player_' + playerRow.rowIndex;
        for (var d = 0; d < app.par.length; d++) {
            app.loopInputs(setCols[d], playerRow, app.par, d, playerName);
        }
    };

    app.init_controls = function () {

        app.createControl(app.top_controls, app.tControls);

        app.createControl(app.bottom_controls, app.bControls);

    };

    app.createControl = function (container, data) {
        var html = "";
        for (var i = 0; i < data.length; i++) {
            html += '<div class="col col-' + i + '">';
            html += data[i];
            html += '</div>';
        }
        container.innerHTML = html;
    };

    app.init_table = function () {

        for (var mc = 0; mc < app.tableRows.length; mc++) {
            setRows[mc] = app.table.insertRow(mc);
            if (mc == 0) { //holes
                setRows[mc].className = "green";
                for (var i = 0; i < app.holeData.length; i++) {
                    app.loopRows(setCols[i], setRows[mc], app.holeData, i);
                }
            }
            if (mc == 1) { // tees
                setRows[mc].className = "blue";
                for (var i = 0; i < app.tee.length; i++) {
                    app.loopRows(setCols[i], setRows[mc], app.tee, i);

                }
            }
            if (mc == 2) { // par
                setRows[mc].className = "grey";
                for (var i = 0; i < app.par.length; i++) {
                    app.loopRows(setCols[i], setRows[mc], app.par, i);
                }
            }
            if (mc == 3) { // players
                //app.initPlayer(setRows, setCols, mc);
            }
        }
    };

    app.loopRows = function (col, row, data, count) {
        col = row.insertCell(count);
        if (typeof data[count] != "undefined") {
            col.innerHTML = data[count];
        }
    };

    app.loopInputs = function (col, row, data, count, playerName) {
        col = row.insertCell(count);

        switch (count) {
            case 0:
                col.innerHTML = playerName;
                break;
            case 10:
                col.innerHTML = '<input class="numb calc_nine" type="number" class="front-nine" disabled="disabled" />';
                break;
            case 20:
                col.innerHTML = '<input class="numb calc_back" type="number" class="back-nine" disabled="disabled" />';
                break;
            case 21:
                col.innerHTML = '<input class="numb calc_total" type="number" class="total" disabled="disabled" />';
                break;
            default:
                col.innerHTML = '<input class="numb" type="number" data-par="' + app.par[count] + '" data-hole="' + app.holeData[count] + '" min="0" />';
                break;
        }
    };

    app.loop_through_player_inputs = function (noDisabled, callback) {
        var playerRows = document.getElementsByClassName('player');
        for (var d = 0; d < playerRows.length; d++) {
            var inputs = playerRows[d].getElementsByClassName("numb");
            for (var i = 0; i < inputs.length; i++) {
                if(noDisabled) {
                    if (inputs[i].disabled == false) {
                        callback(inputs[i], i);
                    }
                } else {
                    callback(inputs[i], i);
                }
            }
        }
    };

    app.generate_data = function (e) {
        e.preventDefault();

        app.loop_through_player_inputs(true, function (input) {
            input.value = Math.floor(Math.random() * 8) + 1;
        });
    };

    app.trigger_reset = function (e) {
        e.preventDefault();
        if (confirm("Are you sure?")) {
            app.loop_through_player_inputs(false, function (input) {
                if (app.hasClass(input, 'fixed')) {
                    input.className = "numb";
                }
                input.value = "";
            });
        }
    };

    /*
     For Par 5, worst score is 8
     Par 3 and 4, worst score is 7
     */
    app.calculate_scores = function () {
        app.adjust_scores();
        app.calculate_score();
    };

    app.adjust_scores = function () {
        app.loop_through_player_inputs(true, function (input) {
            // @todo This doesn't work.
            // if (input.value == '') {
            //     alert("Please fill in all scores.");
            //     return;
            // }

            if (input.dataset.par == 5 && input.value > 8) {
                input.value = 8;
                input.className += " fixed";
            }

            if (input.dataset.par == 4 && input.value > 7) {
                input.value = 7;
                input.className += " fixed";
            }

            if (input.dataset.par == 3 && input.value > 7) {
                input.value = 7;
                input.className += " fixed";
            }
        });
    };

    app.calculate_score = function () {
        var playerRows = document.getElementsByClassName('player');

        for (var d = 0; d < playerRows.length; d++) {
            var front_nine_score = playerRows[d].getElementsByClassName('calc_nine')[0];
            var back_nine_score = playerRows[d].getElementsByClassName('calc_back')[0];
            var total_score = playerRows[d].getElementsByClassName('calc_total')[0];

            var inputs = playerRows[d].getElementsByClassName("numb");

            var score = parseInt(0);
            for (var i = 0; i < inputs.length; i++) {
                if (i == 10) {
                    front_nine_score.value = score;
                    score = 0;
                }

                if (i == 19) {
                    back_nine_score.value = score;
                    score = 0;
                }

                if (i == 20) {
                    total_score.value = parseInt(front_nine_score.value) + parseInt(back_nine_score.value);
                }

                if (inputs[i].disabled == false) {
                    score += parseInt(inputs[i].value);
                }
            }
        }


    };

    app.hasClass = function (element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    };

    document.addEventListener("DOMContentLoaded", function () {
        app.init();
    });

    return app;

})(window, document);