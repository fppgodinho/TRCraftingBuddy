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
