'use strict';

var trcraftingbuddy = angular.module('trcraftingbuddy.darkhounds.net', []);

trcraftingbuddy.directive('viewport', [function()                               {
    return {
        scope:      {
            
        },
        transclude:     true,
        replace:        true,
        templateUrl:    'html/templates/viewport.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.skills       = [];
            $scope.ready        = false;
            
            function check()                                                    {
                $scope.ready        = ($scope.skills.length > 0 && $scope.recipes.length > 0 && $scope.components.length > 0 && $scope.items.length > 0 && $scope.species.length > 0)
            } 
            
            $scope.$watch(function(){ return data.skills}, function(nv)         {
                $scope.skills.length = 0;
                for (var id in nv) $scope.skills.push(nv[id]);
                $scope.skill = $scope.skills[0]; 
                check()
            });
            $scope.recipes      = [];
            $scope.$watch(function(){ return data.recipes}, function(nv)        {
                $scope.recipes.length = 0;
                for (var id in nv) $scope.recipes.push(nv[id]);
                $scope.recipe = $scope.recipes[0];
                check()
            });
            $scope.components   = [];
            $scope.$watch(function(){ return data.components}, function(nv)     {
                $scope.components.length = 0;
                for (var id in nv) $scope.components.push(nv[id]);
                $scope.component = $scope.components[0];
                check()
            });
            $scope.items        = [];
            $scope.$watch(function(){ return data.items}, function(nv)          {
                $scope.items.length = 0;
                for (var id in nv) $scope.items.push(nv[id]);
                $scope.item = $scope.items[0];
                check()
            });
            $scope.species      = [];
            $scope.$watch(function(){ return data.species}, function(nv)        {
                $scope.species.length = 0;
                for (var id in nv) $scope.species.push(nv[id]);
                $scope.specie = $scope.species[0];
                check()
            });
            
            
            $scope.getRecipe = function(id)                                     {
                for (var i in $scope.recipes)
                    if ($scope.recipes[i].id == id) return $scope.recipes[i];
                return {};
            }
            $scope.getRecipeName    = function (id)                             {
                var item = $scope.getRecipe(id)
                return item.name || '';
            }
            
            $scope.getComponent = function(id)                                  {
                for (var i in $scope.components)
                    if ($scope.components[i].id == id) return $scope.components[i];
                return {};
            }
            
            $scope.getComponentDescription  = function (id)                     {
                var item = $scope.getComponent(id)
                return item.description || '';
            }
            $scope.getComponentName    = function (id)                          {
                var item = $scope.getComponent(id)
                return item.name || '';
            }
            
            $scope.getItem = function(id)                                       {
                for (var i in $scope.items)
                    if ($scope.items[i].id == id) return $scope.items[i];
                return {};
            }
            $scope.getItemName    = function (id)                               {
                var item = $scope.getItem(id)
                return item.name || '';
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
    
    $http({method: 'GET', url: 'data/items.json'}).success(function(data)       {
        service.items       = data;
    });
    
    $http({method: 'GET', url: 'data/species.json'}).success(function(data)     {
        service.species     = data;
    });
    
    return service
}]);
