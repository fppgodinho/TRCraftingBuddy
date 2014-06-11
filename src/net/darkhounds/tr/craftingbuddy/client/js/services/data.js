trcraftingbuddy.service('data', ['$rootScope', '$http', '$window', 'observable', function($rootScope, $http, $window, observable) {
    if (!$window.indexedDB)         $window.indexedDB       = $window.webkitIndexedDB || $window.mozIndexedDB || $window.msIndexedDB;
    if (!$window.IDBTransaction)    $window.IDBTransaction  = $window.webkitIDBTransaction || $window.msIDBTransaction;
    if (!$window.IDBKeyRange)       $window.IDBKeyRange     = $window.webkitIDBKeyRange || $window.msIDBKeyRange;
    //
    var service             = observable.create({loaded: false});
    //
    service.getSkills       = function(filter) { return getFilteredByName(db, 'skills',     filter); };
    service.getSkill        = function(id) { return getByKey(db, 'skills',      id); };
    //
    service.getRecipes      = function(filter) { return getFilteredByName(db, 'recipes',    filter); };
    service.getRecipe       = function(id) { return getByKey(db, 'recipes',     id); };
    //
    service.getComponents   = function(filter) { return getFilteredByName(db, 'components', filter); };
    service.getComponent    = function(id) { return getByKey(db, 'components',  id); };
    //
    service.getFilters      = function(filter) { return getFilteredByName(db, 'filters',    filter); };
    service.getFilter       = function(id) { return getByKey(db, 'filters',     id); };
    //
    service.getItems        = function(filter) { return getFilteredByName(db, 'items',      filter); };
    service.getItem         = function(id) { return getByKey(db, 'items',       id); };
    //
    service.getFittings     = function(filter) { return getFilteredByName(db, 'fittings',      filter); };
    service.getFitting      = function(id) { return getByKey(db, 'fittings',    id); };
    //
    service.getStructures   = function(filter) { return getFilteredByName(db, 'structures',      filter); };
    service.getStructure    = function(id) { return getByKey(db, 'structures',  id); };
    //
    service.getSpecies      = function(filter) { return getFilteredByName(db, 'species',    filter); };
    service.getSpecie       = function(id) { return getByKey(db, 'species',     id); };
    //
    service.getBlueprints   = function(filter)  { return getFilteredByName(db, 'blueprints', filter); };
    service.getBlueprint    = function(id) { return getByKey(db, 'blueprints',  id); };
    service.saveBlueprint   = function(data) { return saveData(db, 'blueprints',    data);};
    service.removeBlueprint = function(id) { return removeByKey(db, 'blueprints',   id);};
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
    };
    //
    var request             = window.indexedDB.open("gameDB", 2);
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
        intializeStore(DBSchema, 'fittings');
        intializeStore(DBSchema, 'structures');
        intializeStore(DBSchema, 'species');
        intializeStore(DBSchema, 'blueprints', true);
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
        loadStore(db, 'fittings',   'data/fittings.json');
        loadStore(db, 'structures', 'data/structures.json');
        loadStore(db, 'species',    'data/species.json');
    };
    //
    function intializeStore(DBSchema, name, src, auto)                          {
        if (DBSchema.objectStoreNames.contains(name))                           {
            DBSchema.deleteObjectStore(name);
        }
        
        var schema      = DBSchema.createObjectStore(name, { keyPath: "id", autoIncrement: true });
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
                
            });
            //
            checker[name]   = true;
            check();
        }
    }
    //
    function check()                                                            {
        if (!checker.skills || !checker.recipes || !checker.components || !checker.filters || !checker.items || !checker.species) return;
        //
        service.loaded  = true;
        service.$broadcast('loaded');
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
            response.$broadcast('error', error);
        };
        cursor.onsuccess = function(e)                                          {
            var result = cursor.result || null;
            if (result)                                                         {
                if (!filter || result.value.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
                    response.data.push(result.value);
                result.continue();
            } else                                                              {
                response.data.sort(function(a, b)                               {
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0;
                });
                response.$broadcast('loaded', response.data);
            } 
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
            response.$broadcast('error', error);
        };
        request.onsuccess   = function(e)                                       {
            response.data   = request.result;
            if (!request.result) console.log('LOAD ERROR: ', name, key);
            response.$broadcast('loaded', response.data);
        };
        //
        return response;
    }
    
    function saveData(DBSchema, name, data)                                     {
        var response        = observable.create({data: null});
        //
        console.log('About to save:', data);
        var request         = DBSchema.transaction([name], "readwrite").objectStore(name).put(data);
        request.onerror     = function(error)                                   {
            response.$broadcast('error', error);
        };
        request.onsuccess   = function(e)                                       {
            response.data   = request.result;
            response.$broadcast('saved', response.data);
        };
        //
        return response;
    }
    
    function removeByKey(DBSchema, name, key)                                   {
        var response        = observable.create({data: null});
        //
        var request         = DBSchema.transaction([name], "readwrite").objectStore(name).delete(key);
        request.onerror     = function(error)                                   {
            response.$broadcast('error', error);
        };
        request.onsuccess   = function(e)                                       {
            response.data   = key;
            response.$broadcast('removed', key);
        };
        //
        return response;
    }
    
    return service
}]);
