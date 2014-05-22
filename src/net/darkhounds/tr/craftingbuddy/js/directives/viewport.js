trcraftingbuddy.directive('viewport', [function()                               {
    return {
        scope:      {
            
        },
        transclude:     true,
        replace:        true,
        templateUrl:    'html/templates/viewport.html',
        controller:     ['$scope', '$location', 'data', function($scope, $location, data) {
            $scope.ready        = false;
            $scope.type         = $location.search().type || 'skill';
            $scope.id           = $location.search().id || 1;
            
            $scope.skill        = false;
            $scope.recipe       = false;
            $scope.component    = false;
            $scope.filter       = false;
            $scope.item         = false;
            $scope.specie       = false;
            
            function check()                                                    {
                var ready       = ($scope.skills.length > 0 && $scope.recipes.length > 0 && $scope.components.length > 0 && $scope.filters.length > 0 && $scope.items.length > 0 && $scope.species.length > 0)
                var firstTime   = (!$scope.ready && ready)
                $scope.ready    = ready;
                if (firstTime) updateSelected();
            }

            $scope.skills       = [];
            $scope.$watch(function(){ return data.skills}, function(nv)         {
                $scope.skills.length = 0;
                for (var id in nv) $scope.skills.push(nv[id]);
                // $scope.skill    = $scope.skills[0]; 
                check()
            });
            $scope.recipes      = [];
            $scope.$watch(function(){ return data.recipes}, function(nv)        {
                $scope.recipes.length = 0;
                for (var id in nv) $scope.recipes.push(nv[id]);
                // $scope.recipe   = $scope.recipes[0];
                check()
            });
            $scope.components   = [];
            $scope.$watch(function(){ return data.components}, function(nv)     {
                $scope.components.length = 0;
                for (var id in nv) $scope.components.push(nv[id]);
                // $scope.component = $scope.components[0];
                check()
            });
            $scope.filters        = [];
            $scope.$watch(function(){ return data.filters}, function(nv)        {
                $scope.filters.length = 0;
                for (var id in nv) $scope.filters.push(nv[id]);
                // $scope.filter   = $scope.filters[0];
                check()
            });
            $scope.items        = [];
            $scope.$watch(function(){ return data.items}, function(nv)          {
                $scope.items.length = 0;
                for (var id in nv) $scope.items.push(nv[id]);
                // $scope.item     = $scope.items[0];
                check()
            });
            $scope.species      = [];
            $scope.$watch(function(){ return data.species}, function(nv)        {
                $scope.species.length = 0;
                for (var id in nv) $scope.species.push(nv[id]);
                // $scope.specie   = $scope.species[0];
                check()
            });

            $scope.$watch(function(){ return $location.search(); }, function(nv) {
                updateSelected();
            });
            
            function updateSelected()                                           {
                console.log('Hummmmm');
                var params  = $location.search();
                if (!$scope.ready || !params || !params.type) return;
                $scope.type = params.type;
                switch (params.type)                                            {
                    case 'recipe':      $scope.recipe       = $scope.getRecipe(params.id || 1);     break;
                    case 'component':   $scope.component    = $scope.getComponent(params.id || 1);  break;
                    case 'filter':      $scope.filter       = $scope.getFilter(params.id || 1);     break;
                    case 'item':        $scope.item         = $scope.getItem(params.id || 1);       break;
                    case 'specie':      $scope.specie       = $scope.getSpecie(params.id || 1);     break;
                    default:            $scope.skill        = $scope.getSkill(params.id || 1);      break;
                }
                console.log('doooiisss', params.type, params.id, $scope.recipe);
            }
            
            function updateLocation()                                          {
                if (!$scope.ready) return;
                var params  = $location.search();
                params.type = $scope.type;
                switch ($scope.type)                                            {
                    case 'skill':       params.id = $scope.skill?$scope.skill.id:'';            break;
                    case 'recipe':      params.id = $scope.recipe?$scope.recipe.id:'';          break;
                    case 'component':   params.id = $scope.component?$scope.component.id:'';    break;
                    case 'filter':      params.id = $scope.filter?$scope.filter.id:'';          break;
                    case 'item':        params.id = $scope.item?$scope.item.id:'';              break;
                    case 'specie':      params.id = $scope.specie?$scope.specie.id:'';          break;
                    default: break;
                }
                $location.search(params);
            }
            $scope.$watch('type', function(nv)                                  {
                updateLocation();
            });
            $scope.$watch('skill', function(nv)                                 {
                updateLocation();
            });
            $scope.$watch('recipe', function(nv)                                {
                updateLocation();
            });
            $scope.$watch('component', function(nv)                             {
                updateLocation();
            });
            $scope.$watch('filter', function(nv)                                {
                updateLocation();
            });
            $scope.$watch('item', function(nv)                                  {
                updateLocation();
            });
            $scope.$watch('specie', function(nv)                                {
                updateLocation();
            });
            
            
            
            
            
            
            
            
            
            $scope.getSkill             = function(id)                          {
                for (var i in $scope.skills)
                    if ($scope.skills[i].id == id) return $scope.skills[i];
                return {};
            }
            $scope.getSkillName         = function (id)                         {
                var item = $scope.getSkill(id)
                return item.name || '';
            }
            $scope.getSkillDescription  = function (id)                         {
                var item = $scope.getSkill(id)
                return item.description || '';
            }
            
            $scope.getRecipe            = function(id)                          {
                for (var i in $scope.recipes)
                    if ($scope.recipes[i].id == id) return $scope.recipes[i];
                return {};
            }
            $scope.getRecipeName        = function (id)                         {
                var item = $scope.getRecipe(id)
                return item.name || '';
            }
            $scope.getRecipeDescription = function (id)                         {
                var item = $scope.getRecipe(id)
                return item.description || '';
            }
            
            $scope.getComponent             = function(id)                      {
                for (var i in $scope.components)
                    if ($scope.components[i].id == id) return $scope.components[i];
                return {};
            }
            $scope.getComponentName         = function (id)                     {
                var item = $scope.getComponent(id)
                return item.name || '';
            }
            $scope.getComponentDescription  = function (id)                     {
                var item = $scope.getComponent(id)
                return item.description || '';
            }
            
            $scope.getFilter              = function(id)                        {
                for (var i in $scope.filters)
                    if ($scope.filters[i].id == id) return $scope.filters[i];
                return {};
            }
            $scope.getFilterName          = function (id)                       {
                var item = $scope.getFilter(id)
                return item.name || '';
            }
            $scope.getFilterDescription = function (id)                         {
                var item = $scope.getFilter(id)
                return item.description || '';
            }

            $scope.getItem              = function(id)                          {
                for (var i in $scope.items)
                    if ($scope.items[i].id == id) return $scope.items[i];
                return {};
            }
            $scope.getItemName          = function (id)                         {
                var item = $scope.getItem(id)
                return item.name || '';
            }
            $scope.getItemDescription   = function (id)                         {
                var item = $scope.getItem(id)
                return item.description || '';
            }

            $scope.getSpecie              = function(id)                        {
                for (var i in $scope.species)
                    if ($scope.species[i].id == id) return $scope.species[i];
                return {};
            }
            $scope.getSpecieName          = function (id)                       {
                var item = $scope.getSpecie(id)
                return item.name || '';
            }
            $scope.getSpecieDescription = function (id)                         {
                var item = $scope.getSpecie(id)
                return item.description || '';
            }

        }]
    };
}]);
