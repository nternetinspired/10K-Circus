'use strict';

/*!
 * Inspired Gruntfile
 * Copyright 2016 Seth Warburton
 * Version 0.05
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */

module.exports = function(grunt) {

// Time how long tasks take. A big help when optimizing build times ;)
require('time-grunt')(grunt);

  // Configurable paths
  var config = {
    app: '_src/', // The source directory
    dist: '' // The output directory
  };

  //Initializing the configuration object
  grunt.initConfig({

    // Project settings
    config: config,

    browserSync: {
      files: [
        '<%= config.dist %>_site/css/main.css' // Watch Jekyll's output location
      ],
      options: {
        watchTask: true,
        server: {
          baseDir: '_site'
        }
      }
    },

    // Empties destination and temp folders to start fresh
    clean: {
      build: {
        src: [
          'css/**',
          'img/**',
          'js/**',
          '_site/**',
          '.jekyll-metadata'
        ],
        expand: true,
        options: {
          force: true
        },
      },
    },

    // Combine and copy JS, without minification, for development. Because
    // JS uglify is very slow in comparison we only uglify on build.
    concat: {
        options: {
        stripBanners: false
      },
      dev: {
        files: {
          '<%= config.dist %>js/plugins.js': [
            '<%= config.app %>js/plugins/*.js',
            'node_modules/wow.js/dist/wow.js'
          ],
          '<%= config.dist %>js/main.js': ['<%= config.app %>js/main.js'],
        },
      },
    },

    // Process images to optimise file sizes for production
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>img',
          src: '{,*/}*.{gif,jpeg,jpg,png,svg}',
          dest: '<%= config.dist %>img'
        }]
      }
    },

    // Run a Jekyll site build.
    jekyll: {
      build: {
        dest: '_site'
      },
      options: {
        incremental: false,
      },
    },

    postcss: {
      options: {
        processors: [
          require('autoprefixer')({
            browsers: 'last 1 version' // add vendor prefixes
          }),
          require('cssnano')() // optimise and the minify the result
        ],

        },
      dist: {
        files: {
          '<%= config.dist %>_includes/main.css': '<%= config.app %>css/main.css'
        }
      }
    },

    // Compile Sass source files to CSS
    sass: {
      dev: {
        options: {
          precision: '3'
        },
        files: {
          '<%= config.app %>css/main.css': '<%= config.app %>scss/main.scss'
        }
      },
      dist: {
        options: {
          precision: '3'
        },
        files: {
          '<%= config.dist %>css/main.css': '<%= config.app %>scss/main.scss'
        }
      }
    },

    // Optimise SVGs
    svgmin: {
      options: {
        plugins: [
          {
            removeViewBox: true
          }, {
            removeUselessStrokeAndFill: true
          }, {
            removeAttrs: {
              attrs: ['xmlns']
            }
          }
        ]
      },
      dist: {
        files: {
          '_includes/clown.svg': 'img/clown.svg',
          '_includes/lady.svg': 'img/lady.svg',
          '_includes/strongman.svg': 'img/strongman.svg'
        }
      }
    },

    // Compress JS files for production
    uglify: {
      dist: {
        files: {
          '<%= config.dist %>_includes/plugins.js': [
            '<%= config.app %>js/plugins/*.js',
            'node_modules/wow.js/dist/wow.js'
          ],
          '<%= config.dist %>_includes/main.js': '<%= config.app %>js/main.js'
        }
      }
    },

    // Watch files for changes and run tasks based on the changed files
    watch: {
      sass: {
        files: [
          '<%= config.app %>scss/*{,*/}*.*',
          '<%= config.app %>scss/**/**/*.scss'
        ],
        tasks: [
          'styles'
        ]
      },
      jekyll: {
        files: [
          '_acts/*.{html,md}',
          '_data/*.yml',
          '_includes/*.html',
          '_layouts/*.html',
          '_pages/*.{html,md}',
          '<%= config.app %>scss/*{,*/}/*.scss'
        ],
        tasks: ['jekyll']
      },
      js: {
        files: ['<%= config.app %>js/**/*.js', '<%= config.app %>js/*.js'],
        tasks: ['concat:dev']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    }
  });

  // Just-in-time plugin, for loading plugins really quickly.
  require('jit-grunt')(grunt, {
    scsslint: 'grunt-scss-lint'
  });

  // Task registration
  grunt.registerTask('default', ['dev']);
  grunt.registerTask('build', ['dist']);
  grunt.registerTask('styles', []);
  grunt.registerTask('images', []);

  // Primary Task definition
  grunt.registerTask('dev', ['clean','images','sass:dev','postcss','concat:dev','jekyll','browserSync','watch']);
  grunt.registerTask('dist', ['clean','images','sass:dist','postcss','uglify','jekyll']);

  // Sub-tasks, called by primary tasks, for better organisation.
  grunt.registerTask('images', ['imagemin','svgmin']);
  grunt.registerTask('styles', ['sass','postcss']);
};
