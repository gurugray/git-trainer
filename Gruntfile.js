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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs-checker');
    grunt.loadNpmTasks('grunt-bower-task');

    grunt.registerTask('lint', ['jshint', 'jscs']);

    grunt.registerTask('default', ['bower']);

};
