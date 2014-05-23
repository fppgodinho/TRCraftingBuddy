trcraftingbuddy.directive('components', [function()                                {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/components.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            //
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.components)
                    $scope.items.push(data.components[id]);
                //
            }

            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.model = $scope.items[i];
            })
        }]
    };
}]);
