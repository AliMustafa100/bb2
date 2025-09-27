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
3. **Use Spell**: Press 'S' key to cast the selected spell
4. **Select Item**: Click on an item card to select it
5. **Use Item**: Press 'I' key to use the selected item

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

## Game Mechanics

### Dice Rolling
- Roll a 20-sided die to determine if you can use spells/items
- Higher rolls unlock more powerful abilities
- Some items have no roll requirement

### Magical Effects
- **Frozen Squares**: Blue squares that prevent movement
- **Barriers**: Brown squares that block all movement
- **Rage**: Allows double dice rolling for higher results
- **Queen's Soul**: King gains queen movement abilities

### Turn Management
- Each turn allows up to 3 spells or items
- Using certain spells/items ends your turn immediately
- Regular chess moves don't count toward the 3-item limit

## Technical Details

### File Structure
```
Boards-and-Battles/
├── app/
│   ├── app.html      # Main HTML interface
│   ├── app.css       # Styling and layout
│   └── app.js        # Game logic and UI
├── src/
│   ├── game/
│   │   └── index.js  # Original game entry point
│   ├── spells/
│   │   └── spells.js # Spell definitions
│   └── items/
│       └── items.js  # Item definitions
└── package.json
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

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Future Enhancements

- Multiplayer support
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

## Bugs and Fixes 
- Fix Spell Message Color ( Green -> Black )
- Hover over picture for names
- Debug Spells
- Be able to role One's

## License

ISC License - see package.json for details.
