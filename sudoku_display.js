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

export const solutionBoard = [
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

export const prefilledCells = initialBoard.map(row => row.map(val => val !== 0));

export function displayBoard(board, containerID, prefilledCells, highlightedCells=null){
    const container = document.getElementById(containerID)
    let html = '<table>';
    for (let row = 0; row < 9; row++) {
        html += '<tr>';
        for (let col = 0; col < 9; col++) {
            let val = board[row][col];
            
            if (val == 0){ // zero values should be blank
                val = '';
            }

            let cellClass = '';
            // allow prefilled cells in initial board to be visualized better
            if(prefilledCells && prefilledCells[row][col]){
                cellClass = 'prefilled'
            }
            
            // highlighted cells for when verifier makes challenge
            if (highlightedCells && highlightedCells[row][col]){
                cellClass += 'highlighted';
            }
            
            // bolder lines for the overall 3x3
            let borderClass = '';
            if (row % 3 === 0) borderClass += ' top';
            if (row === 8) borderClass += ' bottom';
            if (col % 3 === 0) borderClass += ' left';
            if (col === 8) borderClass += ' right';

            html += `<td class="${cellClass}${borderClass}">${val}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    container.innerHTML = html;
}

displayBoard(initialBoard, "initialBoardDiv", prefilledCells);
displayBoard(solutionBoard, 'solutionBoardDiv', prefilledCells);

// initally empty board for verifier 
export const emptyBoard = initialBoard.map(row=> row.map(_ => 0));
displayBoard(emptyBoard, "verifierBoardDiv", null);