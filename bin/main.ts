#!/usr/bin/env node
import "source-map-support/register";
import { App } from "@aws-cdk/core";
import { AccountPrincipal } from "@aws-cdk/aws-iam";
import {
  AppCosmosStack,
  AppGalaxyStack,
  AppSolarSystemStack,
  AppCiCdSolarSystemStack
} from "../lib";

const app = new App();

const mgtEnvConfig = { account: "1111", region: "ap-southeast-2" };
const devEnvConfig = { account: "2222", region: "ap-southeast-2" };

// Project Level Infra
const cosmos = new AppCosmosStack(app, "DemoApp", {
  env: mgtEnvConfig
});

// Account Level Infra
const mgtGalaxy = new AppGalaxyStack(cosmos, "Mgt");

// CiCd Level Infra
const ciCd = new AppCiCdSolarSystemStack(mgtGalaxy);

// Dev Account Level Infra
const devGalaxy = new AppGalaxyStack(cosmos, "Dev", {
  env: devEnvConfig
});
cosmos.EcrRepo.grantPull(new AccountPrincipal(devGalaxy.account));

// Dev App Env Level Infra
const dev = new AppSolarSystemStack(devGalaxy, "Dev", {
  tag: process.env.APP_BUILD_VERSION || "latest"
});
ciCd.addCdkDeployEnvStageToPipeline({
  solarSystem: dev,
  isManualApprovalRequired: false
});

// Tst App Env Level Infra
const tst = new AppSolarSystemStack(devGalaxy, "Tst");
ciCd.addCdkDeployEnvStageToPipeline({ solarSystem: tst });
