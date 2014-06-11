trcraftingbuddy.directive('storeList', [function()                                  {
    return {
        scope:      {
        },
        replace:        true,
        templateUrl:    'html/templates/storeList.html',
        controller:     ['$scope', 'store', function($scope, store)                 {
            $scope.elements = [];

            store.$on('changed', function(elements) { updateItems();                });
            
            function updateItems()                                                  {
                $scope.elements.length  = 0;
                for (var i in store.elements) $scope.elements.push(store.elements[i]);
            }
            updateItems();
        }]
    };
}]);

trcraftingbuddy.directive('storeListElement', [function()                                  {
    return {
        scope:      {
            type:       '=',
            id:         '=',
            remove:     '&',
            view:       '&',
            blueprint:  '&'
        },
        replace:        true,
        templateUrl:    'html/templates/storeListElement.html',
        controller:     ['$scope', '$location', 'data', function($scope, $location, data) {
            $scope.element      = null;
            $scope.hasBlueprint = null;
            $scope.$watch('id', function(nv) { loadElement();                       });

            function loadElement()                                                  {
                if (!data.loaded || !$scope.type || !$scope.id) return;
                
                var request = null;
                switch($scope.type)                                                 {
                    case 'skill':       request = data.getSkill($scope.id);     break;
                    case 'recipe':      request = data.getRecipe($scope.id);    break;
                    case 'component':   request = data.getComponent($scope.id); break;
                    case 'filter':      request = data.getFilter($scope.id);    break;
                    case 'item':        request = data.getItem($scope.id);      break;
                    case 'specie':      request = data.getSpecie($scope.id);    break;
                    default: break;
                }
                if (request) request.$on('loaded', function(data)                   {
                    $scope.element          = data || null;
                    $scope.hasBlueprint     = ($scope.type == 'item' && $scope.element.resultOf && $scope.element.resultOf.length);
                });
            }
            
            if (data.loaded) loadElement();
            else data.$on('loaded', function(){ loadElement();                      });
        }]
    };
}]);