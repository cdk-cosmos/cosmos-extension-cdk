# Template Consumer App

This repo serves as a starting point for consumers to consume that core infra and deploy their own services and infra.

# Bootstrapping

Bootstrapping is a term use to get the app infra initially deployed manually so that it can take over and deploy its self. This can also be referred to as the chicken and egg situation.

As mentioned we will have to bootstrap the app infra once manually, then the CiCd stack will take over with the CdkPipeline (called DeployProject).

Steps:

1. Clone this repo (https://github.com/carnivalofthecosmos/template-consumer-app.git).
2. Run `npm install`
3. Open `bin/main.ts` and change the project name from `TemplateApp` to your app name.
4. Aws Cli Login.
5. Bootstrap, run `npx cdk deploy Cosmos-App-${ProjectName}-Galaxy-${AccountName}-SolarSystem-CiCd` (Please change to your project name and account name).
6. Update git remote url `git remote set-url origin "https://git-codecommit.ap-southeast-2.amazonaws.com/v1/repos/app-${ProjectName}-cdk-repo"` (Please change Project name and region etc as required).
7. Commit your changes and Push your custom version of the template to your app cdk repo, `git commit && git push`
8. Done: Now use the app cdk pipeline to deploy any further changes to your app cdk code (Pipeline Named `App-${ProjectName}-Cdk-Pipeline`)

# Whats included

TODO:
