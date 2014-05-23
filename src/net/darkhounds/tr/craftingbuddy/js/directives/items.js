trcraftingbuddy.directive('items', [function()                                {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/items.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            $scope.crafted      = true;
            $scope.harvested    = true;
            $scope.other        = true;
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            $scope.$watch('crafted', function(nv) { updateList();               })
            $scope.$watch('harvested', function(nv) { updateList();             })
            $scope.$watch('other', function(nv) { updateList();                 })
            //
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.items) {
                    var valid = false;
                    if ($scope.other && (!data.items[id].species || !data.items[id].species.length) && (!data.items[id].resultOf || !data.items[id].resultOf.length))
                        valid = true;
                    if ($scope.crafted && data.items[id].resultOf && data.items[id].resultOf.length)
                        valid = true;
                    if ($scope.harvested && data.items[id].species && data.items[id].species.length)
                        valid = true;
                    if(valid) $scope.items.push(data.items[id]);
                }
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
