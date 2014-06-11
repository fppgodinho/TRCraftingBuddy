trcraftingbuddy.directive('recipes', [function()                                {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/recipes.html',
        controller:     ['$scope', 'data', 'store', '$location', function($scope, data, store, $location) {
            var type            = 'recipe';
            $scope.selected     = false;
            $scope.elements     = [];
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
                data.getRecipes($scope.search).$on('loaded', function(data)     {
                    $scope.elements.length  = 0;
                    var list                = data || [];
                    var params              = $location.search();
                    for (var i in list)                                         {
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

trcraftingbuddy.directive('recipeIngredient', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/recipeIngredient.html',
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

trcraftingbuddy.directive('recipeAgent', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/recipeAgent.html',
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

trcraftingbuddy.directive('recipeSkill', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/recipeSkill.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'skill';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;
                var request     = data.getSkill($scope.id + '');
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);

trcraftingbuddy.directive('recipeResult', ['elementController', function(elementController) {
    return {
        scope:          {
            element: '='
        },
        templateUrl:    'html/templates/recipeResult.html',
        replace:        true,
        controller:     ['$scope', function($scope) {                           }]
    }
}]);

trcraftingbuddy.directive('recipeResultItem', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/recipeResultItem.html',
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

trcraftingbuddy.directive('recipeResultFilter', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/recipeResultFilter.html',
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
