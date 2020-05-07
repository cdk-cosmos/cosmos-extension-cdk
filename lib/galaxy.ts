import { StackProps } from "@aws-cdk/core";
import { GalaxyExtensionStack } from "@cdk-cosmos/core";
import { AppCosmosStack } from ".";

export class AppGalaxyStack extends GalaxyExtensionStack {
  readonly cosmos: AppCosmosStack;

  constructor(cosmos: AppCosmosStack, name: string, props?: StackProps) {
    super(cosmos, name, props);
  }
}
