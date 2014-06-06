'use strict';

var trcraftingbuddy = angular.module('trcraftingbuddy.darkhounds.net', []);


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
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/components.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            //
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.components)
                    $scope.items.push(data.components[id]);
                //
            }

            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.model = $scope.items[i];
            })
        }]
    };
}]);

trcraftingbuddy.directive('filters', [function()                                {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/filters.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            //
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.filters)
                    $scope.items.push(data.filters[id]);
                //
            }

            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.model = $scope.items[i];
            })
        }]
    };
}]);

trcraftingbuddy.directive('items', [function()                                  {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/items.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            $scope.crafted      = true;
            $scope.harvested    = true;
            $scope.other        = false;
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            $scope.$watch('crafted', function(nv) { updateList();               })
            $scope.$watch('harvested', function(nv) { updateList();             })
            $scope.$watch('other', function(nv) { updateList();                 })
            //
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.items) {
                    var valid = false;
                    if ($scope.other && (!data.items[id].species || !data.items[id].species.length) && (!data.items[id].resultOf || !data.items[id].resultOf.length))
                        valid = true;
                    if ($scope.crafted && data.items[id].resultOf && data.items[id].resultOf.length)
                        valid = true;
                    if ($scope.harvested && data.items[id].species && data.items[id].species.length)
                        valid = true;
                    if(valid) $scope.items.push(data.items[id]);
                }
            }

            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.model = $scope.items[i];
            })
        }]
    };
}]);

trcraftingbuddy.directive('recipes', [function()                                {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/recipes.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            //
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.recipes)
                    $scope.items.push(data.recipes[id]);
                //
            }

            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.model = $scope.items[i];
            })
        }]
    };
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
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/skills.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            $scope.craftingOnly = true;
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            //
            $scope.$watch('craftingOnly', function(nv) { updateList();          })
            
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.skills)
                    if (!$scope.craftingOnly || ($scope.craftingOnly && data.skills[id].recipes && data.skills[id].recipes.length))
                        $scope.items.push(data.skills[id]);
                //
            }
            
            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.model = $scope.items[i];
            })
        }]
    };
}]);

trcraftingbuddy.directive('species', [function()                                {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/species.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items            = [];
            $scope.harvestableOnly  = true;
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            $scope.$watch('harvestableOnly', function(nv) { updateList();       })
            //
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.species)
                    if (!$scope.harvestableOnly || (data.species[id].items && data.species[id].items.length))
                        $scope.items.push(data.species[id]);
                //
            }
            //
            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.model = $scope.items[i];
            })
        }]
    };
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
            
            // analytics.initialize('UA-51275210-2', 'darkhounds.net');
            
            $scope.skill        = false;
            $scope.recipe       = false;
            $scope.component    = false;
            $scope.filter       = false;
            $scope.item         = false;
            $scope.specie       = false;
            
            $scope.$watch(function(){ return data.loaded}, function(nv)         {
                if (!data.loaded) return;
                $scope.ready        = true;
                $scope.skills       = getSkills();
                $scope.recipes      = getRecipes();
                $scope.components   = getComponents();
                $scope.filters      = getFilters();
                $scope.items        = getItems();
                $scope.species      = getSpecies();
                //
                for (var i in $scope.skills) wrapFunctions('skill', $scope.skills[i])
                for (var i in $scope.recipes) wrapFunctions('recipe', $scope.recipes[i])
                for (var i in $scope.components) wrapFunctions('component', $scope.components[i])
                for (var i in $scope.filters) wrapFunctions('filter', $scope.filters[i])
                for (var i in $scope.items) wrapFunctions('item', $scope.items[i])
                for (var i in $scope.species) wrapFunctions('specie', $scope.species[i])
                //
                checkSelected(true);
            })

            function getSkills()                                                {
                var items   = []
                for (var id in data.skills) items.push(data.skills[id]);
                return items;
            }
            function getRecipes()                                               {
                var items   = []
                for (var id in data.recipes) items.push(data.recipes[id]);
                return items;
            }
            function getComponents()                                            {
                var items   = []
                for (var id in data.components) items.push(data.components[id]);
                return items;
            }
            function getFilters()                                               {
                var items   = []
                for (var id in data.filters) items.push(data.filters[id]);
                return items;
            }
            function getItems()                                                 {
                var items   = []
                for (var id in data.items) items.push(data.items[id]);
                return items;
            }
            function getSpecies()                                               {
                var items   = []
                for (var id in data.species) items.push(data.species[id]);
                return items;
            }
            
            function wrapFunctions(type, item)                                  {
                item.view       = wrapViewFunction(type, item);
                item.blueprint  = wrapBlueprintFunction(item);
                item.store      = function ()                                   {
                    var element     = store.add(type, item);
                    element.view    = item.view;
                }
            }
            
            function wrapViewFunction(type, item)                               {
                return function()                                               {
                    $scope.type     = type;
                    $scope[type]    = item;
                }
            }
            
            function wrapBlueprintFunction(item)                                {
                return function()                                               {
                    $scope.type         = 'blueprint';
                    $scope.blueprint    = item;
                }
            }
            
            $scope.$watch('type', function()                                    {
                if (!data.loaded) return;
                checkSelected();
            });
            
            $scope.$watch('skill', function()                                   {
                if (!data.loaded) return;
                checkSelected();
            });
            
            $scope.$watch('recipe', function()                                  {
                if (!data.loaded) return;
                checkSelected();
            });
            
            $scope.$watch('component', function()                               {
                if (!data.loaded) return;
                checkSelected();
            });
            
            $scope.$watch('filter', function()                                  {
                if (!data.loaded) return;
                checkSelected();
            });
            
            $scope.$watch('item', function()                                    {
                if (!data.loaded) return;
                checkSelected();
            });

            $scope.$watch('specie', function()                                  {
                if (!data.loaded) return;
                checkSelected();
            });

            $scope.$watch('blueprint', function()                               {
                if (!data.loaded) return;
                checkSelected();
            });

            $scope.$watch(function(){ return $location.search(); }, function(nv){
                if (!data.loaded || !nv) return;
                checkSelected(true);
            });
            
            function checkSelected(fromHash)                                    {
                var params = $location.search();
                if (fromHash)                                                   {
                    $scope.type = params.type || 'skill';
                    switch (params.type)                                        {
                        case 'recipe':      $scope.recipe       = data.getRecipe(params.id || 1);       break;
                        case 'component':   $scope.component    = data.getComponent(params.id || 1);    break;
                        case 'filter':      $scope.filter       = data.getFilter(params.id || 1);       break;
                        case 'item':        $scope.item         = data.getItem(params.id || 1);         break;
                        case 'specie':      $scope.specie       = data.getSpecie(params.id || 1);       break;
                        case 'blueprint':   $scope.blueprint    = data.getItem(params.id || 1);         break;
                        default:            $scope.skill        = data.getSkill(params.id || 1);        break;
                    }
                } else                                                          {
                    params.type = $scope.type;
                    switch ($scope.type)                                        {
                        case 'recipe':      params.id = $scope.recipe?$scope.recipe.id:'';          break;
                        case 'component':   params.id = $scope.component?$scope.component.id:'';    break;
                        case 'filter':      params.id = $scope.filter?$scope.filter.id:'';          break;
                        case 'item':        params.id = $scope.item?$scope.item.id:'';              break;
                        case 'specie':      params.id = $scope.specie?$scope.specie.id:'';          break;
                        case 'blueprint':   params.id = $scope.blueprint?$scope.blueprint.id:'';    break;
                        default:            params.id = $scope.skill?$scope.skill.id:'';            break;
                    }
                    $location.search(params);
                }
            }
            
            $scope.$watch(function () {return store.items.length;}, function()  {
                if (data.loaded) checkStore()
            });
            
            $scope.$watch(function () {return data.loaded;}, function(nv)       {
                if (!nv) return;
                //
                checkStore(true)
            });
            
            function checkStore(fromHash)                                       {
                var params = $location.search();
                
                if (fromHash)                                                   {
                    if (!params.store) return;
                    var pairs   = params.store.split(',');
                    for (var i in pairs)                                        {
                        var pair = pairs[i].split(':'); if (pair.length != 2) continue;
                        var type    = pair[0];
                        var id      = pair[1];
                        switch(type)                                            {
                            case 'skill':       var item = data.getSkill(id); break;
                            case 'recipe':      var item = data.getRecipe(id); break;
                            case 'component':   var item = data.getComponent(id); break;
                            case 'filter':      var item = data.getFilter(id); break;
                            case 'item':        var item = data.getItem(id); break;
                            case 'specie':      var item = data.getSpecie(id); break;
                            default: break;
                        }
                        //
                        store.add(type, item).view = wrapViewFunction(type, item);

                    }
                } else                                                          {
                    params.store   = '';
                    if (store.items) for (var i in store.items)
                        params.store += (params.store?',':'') + store.items[i].type +':'+ store.items[i].element.id;
                    //
                    $location.search(params);
                }
            }
        }]
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

trcraftingbuddy.service('data', ['$http', '$window', '$rootScope', function($http, $window, $rootScope)   {
    var service = {
        loaded:     false,
        skills:     [],
        recipes:    [],
        components: [],
        filters:    [],
        items:      [],
        species:    []
    };
    
    var checker = {
        skills:     false,
        recipes:    false,
        components: false,
        filters:    false,
        items:      false,
        species:    false
    }
    
    if (!$window.indexedDB)         $window.indexedDB       = $window.webkitIndexedDB || $window.mozIndexedDB || $window.msIndexedDB;
    if (!$window.IDBTransaction)    $window.IDBTransaction  = $window.webkitIDBTransaction || $window.msIDBTransaction;
    if (!$window.IDBKeyRange)       $window.IDBKeyRange     = $window.webkitIDBKeyRange || $window.msIDBKeyRange;
    
    var db                  = null;
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

    function intializeStore(DBSchema, name, src)                                {
        var schema                      = DBSchema.createObjectStore(name, { keyPath: "id" });
        schema.createIndex("name", "name", { unique: false });
        return schema.transaction;
    }
    
    function loadStore(DBSchema, name, src)                                     {
        service[name].length    = 0;
        var store               = DBSchema.transaction([name]).objectStore(name);
        var cursorRequest       = store.openCursor();
        cursorRequest.onerror   = function(error)                               {
            console.log('Error parsing stored data from ' + name, error);
        };
        
        cursorRequest.onsuccess = function(e)                                   {
            if (e.target.result)                                                {
                service[name].push(e.target.result.value);
                e.target.result.continue();
            } else if (!service[name].length)                                   {
                $http({method: 'GET', url: src}).success(function(data)         {
                    var store   = DBSchema.transaction([name], "readwrite").objectStore(name);
                    for (var i in data)                                         {
                        store.add(data[i]);
                        service[name].push(data[i]);
                    }
                    checker[name] = true;
                    check();
                });
            } else                                                              {
                checker[name] = true;
                check();
            }
        };
    }
    
    function check()                                                            {
        if (!checker.skills || !checker.recipes || !checker.components || !checker.filters || !checker.items || !checker.species) return;
        console.log(service.skills.length, service.recipes.length, service.components.length, service.filters.length, service.items.length, service.species.length);
        inflateSkills();
        inflateRecipes();
        inflateComponents();
        inflateFilters();
        inflateItems();
        inflateSpecies();
        service.loaded = true;
        setTimeout(function(){ $rootScope.$apply(); }, 0);
    }
    
    function inflateSkills()                                                    {
        for (var i in service.skills)                                           {
            var skill       = service.skills[i];
            if (skill.recipes && skill.recipes.length)
                for (var index in skill.recipes)
                    skill.recipes[index] = service.getRecipe(skill.recipes[index]);
        }
    }
    
    function inflateRecipes()                                                   {
        for (var i in service.recipes)                                          {
            var recipe      = service.recipes[i];
            recipe.skill    = service.getSkill(recipe.skill);
            
            if (recipe.ingredients && recipe.ingredients.length)
                for (var index in recipe.ingredients)
                    recipe.ingredients[index] = service.getComponent(recipe.ingredients[index]);
            
            if (recipe.agents && recipe.agents.length)
                for (var index in recipe.agents)
                    recipe.agents[index] = service.getComponent(recipe.agents[index]);
            
            if (recipe.results && recipe.results.length)
                for (var index in recipe.results)                               {
                    var item                        = service.getItem(recipe.results[index].id);
                    recipe.results[index].name      = item.name;
                    recipe.results[index].item      = item;
                    recipe.results[index].filter1   = service.getFilter(recipe.results[index].filter1);
                    recipe.results[index].filter2   = service.getFilter(recipe.results[index].filter2);
                    recipe.results[index].filter3   = service.getFilter(recipe.results[index].filter3);
                    recipe.results[index].filter4   = service.getFilter(recipe.results[index].filter4);
                }
                
        }
    }
    
    function inflateComponents()                                                {
        for (var i in service.components)                                       {
            var component   = service.components[i];
            if (component.items && component.items.length)
                for (var index in component.items)
                    component.items[index] = service.getItem(component.items[index]);
            if (component.agentOf && component.agentOf.length)
                for (var index in component.agentOf)
                    component.agentOf[index] = service.getRecipe(component.agentOf[index]);
            if (component.ingredientOf && component.ingredientOf.length)
                for (var index in component.ingredientOf)
                    component.ingredientOf[index] = service.getRecipe(component.ingredientOf[index]);
        }
    }
    
    function inflateFilters()                                                   {
        for (var i in service.filters)                                          {
            var filter   = service.filters[i];
            if (filter.items && filter.items.length)
                for (var index in filter.items)
                    filter.items[index] = service.getItem(filter.items[index]);
            if (filter.recipes && filter.recipes.length)
                for (var index in filter.recipes)
                    filter.recipes[index] = service.getRecipe(filter.recipes[index]);
        }
    }
    
    function inflateItems()                                                     {
        for (var i in service.items)                                            {
            var item    = service.items[i];
            if (item.components && item.components.length)
                for (var index in item.components)
                    item.components[index] = service.getComponent(item.components[index]);
            if (item.filters && item.filters.length)
                for (var index in item.filters)
                    item.filters[index] = service.getFilter(item.filters[index]);
            if (item.resultOf && item.resultOf.length)
                for (var index in item.resultOf)
                    item.resultOf[index] = service.getRecipe(item.resultOf[index]);
            if (item.usedIn && item.usedIn.length)
                for (var index in item.usedIn)
                    item.usedIn[index] = service.getRecipe(item.usedIn[index]);
            if (item.species && item.species.length)
                for (var index in item.species)
                    item.species[index] = service.getSpecie(item.species[index]);
        }
    }
    
    function inflateSpecies()                                                   {
        for (var i in service.species)                                          {
            var specie   = service.species[i];
            if (specie.items && specie.items.length)
                for (var index in specie.items)                                 {
                    var item                    = service.getItem(specie.items[index].id);
                    specie.items[index].name    = item.name;
                    specie.items[index].item    = item;
                }
        }
    }
    
//    $http({method: 'GET', url: 'data/skills.json'}).success(function(data)      {
//        service.skills      = data;
//        check();
//    });
//    
//    $http({method: 'GET', url: 'data/recipes.json'}).success(function(data)     {
//        service.recipes     = data;
//        check();
//    });
//    
//    $http({method: 'GET', url: 'data/components.json'}).success(function(data)  {
//        service.components  = data;
//        check();
//    });
//    
//    $http({method: 'GET', url: 'data/filters.json'}).success(function(data)     {
//        service.filters     = data;
//    });
//
//    $http({method: 'GET', url: 'data/items.json'}).success(function(data)       {
//        service.items       = data;
//        check();
//    });
//
//    $http({method: 'GET', url: 'data/species.json'}).success(function(data)     {
//        service.species     = data;
//        check();
//    });
    
    service.getSkill             = function(id)                                 {
        for (var i in service.skills) if (service.skills[i].id == id)
            return service.skills[i];
        //
        return {};
    }
    service.getSkillName         = function (id)                                {
        var item    = service.getSkill(id)
        return item.name || '';
    }
    service.getSkillDescription  = function (id)                                {
        var item    = service.getSkill(id)
        return item.description || '';
    }

    service.getRecipe            = function(id)                                 {
        for (var i in service.recipes) if (service.recipes[i].id == id)
            return service.recipes[i];
        //
        return {};
    }
    service.getRecipeName        = function (id)                                {
        var item = service.getRecipe(id)
        return item.name || '';
    }
    service.getRecipeDescription = function (id)                                {
        var item = service.getRecipe(id)
        return item.description || '';
    }

    service.getComponent             = function(id)                             {
        for (var i in service.components) if (service.components[i].id == id)
            return service.components[i];
        //
        return {};
    }
    service.getComponentName         = function (id)                            {
        var item = service.getComponent(id)
        return item.name || '';
    }
    service.getComponentDescription  = function (id)                            {
        var item = service.getComponent(id)
        return item.description || '';
    }

    service.getFilter              = function(id)                               {
        for (var i in service.filters) if (service.filters[i].id == id)
            return service.filters[i];
        //
        return {};
    }
    service.getFilterName          = function (id)                              {
        var item = service.getFilter(id)
        return item.name || '';
    }
    service.getFilterDescription = function (id)                                {
        var item = service.getFilter(id)
        return item.description || '';
    }

    service.getItem              = function(id)                                 {
        for (var i in service.items) if (service.items[i].id == id)
            return service.items[i];
        //
        return {};
    }
    service.getItemName          = function (id)                                {
        var item = service.getItem(id)
        return item.name || '';
    }
    service.getItemDescription   = function (id)                                {
        var item = service.getItem(id)
        return item.description || '';
    }

    service.getSpecie              = function(id)                               {
        for (var i in service.species) if (service.species[i].id == id)
            return service.species[i];
        //
        return {};
    }
    service.getSpecieName          = function (id)                              {
        var item = service.getSpecie(id)
        return item.name || '';
    }
    service.getSpecieDescription = function (id)                                {
        var item = service.getSpecie(id)
        return item.description || '';
    }
    
    return service
}]);

trcraftingbuddy.service('store', [function()                                    {
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
        }
        item.hasBlueprint   = (type == 'item' && element.resultOf && element.resultOf.length); 
        service.items.push(item);
        //
        return item;
    }
    //
    return service
}]);
