import { StackProps } from "@aws-cdk/core";
import { ContainerImage } from "@aws-cdk/aws-ecs";
import { EcsSolarSystemExtensionStack } from "@cdk-cosmos/core";
import { EcsService } from "@cosmos-building-blocks/service";
import { AppGalaxyStack } from ".";

export interface AppSolarSystemProps extends StackProps {
  tag?: string;
}

export class AppSolarSystemStack extends EcsSolarSystemExtensionStack {
  readonly Galaxy: AppGalaxyStack;

  constructor(
    galaxy: AppGalaxyStack,
    name: string,
    props?: AppSolarSystemProps
  ) {
    super(galaxy, name, props);

    const { tag = "latest" } = props || {};
    const { EcrRepo } = this.Galaxy.Cosmos;
    const { Vpc, Cluster, HttpListener } = this.Portal;

    new EcsService(this, `${this.Galaxy.Name}-${this.Name}`, "Frontend", {
      vpc: Vpc,
      cluster: Cluster,
      httpListener: HttpListener,
      container: {
        image: ContainerImage.fromEcrRepository(EcrRepo, tag)
      },
      service: {},
      routing: {
        pathPattern: "/test",
        priority: 1
      }
    });
  }
}
