'use strict';

var app = angular.module('renameApp', [ ]);

app.controller('renameController', function() {
    this.products = gems;
});

app.controller('renameDifferentController', ['$scope', '$http', function($scope, $http) {
  // does nothing atm
}]);




var myApp;
myApp = myApp || (function () {
    var pleaseWaitDiv = $('<div class="modal hide" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false"><div class="modal-header"><h1>Processing...</h1></div><div class="modal-body"><div class="progress progress-striped active"><div class="bar" style="width: 60%;"></div></div></div></div>');
    return {
        showPleaseWait: function () {
            pleaseWaitDiv.modal('show');
        },
        hidePleaseWait: function () {
            pleaseWaitDiv.modal('hide');
        }
    };
})();

// Current prefix
var prefix;

// DataTables variable
var routes_table, history_table;

// table content for particular prefix
var prefix_data;

// array of peers
var all_peers = []

// Origin AS of Prefix
var originAS

// show panel with and icon
$(document).ready(function () {
    $("#aggregation_panel").show(500);
    $("#icon").show(1000);
    $.getJSON("http://odl-dev.openbmp.org:8001/db_rest/v1/peer", function (json) {
        all_peers = json.v_peers.data;
        $("#peer_selector").append('<option value="' + 0 + '">All peers</option>');
        for (var i = 1; i <= all_peers.length; i++) {
            $("#peer_selector").append('<option value="' + i + '">' + all_peers[i - 1].RouterName + ' \t ' + all_peers[i - 1].PeerName + '</option>');
        }
    });
});

//One more function for proceeding
$.fn.gotoAnchor = function (anchor) {
    location.href = this.selector;
}

//Load! button pressed
$("#peer_submit").click(function () {

    myApp.showPleaseWait();

    $("#rib_history_container").hide(100);

    if ($.fn.dataTable.isDataTable('#rib_history_table')) {
        history_table.destroy();
    }

    var request = 'http://odl-dev.openbmp.org:8001/db_rest/v1/rib/history/' + prefix;
    if ($('#peer_selector').val() != 0) {
        request += '?where=PeerName="' + all_peers[$('#peer_selector').val() - 1].PeerName + '"%20and%20RouterName="' + all_peers[$('#peer_selector').val() - 1].RouterName + '"';
    }

    console.log($('#peer_selector').val());

    console.log(request);

    var loaded = 0

    history_table = $('#rib_history_table').DataTable({
        "ajax": { "url": request,
            "dataSrc": function (json) {
                // if (!jQuery.isEmptyObject(json)) {
                //if (json.v_routes_history.size != 0) {
                prefix_data = json.v_routes_history.data
                //loaded = 1
                //} else {
                //$("#dem").show(500);
                //}
                //;
                //} else {
                //   $("#dbina").show(500);
                //}

                return prefix_data;
            }
        },
        "fnInitComplete": function () {
            //if (loaded == 1) {
            $("#rib_history_container").show(500);
            $('#rib_history_table_anchor').gotoAnchor();


            /// ------------------------------------------------>
            var cells = [];
            var rows = $("#rib_history_table").dataTable().fnGetNodes();

            // get array
            for(var r = 0; r < prefix_data.length; r++) {
                cells.push($(rows[r]).find("td:eq(3)").text());
            }

            // process
            for (var r = 1; r < prefix_data.length; r++) {
                //cells.push($(rows[r-1]).find("td:eq(4)").html()));
                $('#rib_history_table').dataTable().fnUpdate(diffString(cells[r - 1], cells[r]), r, 3);
            }
            myApp.hidePleaseWait();
        },
        "columns": [
            { "data": "RouterName",
                "sWidth": "10%"},
            { "data": "PeerName",
                "sWidth": "10%"},
            { "data": "NH" },
            { "data": "AS_Path" },
            { "data": "ASPath_Count" },
            { "data": "PeerASN" },
            { "data": "MED" },
            { "data": "Communities" },
            { "data": "LastModified" }
        ],
        "scrollCollapse": true,
        "paging": true,
        "info": true
    });

});

// Counter
var counter = 0;

// stop progress bar and show data
function stopBar() {
    if (counter == 1) {
        console.log("stopBar()");
        $("#routes_table_title").text("All entries for prefix " + prefix + " stored in DB");
        $("#rib_history_table_title").text("History of prefix: " + prefix);
        $("#progress_bar").hide(100);
        $("#routes_analysis").show(500);
        $("#rib_history").show(500);
    }
}


//Get it! button pressed
$("#as_submit").click(function () {

    prefix = $('#prefix_number').val();

    console.log(prefix);

    counter = 0;

    $("#rib_history_container").hide(100);
    $("#dem").hide(100);
    $("#dbina").hide(100);

    $("#routes_analysis").hide();
    $("#aggregated_analysis").hide();

    $("#analysis_tables").hide(500);

    $("#progress_bar").show(500);


    if ($.fn.dataTable.isDataTable('#routes_table')) {
        routes_table.destroy();
    }

    var prefix_info_request = "http://odl-dev.openbmp.org:8001/db_rest/v1/rib/prefix/" + prefix;

    console.log(prefix_info_request);


    routes_table = $('#routes_table').DataTable({
        "ajax": { "url": prefix_info_request,
            "dataSrc": function (json) {
                if (!jQuery.isEmptyObject(json)) {
                    if (json.v_routes.size != 0) {
                        prefix_data = json.v_routes.data
                        counter = 1
                        originAS = json.v_routes.data[0].Origin_AS
                    } else {
                        $("#progress_bar").hide(100);
                        $("#dem").show(500);
                    }
                    ;
                } else {
                    $("#progress_bar").hide(100);
                    $("#dbina").show(500);
                }

                return prefix_data;
            }
        },
        "fnInitComplete": function () {
            var whois;
            // get whois
            jQuery.ajax({
                url: 'http://odl-dev.openbmp.org:8001/db_rest/v1/whois/asn/' + originAS,
                success: function (result) {
                    whois = result.gen_whois_asn.data[0];
                },
                async: false
            });
            console.log(whois);

            //get keys of whois dictionary
            var whois_keys = Object.keys(whois);

            var str = '<table class="table table-striped  cursor"><thead><tr><th>AS Information</th></tr></thead><tbody>';
            //
            for (var j = 0; j < whois_keys.length; j++) {
                if ((whois_keys[j] != "raw_output") && (whois_keys[j] != "remarks")) {
                    str += '<tr>' + '<td>' + whois_keys[j] + '</td>' + '<td class="text-left">' + whois[whois_keys[j]] + '</td>' + '</tr>';
                }
            }
            str += '</tbody></table>';

            $("#whois_data_container").html(str);


            /*// highlight

             for (var i = 0; i < rows.length; i++) {
             ///Get HTML of 3rd column (for example)
             cells.push($(rows[i]).find("td:eq(4)").html());
             //rows[i].find("td:eq(4)").html("qwerty");
             console.log(rows[i]);
             }


             console.log(cells);*/

            stopBar();
        },
        "columns": [
            { "data": "RouterName" },
            { "data": "PeerName" },
            { "data": "NH" },
            { "data": "AS_Path" },
            { "data": "ASPath_Count" },
            { "data": "PeerASN" },
            { "data": "MED" },
            { "data": "Communities" },
            { "data": "LastModified" }
        ],
        "scrollCollapse": true,
        "paging": true,
        "info": true
    });

});

// diffString

function escape(s) {
    var n = s;
    n = n.replace(/&/g, "&amp;");
    n = n.replace(/</g, "&lt;");
    n = n.replace(/>/g, "&gt;");
    n = n.replace(/"/g, "&quot;");

    return n;
}

function diffString(o, n) {
    o = o.replace(/\s+$/, '');
    n = n.replace(/\s+$/, '');

    var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/));
    var str = "";

    var oSpace = o.match(/\s+/g);
    if (oSpace == null) {
        oSpace = ["\n"];
    } else {
        oSpace.push("\n");
    }
    var nSpace = n.match(/\s+/g);
    if (nSpace == null) {
        nSpace = ["\n"];
    } else {
        nSpace.push("\n");
    }

    if (out.n.length == 0) {
        for (var i = 0; i < out.o.length; i++) {
            str += '<del>' + escape(out.o[i]) + oSpace[i] + "</del>";
        }
    } else {
        if (out.n[0].text == null) {
            for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
                str += '<del>' + escape(out.o[n]) + oSpace[n] + "</del>";
            }
        }

        for (var i = 0; i < out.n.length; i++) {
            if (out.n[i].text == null) {
                str += '<ins>' + escape(out.n[i]) + nSpace[i] + "</ins>";
            } else {
                var pre = "";

                for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
                    pre += '<del>' + escape(out.o[n]) + oSpace[n] + "</del>";
                }
                str += " " + out.n[i].text + nSpace[i] + pre;
            }
        }
    }

    return str;
}

function randomColor() {
    return "rgb(" + (Math.random() * 100) + "%, " +
            (Math.random() * 100) + "%, " +
            (Math.random() * 100) + "%)";
}
function diffString2(o, n) {
    o = o.replace(/\s+$/, '');
    n = n.replace(/\s+$/, '');

    var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/));

    var oSpace = o.match(/\s+/g);
    if (oSpace == null) {
        oSpace = ["\n"];
    } else {
        oSpace.push("\n");
    }
    var nSpace = n.match(/\s+/g);
    if (nSpace == null) {
        nSpace = ["\n"];
    } else {
        nSpace.push("\n");
    }

    var os = "";
    var colors = new Array();
    for (var i = 0; i < out.o.length; i++) {
        colors[i] = randomColor();

        if (out.o[i].text != null) {
            os += '<span style="background-color: ' + colors[i] + '">' +
                    escape(out.o[i].text) + oSpace[i] + "</span>";
        } else {
            os += "<del>" + escape(out.o[i]) + oSpace[i] + "</del>";
        }
    }

    var ns = "";
    for (var i = 0; i < out.n.length; i++) {
        if (out.n[i].text != null) {
            ns += '<span style="background-color: ' + colors[out.n[i].row] + '">' +
                    escape(out.n[i].text) + nSpace[i] + "</span>";
        } else {
            ns += "<ins>" + escape(out.n[i]) + nSpace[i] + "</ins>";
        }
    }

    return { o: os, n: ns };
}

function diff(o, n) {
    var ns = new Object();
    var os = new Object();

    for (var i = 0; i < n.length; i++) {
        if (ns[ n[i] ] == null)
            ns[ n[i] ] = { rows: new Array(), o: null };
        ns[ n[i] ].rows.push(i);
    }

    for (var i = 0; i < o.length; i++) {
        if (os[ o[i] ] == null)
            os[ o[i] ] = { rows: new Array(), n: null };
        os[ o[i] ].rows.push(i);
    }

    for (var i in ns) {
        if (ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1) {
            n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
            o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
        }
    }

    for (var i = 0; i < n.length - 1; i++) {
        if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null &&
                n[i + 1] == o[ n[i].row + 1 ]) {
            n[i + 1] = { text: n[i + 1], row: n[i].row + 1 };
            o[n[i].row + 1] = { text: o[n[i].row + 1], row: i + 1 };
        }
    }

    for (var i = n.length - 1; i > 0; i--) {
        if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null &&
                n[i - 1] == o[ n[i].row - 1 ]) {
            n[i - 1] = { text: n[i - 1], row: n[i].row - 1 };
            o[n[i].row - 1] = { text: o[n[i].row - 1], row: i - 1 };
        }
    }

    return { o: o, n: n };
}