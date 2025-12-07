import { emptyBoard, solutionBoard, prefilledCells, displayBoard } from "./sudoku_display.js";
import { committedCells, openBoardCommitmentValues, permutatedSolution, revealedR } from "./prover_commit.js";

let round = 0; 
function updateRound(){
    document.getElementById("roundNumber").textContent = round; 
    const n = 3; // 9x9 sudoku with 3x3 small subtables 
    const totalChallenges = 3*n*n + 1; // row, col, subtable + perm
    const soundnessError = Math.pow(1 - 1/totalChallenges, round);
    document.getElementById("soundnessError").textContent = soundnessError.toFixed(6); 
}

document.addEventListener("boardCommitted", () => {
    const chooseButton = document.getElementById("chooseChallenge");
    if (chooseButton) chooseButton.disabled = false; // enable after commitment
});

document.getElementById("chooseChallenge").onclick = async() =>{
    const type = document.getElementById("challengeType").value;
    // maybe dont present this as an option if permutation choice
    const index = parseInt(document.getElementById("challengeIndex").value);

    let openedBoard = await handleVerifierChallenge(type, index);
    displayBoard(openedBoard, "verifierBoardDiv", prefilledCells);

    // can't choose another challenge until a new round
    document.getElementById("chooseChallenge").disabled = true;
    document.getElementById("verifyChallenge").disabled = false; 
}

document.getElementById("verifyChallenge").onclick = () =>{
    // need to actually verify the board 
    round += 1; 
    updateRound(); 

    document.getElementById("verifyChallenge").disabled = true;
    document.getElementById("nextRound").disabled = false;
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

    return openedBoard;
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

function clearBoards(){ 
    const openBoardDiv = document.getElementById("openBoardDiv");
    const commitedBoardDiv = document.getElementById("commitedBoardDiv");

    if (openBoardDiv) openBoardDiv.innerHTML = "";
    if (commitedBoardDiv) commitedBoardDiv.innerHTML = "";
}

function startNewRound(){
    // go through protocol again from permutation 
    const permuteButton = document.getElementById("permuteButton");
    permuteButton.disabled = false; 

    clearBoards(); 

    // reset verifier board 
    displayBoard(emptyBoard, "verifierBoardDiv", null);
    displayBoard(solutionBoard, "solutionBoardDiv", prefilledCells);

}

const nextRoundButton = document.getElementById("nextRound");
nextRoundButton.onclick = () => {
    startNewRound();
}


