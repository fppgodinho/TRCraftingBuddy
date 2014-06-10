/**
 * @ngdoc       factory
 * @name        observable
 * 
 * @description Factory for creating generic observable objects.
 */
trcraftingbuddy.factory('observable', ['$rootScope', function($rootScope)       {
    /**
     * @ngdoc       method
     * @name        observable#create
     * @kind        function
     * @description returns {observable} Returns a new observable object.
     * @param {object} An optional base object to extend.
     */
    return {
        create: function(object)                                                {
            var $observable         = object || {}; 
            $observable._listeners  = {};
            /**
             * Event listener registration.
             * @param type {string} The event name to listen to.
             * @param callback {function} The function be invoked by the trigger.
             * @returns {function} A function to unregister the listener.
             */
            $observable.$on         = function(type, callback, $scope)          {
                if (typeof type != "string" || typeof callback != "function") return -1;
                if (!$observable._listeners[type]) $observable._listeners[type] = [];
                var index           = $observable._listeners[type].length;
                $observable._listeners[type].push({callback: callback, scope: $scope || $rootScope});
                //
                return function()                                               {
                    if (!$observable._listeners[type]) return;
                    if (index >= 0 && index < $observable._listeners[type].length) $observable._listeners[type].splice(index, 1);
                    if (!$observable._listeners[type].length) delete $observable._listeners[type];
                };
            };
            
            /**
             * Event trigger. This will broadcast a trigger to all registered
             * listeners, any extra arguments beyond the first are injected into
             * the callback function of each listener.
             * @param type {string} Name of the event to trigger.
             */
            $observable.$broadcast = function(type)                             {
                var args    = [];
                if (arguments && arguments.length > 1) for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
                if ($observable._listeners[type])                               {
                    for (var id in $observable._listeners[type])                {
                        var scope   = $observable._listeners[type][id]['scope'];
                        $observable._listeners[type][id]['callback'].apply($observable, args);
                        digest(scope);
                    }
                }
            };
            
            function digest(scope)                                              {
                setTimeout(function() { scope.$digest();}, 0);
            }
            
            return $observable;
        }
    };
}]);
