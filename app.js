const core = require('@actions/core');
const { promisify } = require('util');

const exec = promisify(require('child_process').exec);

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

let loginToHeroku = async function loginToHeroku(login, password) {
    try {

        await exec(`cat >~/.netrc <<EOF
        machine api.heroku.com
            login ${login}
            password ${password}
        EOF`);

        console.log('.netrc file create ✅');

        await exec(`echo ${password} | docker login --username=${login} registry.heroku.com --password-stdin`);

        console.log('Logged in succefully ✅');
    }
    catch (error) {
        core.setFailed(`Authentication process faild. Error: ${error.message}`);
    }
}

let getImageAppNameList = async function getImageAppNameList(heroku_apps) {
    try {
        return JSON.parse(heroku_apps);
    }
    catch (error) {
        core.setFailed(`Invalid input for heroku app. Error: ${error.message}`);
    }
}

let buildDockerCompose = async function buildDockerCompose(dockerComposeFilePath) {
    try {
        console.log('docker image build started.');
        await exec(`docker-compose -f ${dockerComposeFilePath} build`);
        console.log('docker image build finished.');
    }
    catch (error) {
        core.setFailed(`Somthing went wrong building your image. Error: ${error.message}`);
    }
}

let pushAndDeployAllImages = async function pushAndDeployAllImages(imageList) {
    try {
        if (imageList.length > 0) {
            await asyncForEach(imageList, async (item) => {
                console.log('Processing image -' + item.imagename);
                await exec(`docker tag ${item.imagename} registry.heroku.com/${item.appname}/${item.apptype}`);
                console.log('Container tagged for image - ' + item.imagename);
                await exec(`docker push registry.heroku.com/${item.appname}/web`);
                console.log('Container pushed for image - ' + item.imagename);
                await exec(`heroku container:release ${item.apptype} --app ${item.appname}`);
                console.log('Container deployed for image - ' + item.imagename);
            });
            console.log('App Deployed successfully ✅');
        } else {
            core.setFailed(`No image given to process.`);
        }
    }
    catch (error) {
        core.setFailed(`Somthing went wrong while pushing and deploying your image. Error: ${error.message}`);
    }
}

let buildAndDeploy = async function buildAndDeploy(login, password, dockerComposeFilePath, imageListString)
{
        await loginToHeroku(login, password);
        await buildDockerCompose(dockerComposeFilePath);
        const imageList = await getImageAppNameList(imageListString);
        await pushAndDeployAllImages(imageList);
}

module.exports.loginToHeroku = loginToHeroku;
module.exports.getImageAppNameList = getImageAppNameList;
module.exports.buildDockerCompose = buildDockerCompose;
module.exports.pushAndDeployAllImages = pushAndDeployAllImages;
module.exports.buildAndDeploy = buildAndDeploy;
