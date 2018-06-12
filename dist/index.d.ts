import { ISimpleAbacAttributes, ISimpleAbacAbility, SimpleAbacAction, ISimpleAbacAbilities } from './interfaces';
/** Class that contains the definitions of abilities in our application. */
export declare class SimpleAbac {
    abilities: ISimpleAbacAbility[];
    /**
     * Create a SimpleAbac.
     */
    constructor();
    /**
     * Set a set of abilities to the SimpleAbac object.
     * @param abilities - a ISimpleAbacAbilities object.
     */
    allow(abilities: ISimpleAbacAbilities): void;
    /**
     * Returns a Permission object that says if a user can make an action
     * to a target that satisfy targetOptions, and if true, to which attributes of
     * target can access.
     * @param user - An object which contains user role and id attributes.
     * If not contains role or/and id, permission is granted if it the action could be performed
     * by any role, or/and by any userId. Example: { role: 'admin', id: 2512 }.
     * @param action - An string defining any ('all', 'any'), CRUD or custom action. Example: 'update'.
     * @param target - An string defining target. Must be name of the kind of resource. Example: 'user'.
     * @param targetOptions - An object which contains target options. Example: { id: 2482, name: 'Jack', role: 'admin' }.
     */
    can(user: any, action: SimpleAbacAction, target: string, targetOptions: any): Promise<Permission>;
    /**
     * This function returns the less restrictive set of attributes
     * that results on compossing the abilities passed.
     * Example: if one attribute let access 'all' except ['passwordHash'], and another one let access
     * 'nothing' except ['userId', 'passwordHash'], the attributes result will be 'all' except ['passwordHash'].
     * Another example: if one attribute let access 'all' except ['passwordHash'], and another one let access
     * 'all' except ['userId'], the attributes result will be 'all' except [], because both exclussions are inclussions
     * in other ability definitions.
     * @param abilities
     */
    private attributesComposition;
}
/** Class for definition of a permission. */
export declare class Permission {
    /** States if the action could be performed or not. */
    granted: boolean;
    /** Defines in which attributes of target could the action be performed */
    attributes: ISimpleAbacAttributes;
    /**
     * Create a permission.
     * @param granted
     * @param attributes
     */
    constructor(granted: boolean, attributes: ISimpleAbacAttributes);
    /**
     * Filters a target object attributes defined in 'attributes' property.
     * Returns a new object with only the allowed target attributes.
     * @param obj
     */
    filter(obj: any): any;
}
