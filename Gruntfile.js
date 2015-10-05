module.exports = function(grunt) {
    // Load all grunt tasks matching the `grunt-*` pattern.
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: [
                    'js/Application.js',
                    'js/components/**/*.js'
                ],
                dest: 'js/build/<%= pkg.name %>.js'
            }
        },

        uglify: {
            build: {
                src: 'js/build/<%= pkg.name %>.js',
                dest: 'js/build/<%= pkg.name %>.min.js'
            }
        },

        watch: {
            scripts: {
                files: [
                    'js/**/*.js'
                ],
                tasks: ['concat'],
                options: {
                    spawn: false
                }
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('dev', ['concat']);

};