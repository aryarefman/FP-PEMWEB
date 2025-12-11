# Sliding Puzzle API Documentation

This documentation covers the endpoints for the **Sliding Puzzle** game module.

**Base URL**: `{{base_url}}`

---

## 1. Create Sliding Puzzle
Create a new Sliding Puzzle game.

- **Method**: `POST`
- **Path**: `/api/game/game-type/sliding-puzzle`
- **Auth**: Required (Bearer Token)
- **Content-Type**: `multipart/form-data`

### Body Parameters
| Key | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | Text | Yes | Name of the game (Max 128 chars). |
| `description` | Text | No | Description of the game (Max 256 chars). |
| `thumbnail_image` | File | Yes | Thumbnail image for the game listing. |
| `puzzle_image` | File | Yes | The image to be used for the puzzle (Max 5MB). |
| `grid_size` | Number | No | Grid size (e.g., 3 for 3x3). Range: 3-6. Default: 4. |
| `time_limit` | Number | No | Time limit in seconds. Range: 60-3600. |
| `is_publish_immediately` | Text | No | "true" or "false". Default: false. |

---

## 2. Get Game Detail
Retrieve detailed information about a specific Sliding Puzzle game.

- **Method**: `GET`
- **Path**: `/api/game/game-type/sliding-puzzle/:game_id`
- **Auth**: Required (Bearer Token)

### Response Example
```json
{
    "success": true,
    "statusCode": 200,
    "message": "Get game successfully",
    "data": {
        "id": "uuid",
        "name": "Game Name",
        "description": "Game Description",
        "thumbnail_image": "path/to/image.jpg",
        "is_published": true,
        "created_at": "2023-01-01T00:00:00.000Z",
        "game_json": {
            "puzzle_image": "path/to/puzzle.jpg",
            "grid_size": 4,
            "time_limit": 300
        },
        "total_played": 0
    }
}
```

---

## 3. Play Game (Public)
Get game data for playing (User/Guest side). Only works if the game is published.

- **Method**: `GET`
- **Path**: `/api/game/game-type/sliding-puzzle/:game_id/play/public`
- **Auth**: Not Required

### Response Example
```json
{
    "success": true,
    "statusCode": 200,
    "message": "Get public game successfully",
    "data": {
        "id": "uuid",
        "name": "Game Name",
        "description": "Game Description",
        "thumbnail_image": "path/to/image.jpg",
        "puzzle_image": "path/to/puzzle.jpg",
        "grid_size": 4,
        "time_limit": 300,
        "is_published": true
    }
}
```

---

## 4. Play Game (Private)
Get game data for playing (Preview mode for Creator/Admin). Works even if the game is unpublished.

- **Method**: `GET`
- **Path**: `/api/game/game-type/sliding-puzzle/:game_id/play/private`
- **Auth**: Required (Bearer Token)

### Response Example
Same as **Play Game (Public)**.

---

## 5. Update Sliding Puzzle
Update an existing Sliding Puzzle game.

- **Method**: `PATCH`
- **Path**: `/api/game/game-type/sliding-puzzle/:game_id`
- **Auth**: Required (Bearer Token)
- **Content-Type**: `multipart/form-data`

### Body Parameters
Same as **Create Sliding Puzzle**, but all fields are **Optional**.

---

## 6. Delete Game
Delete a Sliding Puzzle game.

- **Method**: `DELETE`
- **Path**: `/api/game/game-type/sliding-puzzle/:game_id`
- **Auth**: Required (Bearer Token)

---
