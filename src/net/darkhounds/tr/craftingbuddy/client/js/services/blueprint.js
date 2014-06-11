trcraftingbuddy.service('blueprint', ['observable', 'data', 'analytics', '$rootScope', function(observable, data, analytics, $rootScope) {
    //
    var service             = observable.create({});
    var blueprint           = {};
    service.initialize      = function(id)                                      {
        analytics.register('blueprint/initialize/' + id);
        blueprint       = {id: id, parent: null};
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
        analytics.register('blueprint/recipe/' + id);
        var recipe      = {id: id, parent: parent, ingredients:[], agents:[]};
        //
        Object.defineProperty(recipe, 'addIngredient',                          {
            enumerable:     false,
            configurable:   false,
            writable:       false,
            value:          function(pos, id, filter){ return addIngredient(recipe, pos, id, filter);  }
        });
        Object.defineProperty(recipe, 'addAgent',                               {
            enumerable:     false,
            configurable:   false,
            writable:       false,
            value:          function(pos, id) { return addAgent(recipe, pos, id); }
        });
        parent.recipe   = recipe;
        //
        return recipe;
    };
    
    function addIngredient(parent, pos, id, filter)                             {
        analytics.register('blueprint/ingredient/' + id + '/pos/' + pos + '/filter/' + filter);
        var ingredient = {id: id, parent: parent, filter: filter};
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
    
    function addAgent(parent, pos, id)                                          {
        analytics.register('blueprint/agent/' + id + '/pos/' + pos);
        var agent = {id: id, parent: parent};
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
