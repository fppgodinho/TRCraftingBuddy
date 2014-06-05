trcraftingbuddy.directive('species', [function()                                {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/species.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items            = [];
            $scope.harvestableOnly  = true;
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            $scope.$watch('harvestableOnly', function(nv) { updateList();       })
            //
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.species)
                    if (!$scope.harvestableOnly || (data.species[id].items && data.species[id].items.length))
                        $scope.items.push(data.species[id]);
                //
            }
            //
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
