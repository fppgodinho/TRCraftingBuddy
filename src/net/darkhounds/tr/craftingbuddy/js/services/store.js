trcraftingbuddy.service('store', [function()                                    {
    //
    var service = { items: [] };
    service.add = function (type, element)                                      {
        if (!type || !element) return null;
        //
        var item        = {type: type, element: element };
        item.remove     = function ()                                           {
            var index   = service.items.indexOf(item);
            if (index < 0) return;
            service.items.splice(index, 1);
        }
        service.items.push(item);
        //
        return item;
    }
    //
    return service
}]);
