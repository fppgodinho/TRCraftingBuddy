trcraftingbuddy.directive('items', [function()                                  {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/items.html',
        controller:     ['$scope', 'data', 'store', '$location', function($scope, data, store, $location) {
            var type            = 'item';
            $scope.selected     = false;
            $scope.elements     = [];
            $scope.crafted      = false;
            $scope.harvested    = false;
            $scope.other        = false;
            $scope.crafted      = false;
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
            $scope.$watch('crafted', function(nv)                               {
                if (!data.loaded) return;
                if (nv) $scope.other    = false;
                var params      = $location.search();
                getData();
            });
            //
            $scope.$watch('harvested', function(nv)                             {
                if (!data.loaded) return;
                var params      = $location.search();
                if (nv) $scope.other    = false;
                getData();
            });
            //
            $scope.$watch('other', function(nv)                                 {
                if (!data.loaded) return;
                if (nv)                                                         {
                    $scope.crafted      = false;
                    $scope.harvested    = false;
                }
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
                data.getItems($scope.search).$on('loaded', function(data)       {
                    $scope.elements.length  = 0;
                    var list                = data || [];
                    var params              = $location.search();
                    for (var i in list)                                         {
                        if ($scope.crafted && (!list[i].resultOf || !list[i].resultOf.length)) continue;
                        if ($scope.harvested && (!list[i].species || !list[i].species.length)) continue;
                        if ($scope.other && ((list[i].species && list[i].species.length) || (list[i].resultOf && list[i].resultOf.length))) continue;
                        
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

trcraftingbuddy.directive('itemRecipe', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/itemRecipe.html',
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

trcraftingbuddy.directive('itemSpecie', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/itemSpecie.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'specie';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;
                var request     = data.getSpecie($scope.id + '');
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);

trcraftingbuddy.directive('itemUsedin', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/itemUsedin.html',
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

trcraftingbuddy.directive('itemComponent', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/itemComponent.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'component';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;
                var request     = data.getComponent($scope.id + '');
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);

trcraftingbuddy.directive('itemFilter', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/itemFilter.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'filter';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;
                var request     = data.getFilter($scope.id + '');
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);
