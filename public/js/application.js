'use strict';

var trcraftingbuddy = angular.module('trcraftingbuddy.darkhounds.net', []);

trcraftingbuddy.directive('viewport', [function()                               {
    return {
        scope:      {
            
        },
        transclude:     true,
        replace:        true,
        templateUrl:    'html/templates/viewport.html',
        controller:     ['$scope', '$location', 'data', function($scope, $location, data) {
            var updateSelected = false;
            var updateLocation = false;

            $scope.stored       = [];
            
            $scope.ready        = false;
            $scope.type         = $location.search().type || 'skill';
            $scope.id           = $location.search().id || 1;
            
            $scope.skill        = false;
            $scope.recipe       = false;
            $scope.component    = false;
            $scope.filter       = false;
            $scope.item         = false;
            $scope.specie       = false;
            
            function check()                                                    {
                var ready       = ($scope.skills.length > 0 && $scope.recipes.length > 0 && $scope.components.length > 0 && $scope.filters.length > 0 && $scope.items.length > 0 && $scope.species.length > 0)
                var firstTime   = (!$scope.ready && ready)
                $scope.ready    = ready;
                if (firstTime) updateSelected = true;
            }
            
            $scope.skills       = [];
            $scope.$watch(function(){ return data.skills}, function(nv)         {
                $scope.skills.length    = 0;
                for (var id in nv) $scope.skills.push(nv[id]);
                check()
            });
            $scope.recipes      = [];
            $scope.$watch(function(){ return data.recipes}, function(nv)        {
                $scope.recipes.length = 0;
                for (var id in nv) $scope.recipes.push(nv[id]);
                check()
            });
            $scope.components   = [];
            $scope.$watch(function(){ return data.components}, function(nv)     {
                $scope.components.length    = 0;
                for (var id in nv) $scope.components.push(nv[id]);
                check()
            });
            $scope.filters        = [];
            $scope.$watch(function(){ return data.filters}, function(nv)        {
                $scope.filters.length = 0;
                for (var id in nv) $scope.filters.push(nv[id]);
                check()
            });
            $scope.items        = [];
            $scope.$watch(function(){ return data.items}, function(nv)          {
                $scope.items.length         = 0;
                for (var id in nv) $scope.items.push(nv[id]);
                check()
            });
            $scope.species      = [];
            $scope.$watch(function(){ return data.species}, function(nv)        {
                $scope.species.length = 0;
                for (var id in nv) $scope.species.push(nv[id]);
                check()
            });

            $scope.$watch(function(){ return $location.search(); }, function(nv) {
                updateSelected = true;
            });

            setInterval(executeUpdateSelected, 100);
            function executeUpdateSelected()                                    {
                var params  = $location.search();
                if (!$scope.ready || !params || !params.type || !updateSelected) return; updateSelected = false;
                
                $scope.type = params.type;
                switch (params.type)                                            {
                    case 'recipe':      $scope.recipe       = $scope.getRecipe(params.id || 1);     break;
                    case 'component':   $scope.component    = $scope.getComponent(params.id || 1);  break;
                    case 'filter':      $scope.filter       = $scope.getFilter(params.id || 1);     break;
                    case 'item':        $scope.item         = $scope.getItem(params.id || 1);       break;
                    case 'specie':      $scope.specie       = $scope.getSpecie(params.id || 1);     break;
                    default:            $scope.skill        = $scope.getSkill(params.id || 1);      break;
                }
                
                $scope.$apply();
            }
            
            setInterval(executeUpdateLocation, 100);
            function executeUpdateLocation()                                    {
                if (!$scope.ready || !updateLocation) return; updateLocation = false;
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
            $scope.$watch('type', function(nv)                                  {
                updateLocation = true;
            });
            $scope.$watch('skill', function(nv)                                 {
                updateLocation = true;
            });
            $scope.$watch('recipe', function(nv)                                {
                updateLocation = true;
            });
            $scope.$watch('component', function(nv)                             {
                updateLocation = true;
            });
            $scope.$watch('filter', function(nv)                                {
                updateLocation = true;
            });
            $scope.$watch('item', function(nv)                                  {
                updateLocation = true;
            });
            $scope.$watch('specie', function(nv)                                {
                updateLocation = true;
            });
            
            $scope.getSkill             = function(id)                          {
                for (var i in $scope.skills) if ($scope.skills[i].id == id) return $scope.skills[i];
                return {};
            }
            $scope.getSkillName         = function (id)                         {
                var item = $scope.getSkill(id)
                return item.name || '';
            }
            $scope.getSkillDescription  = function (id)                         {
                var item = $scope.getSkill(id)
                return item.description || '';
            }
            
            $scope.getRecipe            = function(id)                          {
                for (var i in $scope.recipes) if ($scope.recipes[i].id == id) return $scope.recipes[i];
                return {};
            }
            $scope.getRecipeName        = function (id)                         {
                var item = $scope.getRecipe(id)
                return item.name || '';
            }
            $scope.getRecipeDescription = function (id)                         {
                var item = $scope.getRecipe(id)
                return item.description || '';
            }
            
            $scope.getComponent             = function(id)                      {
                for (var i in $scope.components) if ($scope.components[i].id == id) return $scope.components[i];
                return {};
            }
            $scope.getComponentName         = function (id)                     {
                var item = $scope.getComponent(id)
                return item.name || '';
            }
            $scope.getComponentDescription  = function (id)                     {
                var item = $scope.getComponent(id)
                return item.description || '';
            }
            
            $scope.getFilter              = function(id)                        {
                for (var i in $scope.filters) if ($scope.filters[i].id == id) return $scope.filters[i];
                return {};
            }
            $scope.getFilterName          = function (id)                       {
                var item = $scope.getFilter(id)
                return item.name || '';
            }
            $scope.getFilterDescription = function (id)                         {
                var item = $scope.getFilter(id)
                return item.description || '';
            }

            $scope.getItem              = function(id)                          {
                for (var i in $scope.items) if ($scope.items[i].id == id) return $scope.items[i];
                return {};
            }
            $scope.getItemName          = function (id)                         {
                var item = $scope.getItem(id)
                return item.name || '';
            }
            $scope.getItemDescription   = function (id)                         {
                var item = $scope.getItem(id)
                return item.description || '';
            }

            $scope.getSpecie              = function(id)                        {
                for (var i in $scope.species) if ($scope.species[i].id == id) return $scope.species[i];
                return {};
            }
            $scope.getSpecieName          = function (id)                       {
                var item = $scope.getSpecie(id)
                return item.name || '';
            }
            $scope.getSpecieDescription = function (id)                         {
                var item = $scope.getSpecie(id)
                return item.description || '';
            }
            
            $scope.search = function (model, list, searchValue)                 {
                if (model && list && list.length)
                    for (var i in list)
                        if (list[i].name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)
                            $scope[model] = list[i];
            }
            
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
        }]
    };
}]);

trcraftingbuddy.service('data', ['$http', function($http)                       {
    var service = {};
    
    $http({method: 'GET', url: 'data/skills.json'}).success(function(data)      {
        service.skills      = data;
    });
    
    $http({method: 'GET', url: 'data/recipes.json'}).success(function(data)     {
        service.recipes     = data;
    });
    
    $http({method: 'GET', url: 'data/components.json'}).success(function(data)  {
        service.components  = data;
    });

    $http({method: 'GET', url: 'data/filters.json'}).success(function(data)     {
        service.filters     = data;
    });

    $http({method: 'GET', url: 'data/items.json'}).success(function(data)       {
        service.items       = data;
    });

    $http({method: 'GET', url: 'data/species.json'}).success(function(data)     {
        service.species     = data;
    });
    
    return service
}]);
