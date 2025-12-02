const initialBoard = [
    [5,3,0, 0,7,0, 0,0,0],
    [6,0,0, 1,9,5, 0,0,0],
    [0,9,8, 0,0,0, 0,6,0],

    [8,0,0, 0,6,0, 0,0,3],
    [4,0,0, 8,0,3, 0,0,1],
    [7,0,0, 0,2,0, 0,0,6],

    [0,6,0, 0,0,0, 2,8,0],
    [0,0,0, 4,1,9, 0,0,5],
    [0,0,0, 0,8,0, 0,7,9]
];

const solutionBoard = [
    [5,3,4, 6,7,8, 9,1,2],
    [6,7,2, 1,9,5, 3,4,8],
    [1,9,8, 3,4,2, 5,6,7],

    [8,5,9, 7,6,1, 4,2,3],
    [4,2,6, 8,5,3, 7,9,1],
    [7,1,3, 9,2,4, 8,5,6],

    [9,6,1, 5,3,7, 2,8,4],
    [2,8,7, 4,1,9, 6,3,5],
    [3,4,5, 2,8,6, 1,7,9]
];

const prefilledCells = initialBoard.map(row => row.map(val => val !== 0));

function displayBoard(board, containerID, prefilledCells){
    const container = document.getElementById(containerID)
    let html = '<table>';
    for (let i = 0; i < 9; i++) {
        html += '<tr>';
        for (let j = 0; j < 9; j++) {
            let val = board[i][j];
            
            if (val == 0){ // zero values should be blank
                val = '';
            }

            let cellClass = '';
            // allow prefilled cells in initial board to be visualized better
            if(prefilledCells && prefilledCells[i][j]){
                cellClass = 'prefilled'
            }
            
            // bolder lines for the overall 3x3
            let borderClass = '';
            if (i % 3 === 0) borderClass += ' top';
            if (i === 8) borderClass += ' bottom';
            if (j % 3 === 0) borderClass += ' left';
            if (j === 8) borderClass += ' right';

            html += `<td class="${cellClass}${borderClass}">${val}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    container.innerHTML = html;
}

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

displayBoard(initialBoard, "initialBoardDiv", prefilledCells);
displayBoard(solutionBoard, 'solutionBoardDiv', prefilledCells);

// initally empty board for verifier 
const emptyBoard = initialBoard.map(row=> row.map(_ => 0));
displayBoard(emptyBoard, "verifierBoardDiv", null);

const permuteButton = document.getElementById("permuteButton");
permuteButton.addEventListener("click", ()=>{
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const permutation = shuffleArray([...digits]);
    const permutatedSolution = permutateBoard(solutionBoard, permutation);
    
    displayBoard(permutatedSolution, "solutionBoardDiv", prefilledCells);
    document.getElementById("proverBoardTitle").textContent = "Permutated Board";

    permuteButton.disabled = true;
});


