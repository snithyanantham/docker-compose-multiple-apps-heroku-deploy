const core = require('@actions/core');
const { promisify } = require('util');

const exec = promisify(require('child_process').exec);

async function loginToHeroku() {
    const login = core.getInput('email');
    const password = core.getInput('api_key');

    try {
        await exec(`cat >~/.netrc <<EOF
        machine api.heroku.com
            login ${login}
            password ${password}
        EOF`);
        console.log('.netrc file create ✅');

        await exec(`echo ${password} | docker login --username=${login} registry.heroku.com --password-stdin`);
        console.log('Logged in succefully ✅');
    } catch (error) {
        core.setFailed(`Authentication process faild. Error: ${error.message}`);
    }
}

async function getImageAppNameList(heroku_apps) {
    try {
        return JSON.parse(heroku_apps);
    } catch (error) {
        core.setFailed(`Invalid input for heroku app. Error: ${error.message}`);
    }
}

async function buildDockerCompose() {
    const dockerComposeFilePath = core.getInput('docker_compose_file');

    try {
        await exec(`docker-compose -f ${dockerComposeFilePath} build`);
    } catch (error) {
        core.setFailed(`Somthing went wrong building your image. Error: ${error.message}`);
    }
}

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

async function pushAndDeployAllImages() {

    const imageListString = core.getInput('heroku_apps');

    try {
        var imageList = getImageAppNameList(imageListString);

        if(imageList.length > 0)
        {
        await asyncForEach(imageList, async (item) => {

            await exec(`docker tag ${item.imagename} registry.heroku.com/${item.appname}/${item.apptype}`);
            console.log('Container tagged for image - ' + item.imagename);
            await exec(`docker push registry.heroku.com/${item.appname}/web`);
            console.log('Container pushed for image - ' + item.imagename);
            await exec(`heroku container:release ${item.apptype} --app ${item.appname}`);
            console.log('Container deployed for image - ' + item.imagename);

          });

        console.log('Image built ✅');
        console.log('App Deployed successfully ✅');
    }else{
        core.setFailed(`No image given to process.`);
    }

    } catch (error) {
        core.setFailed(`Somthing went wrong building your image. Error: ${error.message}`);
    }
}

try {
    loginToHeroku();
    buildDockerCompose();
    pushAndDeployAllImages();
} catch (error) {
    console.log({ message: error.message });
    core.setFailed(error.message);
}
