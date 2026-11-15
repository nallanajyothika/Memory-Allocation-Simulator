import { findSuitableHole } from "./allocation.js";

// Create memory blocks
export function createMemory(blockSizes) {
    let start = 0;

    const segments = blockSizes.map(size => {
        const segment = {
            start: start,
            size: size,
            allocated: false,
            processId: null,
            requestedSize: 0,
            padding: 0
        };

        start += size;
        return segment;
    });

    return {
        segments: segments,
        results: [],
        nextFitAddress: 0,
        totalMemory: start
    };
}


// Allocate processes
export function allocateProcesses(
    state,
    processSizes,
    algorithm,
    alignment = 4
) {
    state.results = [];

    processSizes.forEach((requestedSize, index) => {

        const allocatedSize =
            Math.ceil(requestedSize / alignment) * alignment;

        const hole = findSuitableHole(
            state.segments,
            allocatedSize,
            algorithm,
            state.nextFitAddress
        );

        if (!hole) {
            state.results.push({
                processId: "P" + (index + 1),
                requestedSize,
                allocatedSize: 0,
                startAddress: "-",
                status: "Not allocated",
                padding: 0
            });

            return;
        }

        const startAddress = hole.start;
        const remaining = hole.size - allocatedSize;

        const allocatedSegment = {
            start: hole.start,
            size: allocatedSize,
            allocated: true,
            processId: "P" + (index + 1),
            requestedSize: requestedSize,
            padding: allocatedSize - requestedSize
        };

        const position = state.segments.indexOf(hole);

        state.segments.splice(position, 1, allocatedSegment);

        if (remaining > 0) {
            state.segments.splice(position + 1, 0, {
                start: startAddress + allocatedSize,
                size: remaining,
                allocated: false,
                processId: null,
                requestedSize: 0,
                padding: 0
            });
        }

        state.nextFitAddress = startAddress + allocatedSize;

        state.results.push({
            processId: "P" + (index + 1),
            requestedSize,
            allocatedSize,
            startAddress,
            status: "Allocated",
            padding: allocatedSize - requestedSize
        });
    });

    return state;
}


// Merge adjacent free blocks
function mergeFreeBlocks(segments) {

    const merged = [];

    segments.forEach(segment => {

        const previous = merged[merged.length - 1];

        if (
            previous &&
            !previous.allocated &&
            !segment.allocated
        ) {
            previous.size += segment.size;
        } else {
            merged.push({ ...segment });
        }
    });

    return merged;
}


// Deallocate a process
export function deallocateProcess(state, processId) {

    const segment = state.segments.find(
        item => item.processId === processId && item.allocated
    );

    if (!segment) {
        return false;
    }

    segment.allocated = false;
    segment.processId = null;
    segment.requestedSize = 0;
    segment.padding = 0;

    state.segments = mergeFreeBlocks(state.segments);

    const result = state.results.find(
        item => item.processId === processId
    );

    if (result) {
        result.status = "Deallocated";
    }

    return true;
}