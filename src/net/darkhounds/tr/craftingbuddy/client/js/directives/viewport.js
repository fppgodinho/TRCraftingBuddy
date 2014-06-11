trcraftingbuddy.directive('viewport', [function()                               {
    return {
        replace:        true,
        templateUrl:    'html/templates/viewport.html',
        controller:     ['$scope', '$location', 'data', 'analytics', 'store', function($scope, $location, data, analytics, store) {
            $scope.ready        = false;
            $scope.type         = $location.search().type || 'skill';
            
            analytics.auto = true;
            analytics.initialize('UA-51275210-2', 'darkhounds.net');
            
            $scope.$watch('type', function(nv)                                  {
                switch (nv.toLowerCase())                                       {
                    case 'recipe':      $scope.type = 'recipe';     break;
                    case 'component':   $scope.type = 'component';  break;
                    case 'filter':      $scope.type = 'filter';     break;
                    case 'fitting':     $scope.type = 'fitting';    break;
                    case 'structure':   $scope.type = 'structure';  break;
                    case 'item':        $scope.type = 'item';       break;
                    case 'specie':      $scope.type = 'specie';     break;
                    case 'blueprint':   $scope.type = 'blueprint';  break;
                    default:            $scope.type = 'skill';      break;
                }
                var params  = $location.search();
                params.type = $scope.type;
                $location.search(params);
            });
            
            $scope.$on('$locationChangeStart', function(nv)                     {
                $scope.type         = $location.search().type;
            });
            
            data.$on('loaded', function()                                       {
                $scope.ready        = true;
            });

        }]
    };
}]);
