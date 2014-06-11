trcraftingbuddy.directive('fittings', [function()                                  {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/fittings.html',
        controller:     ['$scope', 'data', 'store', '$location', function($scope, data, store, $location) {
            var type            = 'fitting';
            $scope.selected     = false;
            $scope.elements     = [];
            $scope.crafted      = false;
            $scope.search       = '';
            $scope.store        = function()                                    {
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
            $scope.$watch('crafted', function(nv)                               {
                if (!data.loaded) return;
                if (nv) $scope.other    = false;
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
                data.getFittings($scope.search).$on('loaded', function(data)    {
                    $scope.elements.length  = 0;
                    var list                = data || [];
                    var params              = $location.search();
                    for (var i in list)                                         {
                        if ($scope.crafted && (!list[i].craftable)) continue;
                        
                        $scope.elements.push(list[i]);
                        if ((($scope.search || !params[type]) && $scope.elements.length == 1) || (params.type == type && params[type] == list[i].id))
                            $scope.selected = list[i];
                    }
                });
            }
            //
            if (!data.loaded) loadData(); else getData();
        }]
    };
}]);

trcraftingbuddy.directive('fittingRecipe', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/fittingRecipe.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'recipe';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;
                var request     = data.getRecipe($scope.id);
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);
