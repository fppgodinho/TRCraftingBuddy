trcraftingbuddy.directive('blueprintItem', [function()                          {
    return {
        scope:      {
            depth:  '=',
            item:   '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintItem.html',
        controller:     ['$scope', '$compile', '$element', function($scope, $compile, $element)     {
            $scope.recipes = [];
            //
            $scope.$watch('item', function(nv)                                  {
                if (!nv) return;
                $scope.element        = null;
                $scope.recipes.length = 0;
                //
                for (var i in $scope.item.resultOf)
                    $scope.recipes.push({item: $scope.item, recipe: $scope.item.resultOf[i]});
            });
            
            $scope.$watch('element', function(nv)                               {
                var recipe = $element.find('#RECIPE').empty();
                if (!nv) return;
                var node = angular.element('<div data-blueprint-recipe data-depth="depth" data-item="element.item" data-recipe="element.recipe"></div>').appendTo(recipe);
                $compile(node)($scope);
            });
            
        }]
    };
}]);
