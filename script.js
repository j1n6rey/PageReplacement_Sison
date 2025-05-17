// Event listener for the "Run Simulation" button
document.getElementById('runButton').addEventListener('click', runSimulation);

// Main function that runs when button is clicked
function runSimulation() {
  const outputArea = document.getElementById('outputArea'); // output area element
  outputArea.textContent = ''; // clear previous output

  const frameInput = document.getElementById('frameInput');
  const frames = parseInt(frameInput.value, 10); // parse input to integer

  // Check if input is valid
  if (isNaN(frames) || frames <= 0) {
    outputArea.textContent = '❌ Please enter a valid number for frames.';
    return;
  }

  // Generate a reference string of 20 random pages (0–9)
  const reference = generateReferenceString(20, 10);
  outputArea.textContent += `📄 Page Reference String:\n${reference.join(', ')}\n\n`;

  // Run FIFO algorithm
  outputArea.textContent += '=== 📦 FIFO Simulation ===\n';
  const fifoFaults = fifo(reference, frames, outputArea);
  outputArea.textContent += `Total Page Faults: ${fifoFaults}\n\n`;

  // Run LRU algorithm
  outputArea.textContent += '=== 📦 LRU Simulation ===\n';
  const lruFaults = lru(reference, frames, outputArea);
  outputArea.textContent += `Total Page Faults: ${lruFaults}\n\n`;

  // Run Optimal algorithm
  outputArea.textContent += '=== 📦 Optimal Simulation ===\n';
  const optimalFaults = optimal(reference, frames, outputArea);
  outputArea.textContent += `Total Page Faults: ${optimalFaults}\n\n`;
}

// Generates an array of random integers for the page reference string
function generateReferenceString(length, range) {
  const reference = [];
  for (let i = 0; i < length; i++) {
    reference.push(Math.floor(Math.random() * range)); // random number from 0 to range-1
  }
  return reference;
}

// FIFO Algorithm Implementation
function fifo(ref, frameCount, outputArea) {
  const frames = Array(frameCount).fill(null); // initialize frame array
  const frameHistory = Array.from({ length: frameCount }, () => []); // track history
  let faults = 0;
  let pointer = 0;

  ref.forEach(page => {
    let fault = false;

    // If page not in memory
    if (!frames.includes(page)) {
      fault = true;
      frames[pointer] = page;
      pointer = (pointer + 1) % frameCount;
      faults++;
    }

    // Record history
    frames.forEach((frame, i) => {
      frameHistory[i].push(fault ? (frame !== null ? frame.toString() : ' ') : ' ');
    });
  });

  displayFrameHistory(ref, frameHistory, outputArea);
  return faults;
}

// LRU Algorithm Implementation
function lru(ref, frameCount, outputArea) {
  const frames = [];
  const lastUsed = new Map(); // track last use
  const frameHistory = Array.from({ length: frameCount }, () => []);
  let faults = 0;

  ref.forEach((page, index) => {
    let fault = false;

    if (!frames.includes(page)) {
      fault = true;

      if (frames.length < frameCount) {
        frames.push(page);
      } else {
        // Find least recently used page
        let lruPage = frames.reduce((a, b) => 
          (lastUsed.get(a) ?? -1) < (lastUsed.get(b) ?? -1) ? a : b
        );
        frames[frames.indexOf(lruPage)] = page;
      }

      faults++;
    }

    lastUsed.set(page, index); // update last used index

    const current = [...frames];
    while (current.length < frameCount) current.push(null);

    current.forEach((frame, i) => {
      frameHistory[i].push(fault ? (frame !== null ? frame.toString() : ' ') : ' ');
    });
  });

  displayFrameHistory(ref, frameHistory, outputArea);
  return faults;
}

// Optimal Algorithm Implementation
function optimal(ref, frameCount, outputArea) {
  const frames = [];
  const frameHistory = Array.from({ length: frameCount }, () => []);
  let faults = 0;

  ref.forEach((page, index) => {
    let fault = false;

    if (!frames.includes(page)) {
      fault = true;

      if (frames.length < frameCount) {
        frames.push(page);
      } else {
        // Determine best page to replace
        const indexToReplace = findOptimalPageToReplace(frames, ref, index);
        frames[indexToReplace] = page;
      }

      faults++;
    }

    const current = [...frames];
    while (current.length < frameCount) current.push(null);

    current.forEach((frame, i) => {
      frameHistory[i].push(fault ? (frame !== null ? frame.toString() : ' ') : ' ');
    });
  });

  displayFrameHistory(ref, frameHistory, outputArea);
  return faults;
}

// Helper for Optimal: find which page will not be used for the longest time
function findOptimalPageToReplace(frames, ref, currentIndex) {
  const futureUse = new Map();
  frames.forEach(p => futureUse.set(p, Infinity));

  for (let i = currentIndex + 1; i < ref.length; i++) {
    const page = ref[i];
    if (futureUse.has(page) && futureUse.get(page) === Infinity) {
      futureUse.set(page, i);
    }
  }

  let farthest = -1;
  let indexToReplace = -1;

  frames.forEach((page, i) => {
    const nextUse = futureUse.get(page);
    if (nextUse > farthest) {
      farthest = nextUse;
      indexToReplace = i;
    }
  });

  return indexToReplace;
}

// Displays the table of frame states across time with separators '|'
function displayFrameHistory(ref, frameHistory, outputArea) {
    const colWidth = 4; // Adjust the column width for better alignment
  
    // Initialize output
    let output = '';
  
    // Header with page reference values
    output += 'Ref Str: ';
    ref.forEach(page => {
      output += `${page.toString().padStart(colWidth)} | `;
    });
    output += '\n';
  
    // Draw a separator line under the reference string
    output += '-'.repeat(colWidth * ref.length + 3.8 * (ref.length - 1)) + '\n';
  
    // For each frame, display its state at each time step
    for (let i = 0; i < frameHistory.length; i++) {
      output += `Frame ${i + 1}: `;
      frameHistory[i].forEach(val => {
        output += `${(val !== ' ' ? val : ' ').toString().padStart(colWidth)} | `;
      });
      output += '\n';
    }
  
    // Display the result in the output area
    outputArea.textContent += output;
  }
  

