"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector2 = void 0;
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `${this.x} : ${this.y}`;
    }
    toMediaConstraint() {
        return {
            width: {
                min: this.x,
                ideal: this.x
            },
            height: {
                min: this.y,
                ideal: this.y
            }
        };
    }
    static isValidVector2(input) {
        if (typeof input.x === 'number' && typeof input.y === 'number')
            return true;
        return false;
    }
}
exports.Vector2 = Vector2;
