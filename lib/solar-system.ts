import { Repository } from '@aws-cdk/aws-ecr';
import { ContainerImage } from '@aws-cdk/aws-ecs';
import { SolarSystemExtensionStack, SolarSystemExtensionStackProps } from '@cdk-cosmos/core';
import { EcsService } from '@cosmos-building-blocks/service';
import { AppGalaxyStack } from '.';

export interface AppSolarSystemProps extends SolarSystemExtensionStackProps {
  tag?: string;
}

export class AppSolarSystemStack extends SolarSystemExtensionStack {
  readonly galaxy: AppGalaxyStack;

  constructor(galaxy: AppGalaxyStack, id: string, props?: AppSolarSystemProps) {
    super(galaxy, id, props);

    const { tag = 'latest' } = props || {};
    const { ecrRepo } = this.galaxy.cosmos;
    const { vpc } = this.portal;
    const { cluster, httpListener, httpsListener } = this.portal.addEcs();
    const ecrRepoClone = Repository.fromRepositoryAttributes(this, 'EcrRepo', ecrRepo); // Scope issue

    new EcsService(this, 'Frontend', {
      vpc,
      cluster,
      httpListener,
      httpsListener,
      httpsRedirect: true,
      containerProps: {
        image: ContainerImage.fromEcrRepository(ecrRepoClone, tag),
        port: {
          containerPort: 3000,
        },
      },
      routingProps: {
        pathPattern: '/demo',
      },
    });
  }
}
