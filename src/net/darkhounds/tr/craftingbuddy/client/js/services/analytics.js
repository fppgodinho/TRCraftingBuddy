/**
 * Google Analytics Service
 * 
 * @property auto Sets the auto pageview registration to true
 * @method initialize 
 */
trcraftingbuddy.service('analytics', ['$rootScope', '$location', '$window', function($rootScope, $location, $window){
    var initialized     = false;
    var service         = {auto: false};
    /**
     * Initialized the google analytics session
     * @param key Google Analytics account key.
     * @param domain Google Analytics account domain
     */
    service.initialize  = function(key, domain)                                 {
        (function(i,s,o,g,r,a,m)                                                {
            i['GoogleAnalyticsObject']  = r;
            i[r]                        = i[r] || function()                    {
                (i[r].q = i[r].q || []).push(arguments)
            };
            i[r].l                      = 1 * new Date();
            a                           = s.createElement(o);
            m                           = s.getElementsByTagName(o)[0];
            a.async                     = 1;
            a.src                       = g;
            m.parentNode.insertBefore(a, m);
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
        ga('create', key, domain);
        //
        initialized = true;
    };

    /**
     * Register a page view with the given 'path'
     * @param path The path to register as a page view
     */
    service.register = function(path)                                           {
        $window.ga('send', 'pageview', path);
    };

    /**
     * Auto pageview registration, only used if the service 'auto' property is set to true
     */
    $rootScope.$on('$locationChangeStart', function()                           {
        if (!initialized || !service.auto) return;
        service.register($location.absUrl());
    });
    
    return service;
}]);
