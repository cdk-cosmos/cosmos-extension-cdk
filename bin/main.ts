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

const cosmos = new AppCosmosStack(app, "DemoApp", {
  env: mgtEnvConfig
});

const mgtGalaxy = new AppGalaxyStack(cosmos, "Mgt");

const ciCd = new AppCiCdSolarSystemStack(mgtGalaxy);

const devGalaxy = new AppGalaxyStack(cosmos, "Dev", {
  env: devEnvConfig
});
cosmos.EcrRepo.grantPull(new AccountPrincipal(devGalaxy.account));

const dev = new AppSolarSystemStack(devGalaxy, "Dev", {
  tag: process.env.APP_BUILD_VERSION || "latest"
});
ciCd.addCdkDeployEnvStageToPipeline({
  solarSystem: dev,
  isManualApprovalRequired: false
});

const tst = new AppSolarSystemStack(devGalaxy, "Tst");
ciCd.addCdkDeployEnvStageToPipeline({ solarSystem: tst });
