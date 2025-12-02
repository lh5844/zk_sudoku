import { solutionBoard, prefilledCells, displayBoard } from "./sudoku_display.js";

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
    const permutatedSolution = permutateBoard(solutionBoard, permutation);
    
    displayBoard(permutatedSolution, "solutionBoardDiv", prefilledCells);
    document.getElementById("proverBoardTitle").textContent = "Permutated Board";

    permuteButton.disabled = true;
});
