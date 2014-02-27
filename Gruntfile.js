module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['src/*.js', 'Gruntfile.js'],

            options: {
                jshintrc: '.jshintrc'
            }
        },

        jscs: {
            src: ['src/*.js', 'Gruntfile.js']
        },

        bower: {
            install: {
                options: {
                    targetDir: './libs',
                    cleanBowerDir: true,
                    layout: function() {
                        // by default it creates folder with component name
                        // and folder 'js' in component folder
                        // we just change this behaviour
                        return '';
                    }
                }
            }
        },

        borschik: {
            js: {
                src: ['src/index.js'],
                dest: ['dist/index.js'],
                tech: 'js',
                options: {
                    minimize: grunt.option('target') !== 'dev'
                }
            }
        },

        csso: {
            dist: {
                files: {
                    'dist/index.css': ['src/index.css']
                }
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },

                files: {
                    'index.html': 'src/index.html'
                }
            }
        },

        watch: {
            scripts: {
                files: ['src/*.js', 'src/*.css'],
                tasks: ['lint', 'build'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs-checker');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-borschik');
    grunt.loadNpmTasks('grunt-csso');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('lint', ['jshint', 'jscs']);
    grunt.registerTask('build', ['csso', 'borschik', 'htmlmin']);

    grunt.registerTask('default', ['bower', 'build']);
    grunt.registerTask('start', ['build', 'watch']);
};
