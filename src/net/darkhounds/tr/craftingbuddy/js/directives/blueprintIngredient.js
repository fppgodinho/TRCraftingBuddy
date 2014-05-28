trcraftingbuddy.directive('blueprintIngredient', [function()                    {
    return {
        scope:      {
            depth:      '=',
            component:  '=',
            filter:     '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintIngredient.html',
        controller:     ['$scope', function($scope)                             {
            $scope.items = [];
            //
            var checkItems = false;
            setInterval(function ()                                             {
                if (!checkItems) return; checkItems = false;
                $scope.element      = null;
                $scope.items.length = 0;
                if (!$scope.component) return;
                //
                if ($scope.filter && $scope.filter.id) for (var i in $scope.filter.items)
                    $scope.items.push({item: $scope.filter.items[i]});
                else for (var i in $scope.component.items)
                    $scope.items.push({item: $scope.component.items[i]});
                $scope.$apply();
            }, 10);
            //
            $scope.$watch('component',  function() { checkItems = true;         });
            $scope.$watch('filter',     function() { checkItems = true;         });
        }]
    };
}]);
