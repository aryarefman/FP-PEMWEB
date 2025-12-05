
// Type definitions
interface Tile {
    id: number;
    position: number;
    isEmpty: boolean;
}

interface WorkerMessage {
    tiles: Tile[];
    gridSize: number;
}

interface Move {
    tileId: number;
    direction: string;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { tiles, gridSize } = e.data;

    try {
        const result = solvePuzzle(tiles, gridSize);
        self.postMessage({ success: true, ...result });
    } catch (error) {
        self.postMessage({ success: false, error: 'Failed to solve' });
    }
};

const solvePuzzle = (tiles: Tile[], gridSize: number) => {
    // A* Search Logic

    const getManhattanDistance = (tileId: number, position: number): number => {
        const currentRow = Math.floor(position / gridSize);
        const currentCol = position % gridSize;
        const targetRow = Math.floor(tileId / gridSize);
        const targetCol = tileId % gridSize;
        return Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    };

    const calculateHeuristic = (state: Tile[]): number => {
        return state.reduce((sum, tile) => {
            if (tile.isEmpty) return sum;
            return sum + getManhattanDistance(tile.id, tile.position);
        }, 0);
    };

    const getStateKey = (state: Tile[]): string => {
        return state.map(t => t.position).join(',');
    };

    const getPossibleMoves = (state: Tile[]): Array<{ tile: Tile; direction: string; newState: Tile[] }> => {
        const empty = state.find(t => t.isEmpty);
        if (!empty) return [];

        const emptyRow = Math.floor(empty.position / gridSize);
        const emptyCol = empty.position % gridSize;

        const moves: Array<{ tile: Tile; direction: string; newState: Tile[] }> = [];

        const directions = [
            { dr: -1, dc: 0, name: 'down' },  // tile moves down (empty moves up)
            { dr: 1, dc: 0, name: 'up' },     // tile moves up (empty moves down)
            { dr: 0, dc: -1, name: 'right' }, // tile moves right (empty moves left)
            { dr: 0, dc: 1, name: 'left' }    // tile moves left (empty moves right)
        ];

        for (const dir of directions) {
            const newRow = emptyRow + dir.dr;
            const newCol = emptyCol + dir.dc;

            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                const newPos = newRow * gridSize + newCol;
                const tileToMove = state.find(t => t.position === newPos);

                if (tileToMove && !tileToMove.isEmpty) {
                    const newState = state.map(t => {
                        if (t.id === tileToMove.id) return { ...t, position: empty.position };
                        if (t.id === empty.id) return { ...t, position: tileToMove.position };
                        return { ...t };
                    });

                    moves.push({
                        tile: tileToMove,
                        direction: dir.name,
                        newState
                    });
                }
            }
        }

        return moves;
    };

    // A* Node
    interface SearchNode {
        state: Tile[];
        g: number;
        h: number;
        f: number;
        move: Move | null;
        parent: SearchNode | null;
    }

    const startNode: SearchNode = {
        state: tiles,
        g: 0,
        h: calculateHeuristic(tiles),
        f: calculateHeuristic(tiles),
        move: null,
        parent: null
    };

    const openSet: SearchNode[] = [startNode];
    const closedSet = new Set<string>();

    const maxIterations = gridSize <= 3 ? 15000 : gridSize === 4 ? 8000 : 3000;
    let iterations = 0;

    // Use a min-heap logic (sorting every time is expensive but ok for JS array small size)
    // Optimization: Binary heap could be better but array sort is simple enough for this task

    while (openSet.length > 0 && iterations < maxIterations) {
        iterations++;

        // Sort by f score (lowest first)
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;

        const stateKey = getStateKey(current.state);
        if (closedSet.has(stateKey)) continue;
        closedSet.add(stateKey);

        if (current.h === 0) {
            // Solution found
            const path: Move[] = [];
            let node: SearchNode | null = current;

            while (node && node.parent) {
                if (node.move) path.unshift(node.move);
                node = node.parent;
            }
            return { found: true, path, iterations };
        }

        const possibleMoves = getPossibleMoves(current.state);

        for (const move of possibleMoves) {
            const newStateKey = getStateKey(move.newState);
            if (closedSet.has(newStateKey)) continue;

            const g = current.g + 1;
            const h = calculateHeuristic(move.newState);
            const f = g + h;

            const neighbor: SearchNode = {
                state: move.newState,
                g,
                h,
                f,
                move: { tileId: move.tile.id, direction: move.direction },
                parent: current
            };

            const existingIndex = openSet.findIndex(n => getStateKey(n.state) === newStateKey);
            if (existingIndex >= 0) {
                if (openSet[existingIndex].f > f) {
                    openSet[existingIndex] = neighbor;
                }
            } else {
                openSet.push(neighbor);
            }
        }
    }

    // Fallback if no solution found within limit
    // Return the best move (closest to solution by heuristic of neighbors of START)
    // Or just fail. The original code fell back to best immediate move.

    // Let's implement the fallback: find best immediate move from start state
    const movesFromStart = getPossibleMoves(tiles);
    if (movesFromStart.length > 0) {
        const bestMove = movesFromStart.reduce((best, move) => {
            const moveH = calculateHeuristic(move.newState);
            const bestH = calculateHeuristic(best.newState);
            return moveH < bestH ? move : best;
        });

        return {
            found: false,
            path: [{ tileId: bestMove.tile.id, direction: bestMove.direction }],
            iterations
        };
    }

    return { found: false, path: [], iterations };
};
