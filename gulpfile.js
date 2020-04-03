// *************************************
//
//   Gulpfile
//
// *************************************
//
// Available tasks:
//   `gulp`
//   `gulp dev`
//   `gulp watch`
//   `gulp format`
//
// -------------------------------------
//   Modules
// -------------------------------------
//
// gulp                  : The streaming build system
// gulp-sass             : Compile Sass
// gulp-autoprefixer     : Prefix CSS
// gulp-csso             : Optimize CSS (clean, compress, restructure)
// gulp-rename           : Rename files
// gulp-watch-sass       : Watches for SASS modifications - with streaming
// gulp-file-include     : Include files in other files
// gulp-bro              : Javascript bundler with Browserify and incremental builds
// gulp-imagemin         : Minify PNG, JPEG, GIF and SVG images
// gulp-inline-imagesize : Inline the size of images into into html comments
// gulp-prettier         : Format javascript
// gulp-html-beautify    : Format HTML
// merge-stream          : Merge multiple gulp stream sources
// browser-sync          : Sync browser refresh & CSS repalcement with file system changes
// critical              : Inline render path critical css and async load the other css
// tinyify               : Javascript optimizer (minify, remove dead code, tree shake, collapse...)
// babelify              : Convert ES6/ESNext code to ES5
//
// -------------------------------------

const gulp = require('gulp')
const del = require('del');
const merge = require('gulp-merge');
const concat = require('gulp-concat');
const BABEL_POLYFILL = './node_modules/@babel/polyfill/browser.js';

const plugins = require('gulp-load-plugins')({
  lazy: true,
  overridePattern: false,
  pattern: '{critical,tinyify,babelify,browser-sync,merge-stream}'
})

const settings = {
  css: {
    source: [
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
      'node_modules/datatables.net-bs4/css/dataTables.bootstrap4.min.css',
      'node_modules/mdbootstrap/css/mdb.min.css',
      './src/scss/**/*.{scss, sass, css}'
    ],
    dest: './dist/css'
  },
  html: {
    watch: './src/**/*.html',
    source: './src/*.html',
    dest: './dist',
    formatting: {
      indent: 4,
      indent_char: ' ',
      wrap_line_length: 78,
      brace_style: 'expand',
      unformatted: ['sub', 'sup', 'b', 'i', 'u', 'span', 'quote', 'strong']
    }
  },
  js: {
    source: [
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.min.js.map',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/jquery/dist/jquery.min.map',
      'node_modules/popper.js/dist/umd/popper.min.js',
      'node_modules/popper.js/dist/umd/popper.min.js.map',
      'node_modules/mdbootstrap/js/mdb.min.js',
      'node_modules/mdbootstrap/js/mdb.min.js.map',
      'src/js/jquery.dataTables.min.js'
    ],
    entry: './src/js/main.js',
    dest: './dist/js'
  }
}



////////////////////////// TASKS  DEFINITION 

//--------------------------------------
//    Task: CopyData
//--------------------------------------
gulp.task('copyData', () => gulp.src('./src/assets/**/*.*').pipe(gulp.dest('./dist')));

//--------------------------------------
//    Task: Clean
//--------------------------------------

function clean() {
  return del(['dist/**', '!dist']);
}
gulp.task('clean', clean);

// -------------------------------------
//   Task: CSS
// -------------------------------------

gulp.task('css', () => {
  return gulp
    .src(settings.css.source)
    .pipe(gulp.dest(settings.css.dest)) // Pipe unminified
})



gulp.task('css:watch', () => {
  return plugins
    .watchSass(settings.css.source, {
      includePaths: ['node_modules'],
      verbose: true
    })
    .pipe(
      plugins
        .sass({
          includePaths: ['node_modules']
        })
        .on('error', plugins.sass.logError)
    )
    .pipe(plugins.autoprefixer())
    .pipe(gulp.dest(settings.css.dest))
    .pipe(plugins.browserSync.reload({ stream: true }))
})

gulp.task('critical', () =>
  gulp
    .src('dist/*.html')
    .pipe(
      plugins.critical.stream({
        base: 'dist/',
        inline: true,
        css: ['dist/css/styles.css']
      })
    )
    .on('error', err => {
      console.error(err.message)
    })
    .pipe(gulp.dest('dist'))
)

// -------------------------------------
//   Task: HTML
// -------------------------------------

gulp.task('html', () => {
  // sources to inject script/link tags for
  const source = gulp.src([`${settings.css.dest}/*.min.css`, `${settings.js.dest}/*.min.js`])

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
    .pipe(gulp.dest(settings.html.dest))
})



gulp.task('html:format', () => {
  return gulp
    .src(settings.html.source)
    .pipe(plugins.htmlBeautify(settings.html.formatting))
    .pipe(gulp.dest('src'))
})

gulp.task('html:watch', () => gulp.watch(settings.html.watch, gulp.series('html')))

// -------------------------------------
//   Task: JS
// -------------------------------------

gulp.task('js', () =>

  gulp
    .src([BABEL_POLYFILL, settings.js.entry])
    .pipe(concat('main.js'))
    .pipe(
      plugins.bro({
        plugin: [plugins.tinyify],
        transform: [plugins.babelify.configure({ presets: ['@babel/preset-env'] })]
      })
    )
    .pipe(plugins.rename({ extname: '.min.js' }))
    .pipe(gulp.dest(settings.js.dest))
)

gulp.task('jslibs', () =>
  gulp
    .src(settings.js.source)
    .pipe(gulp.dest(settings.js.dest))
)




gulp.task('js:format', () => {
  return gulp
    .src('src/**/*.js')
    .pipe(plugins.prettier({ singleQuote: true }))
    .pipe(gulp.dest('src'))
})

gulp.task('js:watch', () => gulp.watch(settings.js.source, gulp.series('js')))

// -------------------------------------
//   Task: Move
// -------------------------------------

gulp.task('move', () => {
  const nonProcessed = gulp.src(['src/*/*', '!src/{js,scss,img,inc}/**/*']).pipe(gulp.dest('dist'))

  const vendor = gulp.src('src/**/vendor/**/*').pipe(gulp.dest('dist'))

  return plugins.mergeStream(nonProcessed, vendor)
})

gulp.task('move:watch', () =>
  gulp.watch(['src/*/*', '!src/{js,css,scss,img,inc}/**/*'], gulp.series('move'))
)

// -------------------------------------
//   Task: Images
// -------------------------------------

gulp.task('images', () =>
  gulp
    .src('src/img/**/*')
    .pipe(gulp.dest('dist/img'))
)


gulp.task('images:watch', () =>
  gulp.watch('src/img/**/*').on('change', path => {
    gulp
      .src(path)
      .pipe(
        plugins.imagemin([
          plugins.imagemin.optipng({ optimizationLevel: 3 }),
          plugins.imagemin.svgo({
            plugins: [{ removeViewBox: false }]
          })
        ])
      )
      .pipe(gulp.dest('dist/img'))
  })
)

// -------------------------------------
//   Task: browser-sync
// -------------------------------------

gulp.task('browser-sync', () => {
  plugins.browserSync.init({ server: { baseDir: 'dist', directory: true } })
  gulp.watch('dist/**/*').on('change', plugins.browserSync.reload)
})

// -------------------------------------
//   Task: Default
// -------------------------------------
// This talk involves compiling the html, css and javascript,
// moving fonts and other static assets and then optimizing images

gulp.task('default', gulp.series('clean', gulp.parallel('css', 'jslibs', 'js', 'move', 'copyData'), 'html', 'images', 'critical'))
// gulp.task('default', ['css', 'html', 'js', 'move', 'images']);


// -------------------------------------
//   Task: Watch
// -------------------------------------

gulp.task(
  'watch',
  gulp.series(
    'default',
    gulp.parallel(
      'css:watch',
      'html:watch',
      'js:watch',
      'move:watch',
      'images:watch',
      'browser-sync'
    )
  )
)

// -------------------------------------
//   Task: Format
// -------------------------------------

gulp.task('format', gulp.parallel('js:format', 'html:format'))


