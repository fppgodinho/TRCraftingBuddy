trcraftingbuddy.service('store', ['$location', function($location)              {
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
        }
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
        item.hasBlueprint   = (type == 'item' && element.resultOf && element.resultOf.length); 
        service.items.push(item);
        //
        return item;
    }
    //
    return service
}]);
