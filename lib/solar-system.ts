import { Repository } from '@aws-cdk/aws-ecr';
import { ContainerImage } from '@aws-cdk/aws-ecs';
import { SolarSystemExtensionStack, SolarSystemExtensionStackProps } from '@cdk-cosmos/core';
import { SsmState } from '@cosmos-building-blocks/common';
import { EcsService } from '@cosmos-building-blocks/service';
import { AppGalaxyStack } from '.';

export interface AppSolarSystemProps extends SolarSystemExtensionStackProps {
  appVersion?: string;
}

export class AppSolarSystemStack extends SolarSystemExtensionStack {
  readonly galaxy: AppGalaxyStack;

  constructor(galaxy: AppGalaxyStack, id: string, props?: AppSolarSystemProps) {
    super(galaxy, id, {
      portalProps: {
        vpcProps: {
          aZsLookup: true,
        },
      },
      ...props
    });

    const { appVersion } = props || {};
    const { ecrRepo } = this.galaxy.cosmos;
    const { vpc } = this.portal;
    const { cluster, httpListener, httpsListener } = this.portal.addEcs();
    const ecrRepoClone = Repository.fromRepositoryAttributes(this, 'EcrRepo', ecrRepo); // Scope issue
    const versionState = new SsmState(this, 'VersionState', {
      name: '/' + this.nodeId('VersionState', '/'),
      value: appVersion,
    });

    new EcsService(this, 'Frontend', {
      vpc,
      cluster,
      httpListener,
      httpsListener,
      containerProps: {
        image: ContainerImage.fromEcrRepository(ecrRepoClone, versionState.value),
        port: {
          containerPort: 3000,
        },
      },
      routingProps: {
        pathPattern: '/demo',
        httpsRedirect: true,
      },
    });
  }
}
