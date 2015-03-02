'use strict';

var app = angular.module('renameApp', [ ]);

app.controller('renameController', function() {
    this.products = gems;
});

app.controller('renameDifferentController', ['$scope', '$http', function($scope, $http) {
  // does nothing atm
}]);




// datatable variable for Upstream and Downstream tables
var whoistable;

//whois dictionary
var whois;

// keys of whois dictionary
var whois_keys;

//whois data
var whois_all;

var wrong_data=true;

$(document).ready(function () {
    $("#whois_panel").show(500);
    $("#whois_wrong").hide(100);
    $("#whois_table_container").hide(500);

 //   $("#progress_bar").show(500);

    var req_whois = "http://odl-dev.openbmp.org:8001/db_rest/v1/whois/asn?where=w.as_name like '%cisco%' or w.org_name like '%cisco%'";

    whoistable = $('#whois_table').DataTable({
        "ajax": {
            "url": req_whois,
            "dataSrc": function (json) {
                if (!jQuery.isEmptyObject(json)) {
                    if (json.w.size != 0) {
                        whois_all = json.w.data;
                        wrong_data = false;

                     //   $("#progress_bar").hide(500);

                    } else {
                        $("#whois_wrong").show(500);
                    }
                } else {
                    $("#whois_wrong").show(500);
                }

                return whois_all;
            }
        },
        "fnInitComplete": function () {
            if (!wrong_data) {
          //      $("#progress_bar_whois").hide(500);
                $("#whois_table_container").show(500);

                // Click on row in Peers table
                $('#whois_table_container tbody').on('click', 'tr', function () {
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

                    var more = "http://odl-dev.openbmp.org:8001/db_rest/v1/whois/asn/" + asn;
                    var more_info;

                    jQuery.ajax({
                        url: more,
                        success: function (result) {
                            more_info = result.gen_whois_asn.data[0];
                        },
                        async: false
                    });

                    console.log("more info: " + more_info);

                    console.log("Whois: " + whois_all[w]);

                    $("#whois_modal_label").text("AS" + whois_all[w].asn);

                    var info = '<h4>' + ' PREFIXES: ' + '</h4>' + '<pre>';

                    // prefixes
                    info += '# of Transit IPv4 prefixes: \t' + whois_all[w].transit_v4_prefixes + '\n';
                    info += '# of Transit IPv6 prefixes: \t' + whois_all[w].transit_v6_prefixes + '\n';
                    info += '# of Origin IPv4 prefixes: \t' + whois_all[w].origin_v4_prefixes + '\n';
                    info += '# of Origin IPv6 prefixes: \t' + whois_all[w].origin_v6_prefixes + '\n';

                    info += '</pre>';

                    info += '<h4>' + ' DATA: ' + '</h4>';

                    // raw data from whois

                    /*if ((typeof more_info.as_name != 'undefined')&&(more_info.as_name != null)) {
                     info += '<p>' + 'AS NAME: ' + more_info.as_name + '</p>';
                     }

                     if ((typeof more_info.org_id != 'undefined')&&(more_info.org_id != null)) {
                     info += '<p>' + 'Organisation ID: ' + more_info.org_id + '</p>';
                     }

                     if ((typeof more_info.org_name != 'undefined')&&(more_info.org_name != null)) {
                     info += '<p>' + 'Organisation: ' + more_info.org_name + '</p>';
                     }

                     if ((typeof more_info.remarks != 'undefined')&&(more_info.remarks != null)) {
                     info += '<p>' + 'Remarks: ' + more_info.remarks + '</p>';
                     }

                     if ((typeof more_info.address != 'undefined')&&(more_info.address != null)) {
                     info += '<p>' + 'Adress: ' + more_info.address + '</p>';
                     }

                     if ((typeof more_info.city != 'undefined')&&(more_info.city != null)) {
                     info += '<p>' + 'City: ' + more_info.city + '</p>';
                     }

                     if ((typeof more_info.state_prov != 'undefined')&&(more_info.state_prov != null)) {
                     info += '<p>' + 'State/Province: ' + more_info.state_prov + '</p>';
                     }

                     if ((typeof more_info.postal_code != 'undefined')&&(more_info.postal_code != null)) {
                     info += '<p>' + 'Postal code: ' + more_info.postal_code + '</p>';
                     }

                     if ((typeof more_info.country != 'undefined')&&(more_info.country != null)) {
                     info += '<p>' + 'Country: ' + more_info.country + '</p>';
                     }

                     if ((typeof more_info.timestamp != 'undefined')&&(more_info.timestamp != null)) {
                     info += '<p>' + 'Timestamp: ' + more_info.timestamp + '</p>';
                     }*/

                    if ((typeof more_info.raw_output != 'undefined') && (more_info.raw_output != null)) {
                        info += '<pre>' + 'Raw whois: ' + more_info.raw_output + '</pre>';
                    }

                    $("#whois_modal_body").html(info);

                    console.log(info);

                    $('#whois_modal').modal('show');
                });
            }
        },
        "columns": [
            {
                "data": "asn",
                "defaultContent": "unknown",
                "sWidth": "100px"
            },
            {
                "data": "isTransit",
                "defaultContent": "unknown",
                "sWidth": "70px"
            },
            {
                "data": "isOrigin",
                "defaultContent": "unknown",
                "sWidth": "70px"
            },
            {
                "data": "as_name",
                "defaultContent": "unknown",
                "sWidth": "200px"
            },
            {
                "data": "org_name",
                "defaultContent": "unknown",
                "sWidth": "200px"
            },
            {
                "data": "country",
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

        "bJQueryUI": true,
        "deferRender": true,
        "scrollCollapse": true,
        "paging": true,
        "info": true,
        "autoWidth": true
    });
});


//Get it! button pressed
$("#search_submit").click(function () {

    var search_content = $('#search_content').val();
    var wrong_data=true;

    console.log("Whois pressed!");

    counter = 0;

    $("#whois_panel").show(500);
    $("#whois_wrong").hide(100);
    $("#whois_table_container").hide(500);

    if ($.fn.dataTable.isDataTable('#whois_table')) {
        whoistable.destroy();
    }

    if (!isNaN(search_content)) {
        // if(/^\d+$/g.test(search_content)) {
        var req_whois = "http://odl-dev.openbmp.org:8001/db_rest/v1/whois/asn/" + search_content;

        whoistable = $('#whois_table').DataTable({
            "ajax": {
                "url": req_whois,
                "dataSrc": function (json) {
                    if (!jQuery.isEmptyObject(json)) {
                        if (json.gen_whois_asn.size != 0) {
                            whois_all = json.gen_whois_asn.data;
                            wrong_data = false;

                        } else {
                            $("#whois_wrong").show(500);
                        }
                    } else {
                        $("#whois_wrong").show(500);
                    }

                    return whois_all;
                }
            },
            "fnInitComplete": function () {
                if (!wrong_data) {
                    $("#whois_table_container").show(500);

                    // Click on row in Peers table
                    $('#whois_table_container tbody').on('click', 'tr', function () {
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

                        var more = "http://odl-dev.openbmp.org:8001/db_rest/v1/whois/asn/" + asn;
                        var more_info;

                        jQuery.ajax({
                            url: more,
                            success: function (result) {
                                more_info = result.gen_whois_asn.data[0];
                            },
                            async: false
                        });

                        console.log("more info: " + more_info);

                        console.log("Whois: " + whois_all[w]);

                        $("#whois_modal_label").text("AS" + whois_all[w].asn);

                        var info = '<h4>' + ' PREFIXES: ' + '</h4>' + '<pre>';

                        // prefixes
                        info += '# of Transit IPv4 prefixes: \t' + whois_all[w].transit_v4_prefixes + '\n';
                        info += '# of Transit IPv6 prefixes: \t' + whois_all[w].transit_v6_prefixes + '\n';
                        info += '# of Origin IPv4 prefixes: \t' + whois_all[w].origin_v4_prefixes + '\n';
                        info += '# of Origin IPv6 prefixes: \t' + whois_all[w].origin_v6_prefixes + '\n';

                        info += '</pre>';

                        info += '<h4>' + ' DATA: ' + '</h4>';

                        if ((typeof more_info.raw_output != 'undefined') && (more_info.raw_output != null)) {
                            info += '<pre>' + 'Raw whois: ' + more_info.raw_output + '</pre>';
                        }

                        $("#whois_modal_body").html(info);

                        console.log(info);

                        $('#whois_modal').modal('show');
                    });
                }
            },
            "columns": [
                {
                    "data": "asn",
                    "defaultContent": "unknown",
                    "sWidth": "100px"
                },
                {
                    "data": "isTransit",
                    "defaultContent": "unknown",
                    "sWidth": "70px"
                },
                {
                    "data": "isOrigin",
                    "defaultContent": "unknown",
                    "sWidth": "70px"
                },
                {
                    "data": "as_name",
                    "defaultContent": "unknown",
                    "sWidth": "200px"
                },
                {
                    "data": "org_name",
                    "defaultContent": "unknown",
                    "sWidth": "200px"
                },
                {
                    "data": "country",
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

            "bJQueryUI": true,
            "deferRender": true,
            "scrollCollapse": true,
            "paging": true,
            "info": true,
            "autoWidth": true
        });
    }

    else {
        req_whois = "http://odl-dev.openbmp.org:8001/db_rest/v1/whois/asn?where=w.as_name like '%" + search_content + "%' or w.org_name like '%" + search_content + "%'";

        whoistable = $('#whois_table').DataTable({
            "ajax": {
                "url": req_whois,
                "dataSrc": function (json) {
                    if (!jQuery.isEmptyObject(json)) {
                        if (json.w.size != 0) {
                            whois_all = json.w.data;
                            wrong_data = false;

                        } else {
                            $("#whois_wrong").show(500);
                        }
                    } else {
                        $("#whois_wrong").show(500);
                    }

                    return whois_all;
                }
            },
            "fnInitComplete": function () {
                if (!wrong_data) {
                    $("#whois_table_container").show(500);

                    // Click on row in Peers table
                    $('#whois_table_container tbody').on('click', 'tr', function () {
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

                        var more = "http://odl-dev.openbmp.org:8001/db_rest/v1/whois/asn/" + asn;
                        var more_info;

                        jQuery.ajax({
                            url: more,
                            success: function (result) {
                                more_info = result.gen_whois_asn.data[0];
                            },
                            async: false
                        });

                        console.log("more info: " + more_info);

                        console.log("Whois: " + whois_all[w]);

                        $("#whois_modal_label").text("AS" + whois_all[w].asn);

                        var info = '<h4>' + ' PREFIXES: ' + '</h4>' + '<pre>';

                        // prefixes
                        info += '# of Transit IPv4 prefixes: \t' + whois_all[w].transit_v4_prefixes + '\n';
                        info += '# of Transit IPv6 prefixes: \t' + whois_all[w].transit_v6_prefixes + '\n';
                        info += '# of Origin IPv4 prefixes: \t' + whois_all[w].origin_v4_prefixes + '\n';
                        info += '# of Origin IPv6 prefixes: \t' + whois_all[w].origin_v6_prefixes + '\n';

                        info += '</pre>';

                        info += '<h4>' + ' DATA: ' + '</h4>';

                        if ((typeof more_info.raw_output != 'undefined') && (more_info.
                                        raw_output

                                != null)) {
                            info += '<pre>' + 'Raw whois: ' + more_info.
                                    raw_output + '</pre>';
                        }

                        $("#whois_modal_body").html(info);

                        console.log(info);

                        $('#whois_modal').modal('show');
                    });
                }
            },
            "columns": [
                {
                    "data": "asn",
                    "defaultContent": "unknown",
                    "sWidth": "100px"
                },
                {
                    "data": "isTransit",
                    "defaultContent": "unknown",
                    "sWidth": "70px"
                },
                {
                    "data": "isOrigin",
                    "defaultContent": "unknown",
                    "sWidth": "70px"
                },
                {
                    "data": "as_name",
                    "defaultContent": "unknown",
                    "sWidth": "200px"
                },
                {
                    "data": "org_name",
                    "defaultContent": "unknown",
                    "sWidth": "200px"
                },
                {
                    "data": "country",
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

            "bJQueryUI": true,
            "deferRender": true,
            "scrollCollapse": true,
            "paging": true,
            "info": true,
            "autoWidth": true
        });
    }

});