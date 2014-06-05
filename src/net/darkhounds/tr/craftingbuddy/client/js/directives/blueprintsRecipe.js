trcraftingbuddy.directive('blueprintsRecipe', [function()                        {
    return {
        scope:      {
            model: '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsRecipe.html',
        controller:     ['$scope', function($scope)                             {
            $scope.$watch('model', function(nv)                                 {
                if (!nv) return;
            });
        }]
    };
}]);
