import { solutionBoard, prefilledCells, displayBoard } from "./sudoku_display.js";
import { committedCells } from "./prover_commit.js";

document.addEventListener("boardCommitted", () => {
    const chooseButton = document.getElementById("chooseChallenge");
    if (chooseButton) chooseButton.disabled = false; // enable after commitment
});

document.getElementById("chooseChallenge").onclick = () =>{
    const type = document.getElementById("challengeType").value;
    // maybe dont present this as an option if permutation choice
    const index = parseInt(document.getElementById("challengeIndex").value);

    handleVerifierChallenge(type, index);
}

function handleVerifierChallenge(type, index){
    let selected_cells = []
    if (type === "ROW"){
        selected_cells = getRow(index)
    } else if (type === "COL"){
        selected_cells = getColumn(index);
    } else if (type === "SUBTABLE"){
        selected_cells = getSubtable(index);
    }else if (type === "PERMUTATION"){
        console.log("chose permutation")
    }
    
    console.log(selected_cells)
}

function getRow(r) {
  return committedCells.filter(c => c.row === r);
}

function getColumn(c) {
  return committedCells.filter(c2 => c2.col === c);
}

function getSubtable(b) {
  const boxRow = Math.floor(b / 3) * 3;
  const boxCol = (b % 3) * 3;

  return committedCells.filter(c =>
    Math.floor(c.row / 3) * 3 === boxRow &&
    Math.floor(c.col / 3) * 3 === boxCol
  );
}


