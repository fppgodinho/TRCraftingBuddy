'use strict';

var trcraftingbuddy = angular.module('trcraftingbuddy.darkhounds.net', ['ngRoute']);


trcraftingbuddy.directive('blueprints', [function()                              {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/blueprints.html',
        controller:     ['$scope', 'data', 'blueprint', function($scope, data, blueprint) {
            $scope.search       = '';
            $scope.items        = [];
            $scope.recipe       = null;
            
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                $scope.items.length = 0;
                for (var id in data.items) $scope.items.push(data.items[id]);
            });
            
            $scope.$watch('model', function(nv)                                 {
                if (!nv) return;
                //
                $scope.blueprint        = blueprint.initialize(nv);
                $scope.recipe           = $scope.blueprint.selected?$scope.blueprint.selected.recipe:null;
            });
            
            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.model = $scope.items[i];
            });
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
                var request     = data.getItem($scope.id + '');
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
                var request     = data.getRecipe($scope.id + '');
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
                var request     = data.getRecipe($scope.id + '');
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
                if (type && $scope.selected) store.add(type, $scope.selected);
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
                request.$on('loaded', function(data) { $scope.element = data;   });
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
                var request     = data.getItem($scope.item.id + '');
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
        controller:     ['$scope', '$location', 'store', 'data', function($scope, $location, store, data) {
            $scope.items = [];
            
            $scope.$watch(function () {return store.items;}, function(nv)       {
                $scope.items = nv;
            });
            
            
        }]
    };
}]);

trcraftingbuddy.directive('viewport', [function()                               {
    return {
        replace:        true,
        templateUrl:    'html/templates/viewport.html',
        controller:     ['$scope', '$location', 'data', 'analytics', 'store', function($scope, $location, data, analytics, store) {
            $scope.ready        = false;
            $scope.type         = $location.search().type || 'skill';

            $scope.$watch('type', function(nv)                                  {
                switch (nv.toLowerCase())                                       {
                    case 'recipe':      $scope.type = 'recipe';     break;
                    case 'component':   $scope.type = 'component';  break;
                    case 'filter':      $scope.type = 'filter';     break;
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

trcraftingbuddy.factory('elementController', ['data', 'store' , '$location', function(data, store, $location) {
    return {
        create: function($scope, base)                                              {
            var controller  = base || {};
            $scope.element  = null;
            $scope.store    = function()                                            {
                if (controller.type && $scope.element)
                    store.add(controller.type, $scope.element);
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
trcraftingbuddy.factory('observable', [function()                               {
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
            $observable.$on         = function(type, callback)                  {
                if (typeof type != "string" || typeof callback != "function") return -1;
                if (!$observable._listeners[type]) $observable._listeners[type] = [];
                $observable._listeners[type].push(callback);
                //
                return function()                                               {
                    if (!$observable._listeners[type]) return;
                    var index       = $observable._listeners[type].indexOf(callback);
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
                    for (var id in $observable._listeners[type])
                        $observable._listeners[type][id].apply($observable, args);
                }
            };
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
        $window.ga('send', 'pageview', path);
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

trcraftingbuddy.service('blueprint', ['data', function(data)                    {
    //
    var service         = {};
    
    var rootItem = null;
    service.initialize  = function(item)                                        {
        rootItem = createItem(item);
        return rootItem;
    }
    
    service.getRootItem = function() { return rootItem;                         }
    
    function createItem(item)                                                   {
        if (!item) return null;
        //
        var element = { item: item, recipes:[]};
        if (item.resultOf) for (var i in item.resultOf) element.recipes.push(item.resultOf[i]);
        if (element.recipes.length)                                             {
            element.recipes.unshift({name: '-'});
            element.selected    = createRecipe(element.recipes[0], {});
        }
        
        element.selectRecipe    = function(recipe)                              {
            element.selected    = createRecipe(recipe, item);
        }
        //
        return element;
    }
    
    function createRecipe(recipe, item)                                         {
        if (!recipe || !item) return null;
        //
        var result  = null;
        if (recipe.results)
            for (var i in recipe.results)
                if (recipe.results[i].item.id == item.id) result = recipe.results[i];
        //
        var element = { recipe: recipe, result: result, ingredients: [], agents: []};
        //
        if (element.result)                                                     {
            for (var i in recipe.ingredients)                                   {
                var filter      = element.result['filter'+(+i+1)];
                var ingredient  = createComponent(element.recipe.ingredients[i], filter)
                if (ingredient) element.ingredients.push(ingredient);
            }
            for (var i in recipe.agents)                                        {
                var agent       = createComponent(element.recipe.agents[i]);
                if (agent) element.agents.push(agent);
            }
        }
        //
        return element;
    }
    
    function createComponent(component, filter)                                 {
        if (!component) return null;
        //
        var element         = {component: component, filter: (filter && filter.id)?filter:null, items:[]};
        var items           = (filter && filter.id)?filter.items:component.items;
        
        for (var i in items) element.items.push(items[i]);
        if (element.items.length)                                               {
            element.items.unshift({name: '-'});
            element.selected    = createItem(element.items[0]);
        }
        //
        element.selectItem  = function(item)                                    {
            element.selected    = createItem(item);
        }
        //
        return element;
    }
    
    return service
}]);

trcraftingbuddy.service('data', ['$rootScope', '$http', '$window', 'observable', function($rootScope, $http, $window, observable) {
    if (!$window.indexedDB)         $window.indexedDB       = $window.webkitIndexedDB || $window.mozIndexedDB || $window.msIndexedDB;
    if (!$window.IDBTransaction)    $window.IDBTransaction  = $window.webkitIDBTransaction || $window.msIDBTransaction;
    if (!$window.IDBKeyRange)       $window.IDBKeyRange     = $window.webkitIDBKeyRange || $window.msIDBKeyRange;
    //
    var service             = observable.create({loaded: false});
    service.getSkills       = function(filter) { return getFilteredByName(db, 'skills',     filter); };
    service.getRecipes      = function(filter) { return getFilteredByName(db, 'recipes',    filter); };
    service.getComponents   = function(filter) { return getFilteredByName(db, 'components', filter); };
    service.getFilters      = function(filter) { return getFilteredByName(db, 'filters',    filter); };
    service.getItems        = function(filter) { return getFilteredByName(db, 'items',      filter); };
    service.getSpecies      = function(filter) { return getFilteredByName(db, 'species',    filter); };
    service.getSkill        = function(id) { return getByKey(db, 'skills',      id); };
    service.getRecipe       = function(id) { return getByKey(db, 'recipes',     id); };
    service.getComponent    = function(id) { return getByKey(db, 'components',  id); };
    service.getFilter       = function(id) { return getByKey(db, 'filters',     id); };
    service.getItem         = function(id) { return getByKey(db, 'items',       id); };
    service.getSpecie       = function(id) { return getByKey(db, 'species',     id); };
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
    }
    //
    var request             = window.indexedDB.open("gameDB", 1);
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
        intializeStore(DBSchema, 'species');
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
        loadStore(db, 'species',    'data/species.json');
    };
    //
    function intializeStore(DBSchema, name, src)                                {
        var schema                      = DBSchema.createObjectStore(name, { keyPath: "id" });
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
                
            })
            //
            checker[name]   = true;
            check();
        }
    }
    //
    function check()                                                            {
        if (!checker.skills || !checker.recipes || !checker.components || !checker.filters || !checker.items || !checker.species) return;
        //
        $rootScope.$apply(function()                                            {
            service.loaded  = true;
            service.$broadcast('loaded');
        });
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
            $rootScope.$apply(function() { response.$broadcast('error', error); });
        };
        cursor.onsuccess = function(e)                                          {
            var result = cursor.result || null;
            if (result)                                                         {
                if (!filter || result.value.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
                    response.data.push(result.value);
                result.continue();
            } else $rootScope.$apply(function()                                 {
                response.data.sort(function(a, b)                               {
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0;
                });
                response.$broadcast('loaded', response.data);
            });
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
            $rootScope.$apply(function()                                        {
                response.$broadcast('error', error);
            });
        };
        request.onsuccess   = function(e)                                       {
            $rootScope.$apply(function()                                        {
                response.data   = request.result;
                response.$broadcast('loaded', response.data);
            });
        };
        //
        return response;
    }
    
    return service
}]);

trcraftingbuddy.service('store', ['$rootScope', '$location', 'data', function($rootScope, $location, data) {
    //
    var service = { items: [] };
    service.add = function (type, element)                                      {
        if (!type || !element) return null;
        //
        var item            = {type: type, element: element};
        item.remove         = function ()                                       {
            var index       = service.items.indexOf(item);
            if (index < 0) return;
            service.items.splice(index, 1);
            //
            store           = '';
            for (var i in service.items)
                store += (store?',':'') + service.items[i].type + ':' + service.items[i].element.id;
            var params      = $location.search();
            params.store    = store;
            $location.search(params);
        };
        item.view           = function ()                                       {
            var params          = $location.search();
            params.type         = type;
            params[params.type] = element.id;
            $location.search(params);
        };
        item.blueprint          = function ()                                   {
            var params          = $location.search();
            params.type         = 'blueprint';
            params.blueprint    = element.id;
            $location.search(params);
        };
        item.hasBlueprint       = (type == 'item' && element.resultOf && element.resultOf.length); 
        service.items.push(item);
        store += (store?',':'') + type + ':' + element.id;
        var params      = $location.search();
        params.store    = store;
        $location.search(params);
        //
        return item;
    }
    //
    var store = '';
    function parseStore(newStore)                                               {
        store                   = '';
        service.items.length    = 0;
        var pairs = newStore.split(',');
        for (var i in pairs)                                                {
            var pair    = pairs[i].split(':'); if (pair.length != 2) continue;
            var type    = pair[0];
            var id      = pair[1];
            var request = null;
            switch(pair[0])                                                 {
                case 'skill':       request = data.getSkill(id);        break;
                case 'recipe':      request = data.getRecipe(id);       break;
                case 'component':   request = data.getComponent(id);    break;
                case 'filter':      request = data.getFilter(id);       break;
                case 'item':        request = data.getItem(id);         break;
                case 'specie':      request = data.getSpecie(id);       break;
                default: break;
            }
            if (request) request.$on('loaded', function(data){
                service.add(type, data); 
            }) 
        }
    }
    $rootScope.$on('$locationChangeStart', function(nv)                         {
        var params          = $location.search();
        if (store != params.store && data.loaded) parseStore(params.store || '');
    });
    if (data.loaded) parseStore($location.search().store || '');
    else data.$on('loaded', function(){
        parseStore($location.search().store || '');
    });
    //
    return service
}]);
