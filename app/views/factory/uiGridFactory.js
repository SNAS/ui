angular.module('bmpUiApp')
.factory('uiGridFactory', function() {
  var factory = {};

  factory.calGridHeight = function(gridOptions, gridApi, rowHeight, rowLimit, extraHeight) {
    rowHeight = typeof rowHeight !== 'undefined' ? rowHeight : 30;
    rowLimit = typeof rowLimit !== 'undefined' ? rowLimit : 10;
    extraHeight = typeof extraHeight !== 'undefined' ? extraHeight : 75;
    gridApi.core.handleWindowResize();
    if (gridOptions.data.length > rowLimit) {
      gridOptions.height = rowHeight * rowLimit + extraHeight;
    } else {
      gridOptions.height = gridOptions.data.length * rowHeight + extraHeight;
    }
  };

  return factory;
});
