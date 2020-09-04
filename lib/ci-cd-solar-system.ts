import { StackProps, Stack } from "@aws-cdk/core";
import {
  SolarSystemExtensionStack,
  CiCdFeatureExtensionStack,
} from "@cdk-cosmos/core";
import { DockerPipeline } from "@cosmos-building-blocks/pipeline";
import { AppGalaxyStack } from ".";

export class AppCiCdSolarSystemStack extends SolarSystemExtensionStack {
  readonly galaxy: AppGalaxyStack;
  readonly ciCd: CiCdFeatureExtensionStack;
  readonly codePipeline: DockerPipeline;

  constructor(galaxy: AppGalaxyStack, props?: StackProps) {
    super(galaxy, "CiCd", props);

    this.addCiCd();

    const { codeRepo, ecrRepo } = this.galaxy.cosmos;

    this.codePipeline = new DockerPipeline(this, "CodePipeline", {
      pipelineName: this.galaxy.cosmos.nodeId("Code-Pipeline", "-"),
      buildName: this.galaxy.cosmos.nodeId("Code-Build", "-"),
      codeRepo: codeRepo,
      buildSpec: DockerPipeline.DefaultBuildSpec(),
      buildEnvs: {
        ECR_URL: {
          value: ecrRepo.repositoryUri,
        },
      },
    });

    ecrRepo.grantPullPush(this.codePipeline.build);
  }

  addCdkDeployEnvStageToCodePipeline(props: {
    name: string;
    stacks: Stack[];
    isManualApprovalRequired?: boolean;
  }) {
    this.ciCd.addDeployStackStage({
      ...props,
      pipeline: this.codePipeline.pipeline,
      envs: DockerPipeline.DefaultAppBuildVersionStageEnv(),
    });
  }
}
