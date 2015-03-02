'use strict';

var app = angular.module('renameApp', [ ]);

app.controller('renameController', function() {
    this.products = gems;
});

app.controller('renameDifferentController', ['$scope', '$http', function($scope, $http) {
  // does nothing atm
}]);



$(document).ready(function () {

    setTimeout(
            function()
            {
                $("#AS_Summary_Report_panel").show(200);
            }, 1500);


    $("#as_analysis_panel").show(500);
    $("#whois_panel").show(500);
    $(".icon").show(1000);

    //Top_Transit_ASes_chart
    Top_Transit_ASes_chart_ipv4 = "http://odl-dev.openbmp.org:8001/db_rest/v1/as_stats/ipv4?topTransit=5"

    Top_Transit_ASes_chart_ipv6 = "http://odl-dev.openbmp.org:8001/db_rest/v1/as_stats/ipv6?topTransit=5"

    Top_Origin_ASes_chart_ipv4 = 'http://odl-dev.openbmp.org:8001/db_rest/v1/as_stats/ipv4?topOrigin=5'

    Top_Origin_ASes_chart_ipv6 = 'http://odl-dev.openbmp.org:8001/db_rest/v1/as_stats/ipv6?topOrigin=5'


    $.getJSON(Top_Transit_ASes_chart_ipv4, function (json) {

        var ipv4 = json.s.data;

        var transit_v4_prefixes = [];
        var orgs = [];


        //create array with amount of prefixes
        for (var i = 0; i < ipv4.length; i++) {
            transit_v4_prefixes[ipv4.length - 1 - i] = ipv4[i].transit_v4_prefixes;
            var st = ""

            if (typeof ipv4[i].as_name != 'undefined') {
                st += ipv4[i].as_name;
            }

            /*if ((typeof ipv4[i].org_name != 'undefined') && (typeof ipv4[i].as_name != 'undefined')) {
                st += ipv4[i].org_name + "; " + ipv4[i].as_name;
            } else {
                if (typeof ipv4[i].org_name != 'undefined') {
                    st += ipv4[i].org_name;
                } else {
                    st += ipv4[i].as_name;
                }

            }*/

            st += ' (AS' + ipv4[i].asn + ')'

            orgs[ipv4.length - 1 - i] = st;
        }
        console.log(transit_v4_prefixes);
        console.log(orgs);


        $('#Top_Transit_ASes_chart_ipv4').highcharts({

            chart: {
                marginBottom: 150,
                type: 'column',
                margin: 90,
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 20,
                    depth: 90
                }
            },
            title: {
                text: 'Top ASes by # of Transit Prefixes'
            },
            subtitle: {
                text: 'ipv4'
            },
            plotOptions: {
                column: {
                    depth: 25
                }
            },
            xAxis: {
                categories: orgs
            },
            yAxis: {
                title: "transit_v4_prefixes",
                opposite: true
            },
            legend: {
                enabled: false
            },
            series: [
                {
                    name: 'Transit Prefixes',
                    data: transit_v4_prefixes
                }
            ]
        });
    });

    $.getJSON(Top_Transit_ASes_chart_ipv6, function (json) {

        var ipv6 = json.s.data;

        var transit_v6_prefixes = [];
        var orgs = [];


        //create array with amount of prefixes
        for (var i = 0; i < ipv6.length; i++) {
            transit_v6_prefixes[ipv6.length - 1 - i] = ipv6[i].transit_v6_prefixes;
            var st = ""

            if (typeof ipv6[i].as_name != 'undefined') {
                st += ipv6[i].as_name;
            }

            /*if ((typeof ipv6[i].org_name != 'undefined') && (typeof ipv6[i].as_name != 'undefined')) {
                st += ipv6[i].org_name + "; " + ipv6[i].as_name;
            } else {
                if (typeof ipv6[i].org_name != 'undefined') {
                    st += ipv6[i].org_name;
                } else {
                    st += ipv6[i].as_name;
                }

            }*/

            st += ' (AS' + ipv6[i].asn + ')'

            orgs[ipv6.length - 1 - i] = st;
        }
        console.log(transit_v6_prefixes);
        console.log(orgs);


        $('#Top_Transit_ASes_chart_ipv6').highcharts({
            chart: {
                marginBottom: 150,
                type: 'column',
                margin: 90,
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 20,
                    depth: 90
                }
            },
            title: {
                text: 'Top ASes by # of Transit Prefixes'
            },
            subtitle: {
                text: 'ipv6'
            },
            plotOptions: {
                column: {
                    depth: 25
                }
            },
            xAxis: {
                categories: orgs
            },
            yAxis: {
                title: "transit_v6_prefixes",
                opposite: true
            },
            legend: {
                enabled: false
            },
            series: [
                {
                    name: 'Transit Prefixes',
                    data: transit_v6_prefixes
                }
            ]
        });
    });

    $.getJSON(Top_Origin_ASes_chart_ipv4, function (json) {

        var ipv4 = json.s.data;

        ipv4.sort(function (a, b) {
            return b.origin_v4_prefixes - a.origin_v4_prefixes
        });

        var origin_v4_prefixes = [];
        var orgs = [];


        //create array with amount of prefixes
        for (var i = 0; i < ipv4.length; i++) {
            origin_v4_prefixes[ipv4.length - 1 - i] = ipv4[i].origin_v4_prefixes;
            var st = ""

            if (typeof ipv4[i].as_name != 'undefined') {
                st += ipv4[i].as_name;
            }



            /*if ((typeof ipv4[i].org_name != 'undefined') && (typeof ipv4[i].as_name != 'undefined')) {
                st += ipv4[i].org_name + "; " + ipv4[i].as_name;
            } else {
                if (typeof ipv4[i].org_name != 'undefined') {
                    st += ipv4[i].org_name;
                } else {
                    st += ipv4[i].as_name;
                }
            }*/

            st += ' (AS' + ipv4[i].asn + ')'

            orgs[ipv4.length - 1 - i] = st;
        }
        console.log(origin_v4_prefixes);
        console.log(orgs);


        $('#Top_Origin_ASes_chart_ipv4').highcharts({
            chart: {
                marginBottom: 150,
                type: 'column',
                margin: 90,
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 20,
                    depth: 90
                }
            },
            title: {
                text: 'Top ASes by # of Originated Prefixes'
            },
            subtitle: {
                text: 'ipv4'
            },
            plotOptions: {
                column: {
                    depth: 25
                }
            },
            xAxis: {
                categories: orgs
            },
            yAxis: {
                title: "origin_v4_prefixes",
                opposite: true
            },
            legend: {
                enabled: false
            },
            series: [
                {
                    name: 'Origin Prefixes',
                    data: origin_v4_prefixes
                }
            ]
        });
    });

    $.getJSON(Top_Origin_ASes_chart_ipv6, function (json) {

        var ipv6 = json.s.data;

        ipv6.sort(function (a, b) {
            return b.origin_v6_prefixes - a.origin_v6_prefixes
        });

        var origin_v6_prefixes = [];
        var orgs = [];


        //create array with amount of prefixes
        for (var i = 0; i < ipv6.length; i++) {
            origin_v6_prefixes[ipv6.length - 1 - i] = ipv6[i].origin_v6_prefixes;
            var st = ""

            if (typeof ipv6[i].as_name != 'undefined') {
                st += ipv6[i].as_name;
            }

            /*if ((typeof ipv6[i].org_name != 'undefined') && (typeof ipv6[i].as_name != 'undefined')) {
                st += ipv6[i].org_name + "; " + ipv6[i].as_name;
            } else {
                if (typeof ipv6[i].org_name != 'undefined') {
                    st += ipv6[i].org_name;
                } else {
                    st += ipv6[i].as_name;
                }

            }*/

            st += ' (AS' + ipv6[i].asn + ')'

            orgs[ipv6.length - 1 - i] = st;
        }
        console.log(origin_v6_prefixes);
        console.log(orgs);


        $('#Top_Origin_ASes_chart_ipv6').highcharts({
            chart: {
                marginBottom: 150,
                type: 'column',
                margin: 90,
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 20,
                    depth: 90
                }
            },
            title: {
                text: 'Top ASes by # of Originated Prefixes'
            },
            subtitle: {
                text: 'ipv6'
            },
            plotOptions: {
                column: {
                    depth: 25
                }
            },
            xAxis: {
                categories: orgs
            },
            yAxis: {
                title: "origin_v6_prefixes",
                opposite: true
            },
            legend: {
                enabled: false
            },
            series: [
                {
                    name: 'Origin Prefixes',
                    data: origin_v6_prefixes
                }
            ]
        });
    });

});

// size of canvas for network topology
var canvas_width = 1200;
var canvas_height = 600;

// counter of loaded tables
var counter = 0

// datatable variable for Upstream and Downstream tables
var upstreamtable, downstreamtable, whoistable;

// Amount of upstream and downstream AS for particular AS
var upstreamAmount, downstreamAmount

//upstream & downstream
var upstream, downstream

//whois dictionary
var whois;

// keys of whois dictionary
var whois_keys;

//whois data
var whois_all;


// draw AS topology with current AS in the middle
function drawTopology() {
    $("#topology_title").text("Topology of AS" + $('#as_number').val());
    w = 500;

    var space1 = w / (upstreamAmount - 1)
    var space2 = w / (downstreamAmount - 1)


    var topologyData = {
        nodes: [
            {
                "id": 0,
                "x": 250,
                "y": 100,
                "name": "AS" + $('#as_number').val(),
                iconType: 'groupS'
            }
        ],
        links: [
        ]
    };


    if (upstreamAmount == 1) {
        node = {

            "name": upstream[0].UpstreamAS,
            "AS Name": upstream[0].as_name,
            "Organization": upstream[0].org_name,
            "Country": upstream[0].country,
            "-------------------------": "",
            "id": 1,
            "x": 250,
            "y": 0,

            iconType: 'groupL'
        }
        link = {
            "source": 0,
            "target": 1
        }
        topologyData["nodes"][1] = node;
        topologyData["links"][0] = link;
    } else {
        for (var i = 0; i < upstreamAmount; i++) {
            node = {
                "name": upstream[i].UpstreamAS,
                "AS Name": upstream[i].as_name,
                "Organization": upstream[i].org_name,
                "Country": upstream[i].country,
                "-------------------------": "",
                "id": i + 1,
                "x": i * space1,
                "y": 0,
                iconType: 'groupL'
            }
            link = {
                "source": 0,
                "target": i + 1
            }
            topologyData["nodes"][i + 1] = node;
            topologyData["links"][i] = link;
        }
    }

    if (downstreamAmount == 1) {
        node = {
            "name": downstream[0].DownstreamAS,
            "AS Name": downstream[0].as_name,
            "Organization": downstream[0].org_name,
            "Country": downstream[0].country,
            "-------------------------": "",
            "id": upstreamAmount + 1,
            "x": 250,
            "y": 200,
            iconType: 'groupM'
        }
        link = {
            "source": 0,
            "target": upstreamAmount + 1
        }
        topologyData["nodes"][upstreamAmount + 1] = node;
        topologyData["links"][upstreamAmount] = link
    } else {
        for (var i = 0; i < downstreamAmount; i++) {
            b = {
                "name": downstream[i].DownstreamAS,
                "AS Name": downstream[i].as_name,
                "Organization": downstream[i].org_name,
                "Country": downstream[i].country,
                "-------------------------": "",
                "id": upstreamAmount + i + 1,
                "x": i * space2,
                "y": 200,
                iconType: 'groupM'
            }
            link = {
                "source": 0,
                "target": upstreamAmount + i + 1
            }
            topologyData["nodes"][upstreamAmount + i + 1] = b;
            topologyData["links"][upstreamAmount + i] = link
        }
    }


    var App = nx.define(nx.ui.Application, {
        methods: {
            getContainer: function (comp) {
                return new nx.dom.Element(document.getElementById('AS_topology'));
            },
            start: function () {
                var topo = new nx.graphic.Topology({
                    width: canvas_width,
                    height: canvas_height,
                    nodeConfig: {
                        label: 'model.name', // display node's name as label from model
                        iconType: 'model.iconType'
                    },
                    showIcon: true,
                    data: topologyData
                });

                topo.attach(this);
            }
        }
    });

    var app = new App();
    app.start();
}

// draw topology, stop progress bar and show data
function stopBar() {
    counter += 1;
    if (counter == 2) {
        drawTopology();

        // get whois
        jQuery.ajax({
            url: 'http://odl-dev.openbmp.org:8001/db_rest/v1/whois/asn/' + $('#as_number').val(),
            success: function (result) {
                whois = result.gen_whois_asn.data[0];
            },
            async: false
        });
        console.log(whois);

        //get keys of whois dictionary
        whois_keys = Object.keys(whois);

        var str = '<table class="table table-striped  cursor"><thead><tr><th>AS Information</th></tr></thead><tbody>';
        //
        for (var j = 0; j < whois_keys.length; j++) {
            if ((whois_keys[j] != "raw_output") && (whois_keys[j] != "remarks")) {
                str += '<tr>' + '<td>' + whois_keys[j] + '</td>' + '<td class="text-left">' + whois[whois_keys[j]] + '</td>' + '</tr>';
            }
        }
        str += '</tbody></table>';

        $("#whois_data_container").html(str);

        $("#progress_bar").hide(100);
        $("#analysis_tables").show(500);
    }
}

function noData() {
    counter -= 1;
    $("#progress_bar").hide(100);
}

// checks json for empty strings
function processJson(data) {
    for (index in data) {
        if ((data[index].UpstreamAS == "") || (data[index].DownstreamAS == "")) {
            console.log("empty " + index);
            if ("UpstreamAS" in data[index]) {
                console.log("UpstreamAS");
                data[index].UpstreamAS = "Self";
                $("#self_pref_up").text("Self prefixes: " + data[index].Prefixes_Learned);
                $("#self_pref_up").show();
            } else {
                console.log("DownstreamAS");
                data[index].DownstreamAS = "Self"
                $("#self_pref_down").text("Self prefixes: " + data[index].Prefixes_Learned);
                $("#self_pref_down").show();
            }
        }
    }
    return data

}

//Get it! button pressed
$("#as_submit").click(function () {
    if (jQuery.isNumeric($('#as_number').val())) {
        $("#dem").hide(100);
        $("#dbina").hide(100);

        $("#self_pref_up").hide();
        $("#self_pref_down").hide();

        $("#analysis_tables").hide(500);
        counter = 0
        $("#progress_bar").show(500);
        $("#AS_topology").empty();
        if ($.fn.dataTable.isDataTable('#upstream_table')) {
            upstreamtable.destroy();
        }
        if ($.fn.dataTable.isDataTable('#downstream_table')) {
            downstreamtable.destroy();
        }
        var upstream_req = "http://odl-dev.openbmp.org:8001/db_rest/v1/upstream/" + $('#as_number').val() + "/count";
        var downstream_req = "http://odl-dev.openbmp.org:8001/db_rest/v1/downstream/" + $('#as_number').val() + "/count";

        upstreamtable = $('#upstream_table').DataTable({
            "ajax": { "url": upstream_req,
                "dataSrc": function (json) {
                    if (!jQuery.isEmptyObject(json)) {
                        if (json.upstreamASNCount.data.size != 0) {
                            upstream = json.upstreamASNCount.data.data;
                            upstreamAmount = json.upstreamASNCount.data.size;
                        } else {
                            $("#dem").show(500);
                            noData();
                        }
                        ;
                    } else {
                        $("#dbina").show(500);
                        noData();
                    }

                    return processJson(json.upstreamASNCount.data.data);
                }
            },
            "fnInitComplete": function () {
                stopBar();
            },
            "columns": [
                { "data": "UpstreamAS",
                    "defaultContent": " "
                },
                { "data": "Prefixes_Learned" }
            ],
            "scrollCollapse": true,
            "paging": true,
            "info": true,
            "autoWidth": true
        });

        $('#upcontainer').css('display', 'block');
        upstreamtable.columns.adjust().draw();

        downstreamtable = $('#downstream_table').DataTable({
            "ajax": { "url": downstream_req,
                "dataSrc": function (json) {
                    if (!jQuery.isEmptyObject(json)) {
                        if (json.downstreamASNCount.data.size != 0) {
                            downstream = json.downstreamASNCount.data.data;
                            downstreamAmount = json.downstreamASNCount.data.size;
                        } else {
                            $("#dem").show(500);
                            noData();
                        }
                        ;
                    } else {
                        $("#dbina").show(500);
                        noData();
                    }

                    return processJson(json.downstreamASNCount.data.data);
                }
            },
            "fnInitComplete": function () {
                stopBar();
            },
            "columns": [
                { "data": "DownstreamAS",
                    "defaultContent": " "
                },
                { "data": "Prefixes_Learned" }
            ],
            "scrollCollapse": true,
            "paging": true,
            "info": true
        });

        $('#downcontainer').css('display', 'block');
        downstreamtable.columns.adjust().draw();
    }
});

//Load WHOIS! button pressed
$("#whois_submit").click(function () {

    console.log("Whois pressed!");

    $("#whois_wrong").hide(100);
    $("#whois_tables").hide(500);

    var counter = 0
    $("#progress_bar_whois").show(500);

    if ($.fn.dataTable.isDataTable('#whois_table')) {
        whoistable.destroy();
    }

    var req_whois = "http://odl-dev.openbmp.org:8001/db_rest/v1/as_stats";
    var wrong_data = true;

    whoistable = $('#whois_table').DataTable({
        "ajax": { "url": req_whois,
            "dataSrc": function (json) {
                if (!jQuery.isEmptyObject(json)) {
                    if (json.s.size != 0) {
                        whois_all = json.s.data;
                        wrong_data = false;
                    } else {
                        $("#whois_wrong").show(500);
                    }
                } else {
                    $("#whois_wrong").show(500);
                }

                return  whois_all;
            }
        },
        "fnInitComplete": function () {
            if (!wrong_data) {
                $("#progress_bar_whois").hide(500);
                $("#whois_tables").show(500);

                // Click on row in Peers table
                $('#whois_tables tbody').on('click', 'tr', function () {
                    var asn = $('td', this).eq(0).text();
                    console.log(asn);

                    var found = 0;
                    var w = 0;
                    while ((!found) && (w < whois_all.length)) {
                        if (whois_all[w].asn == asn) {
                            found = 1;
                        }
                        w++;
                    }
                    w--;

                    console.log("Whois: " + whois_all[w]);

                    $("#whois_modal_label").text(whois_all[w].asn);

                    var info = '<p>' + '# of Transit IPv4 prefixes: ' + whois_all[w].transit_v4_prefixes + '</p>';
                        info += '<p>' + '# of Transit IPv6 prefixes: ' + whois_all[w].transit_v4_prefixes + '</p>';
                        info += '<p>' + '# of Origin IPv4 prefixes: ' + whois_all[w].origin_v4_prefixes + '</p>';
                        info += '<p>' + '# of Origin IPv6 prefixes: ' + whois_all[w].origin_v6_prefixes + '</p>';

                    $("#whois_modal_body").html(info);

                    console.log(info);

                    $('#whois_modal').modal('show');
                });
            }
        },
        "bJQueryUI": true,
        "columns": [
            { "data": "asn",
                "defaultContent": "unknown",
                "sWidth": "100px"
            },
            { "data": "isTransit",
                "defaultContent": "unknown",
                "sWidth": "70px"
            },
            { "data": "isOrigin",
                "defaultContent": "unknown",
                "sWidth": "70px"
            },
            { "data": "as_name",
                "defaultContent": "unknown",
                "sWidth": "200px"
            },
            { "data": "org_name",
                "defaultContent": "unknown",
                "sWidth": "200px"
            },
            { "data": "country",
                "defaultContent": "unknown",
                "sWidth": "200px"
            }
        ],

        "columnDefs": [
            {
                "render": function (data, type, row) {

                    return (row.isTransit === "1") ? '<span class="glyphicon glyphicon-plus"> yes</span>' : '<span class="glyphicon glyphicon-minus"> no</span>';
                },
                "targets": 1
            },
            {
                "render": function (data, type, row) {

                    return (row.isOrigin === "1") ? '<span class="glyphicon glyphicon-plus"> yes</span>' : '<span class="glyphicon glyphicon-minus"> no</span>';
                },
                "targets": 2
            }
        ],
        "deferRender": true,
        "scrollCollapse": true,
        "paging": true,
        "info": true,
        "autoWidth": true
    });

});