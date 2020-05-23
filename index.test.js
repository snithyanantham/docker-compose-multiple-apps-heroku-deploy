const app = require('./app');

let inputs = {
    'email': 'test@test.com',
    'api_key': 'test',
    'heroku_apps': '[{"imagename":"app1","appname":"app3","apptype":"web"},{"imagename":"app2","appname":"app2","apptype":"web"},{"imagename":"app3","appname":"app2","apptype":"worker"}]',
    'docker_compose_file': './src/docker-compose-heroku.yml'
};

jest.mock('util', () => ({
    promisify: jest.fn(() => {
        return jest.fn();
    })
}));

test('build and deploy with 3 images', async () => {
    await app.buildAndDeploy(inputs.email, inputs.api_key, inputs.docker_compose_file, inputs.heroku_apps);
});

test('build and deploy with single image', async () => {
    await app.buildAndDeploy(inputs.email, inputs.api_key, inputs.docker_compose_file, '[{"imagename":"app1","appname":"app3","apptype":"web"}]');
});

test('get image string to json object', async () => {

    const imageString = '[{"imagename":"app1","appname":"app3","apptype":"web"},{"imagename":"app2","appname":"app2","apptype":"web"},{"imagename":"app3","appname":"app2","apptype":"worker"}]';
    var images = await app.getImageAppNameList(imageString);

    expect(images.length).toBeGreaterThan(0);
    expect(images[0].appname).toBe('app3');
    expect(images.length).toBe(3);

});

test('get image string to json object for single element', async () => {

    const imageString = '[{"imagename":"app1","appname":"app3","apptype":"web"}]';
    var images = await app.getImageAppNameList(imageString);

    expect(images.length).toBeGreaterThan(0);
    expect(images[0].appname).toBe('app3');
    expect(images.length).toBe(1);

});

test('check execution times', async () => {

    const images = JSON.parse('[{"imagename":"app1","appname":"app3","apptype":"web"}]');
    await app.pushAndDeployAllImages(images);
});

test('check build docker compose', async () => {
    const path = './src/docker-compose.yml';
    await app.buildDockerCompose(path);
});
