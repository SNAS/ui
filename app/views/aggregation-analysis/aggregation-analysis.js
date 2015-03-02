'use strict';

var app = angular.module('renameApp', [ ]);

app.controller('renameController', function() {
    this.products = gems;
});

app.controller('renameDifferentController', ['$scope', '$http', function($scope, $http) {
  // does nothing atm
}]);



// loading flag
var counter = 0

// DataTables Variable
var routes_table, aggregated_table, prefixes_modal_table;

// ASN
var ASN

// Amount of Prefixes, originated by this AS
var prefix_amount

// Reduced prefix amount
var reduced_prefix_amount

//Array of all prefixes, originated by AS
var all_prefixes_of_as;

//Array of Peers
var all_peers = [];

//Array of prefixes, originated b this particular AS and from particlural Peer
var prefixes_of_as_and_peer = [];

//Array of agregated prefixes
var aggregated_prefixes = [];

//Proceed to current id
function goToByScroll(id) {
    $('html,body').animate({scrollTop: $("#" + id).offset().top}, 'slow');
}

//One more function for proceeding
$.fn.gotoAnchor = function (anchor) {
    location.href = this.selector;
}

// stop progress bar and show data
function stopBar() {
    if (counter == 1) {
        $("#routes_table_title").text("Prefixes, originated by " + ASN);
        $("#aggregated_table_title").text("Aggregate prefixes, originated by " + ASN);
        $("#progress_bar").hide(100);
        $("#routes_analysis").show(500);
        $("#aggregated_analysis").show(500);

        $('#prefixes_table_anchor').gotoAnchor();
    }
}

// show panel with and icon
$(document).ready(function () {
    $("#aggregation_panel").show(500);
    $("#icon").show(1000);
    $.getJSON("http://odl-dev.openbmp.org:8001/db_rest/v1/peer", function (json) {
            all_peers = json.v_peers.data;
            for (var i = 0; i < all_peers.length; i++) {
                $("#peer_selector").append('<option value="' + i + '">' + all_peers[i].RouterName + ' \t ' + all_peers[i].PeerName + '</option>');
            }
    });
});

//Load! button pressed
$("#peer_submit").click(function () {
    $("#aggregated_container").hide(100);
    aggregated_array = [];
    reduced_prefix_amount = 0;
    if ($.fn.dataTable.isDataTable('#aggregated_table')) {
        aggregated_table.destroy();
    }
    ;
    var request = 'http://odl-dev.openbmp.org:8001/db_rest/v1/rib/asn/' + ASN +
            '?where=PeerName="' +
            all_peers[$('#peer_selector').val()].PeerName + '"%20and%20RouterName="' + all_peers[$('#peer_selector').val()].RouterName + '"&limit=' + prefix_amount;
    $.getJSON(request, function (data) {
        prefixes_of_as_and_peer = data.v_routes.data;
        aggregatePrefixes(prefixes_of_as_and_peer);
    });
});

//Compare two addresses
function compare(a, b, j) {
    if (ipToBinary(a.Prefix).substring(0, a.PrefixLen) == ipToBinary(b.Prefix).substring(0, a.PrefixLen)) {
        if ((a.Origin == b.Origin) & (a.AS_Path == b.AS_Path) & (a.Communities == b.Communities) & (a.ExtCommunities == b.ExtCommunities) & (a.MED == b.MED)) {
            reduced_prefix_amount++;
            key = a.Prefix + '/' + a.PrefixLen;
            value = b.Prefix + '/' + b.PrefixLen;
            var t = 0, found = 0;
            while (( !found ) && ( t < aggregated_prefixes.length )) {
                if (aggregated_prefixes[t].Prefix == key) {
                    aggregated_prefixes[t].Covers = aggregated_prefixes[t].Covers + "; " + value;
                    found = true;
                }
                t++;
            }
            if (!found) {
                element = {
                    "Prefix": key,
                    "Covers": value
                }
                aggregated_prefixes.push(element);
            }
            auxiliary_array[j] = true;

            console.log(ipToBinary(a.Prefix) + " and " + ipToBinary(b.Prefix));

        }
    }
}

//Transform string ip adress to binary view
function ipToBinary(ip) {
    var d = ip.split('.');
    return toBinaryStr(d[0]) + toBinaryStr(d[1]) + toBinaryStr(d[2]) + toBinaryStr(d[3]);
}

function toBinaryStr(d) {
    var y = parseInt(d).toString(2);
    while (y.length < 8) {
        y = "0" + y;
    }
    return y;
}

$(".modal-wide").on("show.bs.modal", function() {
    var height = $(window).height() - 200;
    $(this).find(".modal-body").css("max-height", height);
});


// Aggregate Prefixes, draws data in the table
function aggregatePrefixes(data) {

    aggregated_prefixes = [];
    auxiliary_array = [];

    for (var i = 0; i < data.length; i++) auxiliary_array[i] = false;

    data.sort(function (a, b) {
        return a.PrefixLen - b.PrefixLen
    });


    for (var i = 0; i < data.length - 1; i++) {
        if ((!auxiliary_array[i]) && (data[i].isPeerIPv4 == 1)) {
            for (var j = i + 1; j < data.length; j++) {
                if ((data[j].isPeerIPv4 == 1) && (!auxiliary_array[j])) {
                    compare(data[i], data[j], j);
                }
            }
        }
    }

    aggregated_table = $('#aggregated_table').DataTable({
        "data": aggregated_prefixes,
        "fnInitComplete": function () {
            $("#aggregated_analysis").show(500);
        },
        "columns": [
            { "data": "Prefix" },
            { "data": "Covers" }
        ],
        "scrollCollapse": true,
        "paging": true,
        "oLanguage": {
            "sEmptyTable": "This peer has no information regarding AS" + ASN,
            "sInfo": "Total _TOTAL_ aggregation prefixes, showing (_START_ to _END_)"
        },
        "pagingType": "full_numbers",
        "dom": '<"top"f>rt<"bottom"ipl><"clear">'
    });


    $('#aggregated_table tbody').on('click', 'tr', function () {
        var name = $('td', this).eq(0).text();
        $("#prefix_info_label").html('Prefix:   ' + name + ';       proceed to <a href="/prefixanalysis">Prefix Analysis</a>');


        if ($.fn.dataTable.isDataTable('#prefixes_modal_table')) {
            prefixes_modal_table.destroy();
        }

        var prefix_info_request = "http://odl-dev.openbmp.org:8001/db_rest/v1/rib/prefix/" + name;

        console.log(prefix_info_request);

        prefixes_modal_table  = $('#prefixes_modal_table').DataTable({
            "ajax": { "url": prefix_info_request,
                "dataSrc": function (json) {
                    return json.v_routes.data;
                }
            },
            "fnInitComplete": function () {
                console.log("Completed");
                $('#prefix_info').modal('show');
            },
            "columns": [
                { "data": "RouterName" },
                { "data": "PeerName" },
                { "data": "PeerAddress" },
                { "data": "NH" },
                { "data": "AS_Path" },
                { "data": "ASPath_Count" },
                { "data": "PeerASN" },
                { "data": "LastModified" }
            ],
            "scrollCollapse": true,
            "paging": true,
            "info": true,
            "dom": '<"top">rt<"bottom"fipl><"clear">'
        });

    });

    var percentage = 100 * (reduced_prefix_amount / prefix_amount) + "";
    var position = percentage.indexOf(".");
    var efficiency;
    var eff;
    if (position != -1) {
        efficiency = percentage.substring(0, position + 3);
        eff = percentage.substring(0, position);
    } else {
        efficiency = percentage;
        eff = efficiency;
    }
    console.log(efficiency);
    console.log(eff);

    $("#aggregation_efficiency_summary").text("Efficiency of aggregation: " + efficiency + "%   ( " + prefix_amount + " - " + reduced_prefix_amount + " = " + (prefix_amount - reduced_prefix_amount) + " prefixes )");

    $("#aggregated_container").show();
    $('#aggregated_table_anchor').gotoAnchor();


    $(function () {
        $('#aggregation_efficiency_chart').highcharts({
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                }
            },
            title: {
                text: 'Efficiency of aggregation'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 35,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }
            },
            series: [
                {
                    type: 'pie',
                    name: 'aggregation efficiency',
                    data: [
                        ['Unaggregatable Prefixes', 100 * (100 - efficiency)],
                        {
                            name: 'Aggregatable Prefixes',
                            y: 100 * efficiency,
                            sliced: true,
                            selected: true
                        }
                    ]
                }
            ]
        });
    });


    return data
}

//Get it! button pressed
$("#as_submit").click(function () {

    ASN = $('#as_number').val();

    if (jQuery.isNumeric(ASN)) {

        counter = 0;

        $("#aggregated_container").hide(100);
        $("#dem").hide(100);
        $("#dbina").hide(100);

        $("#routes_analysis").hide();
        $("#aggregated_analysis").hide();

        $("#analysis_tables").hide(500);

        $("#progress_bar").show(500);


        if ($.fn.dataTable.isDataTable('#routes_table')) {
            routes_table.destroy();
        }

        var rib_asn_count = "http://odl-dev.openbmp.org:8001/db_rest/v1/rib/asn/" + ASN + "/count";
        $.getJSON(rib_asn_count, function (data) {
            prefix_amount = data[""].data[0].PrefixCount;
            var rib_asn = "http://odl-dev.openbmp.org:8001/db_rest/v1/rib/asn/" + ASN + "?limit=" + prefix_amount;

            routes_table = $('#routes_table').DataTable({
                "ajax": { "url": rib_asn,
                    "dataSrc": function (json) {
                        if (!jQuery.isEmptyObject(json)) {
                            if (json.v_routes.size != 0) {
                                all_prefixes_of_as = json.v_routes.data
                                counter = 1
                            } else {
                                $("#progress_bar").hide(100);
                                $("#dem").show(500);
                            }
                            ;
                        } else {
                            $("#progress_bar").hide(100);
                            $("#dbina").show(500);
                        }

                        return all_prefixes_of_as;
                    }
                },
                "fnInitComplete": function () {
                    stopBar();
                },
                "columns": [
                    { mData: null,
                        mRender: function (data, type, row) {
                            return row.Prefix + '/' + row.PrefixLen;
                        }
                    },
                    { "data": "RouterName" },
                    { "data": "PeerName" }
                ],
                "scrollCollapse": true,
                "paging": true,
                "info": true
            });

        });

    }
});