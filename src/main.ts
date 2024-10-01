import * as core from '@actions/core'
import { newOctokitInstance } from './internal/octokit'

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const githubToken = core.getInput('githubToken', { required: true })
const _dryRun = core.getInput('dryRun', { required: true }).toLowerCase() === 'true'

const octokit = newOctokitInstance(githubToken)

async function run(): Promise<void> {
    try {
        // action logic:
        const repositoryInfo = await octokit.repos.get()
        core.info(JSON.stringify(repositoryInfo, null, 2))

    } catch (error) {
        core.setFailed(error instanceof Error ? error : `${error}`)
        throw error
    }
}

//noinspection JSIgnoredPromiseFromCall
run()
