module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        /**
        * Read package.json
        */
        pkg: grunt.file.readJSON('package.json'),

        dir: {
            js: './server/js',
            jspublic: './public/js',
            css: './public/css',
            sass: './dev/sass',
            img: './static/images',
            views: './server/views',
            testsclient: './tests/client'
        },

        /**
         * Compile SASS
         */
        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    noCache: true,
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.sass %>',
                    src: ['**/*.scss', '**/!_*.scss'],
                    dest: '<%= dir.css %>',
                    ext: '.css'
                }]                
            },
            build: {
                options: {
                    style: 'compressed',
                    noCache: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.sass %>',
                    src: ['**/*.scss', '**/!_*.scss'],
                    dest: '<%= dir.css %>',
                    ext: '.min.css'
                }]   
            }
        },

        shell: {
            compilejs: {
                command: 'jspm bundle js/app public/js/bundle.js -m --inject --no-mangle'
            }
        },

        autoprefixer: {
            build: {
                options: {
                    browsers: ['last 2 versions', 'ie 9', 'ie 10']
                },
                expand: true,
                flatten: true,
                src: '<%= dir.css %>/*.css',
                dest: '<%= dir.css %>/'
            }
            // TODO: For build
        },

        /**
        * JSHint
        * @github.com/gruntjs/grunt-contrib-jshint
        */
        jshint: {
            all: [
                '<%= dir.js %>/server/*.js',
                'Grunfile.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Server side unit tests
        mochacli: {
            options: {
                ui: "tdd",
                reporter: "spec",
                timeout: "15000"
            },

            unit: {
                src: ["tests/unit/**/*.js"]
            }
        },

        // Client tests with requirejs
        mocha_phantomjs: {
            all: ['tests/client/**/*.html']
        },

        // The watch command watches a given set of files and runs a task when one of them changes.
        watch: {
            //Automatic compilation of SASS changes
            sass: {
                files: ['<%= dir.sass %>/**/*.scss'],
                tasks: ['sass:dev', 'notify:sass']
            },

            // js: {
            //     files: ['<%= dir.jspublic %>/**/*.js', '!<%= dir.jspublic %>/build.js', '!<%= dir.jspublic %>/build.js.map'],
            //     tasks: ['shell:compilejs', 'notify:js']
            // },

            // Add vendor prefixes
            prefix: {
                files: ['<%= dir.sass %>/**/*.scss'],
                tasks: ['autoprefixer:build', 'notify:prefix'],
                options: {
                    livereload: true
                }
            },

            server: {
                files: ['.rebooted'],
                options: {
                    livereload: true
                }
            }
        },

        /**
        * Nodemon
        * @github.com/ChrisWren/grunt-nodemon
        */
        nodemon: {
            dev: {
                script: 'server/savelioapp.js',
                options: {
                    "execMap": {
                        "js": "NODE_ENV=dev babel-node"
                    },
                    nodeArgs: ['--debug'],
                    ignore: ['<%= dir.jspublic %>'],
                    env: {
                        PORT: '1992'
                    },
                    // omit this property if you aren't serving HTML files and
                    // don't want to open a browser tab on start
                    callback: function (nodemon) {
                        nodemon.on('log', function (event) {
                            console.log(event.colour);
                        });

                        // refreshes browser when server reboots
                        nodemon.on('restart', function () {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1000);
                        });

                        /*setTimeout(function() {
                            require('grunt-open')('http://localhost:1955');
                        }, 1000);*/
                    }
                }
            }
        },

        open: {
            dev: {
              path: 'http://localhost:1992',
              app: 'Google Chrome'
            }
        },

        // In order to run the Karma watcher and the SASS watchers concurrently, we need to run this task
        concurrent: {
            dev: {
                tasks: ['watch', 'nodemon'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        uglify: {
            js: {
                files: {
                    'public/js/bundle.js': ['public/js/bundle.js']
                }
            }
        },

        notify: {
            dev: {
                options: {
                    message: "Dev changes complete."
                }
            },

            sass: {
                options: {
                    message: "SASS compiled."
                }
            },

            prefix: {
                options: {
                    message: "Autoprefixer finished."
                }
            },

            js: {
                options: {
                    message: "JSPM bundle finished."
                }
            },

            serverbuild: {
                options: {
                    message: "Server build finished."
                }
            }
        },

        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: [{
                    "expand": true,
                    "cwd": "server/",
                    "src": ["**/*.js"],
                    "dest": "build-server/",
                    "ext": ".js"
                }]
            }
        }
    });

    grunt.registerTask('compile:dev', [
        'sass:dev',
        //'shell:compilejs',
        'autoprefixer:build' 
    ]);

    grunt.registerTask('test-server', 'Run unit tests - mocha', [
        'mochacli:unit'
    ]);

    grunt.registerTask('dev', [
        'compile:dev',
        'concurrent:dev',
        'notify:dev'
    ]);

    grunt.registerTask('compile:sass', [
        'sass:build',
        'autoprefixer:build',
        'notify:sass'
    ]);

    grunt.registerTask('build', [
        'babel',
        'shell:compilejs',
        'sass:build',
        'autoprefixer:build',
        'notify:serverbuild'
    ]);
};