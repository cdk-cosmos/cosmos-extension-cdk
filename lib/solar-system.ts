import { StackProps } from "@aws-cdk/core";
import { ContainerImage } from "@aws-cdk/aws-ecs";
import { EcsSolarSystemExtensionStack } from "@cdk-cosmos/core";
import { EcsService } from "@cosmos-building-blocks/service";
import { AppGalaxyStack } from ".";

export interface AppSolarSystemProps extends StackProps {
  tag?: string;
}

export class AppSolarSystemStack extends EcsSolarSystemExtensionStack {
  readonly galaxy: AppGalaxyStack;

  constructor(
    galaxy: AppGalaxyStack,
    id: string,
    props?: AppSolarSystemProps
  ) {
    super(galaxy, id, props);

    const { tag = "latest" } = props || {};
    const { ecrRepo } = this.galaxy.cosmos;
    const { vpc, cluster, httpListener } = this.portal;

    new EcsService(this, "Frontend", {
      vpc,
      cluster,
      httpListener,
      containerProps: {
        image: ContainerImage.fromEcrRepository(ecrRepo, tag),
        port: {
          containerPort: 3000,
        },
      },
      routingProps: {
        pathPattern: "/demo",
      },
    });
  }
}
