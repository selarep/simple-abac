import * as autoBind from 'auto-bind';
import * as _ from 'lodash';
import { toArray } from './toArray';
import { ISimpleAbacAttributes, ISimpleAbacAbility, SimpleAbacAction, SimpleAbacTargets, SimpleAbacCondition, ISimpleAbacAbilities, ISimpleAbacRoleExtension } from './interfaces';
import { Permission } from './permission';

/** Class that contains the definitions of abilities in our application. */
export class SimpleAbac {
  private abilities: ISimpleAbacAbility[] = [];
  private extensions: ISimpleAbacRoleExtension[] = [];
  
  /**
   * Create a SimpleAbac.
   */
  constructor() {
    autoBind(this);
  }

  /**
   * Set a set of abilities to the SimpleAbac object.
   * @param abilities - a ISimpleAbacAbilities object.
   */
  allow(abilities: ISimpleAbacAbilities) {
    toArray(abilities.actions).forEach(action => {
      toArray(abilities.targets).forEach(target => {
        if (_.isNil(abilities.attributes)) abilities.attributes = {mode: 'all'};
        this.abilities.push({role: abilities.role, action, target, attributes: abilities.attributes, condition: abilities.condition});
      });
    });
  }

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
  async can(
    user: { role?: string | string[], userId?: number | string, [key: string]: any },
    action: SimpleAbacAction,
    target: string,
    targetOptions: any,
  ): Promise<Permission> {

    const abilities: ISimpleAbacAbility[] = this.abilities
    .filter(ability => {
      return this.userCanAbility(user, ability);
    })
    .filter(ability => {
      return target === ability.target || ability.target === 'all' || ability.target === 'any';
    })
    .filter(ability => {
      return action === ability.action || ability.action === 'all' || ability.action === 'any';
    });

    const filteredAbilities: ISimpleAbacAbility[] = [];
    for (const ability of abilities) {
      if (!_.isNil(ability.condition)) {
        if (await ability.condition(user && user.id, targetOptions)) {
          filteredAbilities.push(ability);
        }
      } else {
        filteredAbilities.push(ability);
      }
    }
    const granted: boolean = filteredAbilities.length > 0;
    const attributes: ISimpleAbacAttributes = this.attributesComposition(filteredAbilities);
    return new Permission(granted, attributes);
  }

  /**
   * Makes destination role to be an extension of origin role.
   * Then, destination role will be allowed to do anything that origin role can.
   * @param origin 
   * @param destination 
   */
  extendRole(origin: string, destination: string) {
    this.extensions.push({originRole: origin, destinationRole: destination});
  }

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
  private attributesComposition(abilities: ISimpleAbacAbility[]): ISimpleAbacAttributes {
    // Grouping by mode
    const allModeAttributesArray: ISimpleAbacAttributes[] = [];
    const nothingModeAttributesArray: ISimpleAbacAttributes[] = [];
    abilities.forEach((ability) => {
      if (!_.isNil(ability.attributes)) {
        if (ability.attributes.mode === 'all') {
          allModeAttributesArray.push(ability.attributes);
        } else if (ability.attributes.mode === 'nothing') {
          nothingModeAttributesArray.push(ability.attributes);
        }
      }
    });

    // Merging each group in one attributes variable
    let allModeExcept: string[];
    let nothingModeExcept: string[];

    allModeExcept = _.intersection(...allModeAttributesArray.map((simpleAbacAttributes) => {
      return simpleAbacAttributes.except || [];
    }));
    nothingModeExcept = _.union(...nothingModeAttributesArray.map((simpleAbacAttributes) => {
      return simpleAbacAttributes.except || [];
    }));

    // Choose result mode
    const attributes: ISimpleAbacAttributes = {mode: 'nothing'};
    abilities.forEach((ability) => {
      if (_.isNil(ability.attributes) || ability.attributes.mode === 'all') {
        attributes.mode = 'all';
      }
    });
    // At this moment, the attributes mode is defined ('nothing' or 'all')
    if (attributes.mode === 'all') {
      // Attributes explicitly unallowed except attributes explicitly allowed
      attributes.except = allModeExcept
      .filter((attribute) => {
        return !_.includes(nothingModeExcept, attribute);
      });
    } else if (attributes.mode === 'nothing') {
      // Attributes allowed
      attributes.except = nothingModeExcept;
    }
    return attributes;
  }

  private userCanAbility(user: any, ability: ISimpleAbacAbility): boolean {
    const extendedRoles = this.extensions
      .filter(extension => {
        return extension.originRole === ability.role;
      })
      .map(extension => {
        return extension.destinationRole;
      });
    if (ability.role === 'all' || ability.role === 'any') {
      return true;
    }
    if (user) {
      const userRole = toArray(user.role);
      for (const role of userRole) {
        if ((role === ability.role) || extendedRoles.find(role => (role === role || role === 'any' || role === 'all')) !== undefined) {
          return true;
        }
      }
    }
    return false;
  }
}