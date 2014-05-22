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
