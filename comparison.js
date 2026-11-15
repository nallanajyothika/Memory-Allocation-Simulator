import { ALGORITHMS } from "./allocation.js";

import {
    createMemory,
    allocateProcesses
} from "./memory.js";

import { calculateFragmentation } from "./fragmentation.js";


export function compareAlgorithms(
    memoryBlocks,
    processSizes,
    alignment
) {

    const comparisonResults = [];

    ALGORITHMS.forEach(algorithm => {

        // Create fresh memory for each algorithm
        const state = createMemory([...memoryBlocks]);

        // Perform allocation
        allocateProcesses(
            state,
            [...processSizes],
            algorithm,
            alignment
        );

        // Calculate performance
        const metrics = calculateFragmentation(state);

        comparisonResults.push({
            algorithm: algorithm,
            successful: metrics.successful,
            failed: metrics.failed,
            freeMemory: metrics.freeMemory,
            utilization: metrics.utilization
        });

    });

    return comparisonResults;
}