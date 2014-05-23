trcraftingbuddy.directive('skills', [function()                                 {
    return {
        scope:      {
            skill:  '=',
            recipe: '='
        },
        replace:        true,
        templateUrl:    'html/templates/skills.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            $scope.craftingOnly = true;
            //
            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
                if (nv) updateList()
            })
            //
            $scope.$watch('craftingOnly', function(nv) { updateList();          })
            
            function updateList()                                               {
                $scope.items.length = 0;
                for (var id in data.skills)
                    if (!$scope.craftingOnly || ($scope.craftingOnly && data.skills[id].recipes && data.skills[id].recipes.length))
                        $scope.items.push(data.skills[id]);
                //
            }
            
            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                //
                if ($scope.items && $scope.items.length) for (var i in $scope.items)
                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
                        $scope.skill = $scope.items[i];
            })
        }]
    };
}]);
