export class Vector2 {

    constructor(
        public x: number = 0, 
        public y: number = 0
    ) {}

    public toString(): string {
        return `${this.x} : ${this.y}`;
    }

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

    public static isValidVector2(input: any): boolean {
        if(typeof input.x === 'number' && typeof input.y === 'number')
            return true;

        return false;
    }
}