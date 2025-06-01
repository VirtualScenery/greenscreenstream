/**
 * Represents a 2-dimensional vector with `x` and `y` coordinates.
 *
 * Provides utility methods for string representation, conversion to media constraints,
 * and validation of vector-like objects.
 *
 * @example
 * ```typescript
 * const v = new Vector2(1920, 1080);
 * console.log(v.toString()); // "1920 : 1080"
 * ```
 */
export class Vector2 {

    constructor(
        public x: number = 0, 
        public y: number = 0
    ) {}

    /**
     * Returns a string representation of the vector in the format "x : y".
     *
     * @returns {string} The string representation of the vector.
     */
    public toString(): string {
        return `${this.x} : ${this.y}`;
    }

    /**
     * Converts the current vector's x and y values into a `MediaTrackConstraints` object,
     * setting the `width` and `height` constraints with `min` and `ideal` properties.
     *
     * @returns {MediaTrackConstraints} An object specifying the minimum and ideal width and height
     *                                 for media track constraints, based on the vector's x (width)
     *                                 and y (height) values.
     */
    public toMediaConstraint(): MediaTrackConstraints {
        return {
            width: {
                min: this.x,
                ideal: this.x
            },
            height: {
                min: this.y,
                ideal: this.y
            }
        }
    }

    /**
     * Determines whether the provided input is a valid Vector2 object.
     *
     * A valid Vector2 object must have numeric `x` and `y` properties.
     *
     * @param input - The value to check for Vector2 validity.
     * @returns `true` if the input has numeric `x` and `y` properties, otherwise `false`.
     */
    public static isValidVector2(input: any): boolean {
        if(typeof input.x === 'number' && typeof input.y === 'number')
            return true;

        return false;
    }
}