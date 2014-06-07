trcraftingbuddy.directive('filters', [function()                                {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/filters.html',
        controller:     ['$scope', 'data', 'store', '$location', function($scope, data, store, $location) {
            var type            = 'filter';
            $scope.selected     = false;
            $scope.elements     = [];
            $scope.search       = '';
            $scope.store        = function()                                    {
                if (type && $scope.selected) store.add(type, $scope.selected);
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
                data.getFilters($scope.search).$on('loaded', function(data)     {
                    $scope.elements.length  = 0;
                    var list                = data || [];
                    var params              = $location.search();
                    for (var i in list)                                         {
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

trcraftingbuddy.directive('filterRecipe', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/filterRecipe.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'recipe';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;
                var request     = data.getRecipe($scope.id + '');
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);

trcraftingbuddy.directive('filterItem', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/filterItem.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'item';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;
                var request     = data.getItem($scope.id + '');
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);
