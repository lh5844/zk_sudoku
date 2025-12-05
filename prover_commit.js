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
    commitButton.disabled = false; // can commit after board is permutated
});

// commitment helpers 
function generateRandomSalt(len=16){
    const bytes = crypto.getRandomValues(new Uint8Array(len));
    // format into hex 
    return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

// commitment helpers 
// L = 4k + 2n + 4
// k security parameter, n is message length (1 sudoku cell)
// L = 4*256 + 2*4 + 4  = 1036 
// do L as small value for now
function generateRandomBits(L){
    let result = '';
    for (let i = 0; i < L; i++){
        result += Math.random() < 0.5 ? '0':'1';
    }
    return result; 
}

// random matrix A (k x L)
function randomMatrix(k, L){
    const A = [];
    for(let i = 0; i < k; i++){
        const row = [];
        for(let j = 0; j < L; j++){
            // random small integers from  0-9
            row.push(Math.floor(Math.random()*10))
        }
        A.push(row);
    }

    return A;
}

// multiple matrix A (k x L) by vector r (L)
function multiplyMatrixByVector(A, r){
    const result = [];
    for (let i = 0; i < A.length; i++){
        let sum = 0;
        for (let j = 0; j < r.length; j++) {
            sum += A[i][j] * r.charCodeAt(j);
        }
        result.push(sum % 256);
    }
    return result;
}

// compute b = s - A*r (mod 256) 
function computeB(s, Ar){
    const b = [];
    for (let i = 0; i < s.length; i++){
        b.push((s[i] - Ar[i] + 256) % 256);
    }

    return b;
}

// universal hash function: h(r) = A*r + b
function universalHashFunc(A, r, b){
    const k = b.length;
    const h_r = [];
    for (let i = 0; i < k; i++) {
        let sum = 0;
        for (let j = 0; j < r.length; j++) {
            sum += A[i][j] * r.charCodeAt(j);
        }
        h_r.push((sum + b[i]) % 256);
    }
    return h_r;
}

async function sha256Hash(message){
    const buffer = new TextEncoder().encode(message);
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2,"0")).join("");
}

// commitment every cell of permutated solution board
async function commitBoard(board){
    committedCells = [];

    // small values for demo purposes
    const k  = 4; // security param
    const L = 16; // length of r per cell

    for (let row = 0; row < 9; row++){
        for (let col = 0; col < 9; col++){
            const cell = board[row][col];

            // k bit string s = MD(message)
            const sFull = await sha256Hash(cell.toString());
            const s = [];
            for (let i = 0; i < k; i++) {
                // get first k bytes
                s.push(parseInt(sFull.slice(i*2, i*2+2), 16)); 
            }

            // pick random r 
            const r = generateRandomBits(L);
            // pick random matrix A
            const A = randomMatrix(k, L);
            // compute b so that h(r) = s
            const Ar = multiplyMatrixByVector(A, r);
            const b = computeB(s, Ar);

            // y = hash(r) to hide so receiver cant figure out r or msg from commitment alone
            const y = await sha256Hash(r);

            // commitment string is (universal hash function, y)
            // universal hash function reconstructed from A, b, r
            // decommitment string = r 
            committedCells.push({
                row,
                col,
                A, 
                b,
                y, 
                r,
                cell
            });
        }
    }
    return committedCells;
}

function formatHashToBoard(committedCells){
    const board = Array.from({length: 9}, () => Array(9).fill(""));;
    
    for (const cell of committedCells){
        board[cell.row][cell.col] = cell.y;
    }
    return board
}

function displayCommitments(committedCells, containerID){
    const commitedBoard = formatHashToBoard(committedCells)
    displayBoard(commitedBoard, containerID, prefilledCells);
}

const commitButton = document.getElementById("commitButton");
commitButton.onclick = async () => {
    committedCells = await commitBoard(permutatedSolution);
    displayCommitments(committedCells, "commitedBoardDiv");
    commitButton.disabled = true;
    openButton.disabled = false; // can only open after committed
};

const openButton = document.getElementById("openButton");
openButton.onclick = async () =>{
    const revealedR = committedCells.map(c=>c.r)
    const openedBoard = await openBoardCommitmentValues(committedCells, permutatedSolution, revealedR);
    displayBoard(openedBoard, "openBoardDiv", prefilledCells)
    openButton.disabled = true;
}

async function verifyCellCommitment(cellCommitment, revealedCell, r){
    const {A, b, y} = cellCommitment; 

    //check y = MD(r) to confirm r was used
    const check_y = await sha256Hash(r);
    if (check_y !== y){
        // return false; 
        return null; 
    }

    // check h(r) = MD(m) = s
    // confirm universal hash func maps r to correct s
    const sFull = await sha256Hash(revealedCell.toString());

    const k = b.length; 
    const s = []; 
    for (let i = 0; i < k; i++) {
        s.push(parseInt(sFull.slice(i*2, i*2+2), 16)); 
    }

    // reconstruct h(r) = A*r + b
    const h_r = universalHashFunc(A, r, b);
    // check h(r) = s which would mean s = MD(m) and actually hashed real msg
    for (let i = 0; i < k; i++){
        if(h_r[i] !== s[i]){
            // return false;
            return null; 
        } 
    }

    //return true; 
    return revealedCell;
}

async function  openBoardCommitmentValues(committedCells, revealedBoard, revealedR){
    const openedBoard = Array.from({ length: 9 }, () => Array(9).fill(null));

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const idx = row * 9 + col;
            const cellCommitment = committedCells[idx];
            const revealedValue = revealedBoard[row][col];
            const r = revealedR[idx];

            const value = await verifyCellCommitment(cellCommitment, revealedValue, r);
            openedBoard[row][col] = value; // null if verification fails
        }
    }

    return openedBoard;
}
