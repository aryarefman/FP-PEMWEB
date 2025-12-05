require('dotenv').config({ path: '.env.development' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const templates = [
    { id: 'd7d8399a-8a98-44f3-a665-ed03a6b9a5d0', slug: 'quiz', name: 'Quiz', description: 'Create a multiple choice Game', logo: 'atom', is_time_limit_based: false, is_life_based: false },
    { id: '9fdcf0f2-9b09-4cac-b648-b349c5c07388', slug: 'sliding-puzzle', name: 'Sliding Puzzle', description: 'Slide tiles to complete the picture puzzle', logo: 'images', is_time_limit_based: false, is_life_based: false },
    { id: '8fcc856e-4366-4275-802f-2cda5e010183', slug: 'anagram', name: 'Anagram', description: 'Lorem', logo: 'book-a', is_time_limit_based: false, is_life_based: false },
    { id: '0eabc2f1-0119-48f4-84e8-2e9a2375757c', slug: 'spin-the-wheel', name: 'Spin the Wheel', description: 'Lorem', logo: 'disc-3', is_time_limit_based: false, is_life_based: false },
    { id: '1c6f82ad-3f6f-4a98-8fb9-e52fcb1cce84', slug: 'open-the-box', name: 'Open the Box', description: 'Lorem', logo: 'archive-restore', is_time_limit_based: true, is_life_based: false },
    { id: '80075968-6986-4980-a735-d76a287cf78d', slug: 'unjumble', name: 'Unjumble', description: 'Lorem', logo: 'combine', is_time_limit_based: false, is_life_based: false },
    { id: '29d219ad-abc3-4cbc-8f60-d2b1d06efeff', slug: 'matching-pair', name: 'Matching Pair', description: 'Lorem', logo: 'users', is_time_limit_based: false, is_life_based: false },
    { id: 'd97887a7-63bf-47ab-8531-38d3c44943fb', slug: 'match-up', name: 'Match Up', description: 'Lorem', logo: 'table', is_time_limit_based: false, is_life_based: false },
    { id: '83eef1fb-e8eb-4b57-b62a-d032d33ba3b6', slug: 'flash-cards', name: 'Flash Cards', description: 'Lorem', logo: 'sticker', is_time_limit_based: false, is_life_based: false },
    { id: '364db0b7-8116-46c1-8a86-f62ca7c1e9a4', slug: 'find-the-match', name: 'Find the Match', description: 'Lorem', logo: 'square-activity', is_time_limit_based: false, is_life_based: true },
    { id: '04f5c7f1-fdd3-485b-b43f-478f4888ed68', slug: 'group-sort', name: 'Group Sort', description: 'Lorem', logo: 'square-stack', is_time_limit_based: false, is_life_based: false },
    { id: '14add151-bda7-4473-bed5-552027c8ca1e', slug: 'complete-the-sentence', name: 'Complete the Sentence', description: 'Lorem', logo: 'rectangle-ellipsis', is_time_limit_based: false, is_life_based: false },
    { id: '7a716582-a686-41fc-b3ef-48c3dd30b57b', slug: 'speaking-cards', name: 'Speaking Cards', description: 'Lorem', logo: 'speech', is_time_limit_based: false, is_life_based: false },
    { id: '785e62e3-fc58-4cbd-9ffe-c0063c0c1207', slug: 'word-search', name: 'Word Search', description: 'Lorem', logo: 'text-search', is_time_limit_based: true, is_life_based: true },
    { id: 'a67b668c-e95d-483e-8d4e-385b050f5646', slug: 'gameshow-quiz', name: 'Gameshow Quiz', description: 'Lorem', logo: 'theater', is_time_limit_based: true, is_life_based: false },
    { id: '945328c2-a578-4a62-af7d-4ef93ee000e3', slug: 'maze-chase', name: 'Maze Chase', description: 'Lorem', logo: 'gamepad-directional', is_time_limit_based: false, is_life_based: true },
    { id: '87338387-b0cc-462e-9489-a0070f98c3a1', slug: 'crossword', name: 'Crossword', description: 'Lorem', logo: 'panels-right-bottom', is_time_limit_based: false, is_life_based: false },
    { id: 'a2678379-5c86-4f05-a10a-f37370732e1d', slug: 'labelled-diagram', name: 'Labelled Diagram', description: 'Lorem', logo: 'pin', is_time_limit_based: false, is_life_based: false },
    { id: 'ac8b43c2-1bee-4a3f-a9ad-b8aa6f8a8d10', slug: 'true-or-false', name: 'True or False', description: 'Lorem', logo: 'book-open-check', is_time_limit_based: true, is_life_based: false },
    { id: '374043f0-8c5c-4c0e-9985-cb8e2ef68936', slug: 'hangman', name: 'Hangman', description: 'Lorem', logo: 'skull', is_time_limit_based: false, is_life_based: true },
    { id: 'a947e0b8-f3f1-4c20-af14-63ac04c8ed8d', slug: 'airplane', name: 'Airplane', description: 'Lorem', logo: 'plane', is_time_limit_based: false, is_life_based: true },
    { id: '9803ce6b-8d0c-47fe-8306-9411e3399665', slug: 'whack-a-mole', name: 'Whack-a-Mole', description: 'Lorem', logo: 'gavel', is_time_limit_based: true, is_life_based: false },
    { id: '9d13d300-fe45-4fa3-88d3-4f944e1a7f01', slug: 'baloon-pop', name: 'Baloon Pop', description: 'Lorem', logo: 'bow-arrow', is_time_limit_based: true, is_life_based: false },
    { id: 'b7efa7d0-fe73-4a5b-80d8-953cee5a39dc', slug: 'image-quiz', name: 'Image Quiz', description: 'Lorem', logo: 'aperture', is_time_limit_based: true, is_life_based: false },
    { id: '665a54ee-1920-4d00-a593-c79ee8b738fa', slug: 'flip-tiles', name: 'Flip Tiles', description: 'Lorem', logo: 'copy-slash', is_time_limit_based: false, is_life_based: false },
    { id: 'ec1fdf17-7935-4da9-a346-7bfd887fb56c', slug: 'rank-order', name: 'Rank Order', description: 'Lorem', logo: 'list-collapse', is_time_limit_based: false, is_life_based: false },
    { id: '246e89e4-081e-4aae-b202-56c7a8c44e8f', slug: 'win-or-lose-quiz', name: 'Win or Lose Quiz', description: 'Lorem', logo: 'spade', is_time_limit_based: false, is_life_based: false },
    { id: '6a7e3503-6faa-4d61-ab14-01b868fd1c70', slug: 'watch-and-memorize', name: 'Watch and Memorize', description: 'Lorem', logo: 'brain', is_time_limit_based: true, is_life_based: false },
    { id: '2614daa4-efec-46b2-a95a-ee5651578465', slug: 'word-magnet', name: 'Word Magnet', description: 'Lorem', logo: 'magnet', is_time_limit_based: false, is_life_based: false },
    { id: '6dd614dc-bdcd-4cf9-a8d4-a98f497b39ec', slug: 'flying-fruit', name: 'Flying Fruit', description: 'Lorem', logo: 'citrus', is_time_limit_based: false, is_life_based: true },
    { id: '474d18da-c038-4ca6-b6b2-2c88fff6a006', slug: 'math-generator', name: 'Math Generator', description: 'Lorem', logo: 'sigma', is_time_limit_based: false, is_life_based: false },
    { id: 'b8b126af-011f-49f8-8616-ec8ed9180e33', slug: 'pair-or-no-pair', name: 'pair or No Pair', description: 'Lorem', logo: 'grid-2x2-x', is_time_limit_based: false, is_life_based: false },
    { id: 'ba2f6e6a-ca73-472f-a227-69a6e861f754', slug: 'speed-sorting', name: 'Speed Sorting', description: 'Lorem', logo: 'clock-arrow-down', is_time_limit_based: false, is_life_based: false },
    { id: '2bdeb39e-9041-4997-992b-eeeb82f03894', slug: 'spell-the-word', name: 'Spell the Word', description: 'Lorem', logo: 'megaphone', is_time_limit_based: false, is_life_based: false },
    { id: 'cc7634f2-ddd9-450e-a0c7-7e80c7cd206d', slug: 'type-the-answer', name: 'Type the Answer', description: 'Lorem', logo: 'text-cursor-input', is_time_limit_based: false, is_life_based: false },
    { id: 'c3d8a6c3-0db2-4b01-ae77-31e8af182784', slug: 'jeopardy', name: 'Jeopardy', description: 'Lorem', logo: 'spotlight', is_time_limit_based: false, is_life_based: false },
    { id: '06415ea7-d932-4b10-a285-f53201edf108', slug: 'puzzle', name: 'Puzzle', description: 'Lorem', logo: 'puzzle', is_time_limit_based: false, is_life_based: false },
    { id: 'a600b3e5-c26e-4780-992f-22ba0d19e0a3', slug: 'type-speed', name: 'Type Speed', description: 'Lorem', logo: 'keyboard', is_time_limit_based: true, is_life_based: false }
];

async function seed() {
    console.log('🌱 Starting quick seed...');

    try {
        let count = 0;
        for (const template of templates) {
            await prisma.gameTemplates.upsert({
                where: { slug: template.slug },
                update: template,
                create: template
            });
            count++;
        }

        console.log('✅ Successfully seeded', count, 'game templates!');
        console.log('🎮 Sliding Puzzle template is now available!');
    } catch (error) {
        console.error('❌ Error seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
