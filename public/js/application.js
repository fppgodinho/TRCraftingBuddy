'use strict';

var trcraftingbuddy = angular.module('trcraftingbuddy.darkhounds.net', ['ngRoute']);


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
                
                var items   = $scope.component.items
                for (var i in items)                                            {
                    if (!$scope.filter || $scope.filter.items.indexOf(items[i]) > -1) controller.addLoadEventRemover(
                        controller.data.getItem(+items[i]).$on('loaded', function(dataItem){
                            $scope.items.push(dataItem);
                        })
                    );
                }
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

trcraftingbuddy.directive('components', [function()                                {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/components.html',
        controller:     ['$scope', 'data', 'store', '$location', function($scope, data, store, $location) {
            var type            = 'component';
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
                data.getComponents($scope.search).$on('loaded', function(data)  {
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

trcraftingbuddy.directive('componentItem', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/componentItem.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var controller          = elementController.create($scope);
            controller.type         = 'item';
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;
                var request     = data.getItem($scope.id);
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);

trcraftingbuddy.directive('componentIngredientof', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/componentIngredientof.html',
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

trcraftingbuddy.directive('componentAgentof', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/componentAgentof.html',
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
                var request     = data.getRecipe($scope.id);
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
                var request     = data.getItem($scope.id);
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);

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
                var request     = data.getRecipe($scope.id);
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
                var request     = data.getSpecie($scope.id);
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
                var request     = data.getRecipe($scope.id);
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
                var request     = data.getComponent($scope.id);
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
                var request     = data.getFilter($scope.id);
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);

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
                var request     = data.getSkill($scope.id);
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
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
                var request     = data.getComponent($scope.id);
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
                var request     = data.getComponent($scope.id);
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
            type:   '=',
            id:     '='
        },
        templateUrl:    'html/templates/recipeResultItem.html',
        replace:        true,
        controller:     ['$scope', 'data', function($scope, data)               {
            var types               = {1:'item', 2:'fitting', 3:'structure'};
            var controller          = elementController.create($scope);
            controller.type         = types[$scope.type];
            
            $scope.$watch('type', function(nv) { controller.type = types[nv]; });
            
            controller.loadElement  = function()                                {
                $scope.element  = null; if (!$scope.id) return;

                var request     = null;
                switch($scope.type)                                             {
                    case 3:
                        request = data.getStructure($scope.id);
                        break;
                    case 2:
                        request = data.getFitting($scope.id);
                        break;
                    default:
                        request = data.getItem($scope.id);
                        break;
                }
                
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
                var request     = data.getFilter($scope.id);
                request.$on('loaded', function(data) { $scope.element = data;   });
            };
            controller.loadElement();
        }]
    }
}]);

trcraftingbuddy.directive('select', [function()                                 {
    return {
        restrict:   "E",
        require:    "?ngModel",
        scope:      false,
        link:       function (scope, element, attrs, ngModel)                   {
            if (!ngModel) return;
            //
            element.bind("keyup", function() { element.triggerHandler("change"); })
        }
    };
}]);

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
                var request     = data.getRecipe($scope.id);
                request.$on('loaded', function(data)                            {
                    $scope.element = data;
                });
            };
            controller.loadElement();
        }]
    }
}]);

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


trcraftingbuddy.directive('storeList', [function()                                  {
    return {
        scope:      {
        },
        replace:        true,
        templateUrl:    'html/templates/storeList.html',
        controller:     ['$scope', 'store', function($scope, store)                 {
            $scope.elements = [];

            store.$on('changed', function(elements) { updateItems();                });
            
            function updateItems()                                                  {
                $scope.elements.length  = 0;
                for (var i in store.elements) $scope.elements.push(store.elements[i]);
            }
            updateItems();
        }]
    };
}]);

trcraftingbuddy.directive('storeListElement', [function()                                  {
    return {
        scope:      {
            type:       '=',
            id:         '=',
            remove:     '&',
            view:       '&',
            blueprint:  '&'
        },
        replace:        true,
        templateUrl:    'html/templates/storeListElement.html',
        controller:     ['$scope', '$location', 'data', function($scope, $location, data) {
            $scope.element      = null;
            $scope.hasBlueprint = null;
            $scope.$watch('id', function(nv) { loadElement();                   });

            function loadElement()                                              {
                if (!data.loaded || !$scope.type || !$scope.id) return;
                
                var request = null;
                switch($scope.type)                                             {
                    case 'skill':       request = data.getSkill(+$scope.id);        break;
                    case 'recipe':      request = data.getRecipe(+$scope.id);       break;
                    case 'component':   request = data.getComponent(+$scope.id);    break;
                    case 'filter':      request = data.getFilter(+$scope.id);       break;
                    case 'item':        request = data.getItem(+$scope.id);         break;
                    case 'specie':      request = data.getSpecie(+$scope.id);       break;
                    case 'fitting':     request = data.getFitting(+$scope.id);      break;
                    case 'structure':   request = data.getStructure(+$scope.id);    break;
                    default: break;
                }
                if (request) request.$on('loaded', function(data)               {
                    $scope.element          = data || null;
                    $scope.hasBlueprint     = $scope.element.craftable;
                });
            }
            
            if (data.loaded) loadElement();
            else data.$on('loaded', function(){ loadElement();                  });
        }]
    };
}]);
trcraftingbuddy.directive('structures', [function()                             {
    return {
        scope:          {},
        replace:        true,
        templateUrl:    'html/templates/structures.html',
        controller:     ['$scope', 'data', 'store', '$location', function($scope, data, store, $location) {
            var type            = 'structure';
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
                data.getStructures($scope.search).$on('loaded', function(data)  {
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

trcraftingbuddy.directive('structureRecipe', ['elementController', function(elementController) {
    return {
        scope:          {
            id: '='
        },
        templateUrl:    'html/templates/structureRecipe.html',
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

trcraftingbuddy.directive('viewport', [function()                               {
    return {
        replace:        true,
        templateUrl:    'html/templates/viewport.html',
        controller:     ['$scope', '$location', 'data', 'analytics', 'store', function($scope, $location, data, analytics, store) {
            $scope.ready        = false;
            $scope.type         = $location.search().type || 'skill';
            
            analytics.auto = true;
            analytics.initialize('UA-51275210-2', 'darkhounds.net');
            
            $scope.$watch('type', function(nv)                                  {
                switch (nv.toLowerCase())                                       {
                    case 'recipe':      $scope.type = 'recipe';     break;
                    case 'component':   $scope.type = 'component';  break;
                    case 'filter':      $scope.type = 'filter';     break;
                    case 'fitting':     $scope.type = 'fitting';    break;
                    case 'structure':   $scope.type = 'structure';  break;
                    case 'item':        $scope.type = 'item';       break;
                    case 'specie':      $scope.type = 'specie';     break;
                    case 'blueprint':   $scope.type = 'blueprint';  break;
                    default:            $scope.type = 'skill';      break;
                }
                var params  = $location.search();
                params.type = $scope.type;
                $location.search(params);
            });
            
            $scope.$on('$locationChangeStart', function(nv)                     {
                $scope.type         = $location.search().type;
            });
            
            data.$on('loaded', function()                                       {
                $scope.ready        = true;
            });

        }]
    };
}]);

trcraftingbuddy.factory('blueprintController', ['disposableController', 'store', 'data', '$location',
    function(disposableController, store, data, $location)                      {
        return {
            create: function($scope, type, base)                                {
                var controller      = disposableController.create($scope, base || {});
                controller.data     = data;
                //
                $scope.reset        = function()                                {
                    $scope[type]    = null;
                };
                $scope.store        = function()                                {
                    if (!$scope[type]) return;
                    store.add(type, $scope[type].id);
                };
                $scope.view         = function()                                {
                    if (!$scope[type]) return;
                    var params      = $location.search();
                    params.type     = type; 
                    params[type]    = $scope[type].id;
                    $location.search(params);
                };
                //
                var loadEvents      = [];
                controller.getData  = function(){};
                controller.addLoadEventRemover  = function (remover)            {
                    loadEvents.push(controller.addEventRemover(remover));
                    return remover;
                };
                controller.clearLoadEvents      = function()                    {
                    while (loadEvents.length)                                   {
                        var remover = loadEvents.shift(); remover();
                        controller.removeEventRemover(remover);
                    }
                };
                //
                controller.init                 = function()                    {
                    if (!controller.data.loaded) controller.addEventRemover(controller.data.$on('loaded', function() {
                        controller.getData();
                    })); else controller.getData();
                };
                //
                $scope.$on('$destroy', function()                               {
                    controller.getData              = null;
                    controller.addLoadEventRemover  = null;
                    controller.clearLoadEvents      = null;
                    controller.data                 = null;
                    loadEvents                      = null;
                });
                //
                return controller;
            }
        };
    }
]);

trcraftingbuddy.factory('disposableController', [function()                     {
    return {
        create: function($scope, base)                                          {
            var controller                  = base || {};
            var events                      = [];
            var initialized                 = false;
            //
            controller.isInitialized        = function() { return initialized; };
            controller.init                 = function() { };
            controller.update               = true;
            controller.render               = function() { };
            controller.destroy              = function() { };
            controller.countEvents          = function() { return events?events.length:-1; };
            controller.addEventRemover      = function(remover) { events.push(remover); return remover };
            controller.removeEventRemover   = function(remover)                 {
                var index = events.indexOf(remover); if (index < 0) return;
                events.splice(index, 1);
            };
            //
            var updater                 = setInterval(function()                {
                if (!controller.update) return; controller.update   = false;
                if (!initialized && typeof controller.init == 'function')       {
                    initialized    = true;
                    controller.init();
                } 
                if (typeof controller.render == 'function') controller.render();
            }, 10);
            //
            events.push($scope.$on('$destroy', function()                       {
                if (updater >= 0) clearInterval(updater);
                //
                while (events.length) events.shift()();
                //
                if (controller.destroy && typeof controller.destroy === 'function') controller.destroy();
                //
                controller.update           = null;
                controller.init             = null;
                controller.countEvents      = null;
                controller.addEventRemover  = null;
                controller.destroy          = null;
                controller                  = null;
                events                      = null;
                initialized                 = null;
                updater                     = null;
            }));
            //
            return controller;
        }
    };
}]);

trcraftingbuddy.factory('elementController', ['data', 'store' , '$location', function(data, store, $location) {
    return {
        create: function($scope, base)                                              {
            var controller  = base || {};
            $scope.element  = null;
            $scope.store    = function()                                            {
                if (controller.type && $scope.element) store.add(controller.type, $scope.element?$scope.element.id:0);
            };
            $scope.view     = function()                                            {
                if (!controller.type || !$scope.element) return;
                var params              = $location.search();
                params.type             = controller.type;
                params[controller.type] = $scope.element.id;
                if (params.type && params[controller.type]) $location.search(params);
            };
            
            $scope.$watch('id', function(nv) { controller.loadElement();            });

            controller.loadElement    = function()                                  {
                console.log('Load Element has to be defined!');
            }
            
            return controller;
        }
    };
}]);

/**
 * @ngdoc       factory
 * @name        observable
 * 
 * @description Factory for creating generic observable objects.
 */
trcraftingbuddy.factory('observable', ['$rootScope', function($rootScope)       {
    /**
     * @ngdoc       method
     * @name        observable#create
     * @kind        function
     * @description returns {observable} Returns a new observable object.
     * @param {object} An optional base object to extend.
     */
    return {
        create: function(object)                                                {
            var $observable         = object || {}; 
            $observable._listeners  = {};
            /**
             * Event listener registration.
             * @param type {string} The event name to listen to.
             * @param callback {function} The function be invoked by the trigger.
             * @returns {function} A function to unregister the listener.
             */
            $observable.$on         = function(type, callback, $scope)          {
                if (typeof type != "string" || typeof callback != "function") return -1;
                if (!$observable._listeners[type]) $observable._listeners[type] = [];
                var index           = $observable._listeners[type].length;
                $observable._listeners[type].push({callback: callback, scope: $scope || $rootScope});
                //
                return function()                                               {
                    if (!$observable._listeners[type]) return;
                    if (index >= 0 && index < $observable._listeners[type].length) $observable._listeners[type].splice(index, 1);
                    if (!$observable._listeners[type].length) delete $observable._listeners[type];
                };
            };
            
            /**
             * Event trigger. This will broadcast a trigger to all registered
             * listeners, any extra arguments beyond the first are injected into
             * the callback function of each listener.
             * @param type {string} Name of the event to trigger.
             */
            $observable.$broadcast = function(type)                             {
                var args    = [];
                if (arguments && arguments.length > 1) for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
                if ($observable._listeners[type])                               {
                    for (var id in $observable._listeners[type])                {
                        var scope   = $observable._listeners[type][id]['scope'];
                        $observable._listeners[type][id]['callback'].apply($observable, args);
                        digest(scope);
                    }
                }
            };
            
            function digest(scope)                                              {
                setTimeout(function() { scope.$digest();}, 0);
            }
            
            return $observable;
        }
    };
}]);

/**
 * Google Analytics Service
 * 
 * @property auto Sets the auto pageview registration to true
 * @method initialize 
 */
trcraftingbuddy.service('analytics', ['$rootScope', '$location', '$window', function($rootScope, $location, $window){
    var initialized     = false;
    var service         = {auto: false};
    /**
     * Initialized the google analytics session
     * @param key Google Analytics account key.
     * @param domain Google Analytics account domain
     */
    service.initialize  = function(key, domain)                                 {
        (function(i,s,o,g,r,a,m)                                                {
            i['GoogleAnalyticsObject']  = r;
            i[r]                        = i[r] || function()                    {
                (i[r].q = i[r].q || []).push(arguments)
            };
            i[r].l                      = 1 * new Date();
            a                           = s.createElement(o);
            m                           = s.getElementsByTagName(o)[0];
            a.async                     = 1;
            a.src                       = g;
            m.parentNode.insertBefore(a, m);
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
        ga('create', key, domain);
        //
        initialized = true;
    };

    /**
     * Register a page view with the given 'path'
     * @param path The path to register as a page view
     */
    service.register = function(path)                                           {
        if ($window.ga) $window.ga('send', 'pageview', path);
    };

    /**
     * Auto pageview registration, only used if the service 'auto' property is set to true
     */
    $rootScope.$on('$locationChangeStart', function()                           {
        if (!initialized || !service.auto) return;
        service.register($location.absUrl());
    });
    
    return service;
}]);

trcraftingbuddy.service('blueprint', ['observable', 'data', 'analytics', '$rootScope', function(observable, data, analytics, $rootScope) {
    //
    var service             = observable.create({});
    var blueprint           = {};
    service.initialize      = function(type, id)                                {
        if (id) analytics.register('blueprint/initialize/' + type + '/' + id);
        blueprint       = {type: type, id: id, parent: null};
        Object.defineProperty(blueprint, 'addRecipe',                           {
            enumerable:     false,
            configurable:   false,
            writable:       false,
            value:          function(id){ return addRecipe(blueprint, id); }
        });
        //
        return blueprint; 
    };
    
    function addRecipe (parent, id)                                             {
        if (id) analytics.register('blueprint/recipe/' + id);
        var recipe      = {id: id, parent: parent, ingredients:[], agents:[]};
        //
        Object.defineProperty(recipe, 'addIngredient',                          {
            enumerable:     false,
            configurable:   false,
            writable:       false,
            value:          function(pos, type, id, filter){ return addIngredient(recipe, pos, type, id, filter);  }
        });
        Object.defineProperty(recipe, 'addAgent',                               {
            enumerable:     false,
            configurable:   false,
            writable:       false,
            value:          function(pos, type, id) { return addAgent(recipe, pos, type, id); }
        });
        parent.recipe   = recipe;
        //
        return recipe;
    };
    
    function addIngredient(parent, pos, type, id, filter)                             {
        if (id) analytics.register('blueprint/ingredient/' + type + '/' + id + '/pos/' + pos + '/filter/' + filter);
        var ingredient = {type: type, id: id, parent: parent, filter: filter};
        //
        Object.defineProperty(ingredient, 'addRecipe',                          {
            enumerable:     false,
            configurable:   false,
            writable:       false,
            value:          function(id) { return addRecipe(ingredient, id);    }
        });
        parent.ingredients[pos] = ingredient;
        //
        return ingredient;
        
    }
    
    function addAgent(parent, pos, type, id)                                          {
        if (id) analytics.register('blueprint/agent/' + type + '/' + id + '/pos/' + pos);
        var agent = {type: type, id: id, parent: parent};
        //
        Object.defineProperty(agent, 'addRecipe',                               {
            enumerable:     false,
            configurable:   false,
            writable:       false,
            value:          function(id) { return addRecipe(agent, id);         }
        });
        parent.agents[pos]  = agent;
        //
        return agent;
    }

    service.getBlueprint    = function() { return blueprint;                    }
    service.loadBlueprint   = function(blueprint)                               {
        blueprint           = blueprint;
        // TODO: parse the object to inflat it's methods...
        service.$broadcast('loaded', blueprint);
    };
    
    return service
}]);

trcraftingbuddy.service('data', ['$rootScope', '$http', '$window', 'observable', function($rootScope, $http, $window, observable) {
    if (!$window.indexedDB)         $window.indexedDB       = $window.webkitIndexedDB || $window.mozIndexedDB || $window.msIndexedDB;
    if (!$window.IDBTransaction)    $window.IDBTransaction  = $window.webkitIDBTransaction || $window.msIDBTransaction;
    if (!$window.IDBKeyRange)       $window.IDBKeyRange     = $window.webkitIDBKeyRange || $window.msIDBKeyRange;
    //
    var service             = observable.create({loaded: false});
    //
    service.getSkills       = function(filter) { return getFilteredByName(db, 'skills',     filter); };
    service.getSkill        = function(id) { return getByKey(db, 'skills',      id); };
    //
    service.getRecipes      = function(filter) { return getFilteredByName(db, 'recipes',    filter); };
    service.getRecipe       = function(id) { return getByKey(db, 'recipes',     id); };
    //
    service.getComponents   = function(filter) { return getFilteredByName(db, 'components', filter); };
    service.getComponent    = function(id) { return getByKey(db, 'components',  id); };
    //
    service.getFilters      = function(filter) { return getFilteredByName(db, 'filters',    filter); };
    service.getFilter       = function(id) { return getByKey(db, 'filters',     id); };
    //
    service.getItems        = function(filter) { return getFilteredByName(db, 'items',      filter); };
    service.getItem         = function(id) { return getByKey(db, 'items',       id); };
    //
    service.getFittings     = function(filter) { return getFilteredByName(db, 'fittings',      filter); };
    service.getFitting      = function(id) { return getByKey(db, 'fittings',    id); };
    //
    service.getStructures   = function(filter) { return getFilteredByName(db, 'structures',      filter); };
    service.getStructure    = function(id) { return getByKey(db, 'structures',  id); };
    //
    service.getSpecies      = function(filter) { return getFilteredByName(db, 'species',    filter); };
    service.getSpecie       = function(id) { return getByKey(db, 'species',     id); };
    //
    service.getBlueprints   = function(filter)  { return getFilteredByName(db, 'blueprints', filter); };
    service.getBlueprint    = function(id) { return getByKey(db, 'blueprints',  id); };
    service.saveBlueprint   = function(data) { return saveData(db, 'blueprints',    data);};
    service.removeBlueprint = function(id) { return removeByKey(db, 'blueprints',   id);};
    //
    var db                  = null;
    //
    var checker             = {
        skills:     false,
        recipes:    false,
        components: false,
        filters:    false,
        items:      false,
        species:    false
    };
    //
    var request             = window.indexedDB.open("gameDB", 3);
    request.onerror         = function(event)                                   {
        // browser access to indexDB denied by the user
        console.log('DB connection failed');
    };
    request.onupgradeneeded = function(event)                                   {
        console.log('DB created');
        //
        var DBSchema = event.target.result;
        intializeStore(DBSchema, 'skills');
        intializeStore(DBSchema, 'recipes');
        intializeStore(DBSchema, 'components');
        intializeStore(DBSchema, 'filters');
        intializeStore(DBSchema, 'items');
        intializeStore(DBSchema, 'fittings');
        intializeStore(DBSchema, 'structures');
        intializeStore(DBSchema, 'species');
        intializeStore(DBSchema, 'blueprints', true);
    };
    request.onsuccess       = function(event)                                   {
        console.log('DB connection created');
        db                  = request.result;
        db.onerror          = function(event)                                   {
            console.log("Database error: " + event.target.errorCode);
        };
        loadStore(db, 'skills',     'data/skills.json');
        loadStore(db, 'recipes',    'data/recipes.json');
        loadStore(db, 'components', 'data/components.json');
        loadStore(db, 'filters',    'data/filters.json');
        loadStore(db, 'items',      'data/items.json');
        loadStore(db, 'fittings',   'data/fittings.json');
        loadStore(db, 'structures', 'data/structures.json');
        loadStore(db, 'species',    'data/species.json');
    };
    //
    function intializeStore(DBSchema, name, src, auto)                          {
        if (DBSchema.objectStoreNames.contains(name))                           {
            DBSchema.deleteObjectStore(name);
        }
        
        var schema      = DBSchema.createObjectStore(name, { keyPath: "id", autoIncrement: true });
        schema.createIndex("name", "name", { unique: false });
        return schema.transaction;
    }
    //
    function loadStore(DBSchema, name, src)                                     {
        checker[name]           = false;
        //
        var store               = DBSchema.transaction([name]).objectStore(name);
        
        store.count().onsuccess = function(e)                                   {
            if (!e.target.result) return $http({method: 'GET', url: src}).success(function(data) {
                var store               = DBSchema.transaction([name], "readwrite").objectStore(name);
                var count               = 0;
                for (var i in data)                                             {
                    count++;
                    
                    store.add(data[i]).onsuccess = function(e)                  {
                        if(--count <= 0)                                        {
                            checker[name]       = true;
                            check();
                        }
                    };
                }
                
            });
            //
            checker[name]   = true;
            check();
        }
    }
    //
    function check()                                                            {
        if (!checker.skills || !checker.recipes || !checker.components || !checker.filters || !checker.items || !checker.species) return;
        //
        service.loaded  = true;
        service.$broadcast('loaded');
    }
    //
    function getFilteredByName(DBSchema, name, filter)                          {
        var response            = observable.create({data: []});
        //
        var transaction         = DBSchema.transaction([name]);
        var store               = transaction.objectStore(name);
        var cursor              = store.openCursor();
        cursor.onerror   = function(error)                                      {
            console.log('Error parsing stored data from ' + name, error);
            response.$broadcast('error', error);
        };
        cursor.onsuccess = function(e)                                          {
            var result = cursor.result || null;
            if (result)                                                         {
                if (!filter || result.value.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
                    response.data.push(result.value);
                result.continue();
            } else                                                              {
                response.data.sort(function(a, b)                               {
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0;
                });
                response.$broadcast('loaded', response.data);
            } 
        };
        //
        return response;
    }
    //
    function getByKey(DBSchema, name, key)                                      {
        var response        = observable.create({data: null});
        //
        var request         = DBSchema.transaction([name]).objectStore(name).get(key);
        request.onerror     = function(error)                                   {
            response.$broadcast('error', error);
        };
        request.onsuccess   = function(e)                                       {
            response.data   = request.result;
            if (!request.result) console.log('LOAD ERROR: ', name, key);
            response.$broadcast('loaded', response.data);
        };
        //
        return response;
    }
    
    function saveData(DBSchema, name, data)                                     {
        var response        = observable.create({data: null});
        //
        console.log('About to save:', data);
        var request         = DBSchema.transaction([name], "readwrite").objectStore(name).put(data);
        request.onerror     = function(error)                                   {
            response.$broadcast('error', error);
        };
        request.onsuccess   = function(e)                                       {
            response.data   = request.result;
            response.$broadcast('saved', response.data);
        };
        //
        return response;
    }
    
    function removeByKey(DBSchema, name, key)                                   {
        var response        = observable.create({data: null});
        //
        var request         = DBSchema.transaction([name], "readwrite").objectStore(name).delete(key);
        request.onerror     = function(error)                                   {
            response.$broadcast('error', error);
        };
        request.onsuccess   = function(e)                                       {
            response.data   = key;
            response.$broadcast('removed', key);
        };
        //
        return response;
    }
    
    return service
}]);

trcraftingbuddy.service('store', ['observable', '$rootScope', '$location', function(observable, $rootScope, $location) {
    //
    var service = observable.create({ elements: [] });
    
    service.add = function (type, id)                                           {
        if (!type || !id) return null;
        //
        var element         = {type: type, id: id};
        element.remove      = function ()                                       {
            var index       = service.elements.indexOf(element);
            if (index < 0) return;
            service.elements.splice(index, 1);
            //
            store           = '';
            for (var i in service.elements) store += (store?',':'') + service.elements[i].type + ':' + service.elements[i].id;
            var params      = $location.search();
            params.store    = store;
            $location.search(params);
            service.$broadcast('changed', service.elements);
        };
        element.view            = function ()                                   {
            var params          = $location.search();
            params.type         = type;
            params[params.type] = id;
            $location.search(params);
        };
        element.blueprint       = function ()                                   {
            var params          = $location.search();
            params.type         = 'blueprint';
            params.btype        = type;
            params.blueprint    = id;
            $location.search(params);
        };
        service.elements.push(element);
        store += (store?',':'') + element.type + ':' + element.id;
        var params      = $location.search();
        params.store    = store;
        $location.search(params);
        service.$broadcast('changed', service.elements);
        //
        return element;
    }
    //
    var store = '';
    function parseStore(newStore)                                               {
        store                   = '';
        service.elements.length    = 0;
        var pairs = newStore.split(',');
        for (var i in pairs)                                                {
            var pair    = pairs[i].split(':'); if (pair.length != 2) continue;
            var type    = pair[0];
            var id      = pair[1];
            service.add(type, id);
        }
    }
    $rootScope.$on('$locationChangeStart', function(nv)                         {
        var params          = $location.search();
        if (store != params.store) parseStore(params.store || '');
    });
    parseStore($location.search().store || '');
    //
    return service
}]);
