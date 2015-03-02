'use strict';

var app = angular.module('renameApp', [ ]);

app.controller('renameController', function() {
    this.products = gems;
});

app.controller('renameDifferentController', ['$scope', '$http', function($scope, $http) {
  // does nothing atm
}]);



// Clock variable in left top corner
var clock;

// All BGP Routers & Peers
var routers, peers;

// Distribution of Routers and Peers
var router_peer_distribution = [];

$(document).ready(function () {

    // Active routers ( draw on BMP Server tab )
    $.getJSON("http://odl-dev.openbmp.org:8001/db_rest/v1/routers/status/up", function (json) {
        $("#activerouter").html(json.routers.size)
    });

    // Initialyze clock
    clock = $('.clock').FlipClock({
        clockFace: 'TwentyFourHourClock'
    });

    // ------------------------------------------ PEERS TAB ----------------------------------------------------------->

    // Get peers data
    var request = "http://odl-dev.openbmp.org:8001/db_rest/v1/peer";
    jQuery.ajax({
        url: request,
        success: function (result) {
            peers = result.v_peers.data;
        },
        async: false
    });

    // UP & COLLECTOR UP
    var up_peers_ipv4 = 0, up_peers_ipv6 = 0;

    // DOWN & COLLECTOR DOWN PEERS
    var down_peers_ipv4 = 0, down_peers_ipv6 = 0;

    // DOWN & COLLECTOR DOWN PEERS
    var down_collectordown_peers = 0, down_collectordown_peers_ipv4 = 0, down_collectordown_peers_ipv6 = 0;

    // UP & COLLECTOR DOWN PEERS
    var up_collectordown_peers = 0, up_collectordown_peers_ipv4 = 0, up_collectordown_peers_ipv6 = 0;

    // DOWN PEERS (is DOWN & is NOT CONNECTED to BMP)
    var down_peers = 0, up_peers = 0;

    // Status data - variable for pie chart
    StatusData = [];

    // Get distribution of all types of peers
    for (var idx in peers) {

        // is UP
        if (peers[idx].isUp == "1") {

            // is UP & BMPConnected UP
            if (peers[idx].isBMPConnected == "1") {
                if (peers[idx].isPeerIPv4 == "1") {
                    up_peers_ipv4++;
                } else {
                    up_peers_ipv6++;
                }
                // is UP & BMPConnected DOWN
            } else {
                if (peers[idx].isPeerIPv4 == "1") {
                    up_collectordown_peers_ipv4++;
                } else {
                    up_collectordown_peers_ipv6++;
                }
            }

            // is DOWN
        } else {

            // is DOWN & BMPConnected UP
            if (peers[idx].isBMPConnected == "1") {

                if (peers[idx].isPeerIPv4 == "1") {
                    down_peers_ipv4++;
                } else {
                    down_peers_ipv6++;
                }

                // is DOWN & BMPConnected DOWN
            } else {

                if (peers[idx].isPeerIPv4 == "1") {
                    down_collectordown_peers_ipv4++;
                } else {
                    down_collectordown_peers_ipv6++;
                }
            }

        }
    }

    // Populate tables with corresponding data

    // up_peers_ipv4/6
    up_peers = up_peers_ipv4 + up_peers_ipv6;


    if (up_peers != 0) {
        $("#up_peers").html(up_peers);
        StatusData.push(
                {
                    drilldown: "Up",
                    name: "Up",
                    visible: true,
                    y: Number((100 * up_peers / (up_peers_ipv4 + up_peers_ipv6 + down_peers_ipv4 + down_peers_ipv6 + down_collectordown_peers_ipv4 + down_collectordown_peers_ipv6 + up_collectordown_peers_ipv4 + up_collectordown_peers_ipv6)).toFixed(1))
                }
        );
    }
    if (up_peers_ipv4 != 0) $("#up_peers_ipv4").html(up_peers_ipv4);
    if (up_peers_ipv6 != 0) $("#up_peers_ipv6").html(up_peers_ipv6);

    // down_peers_ipv4/6
    down_peers = down_peers_ipv4 + down_peers_ipv6;
    if (down_peers != 0) {
        $("#down_peers").html(down_peers);
        StatusData.push(
                {
                    drilldown: "Down",
                    name: "Down",
                    visible: true,
                    y: Number((100 * down_peers / (up_peers_ipv4 + up_peers_ipv6 + down_peers_ipv4 + down_peers_ipv6 + down_collectordown_peers_ipv4 + down_collectordown_peers_ipv6 + up_collectordown_peers_ipv4 + up_collectordown_peers_ipv6)).toFixed(1))
                }
        );
    }
    if (down_peers_ipv4 != 0) $("#down_peers_ipv4").html(down_peers_ipv4);
    if (down_peers_ipv6 != 0) $("#down_peers_ipv6").html(down_peers_ipv6);

    // down_collectordown_peers_ipv4/6
    down_collectordown_peers = down_collectordown_peers_ipv4 + down_collectordown_peers_ipv6;
    if (down_collectordown_peers != 0) {
        $("#down_collectordown_peers").html(down_collectordown_peers);
        StatusData.push(
                {
                    drilldown: "down_collectordown_peers",
                    name: "Down & CollectorDown",
                    visible: true,
                    y:  Number((100 * down_collectordown_peers / (up_peers_ipv4 + up_peers_ipv6 + down_peers_ipv4 + down_peers_ipv6 + down_collectordown_peers_ipv4 + down_collectordown_peers_ipv6 + up_collectordown_peers_ipv4 + up_collectordown_peers_ipv6)).toFixed(1))
                }
        );

    }
    if (down_collectordown_peers_ipv4 != 0) $("#down_collectordown_peers_ipv4").html(down_collectordown_peers_ipv4);
    if (down_collectordown_peers_ipv6 != 0) $("#down_collectordown_peers_ipv6").html(down_collectordown_peers_ipv6);

    // up_collectordown_peers_ipv4/6
    up_collectordown_peers = up_collectordown_peers_ipv4 + up_collectordown_peers_ipv6;
    if (up_collectordown_peers != 0) {
        $("#up_collectordown_peers").html(up_collectordown_peers);
        StatusData.push(
                {
                    drilldown: "up_collectordown_peers",
                    name: "Up & CollectorDown",
                    visible: true,
                    y: Number((100 * up_collectordown_peers / (up_peers_ipv4 + up_peers_ipv6 + down_peers_ipv4 + down_peers_ipv6 + down_collectordown_peers_ipv4 + down_collectordown_peers_ipv6 + up_collectordown_peers_ipv4 + up_collectordown_peers_ipv6)).toFixed(1))
                }
        );
    }
    if (up_collectordown_peers_ipv4 != 0) $("#up_collectordown_peers_ipv4").html(up_collectordown_peers_ipv4);
    if (up_collectordown_peers_ipv6 != 0) $("#up_collectordown_peers_ipv6").html(up_collectordown_peers_ipv6);

    // total peers distribution
    monitoring_ipv4 = up_peers_ipv4 + down_peers_ipv4 + down_collectordown_peers_ipv4 +
            up_collectordown_peers_ipv4;
    monitoring_ipv6 = up_peers_ipv6 + down_peers_ipv6 + down_collectordown_peers_ipv6 +
            up_collectordown_peers_ipv6;
    monitoring_total = monitoring_ipv4 + monitoring_ipv6;

    if (monitoring_ipv4 != 0) $("#monitoring_ipv4").html(monitoring_ipv4);
    if (monitoring_ipv6 != 0) $("#monitoring_ipv6").html(monitoring_ipv6);
    if (monitoring_total != 0) $("#monitoring_total").html(monitoring_total);


    // -------------- Draw chart ------------->

    // Radialize the colors
    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
        return {
            radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
            stops: [
                [0, color],
                [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
            ]
        };
    });

    // transcode peers into percents

    // up_peers = ipv4/ipv6 ------------------------------------->
    var up_peers_ipv4_percentage = Number((100 * up_peers_ipv4 / (up_peers_ipv4 + up_peers_ipv6)).toFixed(1));
    var up_peers_ipv6_percentage = Number((100  - up_peers_ipv4_percentage).toFixed(1));

    var up_data = [];

    if (up_peers_ipv4 != 0)  up_data.push(["IPv4", up_peers_ipv4_percentage]);
    if (up_peers_ipv6 != 0) up_data.push(["IPv6", up_peers_ipv6_percentage]);

    // --------------------------------------------------------->


    // down_peers = ipv4/ipv6 ------------------------------------->
    var down_peers_ipv4_percentage = Number((100 * down_peers_ipv4 / (down_peers_ipv4 + down_peers_ipv6)).toFixed(1));
    var down_peers_ipv6_percentage = Number((100  - down_peers_ipv4_percentage).toFixed(1));

    var down_data = [];

    if (down_peers_ipv4 != 0)  down_data.push(["IPv4", down_peers_ipv4_percentage]);
    if (down_peers_ipv6 != 0) down_data.push(["IPv6", down_peers_ipv6_percentage]);

    // --------------------------------------------------------->


    // up_collectordown_peers = ipv4/ipv6 ------------------------------------->
    var up_collectordown_peers_ipv4_percentage = Number((100 * up_collectordown_peers_ipv4 / (up_collectordown_peers_ipv4 + up_collectordown_peers_ipv6)).toFixed(1));
    var up_collectordown_peers_ipv6_percentage = Number((100  - up_collectordown_peers_ipv4_percentage).toFixed(1));

    var up_collectordown_data = [];

    if (up_collectordown_peers_ipv4 != 0)  up_collectordown_data.push(["IPv4", up_collectordown_peers_ipv4_percentage]);
    if (up_collectordown_peers_ipv6 != 0) up_collectordown_data.push(["IPv6", up_collectordown_peers_ipv6_percentage]);

    // --------------------------------------------------------->


    // down_collectordown_peers = ipv4/ipv6 ------------------------------------->
    var down_collectordown_peers_ipv4_percentage = Number((100 * down_collectordown_peers_ipv4 / (down_collectordown_peers_ipv4 + down_collectordown_peers_ipv6)).toFixed(1));
    var down_collectordown_peers_ipv6_percentage = Number((100  - down_collectordown_peers_ipv4_percentage).toFixed(1));

    var down_collectordown_data = [];

    if (down_collectordown_peers_ipv4 != 0)  down_collectordown_data.push(["IPv4", down_collectordown_peers_ipv4_percentage]);
    if (down_collectordown_peers_ipv6 != 0) down_collectordown_data.push(["IPv6", down_collectordown_peers_ipv6_percentage]);

    // --------------------------------------------------------->


    drilldownSeries = [
        {
            id: "Up",
            name: "Up",
            data: up_data
        },
        {
            id: "Down",
            name: "Down",
            data: down_data
        },
        {
            id: "down_collectordown_peers",
            name: "Down & CollectorDown",
            data: down_collectordown_data
        },
        {
            id: "up_collectordown_peers",
            name: "Up & CollectorDown",
            data: up_collectordown_data
        }
    ];

    // Create the chart
    $('#peer-report').highcharts({
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Total Distribution of Peers per Status'
        },
        subtitle: {
            text: 'Click the slices to view distribution per ipv4/ipv6'
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y:.1f}% peers'
                }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.1f}%</b> of total<br/>'
        },
        series: [
            {
                name: 'Status',
                colorByPoint: true,
                data: StatusData
            }
        ],
        drilldown: {
            series: drilldownSeries
        }
    });
    // -------------- ./Draw chart ----------->


    // -------- CLICK EVENT ON PEERS TABLE ---------------------------------------------------------------------------->
    // See information about up peers (up/down)
    $("#up_peers, #down_peers, #up_collectordown_peers, #down_collectordown_peers").click(function () {

        console.log($(this).attr('id'));

        if ($(this).attr('id') == "up_peers") {
            request += "/status/up"
            $("#up_down_peers_info_label").text("Up peers");
        }
        if ($(this).attr('id') == "down_peers") {
            request += "/status/down"
            $("#up_down_peers_info_label").text("Down peers");
        }
        if ($(this).attr('id') == "up-bmpdown_peers") {
            request += "?where=isUp%3D%221%22%20and%20isBMPConnected%3D%220%22"
            $("#up_down_peers_info_label").text("Down peers");
        }
        if ($(this).attr('id') == "down-bmpdown_peers") {
            request += "?where=isUp%3D%220%22%20and%20isBMPConnected%3D%220%22"
            $("#up_down_peers_info_label").text("Down peers");
        }

        console.log(request);

        if ($.fn.dataTable.isDataTable('#up_down_peers_modal_table')) {
            up_down_peers_modal_table.destroy();
        }

        up_down_peers_modal_table = $('#up_down_peers_modal_table').DataTable({
            "ajax": { "url": request,
                "dataSrc": function (json) {
                    return json.v_peers.data;
                }
            },
            "fnInitComplete": function () {
                console.log("Completed");
                $('#up_down_peers').modal('show');
            },
            "columns": [
                { "data": "PeerIP" },
                { "data": "PeerASN" },
                { "data": "PeerName" },
                { "data": "RouterName" }
            ],
            "scrollCollapse": true,
            "paging": true,
            "info": true,
            "dom": '<"top">rt<"bottom"fipl><"clear">'
        });

    });


    $("#up_peers, #down_peers").click(function () {

        console.log($(this).attr('id'));

        var request = "http://odl-dev.openbmp.org:8001/db_rest/v1/peer/status/";

        if ($(this).attr('id') == "up_peers") {
            request += "up"
            $("#up_down_peers_info_label").text("Up peers");
        } else {
            request += "down";
            $("#up_down_peers_info_label").text("Down peers");
        }

        console.log(request);

        if ($.fn.dataTable.isDataTable('#up_down_peers_modal_table')) {
            up_down_peers_modal_table.destroy();
        }

        up_down_peers_modal_table = $('#up_down_peers_modal_table').DataTable({
            "ajax": { "url": request,
                "dataSrc": function (json) {
                    return json.v_peers.data;
                }
            },
            "fnInitComplete": function () {
                console.log("Completed");
                $('#up_down_peers').modal('show');
            },
            "columns": [
                { "data": "PeerIP" },
                { "data": "PeerASN" },
                { "data": "PeerName" },
                { "data": "RouterName" }
            ],
            "scrollCollapse": true,
            "paging": true,
            "info": true,
            "dom": '<"top">rt<"bottom"fipl><"clear">'
        });

    });


    // See information about up peers (ipv4/ipv6)
    $("#monitoring_ipv4, #monitoring_ipv6").click(function () {

        console.log($(this).attr('id'));

        var request = "http://odl-dev.openbmp.org:8001/db_rest/v1/peer/type/v";

        if ($(this).attr('id') == "monitoring_ipv4") {
            request += "4"
            $("#up_down_peers_info_label").text("IP v.4 peers");
        } else {
            request += "6";
            $("#up_down_peers_info_label").text("IP v.6 peers");
        }

        console.log(request);

        if ($.fn.dataTable.isDataTable('#up_down_peers_modal_table')) {
            up_down_peers_modal_table.destroy();
        }

        up_down_peers_modal_table = $('#up_down_peers_modal_table').DataTable({
            "ajax": { "url": request,
                "dataSrc": function (json) {
                    return json.v_peers.data;
                }
            },
            "fnInitComplete": function () {
                console.log("Completed");
                $('#up_down_peers').modal('show');
            },
            "columns": [
                { "data": "PeerIP" },
                { "data": "PeerASN" },
                { "data": "PeerName" },
                { "data": "RouterName" }
            ],
            "scrollCollapse": true,
            "paging": true,
            "info": true,
            "dom": '<"top">rt<"bottom"fipl><"clear">'
        });

    });


    // Click on monitoring total (go to the different page)
    $("#monitoring_total").click(function () {
        window.location.href = "/peeranalysis";
    });

    // -------- ./CLICK EVENT ON PEERS TABLE ------------------------>

    // ---------------------------------------- ./PEER TAB ------------------------------------------------------------>


    // ---------------------------------------- STRUCTURE BUTTON ------------------------------------------------------>
    // Draw Topology function
    function drawTopology() {
        var d = new Date();
        var date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() + "";
        var time = d.getHours() + ':' + d.getMinutes();
        $("#topology_panel_icon").text("Project Topology by " + date + " " + time);

        $.getScript("/static/next_topology_map/Shell.js")
                .done(function (script, textStatus) {
                    console.log(textStatus);
                })
                .fail(function (jqxhr, settings, exception) {
                    console.log("sasamba!");
                });

        setTimeout(
                function () {
                    $("#topology_panel").show(500);
                    $('html, body').animate({
                        scrollTop: $("#down").offset().top
                    }, 500);
                    $("#topology_panel_icon").show(1000);
                }, 1000);
    }

    // Click on Topology button
    $("#structure_button").click(function () {
        console.log("handler");
        // $('#modal_structure').modal('show');
        drawTopology();
        return false;
    });

    // ---------------------------------------- ./STRUCTURE BUTTON ---------------------------------------------------->


    // ----------------------------------------- ROUTERS TAB ---------------------------------------------------------->
    $.getJSON("http://odl-dev.openbmp.org:8001/db_rest/v1/routers", function (json) {
        routers = json.routers.data;

        // Create table with bmp routers
        $('#bmprouterstable').dataTable({
            "data": routers,
            "columns": [
                { "data": "RouterName",
                    "sWidth": "15%"},
                { "data": "RouterName",
                    "sWidth": "20%"},
                { "data": "RouterIP" },
                { "data": "RouterName",
                    "sWidth": "5%"}
            ],
            "columnDefs": [
                {
                    "render": function (data, type, row) {
                        return (row.isConnected === "1") ? '<span class="glyphicon glyphicon-ok"> Up</span>' :
                                '<span class="glyphicon glyphicon-remove"> Down</span>';

                    },
                    "targets": 0
                },
                {
                    "render": function (data, type, row) {
                        //var res = 0;
                        console.log("render");

                        var h = 0;
                        var arr1 = [];
                        var amount1 = 0;
                        while (h < peers.length) {
                            if (peers[h].RouterIP == row.RouterIP) {
                                amount1++;
                                arr1.push(peers[h]);
                            }
                            h++;
                        }
                        console.log(peers);
                        console.log("DEBUG:" + amount1 + arr1);
                        router_peer_distribution[row.RouterIP] = arr1;
                        return amount1;
                    },
                    "targets": 3
                }
            ],
            "paging": false,
            "scrollCollapse": true,
            "filter": false,
            "info": false,
            "scrollY":  "380px"

        });

        // get ipv4 peers from every router
        var ipv4 = [];
        for (var idx in routers) {
            jQuery.ajax({
                url: 'http://odl-dev.openbmp.org:8001/db_rest/v1/peer?where=isPeerIPv4%3D%221%22%20and%20RouterIP%3D%22' + routers[idx].RouterIP + '%22',
                success: function (result) {
                    ipv4[idx] = result.v_peers.size;
                },
                async: false
            });
        }

        // get ipv6 peers from every router
        var ipv6 = [];
        for (var idx in routers) {
            jQuery.ajax({
                url: 'http://odl-dev.openbmp.org:8001/db_rest/v1/peer?where=isPeerIPv4%3D%220%22%20and%20RouterIP%3D%22' + routers[idx].RouterIP + '%22',
                success: function (result) {
                    ipv6[idx] = result.v_peers.size;
                },
                async: false
            });
        }

        // Bar chart of BMP routers distribution
        $('#router-report').highcharts({

            chart: {
                type: 'column'
            },

            title: {
                text: 'Total Distribution of Routers'
            },

            xAxis: {
                categories: Object.keys(router_peer_distribution)
            },

            yAxis: {
                allowDecimals: false,
                min: 0,
                title: {
                    text: 'Number of peers'
                }
            },

            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                            this.series.name + ': ' + this.y + '<br/>' +
                            'Total: ' + this.point.stackTotal;
                }
            },

            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            },

            series: [
                {
                    name: 'IPv4',
                    data: ipv4,
                    stack: 'male'
                },
                {
                    name: 'IPv6',
                    data: ipv6,
                    stack: 'male'
                }
            ]
        });

        // Click on BMP Routers row
        $('#bmprouterstable tbody').on('click', 'tr', function () {
            var name = $('td', this).eq(0).text();
            var ip_address = $('td', this).eq(2).text();
            console.log(name + " & " + ip_address);
            var found = 0;
            var i = 0;
            while ((!found) & (i < routers.length)) {
                if (routers[i].RouterIP == ip_address) {
                    $("#prefix_info_label").text('BMP ROUTER   ' + name + '  ->  ' + ip_address);
                    found = 1;
                }
                i++;
            }

            /// --------------------- MODAL WINDOW --------->
            var info = '<h4>' + ' PREFIXES: ' + '</h4>' + '<pre>';
            info += 'Description: \t' + routers[i - 1].description + '\n';
            info += 'Connection: \t' + routers[i - 1].isConnected + '\n';
            info += 'isPassive: \t' + routers[i - 1].isPassive + '\n';
            info += 'LastTermCode: \t' + routers[i - 1].LastTermCode + '\n';
            info += 'LastTermReason: \t' + routers[i - 1].LastTermReason + '\n';
            info += 'InitData: \t' + routers[i - 1].InitData + '\n';
            info += '</pre>';



            $("#prefixes_modal_container").html(info);

            $('#prefix_info').modal('show');
        });
    });
});
