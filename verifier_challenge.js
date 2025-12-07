import { solutionBoard, prefilledCells, displayBoard } from "./sudoku_display.js";
import { committedCells, openBoardCommitmentValues, permutatedSolution, revealedR } from "./prover_commit.js";

document.addEventListener("boardCommitted", () => {
    const chooseButton = document.getElementById("chooseChallenge");
    if (chooseButton) chooseButton.disabled = false; // enable after commitment
});

document.getElementById("chooseChallenge").onclick = async() =>{
    const type = document.getElementById("challengeType").value;
    // maybe dont present this as an option if permutation choice
    const index = parseInt(document.getElementById("challengeIndex").value);

    await handleVerifierChallenge(type, index);
}

async function handleVerifierChallenge(type, index){
    let selected_cells = []
    if (type === "ROW"){
        selected_cells = getRow(index)
    } else if (type === "COL"){
        selected_cells = getColumn(index);
    } else if (type === "SUBTABLE"){
        selected_cells = getSubtable(index);
    }else if (type === "PERMUTATION"){
        selected_cells = getPermutation();
    }
    
    const verifyCells = selected_cells.map(c => [c.row, c.col]); 
    
    let openedBoard = await openBoardCommitmentValues(
        committedCells, permutatedSolution, revealedR, verifyCells
    )
    displayBoard(openedBoard, "verifierBoardDiv", prefilledCells);
}

function getRow(r) {
  return committedCells.filter(c => c.row === r);
}

function getColumn(c) {
  return committedCells.filter(c2 => c2.col === c);
}

function getSubtable(b) {
  const subtableRow = Math.floor(b / 3) * 3;
  const subtableCol = (b % 3) * 3;

  return committedCells.filter(c =>
    Math.floor(c.row / 3) * 3 === subtableRow &&
    Math.floor(c.col / 3) * 3 === subtableCol
  );
}

function getPermutation(){
    return committedCells.filter(c => prefilledCells[c.row][c.col]);
}


