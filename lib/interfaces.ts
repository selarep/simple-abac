export type SimpleAbacAction = 'all' | 'any' | 'create' | 'read' | 'update' | 'delete' | string;
export type SimpleAbacTargets = 'all' | 'any' | string | string[];
export type SimpleAbacCondition = ((userId: number | string | undefined, targetOptions: any) => boolean | Promise<boolean>);

export interface ISimpleAbacAttributes {
  // All mode: Include all except [...]
  // Nothing mode: Include nothing except [...]
  mode: 'all' | 'nothing';
  except?: string[];
}

export interface ISimpleAbacAbility {
  role: string; // 'all' or 'any' are possible values
  action: SimpleAbacAction;
  target: string;
  attributes?: ISimpleAbacAttributes;
  condition?: SimpleAbacCondition;
}

export interface ISimpleAbacAbilities {
  role: string; // 'all' or 'any' are possible values
  actions: SimpleAbacAction | SimpleAbacAction[],
  targets: SimpleAbacTargets;
  attributes?: ISimpleAbacAttributes;
  condition?: SimpleAbacCondition;
}

export interface ISimpleAbacRoleExtension {
  originRole: string,
  destinationRole: string,
}