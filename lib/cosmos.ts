import { Construct, StackProps } from "@aws-cdk/core";
import { Repository as EcrRepository } from "@aws-cdk/aws-ecr";
import { Repository as CodeRepository } from "@aws-cdk/aws-codecommit";
import { CosmosExtensionStack } from "@cdk-cosmos/core";

export class AppCosmosStack extends CosmosExtensionStack {
  readonly codeRepo: CodeRepository;
  readonly ecrRepo: EcrRepository;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.codeRepo = new CodeRepository(this, "CodeRepo", {
      repositoryName: this.nodeId("Code-Repo", "-").toLowerCase(),
    });

    this.ecrRepo = new EcrRepository(this, "EcrRepo", {
      repositoryName: this.nodeId("Frontend", "/").toLowerCase(),
    });
  }
}
