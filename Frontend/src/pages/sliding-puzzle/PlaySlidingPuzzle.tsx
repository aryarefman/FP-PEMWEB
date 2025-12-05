import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Trophy, Pause, Play, RotateCcw, Eye, EyeOff, Lightbulb, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight } from "lucide-react";

interface SlidingPuzzleData {
    id: string;
    name: string;
    description: string;
    thumbnail_image: string | null;
    is_published: boolean;
    puzzle_image: string;
    grid_size: number;
    time_limit?: number;
}

interface Tile {
    id: number;
    position: number;
    isEmpty: boolean;
}

function PlaySlidingPuzzle() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [puzzle, setPuzzle] = useState<SlidingPuzzleData | null>(null);

    const [tiles, setTiles] = useState<Tile[]>([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [hintMoves, setHintMoves] = useState<{ tileId: number; direction: string }[]>([]);
    const [hintProgress, setHintProgress] = useState<{ current: number; total: number } | null>(null);
    const [isAnimatingWin, setIsAnimatingWin] = useState(false);
    const [animatedTiles, setAnimatedTiles] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchPuzzle = async () => {
            try {
                setLoading(true);
                const response = await api.get(
                    `/api/game/game-type/sliding-puzzle/${id}/play/public`,
                );
                setPuzzle(response.data.data);
            } catch (err) {
                setError("Failed to load puzzle.");
                console.error(err);
                toast.error("Failed to load puzzle.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPuzzle();
    }, [id]);

    // Initialize tiles
    useEffect(() => {
        if (puzzle) {
            const gridSize = puzzle.grid_size;
            const totalTiles = gridSize * gridSize;
            const initialTiles: Tile[] = Array.from({ length: totalTiles }, (_, i) => ({
                id: i,
                position: i,
                isEmpty: i === totalTiles - 1,
            }));
            setTiles(initialTiles);
        }
    }, [puzzle]);

    // Timer
    useEffect(() => {
        if (!isStarted || isPaused || isFinished) return;

        const interval = setInterval(() => {
            setTime((prev) => {
                if (puzzle?.time_limit && prev >= puzzle.time_limit) {
                    setIsFinished(true);
                    toast.error("Time's up!");
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isStarted, isPaused, isFinished, puzzle?.time_limit]);

    const shuffleTiles = useCallback(() => {
        if (!puzzle) return;

        const gridSize = puzzle.grid_size;
        const totalTiles = gridSize * gridSize;
        let shuffled = Array.from({ length: totalTiles }, (_, i) => i);

        // Fisher-Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Ensure puzzle is solvable
        if (!isSolvable(shuffled, gridSize)) {
            // Swap first two non-empty tiles
            if (shuffled[0] !== totalTiles - 1 && shuffled[1] !== totalTiles - 1) {
                [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
            } else {
                [shuffled[2], shuffled[3]] = [shuffled[3], shuffled[2]];
            }
        }

        const newTiles: Tile[] = shuffled.map((id, position) => ({
            id,
            position,
            isEmpty: id === totalTiles - 1,
        }));

        setTiles(newTiles);
        setMoves(0);
        setTime(0);
        setIsFinished(false);
        setIsStarted(true);
        setIsPaused(false);
        setShowHint(false);
        setHintMoves([]);
        setHintProgress(null);
        setIsAnimatingWin(false);
        setAnimatedTiles(new Set());
    }, [puzzle]);

    const isSolvable = (arr: number[], gridSize: number) => {
        let inversions = 0;
        const totalTiles = gridSize * gridSize;

        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] !== totalTiles - 1 && arr[j] !== totalTiles - 1 && arr[i] > arr[j]) {
                    inversions++;
                }
            }
        }

        if (gridSize % 2 === 1) {
            return inversions % 2 === 0;
        } else {
            const emptyRow = Math.floor(arr.indexOf(totalTiles - 1) / gridSize);
            return (inversions + emptyRow) % 2 === 1;
        }
    };

    const canMove = (tilePosition: number, emptyPosition: number): boolean => {
        if (!puzzle) return false;
        const gridSize = puzzle.grid_size;

        const tileRow = Math.floor(tilePosition / gridSize);
        const tileCol = tilePosition % gridSize;
        const emptyRow = Math.floor(emptyPosition / gridSize);
        const emptyCol = emptyPosition % gridSize;

        const rowDiff = Math.abs(tileRow - emptyRow);
        const colDiff = Math.abs(tileCol - emptyCol);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    };

    const moveTile = (clickedTile: Tile) => {
        if (isPaused || isFinished || !isStarted) return;

        const emptyTile = tiles.find((t) => t.isEmpty);
        if (!emptyTile) return;

        if (canMove(clickedTile.position, emptyTile.position)) {
            const newTiles = tiles.map((tile) => {
                if (tile.id === clickedTile.id) {
                    return { ...tile, position: emptyTile.position };
                }
                if (tile.id === emptyTile.id) {
                    return { ...tile, position: clickedTile.position };
                }
                return tile;
            });

            setTiles(newTiles);
            setMoves((prev) => prev + 1);

            // Update hint progress if user follows the hint
            if (hintProgress && hintMoves.length > 0) {
                const currentHint = hintMoves[0];
                if (currentHint.tileId === clickedTile.id) {
                    // User followed the hint, update progress
                    setHintProgress(prev => prev ? { ...prev, current: prev.current + 1 } : null);
                    // Remove the completed hint move
                    setHintMoves(prev => prev.slice(1));

                    // If no more hints, clear progress after a delay
                    if (hintMoves.length === 1) {
                        setTimeout(() => {
                            setHintProgress(null);
                            setShowHint(false);
                        }, 1000);
                    }
                } else {
                    // User didn't follow hint, clear hint
                    setHintProgress(null);
                    setHintMoves([]);
                    setShowHint(false);
                }
            }

            // Check win condition
            if (checkWin(newTiles)) {
                setIsAnimatingWin(true);
                addPlayCount(id!);

                // Animate tiles one by one
                if (puzzle) {
                    const gridSize = puzzle.grid_size;
                    const totalTiles = gridSize * gridSize;
                    let currentTile = 0;

                    const animateInterval = setInterval(() => {
                        if (currentTile < totalTiles - 1) { // -1 to exclude empty tile
                            setAnimatedTiles(prev => new Set([...prev, currentTile]));
                            currentTile++;
                        } else {
                            clearInterval(animateInterval);
                            // Show win screen after animation completes
                            setTimeout(() => {
                                setIsFinished(true);
                                setIsAnimatingWin(false);
                                toast.success("Congratulations! You solved the puzzle!");
                            }, 300);
                        }
                    }, 100); // 100ms delay between each tile animation
                }
            }
        }
    };

    const checkWin = (currentTiles: Tile[]): boolean => {
        return currentTiles.every((tile) => tile.id === tile.position);
    };

    const calculateHint = () => {
        if (!puzzle || !isStarted || isFinished || isPaused) return;

        const gridSize = puzzle.grid_size;
        const emptyTile = tiles.find((t) => t.isEmpty);
        if (!emptyTile) return;

        // Calculate Manhattan distance for a tile
        const getManhattanDistance = (tileId: number, position: number): number => {
            const currentRow = Math.floor(position / gridSize);
            const currentCol = position % gridSize;
            const targetRow = Math.floor(tileId / gridSize);
            const targetCol = tileId % gridSize;
            return Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
        };

        // Calculate total Manhattan distance (heuristic)
        const calculateHeuristic = (state: Tile[]): number => {
            return state.reduce((sum, tile) => {
                if (tile.isEmpty) return sum;
                return sum + getManhattanDistance(tile.id, tile.position);
            }, 0);
        };

        // Get state key for visited tracking
        const getStateKey = (state: Tile[]): string => {
            return state.map(t => t.position).join(',');
        };

        // Get possible moves from current state
        const getPossibleMoves = (state: Tile[]): Array<{ tile: Tile; direction: string; newState: Tile[] }> => {
            const empty = state.find(t => t.isEmpty);
            if (!empty) return [];

            const emptyRow = Math.floor(empty.position / gridSize);
            const emptyCol = empty.position % gridSize;

            const moves: Array<{ tile: Tile; direction: string; newState: Tile[] }> = [];

            // Check all four directions
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
                        // Create new state
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

        // A* Search implementation with depth limit
        interface SearchNode {
            state: Tile[];
            g: number; // cost from start
            h: number; // heuristic to goal
            f: number; // g + h
            move: { tileId: number; direction: string } | null;
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

        // Adjust search depth based on grid size
        const maxDepth = gridSize <= 3 ? 8 : gridSize === 4 ? 6 : 4;
        const maxIterations = gridSize <= 3 ? 10000 : gridSize === 4 ? 5000 : 2000;
        let iterations = 0;
        let bestNode: SearchNode | null = null;

        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;

            // Sort by f score and get best node
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift()!;

            const stateKey = getStateKey(current.state);
            if (closedSet.has(stateKey)) continue;
            closedSet.add(stateKey);

            // GOAL FOUND - Complete solution!
            if (current.h === 0) {
                console.log(`✅ Solution found in ${iterations} iterations`);

                // Trace back complete path
                const path: Array<{ tileId: number; direction: string }> = [];
                let node: SearchNode | null = current;

                while (node && node.parent) {
                    if (node.move) path.unshift(node.move);
                    node = node.parent;
                }

                console.log(`📊 Total steps to solve: ${path.length}`);

                if (path.length > 0) {
                    // Show more hints for larger grids
                    let hintCount = 1;
                    if (gridSize === 4) hintCount = Math.min(2, path.length);
                    else if (gridSize === 5) hintCount = Math.min(3, path.length);
                    else if (gridSize >= 6) hintCount = Math.min(4, path.length);

                    const selectedMoves = path.slice(0, hintCount);
                    setHintMoves(selectedMoves);
                    setShowHint(true);
                    setHintProgress({ current: 0, total: path.length }); // TOTAL steps!

                    toast.success(`Solution: ${path.length} steps to solve!`);

                    setTimeout(() => {
                        setShowHint(false);
                        setHintProgress(null);
                    }, 8000);

                    return;
                }
            }

            // Explore neighbors
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

                // Check if this state is already in open set with worse score
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

        console.log(`⚠️ A* stopped after ${iterations} iterations without complete solution`);

        // Fallback: if A* didn't find complete solution, suggest best immediate move
        const possibleMoves = getPossibleMoves(tiles);
        if (possibleMoves.length > 0) {
            const bestMove = possibleMoves.reduce((best, move) => {
                const moveH = calculateHeuristic(move.newState);
                const bestH = calculateHeuristic(best.newState);
                return moveH < bestH ? move : best;
            });

            setHintMoves([{ tileId: bestMove.tile.id, direction: bestMove.direction }]);
            setShowHint(true);
            setHintProgress({ current: 0, total: 1 });

            toast("Showing best next move (puzzle too complex)", { icon: "💡" });

            setTimeout(() => {
                setShowHint(false);
            }, 5000);
        }
    };

    const addPlayCount = async (gameId: string) => {
        try {
            await api.post("/api/game/play-count", {
                game_id: gameId,
            });
        } catch (err) {
            console.error("Failed to update play count:", err);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleExit = async () => {
        if (isStarted && !isFinished) {
            await addPlayCount(id!);
        }
        navigate("/");
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-black"></div>
            </div>
        );
    }

    if (error || !puzzle) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
                <Typography variant="p">{error ?? "Puzzle not found"}</Typography>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    const gridSize = puzzle.grid_size;
    const tileSize = Math.min(500 / gridSize, 120);

    if (isFinished) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-slate-50">
                <div className="bg-white rounded-xl p-10 mx-10 text-center max-w-sm w-full space-y-4 shadow-lg">
                    <Trophy className="mx-auto text-yellow-400" size={72} />
                    <Typography variant="h4">Puzzle Solved!</Typography>
                    <Typography variant="h2">{moves} Moves</Typography>
                    <Typography variant="p">Time: {formatTime(time)}</Typography>

                    <div className="flex justify-center gap-1 text-yellow-400 text-xl">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>★</span>
                        ))}
                    </div>

                    <Button
                        className="w-full mt-4"
                        onClick={() => {
                            shuffleTiles();
                        }}
                    >
                        Play Again
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleExit}
                    >
                        Exit
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-50 min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white h-fit w-full flex justify-between items-center px-8 py-4 shadow-sm">
                <div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="hidden md:flex"
                        onClick={handleExit}
                    >
                        <ArrowLeft /> Exit Game
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="block md:hidden"
                        onClick={handleExit}
                    >
                        <ArrowLeft />
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <Typography variant="p" className="font-semibold">
                        Moves: {moves}
                    </Typography>
                    <Typography variant="p" className="font-semibold">
                        Time: {formatTime(time)}
                    </Typography>
                    {puzzle.time_limit && (
                        <Typography variant="p" className="text-sm text-gray-500">
                            / {formatTime(puzzle.time_limit)}
                        </Typography>
                    )}
                </div>
            </div>

            {/* Game Area */}
            <div className="w-full h-full p-8 flex justify-center items-center">
                <div className="max-w-4xl w-full space-y-6">
                    <div className="text-center space-y-2">
                        <Typography variant="h3">{puzzle.name}</Typography>
                        {puzzle.description && (
                            <Typography variant="p" className="text-gray-600">
                                {puzzle.description}
                            </Typography>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-2 flex-wrap">
                        {!isStarted && (
                            <Button onClick={shuffleTiles}>
                                Start Game
                            </Button>
                        )}
                        {isStarted && !isFinished && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPaused(!isPaused)}
                                >
                                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                                    {isPaused ? "Resume" : "Pause"}
                                </Button>
                                <Button variant="outline" onClick={shuffleTiles}>
                                    <RotateCcw size={16} /> Restart
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                                    {showPreview ? "Hide" : "Preview"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={calculateHint}
                                    className={showHint ? "bg-yellow-100 border-yellow-400" : ""}
                                >
                                    <Lightbulb size={16} />
                                    {hintProgress ? `Hint ${hintProgress.current + 1}/${hintProgress.total}` : "Hint"}
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Preview Image */}
                    {showPreview && (
                        <div className="flex justify-center">
                            <img
                                src={`${import.meta.env.VITE_API_URL}/${puzzle.puzzle_image}`}
                                alt="Preview"
                                className="max-w-xs rounded-lg shadow-lg border-4 border-white"
                            />
                        </div>
                    )}

                    {/* Puzzle Grid */}
                    <div className="flex justify-center">
                        <div
                            className="relative bg-gray-800 p-2 rounded-lg shadow-2xl"
                            style={{
                                width: `${gridSize * tileSize + 16}px`,
                                height: `${gridSize * tileSize + 16}px`,
                            }}
                        >
                            {tiles.map((tile) => {
                                const row = Math.floor(tile.position / gridSize);
                                const col = tile.position % gridSize;
                                const sourceRow = Math.floor(tile.id / gridSize);
                                const sourceCol = tile.id % gridSize;

                                // Check if this tile has a hint
                                const hintIndex = showHint ? hintMoves.findIndex(h => h.tileId === tile.id) : -1;
                                const hint = hintIndex >= 0 ? hintMoves[hintIndex] : null;

                                // Check if this tile should be animated (win animation)
                                const isAnimated = isAnimatingWin && animatedTiles.has(tile.id);

                                return (
                                    <div
                                        key={tile.id}
                                        className={`absolute transition-all ${isAnimated ? "duration-300 scale-105" : "duration-200"
                                            } ${tile.isEmpty
                                                ? "opacity-0"
                                                : "cursor-pointer hover:brightness-110"
                                            } ${isPaused ? "blur-sm" : ""}`}
                                        style={{
                                            width: `${tileSize - 4}px`,
                                            height: `${tileSize - 4}px`,
                                            left: `${col * tileSize + 2}px`,
                                            top: `${row * tileSize + 2}px`,
                                            backgroundImage: tile.isEmpty
                                                ? "none"
                                                : `url(${import.meta.env.VITE_API_URL}/${puzzle.puzzle_image})`,
                                            backgroundSize: `${gridSize * tileSize}px ${gridSize * tileSize}px`,
                                            backgroundPosition: `-${sourceCol * tileSize}px -${sourceRow * tileSize}px`,
                                            border: tile.isEmpty ? "none" : isAnimated ? "3px solid #22c55e" : "2px solid white",
                                            borderRadius: "4px",
                                            boxShadow: isAnimated ? "0 0 20px rgba(34, 197, 94, 0.8)" : "none",
                                        }}
                                        onClick={() => !tile.isEmpty && !isAnimatingWin && moveTile(tile)}
                                    >
                                        {/* Win Animation Overlay */}
                                        {isAnimated && (
                                            <div className="absolute inset-0 bg-green-500/20 rounded animate-pulse" />
                                        )}

                                        {/* Hint Arrow Overlay */}
                                        {hint && !isAnimatingWin && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/60 rounded animate-pulse">
                                                {/* Step Number Badge */}
                                                <div className="absolute top-1 left-1 bg-white text-black font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg">
                                                    {hintIndex + 1}
                                                </div>
                                                {hint.direction === "up" && <ArrowUp size={tileSize / 2} className="text-white drop-shadow-lg" strokeWidth={3} />}
                                                {hint.direction === "down" && <ArrowDown size={tileSize / 2} className="text-white drop-shadow-lg" strokeWidth={3} />}
                                                {hint.direction === "left" && <ArrowLeftIcon size={tileSize / 2} className="text-white drop-shadow-lg" strokeWidth={3} />}
                                                {hint.direction === "right" && <ArrowRight size={tileSize / 2} className="text-white drop-shadow-lg" strokeWidth={3} />}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {isPaused && (
                        <div className="text-center">
                            <Typography variant="h4" className="text-gray-500">
                                Game Paused
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlaySlidingPuzzle;
