trcraftingbuddy.directive('blueprints', [function()                              {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/blueprints.html',
        controller:     ['$scope', 'data', 'store', '$location', function($scope, data, store, $location) {
            $scope.selected     = false;
            $scope.elements     = [];
            $scope.search       = '';
            $scope.store        = function()                                    {
                if ($scope.selected) store.add('item', $scope.selected?$scope.selected.id:0);
            };
            //
            $scope.$on('$locationChangeStart', function(nv)                     {
                var params      = $location.search();
                for (var i in $scope.elements)
                    if ($scope.elements[i].id == params.blueprint)
                        $scope.selected = $scope.elements[i];
            });
            //
            $scope.$watch('selected', function(nv)                              {
                var params  = $location.search();
                if (!$scope.selected) return;
                params.blueprint    = $scope.selected.id;
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
                data.getItems($scope.search).$on('loaded', function(data)       {
                    $scope.elements.length  = 0;
                    var list                = data || [];
                    var params              = $location.search();
                    for (var i in list)                                         {
                        if (!list[i].resultOf || !list[i].resultOf.length) continue;

                        $scope.elements.push(list[i]);
                        if ((($scope.search || !params.blueprint) && $scope.elements.length == 1) || (params.type == 'blueprint' && params.blueprint == list[i].id))
                            $scope.selected = list[i];
                    }
                });
            }
            //
            if (!data.loaded) loadData(); else getData();
            
//            $scope.search       = '';
//            $scope.items        = [];
//            $scope.recipe       = null;
//            
//            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
//                $scope.items.length = 0;
//                for (var id in data.items) $scope.items.push(data.items[id]);
//            });
//            
//            $scope.$watch('model', function(nv)                                 {
//                if (!nv) return;
//                //
//                $scope.blueprint        = blueprint.initialize(nv);
//                $scope.recipe           = $scope.blueprint.selected?$scope.blueprint.selected.recipe:null;
//            });
//            
//            $scope.$watch('search', function(nv)                                {
//                if (!data.loaded || !nv) return;
//                //
//                if ($scope.items && $scope.items.length) for (var i in $scope.items)
//                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
//                        $scope.model = $scope.items[i];
//            });
        }]
    };
}]);

trcraftingbuddy.directive('blueprintsItem', [function()                         {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsItem.html',
        controller:     ['$scope', '$compile', '$element', function($scope, $compile, $element) {
            $scope.recipes  = [];
            $scope.recipe   = null;

            $scope.$watch('model', function(nv)                                 {
                if (!nv) return;
                //
                $scope.recipe = nv.selected?nv.selected.recipe:null;
            });

            $scope.$watch('recipe', function(nv)                                {
                var recipe  = $element.find('#RECIPE').empty(); if (!nv) return;
                var node    = angular.element('<div data-model="model.selected" data-blueprints-recipe></div>').appendTo(recipe);
                $compile(node)($scope);
            });
        }]
    };
}]);

trcraftingbuddy.directive('blueprintsRecipe', [function()                        {
    return {
        scope:      {
            model: '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsRecipe.html',
        controller:     ['$scope', function($scope)                             {
            $scope.$watch('model', function(nv)                                 {
                if (!nv) return;
            });
        }]
    };
}]);
