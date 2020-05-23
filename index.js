const core = require('@actions/core');
const app = require('./app');

async function run() {
    try {
        const login = core.getInput('email');
        const password = core.getInput('api_key');
        const imageListString = core.getInput('heroku_apps');
        const dockerComposeFilePath = core.getInput('docker_compose_file');

        await app.buildAndDeploy(login, password, dockerComposeFilePath, imageListString);
    }
    catch (error) {
        console.log({ message: error.message });
        core.setFailed(error.message);
    }
}

run()