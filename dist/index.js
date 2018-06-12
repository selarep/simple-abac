"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var autoBind = require("auto-bind");
var _ = require("lodash");
var toArray_1 = require("./toArray");
/** Class that contains the definitions of abilities in our application. */
var SimpleAbac = /** @class */ (function () {
    /**
     * Create a SimpleAbac.
     */
    function SimpleAbac() {
        this.abilities = [];
        autoBind(this);
    }
    /**
     * Set a set of abilities to the SimpleAbac object.
     * @param abilities - a ISimpleAbacAbilities object.
     */
    SimpleAbac.prototype.allow = function (abilities) {
        var _this = this;
        toArray_1.toArray(abilities.actions).forEach(function (action) {
            toArray_1.toArray(abilities.targets).forEach(function (target) {
                if (_.isNil(abilities.attributes))
                    abilities.attributes = { mode: 'all' };
                _this.abilities.push({ role: abilities.role, action: action, target: target, attributes: abilities.attributes, condition: abilities.condition });
            });
        });
    };
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
    SimpleAbac.prototype.can = function (user, action, target, targetOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var abilities, filteredAbilities, _i, abilities_1, ability, granted, attributes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        abilities = this.abilities
                            .filter(function (ability) {
                            return user && (user.role === ability.role) || ability.role === 'all' || ability.role === 'any';
                        })
                            .filter(function (ability) {
                            return target === ability.target || ability.target === 'all' || ability.target === 'any';
                        })
                            .filter(function (ability) {
                            return action === ability.action || ability.action === 'all' || ability.action === 'any';
                        });
                        filteredAbilities = [];
                        _i = 0, abilities_1 = abilities;
                        _a.label = 1;
                    case 1:
                        if (!(_i < abilities_1.length)) return [3 /*break*/, 5];
                        ability = abilities_1[_i];
                        if (!!_.isNil(ability.condition)) return [3 /*break*/, 3];
                        return [4 /*yield*/, ability.condition(user && user.id, targetOptions)];
                    case 2:
                        if (_a.sent()) {
                            filteredAbilities.push(ability);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        filteredAbilities.push(ability);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        granted = filteredAbilities.length > 0;
                        attributes = this.attributesComposition(filteredAbilities);
                        return [2 /*return*/, new Permission(granted, attributes)];
                }
            });
        });
    };
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
    SimpleAbac.prototype.attributesComposition = function (abilities) {
        // Grouping by mode
        var allModeAttributesArray = [];
        var nothingModeAttributesArray = [];
        abilities.forEach(function (ability) {
            if (!_.isNil(ability.attributes)) {
                if (ability.attributes.mode === 'all') {
                    allModeAttributesArray.push(ability.attributes);
                }
                else if (ability.attributes.mode === 'nothing') {
                    nothingModeAttributesArray.push(ability.attributes);
                }
            }
        });
        // Merging each group in one attributes variable
        var allModeExcept;
        var nothingModeExcept;
        allModeExcept = _.intersection.apply(_, allModeAttributesArray.map(function (simpleAbacAttributes) {
            return simpleAbacAttributes.except || [];
        }));
        nothingModeExcept = _.union.apply(_, nothingModeAttributesArray.map(function (simpleAbacAttributes) {
            return simpleAbacAttributes.except || [];
        }));
        // Choose result mode
        var attributes = { mode: 'nothing' };
        abilities.forEach(function (ability) {
            if (_.isNil(ability.attributes) || ability.attributes.mode === 'all') {
                attributes.mode = 'all';
            }
        });
        // At this moment, the attributes mode is defined ('nothing' or 'all')
        if (attributes.mode === 'all') {
            // Attributes explicitly unallowed except attributes explicitly allowed
            attributes.except = allModeExcept
                .filter(function (attribute) {
                return !_.includes(nothingModeExcept, attribute);
            });
        }
        else if (attributes.mode === 'nothing') {
            // Attributes allowed
            attributes.except = nothingModeExcept;
        }
        return attributes;
    };
    return SimpleAbac;
}());
exports.SimpleAbac = SimpleAbac;
/** Class for definition of a permission. */
var Permission = /** @class */ (function () {
    /**
     * Create a permission.
     * @param granted
     * @param attributes
     */
    function Permission(granted, attributes) {
        this.granted = granted;
        this.attributes = attributes;
    }
    /**
     * Filters a target object attributes defined in 'attributes' property.
     * Returns a new object with only the allowed target attributes.
     * @param obj
     */
    Permission.prototype.filter = function (obj) {
        if (this.attributes.mode === 'all') {
            if (!_.isNil(this.attributes.except)) {
                this.attributes.except.forEach(function (attribute) {
                    delete obj[attribute];
                });
            }
            return obj;
        }
        else if (this.attributes.mode === 'nothing') {
            var filteredObj_1 = {};
            if (!_.isNil(this.attributes.except)) {
                this.attributes.except.forEach(function (attribute) {
                    filteredObj_1[attribute] = obj[attribute];
                });
            }
            return filteredObj_1;
        }
    };
    return Permission;
}());
exports.Permission = Permission;
