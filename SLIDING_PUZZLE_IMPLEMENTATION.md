# Sliding Puzzle - Implementation Guide

## 🎯 Project Overview
This document provides a complete guide for the Sliding Puzzle game implementation for WordIT Final Project.

**Team Member**: Arya Refman  
**Game Type**: Sliding Puzzle  
**Difficulty**: Sedang (Medium)  
**Max Team Members**: 3

## ✅ Implementation Checklist

### Backend Implementation
- [x] Create schema for validation (create & update)
- [x] Create interface for game JSON structure
- [x] Implement service layer with CRUD operations
- [x] Implement controller with REST API endpoints
- [x] Add route to game-list router
- [x] Update game template description
- [x] Create API documentation

### Frontend Implementation
- [x] Create PlaySlidingPuzzle component
- [x] Create CreateSlidingPuzzle component
- [x] Create EditSlidingPuzzle component
- [x] Add routes to App.tsx
- [x] Implement tile sliding mechanics
- [x] Implement shuffle algorithm
- [x] Implement win detection
- [x] Add timer and move counter
- [x] Add pause/resume functionality
- [x] Add preview functionality
- [x] Create documentation

## 📂 Files Created

### Backend Files
1. `Backend/src/api/game/game-list/sliding-puzzle/schema/create-sliding-puzzle.schema.ts`
2. `Backend/src/api/game/game-list/sliding-puzzle/schema/update-sliding-puzzle.schema.ts`
3. `Backend/src/api/game/game-list/sliding-puzzle/schema/index.ts`
4. `Backend/src/api/game/game-list/sliding-puzzle/sliding-puzzle.service.ts`
5. `Backend/src/api/game/game-list/sliding-puzzle/sliding-puzzle.controller.ts`
6. `Backend/src/api/game/game-list/sliding-puzzle/README.md`
7. `Backend/src/common/interface/games/sliding-puzzle.interface.ts`

### Frontend Files
1. `Frontend/src/pages/sliding-puzzle/PlaySlidingPuzzle.tsx`
2. `Frontend/src/pages/sliding-puzzle/CreateSlidingPuzzle.tsx`
3. `Frontend/src/pages/sliding-puzzle/EditSlidingPuzzle.tsx`
4. `Frontend/src/pages/sliding-puzzle/README.md`

### Modified Files
1. `Backend/src/api/game/game-list/game-list.router.ts` - Added sliding puzzle route
2. `Backend/src/common/interface/games/index.ts` - Exported sliding puzzle interface
3. `Backend/prisma/seeder/data/game-templates.data.csv` - Updated description
4. `Frontend/src/App.tsx` - Added sliding puzzle routes

## 🚀 How to Test

### 1. Start Backend Server
```bash
cd Backend
bun run start:dev
```

### 2. Start Frontend Server
```bash
cd Frontend
npm run dev
```

### 3. Test Create Puzzle
1. Login to WordIT
2. Navigate to `/create-sliding-puzzle`
3. Fill in the form:
   - Title: "My First Puzzle"
   - Description: "A test puzzle"
   - Upload thumbnail image
   - Upload puzzle image
   - Select grid size (e.g., 4x4)
   - Set time limit (optional)
4. Click "Publish" or "Save Draft"

### 4. Test Play Puzzle
1. Navigate to `/sliding-puzzle/play/:id` (replace :id with your puzzle ID)
2. Click "Start Game"
3. Click tiles to slide them
4. Try pause/resume
5. Try preview
6. Complete the puzzle

### 5. Test Edit Puzzle
1. Navigate to `/sliding-puzzle/edit/:id`
2. Update any fields
3. Click "Save Changes"

## 🎮 Game Features

### Core Mechanics
- **Tile Sliding**: Click tiles adjacent to empty space to slide
- **Shuffle**: Random but solvable puzzle generation
- **Win Detection**: Automatic detection when puzzle is solved
- **Timer**: Track time taken to solve
- **Move Counter**: Count number of moves made

### Additional Features
- **Pause/Resume**: Pause game and blur puzzle
- **Preview**: Show original image for reference
- **Restart**: Reshuffle and start over
- **Exit**: Return to home (increments play count)
- **Grid Sizes**: 3x3, 4x4, 5x5, 6x6
- **Time Limit**: Optional countdown timer

## 📊 API Testing

### Create Puzzle (POST)
```bash
curl -X POST http://localhost:4000/api/game/game-type/sliding-puzzle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test Puzzle" \
  -F "description=A test puzzle" \
  -F "thumbnail_image=@thumbnail.jpg" \
  -F "puzzle_image=@puzzle.jpg" \
  -F "grid_size=4" \
  -F "time_limit=300" \
  -F "is_publish_immediately=true"
```

### Get Puzzle for Play (GET)
```bash
curl http://localhost:4000/api/game/game-type/sliding-puzzle/:id/play/public
```

### Update Puzzle (PATCH)
```bash
curl -X PATCH http://localhost:4000/api/game/game-type/sliding-puzzle/:id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Updated Puzzle" \
  -F "grid_size=5"
```

### Delete Puzzle (DELETE)
```bash
curl -X DELETE http://localhost:4000/api/game/game-type/sliding-puzzle/:id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎨 UI Screenshots

### Create Page
- Form with title, description inputs
- Image upload zones (thumbnail + puzzle)
- Grid size selector
- Time limit input
- Preview section

### Play Page
- Puzzle grid with sliding tiles
- Timer and move counter
- Control buttons (Pause, Restart, Preview, Exit)
- Win screen with statistics

### Edit Page
- Same as create page but with existing data
- Publish toggle switch
- Current images displayed

## 📝 Pull Request Template

When creating pull request, use this format:

**Title**: `[Your Team Name] Add Sliding Puzzle Game`

**Description**:
```markdown
## Game Information
- **Game Name**: Sliding Puzzle
- **Difficulty**: Medium
- **Team Members**: [Your Names]

## Features Implemented
- ✅ Create sliding puzzle with custom image
- ✅ Configurable grid size (3x3 to 6x6)
- ✅ Optional time limit
- ✅ Interactive gameplay with tile sliding
- ✅ Shuffle algorithm with solvability check
- ✅ Timer and move counter
- ✅ Pause/Resume functionality
- ✅ Preview original image
- ✅ Win detection
- ✅ Edit and delete functionality

## How to Play
1. Click "Start Game" to shuffle tiles
2. Click tiles adjacent to empty space to slide them
3. Complete the puzzle by arranging all tiles correctly
4. Use pause button to stop timer
5. Use preview to see original image

## API Endpoints
- POST /api/game/game-type/sliding-puzzle - Create puzzle
- GET /api/game/game-type/sliding-puzzle/:id - Get detail
- GET /api/game/game-type/sliding-puzzle/:id/play/public - Play (public)
- GET /api/game/game-type/sliding-puzzle/:id/play/private - Play (private)
- PATCH /api/game/game-type/sliding-puzzle/:id - Update puzzle
- DELETE /api/game/game-type/sliding-puzzle/:id - Delete puzzle

## Testing
Tested on:
- Chrome
- Firefox
- Edge

All features working as expected.
```

## 🐛 Troubleshooting

### Backend Issues
1. **Module not found errors**: Run `bun install` in Backend folder
2. **Database connection error**: Check `.env.development` file
3. **File upload error**: Check file size limits (5MB for puzzle image)

### Frontend Issues
1. **Component not found**: Run `npm install` in Frontend folder
2. **Route not working**: Check App.tsx routes
3. **Image not displaying**: Check VITE_API_URL in `.env`

## 📚 References
- [Wordwall Sliding Puzzle](https://wordwall.net/resource/sliding-puzzle)
- [Interacty Sliding Puzzle](https://interacty.me/projects/sliding-puzzle)
- [Fisher-Yates Shuffle Algorithm](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [Sliding Puzzle Solvability](https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/)

## 🎓 Learning Points
1. **Image Manipulation**: Using CSS background-position to split images
2. **Algorithm**: Implementing shuffle with solvability check
3. **State Management**: Managing complex game state with React hooks
4. **File Upload**: Handling multipart/form-data in Express
5. **TypeScript**: Strong typing for game data structures

## ✨ Credits
- **Developer**: Arya Refman
- **Project**: WordIT Final Project
- **Course**: Pemrograman Web 2025
- **Institution**: Institut Teknologi Sepuluh Nopember

## 📄 License
This implementation is part of WordIT open-source project.
