export function calculateFragmentation(state) {

    const totalMemory = state.totalMemory;

    const allocatedMemory = state.segments
        .filter(segment => segment.allocated)
        .reduce((sum, segment) => sum + segment.size, 0);

    const freeMemory = state.segments
        .filter(segment => !segment.allocated)
        .reduce((sum, segment) => sum + segment.size, 0);

    const internalFragmentation = state.segments
        .filter(segment => segment.allocated)
        .reduce((sum, segment) => sum + segment.padding, 0);

    const freeBlocks = state.segments.filter(
        segment => !segment.allocated
    );

    const largestFreeBlock = freeBlocks.length > 0
        ? Math.max(...freeBlocks.map(block => block.size))
        : 0;

    const externalFragmentation = Math.max(
        0,
        freeMemory - largestFreeBlock
    );

    const utilization = totalMemory > 0
        ? (allocatedMemory / totalMemory) * 100
        : 0;

    const successful = state.results.filter(
        result => result.status === "Allocated"
    ).length;

    const failed = state.results.filter(
        result => result.status === "Not allocated"
    ).length;

    return {
        totalMemory,
        allocatedMemory,
        freeMemory,
        utilization: utilization.toFixed(2),
        internalFragmentation,
        externalFragmentation,
        largestFreeBlock,
        successful,
        failed
    };
}