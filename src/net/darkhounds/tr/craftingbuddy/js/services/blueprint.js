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
        if (element.result)                                                             {
            for (var i in recipe.ingredients)                                       {
                var ingredient  = createComponent(element.recipe.ingredients[i], element.result['filter'+(i+1)])
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
        var element         = {component: component, items:[]};
        var items           = filter?filter.items:component.items;
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
