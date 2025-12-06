# Boards and Battles - Magical Chess

A chess game enhanced with magical spells and special items that add strategic depth and excitement to traditional chess gameplay.

## Features

### Chess Game
- Full chess implementation with all standard rules
- Proper piece movement validation
- Check and checkmate detection
- Castling, en passant, and pawn promotion
- Visual move highlighting and piece selection

### Magical Spells
- **Thunder Spell**: Cast lightning from your king to capture enemy pieces
- **Rage**: Boost your dice rolls for the next 2 turns
- **Freeze**: Freeze 4 squares on the board, preventing movement
- **Necromancy**: Revive captured pieces from your graveyard
- **Agility**: Make 2 moves in one turn
- **Fireball**: Explosive spell that damages multiple adjacent pieces
- **Queen's Soul**: Allow your king to move like a queen for one turn

### Magical Items
- **Knife**: Stab adjacent pieces to capture them
- **Magic Wand**: Enable spells for non-king pieces
- **Barrier**: Place barriers that block movement
- **Wontan**: Powerful smite ability (requires high roll)
- **Ladder**: Allow pieces to jump over others
- **Fishing Net**: Temporarily capture pieces
- **Invisibility Potion**: Make pieces invisible (requires perception check)
- **Time Machine**: Undo previous moves
- **Skip**: End turn without moving
- **Lucky Coin**: Gamble with rewards and punishments
- **Mana Potion**: Replenish spell usage

## How to Play

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the game server:
   ```bash
   npm run serve
   ```

3. Open your browser to `http://localhost:8080`

### Game Rules

#### Chess Rules
- Standard chess piece movement and capture rules
- Check and checkmate conditions apply
- Capture the opponent's king to win

#### Magical Rules
- Roll dice to use spells (requires specific roll values: 5-17+)
- Spells can only be used by the king (unless Magic Wand is active)
- Items can be used by any piece
- Maximum 3 spells or items per turn
- Spells cannot kill the king
- King cannot be revived

### Controls

#### Chess Moves
- Click on a piece to select it
- Click on a valid square to move
- Valid moves are highlighted in green

#### Magical Actions
1. **Roll Dice**: Click the "Roll Dice" button to get a random number (1-20)
2. **Select Spell**: Click on a spell card to select it
3. **Use Spell**: Press 'S' key or click "Use Selected Spell" button to cast the selected spell
4. **Select Item**: Click on an item card to select it
5. **Use Item**: Press 'I' key or click "Use Selected Item" button to use the selected item
6. **Skip Turn**: Click "Skip Turn" button to skip your turn
7. **End Turn**: Click "End Turn" button to confirm and end your turn

### Spell Requirements
- **Rage**: Roll 5+
- **Thunder Spell**: Roll 10+
- **Freeze**: Roll 10+
- **Agility**: Roll 11+
- **Necromancy**: Roll 15+
- **Fireball**: Roll 15+
- **Queen's Soul**: Roll 17+

### Item Requirements
- **Wontan**: Roll 17+
- **Invisibility Potion**: Roll 13+
- Most other items have no roll requirement

### Spell Targeting
Most spells now require clicking on target squares on the board:
- **Thunder Spell**: Click a direction to cast thunder in that line
- **Fireball**: Click a target square to explode
- **Freeze**: Click the top-left of a 2x2 area to freeze
- **Necromancy**: Click an empty square adjacent to your king to revive a piece
- **Barrier**: Click an empty square to place barrier
- **Fishing Net**: Click an enemy piece to temporarily capture
- **Knife**: Click an adjacent square to stab
- **Invisibility Potion**: Click your piece to make it invisible

## Game Mechanics

### Dice Rolling
- Roll a 20-sided die to determine if you can use spells/items
- Higher rolls unlock more powerful abilities
- Some items have no roll requirement
- **Rage effect**: When active, roll twice and use the higher result

### Magical Effects
- **Frozen Squares**: Blue squares that prevent movement
- **Barriers**: Brown squares that block all movement
- **Rage**: Allows double dice rolling for higher results
- **Queen's Soul**: King gains queen movement abilities
- **Agility**: Allows 2 moves in one turn
- **Magic Wand**: Enables non-king pieces to use spells
- **Invisibility**: Makes a piece invisible for 2 turns

### Turn Management
- Each turn allows up to 3 spells or items
- Turn phases: Move → Spell → Item
- Using certain spells/items ends your turn immediately
- Regular chess moves don't count toward the 3-item limit
- Use "End Turn" button to confirm and end your turn
- Use "Skip Turn" button to skip your entire turn

### Spell Usage Limits
- Each spell has a usage limit per game (typically 1 use per spell)
- Spell usage is tracked and displayed on spell cards
- Once a spell reaches its limit, it becomes disabled

## Technical Details

### File Structure
```
Boards-and-Battles/
├── index.html      # Main HTML interface
├── app.html        # Alternative HTML interface
├── app.css         # Styling and layout
├── app.js          # Game logic and UI
├── package.json    # Dependencies and scripts
└── README.md       # This file
```

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Game Logic**: Object-oriented JavaScript
- **Server**: http-server for local development

## Development

### Running Locally
```bash
npm install
npm run serve
```

The game will open automatically in your browser at `http://localhost:8080`

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Future Enhancements
- AI opponents
- More spells and items
- Sound effects and animations
- Mobile responsiveness improvements
- Save/load game states
- Tournament mode

## Contributing
Feel free to contribute by:
- Adding new spells or items
- Improving the UI/UX
- Fixing bugs
- Adding new features
- Writing tests

## License
ISC License - see package.json for details.
