import { Construct, StackProps } from "@aws-cdk/core";
import { Repository as EcrRepository } from "@aws-cdk/aws-ecr";
import { Repository as CodeRepository } from "@aws-cdk/aws-codecommit";
import { CosmosExtensionStack, PATTERN } from "@cdk-cosmos/core";

export class AppCosmosStack extends CosmosExtensionStack {
  readonly CodeRepo: CodeRepository;
  readonly EcrRepo: EcrRepository;

  constructor(scope: Construct, name: string, props?: StackProps) {
    super(scope, name, props);

    this.CodeRepo = new CodeRepository(this, "CodeRepo", {
      repositoryName: this.RESOLVE(
        PATTERN.COSMOS,
        "Main-Repo"
      ).toLocaleLowerCase(),
    });

    this.EcrRepo = new EcrRepository(this, "EcrRepo", {
      repositoryName: this.RESOLVE(
        PATTERN.DOCKER_TAG,
        "Frontend"
      ).toLowerCase(),
    });
  }
}
