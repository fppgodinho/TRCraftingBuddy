trcraftingbuddy.factory('blueprintController', ['disposableController', 'store', 'data', '$location',
    function(disposableController, store, data, $location)                      {
        return {
            create: function($scope, type, base)                                {
                var controller      = disposableController.create($scope, base || {});
                controller.data     = data;
                //
                $scope.reset        = function()                                {
                    $scope[type]    = null;
                };
                $scope.store        = function()                                {
                    if (!$scope[type]) return;
                    store.add(type, $scope[type].id);
                };
                $scope.view         = function()                                {
                    if (!$scope[type]) return;
                    var params      = $location.search();
                    params.type     = type; 
                    params[type]    = $scope[type].id;
                    $location.search(params);
                };
                //
                var loadEvents      = [];
                controller.getData  = function(){};
                controller.addLoadEventRemover  = function (remover)            {
                    loadEvents.push(controller.addEventRemover(remover));
                    return remover;
                };
                controller.clearLoadEvents      = function()                    {
                    while (loadEvents.length)                                   {
                        var remover = loadEvents.shift(); remover();
                        controller.removeEventRemover(remover);
                    }
                };
                //
                controller.init                 = function()                    {
                    if (!controller.data.loaded) controller.addEventRemover(controller.data.$on('loaded', function() {
                        controller.getData();
                    })); else controller.getData();
                };
                //
                $scope.$on('$destroy', function()                               {
                    controller.getData              = null;
                    controller.addLoadEventRemover  = null;
                    controller.clearLoadEvents      = null;
                    controller.data                 = null;
                    loadEvents                      = null;
                });
                //
                return controller;
            }
        };
    }
]);
