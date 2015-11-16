module.exports = function(grunt) {
    // Custom config
    var config = {
        'less' : {
            'files' : [
                'src/less/variables/**/*.less',
                'src/less/variables.less',
                'src/less/mixins.less',
                'src/less/application.less',
                'src/less/common/Font.less',
                'src/less/common/Icons.less',
                'src/less/common/Tags.less',
                'src/less/common/UI.less',
                'src/less/common/**/*.less',
                'src/less/parts/**/*.less',
                'src/less/layouts/**/*.less',
                'src/less/components/**/*.less',
                'src/less/modules/**/*.less',
                'src/less/pages/**/*.less',
                '!src/less/index.less',
                '!src/less/components/old/**/*.less'
            ]
        }
    };
    // Load all grunt tasks matching the `grunt-*` pattern.
    require('load-grunt-tasks')(grunt);
    // Display how match time it took to build each task
    require('time-grunt')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build : [
                'build'
            ],
            post : [
                'temp',
                'lib'
            ]
        },

        less_imports: {
            source: {
                options: {
                    banner: '/* ************ QUICKSILK: APPLICATION ************ */'
                },
                src: config['less']['files'],
                dest: 'src/less/index.less'
            }
        },

        concat: {
            build_scripts: {
                src: [
                    'src/js/Application.js',
                    'src/js/components/**/*.js',
                    '!src/js/components/dev/**/*.js',
                    '!src/js/components/old/**/*.js'
                ],
                dest: 'build/js/<%= pkg.name %>.js'
            },
            build_styles: {
                files: [{
                    src: [
                        'src/css/**/*.css',
                        config['less']['files']
                    ],
                    dest: 'build/less/<%= pkg.name %>.less'
                }]
            }
        },

        uglify: {
            build: {
                src : 'build/js/<%= pkg.name %>.js',
                dest : 'build/js/<%= pkg.name %>.min.js'
            }
        },

        imagemin: {
            build: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: 'src/img/',
                    src: ['**/*.*'],
                    dest: 'build/img/'
                }]
            }
        },

        copy: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/fonts/',
                    src: [
                        '**/*.*',
                        '!**/*.json'
                    ],
                    dest: 'build/fonts/'
                }]
            }
        },


        watcher: {
            development: {
                files: [
                    'src/js/**/*.js',
                    'src/css/**/*.css',
                    'src/less/**/*.less'
                ],
                tasks: ['dev'],
                options: {
                    spawn: false
                }
            }
        }
    });
    // Tasks
    grunt.registerTask('default', ['clean', 'less_imports', 'concat', 'uglify', 'imagemin', 'copy', 'clean:post']);
    grunt.registerTask('dev', ['less_imports', 'concat', 'clean:post']);
};