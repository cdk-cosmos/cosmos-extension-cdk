import { StackProps } from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-codecommit";
import { CiCdSolarSystemExtensionStack } from "@cdk-cosmos/core";
import { addCdkDeployEnvStageToPipeline } from "@cdk-cosmos/core/lib/components/cdk-pipeline";
import { DockerPipeline } from "@cosmos-building-blocks/pipeline";
import { AppGalaxyStack, AppSolarSystemStack } from ".";

export class AppCiCdSolarSystemStack extends CiCdSolarSystemExtensionStack {
  readonly galaxy: AppGalaxyStack;
  readonly codePipeline: DockerPipeline;

  constructor(galaxy: AppGalaxyStack, props?: StackProps) {
    super(galaxy, props);

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

  addCdkDeployEnvStageToPipeline(props: {
    solarSystem: AppSolarSystemStack;
    isManualApprovalRequired?: boolean;
  }) {
    addCdkDeployEnvStageToPipeline({
      ...props,
      pipeline: this.codePipeline.pipeline,
      deployProject: this.deployProject,
      deployEnvs: DockerPipeline.DefaultAppBuildVersionStageEnv(),
    });
  }
}
