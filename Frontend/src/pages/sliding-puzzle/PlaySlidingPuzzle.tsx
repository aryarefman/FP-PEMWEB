import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Trophy, Pause, Play, RotateCcw, Eye, EyeOff, Lightbulb, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight, Loader2 } from "lucide-react";

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


// Initial hint calculation based on difficulty (grid size)
const getMaxSteps = (gridSize: number) => {
    switch (gridSize) {
        case 3: return 31;
        case 4: return 80;
        case 5: return 200;
        case 6: return 500;
        default: return 100;
    }
};

const getInitialHints = (gridSize: number) => {
    const maxSteps = getMaxSteps(gridSize);
    return Math.floor(maxSteps * 0.3);
};

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
    const [userHintsLeft, setUserHintsLeft] = useState(3); // Default 3 hints per game
    const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);

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
                    setGameResult('lost');
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
        setGameResult(null);
        setIsStarted(true);
        setIsPaused(false);
        setShowHint(false);
        setHintMoves([]);
        setHintProgress(null);
        setUserHintsLeft(getInitialHints(gridSize)); // Reset hints dynamically
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
                                setGameResult('won');
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

    const [isCalculatingHint, setIsCalculatingHint] = useState(false);

    // Initial hint calculation based on difficulty (grid size)


    const calculateHint = () => {
        if (!puzzle || !isStarted || isFinished || isPaused || isCalculatingHint) return;
        if (userHintsLeft <= 0) {
            toast.error("No hints left!");
            return;
        }

        setIsCalculatingHint(true);
        const gridSize = puzzle.grid_size;

        const worker = new Worker(new URL('../../workers/puzzleSolver.worker.ts', import.meta.url), { type: 'module' });

        worker.postMessage({
            tiles,
            gridSize
        });

        worker.onmessage = (e) => {
            const { success, found, path, error } = e.data;
            setIsCalculatingHint(false);
            worker.terminate();

            if (!success) {
                console.error(error);
                toast.error("Failed to calculate hint");
                return;
            }

            if (path.length > 0) {
                // Determine how many steps to show
                let stepsToShow = 1;
                if (found) {
                    if (gridSize === 4) stepsToShow = Math.min(2, path.length);
                    else if (gridSize === 5) stepsToShow = Math.min(3, path.length);
                    else if (gridSize >= 6) stepsToShow = Math.min(4, path.length);
                }

                const selectedMoves = path.slice(0, stepsToShow);
                setHintMoves(selectedMoves);
                setShowHint(true);

                // Show total steps if solution found, otherwise just 1
                setHintProgress({ current: 0, total: found ? path.length : 1 });

                setUserHintsLeft(prev => prev - 1);

                if (found) {
                    toast.success(`Solution: ${path.length} steps to solve!`);
                } else {
                    toast("Showing best next move (puzzle too complex)", { icon: "💡" });
                }

                const timeout = found ? 8000 : 5000;
                setTimeout(() => {
                    setShowHint(false);
                    setHintProgress(null);
                }, timeout);
            } else {
                toast.error("Could not find a valid move.");
            }
        };

        worker.onerror = (err) => {
            console.error("Worker error:", err);
            setIsCalculatingHint(false);
            worker.terminate();
            toast.error("Something went wrong calculating the hint.");
        };
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

    if (isFinished && gameResult) {
        return (
            <div className="w-full bg-slate-50 min-h-screen flex flex-col relative">
                {/* Background Game Area (Blurred) */}
                <div className="absolute inset-0 filter blur-sm pointer-events-none z-0">
                    {/* Re-render the game header and board as background */}
                    <div className="w-full h-fit flex justify-between items-center px-8 py-4 shadow-sm bg-white">
                        <div className="flex gap-4">
                            <Typography variant="p" className="font-semibold">Moves: {moves}</Typography>
                            <Typography variant="p" className="font-semibold">Time: {formatTime(time)}</Typography>
                        </div>
                    </div>
                    <div className="w-full h-full p-8 flex justify-center items-center">
                        <div className="max-w-4xl w-full space-y-6">
                            <Typography variant="h3" className="text-center">{puzzle.name}</Typography>
                            <div className="flex justify-center">
                                <div
                                    className="relative bg-gray-800 p-2 rounded-lg shadow-2xl opacity-50"
                                    style={{
                                        width: `${gridSize * Math.min(500 / gridSize, 120) + 16}px`,
                                        height: `${gridSize * Math.min(500 / gridSize, 120) + 16}px`,
                                    }}
                                >
                                    {/* Simply show the full image if won, or current tiles if lost */}
                                    {gameResult === 'won' ? (
                                        <div
                                            className="w-full h-full bg-cover bg-center rounded"
                                            style={{ backgroundImage: `url(${import.meta.env.VITE_API_URL}/${puzzle.puzzle_image})` }}
                                        />
                                    ) : (
                                        tiles.map((tile) => {
                                            // Simplified rendering for background
                                            const row = Math.floor(tile.position / gridSize);
                                            const col = tile.position % gridSize;
                                            const sourceRow = Math.floor(tile.id / gridSize);
                                            const sourceCol = tile.id % gridSize;
                                            const size = Math.min(500 / gridSize, 120);
                                            return (
                                                <div
                                                    key={tile.id}
                                                    className="absolute"
                                                    style={{
                                                        width: `${size - 4}px`,
                                                        height: `${size - 4}px`,
                                                        left: `${col * size + 2}px`,
                                                        top: `${row * size + 2}px`,
                                                        backgroundImage: tile.isEmpty ? "none" : `url(${import.meta.env.VITE_API_URL}/${puzzle.puzzle_image})`,
                                                        backgroundSize: `${gridSize * size}px ${gridSize * size}px`,
                                                        backgroundPosition: `-${sourceCol * size}px -${sourceRow * size}px`,
                                                    }}
                                                />
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overlay Modal */}
                <div className="absolute inset-0 z-10 flex justify-center items-center bg-black/40">
                    <div className="bg-white rounded-xl p-10 mx-10 text-center max-w-sm w-full space-y-4 shadow-2xl transform transition-all scale-100">
                        {gameResult === 'won' ? (
                            <>
                                <Trophy className="mx-auto text-yellow-400 animate-bounce" size={72} />
                                <Typography variant="h4" className="text-green-600 font-bold">Puzzle Solved!</Typography>
                                <Typography variant="h2">{moves} Moves</Typography>
                                <Typography variant="p">Time: {formatTime(time)}</Typography>

                                <div className="flex justify-center gap-1 text-yellow-400 text-xl">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i}>★</span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto text-red-500 bg-red-100 p-4 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                                    <span className="text-4xl font-bold">:(</span>
                                </div>
                                <Typography variant="h4" className="text-red-500 font-bold">Time's Up!</Typography>
                                <Typography variant="p" className="text-gray-600">Don't give up, try again!</Typography>
                            </>
                        )}

                        <div className="pt-4 space-y-2">
                            <Button
                                className="w-full text-lg py-6"
                                onClick={shuffleTiles}
                            >
                                {gameResult === 'won' ? 'Play Again' : 'Try Again'}
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
                                    disabled={userHintsLeft <= 0 || showHint || isCalculatingHint}
                                    className={`relative transition-all ${showHint ? "bg-yellow-100 border-yellow-400 text-yellow-700" : ""} ${userHintsLeft <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isCalculatingHint ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-2" /> Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <Lightbulb size={16} className={showHint ? "fill-yellow-500" : ""} />
                                            {hintProgress
                                                ? `Showing ${hintProgress.current + 1}/${hintProgress.total}`
                                                : `Hint`
                                            }
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Preview Image */}
                    {showPreview && (
                        <div className="flex justify-center">
                            <div className="relative rounded-lg shadow-lg border-4 border-white overflow-hidden"
                                style={{
                                    width: `${gridSize * tileSize}px`,
                                    height: `${gridSize * tileSize}px`,
                                }}
                            >
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/${puzzle.puzzle_image}`}
                                    alt="Preview"
                                    className="w-full h-full object-fill"
                                />
                            </div>
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
