export const linearInterpolation = (start: number, end: number, ratio: number) => {
    return start + (end - start) * ratio;
};
