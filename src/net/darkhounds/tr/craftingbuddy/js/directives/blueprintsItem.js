trcraftingbuddy.directive('blueprintsItem', [function()                         {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsItem.html',
        controller:     ['$scope', '$compile', '$element', function($scope, $compile, $element) {
            $scope.recipes  = []; 
            $scope.recipe   = null;
            
            $scope.$watch('model', function(nv)                                 {
                if (!nv) return;
                //
                $scope.recipe = nv.selected?nv.selected.recipe:null;
            });
            
            $scope.$watch('recipe', function(nv)                                {
                var recipe  = $element.find('#RECIPE').empty(); if (!nv) return;
                var node    = angular.element('<div data-model="model.selected" data-blueprints-recipe></div>').appendTo(recipe);
                $compile(node)($scope);
            });
        }]
    };
}]);
