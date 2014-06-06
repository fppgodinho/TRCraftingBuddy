trcraftingbuddy.directive('skills', [function()                                 {
    return {
        scope:      {
            model:  '='
        },
        replace:        true,
        templateUrl:    'html/templates/skills.html',
        controller:     ['$scope', 'data', function($scope, data)               {
            $scope.items        = [];
            $scope.craftingOnly = true;
            $scope.search       = '';
            //
            $scope.$watch('model', function(nv)                                 {
                if (!data.loaded || !nv) return;
                console.log(nv);
                data.inflateSkill(nv);
            });
            
            $scope.$watch('search', function(nv)                                {
                if (!data.loaded || !nv) return;
                getData();
            });
            
            function loadData()                                                 {
                data.$on('loaded', getData );
            }
            
            function getData()                                                  {
                data.getSkills($scope.search).$on('loaded', function(data)      {
                    $scope.items    = data || [];
                    $scope.model    = ($scope.items && $scope.items.length)?$scope.items[0]:$scope.model;
                    console.log('Skills:', $scope.items.length);
                });
            }
            //
            if (!data.loaded) loadData(); else getData();
            
            
//            $scope.$watch(function(){ return data.loaded; }, function(nv)       {
//                if (nv) updateList()
//            })
//            //
//            $scope.$watch('craftingOnly', function(nv) { updateList();          })
//            
//            function updateList()                                               {
//                $scope.items.length = 0;
//                for (var id in data.skills)
//                    if (!$scope.craftingOnly || ($scope.craftingOnly && data.skills[id].recipes && data.skills[id].recipes.length))
//                        $scope.items.push(data.skills[id]);
//                //
//            }
//            
//            $scope.$watch('search', function(nv)                                {
//                if (!data.loaded || !nv) return;
//                //
//                if ($scope.items && $scope.items.length) for (var i in $scope.items)
//                    if ($scope.items[i].name.toLowerCase().indexOf(nv.toLowerCase()) >= 0)
//                        $scope.model = $scope.items[i];
//            })
        }]
    };
}]);

trcraftingbuddy.directive('skillRecipe', [function()                            {
    return {
        scope:      {
            id: '='
        },
        template:
            '<div>' +
                '<button class="store" data-ng-click="store()">+</button>' +
                '<a href="javascript:void(0);" data-ng-click="view()">{{element.name}}</a>' +
            '</div>',
        replace:    true,
        controller: ['$scope', '$location', 'store', function($scope, $location, store) {
            $scope.element  = null;
            $scope.store    = function()                                        {
                if (!$scope.element) return;
                store.add('recipe', $scope.element);
            };
            $scope.view     = function()                                        {
                if (!$scope.element) return;
                var params  = $location.search();
                params.id   = $scope.element.id;
                params.type = 'recipe';
                $location.search(params);
            };
            
            $scope.$watch('id', function() { loadElement();                     });
            
            function loadElement()                                              {
                $scope.element  = null;
                var request     = data.getRecipe($scope.id);
                request.$on('loaded', function(data)                            {
                    $scope.element = data;
                });
            }
        }]
    }
}]);
