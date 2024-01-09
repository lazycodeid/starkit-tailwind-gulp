const gulp  = require('gulp');
const browserSync = require("browser-sync").create();

const fileinclude = require('gulp-file-include');
const cache = require('gulp-cache');
const sass = require('gulp-sass')(require('node-sass'));
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const clean = require('gulp-clean');
const webpack = require('webpack-stream');

const tailwindcss = require('tailwindcss'); 
const autoprefixer = require('autoprefixer');

function previewReload(done){
    browserSync.reload();
    cache.clearAll(done);
    done();
}

gulp.task("livepreview", (done) => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        port: 8080,
        https: false,
        notify: false,
        open: false,
    });
    done();
});

// src/views --> dist
gulp.task('dev-html', () => {
    return gulp.src('./src/views/*.html')
           .pipe(fileinclude({prefix: '@@'}))
           .pipe(gulp.dest("./dist"));
});

// src/css --> dist/assets/css
gulp.task('dev-styles', ()=> {
    return gulp.src('./src/css/**/*.{scss,css,sass}')
        .pipe(sass().on('error', sass.logError))        
        .pipe(postcss([
            tailwindcss('./tailwind.config.js'),
            autoprefixer(),
        ]))
        .pipe(concat({ path: 'app.css'}))
        .pipe(gulp.dest('./dist/assets/css'));
});

// src/js --> dist/assets/js
gulp.task('dev-script', ()=> {
    return gulp.src('./src/js/**/*.js')
        .pipe(webpack({
            mode: 'development',
            output: {
                filename: 'app.js'
            },
            watch: false,
            devtool: "source-map",
        }))
        .pipe(concat({ path: 'app.js'}))
        .pipe(gulp.dest('./dist/assets/js'));
});

gulp.task('dev-other', ()=> {
    return gulp.src('./src/other/**/*')
        .pipe(gulp.dest('./dist/'));
});

gulp.task("dev-img", () => {
    return gulp.src("./src/img/**/*")
        .pipe(gulp.dest("./dist/assets/img"));
})

gulp.task('clean:dist', ()=> {
    return gulp.src('./dist',  { read: false, allowEmpty: true })
        .pipe(clean({ force: true }));
});

gulp.task("dev", gulp.series('clean:dist', 'dev-html', 'dev-styles', 'dev-script', 'dev-img', 'dev-other'));

gulp.task('watch-changes', (done) => {
    
    gulp.watch("./src/**/*", gulp.series('dev', previewReload));

    gulp.watch("./tailwind.config.js", gulp.series('dev', previewReload));

    done();
});

exports.default = gulp.series(
    'dev',
    'watch-changes',
    'livepreview', 
);