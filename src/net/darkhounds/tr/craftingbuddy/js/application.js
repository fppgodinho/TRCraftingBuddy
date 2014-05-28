'use strict';

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-51275210-2', 'darkhounds.net');

var trcraftingbuddy = angular.module('trcraftingbuddy.darkhounds.net', []);

trcraftingbuddy.service('analytics', ['$rootScope', '$location', '$window', function($rootScope, $location, $window){
    var analytics   = {};

    analytics.auto  = true;
    
    $rootScope.$on('$locationChangeStart', function()                               {
        if (!analytics.auto) return;
        analytics.register($location.absUrl());
    })

    analytics.register = function(path)                                             {
        $window.ga('send', 'pageview', path);
    }
    
    return analytics
}])
