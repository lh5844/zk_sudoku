import { solutionBoard, prefilledCells, displayBoard } from "./sudoku_display.js";

let permutatedSolution = null;
let committedCells = [];

// Fisher-Yates array shuffling algorithm for random permutation
function shuffleArray(array){
    for (let i = array.length -1; i > 0; i--){
        const j = Math.floor(Math.random() * (i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// mapping the random permutation onto solution board 
function permutateBoard(board, permutation){
    const mapping = {};
    for (let i = 0; i < 9; i++){
        mapping[i+1] = permutation[i];
    }

    return board.map(row => row.map(cell => mapping[cell]));
}

const permuteButton = document.getElementById("permuteButton");
permuteButton.addEventListener("click", ()=>{
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const permutation = shuffleArray([...digits]);
    permutatedSolution = permutateBoard(solutionBoard, permutation);
    
    displayBoard(permutatedSolution, "solutionBoardDiv", prefilledCells);
    document.getElementById("proverBoardTitle").textContent = "Permutated Board";

    permuteButton.disabled = true;
    commitButton.disabled = false; // can't commit until board is permutated
});

// commitment helpers 
function generateRandomSalt(len=16){
    const bytes = crypto.getRandomValues(new Uint8Array(len));
    // format into hex 
    return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hash(message){
    const buffer = new TextEncoder().encode(message);
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2,"0")).join("");
}

// commitment every cell of permutated solution board
async function commitBoard(board){
    committedCells = [];
    for (let row = 0; row < 9; row++){
        for (let col = 0; col < 9; col++){
            const cell = board[row][col];
            const salt = generateRandomSalt();
            const msg = cell + "|" + salt;
            const hash = await sha256Hash(msg);

            committedCells.push({
                row: row,
                col: col, 
                hash, 
                salt,
                cell: cell
            });
        }
    }
    displayCommitments();
}

function displayCommitments(){
    const box = document.getElementById("commitmentBox");
    box.innerHTML = committedCells.map(c =>
        `(${c.row},${c.col}) → ${c.hash}`
    ).join("<br>");
}

const commitButton = document.getElementById("commitButton");
commitButton.onclick = async () => {
  await commitBoard(permutatedSolution);
  commitButton.disabled = true;
};
