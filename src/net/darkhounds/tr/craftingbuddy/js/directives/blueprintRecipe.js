trcraftingbuddy.directive('blueprintRecipe', [function()                        {
    return {
        scope:      {
            depth:  '=',
            item:   '=',
            recipe: '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintRecipe.html',
        controller:     ['$scope', function($scope)                             {
            $scope.depth        += 1;
            $scope.ingredients  = [];
            $scope.agents       = [];
            $scope.$watch('recipe', function(nv)                                {
                if (!nv) return;
                $scope.element              = null;
                $scope.ingredients.length   = 0;
                $scope.agents.length        = 0;
                //
                for (var i in $scope.recipe.results)                            {
                    var result = $scope.recipe.results[i]
                    if (result.id != $scope.item.id) continue;
                    $scope.result = result;
                    //
                    for (var j in $scope.recipe.ingredients)                    {
                        j = +j;
                        $scope.ingredients.push({filter: result['filter' + (j+1)], component: $scope.recipe.ingredients[j]});
                    }
                    //
                    for (var j in $scope.recipe.agents)
                        $scope.agents.push({component: $scope.recipe.agents[j]});
                }
            });
        }]
    };
}]);
