trcraftingbuddy.directive('blueprint', [function()                                  {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprint.html',
        controller:     ['$scope', function($scope)                             {
            $scope.recipes  = [];
            $scope.depth    = 0;
            $scope.$watch('model', function(nv)                                 {
                if (!nv) return;
                $scope.recipes.length   = 0;
                $scope.element          = null;
                
                for (var i in $scope.model.resultOf)
                    $scope.recipes.push({item: $scope.model, recipe: $scope.model.resultOf[i]});
                
            });
        }]
    };
}]);
