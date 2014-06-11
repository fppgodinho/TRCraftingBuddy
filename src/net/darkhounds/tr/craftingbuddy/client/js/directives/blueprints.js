trcraftingbuddy.directive('blueprints', [function()                              {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/blueprints.html',
        controller:     ['$scope', 'data', 'store', 'blueprint', '$location', function($scope, data, store, blueprint, $location) {
            $scope.type         = $location.search().btype || 'item';
            $scope.itemID       = $location.search().blueprint;
            $scope.blueprint    = null;
            
            function parseLocation()                                            {
                var params      = $location.search();
                $scope.itemID   = params.blueprint || $scope.itemID;
                $scope.type     = params.btype || $scope.type || 'item';
            }
            $scope.$on('$locationChangeStart', function (nv) { parseLocation(); });
            
            $scope.$watch('itemID', function (nv)                               {
                if (!nv) return;
                $scope.blueprint    = blueprint.initialize($scope.type, nv);
                var params          = $location.search();
                params.blueprint    = nv || '';
                $location.search(params);
            });
        }]
    };
}]);

trcraftingbuddy.directive('blueprintsSaves', ['data', 'blueprint', function(data, blueprint) {
    return {
        scope:          {
            id:         '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsSaves.html',
        controller:     ['$scope', function ($scope)                            {
            $scope.elements     = [];
            $scope.selected     = null;
            $scope.name         = '';
            //
            $scope.save         = function()                                    {
                var blueprintData   = blueprint.getBlueprint();
                var name            = ($scope.selected && $scope.selected.id)?$scope.selected.name:$scope.name;
                var element         = {
                    name: name,
                    data: blueprintData
                } 
                if ($scope.selected && $scope.selected.id) element.id = $scope.selected.id;
                
                data.saveBlueprint(element).$on('saved', function(data)         {
                    // $scope.selected = data;
                    getData();
                    console.log('Saved?', data);
                });
            }
            
            $scope.$watch('selected', function(nv)                              {
                console.log('Loaded?', nv);
                if (nv && nv.id) blueprint.loadBlueprint(nv.data);
                $scope.name = (nv && nv.id)?nv.name:'';
            })
            
            function getData()                                                  {
                data.getBlueprints($scope.search).$on('loaded', function (data) {
                    $scope.elements.length  = 0;
                    $scope.elements.push({name: '-'});
                    $scope.selected = $scope.elements[0]; 
                    data                    = data || [];
                    for (var i in data) $scope.elements.push(data[i]);
                });
            }
            if (!data.loaded) data.$on('loaded', getData); else getData();
        }]
    }
}]);

trcraftingbuddy.directive('blueprintsItems', ['data', 'store', function(data, store) {
    return {
        scope:          {
            type:       '=',
            id:         '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsItems.html',
        controller:     ['$scope', function ($scope)                            {
            $scope.search   = '';
            $scope.elements = [];
            $scope.selected = false;
            $scope.store    = function ()                                       {
                if ($scope.selected) store.add('item', $scope.selected ? $scope.selected.id : 0);
            };
            //
            $scope.$watch('id', function (nv)                                   {
                if (!data.loaded) return;
                checkSelected();
            });
            //
            $scope.$watch('search', function (nv)                               {
                if (!data.loaded) return;
                getData(true, false);
            });
            //
            $scope.$watch('selected', function (nv)                             {
                if (!nv) return;
                //
                if (nv.id)                                                      {
                    $scope.id   = nv.id;
                    $scope.type = 'item';
                }
            });
            //
            function checkSelected()                                            {
                if ($scope.elements) for (var i in $scope.elements)
                    if ((($scope.search || !$scope.id) && $scope.elements.length.length == 1) || $scope.id == $scope.elements[i].id)
                        $scope.selected     = $scope.elements[i];
            }
            //
            function getData()                                                  {
                data.getItems($scope.search).$on('loaded', function (data)      {
                    $scope.elements.length  = 0;
                    var data                = data || [];
                    for (var i in data)                                         {
                        if (!data[i].resultOf || !data[i].resultOf.length) continue;
                        $scope.elements.push(data[i]);
                    }
                    checkSelected();
                });
            }
            if (!data.loaded) data.$on('loaded', getData); else getData();
        }]
    }
}]);

trcraftingbuddy.directive('blueprintsItem', ['blueprintController', function(blueprintController) {
    return {
        scope:          {
            element:         '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsItem.html',
        controller:     ['$scope', '$compile', '$element', function ($scope, $compile, $element) {
            var controller      = blueprintController.create($scope, 'item');
            $scope.item         = null;
            $scope.recipes      = [];
            $scope.recipe       = null;
            $scope.blueprint    = null;
            //
            controller.addEventRemover($scope.$watch('element', function(nv)    {
                controller.getData();
            }));
            
            controller.addEventRemover( $scope.$watch('recipe', function(nv)    {
                $scope.blueprint    = nv?$scope.element.addRecipe(nv.id):null;
                //
                if (!nv) return;
                var recipe      = $element.find('#RECIPE').empty();
                var template    = angular.element('<div data-blueprints-recipe data-element="blueprint"></div>').appendTo(recipe);
                $compile(template)($scope);
            }));
            
            //
            controller.getData = function()                                     {
                if (!controller.data.loaded) return;
                controller.clearLoadEvents();
                $scope.item             = null;
                $scope.recipe           = null;
                
                var request = null;
                
                if ($scope.element && $scope.element.id)                        {
                    switch($scope.element.type)                                 {
                        case 'structure':   request = controller.data.getStructure(+$scope.element.id); break;
                        case 'fitting':     request = controller.data.getFitting(+$scope.element.id);   break;
                        default:            request = controller.data.getItem(+$scope.element.id);      break;
                    }
                    
                    controller.addLoadEventRemover(
                        request.$on('loaded', function (dataItem) {
                            $scope.item             = dataItem;
                            $scope.recipes.length   = 0;
                            $scope.recipes.push({name: '-'});
                            $scope.recipe           = $scope.recipes[0];
                            for (var i in dataItem.resultOf) controller.addLoadEventRemover(
                                controller.data.getRecipe(+dataItem.resultOf[i]).$on('loaded', function(dataRecipe){
                                    $scope.recipes.push(dataRecipe);
                                })
                            );
                        })
                    );
                }
            }
        }]
    }
}]);

trcraftingbuddy.directive('blueprintsRecipe', ['blueprintController', function(blueprintController) {
    return {
        scope:          {
            element:         '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsRecipe.html',
        controller:     ['$scope', '$element', function ($scope, $element)      {
            var controller      = blueprintController.create($scope, 'recipe');
            $scope.recipe       = null;
            $scope.result       = null;
            $scope.ingredients  = [];
            $scope.ingredient   = null;
            $scope.agents       = [];
            $scope.agent        = null;
            //
            $element.bind('$destroy', function(e) { $scope.$destroy();          });
            
            controller.addEventRemover($scope.$watch('element', function(nv)    {
                controller.getData();
            }));
            //
            controller.getData  = function()                                    {
                if (!controller.isInitialized() || !controller.data.loaded || ($scope.recipe && $scope.element && $scope.recipe.id == $scope.element.id)) return;
                controller.clearLoadEvents();
                $scope.recipe           = null;
                //
                if ($scope.element && $scope.element.id) controller.addLoadEventRemover(
                    controller.data.getRecipe(+$scope.element.id).$on('loaded', function (dataRecipe) {
                        $scope.recipe               = dataRecipe;
                        $scope.result               = null;
                        $scope.ingredients.length   = 0;
                        $scope.agents.length        = 0;
                        //
                        for (var i in $scope.recipe.results)
                            if ($scope.recipe.results[i].id == $scope.element.parent.id)
                                $scope.result   = $scope.recipe.results[i]; 
                        if (!$scope.result) return;
                        //
                        var filters = [$scope.result.filter1, $scope.result.filter2, $scope.result.filter3, $scope.result.filter4];
                        //
                        for (var i in $scope.recipe.ingredients)    getIngredient(i, filters);
                        for (var i in $scope.recipe.agents)         getAgent(i);
                    })
                );
            }
            function getIngredient(id, filters)                                 {
                controller.addLoadEventRemover(
                    controller.data.getComponent(+$scope.recipe.ingredients[id].id).$on('loaded', function(dataComponent){
                        $scope.ingredients.push({blueprint: $scope.element, component: dataComponent, filter: filters[id], pos: id});
                    })
                );
            }
            function getAgent(id)                                               {
                controller.addLoadEventRemover(
                    controller.data.getComponent(+$scope.recipe.agents[id].id).$on('loaded', function(dataComponent){
                        $scope.agents.push({blueprint: $scope.element, component: dataComponent, pos: id});
                    })
                );
            }
        }]
    }
}]);

trcraftingbuddy.directive('blueprintsRecipeSkill', ['blueprintController', function(blueprintController) {
    return {
        scope:          {
            id: '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsRecipeSkill.html',
        controller:     ['$scope', function ($scope)                            {
            var controller      = blueprintController.create($scope, 'skill');
            $scope.skill        = null;
            //
            controller.addEventRemover( $scope.$watch('id', function(nv)        {
                controller.getData();
            }));
            //
            controller.getData = function()                                     {
                if (!controller.isInitialized() || !controller.data.loaded) return;
                controller.clearLoadEvents();
                $scope.skill = null;
                if ($scope.id) controller.addLoadEventRemover(
                    controller.data.getSkill(+$scope.id).$on('loaded', function (dataSkill) {
                        $scope.skill   = dataSkill;
                    })
                );
            }
        }]
    }
}]);

trcraftingbuddy.directive('blueprintsRecipeIngredient', ['blueprintController', function(blueprintController) {
    return {
        scope:          {
            ingredient: '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsRecipeIngredient.html',
        controller:     ['$scope', function ($scope)                            {
            var controller      = blueprintController.create($scope, 'component');
            $scope.component    = null;
            $scope.filter       = null;
            $scope.items        = [];
            $scope.item         = null;
            $scope.blueprint    = null;
            //
            controller.addEventRemover($scope.$watch('component', function(nv)  {
                controller.getData();
            }));
            controller.addEventRemover($scope.$watch('item', function(nv)       {
                if (!$scope.ingredient) return;
                $scope.blueprint = nv?$scope.ingredient.blueprint.addIngredient($scope.ingredient.pos, 'item', $scope.item.id, $scope.filter?$scope.filter.id:null):null;
            }));
            //
            controller.getData = function()                                     {
                if (!controller.isInitialized() || !controller.data.loaded || ($scope.component && $scope.ingredient && $scope.ingredient.component && $scope.component.id == $scope.ingredient.component.id)) return;
                controller.clearLoadEvents();
                $scope.items.length = 0;
                $scope.component    = $scope.ingredient?$scope.ingredient.component:null;
                $scope.filter       = null;
                $scope.item         = null;
                //
                if ($scope.ingredient && $scope.ingredient.filter) controller.addLoadEventRemover(
                    controller.data.getFilter(+$scope.ingredient.filter).$on('loaded', function (dataFilter) {
                        $scope.filter   = dataFilter;
                        getItems();
                    })
                ); else if($scope.component && $scope.component.id) getItems();
            }
            //
            function getItems()                                                 {
                $scope.items.length = 0;
                $scope.items.push({name: '-'});
                $scope.item = $scope.items[0];
                
                var items   = $scope.filter?$scope.filter.items:$scope.component.items;
                
                for (var i in items) controller.addLoadEventRemover(
                    controller.data.getItem(+items[i]).$on('loaded', function(dataItem){
                        $scope.items.push(dataItem);
                    })
                );
            }
        }]
    }
}]);

trcraftingbuddy.directive('blueprintsRecipeAgent', ['blueprintController', function(blueprintController) {
    return {
        scope:          {
            agent:      '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprintsRecipeAgent.html',
        controller:     ['$scope', function ($scope)                            {
            var controller      = blueprintController.create($scope, 'component');
            $scope.component    = null;
            $scope.items        = [];
            $scope.item         = null;
            $scope.blueprint    = null;
            //
            controller.addEventRemover($scope.$watch('component', function(nv)  {
                controller.getData();
            }));
            controller.addEventRemover($scope.$watch('item', function(nv)       {
                if (!$scope.agent) return;
                $scope.blueprint = nv?$scope.agent.blueprint.addAgent($scope.agent.pos, 'item', $scope.item.id):null;
            }));
            //
            controller.getData = function()                                     {
                if (!controller.isInitialized() || !controller.data.loaded || ($scope.component && $scope.agent && $scope.agent.component && $scope.component.id == $scope.agent.component.id)) return;
                controller.clearLoadEvents();
                $scope.items.length = 0;
                $scope.component    = $scope.agent?$scope.agent.component:null;
                //
                if ($scope.component && $scope.component.id)                    {
                    $scope.items.push({name: '-'});
                    $scope.item = $scope.items[0];
                    var items   = $scope.component.items;
                    for (var i in items) controller.addLoadEventRemover(
                        controller.data.getItem(+items[i]).$on('loaded', function(dataItem){
                            $scope.items.push(dataItem);
                        })
                    );
                }
            }
        }]
    }
}]);
