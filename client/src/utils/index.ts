export const linearInterpolation = (
    start: number,
    end: number,
    ratio: number,
) => {
    return start + (end - start) * ratio;
};

// array1 - array2
export const getDifference = <T>(array1: T[], array2: T[]): T[] => {
    return array1.filter((value) => !array2.includes(value));
};

export const getDistance = (a: any, b: any) => {
    if (!a.x || !a.y || !b.x || !b.y) {
        return Infinity;
    }
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};
