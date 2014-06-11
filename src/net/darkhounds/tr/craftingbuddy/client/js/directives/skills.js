trcraftingbuddy.directive('skills', [function()                                 {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/skills.html',
        controller:     ['$scope', 'data', 'store', '$location', function($scope, data, store, $location) {
            var type            = 'skill';
            var params          = $location.search();
            $scope.selected     = false;
            $scope.elements     = [];
            $scope.craftingOnly = !params.crafting || params.crafting == '1';
            $scope.search       = '';
            $scope.store        = function()                                    {
                if (type && $scope.selected) store.add(type, $scope.selected?$scope.selected.id:0);
            };
            //
            $scope.$on('$locationChangeStart', function(nv)                     {
                var params          = $location.search();
                $scope.craftingOnly = params.crafting == '1';
                for (var i in $scope.elements)
                    if ($scope.elements[i].id == params[type])
                        $scope.selected = $scope.elements[i];
            });
            //
            $scope.$watch('selected', function(nv)                              {
                var params      = $location.search();
                if (!$scope.selected) return;
                params[type]    = $scope.selected.id;
                $location.search(params);
            });
            //
            $scope.$watch('craftingOnly', function(nv)                          {
                if (!data.loaded) return;
                var params      = $location.search();
                params.crafting = $scope.craftingOnly?1:0;
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
                data.getSkills($scope.search).$on('loaded', function(data)      {
                    $scope.elements.length  = 0;
                    var list                = data || [];
                    var params              = $location.search();
                    for (var i in list)                                         {
                        if ($scope.craftingOnly && (!list[i].recipes || !list[i].recipes.length)) continue;
                        
                        $scope.elements.push(list[i]);
                        if ((($scope.search || !params[type]) && $scope.elements.length == 1) || (params.type == type && params[type] == list[i].id))
                            $scope.selected = list[i];
                    }
                });
            }
            //
            if (!data.loaded) loadData(); else getData();
            //
        }]
    };
}]);

trcraftingbuddy.directive('skillRecipe', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/skillRecipe.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'recipe';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;
                var request     = data.getRecipe($scope.id + '');
                request.$on('loaded', function(data)                            {
                    $scope.element = data;
                });
            };
            controller.loadElement();
        }]
    }
}]);
