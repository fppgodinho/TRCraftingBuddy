trcraftingbuddy.service('store', ['$rootScope', '$location', 'data', function($rootScope, $location, data) {
    //
    var service = { items: [] };
    service.add = function (type, element)                                      {
        if (!type || !element) return null;
        //
        var item            = {type: type, element: element};
        item.remove         = function ()                                       {
            var index       = service.items.indexOf(item);
            if (index < 0) return;
            service.items.splice(index, 1);
            //
            store           = '';
            for (var i in service.items)
                store += (store?',':'') + service.items[i].type + ':' + service.items[i].element.id;
            var params      = $location.search();
            params.store    = store;
            $location.search(params);
        };
        item.view           = function ()                                       {
            var params          = $location.search();
            params.type         = type;
            params[params.type] = element.id;
            $location.search(params);
        };
        item.blueprint          = function ()                                   {
            var params          = $location.search();
            params.type         = 'blueprint';
            params.blueprint    = element.id;
            $location.search(params);
        };
        item.hasBlueprint       = (type == 'item' && element.resultOf && element.resultOf.length); 
        service.items.push(item);
        store += (store?',':'') + type + ':' + element.id;
        var params      = $location.search();
        params.store    = store;
        $location.search(params);
        //
        return item;
    }
    //
    var store = '';
    function parseStore(newStore)                                               {
        store                   = '';
        service.items.length    = 0;
        var pairs = newStore.split(',');
        for (var i in pairs)                                                {
            var pair    = pairs[i].split(':'); if (pair.length != 2) continue;
            var type    = pair[0];
            var id      = pair[1];
            var request = null;
            switch(pair[0])                                                 {
                case 'skill':       request = data.getSkill(id);        break;
                case 'recipe':      request = data.getRecipe(id);       break;
                case 'component':   request = data.getComponent(id);    break;
                case 'filter':      request = data.getFilter(id);       break;
                case 'item':        request = data.getItem(id);         break;
                case 'specie':      request = data.getSpecie(id);       break;
                default: break;
            }
            if (request) request.$on('loaded', function(data){
                service.add(type, data); 
            }) 
        }
    }
    $rootScope.$on('$locationChangeStart', function(nv)                         {
        var params          = $location.search();
        if (store != params.store && data.loaded) parseStore(params.store || '');
    });
    if (data.loaded) parseStore($location.search().store || '');
    else data.$on('loaded', function(){
        parseStore($location.search().store || '');
    });
    //
    return service
}]);
