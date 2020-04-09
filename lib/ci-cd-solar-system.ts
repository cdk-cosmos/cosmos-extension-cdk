import { StackProps } from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-codecommit";
import { CiCdSolarSystemExtensionStack, PATTERN } from "@cdk-cosmos/core";
import { addCdkDeployEnvStageToPipeline } from "@cdk-cosmos/core/lib/helpers/cdk-pipeline";
import { AppNodePipeline } from "@cosmos-building-blocks/pipeline";
import { AppGalaxyStack, AppSolarSystemStack } from ".";

export class AppCiCdSolarSystemStack extends CiCdSolarSystemExtensionStack {
  readonly Galaxy: AppGalaxyStack;
  readonly CodePipeline: AppNodePipeline;

  constructor(galaxy: AppGalaxyStack, props?: StackProps) {
    super(galaxy, props);

    const { CodeRepo, EcrRepo } = this.Galaxy.Cosmos;

    this.CodePipeline = new AppNodePipeline(this, "CodePipeline", {
      name: this.RESOLVE(PATTERN.COSMOS, "Main-Pipeline"),
      codeRepo: Repository.fromRepositoryName(
        this,
        CodeRepo.node.id,
        CodeRepo.repositoryName
      ),
      buildSpec: AppNodePipeline.DefaultBuildSpec(),
      buildEnvs: {
        ECR_URL: {
          value: EcrRepo.repositoryUri,
        },
      },
    });

    this.CodePipeline.Build.role?.addManagedPolicy({
      managedPolicyArn: `arn:aws:iam::aws:policy/AdministratorAccess`, // FIXME:
    });
  }

  addCdkDeployEnvStageToPipeline(props: {
    solarSystem: AppSolarSystemStack;
    isManualApprovalRequired?: boolean;
  }) {
    addCdkDeployEnvStageToPipeline({
      ...props,
      pipeline: this.CodePipeline.Pipeline,
      deployProject: this.DeployProject,
      deployEnvs: AppNodePipeline.DefaultAppBuildVersionStageEnv(),
    });
  }
}
