import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Trophy, Pause, Play, RotateCcw, Eye, EyeOff } from "lucide-react";

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

            // Check win condition
            if (checkWin(newTiles)) {
                setIsFinished(true);
                addPlayCount(id!);
                toast.success("Congratulations! You solved the puzzle!");
            }
        }
    };

    const checkWin = (currentTiles: Tile[]): boolean => {
        return currentTiles.every((tile) => tile.id === tile.position);
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

                                return (
                                    <div
                                        key={tile.id}
                                        className={`absolute transition-all duration-200 ${tile.isEmpty
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
                                            border: tile.isEmpty ? "none" : "2px solid white",
                                            borderRadius: "4px",
                                        }}
                                        onClick={() => !tile.isEmpty && moveTile(tile)}
                                    />
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
