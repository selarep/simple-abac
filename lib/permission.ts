import { ISimpleAbacAttributes } from './interfaces';
import _ = require('lodash');
import { toArray } from './toArray';

/** Class for definition of a permission. */
export class Permission {
  /** States if the action could be performed or not. */
  granted: boolean;
  /** Defines in which attributes of target could the action be performed */
  attributes: ISimpleAbacAttributes;

  /**
   * Create a permission.
   * @param granted
   * @param attributes 
   */
  constructor(granted: boolean, attributes: ISimpleAbacAttributes) {
    this.granted = granted;
    this.attributes = attributes;
  }

  /**
   * Filters a target object attributes defined in 'attributes' property.
   * Returns a new object with only the allowed target attributes.
   * @param obj 
   */
  filter(obj: any | any[]): any {
    if (Array.isArray(obj)) {
      return obj.map(element => {
        return this._filterElement(element);
      });
    } else {
      return this._filterElement(obj);
    }
  }

  private _filterElement(element: any) {
    if (this.attributes.mode === 'all') {
      if (!_.isNil(this.attributes.except)) {
        this.attributes.except.forEach(attribute => {
          element[attribute] = null;
          delete element[attribute];
        });
      }
      return element;
    } else if (this.attributes.mode === 'nothing') {
      const filteredObj: any = {};
      if (!_.isNil(this.attributes.except)) {
        this.attributes.except.forEach(attribute => {
          filteredObj[attribute] = element[attribute];
        });
      }
      return filteredObj;
    }
  }
}