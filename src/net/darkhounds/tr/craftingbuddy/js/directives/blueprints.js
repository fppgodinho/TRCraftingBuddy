trcraftingbuddy.directive('blueprints', [function()                              {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprints.html',
        controller:     ['$scope', 'data', 'blueprint', function($scope, data, blueprint) {
            $scope.search       = '';
            $scope.items        = [];
            $scope.recipe       = null;
            
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                $scope.items.length = 0;
                for (var id in data.items) $scope.items.push(data.items[id]);
            });
            
            $scope.$watch('model', function(nv)                                 {
                if (!nv) return;
                //
                $scope.blueprint        = blueprint.initialize(nv);
                $scope.recipe           = $scope.blueprint.selected.recipe;
            });
            
            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.model = $scope.items[i];
            });
        }]
    };
}]);
