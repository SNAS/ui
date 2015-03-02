'use strict';

var app = angular.module('renameApp', [ ]);

app.controller('renameController', function() {
    this.products = gems;
});

app.controller('renameDifferentController', ['$scope', '$http', function($scope, $http) {
  // does nothing atm
}]);



// count_of_updates
var count_of_updates;

//top updates
var top_updates;

//count of withdr
var count_of_withdr;

// top withdr
var top_withdr

// show panel with and icon
$(document).ready(function () {

    $("#updates_over_time_section").show(1000);
    $("#withdrawns_over_time_section").show(1000);

    //$("#peer_table_section").show(500);

    req1 = "http://odl-dev.openbmp.org:8001/db_rest/v1/updates/top/interval/5"

    req2 = "http://odl-dev.openbmp.org:8001/db_rest/v1/updates/top?limit=10"

    req3 = "http://odl-dev.openbmp.org:8001/db_rest/v1/withdrawns/top/interval/5"

    req4 = "http://odl-dev.openbmp.org:8001/db_rest/v1/withdrawns/top?limit=10"

    $.getJSON(req1, function (json) {

        count_of_updates = json[""].data;

        var counts1 = [];
        var counts2 = [];
        var time = [];

        //create array with amount of prefixes
        for (var i = 0; i < count_of_updates.length; i++) {
            counts1[count_of_updates.length - 1 - i] = count_of_updates[i].Count;
            time[i] = count_of_updates[i].IntervalTime;
        }
        console.log(counts1);

        var data_arr_start = count_of_updates[count_of_updates.length - 1].IntervalTime.split(/[: \-]+/);

        var year_start = data_arr_start[0];

        var month_start = data_arr_start[1];

        var day_start = data_arr_start[2];

        var hour_start = data_arr_start[3];

        var minute_start = data_arr_start[4];

        var second_start = data_arr_start[5];

        console.log(year_start + "-" + month_start + "-" + day_start + " and " + hour_start + ":" + minute_start + ":" + second_start);

        $('#count_of_updates').highcharts({
            chart: {
                zoomType: 'x'
            },
            title: {
                text: '# of updates per interval of 5 minutes'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' :
                        'Pinch the chart to zoom in'
            },
            xAxis: {
                title: {
                    text: 'Time'
                },
                type: 'datetime',
                minRange: 15 * 5 * 1000 // five minutes
            },
            yAxis: {
                title: {
                    text: 'Updates'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [
                {
                    type: 'area',
                    name: 'Prefixes',
                    pointInterval: 5 * 60 * 1000,
                    pointStart: Date.UTC(year_start, month_start - 1, day_start, hour_start, minute_start, second_start),
                    data: counts1
                }
            ]
        });
    });

    $.getJSON(req2, function (json) {

        var counts2 = [];
        var prefs = [];

        top_updates = json.u.data;

        //create array with amount of prefixes
        for (var i = 0; i < top_updates.length; i++) {
            counts2[top_updates.length - 1 - i] = top_updates[i].Count;
            prefs[top_updates.length - 1 - i] = top_updates[i].Prefix + "/" + top_updates[i].PrefixLen;
        }
        console.log(counts2);


        $('#top_prefixes').highcharts({
            chart: {
                type: 'column',
                margin: 75,
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 25,
                    depth: 70
                }
            },
            title: {
                text: 'Top updates'
            },
            //subtitle: {
            //    text: 'top_updates'
            //},
            plotOptions: {
                column: {
                    depth: 25
                }
            },
            xAxis: {
                categories: prefs
            },
            yAxis: {
                opposite: true
            },
            series: [
                {
                    name: 'Top',
                    data: counts2
                }
            ]
        });

    });

    $.getJSON(req3, function (json) {

        count_of_withdr = json[""].data;

        var counts1 = [];
        var counts2 = [];
        var time = [];

        //create array with amount of prefixes
        for (var i = 0; i < count_of_withdr.length; i++) {
            counts1[count_of_withdr.length - 1 - i] = count_of_withdr[i].Count;
            time[i] = count_of_withdr[i].IntervalTime;
        }
        console.log(counts1);

        var data_arr_start = count_of_withdr[count_of_withdr.length - 1].IntervalTime.split(/[: \-]+/);

        var year_start = data_arr_start[0];

        var month_start = data_arr_start[1];

        var day_start = data_arr_start[2];

        var hour_start = data_arr_start[3];

        var minute_start = data_arr_start[4];

        var second_start = data_arr_start[5];

        console.log(year_start + "-" + month_start + "-" + day_start + " and " + hour_start + ":" + minute_start + ":" + second_start);

        $('#count_of_withdr').highcharts({
            chart: {
                zoomType: 'x'
            },
            title: {
                text: '# of updates per interval of 5 minutes'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' :
                        'Pinch the chart to zoom in'
            },
            xAxis: {
                title: {
                    text: 'Time'
                },
                type: 'datetime',
                minRange: 15 * 5 * 1000 // five minutes
            },
            yAxis: {
                title: {
                    text: 'Updates'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [
                {
                    type: 'area',
                    name: 'Prefixes',
                    pointInterval: 5 * 60 * 1000,
                    pointStart: Date.UTC(year_start, month_start - 1, day_start, hour_start, minute_start, second_start),
                    data: counts1
                }
            ]
        });
    });

    $.getJSON(req4, function (json) {

        var counts2 = [];
        var prefs = [];

        top_withdr = json.u.data;

        //create array with amount of prefixes
        for (var i = 0; i < top_withdr.length; i++) {
            counts2[top_withdr.length - 1 - i] = top_withdr[i].Count;
            prefs[top_withdr.length - 1 - i] = top_withdr[i].Prefix + "/" + top_withdr[i].PrefixLen;
            //time[i] = top_updates[i].IntervalTime;
        }
        console.log(counts2);


        $('#top_withdr').highcharts({
            chart: {
                type: 'column',
                margin: 75,
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 25,
                    depth: 70
                }
            },
            title: {
                text: 'Top updates'
            },
            //subtitle: {
            //    text: 'top_updates'
            //},
            plotOptions: {
                column: {
                    depth: 25
                }
            },
            xAxis: {
                categories: prefs
            },
            yAxis: {
                opposite: true
            },
            series: [
                {
                    name: 'Top',
                    data: counts2
                }
            ]
        });

    });

});