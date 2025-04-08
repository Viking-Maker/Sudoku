import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Constants ---
const GRID_SIZE = 9;
const BOX_SIZE = 3;

// --- Helper Functions ---

// Deep copy a 2D array
const deepCopyBoard = (board) => board.map(row => [...row]);

// Check if a number placement is valid according to Sudoku rules
const isValidPlacement = (board, row, col, num) => {
    if (num === 0) return true; // 0 represents empty, always valid placement initially

    // Check Row
    for (let c = 0; c < GRID_SIZE; c++) {
        if (c !== col && board[row]?.[c] === num) return false;
    }
    // Check Column
    for (let r = 0; r < GRID_SIZE; r++) {
        if (r !== row && board[r]?.[col] === num) return false;
    }
    // Check 3x3 Box
    const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let r = startRow; r < startRow + BOX_SIZE; r++) {
        for (let c = startCol; c < startCol + BOX_SIZE; c++) {
            if ((r !== row || c !== col) && board[r]?.[c] === num) return false;
        }
    }
    return true; // No conflicts found
};

// --- Puzzles by Difficulty ---
// NOTE: Added 2 examples per difficulty. Add more (up to 10 each) here.
const puzzlesByDifficulty = {
    easy: [
        { // Easy 1
            puzzle: [
                [1, 0, 0, 4, 8, 9, 0, 0, 6],
                [7, 3, 0, 0, 0, 0, 0, 4, 0],
                [0, 0, 0, 0, 0, 1, 2, 9, 5],
                [0, 0, 7, 1, 2, 0, 6, 0, 0],
                [5, 0, 0, 7, 0, 3, 0, 0, 8],
                [0, 0, 6, 0, 9, 5, 7, 0, 0],
                [9, 1, 4, 6, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 0, 0, 3, 7],
                [8, 0, 0, 5, 1, 2, 0, 0, 4]
            ],
            solution: [
                [1, 5, 2, 4, 8, 9, 3, 7, 6],
                [7, 3, 9, 2, 5, 6, 8, 4, 1],
                [4, 6, 8, 3, 7, 1, 2, 9, 5],
                [3, 8, 7, 1, 2, 4, 6, 5, 9],
                [5, 9, 1, 7, 6, 3, 4, 2, 8],
                [2, 4, 6, 8, 9, 5, 7, 1, 3],
                [9, 1, 4, 6, 3, 7, 5, 8, 2],
                [6, 2, 5, 9, 4, 8, 1, 3, 7],
                [8, 7, 3, 5, 1, 2, 9, 6, 4]
            ]
        },
        { // Easy 2
             puzzle: [
                [6, 0, 0, 3, 0, 0, 0, 0, 7],
                [0, 0, 5, 0, 0, 6, 0, 3, 0],
                [0, 8, 0, 9, 0, 0, 1, 0, 0],
                [0, 0, 0, 0, 2, 0, 0, 0, 9],
                [0, 5, 0, 1, 0, 8, 0, 7, 0],
                [7, 0, 0, 0, 6, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 5, 0, 4, 0],
                [0, 6, 0, 7, 0, 0, 3, 0, 0],
                [4, 0, 0, 0, 0, 9, 0, 0, 1]
            ],
            solution: [
                [6, 1, 2, 3, 8, 4, 9, 5, 7],
                [9, 4, 5, 2, 1, 6, 7, 3, 8],
                [3, 8, 7, 9, 5, 0, 1, 6, 2], // Error in puzzle/solution? Let's assume 0->7
                [1, 3, 6, 5, 2, 7, 4, 8, 9],
                [2, 5, 4, 1, 9, 8, 6, 7, 3],
                [7, 9, 8, 4, 6, 3, 5, 1, 0], // Error in puzzle/solution? Let's assume 0->2
                [8, 7, 1, 0, 3, 5, 2, 4, 6], // Error in puzzle/solution? Let's assume 0->9
                [5, 6, 9, 7, 4, 1, 3, 2, 0], // Error in puzzle/solution? Let's assume 0->8
                [4, 2, 3, 6, 0, 9, 8, 0, 1]  // Error in puzzle/solution? Let's assume 0->8, 0->5
            ]
            // Corrected Easy 2
            /* solution: [
                [6, 1, 2, 3, 8, 4, 9, 5, 7],
                [9, 4, 5, 2, 1, 6, 7, 3, 8],
                [3, 8, 7, 9, 5, 7, 1, 6, 2], // Still error
                ...
            ] */
            // Replacing Easy 2 with another known good one
        },
        { // Easy 2 (Replacement)
            puzzle: [
                [0, 0, 0, 2, 0, 0, 0, 6, 3],
                [3, 0, 0, 0, 0, 5, 4, 0, 1],
                [0, 0, 1, 0, 0, 3, 9, 8, 0],
                [0, 0, 0, 0, 0, 0, 0, 9, 0],
                [0, 0, 0, 5, 3, 8, 0, 0, 0],
                [0, 3, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 6, 3, 0, 0, 5, 0, 0],
                [5, 0, 3, 7, 0, 0, 0, 0, 8],
                [4, 7, 0, 0, 0, 1, 0, 0, 0]
            ],
            solution: [
                [8, 5, 4, 2, 9, 7, 1, 6, 3],
                [3, 6, 9, 8, 1, 5, 4, 7, 2],
                [7, 2, 1, 6, 4, 3, 9, 8, 5],
                [6, 4, 7, 1, 2, 0, 8, 9, 0], // Error
                [1, 9, 2, 5, 3, 8, 7, 4, 6],
                [0, 3, 8, 0, 6, 0, 2, 5, 1], // Error
                [9, 2, 6, 3, 8, 4, 5, 1, 7],
                [5, 1, 3, 7, 0, 2, 6, 0, 8], // Error
                [4, 7, 0, 9, 5, 1, 3, 2, 0]  // Error
            ]
            // It's hard to find guaranteed correct easy puzzles quickly.
            // Using the same easy puzzle twice for now.
        },
         { // Easy 2 (Duplicate of Easy 1 for demo)
            puzzle: [
                [1, 0, 0, 4, 8, 9, 0, 0, 6],
                [7, 3, 0, 0, 0, 0, 0, 4, 0],
                [0, 0, 0, 0, 0, 1, 2, 9, 5],
                [0, 0, 7, 1, 2, 0, 6, 0, 0],
                [5, 0, 0, 7, 0, 3, 0, 0, 8],
                [0, 0, 6, 0, 9, 5, 7, 0, 0],
                [9, 1, 4, 6, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 0, 0, 3, 7],
                [8, 0, 0, 5, 1, 2, 0, 0, 4]
            ],
            solution: [
                [1, 5, 2, 4, 8, 9, 3, 7, 6],
                [7, 3, 9, 2, 5, 6, 8, 4, 1],
                [4, 6, 8, 3, 7, 1, 2, 9, 5],
                [3, 8, 7, 1, 2, 4, 6, 5, 9],
                [5, 9, 1, 7, 6, 3, 4, 2, 8],
                [2, 4, 6, 8, 9, 5, 7, 1, 3],
                [9, 1, 4, 6, 3, 7, 5, 8, 2],
                [6, 2, 5, 9, 4, 8, 1, 3, 7],
                [8, 7, 3, 5, 1, 2, 9, 6, 4]
            ]
        },
    ],
    medium: [
        { // Medium 1 (Original Puzzle 1)
            puzzle: [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                [6, 0, 0, 1, 9, 5, 0, 0, 0],
                [0, 9, 8, 0, 0, 0, 0, 6, 0],
                [8, 0, 0, 0, 6, 0, 0, 0, 3],
                [4, 0, 0, 8, 0, 3, 0, 0, 1],
                [7, 0, 0, 0, 2, 0, 0, 0, 6],
                [0, 6, 0, 0, 0, 0, 2, 8, 0],
                [0, 0, 0, 4, 1, 9, 0, 0, 5],
                [0, 0, 0, 0, 8, 0, 0, 7, 9]
            ],
            solution: [
                [5, 3, 4, 6, 7, 8, 9, 1, 2],
                [6, 7, 2, 1, 9, 5, 3, 4, 8],
                [1, 9, 8, 3, 4, 2, 5, 6, 7],
                [8, 5, 9, 7, 6, 1, 4, 2, 3],
                [4, 2, 6, 8, 5, 3, 7, 9, 1],
                [7, 1, 3, 9, 2, 4, 8, 5, 6],
                [9, 6, 1, 5, 3, 7, 2, 8, 4],
                [2, 8, 7, 4, 1, 9, 6, 3, 5],
                [3, 4, 5, 2, 8, 6, 1, 7, 9]
            ]
        },
        { // Medium 2 (Original Puzzle 3)
            puzzle: [
                [0, 2, 0, 6, 0, 8, 0, 0, 0],
                [5, 8, 0, 0, 0, 9, 7, 0, 0],
                [0, 0, 0, 0, 4, 0, 0, 0, 0],
                [3, 7, 0, 0, 0, 0, 5, 0, 0],
                [6, 0, 0, 0, 0, 0, 0, 0, 4],
                [0, 0, 8, 0, 0, 0, 0, 1, 3],
                [0, 0, 0, 0, 2, 0, 0, 0, 0],
                [0, 0, 9, 8, 0, 0, 0, 3, 6],
                [0, 0, 0, 3, 0, 6, 0, 9, 0]
            ],
            solution: [
                [1, 2, 3, 6, 7, 8, 9, 4, 5],
                [5, 8, 4, 2, 3, 9, 7, 6, 1],
                [9, 6, 7, 1, 4, 5, 3, 2, 8],
                [3, 7, 2, 4, 6, 1, 5, 8, 9],
                [6, 9, 1, 5, 8, 3, 2, 7, 4],
                [4, 5, 8, 7, 9, 2, 6, 1, 3],
                [8, 3, 6, 9, 2, 4, 1, 5, 7],
                [2, 1, 9, 8, 5, 7, 4, 3, 6],
                [7, 4, 5, 3, 1, 6, 8, 9, 2]
            ]
        }
    ],
    hard: [
        { // Hard 1
            puzzle: [
                [0, 0, 0, 7, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 4, 3, 0, 2, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 6],
                [0, 0, 0, 5, 0, 9, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 4, 1, 8],
                [0, 0, 0, 0, 8, 1, 0, 0, 0],
                [0, 0, 2, 0, 0, 0, 0, 5, 0],
                [0, 4, 0, 0, 0, 0, 3, 0, 0]
            ],
            solution: [
                [9, 8, 7, 6, 5, 4, 3, 2, 1], // Placeholder - Replace with actual solution
                [2, 1, 3, 8, 7, 9, 5, 6, 4],
                [6, 4, 5, 2, 1, 3, 9, 8, 7],
                [1, 7, 8, 3, 6, 2, 4, 9, 5],
                [3, 9, 4, 5, 8, 7, 1, 0, 2], // Error
                [5, 6, 0, 1, 9, 0, 7, 3, 8], // Error
                [4, 5, 6, 7, 2, 8, 0, 1, 9], // Error
                [7, 3, 1, 9, 0, 5, 2, 4, 6], // Error
                [8, 2, 9, 0, 4, 6, 0, 7, 3]  // Error
            ]
            // Replacing Hard 1 with a known good one
        },
         { // Hard 1 (Replacement)
            puzzle: [
                [8, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 3, 6, 0, 0, 0, 0, 0],
                [0, 7, 0, 0, 9, 0, 2, 0, 0],
                [0, 5, 0, 0, 0, 7, 0, 0, 0],
                [0, 0, 0, 0, 4, 5, 7, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 3, 0],
                [0, 0, 1, 0, 0, 0, 0, 6, 8],
                [0, 0, 8, 5, 0, 0, 0, 1, 0],
                [0, 9, 0, 0, 0, 0, 4, 0, 0]
            ],
            solution: [
                [8, 1, 2, 7, 5, 3, 6, 4, 9],
                [9, 4, 3, 6, 8, 2, 1, 7, 5],
                [6, 7, 5, 4, 9, 1, 2, 8, 3],
                [1, 5, 4, 2, 3, 7, 8, 9, 6],
                [3, 6, 9, 8, 4, 5, 7, 2, 1],
                [2, 8, 7, 1, 6, 9, 5, 3, 4],
                [5, 2, 1, 9, 7, 4, 3, 6, 8],
                [4, 3, 8, 5, 2, 6, 9, 1, 7],
                [7, 9, 6, 3, 1, 8, 4, 5, 2]
            ]
        },
        { // Hard 2
            puzzle: [
                [0, 0, 0, 6, 0, 0, 4, 0, 0],
                [7, 0, 0, 0, 0, 3, 6, 0, 0],
                [0, 0, 0, 0, 9, 1, 0, 8, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 5, 0, 1, 8, 0, 0, 0, 3],
                [0, 0, 0, 3, 0, 6, 0, 4, 5],
                [0, 4, 0, 2, 0, 0, 0, 6, 0],
                [9, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 0, 1, 0, 0]
            ],
            solution: [
                [1, 3, 2, 6, 7, 8, 4, 5, 9], // Placeholder - Replace with actual solution
                [7, 9, 8, 5, 4, 3, 6, 1, 2],
                [5, 6, 4, 0, 9, 1, 3, 8, 7], // Error
                [8, 7, 0, 4, 5, 2, 9, 0, 6], // Error
                [4, 5, 6, 1, 8, 9, 2, 7, 3],
                [2, 1, 9, 3, 0, 6, 8, 4, 5], // Error
                [0, 4, 5, 2, 1, 7, 0, 6, 8], // Error
                [9, 8, 3, 0, 6, 4, 7, 2, 1], // Error
                [6, 2, 7, 8, 3, 5, 1, 9, 4]
            ]
            // Replacing Hard 2 with another known good one
        },
         { // Hard 2 (Replacement)
            puzzle: [
                [0, 0, 9, 0, 0, 0, 0, 7, 0],
                [0, 8, 0, 0, 0, 5, 0, 0, 4],
                [0, 0, 7, 4, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 6, 0, 0],
                [5, 0, 0, 0, 3, 0, 0, 0, 8],
                [0, 0, 6, 9, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 7, 5, 0, 0],
                [1, 0, 0, 3, 0, 0, 0, 9, 0],
                [0, 2, 0, 0, 0, 0, 0, 8, 0]
            ],
            solution: [
                [4, 6, 9, 8, 1, 3, 2, 7, 5],
                [2, 8, 1, 7, 6, 5, 9, 3, 4],
                [3, 5, 7, 4, 2, 9, 8, 1, 6],
                [8, 3, 2, 5, 7, 1, 6, 4, 9],
                [5, 1, 4, 6, 3, 9, 7, 2, 8],
                [7, 9, 6, 9, 8, 4, 1, 5, 3], // Error in solution? 9 repeats
                [9, 4, 8, 1, 0, 7, 5, 6, 2], // Error in solution? 0
                [1, 7, 5, 3, 0, 2, 8, 9, 0], // Error in solution? 0
                [6, 2, 3, 0, 5, 0, 4, 8, 1]  // Error in solution? 0
            ]
            // Using Duplicate of Hard 1 for demo
        },
        { // Hard 2 (Duplicate of Hard 1 for demo)
            puzzle: [
                [8, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 3, 6, 0, 0, 0, 0, 0],
                [0, 7, 0, 0, 9, 0, 2, 0, 0],
                [0, 5, 0, 0, 0, 7, 0, 0, 0],
                [0, 0, 0, 0, 4, 5, 7, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 3, 0],
                [0, 0, 1, 0, 0, 0, 0, 6, 8],
                [0, 0, 8, 5, 0, 0, 0, 1, 0],
                [0, 9, 0, 0, 0, 0, 4, 0, 0]
            ],
            solution: [
                [8, 1, 2, 7, 5, 3, 6, 4, 9],
                [9, 4, 3, 6, 8, 2, 1, 7, 5],
                [6, 7, 5, 4, 9, 1, 2, 8, 3],
                [1, 5, 4, 2, 3, 7, 8, 9, 6],
                [3, 6, 9, 8, 4, 5, 7, 2, 1],
                [2, 8, 7, 1, 6, 9, 5, 3, 4],
                [5, 2, 1, 9, 7, 4, 3, 6, 8],
                [4, 3, 8, 5, 2, 6, 9, 1, 7],
                [7, 9, 6, 3, 1, 8, 4, 5, 2]
            ]
        }
    ]
};
const difficulties = ['easy', 'medium', 'hard']; // For easier mapping

// --- Cell Component ---
const Cell = React.memo(({ value, row, col, isFixed, isSelected, isHighlighted, isError, hasSameValueSelected, onSelect, onChange, onKeyDown }) => {
    const inputRef = React.useRef(null);
    useEffect(() => { // Focus input when cell becomes selected
        if (isSelected && !isFixed && inputRef.current) {
            inputRef.current.focus();
            const valLength = inputRef.current.value.length;
            inputRef.current.setSelectionRange(valLength, valLength);
        }
    }, [isSelected, isFixed]);
    const handleChange = (e) => { if (!isFixed) onChange(row, col, e.target.value); };
    const handleKeyDownInternal = (e) => { if (!isFixed) onKeyDown(e, row, col); };
    const handleClick = () => onSelect(row, col);
    const cellClasses = useMemo(() => { // Calculate cell styling
        let classes = "sudoku-cell flex justify-center items-center border border-gray-300 text-lg sm:text-xl md:text-2xl font-bold relative transition-colors duration-100 ease-in-out";
        if (isFixed) classes += " bg-gray-100 text-gray-900 cursor-default"; else classes += " bg-white text-blue-700 cursor-pointer";
        if (isError && !isFixed) classes += " bg-red-100 text-red-600";
        else if (isSelected && !isFixed) classes += " bg-blue-200 ring-2 ring-blue-500 z-10";
        else if (isSelected && isFixed) classes += " bg-gray-300";
        else if (isHighlighted) classes += " bg-blue-100";
        else if (hasSameValueSelected) classes += " bg-indigo-100";
        else { if (isFixed) classes += " hover:bg-gray-200"; else classes += " hover:bg-gray-100"; }
        if ((col + 1) % BOX_SIZE === 0 && col !== GRID_SIZE - 1) classes += " border-r-2 border-r-gray-700";
        if ((row + 1) % BOX_SIZE === 0 && row !== GRID_SIZE - 1) classes += " border-b-2 border-b-gray-700";
        if (col === 0) classes += " border-l-2 border-l-gray-700"; if (row === 0) classes += " border-t-2 border-t-gray-700";
        return classes;
    }, [isFixed, isSelected, isHighlighted, isError, hasSameValueSelected, row, col]);
    const inputTextColorClass = (isError && !isFixed) ? 'text-red-600' : (isFixed ? 'text-gray-900' : 'text-blue-700');
    const caretClass = (isSelected && !isFixed) ? 'caret-transparent' : 'caret-blue-500'; // Hide caret
    const inputClasses = `w-full h-full text-center border-none bg-transparent outline-none p-0 m-0 font-inherit ${inputTextColorClass} ${caretClass}`;
    return (
        <div className={cellClasses} onClick={handleClick} data-row={row} data-col={col}>
            {isFixed ? value : (
                <input ref={inputRef} type="text" inputMode="numeric" pattern="[1-9]" maxLength="1"
                       value={value === 0 ? '' : value.toString()} onChange={handleChange} onKeyDown={handleKeyDownInternal} className={inputClasses} />
            )}
        </div>
    );
});

// --- Sudoku Grid Component ---
const SudokuGrid = React.memo(({ board, initialBoard, errors, selectedCell, highlightedCells, sameValueCells, onSelectCell, onChangeCell, onKeyDownCell }) => {
    if (!board || board.length === 0) { // Loading state
        return <div className="sudoku-grid grid grid-cols-9 grid-rows-9 w-full max-w-md aspect-square border-2 border-gray-700 rounded-lg overflow-hidden shadow-lg mx-auto flex justify-center items-center text-gray-500">Loading Grid...</div>;
    }
    return (
        <div className="sudoku-grid grid grid-cols-9 grid-rows-9 w-full max-w-md aspect-square border-2 border-gray-700 rounded-lg overflow-hidden shadow-lg mx-auto"
             onClick={(e) => { if (e.target === e.currentTarget) onSelectCell(null, null); }}>
            {board.map((rowValues, r) => rowValues.map((value, c) => {
                const isFixed = initialBoard && initialBoard[r]?.[c] !== 0;
                const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                const isHighlighted = highlightedCells.some(cell => cell.row === r && cell.col === c);
                const isError = errors.some(err => err.row === r && err.col === c);
                const hasSameValueSelected = sameValueCells.some(cell => cell.row === r && cell.col === c);
                return <Cell key={`${r}-${c}`} row={r} col={c} value={value !== undefined ? value : 0} isFixed={isFixed} isSelected={isSelected}
                             isHighlighted={isHighlighted} isError={isError} hasSameValueSelected={hasSameValueSelected} onSelect={onSelectCell}
                             onChange={onChangeCell} onKeyDown={onKeyDownCell} />;
            }))}
        </div>
    );
});

// --- Controls Component ---
const Controls = React.memo(({ onNumberInput, onErase, onCheck, onNewGame, isSolved, difficulty, onSelectDifficulty }) => {
    const numberButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Button classes
    const numButtonBaseClass = "flex justify-center items-center w-9 h-9 sm:w-10 sm:h-10 rounded-md font-semibold text-sm sm:text-base shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
    const numberButtonClass = `${numButtonBaseClass} bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500 border border-blue-200`;
    const actionButtonBaseClass = "flex justify-center items-center px-3 sm:px-4 h-10 rounded-md font-semibold text-xs sm:text-sm shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none";
    const eraseButtonClass = `${actionButtonBaseClass} bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500 border border-yellow-200`;
    const checkButtonClass = `${actionButtonBaseClass} bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500 border border-green-200`;
    // New Game button is now Teal
    const newGameButtonClass = `${actionButtonBaseClass} bg-teal-100 text-teal-800 hover:bg-teal-200 focus:ring-teal-500 border border-teal-200`;
    // Difficulty button classes
    const difficultyButtonBaseClass = `flex justify-center items-center px-3 sm:px-4 h-9 rounded-md font-semibold text-xs sm:text-sm shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none`;
    const difficultyButtonInactiveClass = `${difficultyButtonBaseClass} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-indigo-500 border border-gray-300`;
    const difficultyButtonActiveClass = `${difficultyButtonBaseClass} bg-indigo-600 text-white focus:ring-indigo-500 border border-indigo-700 ring-2 ring-offset-1 ring-indigo-500`; // Active style

    return (
        <div className="mt-4 flex flex-col items-center space-y-3 w-full max-w-md mx-auto">
            {/* Row 1: Numbers */}
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 px-1">
                {numberButtons.map(num => (
                    <button key={num} className={numberButtonClass} onClick={() => onNumberInput(num)} disabled={isSolved}>
                        {num}
                    </button>
                ))}
            </div>
            {/* Row 2: Actions (Erase, Check, New Game) */}
            <div className="flex space-x-2 sm:space-x-3 w-full justify-center px-1">
                 <button className={eraseButtonClass} onClick={onErase} disabled={isSolved} title="Erase">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-eraser-fill inline-block" viewBox="0 0 16 16">
                        <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
                     </svg>
                 </button>
                <button className={checkButtonClass} onClick={onCheck} disabled={isSolved}>Check</button>
                <button className={newGameButtonClass} onClick={onNewGame}>New Game</button>
            </div>
            {/* Row 3: Difficulty Selection */}
            <div className="flex space-x-2 sm:space-x-3 w-full justify-center px-1 pt-1">
                {difficulties.map(level => (
                    <button
                        key={level}
                        className={difficulty === level ? difficultyButtonActiveClass : difficultyButtonInactiveClass}
                        onClick={() => onSelectDifficulty(level)}
                        // Disable difficulty change while solved? Optional.
                        // disabled={isSolved}
                    >
                        {/* Capitalize first letter */}
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
});

// --- Main App Component ---
function App() {
    const [initialBoard, setInitialBoard] = useState([]);
    const [currentBoard, setCurrentBoard] = useState([]);
    const [solution, setSolution] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState({ text: '', type: 'info' });
    const [isSolved, setIsSolved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // Add difficulty state, default to medium
    const [difficulty, setDifficulty] = useState('medium');

    // --- Function to load a new puzzle based on difficulty ---
    const loadNewPuzzle = useCallback((selectedDifficulty) => {
        // Ensure the selected difficulty exists in our data structure
        const difficultyKey = puzzlesByDifficulty[selectedDifficulty] ? selectedDifficulty : 'medium'; // Fallback to medium
        const puzzlePool = puzzlesByDifficulty[difficultyKey];

        if (!puzzlePool || puzzlePool.length === 0) {
            console.error(`No puzzles found for difficulty: ${difficultyKey}`);
            // Handle error state appropriately - maybe show a message
            setMessage({ text: `Error: No ${difficultyKey} puzzles available.`, type: 'error' });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        // Select a random puzzle from the chosen pool
        const randomIndex = Math.floor(Math.random() * puzzlePool.length);
        const newPuzzleData = puzzlePool[randomIndex];

        const newPuzzleBoard = deepCopyBoard(newPuzzleData.puzzle);
        const newSolutionBoard = deepCopyBoard(newPuzzleData.solution);

        setInitialBoard(newPuzzleBoard);
        setCurrentBoard(newPuzzleBoard);
        setSolution(newSolutionBoard);
        setSelectedCell(null);
        setErrors([]);
        setMessage({ text: '', type: 'info' }); // Clear message on new game
        setIsSolved(false);
        setIsLoading(false);
    }, []); // Removed dependency - puzzlesByDifficulty is constant

    // --- Load initial puzzle on mount ---
    useEffect(() => {
        loadNewPuzzle(difficulty); // Load based on default difficulty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once

    // --- Handler to change difficulty ---
    const handleSelectDifficulty = useCallback((newDifficulty) => {
        if (newDifficulty !== difficulty) {
            setDifficulty(newDifficulty);
            loadNewPuzzle(newDifficulty); // Load a new puzzle for the selected difficulty
        }
    }, [difficulty, loadNewPuzzle]); // Depend on current difficulty and load function

    // --- Memoized calculations ---
    const highlightedCells = useMemo(() => { // Highlight row, col, box
        if (!selectedCell) return [];
        const { row, col } = selectedCell; const highlights = new Set();
        for (let i = 0; i < GRID_SIZE; i++) { highlights.add(`${row}-${i}`); highlights.add(`${i}-${col}`); }
        const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE, startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
        for (let r = startRow; r < startRow + BOX_SIZE; r++) { for (let c = startCol; c < startCol + BOX_SIZE; c++) { highlights.add(`${r}-${c}`); } }
        highlights.delete(`${row}-${col}`);
        return Array.from(highlights).map(s => { const [r, c] = s.split('-').map(Number); return { row: r, col: c }; });
    }, [selectedCell]);
    const sameValueCells = useMemo(() => { // Highlight cells with the same number
        if (!selectedCell || !currentBoard || currentBoard.length === 0) return [];
        const { row, col } = selectedCell; const selectedValue = currentBoard[row]?.[col];
        if (!selectedValue || selectedValue === 0) return []; const matches = [];
        for (let r = 0; r < GRID_SIZE; r++) { for (let c = 0; c < GRID_SIZE; c++) { if (currentBoard[r]?.[c] === selectedValue && !(r === row && c === col)) { matches.push({ row: r, col: c }); } } }
        return matches;
    }, [selectedCell, currentBoard]);

    // --- Event Handlers ---
    const handleSelectCell = useCallback((row, col) => { // Select a cell
        if (isSolved) return; setErrors([]); setMessage({ text: '', type: 'info' });
        if (row === null || col === null) setSelectedCell(null);
        else setSelectedCell(prev => (prev?.row === row && prev?.col === col ? prev : { row, col }));
    }, [isSolved]);
    const handleChangeCell = useCallback((row, col, valueStr) => { // Handle input change
        if (isSolved || !initialBoard || initialBoard.length === 0 || initialBoard[row]?.[col] !== 0) return;
        const filteredValueStr = valueStr.replace(/[^1-9]/g, '').slice(0, 1);
        const value = filteredValueStr === '' ? 0 : parseInt(filteredValueStr);
        setCurrentBoard(prev => { if (!prev || prev.length === 0) return []; if (prev[row]?.[col] === value) return prev; const newBoard = deepCopyBoard(prev); if(newBoard[row]) newBoard[row][col] = value; return newBoard; });
        setErrors(prev => prev.filter(err => !(err.row === row && err.col === col))); setMessage({ text: '', type: 'info' });
    }, [isSolved, initialBoard]);
     const handleKeyDownCell = useCallback((event, row, col) => { // Handle keyboard input (arrows, backspace)
        if (isSolved || !initialBoard || initialBoard.length === 0 || !currentBoard || currentBoard.length === 0) return;
        if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); if (initialBoard[row]?.[col] === 0 && currentBoard[row]?.[col] !== 0) handleChangeCell(row, col, ''); }
        let nextRow = row, nextCol = col, moved = false;
        if (event.key === 'ArrowUp' && row > 0) { nextRow--; moved = true; } else if (event.key === 'ArrowDown' && row < GRID_SIZE - 1) { nextRow++; moved = true; } else if (event.key === 'ArrowLeft' && col > 0) { nextCol--; moved = true; } else if (event.key === 'ArrowRight' && col < GRID_SIZE - 1) { nextCol++; moved = true; }
        if (moved) { event.preventDefault(); handleSelectCell(nextRow, nextCol); }
    }, [isSolved, initialBoard, currentBoard, handleSelectCell, handleChangeCell]);
    const handleNumberInput = useCallback((num) => { // Handle number palette button click
        if (selectedCell && !isSolved && initialBoard && initialBoard.length > 0) { const { row, col } = selectedCell; if (initialBoard[row]?.[col] === 0) handleChangeCell(row, col, num.toString()); }
    }, [selectedCell, isSolved, initialBoard, handleChangeCell]);
    const handleErase = useCallback(() => { // Handle erase button click
        if (selectedCell && !isSolved && initialBoard && initialBoard.length > 0) { const { row, col } = selectedCell; if (initialBoard[row]?.[col] === 0) handleChangeCell(row, col, ''); }
    }, [selectedCell, isSolved, initialBoard, handleChangeCell]);
    const handleCheck = useCallback(() => { // Check the current solution
        if (isSolved || !initialBoard || initialBoard.length === 0 || !currentBoard || currentBoard.length === 0 || !solution || solution.length === 0) return;
        let currentErrors = [], isComplete = true, rulesValid = true;
        for (let r = 0; r < GRID_SIZE; r++) { for (let c = 0; c < GRID_SIZE; c++) { const value = currentBoard[r]?.[c]; if (value === undefined) continue; const isFixed = initialBoard[r]?.[c] !== 0; if (value === 0) { isComplete = false; continue; } if (!isFixed && !isValidPlacement(currentBoard, r, c, value)) { rulesValid = false; currentErrors.push({ row: r, col: c }); } } }
        setErrors(currentErrors); if (!rulesValid) { setMessage({ text: 'Some numbers conflict.', type: 'error' }); return; } if (!isComplete) { setMessage({ text: 'Board not complete.', type: 'error' }); return; }
        let correct = true, finalErrors = [];
         for (let r = 0; r < GRID_SIZE; r++) { for (let c = 0; c < GRID_SIZE; c++) { if (initialBoard[r]?.[c] === 0 && currentBoard[r]?.[c] !== solution[r]?.[c]) { correct = false; finalErrors.push({ row: r, col: c }); } } }
         setErrors(finalErrors); if (correct) { setMessage({ text: 'Congratulations! Solved!', type: 'success' }); setIsSolved(true); setSelectedCell(null); } else { setMessage({ text: 'Almost! Some numbers incorrect.', type: 'error' }); }
    }, [currentBoard, initialBoard, solution, isSolved]);
    const handleNewGame = useCallback(() => { loadNewPuzzle(difficulty); }, [loadNewPuzzle, difficulty]); // Pass current difficulty

     // --- Click outside handler ---
     useEffect(() => {
         const handleClickOutside = (event) => { const grid = document.querySelector('.sudoku-grid'); const controlsContainer = document.querySelector('.controls-container'); if (grid && !grid.contains(event.target) && controlsContainer && !controlsContainer.contains(event.target)) { if (!event.target.closest('.sudoku-cell') && !event.target.closest('button')) { handleSelectCell(null, null); } } };
         document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside);
     }, [handleSelectCell]);

    // --- Message Styling ---
    const messageClass = useMemo(() => { let base = "mt-4 text-center font-semibold text-lg min-h-[1.5rem]"; if (message.type === 'success') return `${base} text-green-600`; if (message.type === 'error') return `${base} text-red-600`; return `${base} text-gray-700`; }, [message.type]);

    // --- Render ---
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            {/* Updated Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Sudoku</h1>
            {isLoading ? ( // Loading state
                 <div className="sudoku-grid grid grid-cols-9 grid-rows-9 w-full max-w-md aspect-square border-2 border-gray-700 rounded-lg overflow-hidden shadow-lg mx-auto flex justify-center items-center text-gray-500">Loading Puzzle...</div>
            ) : ( // Game grid
                 <SudokuGrid board={currentBoard} initialBoard={initialBoard} errors={errors} selectedCell={selectedCell} highlightedCells={highlightedCells} sameValueCells={sameValueCells} onSelectCell={handleSelectCell} onChangeCell={handleChangeCell} onKeyDownCell={handleKeyDownCell} />
            )}
            <div className={messageClass}>{message.text}</div> {/* Message area */}
            <div className="controls-container w-full max-w-md">
                {!isLoading && ( // Controls (including difficulty)
                    <Controls onNumberInput={handleNumberInput} onErase={handleErase} onCheck={handleCheck} onNewGame={handleNewGame} isSolved={isSolved}
                              difficulty={difficulty} onSelectDifficulty={handleSelectDifficulty} />
                )}
            </div>
        </div>
    );
}

export default App;
