'use strict';

var app = angular.module('renameApp', [ ]);

app.controller('renameController', function() {
    this.products = gems;
});

app.controller('renameDifferentController', ['$scope', '$http', function($scope, $http) {
  // does nothing atm
}]);





$(document).ready(function () {
    $("#as_analysis_panel").show(500);
    $("#icon").show(1000);




});

var counter = 0
var upstreamtable, downstreamtable

function stopBar() {
    counter += 1;
    if (counter == 2) {
        $("#progress_bar").hide(100);
        $("#analysis_tables").show(500);
    }
}

//Upload tables
$("#as_submit").click(function () {
    if (jQuery.isNumeric($('#as_number').val())) {
        $.get( "http://bgp.he.net/AS109", function( data ) {
            var el = $( '<div></div>' );
            el.html(data);

            arr = $('div.asright', el) // All the anchor elements
            console.log(arr)
        } );


        $("#analysis_tables").hide(500);
        counter = 0
        $("#progress_bar").show(500);
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
                    return json.d.data;
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
            "info": true
        });

        downstreamtable = $('#downstream_table').DataTable({
            "ajax": { "url": downstream_req,
                "dataSrc": function (json) {
                    return json.d.data;
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

    }
});