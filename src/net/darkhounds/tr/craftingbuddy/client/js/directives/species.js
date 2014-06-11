trcraftingbuddy.directive('species', [function()                                {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/species.html',
        controller:     ['$scope', 'data', 'store', '$location', function($scope, data, store, $location) {
            var type                = 'specie';
            $scope.selected         = false;
            $scope.elements         = [];
            $scope.harvestableOnly  = false;
            $scope.search           = '';
            $scope.store            = function()                                {
                if (type && $scope.selected) store.add(type, $scope.selected?$scope.selected.id:0);
            };
            //
            $scope.$on('$locationChangeStart', function(nv)                     {
                var params      = $location.search();
                for (var i in $scope.elements)
                    if ($scope.elements[i].id == params[type])
                        $scope.selected = $scope.elements[i];
            });
            //
            $scope.$watch('selected', function(nv)                              {
                var params  = $location.search();
                if (!$scope.selected) return;
                params[type]    = $scope.selected.id
                $location.search(params);
            });
            //
            $scope.$watch('harvestableOnly', function(nv)                       {
                if (!data.loaded) return;
                var params      = $location.search();
                getData();
            });
            //
            $scope.$watch('search', function(nv)                                {
                if (!data.loaded) return;
                getData();
            });
            //
            function loadData()                                                 {
                data.$on('loaded', getData );
            }
            //
            function getData()                                                  {
                data.getSpecies($scope.search).$on('loaded', function(data)     {
                    $scope.elements.length  = 0;
                    var list                = data || [];
                    var params              = $location.search();
                    for (var i in list)                                         {
                        if ($scope.harvestableOnly && (!list[i].items || !list[i].items.length)) continue;
                        
                        $scope.elements.push(list[i]);
                        if ((($scope.search || !params[type]) && $scope.elements.length == 1) || (params.type == type && +params[type] == +list[i].id))
                            $scope.selected = list[i];
                    }
                });
            }
            //
            if (!data.loaded) loadData(); else getData();
        }]
    };
}]);

trcraftingbuddy.directive('specieItem', ['elementController', function(elementController) {
    return {
        scope:          {
            item: '='
        },
        templateUrl:    'html/templates/specieItem.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'item';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.item) return;
                var request     = data.getItem($scope.item.id);
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);

