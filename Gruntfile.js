'use strict';

module.exports = function(grunt)                                                {
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    
    grunt.initConfig({
        concat: {
            client: {
                src: 'src/net/darkhounds/tr/craftingbuddy/client/js/**/*.js',   dest: 'public/js/application.js'
            },
            admin: {
                src: 'src/net/darkhounds/tr/craftingbuddy/admin/js/**/*.js',    dest: 'public/admin/js/application.js'
            },
            server: {
                src: 'src/net/darkhounds/tr/craftingbuddy/client/js/**/*.js',   dest: 'server/application.js'
            }
        },
        copy: {
            client: {
                files: [
                    {src: 'src/net/darkhounds/tr/craftingbuddy/client/html/index.html', dest: 'public/index.html'},
                    {cwd: 'src/net/darkhounds/tr/craftingbuddy/client/html/templates',  dest: 'public/html/templates',  src: '**', expand: true},
                    {cwd: 'src/net/darkhounds/tr/craftingbuddy/client/html/views',      dest: 'public/html/views',      src: '**', expand: true}
                ]
            },
            admin: {
                files: [
                    {src: 'src/net/darkhounds/tr/craftingbuddy/admin/html/index.html', dest: 'public/admin/index.html'},
                    {cwd: 'src/net/darkhounds/tr/craftingbuddy/admin/html/templates',  dest: 'public/admin/html/templates', src: '**', expand: true},
                    {cwd: 'src/net/darkhounds/tr/craftingbuddy/admin/html/views',      dest: 'public/admin/html/views',     src: '**', expand: true}
                ]
            }
        },
        compass: {
            client: {
                options: {
                    config:             'config/client.rb',
                    environment:        'production',
                    outputStyle:        'nested',
                    noLineComments:     true
                }
            },
            admin: {
                options: {
                    config:             'config/admin.rb',
                    environment:        'production',
                    outputStyle:        'nested',
                    noLineComments:     true
                }
            }
        },
        uglify:     {
            client:     {
                options:    {
                    beautify:   false,
                    compress:   { drop_console: true }
                },
                files:  {'public/js/application.js': 'public/js/application.js'}
            },
            admin:     {
                options:    {
                    beautify:   false,
                    compress:   { drop_console: true }
                },
                files:  {'public/js/application.js': 'public/admin/js/application.js'}
            }
        },
        htmlmin:    {
            client:     {
                options:    {
                  removeComments:       true,
                  collapseWhitespace:   true
                },
                files:      [{
                    expand: true,
                    cwd:    'public/html',
                    src:    '**/*.html',
                    dest:   'public/html'
                }]
            },
            admin:     {
                options:    {
                  removeComments:       true,
                  collapseWhitespace:   true
                },
                files:      [{
                    expand: true,
                    cwd:    'public/admin/html',
                    src:    '**/*.html',
                    dest:   'public/admin/html'
                }]
            }
        }
    });
    
    grunt.registerTask('default', ['concat:client', 'copy:client', 'compass:client']);
    grunt.registerTask('admin', ['concat:admin', 'copy:admin', 'compass:admin']);
    grunt.registerTask('server', ['concat:server']);
    grunt.registerTask('compress', ['uglify:client', 'uglify:admin', 'htmlmin:dist', 'htmlmin:admin']);
}
