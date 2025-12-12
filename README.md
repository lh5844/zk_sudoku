# zk_sudoku

JavaScript Implementation of the Zero Knowledge 9x9 Sudoku Protocol 

## Overview of ZK Protocol
- both prover & verifier sees initial board with prefilled cells
- prover has power to solve board
- goal: prover proves to verifier they know solution to board without revealing solution

### Steps
1) Prover randomly permutes solution board and commits every cell
2) Prover sends commitment string to Verifier
3) Verifier chooses 1 of 4 challenges: open row, col, subtable, or permutation mapping of prefilled cells
4) Prover reveals cells corresponding to verifier's choice/challenge
5) Verifier verifies commitment string and message
6) Keep going to next round from the top
7) Soundness Error is (1 - 1/28)^rounds

### Properties 
**Zero Knowledge**
- Completeness
  - honest prover can convince verifier that revealed cell is true (distinct numbers and verify commitment string)
- Soundness
  - cheating prover would be exposed in 1 out of 28 choices (9 rows, 9 cols, 9 subtables + 1 permutation mapping)
  - soundness error is (1 - 1/28)^rounds
  
**Commitment Scheme**
- Binding
  - if it wasn't binding, that means you could find two different ways to open commitment, which implies you could find a collision but commitment uses collision-resistant hash function (SHA 256)
- Hiding
  - probability distributions of Commit(m1) and Commit(m2) is computationally indistinguishable
  - Commitment string = (y, h)
    - y = collision-resistant hash (r)
    - h = universal hash function chosen uniformly at random from H (universal hash family)
    - Probability of y, h is independent of msg due to random r value and random h chosen from H
    - nothing about msg is leaked so difference between Commit(m1) and Commit(m2) is < 2^-k (really really small) 

## Features: 
- HTML Interactive Protocol of Prover & Verifier View at: https://lh5844.github.io/zk_sudoku/
- Commitment Scheme Choice: Halevi-Micali Collision-Resistant Commitment from this paper: https://dl.acm.org/doi/10.5555/646761.706019
  - Halevi Micali Commitment Scheme is provably secure when a computationally bounded party commits strings to an unbounded party
  - unlike the common approach of appending salt to msg and hashing
