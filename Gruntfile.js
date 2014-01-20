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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs-checker');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-borschik');

    grunt.registerTask('lint', ['jshint', 'jscs']);
    grunt.registerTask('build', ['borschik']);

    grunt.registerTask('default', ['bower', 'build']);

};
