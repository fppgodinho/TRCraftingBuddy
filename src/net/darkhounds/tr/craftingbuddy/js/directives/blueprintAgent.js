trcraftingbuddy.directive('blueprintAgent', [function()                         {
    return {
        scope:      {
            depth:      '=',
            component:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintAgent.html',
        controller:     ['$scope', function($scope)                             {
            $scope.items = [];
            //
            $scope.$watch('component', function(nv)                             {
                if (!nv) return;
                $scope.element      = null;
                $scope.items.length = 0;
                //
                for (var i in $scope.component.items)
                    $scope.items.push({item: $scope.component.items[i]});
            });
        }]
    };
}]);
