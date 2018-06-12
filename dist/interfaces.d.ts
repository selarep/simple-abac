export declare type SimpleAbacAction = 'all' | 'any' | 'create' | 'read' | 'update' | 'delete' | string;
export declare type SimpleAbacTargets = 'all' | 'any' | string | string[];
export declare type SimpleAbacCondition = ((userId: number | undefined, targetOptions: any) => boolean | Promise<boolean>);
export interface ISimpleAbacAttributes {
    mode: 'all' | 'nothing';
    except?: string[];
}
export interface ISimpleAbacAbility {
    role: string;
    action: SimpleAbacAction;
    target: string;
    attributes?: ISimpleAbacAttributes;
    condition?: SimpleAbacCondition;
}
export interface ISimpleAbacAbilities {
    role: string;
    actions: SimpleAbacAction | SimpleAbacAction[];
    targets: SimpleAbacTargets;
    attributes?: ISimpleAbacAttributes;
    condition?: SimpleAbacCondition;
}
