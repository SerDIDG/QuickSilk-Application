module.exports = function(grunt) {
    // Load all grunt tasks matching the `grunt-*` pattern.
    require('load-grunt-tasks')(grunt);
    // Display how match time it took to build each task
    require('@lodder/time-grunt')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner : '/*! ************ <%= pkg.name %> v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd HH:MM") %>) ************ */\n',

        packages : {
            common : grunt.file.readJSON('../common/package.json')
        },

        paths : {
            modules : 'node_modules',
            components : 'libs',
            src : 'src',
            build : 'build',
            temp : 'temp'
        },

        components : {
            common : {
                path : '../common',
                styles : [
                    '<%= components.common.path %>/build/less/<%= packages.common.name %>.less'
                ],
                scripts : [
                    '<%= components.common.path %>/build/js/<%= packages.common.name %>.js'
                ],
                images : [
                    '<%= components.common.path %>/build/img'
                ],
                fonts : [
                    '<%= components.common.path %>/build/fonts'
                ]
            },
            chartjs : {
                path : '<%= paths.modules %>/chart.js',
                dist : '<%= components.chartjs.path %>/dist',
                scripts : [
                    '<%= components.chartjs.dist %>/Chart.js'
                ]
            }
        },

        clean: {
            scripts : [
                '<%= paths.build %>/js/*'
            ],
            styles : [
                '<%= paths.build %>/less/*',
                '<%= paths.build %>/css/*'
            ],
            images : [
                '<%= paths.build %>/img/*'
            ],
            fonts : [
                '<%= paths.build %>/fonts/*'
            ],
            temp : [
                '<%= paths.temp %>'
            ],
            libs : [
                '<%= paths.build %>/libs/*'
            ]
        },

        concat : {
            scripts : {
                options: {
                    banner: '<%= banner %>'
                },
                src : [
                    '<%= paths.src %>/js/Application.js',
                    '<%= paths.src %>/js/abstracts/AbstractModule.js',
                    '<%= paths.src %>/js/abstracts/**/*.js',
                    '<%= paths.src %>/js/components/FlowScenario.js',
                    '<%= paths.src %>/js/components/**/*.js',
                    '<%= paths.src %>/js/modules/**/*.js',
                    '!<%= paths.src %>/js/dev/**/*.js',
                    '!<%= paths.src %>/js/components/dev/**/*.js',
                    '!<%= paths.src %>/js/components/old/**/*.js'
                ],
                dest : '<%= paths.build %>/js/<%= pkg.name %>.js'
            },
            styles : {
                options: {
                    banner: '<%= banner %>'
                },
                src : [
                    '<%= paths.src %>/less/extra/*.less',
                    '<%= paths.src %>/less/variables/*.less',
                    '<%= paths.src %>/less/mixins.less',
                    '<%= paths.src %>/less/application.less',
                    '<%= paths.src %>/less/common/Font.less',
                    '<%= paths.src %>/less/common/Icons.less',
                    '<%= paths.src %>/less/common/Tags.less',
                    '<%= paths.src %>/less/common/UI.less',
                    '<%= paths.src %>/less/common/**/*.less',
                    '<%= paths.src %>/less/parts/**/*.less',
                    '<%= paths.src %>/less/layouts/**/*.less',
                    '<%= paths.src %>/less/components/**/*.less',
                    '<%= paths.src %>/less/modules/**/*.less',
                    '<%= paths.src %>/less/pages/**/*.less',
                    '!<%= paths.src %>/less/dev/**/*.less',
                    '!<%= paths.src %>/less/modules/templates/**/*.less',
                    '!<%= paths.src %>/less/modules/templates_default/**/*.less',
                    '!<%= paths.src %>/less/components/old/**/*.less'
                ],
                dest : '<%= paths.build %>/less/<%= pkg.name %>.less'
            },
            variables : {
                src : [
                    '<%= components.common.path %>/build/less/<%= packages.common.name %>.variables.less',
                    '<%= paths.src %>/less/variables/**/*.less'
                ],
                dest : '<%= paths.build %>/less/<%= pkg.name %>.variables.less'
            }
        },

        svgcss : {
            build : {
                options : {
                    previewhtml : null,
                    cssprefix : 'svg__app__',
                    csstemplate : '<%= paths.src %>/hbs/svg.hbs'
                },
                src : ['<%= paths.src %>/img/svg/*.svg'],
                dest : '<%= paths.src %>/less/extra/svg.less'
            }
        },

        lessvars: {
            options: {
                units : true,
                format : function(vars){
                    return 'window.LESS = ' + JSON.stringify(vars) + ';';
                }
            },
            build : {
                src : ['<%= paths.build %>/less/<%= pkg.name %>.variables.less'],
                dest : '<%= paths.build %>/js/<%= pkg.name %>.variables.js'
            }
        },

        replace: {
            options: {
                patterns: [
                    {
                        match: 'VERSION',
                        replacement: '<%= pkg.version %>'
                    }
                ]
            },
            scripts: {
                src: ['<%= paths.build %>/js/<%= pkg.name %>.js'],
                dest: '<%= paths.build %>/js/<%= pkg.name %>.js'
            },
            styles: {
                src: ['<%= paths.build %>/less/<%= pkg.name %>.less'],
                dest: '<%= paths.build %>/less/<%= pkg.name %>.less'
            },
            variables: {
                src: ['<%= paths.build %>/less/<%= pkg.name %>.variables.less'],
                dest: '<%= paths.build %>/less/<%= pkg.name %>.variables.less'
            }
        },

        uglify : {
            build : {
                src : ['<%= paths.build %>/js/<%= pkg.name %>.js'],
                dest : '<%= paths.build %>/js/<%= pkg.name %>.min.js'
            }
        },

        imagemin : {
            build : {
                options: {
                    optimizationLevel: 3
                },
                files : [{
                    expand : true,
                    cwd : '<%= paths.build %>/img/',
                    src : ['**/*.*'],
                    dest : '<%= paths.temp %>/img/'
                }]
            }
        },

        copy: {
            styles : {
                src : ['<%= paths.src %>/less/extra/variables.less'],
                dest : '<%= paths.build %>/less/<%= pkg.name %>.variables.less'
            },
            scripts : {
                src : ['<%= paths.src %>/js/extra/variables.js'],
                dest : '<%= paths.build %>/js/<%= pkg.name %>.variables.js'
            },
            images : {
                files : [{
                    expand : true,
                    cwd : '<%= paths.src %>/img/',
                    src : ['**/*.*'],
                    dest : '<%= paths.build %>/img/'
                }]
            },
            image_optimize : {
                files : [{
                    expand : true,
                    cwd : '<%= paths.temp %>/img/',
                    src : ['**/*.*'],
                    dest : '<%= paths.build %>/img/'
                }]
            },
            fonts : {
                files: [{
                    expand : true,
                    cwd : '<%= paths.src %>/fonts/',
                    src : ['**/*.*', '!**/*.json'],
                    dest : '<%= paths.build %>/fonts/'
                }]
            },
            libs : {
                files : [{
                    expand : true,
                    cwd : '<%= components.chartjs.dist %>',
                    src : ['**/*.*'],
                    dest : '<%= paths.build %>/libs/chartjs/'
                }]
            }
        },

        watch : {
            scripts : {
                files : [
                    '<%= paths.src %>/js/**/*.js'
                ],
                tasks : ['scripts']
            },
            styles : {
                files : [
                    '<%= paths.src %>/less/**/*.less'
                ],
                tasks : ['styles']
            },
            images : {
                files : [
                    '<%= paths.src %>/img/**/*.*'
                ],
                tasks : ['images']
            },
            fonts : {
                files : [
                    '<%= paths.src %>/fonts/**/*.*',
                    '!<%= paths.src %>/fonts/**/*.json'
                ],
                tasks : ['fonts']
            }
        }
    });
    // Custom Tasks
    grunt.registerTask('default', ['clean', 'pre', 'scripts', 'styles', 'images', 'fonts', 'libs']);
    grunt.registerTask('optimize', ['clean:temp', 'default', 'uglify', 'imagemin', 'copy:image_optimize', 'clean:temp']);

    grunt.registerTask('scripts', ['concat:scripts', 'replace:scripts', 'copy:scripts']);
    grunt.registerTask('styles', ['variables', 'concat:styles', 'replace:styles', 'copy:styles']);
    grunt.registerTask('images', ['svgcss:build', 'copy:images']);
    grunt.registerTask('fonts', ['copy:fonts']);
    grunt.registerTask('libs', ['copy:libs']);
    grunt.registerTask('variables', ['concat:variables', 'replace:variables', 'lessvars']);
    grunt.registerTask('pre', ['svgcss:build', 'variables']);
};