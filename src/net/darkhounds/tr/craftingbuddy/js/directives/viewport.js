trcraftingbuddy.directive('viewport', [function()                               {
    return {
        replace:        true,
        templateUrl:    'html/templates/viewport.html',
        controller:     ['$scope', '$location', 'data', 'analytics', 'store', function($scope, $location, data, analytics, store) {
            $scope.ready        = false;
            $scope.type         = $location.search().type || 'skill';
            
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
                item.view   = wrapViewFunction(type, item);
                item.store  = function ()                                       {
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
            
            $scope.$watch(function(){ return $location.search(); }, function(nv){
                if (!data.loaded || !nv) return;
                checkSelected(true);
            });
            
            function checkSelected(fromHash)                                    {
                var params = $location.search();
                if (fromHash)                                                   {
                    $scope.type = params.type;
                    switch (params.type)                                        {
                        case 'recipe':      $scope.recipe       = data.getRecipe(params.id || 1);     break;
                        case 'component':   $scope.component    = data.getComponent(params.id || 1);  break;
                        case 'filter':      $scope.filter       = data.getFilter(params.id || 1);     break;
                        case 'item':        $scope.item         = data.getItem(params.id || 1);       break;
                        case 'specie':      $scope.specie       = data.getSpecie(params.id || 1);     break;
                        default:            $scope.skill        = data.getSkill(params.id || 1);      break;
                    }
                } else                                                          {
                    params.type = $scope.type;
                    switch ($scope.type)                                        {
                        case 'recipe':      params.id = $scope.recipe?$scope.recipe.id:'';          break;
                        case 'component':   params.id = $scope.component?$scope.component.id:'';    break;
                        case 'filter':      params.id = $scope.filter?$scope.filter.id:'';          break;
                        case 'item':        params.id = $scope.item?$scope.item.id:'';              break;
                        case 'specie':      params.id = $scope.specie?$scope.specie.id:'';          break;
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
            
            /*
            $scope.$watch(function(){ return $location.search(); }, function(nv) {
                updateSelected = true;
            });
            $scope.$watch('type', function(nv) { updateLocation = true;         });
            $scope.$watch('skill', function(nv) { updateLocation = true;        });
            $scope.$watch('recipe', function(nv) { updateLocation = true;       });
            $scope.$watch('component', function(nv) { updateLocation = true;    });
            $scope.$watch('filter', function(nv) { updateLocation = true;       });
            $scope.$watch('item', function(nv) { updateLocation = true;         });
            $scope.$watch('specie', function(nv) { updateLocation = true;       });
            function executeUpdateSelected(force)                               {
                var params  = $location.search();
                if (!data.loaded || !params || !params.type || (!updateSelected && !force)) return; updateSelected = false;
                //
                $scope.type = params.type;
                switch (params.type)                                            {
                    case 'recipe':      $scope.recipe       = $scope.getRecipe(params.id || 1);     break;
                    case 'component':   $scope.component    = $scope.getComponent(params.id || 1);  break;
                    case 'filter':      $scope.filter       = $scope.getFilter(params.id || 1);     break;
                    case 'item':        $scope.item         = $scope.getItem(params.id || 1);       break;
                    case 'specie':      $scope.specie       = $scope.getSpecie(params.id || 1);     break;
                    default:            $scope.skill        = $scope.getSkill(params.id || 1);      break;
                }
                //
                $scope.$apply();
            }
            setInterval(executeUpdateSelected, 100);
            
            function executeUpdateLocation(force)                               {
                if (!$scope.ready || (!updateLocation && !force)) return; updateLocation = false;
                var params  = $location.search();
                params.type = $scope.type;
                switch ($scope.type)                                            {
                    case 'skill':       params.id = $scope.skill?$scope.skill.id:'';            break;
                    case 'recipe':      params.id = $scope.recipe?$scope.recipe.id:'';          break;
                    case 'component':   params.id = $scope.component?$scope.component.id:'';    break;
                    case 'filter':      params.id = $scope.filter?$scope.filter.id:'';          break;
                    case 'item':        params.id = $scope.item?$scope.item.id:'';              break;
                    case 'specie':      params.id = $scope.specie?$scope.specie.id:'';          break;
                    default: break;
                }
                $location.search(params);
                $scope.$apply();
            }
            setInterval(executeUpdateLocation, 100);
            
            
            $scope.getSkill             = function(id) { return data.getSkill(id); }
            $scope.getSkillName         = function (id) { return data.getSkillName(id); }
            $scope.getSkillDescription  = function (id) { return data.getSkillDescription(id); }
            
            $scope.getRecipe            = function(id) { return data.getRecipe(id) }
            $scope.getRecipeName        = function (id) { return data.getRecipeName(id); }
            $scope.getRecipeDescription = function (id) { return data.getRecipeDescription(id); }
            
            $scope.getComponent             = function(id) { return data.getComponent(id); }
            $scope.getComponentName         = function(id) { return data.getComponentName(id); }
            $scope.getComponentDescription  = function(id) { return data.getComponentDescription(id); }
            
            $scope.getFilter                = function(id) {}
            $scope.getFilterName            = function(id) {}
            $scope.getFilterDescription     = function(id) {}
            
            $scope.getItem                  = function(id) {}
            $scope.getItemName              = function(id) {}
            $scope.getItemDescription       = function(id) {}
            
            $scope.getSpecie                = function(id) {}
            $scope.getSpecieName            = function(id) {}
            $scope.getSpecieDescription     = function(id) {}
            
            $scope.search = function (model, list, searchValue)                 {
                if (model && list && list.length)
                    for (var i in list)
                        if (list[i].name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)
                            $scope[model] = list[i];
            }
            
            
            var checkInitialized = false;
            function checkStore()                                               {
                checkInitialized = true;
                var params = $location.search();
                var pairs = params.store.split(',');
                for (var i in pairs)                                            {
                    var pair = pairs[i].split(':');
                    
                    switch(pair[0])                                             {
                        case 'skill':       $scope.store('skill', $scope.getSkill(pair[1])); break;
                        case 'recipe':      $scope.store('recipe', $scope.getRecipe(pair[1])); break;
                        case 'component':   $scope.store('component', $scope.getComponent(pair[1])); break;
                        case 'filter':      $scope.store('filter', $scope.getFilter(pair[1])); break;
                        case 'item':        $scope.store('item', $scope.getItem(pair[1])); break;
                        default: break;
                    }
                }
            }
            $scope.$watch('stored', function(nv)                                {
                if (!checkInitialized) return;
                var params  = $location.search();
                params.store   = '';
                if (nv) for (var i in nv) params.store += (params.store?',':'') + nv[i].type +':'+ nv[i].item.id
                $location.search(params);
            }, true)
            
            $scope.store = function (type, item)                                {
                if (!type || !item) return;
                var element = {type: type, item: item };
                
                element.view   = function()                                     {
                    $scope.type         = type;
                    $scope[$scope.type] = item;
                }
                
                element.remove = function ()                                    {
                    var index = $scope.stored.indexOf(element);
                    if (index < 0) return;
                    $scope.stored.splice(index, 1);
                }
                
                $scope.stored.push(element);
            }
 */
        }]
    };
}]);
