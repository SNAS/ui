//'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:ASViewController
 * @description
 * # ASViewController
 * Controller of the AS View page
 */
angular.module('bmpUiApp')
    .controller('ASViewController', ['$scope', 'apiFactory', '$timeout', '$stateParams', 'uiGridConstants',
        function ($scope, apiFactory, $timeout, $stateParams, uiGridConstants) {

            //var suggestions = [];
            var upstreamData, downstreamData;
            var upstreamPromise, downstreamPromise;
            //var nodes = [], links = [], nodeSet = [];
            var id = 0;
            window.topo = {};
            var width = 1150;
            //var topoHeight = 800;
            //var space = width;

            $scope.prefixGridInitHeight = 464;
            $scope.upstreamGridInitHeight = 464;
            $scope.downstreamGridInitHeight = 464;

            $scope.nodata = false;
            $scope.upstreamNodata = false;
            $scope.downstreamNodata = false;

            //prefix table options
            $scope.prefixGridOptions = {
                rowHeight: 32,
                gridFooterHeight: 0,
                showGridFooter: true,
                enableFiltering: true,
                height: $scope.prefixGridInitHeight,
                changeHeight: $scope.prefixGridInitHeight,
                enableHorizontalScrollbar: 0,
                enableVerticalScrollbar: 1,
                columnDefs: [
                    {
                        name: "prefixWithLen", displayName: 'Prefix', width: '*'
                        //sortingAlgorithm: addressSort
                    },
                    {
                        name: "IPv", displayName: 'IPv', width: '*', visible: false,
                        sort: {
                            direction: uiGridConstants.ASC
                        }
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.prefixGridApi = gridApi;
                }
            };

            //upstream table options
            $scope.upstreamGridOptions = {
                enableColumnResizing: true,
                rowHeight: 32,
                gridFooterHeight: 0,
                showGridFooter: true,
                height: $scope.upstreamGridInitHeight,
                changeHeight: $scope.upstreamGridInitHeight,
                enableHorizontalScrollbar: 0,
                enableVerticalScrollbar: 1,
                columnDefs: [
                    {
                        name: "asn", displayName: 'ASN', width: '30%',
                        cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
                    },
                    {name: "as_name", displayName: 'AS Name', width: '70%'}
                ],
                onRegisterApi: function (gridApi) {
                    $scope.upstreamGridApi = gridApi;
                }
            };

            //downstream table options
            $scope.downstreamGridOptions = {
                enableColumnResizing: true,
                rowHeight: 32,
                gridFooterHeight: 0,
                showGridFooter: true,
                height: $scope.downstreamGridInitHeight,
                changeHeight: $scope.downstreamGridInitHeight,
                enableHorizontalScrollbar: 0,
                enableVerticalScrollbar: 1,
                columnDefs: [
                    {
                        name: "asn",
                        displayName: 'ASN',
                        width: '30%',
                        cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
                    },
                    {name: "as_name", displayName: 'AS Name', width: '70%'}
                ],
                onRegisterApi: function (gridApi) {
                    $scope.downstreamGridApi = gridApi;
                }
            };


            $scope.calGridHeight = function (grid, gridapi) {
                gridapi.core.handleWindowResize();

                var height;
                var dataLength = 15;
                if (grid.data.length > dataLength) {
                    height = (dataLength * 30);
                } else {
                    height = ((grid.data.length * grid.rowHeight) + 50);
                }
                grid.changeHeight = height;
                gridapi.grid.gridHeight = grid.changeHeight;
            };

            $scope.keypress = function (keyEvent) {
                if (keyEvent.which === 13)
                    searchValueFn($scope.searchValue);
            };

            //used for getting suggestions
            $scope.getSuggestions = function (val) {
                return apiFactory.getWhoIsASNameLike(val, 10).then(function (response) {
                    return response.data.w.data.map(function (item) {
                        return item.as_name; //+" (ASN: "+item.asn+")";
                    });
                });
            };

            $scope.onSelect = function ($item, $model, $label) {
                $scope.searchValue = $label;
                searchValueFn();
            };

            //Main function
            $(function () {
                //initial search
                if ($stateParams.as) {
                    $scope.searchValue = $stateParams.as;
                }
                else {
                    $scope.searchValue = 109;
                }
                //topoInit();
                searchValueFn();
            });

            //get all the information of this AS
            function searchValueFn() {
                if (isNaN($scope.searchValue)) {
                    apiFactory.getWhoIsASName($scope.searchValue).
                        success(function (result) {
                            var data = result.w.data;
                            getData(data);
                        }).
                        error(function (error) {

                            console.log(error.message);
                        });
                }
                else {
                    apiFactory.getWhoIsASN($scope.searchValue).
                        success(function (result) {
                            var data = result.gen_whois_asn.data;
                            getData(data);
                        }).
                        error(function (error) {

                            console.log(error.message);
                        });
                }
            }

            var tempData;

            //get data about details, prefixes, upstream and downstream
            function getData(data) {
                if (data.length != 0) {
                    $scope.asn = data[0].asn;
                    getDetails(data[0]);
                    getPrefixes();
                    getUpstream();
                    getDownstream();

                    //$scope.topologyIsLoad = true; //start loading
                    downstreamPromise.success(function () {
                        upstreamPromise.success(function () {
                            topoClear();
                            drawD3(data[0]);
                        });
                    });

                    //$scope.topoReload = function () {
                    //    topoClear();
                    //    drawTopology(data[0]);
                    //};

                    $scope.nodata = false;
                }
                else {
                    $scope.nodata = true;
                }
            }


            //Get detailed information of this AS
            function getDetails(data) {
                var keys = Object.keys(data);
                var showValues = '<table class="tableStyle"><tbody>';

                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (key != "raw_output" && key != "remarks") {
                        if (key == "transit_v4_prefixes")
                            showValues += '<tr class="hoz-line"><td colspan="2"><hr></td></tr>';

                        var value = data[key];
                        showValues += (
                            '<tr>' +
                            '<td>' +
                            key + ' ' +
                            '</td>' +

                            '<td>' +
                            value +
                            '</td>' +
                            '</tr>'
                        );
                    }
                }
                showValues += '</tbody></table>';
                $scope.details = showValues;
            }

            //Get prefixes information of this AS
            function getPrefixes() {
                $scope.prefixGridOptions.data = [];
                $scope.prefixIsLoad = true; //begin loading
                apiFactory.getRIBbyASN($scope.asn).
                    success(function (result) {
                        var data = result.v_routes.data;
                        for (var i = 0; i < result.v_routes.size; i++) {
                            data[i].prefixWithLen = data[i].Prefix + "/" + data[i].PrefixLen;
                            data[i].IPv = (data[i].isIPv4 === 1) ? '4' : '6';
                        }
                        $scope.prefixGridOptions.data = data;
                        $scope.prefixIsLoad = false; //stop loading
                        $scope.calGridHeight($scope.prefixGridOptions, $scope.prefixGridApi);
                    }).
                    error(function (error) {

                        console.log(error.message);
                    });
            }

            //Get upstream data
            function getUpstream() {
                upstreamData = [];
                $scope.upstreamIsLoad = true; //begin loading
                $scope.upstreamGridOptions.data = [];
                upstreamPromise = apiFactory.getUpstream($scope.asn);
                upstreamPromise.success(function (result) {
                    upstreamData = result.upstreamASN.data;
                    if (result.upstreamASN.data.length == 0) {
                        $scope.upstreamNodata = true;
                        $scope.upstreamIsLoad = false; //stop loading
                        $scope.upstreamGridOptions.data = [];
                        $scope.upstreamGridOptions.changeHeight = 150;
                        $scope.upstreamGridApi.grid.gridHeight = 150;
                        $scope.upstreamGridOptions.showGridFooter = false;
                    }
                    else {
                        $scope.upstreamGridOptions.data = upstreamData;
                        $scope.calGridHeight($scope.upstreamGridOptions, $scope.upstreamGridApi);
                        $scope.upstreamIsLoad = false; //stop loading
                        $scope.upstreamNodata = false;
                    }
                }).
                    error(function (error) {

                        console.log(error.message);
                    });
            }

            //Get downstream data
            function getDownstream() {
                downstreamData = [];
                $scope.downstreamIsLoad = true; //begin loading
                $scope.downstreamGridOptions.data = [];
                downstreamPromise = apiFactory.getDownstream($scope.asn);
                downstreamPromise.success(function (result) {
                    downstreamData = result.downstreamASN.data;
                    if (result.downstreamASN.data.length == 0) {
                        $scope.downstreamNodata = true;
                        $scope.downstreamIsLoad = false; //stop loading
                        $scope.downstreamGridOptions.data = [];
                        $scope.downstreamGridOptions.changeHeight = 150;
                        $scope.downstreamGridApi.grid.gridHeight = 150;
                        $scope.downstreamGridOptions.showGridFooter = false;
                    }
                    else {
                        $scope.downstreamGridOptions.data = downstreamData;
                        $scope.calGridHeight($scope.downstreamGridOptions, $scope.downstreamGridApi);
                        $scope.downstreamIsLoad = false; //stop loading
                        $scope.downstreamNodata = false;
                    }
                }).
                    error(function (error) {

                        console.log(error.message);
                    });
            }

            function topoClear() {
                d3.select("svg").remove();
            }

            //draw AS topology with current AS in the middle
            function drawD3(data) {

                var sort_by = function (field, reverse, primer) {

                    var key = primer ?
                        function (x) {
                            return primer(x[field])
                        } :
                        function (x) {
                            return x[field]
                        };

                    reverse = !reverse ? 1 : -1;

                    return function (a, b) {
                        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
                    }
                };

                //current AS
                var root = {
                    name: data.as_name === null ? data.asn : data.as_name,
                    asn: data.asn,
                    as_name: data.as_name,
                    org_name: data.org_name,
                    city: data.city,
                    state_prov: data.state_prov,
                    country: data.country,
                    type: "root"
                    //iconType: 'groupS',
                };

                upstreamData.forEach(function (e) {
                    e.name = e.as_name === null ? e.asn : e.as_name;
                    if (e.country != null) {
                        e.countryCode = getCode(e.country.toUpperCase());
                        e.country = getName(e.countryCode.toUpperCase());
                    }
                    else {
                        e.countryCode = "[UNKNOWN]";
                        e.country = "[UNKNOWN]";
                    }
                    if (e.countryCode != "[UNKNOWN]") {
                        e.continent = getContinent(e.countryCode);
                    }
                    if (e.state_prov != null)
                        e.state_prov = e.state_prov;
                    else
                        e.state_prov = "[UNKNOWN]";
                    if (e.city != null)
                        e.city = e.city;
                    else
                        e.city = "[UNKNOWN]";
                    e.org_name = e.org_name ? e.org_name : "[UNKNOWN]";
                    e.type = "UPSTREAM";
                    e.dataType = "AS";
                });
                downstreamData.forEach(function (e) {
                    e.name = e.as_name === null ? e.asn : e.as_name;
                    if (e.country != null) {
                        e.countryCode = getCode(e.country);
                        e.country = getName(e.countryCode);
                    }
                    else {
                        e.countryCode = "[UNKNOWN]";
                        e.country = "[UNKNOWN]";
                    }
                    if (e.countryCode != "[UNKNOWN]") {
                        e.continent = getContinent(e.countryCode);
                    }
                    else {
                        e.continent = "[UNKNOWN]";
                    }
                    if (e.state_prov != null)
                        e.state_prov = e.state_prov;
                    else
                        e.state_prov = "[UNKNOWN]";
                    if (e.city != null)
                        e.city = e.city;
                    else
                        e.city = "[UNKNOWN]";
                    e.org_name = e.org_name ? e.org_name : "[UNKNOWN]";
                    e.type = "DOWNSTREAM";
                    e.dataType = "AS";
                });


                var height;
                if (upstreamData.length + downstreamData.length > 2000)
                    height = (upstreamData.length > downstreamData.length ? upstreamData.length : downstreamData.length) * 0.4;
                else
                    height = 1200;

                $('.d3-container').css('height', (height + 100));

                var containerWidth = $(".d3-container").width();


                var upAndDown = {};
                upAndDown.upstreamData = upstreamData;
                upAndDown.downstreamData = downstreamData;

                if (upstreamData.length > 150) {
                    groupNode(upAndDown, "UPSTREAM");
                }
                else {
                    upAndDown.upstreamData.sort(sort_by('name', false, function (a) {
                        return a.toUpperCase()
                    }));
                }
                //Downstream ASes
                if (downstreamData.length > 150) {
                    groupNode(upAndDown, "DOWNSTREAM");
                }
                else {
                    upAndDown.downstreamData.sort(sort_by('name', false, function (a) {
                        return a.toUpperCase()
                    }));
                }

                root.children = [];
                if (upstreamData.length > 0)
                    root.children.push({
                        name: "UPSTREAM ASES",
                        children: upAndDown.upstreamData,
                        type: "UPSTREAM"
                    });
                if (downstreamData.length > 0)
                    root.children.push({
                        name: "DOWNSTREAM ASES",
                        children: upAndDown.downstreamData,
                        type: "DOWNSTREAM"
                    });

                var m = [0, 120, 0, 120],
                    w = containerWidth - m[1] - m[3],
                    h = height - m[0] - m[2],
                    i = 0;

                var tree = d3.layout.tree()
                    .size([h, w]);

                var diagonal = d3.svg.diagonal()
                    .projection(function (d) {
                        return [d.y, d.x];
                    });

                var vis = d3.select("d3").append("svg:svg")
                    .attr("width", w + m[1] + m[3])
                    .attr("height", h + m[0] + m[2])
                    .append("svg:g")
                    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

                var tipcolor, tipas;

                var upColor = "#FF4448";
                var downColor = "#5CC5EF";

                var tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function () {
                        switch (tipas.dataType) {
                            case "CONTINENT":
                            {
                                return "<span style='color:" + tipcolor + "'>" + tipas.name + "</span>";
                            }
                            case "COUNTRY":
                            {
                                return "<span style='color:" + tipcolor + "'>" + tipas.country + "</span>";
                            }
                            case "STATE":
                            {
                                return "<span style='color:" + tipcolor + "'>" + tipas.name + "</span>";
                            }
                            case "CITY":
                            {
                                return "<span style='color:" + tipcolor + "'>" + tipas.name + "</span>";
                            }
                            case "AS":
                            {
                                return "<strong>Name:</strong> <span style='color:" + tipcolor + "'>" + tipas.as_name + "</span>" + "<br>"
                                    + "<strong>AS Number:</strong> <span style='color:" + tipcolor + "'>" + tipas.asn + "</span>" + "<br>"
                                    + "<strong>Org Name:</strong> <span style='color:" + tipcolor + "'>" + tipas.org_name + "</span>" + "<br>"
                                    + "<strong>Continent:</strong> <span style='color:" + tipcolor + "'>" + tipas.continent + "</span>" + "<br>"
                                    + "<strong>Country:</strong> <span style='color:" + tipcolor + "'>" + tipas.country + "</span>" + "<br>"
                                    + "<strong>State/Prov:</strong> <span style='color:" + tipcolor + "'>" + tipas.state_prov + "</span>" + "<br>"
                                    + "<strong>City:</strong> <span style='color:" + tipcolor + "'>" + tipas.city + "</span>" + "<br>";
                            }
                            default:
                            {
                                return "<span style='color:white'>" + tipas.name + "</span>";
                            }
                        }
                    });

                vis.call(tip);

                root.x0 = h / 2;
                root.y0 = 0;

                function toggleAll(d) {
                    if (d.children) {
                        d.children.forEach(toggleAll);
                        toggle(d);
                    }
                }

                // Initialize the display to show a few nodes.
                root.children.forEach(toggleAll);
                root.children.forEach(function (children) {
                    toggle(children)
                });

                update(root);

                function update(source) {
                    var duration = d3.event && d3.event.altKey ? 5000 : 500;

                    // Compute the new tree layout.
                    var nodes = tree.nodes(root).reverse();

                    // Normalize for fixed-depth.
                    nodes.forEach(function (d) {
                        d.y = d.depth * 180;
                    });

                    // Update the nodes…
                    var node = vis.selectAll("g.node")
                        .data(nodes, function (d) {
                            return d.id || (d.id = ++i);
                        });

                    // Enter any new nodes at the parent's previous position.
                    var nodeEnter = node.enter().append("svg:g")
                        .attr("class", "node")
                        .attr("transform", function (d) {
                            return "translate(" + source.y0 + "," + source.x0 + ")";
                        })
                        .on("click", function (d) {
                            toggle(d);
                            update(d);
                        })
                        .on("mouseover", function (d) {
                            tipas = d;
                            if (d.type === "UPSTREAM")
                                tipcolor = upColor;
                            else if (d.type === "DOWNSTREAM")
                                tipcolor = downColor;
                            tip.show();
                        })
                        .on("mouseout", tip.hide);

                    nodeEnter.append("svg:circle")
                        .attr("r", 1e-6)
                        .style("fill", function (d) {
                            return d._children ? "gray" : "#fff";
                        })
                        .style("stroke", function (d) {
                            if (d.type === "UPSTREAM")
                                return upColor;
                            else if (d.type === "DOWNSTREAM")
                                return downColor;
                        });

                    nodeEnter.append("svg:text")
                        .attr("x", function (d) {
                            return d.children || d._children ? -6 : 7;
                        })
                        .attr("dy", ".35em")
                        .attr("text-anchor", function (d) {
                            return d.children || d._children ? "end" : "start";
                        })
                        .text(function (d) {
                            return d.name.length > 15 ? d.name.substring(0, 14) + "..." : d.name;
                        })
                        .style("font-weight", function (d) {
                            return d.children || d._children ? "regular" : "bold";
                        })
                        .style("fill-opacity", 1e-6);

                    // Transition nodes to their new position.
                    var nodeUpdate = node.transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + d.y + "," + d.x + ")";
                        });

                    nodeUpdate.select("circle")
                        .attr("r", 4.5)
                        .style("fill", function (d) {
                            return d._children ? "lightgrey" : "#fff";
                        });

                    nodeUpdate.select("text")
                        .style("fill-opacity", 1);

                    // Transition exiting nodes to the parent's new position.
                    var nodeExit = node.exit().transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + source.y + "," + source.x + ")";
                        })
                        .remove();

                    nodeExit.select("circle")
                        .attr("r", 1e-6);

                    nodeExit.select("text")
                        .style("fill-opacity", 1e-6);

                    // Update the links…
                    var link = vis.selectAll("path.link")
                        .data(tree.links(nodes), function (d) {
                            return d.target.id;
                        });

                    // Enter any new links at the parent's previous position.
                    link.enter().insert("svg:path", "g")
                        .attr("class", "link")
                        .attr("d", function (d) {
                            var o = {x: source.x0, y: source.y0};
                            return diagonal({source: o, target: o});
                        })
                        .transition()
                        .duration(duration)
                        .attr("d", diagonal);

                    // Transition links to their new position.
                    link.transition()
                        .duration(duration)
                        .attr("d", diagonal);

                    // Transition exiting nodes to the parent's new position.
                    link.exit().transition()
                        .duration(duration)
                        .attr("d", function (d) {
                            var o = {x: source.x, y: source.y};
                            return diagonal({source: o, target: o});
                        })
                        .remove();

                    // Stash the old positions for transition.
                    nodes.forEach(function (d) {
                        d.x0 = d.x;
                        d.y0 = d.y;
                    });

                }

                // Toggle children.
                function toggle(d) {
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                    }
                }

                function groupNode(data, type) {

                    var continents = [], countries = [], states = [], cities = [];
                    var target = [];
                    if (type === "UPSTREAM")
                        target = data.upstreamData;
                    else if (type === "DOWNSTREAM")
                        target = data.downstreamData;

                    var continentMatch, countryMatch, stateMatch, cityMatch;
                    var indexContinent, indexCountry, indexState, indexCity;

                    target.forEach(function (j) {
                        continentMatch =
                            countryMatch =
                                stateMatch =
                                    cityMatch = false;
                        indexContinent =
                            indexCountry =
                                indexState =
                                    indexCity = false;

                        continents.forEach(function (continent) {
                            if (continent.name === j.continent) {
                                continentMatch = true;
                                indexContinent = continents.indexOf(continent);
                            }
                        });
                        if (!continentMatch) {
                            continents[continents.length] = {
                                name: j.continent,
                                children: [],
                                type: type,
                                dataType: "CONTINENT"
                            };
                            continentMatch = true;
                            indexContinent = continents.length - 1;
                        }
                        countries = continents[indexContinent].children;
                        countries.forEach(function (country) {
                            if (country.name === j.countryCode) {
                                countryMatch = true;
                                indexCountry = countries.indexOf(country);
                            }
                        });
                        if (!countryMatch) {
                            countries[countries.length] = {
                                name: j.countryCode,
                                country: j.country,
                                children: [],
                                type: type,
                                dataType: "COUNTRY"
                            };
                            countryMatch = true;
                            indexCountry = countries.length - 1;
                        }
                        states = countries[indexCountry].children;
                        states.forEach(function (state) {
                            if (state.name === j.state_prov) {
                                stateMatch = true;
                                indexState = states.indexOf(state);
                            }
                        });
                        if (!stateMatch) {
                            states[states.length] = {
                                name: j.state_prov,
                                children: [],
                                type: type,
                                dataType: "STATE"
                            };
                            stateMatch = true;
                            indexState = states.length - 1;
                        }
                        cities = states[indexState].children;
                        cities.forEach(function (city) {
                            if (city.name === j.city) {
                                cityMatch = true;
                                indexCity = cities.indexOf(city);
                            }

                        });
                        if (!cityMatch) {
                            cities[cities.length] = {
                                name: j.city,
                                children: [],
                                type: type,
                                dataType: "CITY"
                            };
                            cityMatch = true;
                            indexCity = cities.length - 1;
                        }

                        //MAKE PUSH
                        cities[indexCity].children.push(j);

                    });

                    //SORT
                    continents.forEach(function (continent) {
                        continent.children.forEach(function (country) {
                            country.children.forEach(function (state) {
                                state.children.forEach(function (city) {
                                    city.children.sort(sort_by('name', false, null));
                                });
                                state.children.sort(sort_by('name', false, null));
                            });
                            country.children.sort(sort_by('name', false, null));
                        });
                        continent.children.sort(sort_by('name', false, null));
                    });

                    continents.sort(sort_by('name', false, null));

                    if (type === "UPSTREAM")
                        data.upstreamData = continents;
                    if (type === "DOWNSTREAM")
                        data.downstreamData = continents;

                }
            }
        }

    ])
;
