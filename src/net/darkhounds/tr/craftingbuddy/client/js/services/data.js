trcraftingbuddy.service('data', ['$rootScope', '$http', '$window', 'observable', function($rootScope, $http, $window, observable) {
    if (!$window.indexedDB)         $window.indexedDB       = $window.webkitIndexedDB || $window.mozIndexedDB || $window.msIndexedDB;
    if (!$window.IDBTransaction)    $window.IDBTransaction  = $window.webkitIDBTransaction || $window.msIDBTransaction;
    if (!$window.IDBKeyRange)       $window.IDBKeyRange     = $window.webkitIDBKeyRange || $window.msIDBKeyRange;
    //
    var service             = observable.create({loaded: false});
    service.getSkills       = function(filter) { return getFilteredByName(db, 'skills',     filter); };
    service.getRecipes      = function(filter) { return getFilteredByName(db, 'recipes',    filter); };
    service.getComponents   = function(filter) { return getFilteredByName(db, 'components', filter); };
    service.getFilters      = function(filter) { return getFilteredByName(db, 'filters',    filter); };
    service.getItems        = function(filter) { return getFilteredByName(db, 'items',      filter); };
    service.getSpecies      = function(filter) { return getFilteredByName(db, 'species',    filter); };
    service.getSkill        = function(id) { return getByKey(db, 'skills',      id); };
    service.getRecipe       = function(id) { return getByKey(db, 'recipes',     id); };
    service.getComponent    = function(id) { return getByKey(db, 'components',  id); };
    service.getFilter       = function(id) { return getByKey(db, 'filters',     id); };
    service.getItem         = function(id) { return getByKey(db, 'items',       id); };
    service.getSpecie       = function(id) { return getByKey(db, 'species',     id); };
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
    }
    //
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
    //
    function intializeStore(DBSchema, name, src)                                {
        var schema                      = DBSchema.createObjectStore(name, { keyPath: "id" });
        schema.createIndex("name", "name", { unique: false });
        return schema.transaction;
    }
    //
    function loadStore(DBSchema, name, src)                                     {
        checker[name]           = false;
        //
        var store               = DBSchema.transaction([name]).objectStore(name);
        if (!store.count) return $http({method: 'GET', url: src}).success(function(data) {
            var transaction         = DBSchema.transaction([name], "readwrite");
            transaction.onsuccess   = function(event)                           {
                checker[name]       = true;
                check();
            };
            var store               = transaction.objectStore(name);
            for (var i in data) store.add(data[i]);
        })
        //
        checker[name]   = true;
        check();
    }
    //
    function check()                                                            {
        if (!checker.skills || !checker.recipes || !checker.components || !checker.filters || !checker.items || !checker.species) return;
        //
        $rootScope.$apply(function()                                            {
            service.loaded  = true;
            service.$broadcast('loaded');
        });
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
            $rootScope.$apply(function() { response.$broadcast('error', error); });
        };
        cursor.onsuccess = function(e)                                          {
            var result = cursor.result || null;
            if (result)                                                         {
                if (!filter || result.value.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
                    response.data.push(result.value);
                result.continue();
            } else $rootScope.$apply(function()                                 {
                response.data.sort(function(a, b)                               {
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0;
                });
                response.$broadcast('loaded', response.data);
            });
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
            $rootScope.$apply(function()                                        {
                response.$broadcast('error', error);
            });
        };
        request.onsuccess   = function(e)                                       {
            $rootScope.$apply(function()                                        {
                response.data   = request.result;
                response.$broadcast('loaded', response.data);
            });
        };
        //
        return response;
    }
    
    return service
}]);
