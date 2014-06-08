trcraftingbuddy.service('store', ['observable', '$rootScope', '$location', function(observable, $rootScope, $location) {
    //
    var service = observable.create({ elements: [] });
    
    
    service.add = function (type, id)                                           {
        if (!type || !id) return null;
        //
        var element         = {type: type, id: id};
        element.remove      = function ()                                       {
            var index       = service.elements.indexOf(element);
            if (index < 0) return;
            service.elements.splice(index, 1);
            //
            store           = '';
            for (var i in service.elements) store += (store?',':'') + service.elements[i].type + ':' + service.elements[i].id;
            var params      = $location.search();
            params.store    = store;
            $location.search(params);
            service.$broadcast('changed', service.elements);
        };
        element.view            = function ()                                   {
            var params          = $location.search();
            params.type         = type;
            params[params.type] = id;
            $location.search(params);
        };
        element.blueprint       = function ()                                   {
            var params          = $location.search();
            params.type         = 'blueprint';
            params.blueprint    = id;
            $location.search(params);
        };
        service.elements.push(element);
        store += (store?',':'') + element.type + ':' + element.id;
        var params      = $location.search();
        params.store    = store;
        $location.search(params);
        service.$broadcast('changed', service.elements);
        //
        return element;
    }
    //
    var store = '';
    function parseStore(newStore)                                               {
        store                   = '';
        service.elements.length    = 0;
        var pairs = newStore.split(',');
        for (var i in pairs)                                                {
            var pair    = pairs[i].split(':'); if (pair.length != 2) continue;
            var type    = pair[0];
            var id      = pair[1];
            service.add(type, id);
        }
    }
    $rootScope.$on('$locationChangeStart', function(nv)                         {
        var params          = $location.search();
        if (store != params.store) parseStore(params.store || '');
    });
    parseStore($location.search().store || '');
    //
    return service
}]);
