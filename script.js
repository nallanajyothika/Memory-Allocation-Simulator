import { ALGORITHMS } from "./allocation.js";

import {
    createMemory,
    allocateProcesses,
    deallocateProcess
} from "./memory.js";

import { calculateFragmentation } from "./fragmentation.js";

import { compareAlgorithms } from "./comparison.js";


// Global memory state
let currentState = null;


// Get HTML elements
const memoryInput = document.getElementById("memoryInput");
const processInput = document.getElementById("processInput");
const algorithmInput = document.getElementById("algorithm");
const alignmentInput = document.getElementById("alignment");

const runBtn = document.getElementById("runBtn");
const compareBtn = document.getElementById("compareBtn");
const resetBtn = document.getElementById("resetBtn");


// Convert comma-separated input into numbers
function getNumbers(input) {

    const values = input.split(",").map(value => value.trim());

    if (
        values.some(value => value === "" || !Number.isFinite(Number(value)))
    ) {
        throw new Error("Enter valid comma-separated numbers.");
    }

    const numbers = values.map(Number);

    if (numbers.some(number => number <= 0)) {
        throw new Error("All values must be greater than zero.");
    }

    return numbers;
}


// Display dashboard statistics
function renderDashboard() {

    const metrics = calculateFragmentation(currentState);

    document.getElementById("totalMemory").textContent =
        metrics.totalMemory + " KB";

    document.getElementById("allocatedMemory").textContent =
        metrics.allocatedMemory + " KB";

    document.getElementById("freeMemory").textContent =
        metrics.freeMemory + " KB";

    document.getElementById("utilization").textContent =
        metrics.utilization + "%";

    document.getElementById("internalFrag").textContent =
        metrics.internalFragmentation + " KB";

    document.getElementById("externalFrag").textContent =
        metrics.externalFragmentation + " KB";
}


// Display memory map
function renderMemoryMap() {

    const map = document.getElementById("memoryMap");

    map.innerHTML = "";

    currentState.segments.forEach(segment => {

        const block = document.createElement("div");

        block.className = segment.allocated
            ? "segment allocated"
            : "segment free";

        block.style.flexGrow = segment.size;

        block.innerHTML = `
            <strong>
                ${segment.allocated ? segment.processId : "FREE"}
            </strong>
            <br>
            ${segment.size} KB
            <br>
            Address: ${segment.start}
        `;

        map.appendChild(block);
    });
}


// Display allocation results
function renderResults() {

    const body = document.getElementById("resultsBody");

    body.innerHTML = "";

    currentState.results.forEach(result => {

        const row = document.createElement("tr");

        const action = result.status === "Allocated"
            ? `<button data-free="${result.processId}">Deallocate</button>`
            : "-";

        row.innerHTML = `
            <td>${result.processId}</td>
            <td>${result.requestedSize} KB</td>
            <td>${result.allocatedSize} KB</td>
            <td>${result.startAddress}</td>
            <td>${result.status}</td>
            <td>${action}</td>
        `;

        body.appendChild(row);
    });

    body.querySelectorAll("[data-free]").forEach(button => {

        button.addEventListener("click", () => {

            const processId = button.dataset.free;

            deallocateProcess(currentState, processId);

            renderAll();
        });
    });
}


// Render everything
function renderAll() {

    renderDashboard();
    renderMemoryMap();
    renderResults();
}


// Run allocation
runBtn.addEventListener("click", () => {

    try {

        const memoryBlocks = getNumbers(memoryInput.value);
        const processSizes = getNumbers(processInput.value);

        const alignment = Number(alignmentInput.value);

        if (!Number.isInteger(alignment) || alignment <= 0) {
            throw new Error("Alignment must be a positive whole number.");
        }

        const algorithm = algorithmInput.value;

        currentState = createMemory(memoryBlocks);

        allocateProcesses(
            currentState,
            processSizes,
            algorithm,
            alignment
        );

        document.getElementById("comparisonBody").innerHTML = "";

        renderAll();

    } catch (error) {

        alert(error.message);
    }
});


// Compare algorithms
compareBtn.addEventListener("click", () => {

    try {

        const memoryBlocks = getNumbers(memoryInput.value);
        const processSizes = getNumbers(processInput.value);

        const alignment = Number(alignmentInput.value);

        if (!Number.isInteger(alignment) || alignment <= 0) {
            throw new Error("Alignment must be a positive whole number.");
        }

        const results = compareAlgorithms(
            memoryBlocks,
            processSizes,
            alignment
        );

        const body = document.getElementById("comparisonBody");

        body.innerHTML = "";

        results.forEach(result => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${result.algorithm}</td>
                <td>${result.successful}</td>
                <td>${result.failed}</td>
                <td>${result.freeMemory} KB</td>
                <td>${result.utilization}%</td>
            `;

            body.appendChild(row);
        });

    } catch (error) {

        alert(error.message);
    }
});


// Reset everything
resetBtn.addEventListener("click", () => {

    memoryInput.value = "100, 200, 300, 400";
    processInput.value = "90, 150, 250, 100";
    algorithmInput.value = "First Fit";
    alignmentInput.value = "4";

    currentState = null;

    document.getElementById("totalMemory").textContent = "0 KB";
    document.getElementById("allocatedMemory").textContent = "0 KB";
    document.getElementById("freeMemory").textContent = "0 KB";
    document.getElementById("utilization").textContent = "0%";
    document.getElementById("internalFrag").textContent = "0 KB";
    document.getElementById("externalFrag").textContent = "0 KB";

    document.getElementById("memoryMap").innerHTML =
        "Run allocation to view memory.";

    document.getElementById("resultsBody").innerHTML = "";

    document.getElementById("comparisonBody").innerHTML = "";
});