trcraftingbuddy.directive('storeList', [function()                                  {
    return {
        scope:      {
        },
        replace:        true,
        templateUrl:    'html/templates/storeList.html',
        controller:     ['$scope', '$location', 'store', 'data', function($scope, $location, store, data) {
            $scope.items = [];
            
            $scope.$watch(function () {return store.items;}, function(nv)       {
                $scope.items = nv;
            });
            
            
        }]
    };
}]);
