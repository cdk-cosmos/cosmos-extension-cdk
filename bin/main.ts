#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { AccountPrincipal } from '@aws-cdk/aws-iam';
import { AppCosmosStack, AppGalaxyStack, AppSolarSystemStack, AppCiCdSolarSystemStack } from '../lib';

// Cdk App
export const app = new App();

// AWS Env Config
const mgtEnvConfig = { account: '1111', region: 'ap-southeast-2' };
const devEnvConfig = { account: '2222', region: 'ap-southeast-2' };

// Extend the Cosmos + Add our App bits
const cosmos = new AppCosmosStack(app, 'Demo', {
  env: mgtEnvConfig,
});

// Extend the Mgt Galaxy
const mgtGalaxy = new AppGalaxyStack(cosmos, 'Mgt');

// Extend the CiCd SolarSystem, adding our App CiCd pipeline
const ciCd = new AppCiCdSolarSystemStack(mgtGalaxy);

// Extends the Dev Galaxy
const devGalaxy = new AppGalaxyStack(cosmos, 'Dev', {
  env: devEnvConfig,
});
// Allow the Dev Galaxy to access the ecr repo
cosmos.ecrRepo.grantPull(new AccountPrincipal(devGalaxy.account));

// Extend the Dev SolarSystem, by creating service
const dev = new AppSolarSystemStack(devGalaxy, 'Dev', {
  appVersion: process.env.APP_BUILD_VERSION,
});
// Add a Deployment stage in App Pipeline to target this SolarSystem
ciCd.addCdkDeployEnvStageToCodePipeline({
  name: 'DeployDev',
  stacks: [dev],
  isManualApprovalRequired: false,
});

// Extend the Dev SolarSystem, by creating service
const tst = new AppSolarSystemStack(devGalaxy, 'Tst', {
  appVersion: process.env.APP_BUILD_VERSION,
});
// Add a Deployment stage in App Pipeline to target this SolarSystem
ciCd.addCdkDeployEnvStageToCodePipeline({
  name: 'DeployTst',
  stacks: [tst],
});
