module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: 'src/*.js',
            options: {
                jshintrc: '.jshintrc'
            }
        },
        jscs: {
            src: 'src/*.js'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs-checker');

    grunt.registerTask('lint', ['jshint', 'jscs']);

    grunt.registerTask('default', []);

};