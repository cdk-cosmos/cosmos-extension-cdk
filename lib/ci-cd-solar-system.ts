import { StackProps } from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-codecommit";
import { CiCdSolarSystemExtensionStack } from "@cdk-cosmos/core";
import { addCdkDeployEnvStageToPipeline } from "@cdk-cosmos/core/lib/components/cdk-pipeline";
import { AppNodePipeline } from "@cosmos-building-blocks/pipeline";
import { AppGalaxyStack, AppSolarSystemStack } from ".";

export class AppCiCdSolarSystemStack extends CiCdSolarSystemExtensionStack {
  readonly galaxy: AppGalaxyStack;
  readonly codePipeline: AppNodePipeline;

  constructor(galaxy: AppGalaxyStack, props?: StackProps) {
    super(galaxy, props);

    const { codeRepo, ecrRepo } = this.galaxy.cosmos;

    this.codePipeline = new AppNodePipeline(this, "CodePipeline", {
      pipelineName: this.galaxy.cosmos.generateId("Code-Pipeline", "-"),
      buildName: this.galaxy.cosmos.generateId("Code-Build", "-"),
      codeRepo: Repository.fromRepositoryName(
        this,
        codeRepo.node.id,
        codeRepo.repositoryName
      ),
      buildSpec: AppNodePipeline.DefaultBuildSpec(),
      buildEnvs: {
        ECR_URL: {
          value: ecrRepo.repositoryUri,
        },
      },
    });

    this.codePipeline.Build.role?.addManagedPolicy({
      managedPolicyArn: `arn:aws:iam::aws:policy/AdministratorAccess`, // FIXME:
    });
  }

  addCdkDeployEnvStageToPipeline(props: {
    solarSystem: AppSolarSystemStack;
    isManualApprovalRequired?: boolean;
  }) {
    addCdkDeployEnvStageToPipeline({
      ...props,
      pipeline: this.codePipeline.Pipeline,
      deployProject: this.deployProject,
      deployEnvs: AppNodePipeline.DefaultAppBuildVersionStageEnv(),
    });
  }
}
