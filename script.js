// Find HTML elements using their IDs.
const blocksInput = document.getElementById("blocks");
const processesInput = document.getElementById("processes");
const algorithmInput = document.getElementById("algorithm");

const runButton = document.getElementById("runButton");
const compareButton = document.getElementById("compareButton");
const messageBox = document.getElementById("message");

// Show a status message and style it as success or error.
function setMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = type;
}

// Convert comma-separated input into an array of positive numbers.
function readNumbers(input) {
  const text = input.trim();

  if (text === "") {
    throw new Error("Please enter the required memory sizes.");
  }

  const parts = text.split(",");

  const numbers = parts.map(part => {
    const value = part.trim();

    if (value === "" || !/^\d+$/.test(value)) {
      throw new Error("Enter positive whole numbers separated by commas.");
    }

    const number = Number(value);

    if (!Number.isSafeInteger(number) || number <= 0) {
      throw new Error("Every size must be a positive whole number.");
    }

    return number;
  });

  return numbers;
}

// Run First Fit, Best Fit or Worst Fit.
function allocateMemory(blockSizes, processSizes, algorithm) {
  // Keep track of remaining space in each block.
  const remaining = [...blockSizes];

  // Store each process's result.
  const results = [];

  processSizes.forEach((processSize, index) => {
    let selectedBlock = -1;

    if (algorithm === "first") {
      // Choose the first block that can fit the process.
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i] >= processSize) {
          selectedBlock = i;
          break;
        }
      }
    } else if (algorithm === "best") {
      // Choose the smallest block that can fit the process.
      for (let i = 0; i < remaining.length; i++) {
        if (
          remaining[i] >= processSize &&
          (selectedBlock === -1 || remaining[i] < remaining[selectedBlock])
        ) {
          selectedBlock = i;
        }
      }
    } else if (algorithm === "worst") {
      // Choose the largest block that can fit the process.
      for (let i = 0; i < remaining.length; i++) {
        if (
          remaining[i] >= processSize &&
          (selectedBlock === -1 || remaining[i] > remaining[selectedBlock])
        ) {
          selectedBlock = i;
        }
      }
    }

    if (selectedBlock !== -1) {
      // Reduce the remaining space in the selected block.
      remaining[selectedBlock] -= processSize;

      results.push({
        process: index + 1,
        size: processSize,
        block: selectedBlock + 1,
        status: "Allocated"
      });
    } else {
      results.push({
        process: index + 1,
        size: processSize,
        block: null,
        status: "Failed"
      });
    }
  });

  return {
    results,
    remaining,
    blockSizes: [...blockSizes]
  };
}

// Calculate the metrics and prepare the display data.
function calculateMetrics(simulation) {
  const totalMemory = simulation.blockSizes.reduce(
    (sum, size) => sum + size,
    0
  );

  const freeMemory = simulation.remaining.reduce(
    (sum, size) => sum + size,
    0
  );

  const allocatedMemory = totalMemory - freeMemory;

  const utilization =
    totalMemory > 0 ? (allocatedMemory / totalMemory) * 100 : 0;

  const successful = simulation.results.filter(
    result => result.status === "Allocated"
  ).length;

  const failed = simulation.results.length - successful;

  return {
    totalMemory,
    allocatedMemory,
    freeMemory,
    utilization,
    successful,
    failed
  };
}

// Display metric cards.
function displayMetrics(metrics) {
  document.getElementById("totalMemory").textContent =
    `${metrics.totalMemory} KB`;

  document.getElementById("allocatedMemory").textContent =
    `${metrics.allocatedMemory} KB`;

  document.getElementById("freeMemory").textContent =
    `${metrics.freeMemory} KB`;

  document.getElementById("utilization").textContent =
    `${metrics.utilization.toFixed(2)}%`;
}

// Display the process allocation table.
function displayResults(results) {
  const table = document.getElementById("resultsTable");
  table.replaceChildren();

  results.forEach(result => {
    const row = document.createElement("tr");

    const values = [
      `P${result.process}`,
      `${result.size} KB`,
      result.block === null ? "None" : `Block ${result.block}`,
      result.status
    ];

    values.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    table.appendChild(row);
  });
}

// Display the colored memory map.
function displayMemoryMap(simulation) {
  const map = document.getElementById("memoryMap");
  map.replaceChildren();

  simulation.blockSizes.forEach((size, index) => {
    const remaining = simulation.remaining[index];
    const allocated = size - remaining;

    const block = document.createElement("div");
    block.className =
      "memory-block " + (allocated > 0 ? "allocated" : "free");

    const title = document.createElement("strong");
    title.textContent = `Block ${index + 1}`;

    const original = document.createElement("p");
    original.textContent = `Total: ${size} KB`;

    const used = document.createElement("p");
    used.textContent = `Used: ${allocated} KB`;

    const free = document.createElement("p");
    free.textContent = `Free: ${remaining} KB`;

    block.append(title, original, used, free);
    map.appendChild(block);
  });
}

// Read inputs and run the selected algorithm.
function runSimulation() {
  try {
    const blockSizes = readNumbers(blocksInput.value);
    const processSizes = readNumbers(processesInput.value);

    const simulation = allocateMemory(
      blockSizes,
      processSizes,
      algorithmInput.value
    );

    const metrics = calculateMetrics(simulation);

    displayMetrics(metrics);
    displayResults(simulation.results);
    displayMemoryMap(simulation);

    setMessage("Simulation completed successfully.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

// Compare all three algorithms using the same inputs.
function compareAlgorithms() {
  try {
    const blockSizes = readNumbers(blocksInput.value);
    const processSizes = readNumbers(processesInput.value);

    const algorithms = [
      { key: "first", name: "First Fit" },
      { key: "best", name: "Best Fit" },
      { key: "worst", name: "Worst Fit" }
    ];

    const table = document.getElementById("comparisonTable");
    table.replaceChildren();

    algorithms.forEach(algorithm => {
      const simulation = allocateMemory(
        blockSizes,
        processSizes,
        algorithm.key
      );

      const metrics = calculateMetrics(simulation);

      const row = document.createElement("tr");

      const values = [
        algorithm.name,
        metrics.successful,
        metrics.failed,
        `${metrics.utilization.toFixed(2)}%`
      ];

      values.forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      table.appendChild(row);
    });

    setMessage("All three algorithms compared successfully.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

// Connect buttons to their functions.
runButton.addEventListener("click", runSimulation);
compareButton.addEventListener("click", compareAlgorithms);
