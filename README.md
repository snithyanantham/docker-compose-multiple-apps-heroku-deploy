# docker-compose-multiple-apps-heroku-deploy - GitHub Action

A simple action to build multiple docker images using docker-compose, push and deploy your apps to Heroku Applications


## How to use it

```yml
name: '' #set whatevername you want to your github job
on: {} # set the events you would like to trigger this job
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Build, Push and Deploy to Heroku #set the whatever name you want to this step
        id: heroku
        uses: snithyanantham/docker-compose-multiple-apps-heroku-deploy@v1.0.0  # use the latest version of the action
        with:
          email: ${{ secrets.HEROKU_EMAIL }} # your heroku email
          api_key: ${{ secrets.HEROKU_API_KEY }} # your  heroku api key
          docker_compose_file: './src/docker-compose.heroku.yml' # set the path to the folder where the docker-compose file is located
          heroku_apps: '[{"imagename":"app1","appname":"app1","apptype":"web"},{"imagename":"app2","appname":"app2","apptype":"web"},{"imagename":"app3","appname":"app2","apptype":"worker"}]' # List of Docker Image name, Heroku app and Heroku app type
```

| Variables  | Required           |
| ------------- |:-------------:|
| email      | ✅|
| api_key      | ✅|
| docker_compose_file | ✅|
| heroku_apps | ✅|
