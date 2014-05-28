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
