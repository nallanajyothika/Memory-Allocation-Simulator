export const ALGORITHMS = [
    "First Fit",
    "Best Fit",
    "Worst Fit",
    "Next Fit"
];

export function findSuitableHole(segments, size, algorithm, nextFitAddress = 0) {

    const holes = segments.filter(
        segment => !segment.allocated && segment.size >= size
    );

    if (holes.length === 0) {
        return null;
    }

    if (algorithm === "First Fit") {
        return holes[0];
    }

    if (algorithm === "Best Fit") {
        return holes.reduce((best, current) =>
            current.size < best.size ? current : best
        );
    }

    if (algorithm === "Worst Fit") {
        return holes.reduce((worst, current) =>
            current.size > worst.size ? current : worst
        );
    }

    if (algorithm === "Next Fit") {

        const afterPointer = holes.filter(
            hole => hole.start >= nextFitAddress
        );

        if (afterPointer.length > 0) {
            return afterPointer[0];
        }

        return holes[0];
    }

    return null;
}