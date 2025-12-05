# Sliding Puzzle Game - Backend

## Description
Sliding puzzle game where players slide tiles to complete a picture. The creator can upload any image and configure the grid size (3x3, 4x4, 5x5, or 6x6).

## API Endpoints

### Create Sliding Puzzle
- **POST** `/api/game/sliding-puzzle`
- **Auth**: Required
- **Body** (multipart/form-data):
  - `name`: string (max 128 chars)
  - `description`: string (optional, max 256 chars)
  - `thumbnail_image`: file
  - `puzzle_image`: file (max 5MB)
  - `grid_size`: number (3-6, default: 4)
  - `time_limit`: number (optional, 60-3600 seconds)
  - `is_publish_immediately`: boolean (default: false)

### Get Sliding Puzzle Detail
- **GET** `/api/game/sliding-puzzle/:game_id`
- **Auth**: Required

### Get Sliding Puzzle for Play (Public)
- **GET** `/api/game/sliding-puzzle/:game_id/play/public`
- **Auth**: Not required

### Get Sliding Puzzle for Play (Private)
- **GET** `/api/game/sliding-puzzle/:game_id/play/private`
- **Auth**: Required

### Update Sliding Puzzle
- **PATCH** `/api/game/sliding-puzzle/:game_id`
- **Auth**: Required
- **Body** (multipart/form-data): Same as create, but all fields are optional

### Delete Sliding Puzzle
- **DELETE** `/api/game/sliding-puzzle/:game_id`
- **Auth**: Required

## Game JSON Structure
```json
{
  "puzzle_image": "string (URL)",
  "grid_size": 4,
  "time_limit": 300
}
```

## Features
- Upload custom images for puzzles
- Configurable grid size (3x3 to 6x6)
- Optional time limit
- Automatic tile shuffling on frontend
- Win detection based on tile positions
