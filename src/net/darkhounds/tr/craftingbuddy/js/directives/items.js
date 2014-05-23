trcraftingbuddy.directive('items', [function()                                {
    return {
        scope:      {
            recipe:     '=',
            component:  '=',
            filter:     '=',
            item:       '=',
            specie:     '='
        },
        replace:        true,
        templateUrl:    'html/templates/items.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            //
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.items)
                    $scope.items.push(data.items[id]);
                //
            }

            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.item = $scope.items[i];
            })
        }]
    };
}]);
