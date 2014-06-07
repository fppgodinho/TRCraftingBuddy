trcraftingbuddy.factory('elementController', ['data', 'store' , '$location', function(data, store, $location) {
    return {
        create: function($scope, base)                                              {
            var controller  = base || {};
            $scope.element  = null;
            $scope.store    = function()                                            {
                if (controller.type && $scope.element)
                    store.add(controller.type, $scope.element);
            };
            $scope.view     = function()                                            {
                if (!controller.type || !$scope.element) return;
                var params              = $location.search();
                params.type             = controller.type;
                params[controller.type] = $scope.element.id;
                if (params.type && params[controller.type]) $location.search(params);
            };
            
            $scope.$watch('id', function(nv) { controller.loadElement();            });

            controller.loadElement    = function()                                  {
                console.log('Load Element has to be defined!');
            }
            
            return controller;
        }
    };
}]);
