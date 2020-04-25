// Import dependencies via require
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var del = require('del');
var uglify = require('gulp-uglify');


var plugins = require('gulp-load-plugins')({
    lazy: true,
    overridePattern: false,
    pattern: '{critical,tinyify,babelify,browser-sync,merge-stream}'
})



/**
 * ###############################################################
 * Project setting, directories and include files are defined here
 */
var settings = {
    distdir: './dist',
    css: {
        source: [
            'node_modules/bootstrap/dist/css/bootstrap.min.css',
            'node_modules/datatables.net-bs4/css/dataTables.bootstrap4.min.css',
            './src/scss/**/*.{scss,sass,css}'
        ],
        dest: ''
    },
    html: {
        watch: './src/**/*.html',
        source: './src/*.html',
        dest: '',
        formatting: {
            indent: 4,
            indent_char: ' ',
            wrap_line_length: 78,
            brace_style: 'expand',
            unformatted: ['sub', 'sup', 'b', 'i', 'u', 'span', 'quote', 'strong']
        }
    },
    assets: {
        source: './src/assets/**/*.*',
        dest: ''
    },
    js: {
        vendor: 'dist/libs/',
        libs: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/popper.js/dist/umd/popper.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'src/js/jquery.dataTables.min.js'
        ],
        libdest: [],
        monitor: ['src/**/*.ts'],
        entry: './src/js/main.ts',
        output: 'bundle-'+((new Date()).getTime())+'.min.js',
        dest: ''
    }
}
//initialize settings
settings.css.dest = settings.distdir + '/css';
settings.js.dest = settings.distdir + '/js';
settings.html.dest = settings.distdir + '/html';
settings.assets.dest = settings.distdir + '/';
// add libaries to the dist list with the porder given in settings.js.libs
for (let i = 0; i < settings.js.libs.length; i++) {
    var lib = settings.js.libs[i];
    var res = lib.split("/");
    settings.js.libdest[i] = settings.js.vendor + res[res.length - 1];
};
console.log(settings.js.libdest);

// ############### TASKS DEFINITION 

//--------------------------------------
//    Task: CopyData
//--------------------------------------
gulp.task('copyData', () => gulp.src(settings.assets.source).pipe(gulp.dest(settings.distdir)));

gulp.task('data:watch', () => {
    gulp.watch(settings.assets.source, gulp.series('copyData'));
});

//--------------------------------------
//    Task: Clean
//--------------------------------------

function clean() {
    return del([settings.distdir + '/**', '!' + settings.distdir]);
}
gulp.task('clean', clean);

// -------------------------------------
//   Task: Move
// -------------------------------------

gulp.task('move', () => {
    const nonProcessed = gulp.src(['src/*/*', '!src/{js,scss,img,inc,assets}/**/*']).pipe(gulp.dest(settings.distdir))

    const vendor = gulp.src('src/**/vendor/**/*').pipe(gulp.dest(settings.distdir))

    return plugins.mergeStream(nonProcessed, vendor)
})
// -------------------------------------
//   Task: CSS (css and css:watch)
// -------------------------------------

gulp.task('css', () => {
    return gulp
        .src(settings.css.source).pipe(
            plugins
                .sass({
                    includePaths: ['node_modules']
                })
                .on('error', plugins.sass.logError)
        ).pipe(gulp.dest(settings.css.dest)) // Pipe unminified
})


gulp.task('css:watch', () => {
    gulp.watch(settings.css.source, gulp.series('css'));
});

// -------------------------------------
//   Task: HTML (html,html:format,html:watch)
// -------------------------------------

gulp.task('html', () => {
    // sources to inject script/link tags for
    const source = gulp.src([`${settings.css.dest}/*.css`, `${settings.js.dest}/*.js`].concat(settings.js.libdest))

    return gulp
        .src(settings.html.source)
        .pipe(
            plugins.fileInclude({
                prefix: '@@',
                basepath: 'src'
            })
        )
        .pipe(plugins.inlineImagesize())
        .pipe(plugins.htmlBeautify(settings.html.formatting))
        .pipe(
            plugins.inject(source, {
                addRootSlash: true,
                ignorePath: 'dist',
                removeTags: true
            })
        )
        .pipe(gulp.dest(settings.distdir))
})

gulp.task('html:format', () => {
    return gulp
        .src(settings.html.source)
        .pipe(plugins.htmlBeautify(settings.html.formatting))
        .pipe(gulp.dest('src'))
})

gulp.task('html:watch', () => gulp.watch(settings.html.watch, gulp.series('move', 'html')))

//--------------------------------------
//    Task: js
//-------------------------------------

function js() {
    return browserify({
        basedir: '.',
        debug: true,
        entries: [settings.js.entry],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .transform('babelify', {
            extensions: ['.ts']
        })
        .bundle()
        .pipe(source(settings.js.output))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .on('error', standardHandler)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(settings.js.dest));
};
gulp.task('js', js);
gulp.task('js:watch', () => gulp.watch(settings.js.monitor, gulp.series('js')));
gulp.task('jslibs', () =>
    gulp
        .src(settings.js.libs)
        .pipe(gulp.dest(settings.js.vendor))
);

// Standard handler
function standardHandler(err) {
    // Log to console
    console.log(util.colors.red('Error'), err.message);
    this.emit('end');
}

// -------------------------------------
//   Task: Images
// -------------------------------------

gulp.task('images', () =>
    gulp
        .src('src/img/**/*')
        .pipe(gulp.dest('dist/img'))
)


gulp.task('images:watch', () =>
    gulp.watch('src/img/**/*', gulp.series('images'))
);


//--------------------------------------
//    Task: BUILD ...default
//--------------------------------------
function build() {
    return gulp.series('clean', gulp.parallel('copyData', 'jslibs', 'js', 'move', 'css'), 'html', 'images');
}
gulp.task('default', build());

// -------------------------------------
//   Task: browser-sync
// -------------------------------------

gulp.task('browser-sync', () => {
    plugins.browserSync.init({ server: { baseDir: settings.distdir, directory: true } })
    gulp.watch(settings.distdir + '/**/*').on('change', plugins.browserSync.reload)
});

// -------------------------------------
//   Task: Watch
// -------------------------------------

gulp.task(
    'watch',
    gulp.series(
        'default',
        gulp.parallel(
            'data:watch',
            'css:watch',
            'html:watch',
            'js:watch',
            'images:watch',
            'browser-sync'
        )
    )
)

