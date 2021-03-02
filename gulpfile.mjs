import {gulpNcc} from '@donmahallem/gulp-ncc'
import child from 'child_process'
import gulp from 'gulp'
import clean from 'gulp-dest-clean'
import eslint from 'gulp-eslint'
import rename from 'gulp-rename'
import ts from 'gulp-typescript'
import jest from 'jest-cli'

const {dest, series, src, task} = gulp


task('lint:eslint', () => {
    return src('src/**')
        .pipe(eslint({
            fix: true,
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
})

task('lint', series('lint:eslint'))


task('test:jest', (done) => {
    child.fork(
        'node_modules/jest-cli/bin/jest.js', [
            '--passWithNoTests',
        ]
    ).on('close', code => done(code ? 'Tests execution failed' : undefined))
})

task('test', series('test:jest'))


task('compile:typescript', () => {
    const tsProject = newTypeScriptProject('tsconfig.json')
    tsProject.options.types.remove('jest')
    tsProject.config.exclude.pushUnique('**/*.spec.*')
    return src(tsProject.srcPaths)
        .pipe(tsProject())
        .pipe(clean('build'))
        .pipe(dest('build'))
})

task('compile', series('compile:typescript'))


task('build', series('lint', 'test', 'compile'))


task('dist', series('build', () => {
    return src('build/main.js')
        .pipe(gulpNcc({
            debugLog: true,
        }))
        .pipe(rename(path => path.basename = 'index'))
        .pipe(clean('dist'))
        .pipe(dest('dist'))
}))


task('default', series('dist'))

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * @param {string} tsConfigFileName
 * @param {ts.Settings=} settings
 * @returns {ts.Project}
 */
function newTypeScriptProject(tsConfigFileName, settings) {
    const project = ts.createProject(tsConfigFileName, settings)

    const compilerOptions = project.options
    compilerOptions.types = compilerOptions.types || []

    const config = project.config
    config.files = config.files || []
    config.include = config.include || []
    config.exclude = config.exclude || []
    config.compilerOptions = config.compilerOptions || []

    Object.defineProperty(project, 'srcPaths', {
        get: function () {
            const include = project.config.include || []
            const exclude = project.config.exclude || []
            return include.concat(
                exclude.map(path => `!${path}`)
            )
        }
    })

    return project
}

Array.prototype.remove = function (itemOrPredicate) {
    while (true) {
        const index = typeof itemOrPredicate === 'function'
            ? this.findIndex(itemOrPredicate)
            : this.indexOf(itemOrPredicate)
        if (index >= 0) {
            this.splice(index, 1)
        } else {
            break
        }
    }
}

Array.prototype.pushUnique = function (item) {
    const index = this.indexOf(item)
    if (index < 0) {
        this.push(item)
    }
}
