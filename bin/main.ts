#!/usr/bin/env node
import "source-map-support/register";
import { App } from "@aws-cdk/core";
import { AccountPrincipal } from "@aws-cdk/aws-iam";
import {
  AppCosmosStack,
  AppGalaxyStack,
  AppSolarSystemStack,
  AppCiCdSolarSystemStack,
} from "../lib";

// Cdk App
const app = new App();

// AWS Env Config
const mgtEnvConfig = { account: "1111", region: "ap-southeast-2" };
const devEnvConfig = { account: "2222", region: "ap-southeast-2" };

// Extend the Cosmos + Add our App bits
const cosmos = new AppCosmosStack(app, "Demo", {
  env: mgtEnvConfig,
});

// Extend the Mgt Galaxy
const mgtGalaxy = new AppGalaxyStack(cosmos, "Mgt");

// Extend the CiCd SolarSystem, adding our App CiCd pipeline
const ciCd = new AppCiCdSolarSystemStack(mgtGalaxy);

// Extends the Dev Galaxy
const devGalaxy = new AppGalaxyStack(cosmos, "Dev", {
  env: devEnvConfig,
});
// Allow the Dev Galaxy to access the ecr repo
cosmos.ecrRepo.grantPull(new AccountPrincipal(devGalaxy.account));

// TODO: Enable Solar Systems after bootstrap

// Extend the Dev SolarSystem, by creating service
const dev = new AppSolarSystemStack(devGalaxy, "Dev", {
  tag: process.env.APP_BUILD_VERSION || "v1.0.0-1",
});
// Add a Deployment stage in App Pipeline to target this
ciCd.addCdkDeployEnvStageToPipeline({
  solarSystem: dev,
  isManualApprovalRequired: false,
});

// Extend the Dev SolarSystem, by creating service
const tst = new AppSolarSystemStack(devGalaxy, "Tst", {
  tag: process.env.APP_BUILD_VERSION || "v1.0.0-1",
});
// Add a Deployment stage in App Pipeline to target this
ciCd.addCdkDeployEnvStageToPipeline({ solarSystem: tst });
