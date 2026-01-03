// Enhanced Magical Chess Game with Timer and Turn Counter System

const spell_limit ={
  Thunder_Spell: 1,
  Rage: 1,
  Freeze: 1,
  Necromancy: 1,
  Agility: 1,
  Fireball: 1,
  Invisibility_Potion: 1,
  Queens_Soul: 1,
  Knife: 1,
  Magic_Wand: 1,
  Barrier: 1,
  Fishing_Net: 1,
  Time_Machine: 1,
  Skip: 1,
  Lucky_Coin: 1,
  Wontan: 1,
  Ladder: 1,
  Mana_Potion: 1,
}

class MagicalChessGame {
  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.moveHistory = [];
    this.gameStatus = "active";
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true },
    };
    this.kingPositions = { white: [7, 4], black: [0, 4] };
    
    // Enhanced Magical game state with proper timer tracking
    this.spells = this.initializeSpells();
    this.items = this.initializeItems();
    
    // Enhanced player state with comprehensive timer tracking and spell usage limits
    this.playerState = {
      white: { 
        rageTurns: 0, 
        extraMove: false, 
        kingCanMoveLikeQueen: false, 
        kingCanMoveLikeQueenTurns: 0,
        agilityTurns: 0,
        magicWandTurns: 0,
        invisibilityTurns: 0,
        barrierTurns: 0,
        spellsUsed: {}, // Track per-spell usage
        ladderActive: false,
        ladderTurns: 0
      },
      black: { 
        rageTurns: 0, 
        extraMove: false, 
        kingCanMoveLikeQueen: false,
        kingCanMoveLikeQueenTurns: 0,
        agilityTurns: 0,
        magicWandTurns: 0,
        invisibilityTurns: 0,
        barrierTurns: 0,
        spellsUsed: {}, // Track per-spell usage
        ladderActive: false,
        ladderTurns: 0
      }
    };
    
    this.waitingForTarget = false;
    this.pendingSpellAction = null;
    
    // Enhanced freeze system with proper timer tracking
    this.freezeEffect = {
      active: false,
      squares: [],
      remainingTurns: 0,
      totalTurns: 0,
      caster: null
    };
    
    // Enhanced temporary captures with timer tracking
    this.temporaryCaptures = [];
    
    this.barriers = [];
    this.capturedPieces = { white: [], black: [] }; // Array of {piece, row, col} objects
    this.currentDiceRoll = null;
    this.spellsUsedThisTurn = 0;
    this.itemsUsedThisTurn = 0;
    this.selectedSpell = null;
    this.selectedItem = null;
    this.turnCounter = 0;
    this.turnPhase = "move"; // "move", "spell", "item" - current phase of turn
    this.movesThisTurn = 0;

    console.log("Creating board..."); this.createBoard();
    console.log("Creating spells UI..."); this.createSpellsUI();
    console.log("Creating items UI..."); this.createItemsUI();
    this.createEffectsDisplay();
    this.updateUI();
  }

  initializeBoard() {
    return [
      ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
      ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
      ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
    ];
  }

  initializeSpells() {
    return {
      Thunder_Spell: {
        name: "Thunder Spell",
        description: "Cast a bolt of thunder from your king in a straight line. Click a target square to strike the first piece in that direction.",
        condition: "Roll a 10 or higher.",
        minRoll: 10,
        requiresTarget: true,
        effect: (game, targetRow, targetCol) => {
          const king = game.findKing(game.currentPlayer);
          if (!king) return "King not found";
          
          if (targetRow === undefined || targetCol === undefined) {
            game.waitingForTarget = true;
            game.pendingSpellAction = { type: "Thunder_Spell", king: king };
            return "Click a target square to cast thunder in that direction.";
          }
          
          // Calculate direction from king to target
          const rowDiff = targetRow - king.row;
          const colDiff = targetCol - king.col;
          
          // Normalize direction (only straight lines: horizontal, vertical, or diagonal)
          if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
            return "Thunder must be cast in a straight line (horizontal, vertical, or diagonal).";
          }
          
          const rowStep = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
          const colStep = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);
          
          // Find first piece in that direction
          let currentRow = king.row + rowStep;
          let currentCol = king.col + colStep;
          
          while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
            const piece = game.getPieceAt(currentRow, currentCol);
            if (piece) {
              // Don't capture own king
              if (piece === "♚" || piece === "♔") {
                return "Cannot target king with thunder.";
              }
              game.capturePieceAt(currentRow, currentCol);
              game.waitingForTarget = false;
              game.pendingSpellAction = null;
              return `⚡ Thunder struck ${piece} at (${currentRow}, ${currentCol})!`;
            }
            currentRow += rowStep;
            currentCol += colStep;
          }
          
          game.waitingForTarget = false;
          game.pendingSpellAction = null;
          return "Thunder traveled but hit nothing.";
        }
      },
      Rage: {
        name: "Rage",
        description: "On your next 2 turns, you get to roll twice, and you use the higher roll.",
        condition: "Roll a 5 or higher.",
        minRoll: 5,
        spellLimit: 1,
        duration: 2,
        effect: (game) => {
          game.playerState[game.currentPlayer].rageTurns = 2;
          return "💢 Rage activated! Next 2 rolls will be boosted.";
        }
      },
      Freeze: {
        name: "Freeze",
        description: "Freezes 4 squares in a 2x2 area. Click the top-left square of the area to freeze. Lasts for 2 turns.",
        condition: "Roll a 10 or higher.",
        minRoll: 10,
        duration: 2,
        requiresTarget: true,
        effect: (game, targetRow, targetCol) => {
          if (targetRow === undefined || targetCol === undefined) {
            game.waitingForTarget = true;
            game.pendingSpellAction = { type: "Freeze" };
            return "Click the top-left square of a 2x2 area to freeze.";
          }
          
          // Validate 2x2 area fits on board
          if (targetRow < 0 || targetRow > 6 || targetCol < 0 || targetCol > 6) {
            return "Invalid area. Must be a valid 2x2 square on the board.";
          }
          
          const squares = [
            {row: targetRow, col: targetCol},
            {row: targetRow, col: targetCol + 1},
            {row: targetRow + 1, col: targetCol},
            {row: targetRow + 1, col: targetCol + 1},
          ];
          
          game.freezeEffect = {
            active: true,
            squares: squares,
            remainingTurns: 4,
            totalTurns: 4,
            caster: game.currentPlayer
          };
          
          game.waitingForTarget = false;
          game.pendingSpellAction = null;
          return `❄️ Freeze spell activated! 2x2 area frozen for 2 turns at (${targetRow},${targetCol}).`;
        }
      },
      Necromancy: {
        name: "Necromancy",
        description: "Bring a piece back from the dead at the same place it died. If that space is taken, the revival is invalid.",
        condition: "Roll a 15 or higher.",
        minRoll: 15,
        requiresTarget: false,
        effect: (game) => {
          const graveyard = game.capturedPieces[game.currentPlayer];
          if (graveyard.length === 0) {
            return "Graveyard is empty.";
          }
          
          // Find the most recently captured piece with position information
          // (in case there are old format entries without position)
          let lastCapturedIndex = -1;
          let lastCaptured = null;
          for (let i = graveyard.length - 1; i >= 0; i--) {
            const entry = graveyard[i];
            if (typeof entry === 'object' && entry.piece && entry.row !== undefined && entry.col !== undefined) {
              lastCaptured = entry;
              lastCapturedIndex = i;
              break;
            }
          }
          
          if (!lastCaptured) {
            return "Invalid - no pieces with death location information found in graveyard.";
          }
          
          const { piece, row, col } = lastCaptured;
          
          // Check if the original death location is available
          const currentPiece = game.getPieceAt(row, col);
          if (currentPiece) {
            return "Invalid - the space where the piece died is now occupied.";
          }
          
          // Check if the square is frozen or has a barrier
          if (game.isSquareFrozen(row, col) || game.isSquareBarrier(row, col)) {
            return "Invalid - the space where the piece died is blocked (frozen or has barrier).";
          }
          
          // Revive the piece at its original death location
          game.board[row][col] = piece;
          graveyard.splice(lastCapturedIndex, 1); // Remove the specific entry from graveyard
          
          return `💀 ${piece} has been revived at (${row}, ${col}) - the same place it died.`;
        }
      },
      Agility: {
        name: "Agility",
        description: "You can make 2 moves this turn.",
        condition: "Roll an 11 or higher.",
        minRoll: 11,
        duration: 1,
        effect: (game) => {
          game.playerState[game.currentPlayer].extraMove = true;
          game.playerState[game.currentPlayer].agilityTurns = 1;
          return "🏃 Agility activated! You may move twice this turn.";
        }
      },
      Fireball: {
        name: "Fireball",
        description: "Cast a fireball at a target square. Captures the piece there and all adjacent pieces within 1 square.",
        condition: "Roll a 15 or higher.",
        minRoll: 15,
        requiresTarget: true,
        effect: (game, targetRow, targetCol) => {
          if (targetRow === undefined || targetCol === undefined) {
            game.waitingForTarget = true;
            game.pendingSpellAction = { type: "Fireball" };
            return "Click a target square to cast fireball.";
          }
          
          if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8) {
            return "Invalid target square.";
          }
          
          const target = { row: targetRow, col: targetCol };
          const impactedSquares = game.getFireballImpactArea(target);
          
          let capturedCount = 0;
          for (const square of impactedSquares) {
            const piece = game.getPieceAt(square.row, square.col);
            if (piece && piece !== "♚" && piece !== "♔") {
              game.capturePieceAt(square.row, square.col);
              capturedCount++;
            }
          }
          
          game.waitingForTarget = false;
          game.pendingSpellAction = null;
          return `🔥 Fireball exploded! ${capturedCount} pieces captured.`;
        }
      },
      Invisibility_Potion: {
        name: "Invisibility Potion",
        description: "Make one of your pieces invisible for 2 turns. Click your piece to make it invisible.",
        condition: "Requires a 13 or higher.",
        minRoll: 13,
        duration: 2,
        requiresTarget: true,
        effect: (game, targetRow, targetCol) => {
          if (targetRow === undefined || targetCol === undefined) {
            game.waitingForTarget = true;
            game.pendingSpellAction = { type: "Invisibility_Potion" };
            return "Click one of your pieces to make it invisible.";
          }
          
          const piece = game.getPieceAt(targetRow, targetCol);
          if (!piece) return "No piece at that square.";
          
          const ownSymbols = game.currentPlayer === "white" ? 
            ["♖", "♘", "♗", "♕", "♔", "♙"] : 
            ["♜", "♞", "♝", "♛", "♚", "♟"];
          
          if (!ownSymbols.includes(piece)) return "Must target your own piece.";
          if (piece === "♚" || piece === "♔") return "Cannot make king invisible.";
          
          // Store invisible piece
          if (!game.playerState[game.currentPlayer].invisiblePiece) {
            game.playerState[game.currentPlayer].invisiblePiece = { row: targetRow, col: targetCol };
            game.playerState[game.currentPlayer].invisibilityTurns = 2;
          }
          
          game.waitingForTarget = false;
          game.pendingSpellAction = null;
          return `👻 ${piece} at (${targetRow}, ${targetCol}) is now invisible for 2 turns.`;
        }
      },
      Queens_Soul: {
        name: "Queen's Soul",
        description: "Allows the king to move as if it was a queen for 1 turn.",
        condition: "Roll a 17 or higher.",
        minRoll: 17,
        duration: 1,
        effect: (game) => {
          game.playerState[game.currentPlayer].kingCanMoveLikeQueen = true;
          game.playerState[game.currentPlayer].kingCanMoveLikeQueenTurns = 1;
          return "👑 The King is empowered with the Queen's soul for 1 turn!";
        }
      }
    };
  }

  initializeItems() {
    return {
      Knife: {
        name: "Knife",
        description: "Stab a piece adjacent to your king. Click an adjacent square to capture the piece there.",
        requiresTarget: true,
        effect: (game, targetRow, targetCol) => {
          const king = game.findKing(game.currentPlayer);
          if (!king) return "King not found";
          
          if (targetRow === undefined || targetCol === undefined) {
            game.waitingForTarget = true;
            game.pendingSpellAction = { type: "Knife", king: king };
            return "Click an adjacent square to stab.";
          }
          
          // Check if target is adjacent to king
          const rowDiff = Math.abs(targetRow - king.row);
          const colDiff = Math.abs(targetCol - king.col);
          
          if (rowDiff > 1 || colDiff > 1 || (rowDiff === 0 && colDiff === 0)) {
            return "Target must be adjacent to your king.";
          }
          
          const piece = game.getPieceAt(targetRow, targetCol);
          if (!piece) return "No piece to stab at that square.";
          if (piece === "♚" || piece === "♔") return "Cannot stab king.";
          
          game.capturePieceAt(targetRow, targetCol);
          game.waitingForTarget = false;
          game.pendingSpellAction = null;
          return `🗡️ Stabbed ${piece} at (${targetRow}, ${targetCol})!`;
        }
      },
      Magic_Wand: {
        name: "Magic Wand",
        description: "Lets pieces other than the king use spells. Lasts for 3 turns.",
        duration: 3,
        effect: (game) => {
          game.playerState[game.currentPlayer].magicWandTurns = 3;
          return "🪄 Magic Wand activated! Non-king pieces can use spells for 3 turns.";
        }
      },
      Barrier: {
        name: "Barrier",
        description: "Place a barrier on an empty square. Click a square to place the barrier. Lasts for 5 turns.",
        duration: 5,
        requiresTarget: true,
        effect: (game, targetRow, targetCol) => {
          if (targetRow === undefined || targetCol === undefined) {
            game.waitingForTarget = true;
            game.pendingSpellAction = { type: "Barrier" };
            return "Click an empty square to place barrier.";
          }
          
          if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8) {
            return "Invalid square.";
          }
          
          const piece = game.getPieceAt(targetRow, targetCol);
          if (piece) return "Square must be empty to place barrier.";
          if (game.isSquareFrozen(targetRow, targetCol)) return "Cannot place barrier on frozen square.";
          
          game.barriers.push({
            row: targetRow,
            col: targetCol,
            remainingTurns: 5,
            caster: game.currentPlayer
          });
          
          game.waitingForTarget = false;
          game.pendingSpellAction = null;
          return `🚧 Barrier placed at (${targetRow}, ${targetCol}) for 5 turns.`;
        }
      },
      Fishing_Net: {
        name: "Fishing Net",
        description: "Temporarily capture an enemy piece for 3 turns, then return it. Click a piece to capture.",
        duration: 3,
        requiresTarget: true,
        effect: (game, targetRow, targetCol) => {
          if (targetRow === undefined || targetCol === undefined) {
            game.waitingForTarget = true;
            game.pendingSpellAction = { type: "Fishing_Net" };
            return "Click an enemy piece to temporarily capture.";
          }
          
          const piece = game.getPieceAt(targetRow, targetCol);
          if (!piece) return "No piece at that square.";
          if (piece === "♚" || piece === "♔") return "Cannot capture king.";
          
          // Check if it's an enemy piece
          const enemySymbols = game.currentPlayer === "white" ? 
            ["♜", "♞", "♝", "♛", "♚", "♟"] : 
            ["♖", "♘", "♗", "♕", "♔", "♙"];
          
          if (!enemySymbols.includes(piece)) return "Must target an enemy piece.";
          
          game.temporaryCaptures.push({
            piece: piece,
            originalPosition: { row: targetRow, col: targetCol },
            remainingTurns: 3,
            caster: game.currentPlayer
          });
          
          game.board[targetRow][targetCol] = "";
          game.waitingForTarget = false;
          game.pendingSpellAction = null;
          return `🕸️ ${piece} temporarily captured for 3 turns.`;
        }
      },
      Time_Machine: {
        name: "Time Machine",
        description: "Redo your previous move. Both players undo their most recent move, then you make a new move.",
        effect: (game) => {
          if (game.moveHistory.length < 2) return "Not enough moves to undo";
          
          game.reverseMove();
          return "⏰ Time reversed! Make your new move.";
        }
      },
      Skip: {
        name: "Skip",
        description: "Skip the current phase (move, spell, or item) and proceed to the next phase.",
        effect: (game) => {
          // Skip current phase
          if (game.turnPhase === "move") {
            game.turnPhase = "spell";
            return "⏭️ Move phase skipped. Proceed to spell phase.";
          } else if (game.turnPhase === "spell") {
            game.turnPhase = "item";
            return "⏭️ Spell phase skipped. Proceed to item phase.";
          } else {
            game.turnPhase = "move";
            return "⏭️ Item phase skipped. Proceed to move phase.";
          }
        }
      },
      Lucky_Coin: {
        name: "Lucky Coin",
        description: "Gain +1 spell use this turn. No randomness - always beneficial.",
        effect: (game) => {
          game.spellsUsedThisTurn = Math.max(0, game.spellsUsedThisTurn - 1);
          return "🪙 Good fortune! +1 spell use this turn.";
        }
      },
      Mana_Potion: {
        name: "Mana Potion",
        description: "Completely replenish 1 spell use.",
        effect: (game) => {
          game.spellsUsedThisTurn = Math.max(0, game.spellsUsedThisTurn - 1);
          return "🧪 Mana restored! +1 spell use this turn.";
        }
      },
      Wontan: {
        name: "Wontan",
        description: "Powerful smite that captures an enemy piece. Click an enemy piece to smite it.",
        condition: "Roll a 17 or higher.",
        minRoll: 17,
        requiresTarget: true,
        effect: (game, targetRow, targetCol) => {
          if (targetRow === undefined || targetCol === undefined) {
            game.waitingForTarget = true;
            game.pendingSpellAction = { type: "Wontan" };
            return "Click an enemy piece to smite.";
          }
          
          const piece = game.getPieceAt(targetRow, targetCol);
          if (!piece) return "No piece at that square.";
          if (piece === "♚" || piece === "♔") return "Cannot smite king.";
          
          // Check if it's an enemy piece
          const enemySymbols = game.currentPlayer === "white" ? 
            ["♜", "♞", "♝", "♛", "♚", "♟"] : 
            ["♖", "♘", "♗", "♕", "♔", "♙"];
          
          if (!enemySymbols.includes(piece)) return "Must target an enemy piece.";
          
          game.capturePieceAt(targetRow, targetCol);
          game.waitingForTarget = false;
          game.pendingSpellAction = null;
          return `⚡ Wontan smote ${piece} at (${targetRow}, ${targetCol})!`;
        }
      },
      Ladder: {
        name: "Ladder",
        description: "Allow a piece to jump over other pieces this turn. Select a piece, then it can jump over obstacles.",
        effect: (game) => {
          // Enable jumping for all pieces this turn
          game.playerState[game.currentPlayer].ladderActive = true;
          game.playerState[game.currentPlayer].ladderTurns = 1;
          return "🪜 Ladder activated! Your pieces can jump over others this turn.";
        }
      }
    };
  }

  // Create effects display to show active timers
  createEffectsDisplay() {
    // Check if effects display already exists in HTML
    const existingDisplay = document.querySelector('.effects-display');
    if (existingDisplay) {
      // Effects display already exists in HTML, don't create duplicate
      return;
    }
    
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;
    
    const effectsDisplay = document.createElement('div');
    effectsDisplay.id = 'effectsDisplay';
    effectsDisplay.className = 'effects-display';
    effectsDisplay.innerHTML = `
      <h3>Active Effects</h3>
      <div id="activeEffectsList" class="effects-list"></div>
    `;
    
    gameArea.appendChild(effectsDisplay);
  }

  // Update effects display with current timers
  updateEffectsDisplay() {
    const effectsList = document.getElementById('activeEffectsList');
    if (!effectsList) return;
    
    let effects = [];
    
    // Check freeze effect
    if (this.freezeEffect.active) {
      effects.push(`❄️ Freeze: ${this.freezeEffect.remainingTurns} turns remaining`);
    }
    
    // Check player state effects
    for (const [player, state] of Object.entries(this.playerState)) {
      const playerColor = player === this.currentPlayer ? '🔥' : '❄️';
      
      if (state.rageTurns > 0) {
        effects.push(`${playerColor} ${player} Rage: ${state.rageTurns} turns`);
      }
      if (state.kingCanMoveLikeQueenTurns > 0) {
        effects.push(`${playerColor} ${player} Queen's Soul: ${state.kingCanMoveLikeQueenTurns} turns`);
      }
      if (state.agilityTurns > 0) {
        effects.push(`${playerColor} ${player} Agility: ${state.agilityTurns} turns`);
      }
      if (state.magicWandTurns > 0) {
        effects.push(`${playerColor} ${player} Magic Wand: ${state.magicWandTurns} turns`);
      }
      if (state.invisibilityTurns > 0) {
        effects.push(`${playerColor} ${player} Invisibility: ${state.invisibilityTurns} turns`);
      }
      if (state.ladderTurns > 0) {
        effects.push(`${playerColor} ${player} Ladder: ${state.ladderTurns} turns`);
      }
    }
    
    // Check barriers
    this.barriers.forEach((barrier, index) => {
      if (barrier.remainingTurns > 0) {
        effects.push(`🚧 Barrier (${barrier.row},${barrier.col}): ${barrier.remainingTurns} turns`);
      }
    });
    
    // Check temporary captures
    this.temporaryCaptures.forEach((capture, index) => {
      effects.push(`🕸️ Net Capture ${capture.piece}: ${capture.remainingTurns} turns`);
    });
    
    effectsList.innerHTML = effects.length > 0 ? 
      effects.map(effect => `<div class="effect-item">${effect}</div>`).join('') : 
      '<div class="no-effects">No active effects</div>';
  }

  // Enhanced turn processing with timer decrements
  processEndTurn() {
    // Decrement all timer-based effects
    this.decrementTimers();
    
    // Switch players
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.turnCounter++;
    
    // Reset turn-specific counters
    this.spellsUsedThisTurn = 0;
    this.itemsUsedThisTurn = 0;
    this.currentDiceRoll = null;
    this.selectedSpell = null;
    this.selectedItem = null;
    this.turnPhase = "move";
    this.movesThisTurn = 0;
    this.waitingForTarget = false;
    this.pendingSpellAction = null;
    
    // Update displays
    this.updateEffectsDisplay();
    this.updateUI();
  }
  
  // Skip turn button handler
  skipTurn() {
    if (this.waitingForTarget) {
      this.waitingForTarget = false;
      this.pendingSpellAction = null;
      this.selectedSpell = null;
      this.selectedItem = null;
      this.updateSpellsUI();
      this.updateItemsUI();
      return "Targeting cancelled.";
    }
    
    this.processEndTurn();
    return "Turn skipped.";
  }
  
  // End turn button handler (confirmation)
  endTurn() {
    if (this.waitingForTarget) {
      return "Please complete targeting or cancel first.";
    }
    
    this.processEndTurn();
    return "Turn ended.";
  }

  // Comprehensive timer decrement system
  decrementTimers() {
    // Decrement freeze effect
    if (this.freezeEffect.active) {
      this.freezeEffect.remainingTurns--;
      if (this.freezeEffect.remainingTurns <= 0) {
        this.freezeEffect.active = false;
        this.freezeEffect.squares = [];
        console.log("❄️ Freeze effect ended");
      }
    }
    
    // Decrement player state timers
    for (const [player, state] of Object.entries(this.playerState)) {
      if (state.rageTurns > 0) {
        state.rageTurns--;
        if (state.rageTurns === 0) {
          console.log(`💢 ${player} Rage effect ended`);
        }
      }
      
      if (state.kingCanMoveLikeQueenTurns > 0) {
        state.kingCanMoveLikeQueenTurns--;
        if (state.kingCanMoveLikeQueenTurns === 0) {
          state.kingCanMoveLikeQueen = false;
          console.log(`👑 ${player} Queen's Soul effect ended`);
        }
      }
      
      if (state.agilityTurns > 0) {
        state.agilityTurns--;
        if (state.agilityTurns === 0) {
          state.extraMove = false;
          console.log(`🏃 ${player} Agility effect ended`);
        }
      }
      
      if (state.magicWandTurns > 0) {
        state.magicWandTurns--;
        if (state.magicWandTurns === 0) {
          console.log(`🪄 ${player} Magic Wand effect ended`);
        }
      }
      
      if (state.invisibilityTurns > 0) {
        state.invisibilityTurns--;
        if (state.invisibilityTurns === 0) {
          state.invisiblePiece = null;
          console.log(`👻 ${player} Invisibility effect ended`);
        }
      }
      
      if (state.ladderTurns > 0) {
        state.ladderTurns--;
        if (state.ladderTurns === 0) {
          state.ladderActive = false;
          console.log(`🪜 ${player} Ladder effect ended`);
        }
      }
    }
    
    // Decrement barrier timers
    this.barriers = this.barriers.filter(barrier => {
      barrier.remainingTurns--;
      if (barrier.remainingTurns <= 0) {
        console.log(`🚧 Barrier at (${barrier.row},${barrier.col}) expired`);
        return false;
      }
      return true;
    });
    
    // Decrement temporary capture timers and restore pieces
    this.temporaryCaptures = this.temporaryCaptures.filter(capture => {
      capture.remainingTurns--;
      if (capture.remainingTurns <= 0) {
        // Restore the piece to its original position if empty
        const pos = capture.originalPosition;
        if (!this.board[pos.row][pos.col]) {
          this.board[pos.row][pos.col] = capture.piece;
          console.log(`🕸️ ${capture.piece} returned to (${pos.row},${pos.col})`);
        } else {
          // Find alternative empty spot
          const emptySpot = this.findEmptySpot();
          if (emptySpot) {
            this.board[emptySpot.row][emptySpot.col] = capture.piece;
            console.log(`🕸️ ${capture.piece} returned to (${emptySpot.row},${emptySpot.col})`);
          }
        }
        return false;
      }
      return true;
    });
  }

  // Enhanced dice rolling with rage effect
  rollDice() {
    let roll = Math.floor(Math.random() * 20) + 1;
    
    // Apply rage effect - roll twice and take higher
    if (this.playerState[this.currentPlayer].rageTurns > 0) {
      const secondRoll = Math.floor(Math.random() * 20) + 1;
      roll = Math.max(roll, secondRoll);
      
      const diceResult = document.getElementById("diceResult");
      diceResult.textContent = `Roll: ${roll} (Rage boost active!)`;
      return roll;
    }
    
    this.currentDiceRoll = roll;
    
    const diceResult = document.getElementById("diceResult");
    diceResult.textContent = `Roll: ${roll}`;
    
    return roll;
  }

  // Enhanced square frozen check
  isSquareFrozen(row, col) {
    if (!this.freezeEffect.active) return false;
    return this.freezeEffect.squares.some(square => square.row === row && square.col === col);
  }

  // Enhanced barrier check
  isSquareBarrier(row, col) {
    return this.barriers.some(barrier => 
      barrier.row === row && barrier.col === col && barrier.remainingTurns > 0
    );
  }

  // Get piece at position helper
  getPieceAt(row, col) {
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
    return this.board[row][col];
  }

  // Enhanced endTurn that calls processEndTurn
  endTurn() {
    this.processEndTurn();
  }

  // ... (keeping all existing chess logic methods the same)
  createBoard() {
    const boardElement = document.getElementById("chessBoard");
    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = row;
        square.dataset.col = col;

        if ((row + col) % 2 === 0) {
          square.classList.add("light");
        } else {
          square.classList.add("dark");
        }

        square.addEventListener("click", (e) =>
          this.handleSquareClick(row, col)
        );
        boardElement.appendChild(square);
      }
    }
    this.updateBoardDisplay();
  }

  createSpellsUI() {
    const spellsGrid = document.getElementById("spellsGrid");
    spellsGrid.innerHTML = "";

    Object.entries(this.spells).forEach(([key, spell]) => {
      const spellCard = document.createElement("div");
      spellCard.className = "spell-card";
      spellCard.dataset.spell = key;
      
      const durationText = spell.duration ? ` (${spell.duration} turns)` : '';
      spellCard.innerHTML = `
        <div class="spell-name">${spell.name}${durationText}</div>
        <div class="spell-description">${spell.description}</div>
        <div class="spell-condition">${spell.condition}</div>
      `;
      
      spellCard.addEventListener("click", () => this.selectSpell(key));
      spellsGrid.appendChild(spellCard);
    });
  }

  createItemsUI() {
    const itemsGrid = document.getElementById("itemsGrid");
    itemsGrid.innerHTML = "";

    Object.entries(this.items).forEach(([key, item]) => {
      const itemCard = document.createElement("div");
      itemCard.className = "item-card";
      itemCard.dataset.item = key;
      
      const durationText = item.duration ? ` (${item.duration} turns)` : '';
      itemCard.innerHTML = `
        <div class="item-name">${item.name}${durationText}</div>
        <div class="item-description">${item.description}</div>
        ${item.condition ? `<div class="item-condition">${item.condition}</div>` : ''}
      `;
      
      itemCard.addEventListener("click", () => this.selectItem(key));
      itemsGrid.appendChild(itemCard);
    });
  }

  selectSpell(spellKey) {
    if (this.selectedSpell === spellKey) {
      this.selectedSpell = null;
    } else {
      this.selectedSpell = spellKey;
      this.selectedItem = null;
    }
    this.updateSpellsUI();
    this.updateItemsUI();
  }

  selectItem(itemKey) {
    if (this.selectedItem === itemKey) {
      this.selectedItem = null;
    } else {
      this.selectedItem = itemKey;
      this.selectedSpell = null;
    }
    this.updateSpellsUI();
    this.updateItemsUI();
  }

  updateSpellsUI() {
    document.querySelectorAll(".spell-card").forEach(card => {
      card.classList.remove("selected", "disabled", "limit-reached");
      const spellKey = card.dataset.spell;
      const spell = this.spells[spellKey];
      
      if (this.selectedSpell === spellKey) {
        card.classList.add("selected");
      }
      
      if (this.spellsUsedThisTurn >= 3) {
        card.classList.add("disabled");
      }
      
      // Check per-spell limit
      const limit = spell_limit[spellKey];
      if (limit) {
        const used = this.playerState[this.currentPlayer].spellsUsed[spellKey] || 0;
        if (used >= limit) {
          card.classList.add("limit-reached", "disabled");
          const usageText = document.createElement("div");
          usageText.className = "spell-usage";
          usageText.textContent = `Used: ${used}/${limit}`;
          if (!card.querySelector(".spell-usage")) {
            card.appendChild(usageText);
          }
        }
      }
    });
  }

  updateItemsUI() {
    document.querySelectorAll(".item-card").forEach(card => {
      card.classList.remove("selected", "disabled");
      const itemKey = card.dataset.item;
      
      if (this.selectedItem === itemKey) {
        card.classList.add("selected");
      }
      
      if (this.itemsUsedThisTurn >= 3) {
        card.classList.add("disabled");
      }
    });
  }

  useSpell(spellKey) {
    if (this.spellsUsedThisTurn >= 3) return "Maximum spells used this turn";
    
    const spell = this.spells[spellKey];
    if (!spell) return "Spell not found";
    
    // Check per-spell usage limit
    const limit = spell_limit[spellKey];
    if (limit) {
      const used = this.playerState[this.currentPlayer].spellsUsed[spellKey] || 0;
      if (used >= limit) {
        return `${spell.name} has reached its usage limit (${limit}).`;
      }
    }
    
    if (this.currentDiceRoll === null) {
      return "Please roll dice first";
    }
    
    if (spell.minRoll && this.currentDiceRoll < spell.minRoll) {
      return `Roll too low. Need ${spell.minRoll} or higher.`;
    }
    
    // Call spell effect
    const result = spell.effect(this);
    
    // If spell requires target and is now waiting, don't increment usage yet
    if (spell.requiresTarget && this.waitingForTarget) {
      // Don't increment usage yet, wait for target selection
      return result;
    }
    
    // Spell was successfully used, increment counters
    this.spellsUsedThisTurn++;
    if (limit) {
      if (!this.playerState[this.currentPlayer].spellsUsed[spellKey]) {
        this.playerState[this.currentPlayer].spellsUsed[spellKey] = 0;
      }
      this.playerState[this.currentPlayer].spellsUsed[spellKey]++;
    }
    this.selectedSpell = null;
    
    this.updateSpellsUI();
    this.updateEffectsDisplay();
    
    return result;
  }

  useItem(itemKey) {
    if (this.itemsUsedThisTurn >= 3) return "Maximum items used this turn";
    
    const item = this.items[itemKey];
    if (!item) return "Item not found";
    
    let result;
    if (item.minRoll && this.currentDiceRoll) {
      result = item.effect(this, this.currentDiceRoll);
    } else {
      result = item.effect(this);
    }
    
    // If item requires target and is now waiting, don't increment usage yet
    if (item.requiresTarget && this.waitingForTarget) {
      // Don't increment usage yet, wait for target selection
      return result;
    }
    
    // Item was successfully used, increment counters
    this.itemsUsedThisTurn++;
    this.selectedItem = null;
    this.updateItemsUI();
    this.updateEffectsDisplay();
    
    return result;
  }

  // Helper methods for magical effects
  findKing(player) {
    const kingSymbol = player === "white" ? "♔" : "♚";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === kingSymbol) {
          return { row, col, piece: kingSymbol };
        }
      }
    }
    return null;
  }

  findEnemyPieces() {
    const pieces = [];
    const enemySymbols = this.currentPlayer === "white" ? 
      ["♜", "♞", "♝", "♛", "♚", "♟"] : 
      ["♖", "♘", "♗", "♕", "♔", "♙"];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (enemySymbols.includes(piece)) {
          pieces.push({ row, col, piece });
        }
      }
    }
    return pieces;
  }

  findOwnPieces() {
    const pieces = [];
    const ownSymbols = this.currentPlayer === "white" ? 
      ["♖", "♘", "♗", "♕", "♔", "♙"] : 
      ["♜", "♞", "♝", "♛", "♚", "♟"];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (ownSymbols.includes(piece)) {
          pieces.push({ row, col, piece });
        }
      }
    }
    return pieces;
  }

  findEmptySpot() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (!this.board[row][col] && !this.isSquareFrozen(row, col) && !this.isSquareBarrier(row, col)) {
          return { row, col };
        }
      }
    }
    return null;
  }

  capturePieceAt(row, col) {
    const piece = this.board[row][col];
    if (piece) {
      // Store piece with its death position
      this.capturedPieces[this.currentPlayer].push({ piece, row, col });
      this.board[row][col] = "";
    }
  }

  getFireballImpactArea(target) {
    const squares = [target];
    const { row, col } = target;
    
    // Add adjacent squares
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          squares.push({ row: newRow, col: newCol });
        }
      }
    }
    return squares;
  }

  reverseMove() {
    if (this.moveHistory.length < 2) return;
    
    // Simplified move reversal
    const lastMove = this.moveHistory.pop();
    const secondLastMove = this.moveHistory.pop();
    
    // Restore pieces
    this.board[lastMove.from[0]][lastMove.from[1]] = lastMove.piece;
    this.board[lastMove.to[0]][lastMove.to[1]] = lastMove.captured;
    
    this.board[secondLastMove.from[0]][secondLastMove.from[1]] = secondLastMove.piece;
    this.board[secondLastMove.to[0]][secondLastMove.to[1]] = secondLastMove.captured;
    
    this.updateBoardDisplay();
  }

  enableNonKingSpells() {
    // This would enable spells for non-king pieces
    return "Non-king spells enabled";
  }

  // Enhanced board display with visual effects for frozen squares and barriers
  updateBoardDisplay() {
    const squares = document.querySelectorAll(".square");
    squares.forEach((square) => {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      const piece = this.board[row][col];

      square.innerHTML = "";
      square.classList.remove("selected", "valid-move", "in-check", "frozen", "barrier", "targeting");
      
      // Highlight squares when waiting for target
      if (this.waitingForTarget) {
        square.classList.add("targeting");
      }

      // Add magical effects
      if (this.isSquareFrozen(row, col)) {
        square.classList.add("frozen");
        // Add freeze countdown overlay
        const freezeOverlay = document.createElement("span");
        freezeOverlay.className = "freeze-counter";
        freezeOverlay.textContent = this.freezeEffect.remainingTurns;
        square.appendChild(freezeOverlay);
      }
      if (this.isSquareBarrier(row, col)) {
        square.classList.add("barrier");
        // Add barrier countdown overlay
        const barrier = this.barriers.find(b => b.row === row && b.col === col);
        if (barrier) {
          const barrierOverlay = document.createElement("span");
          barrierOverlay.className = "barrier-counter";
          barrierOverlay.textContent = barrier.remainingTurns;
          square.appendChild(barrierOverlay);
        }
      }

      if (piece) {
        const pieceElement = document.createElement("span");
        pieceElement.className = "piece";
        pieceElement.textContent = piece;

        if (this.isWhitePiece(piece)) {
          pieceElement.classList.add("white-piece");
        } else {
          pieceElement.classList.add("black-piece");
        }

        square.appendChild(pieceElement);
      }
    });
  }

  // ... (keeping all existing chess logic methods the same)
  isWhitePiece(piece) {
    return ["♔", "♕", "♖", "♗", "♘", "♙"].includes(piece);
  }

  handleSquareClick(row, col) {
    if (this.gameStatus !== "active" && this.gameStatus !== "check") return;

    // Handle spell/item targeting
    if (this.waitingForTarget && this.pendingSpellAction) {
      const action = this.pendingSpellAction;
      let result;
      
      if (this.selectedSpell) {
        const spell = this.spells[this.selectedSpell];
        result = spell.effect(this, row, col);
        
        // If targeting completed, finalize spell usage
        if (!this.waitingForTarget) {
          this.spellsUsedThisTurn++;
          const limit = spell_limit[this.selectedSpell];
          if (limit) {
            if (!this.playerState[this.currentPlayer].spellsUsed[this.selectedSpell]) {
              this.playerState[this.currentPlayer].spellsUsed[this.selectedSpell] = 0;
            }
            this.playerState[this.currentPlayer].spellsUsed[this.selectedSpell]++;
          }
          this.selectedSpell = null;
          this.updateSpellsUI();
        }
        
        this.displaySpellResult(result);
      } else if (this.selectedItem) {
        const item = this.items[this.selectedItem];
        result = item.effect(this, row, col);
        
        if (!this.waitingForTarget) {
          this.itemsUsedThisTurn++;
          this.selectedItem = null;
          this.updateItemsUI();
        }
        
        this.displayItemResult(result);
      }
      
      this.updateBoardDisplay();
      this.updateEffectsDisplay();
      return;
    }

    // Normal move handling
    if (this.selectedSquare) {
      if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
        this.selectedSquare = null;
        this.clearHighlights();
      } else if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
        this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
        this.selectedSquare = null;
        this.clearHighlights();
      } else {
        this.selectNewPiece(row, col);
      }
    } else {
      this.selectNewPiece(row, col);
    }
  }

  selectNewPiece(row, col) {
    const piece = this.board[row][col];
    if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
      this.selectedSquare = { row, col };
      this.highlightSquare(row, col);
      this.highlightValidMoves(row, col);
    }
  }

  isPieceOwnedByCurrentPlayer(piece) {
    return (
      (this.currentPlayer === "white" && this.isWhitePiece(piece)) ||
      (this.currentPlayer === "black" && !this.isWhitePiece(piece))
    );
  }

  highlightSquare(row, col) {
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    square.classList.add("selected");
  }

  highlightValidMoves(row, col) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isValidMove(row, col, r, c)) {
          const square = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
          square.classList.add("valid-move");
        }
      }
    }
  }

  clearHighlights() {
    document.querySelectorAll(".square").forEach((square) => {
      square.classList.remove("selected", "valid-move");
    });
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return false;

    // Can't move from frozen squares (pieces are frozen in place)
    if (this.isSquareFrozen(fromRow, fromCol)) return false;

    // Can't move to frozen or barrier squares
    if (this.isSquareFrozen(toRow, toCol) || this.isSquareBarrier(toRow, toCol)) return false;

    // Can't capture own piece
    const targetPiece = this.board[toRow][toCol];
    if (targetPiece && this.isPieceOwnedByCurrentPlayer(targetPiece)) return false;

    // Check piece-specific movement rules
    if (!this.isPieceMoveValid(piece, fromRow, fromCol, toRow, toCol)) return false;

    // Check if move would leave king in check
    return !this.wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol);
  }

  isPieceMoveValid(piece, fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    // Special case: King with Queen's Soul
    if ((piece === "♔" || piece === "♚") && this.playerState[this.currentPlayer].kingCanMoveLikeQueen) {
      return this.isRookMoveValid(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) ||
             this.isBishopMoveValid(fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff);
    }

    switch (piece.toLowerCase()) {
      case "♙":
      case "♟": // Pawn
        return this.isPawnMoveValid(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
      case "♖":
      case "♜": // Rook
        return this.isRookMoveValid(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
      case "♗":
      case "♝": // Bishop
        return this.isBishopMoveValid(fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff);
      case "♕":
      case "♛": // Queen
        return this.isRookMoveValid(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) ||
               this.isBishopMoveValid(fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff);
      case "♔":
      case "♚": // King
        return this.isKingMoveValid(piece, fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff);
      case "♘":
      case "♞": // Knight
        return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
      default:
        return false;
    }
  }

  isPawnMoveValid(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    const isWhite = this.isWhitePiece(piece);
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    // Forward move
    if (colDiff === 0 && !this.board[toRow][toCol]) {
      if (rowDiff === direction) return true;
      if (fromRow === startRow && rowDiff === 2 * direction) return true;
    }

    // Diagonal capture
    if (Math.abs(colDiff) === 1 && rowDiff === direction) {
      if (this.board[toRow][toCol]) return true;
      // En passant
      if (this.enPassantTarget && toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
        return true;
      }
    }

    return false;
  }

  isRookMoveValid(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    if (rowDiff !== 0 && colDiff !== 0) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isBishopMoveValid(fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff) {
    if (absRowDiff !== absColDiff) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isKingMoveValid(piece, fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff) {
    // Normal king move
    if (absRowDiff <= 1 && absColDiff <= 1) return true;

    // Castling
    if (absRowDiff === 0 && absColDiff === 2) {
      return this.canCastle(piece, fromRow, fromCol, toRow, toCol);
    }

    return false;
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    // If ladder is active, pieces can jump over other pieces (but not barriers/frozen)
    const canJump = this.playerState[this.currentPlayer].ladderActive;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board[currentRow][currentCol] && !canJump) return false;
      if (this.isSquareFrozen(currentRow, currentCol) || this.isSquareBarrier(currentRow, currentCol)) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  canCastle(piece, fromRow, fromCol, toRow, toCol) {
    const isWhite = this.isWhitePiece(piece);
    const color = isWhite ? "white" : "black";
    const isKingside = toCol > fromCol;

    if (!this.castlingRights[color][isKingside ? "kingside" : "queenside"]) return false;
    if (this.isSquareUnderAttack(fromRow, fromCol, color)) return false;

    const step = isKingside ? 1 : -1;
    for (let col = fromCol + step; col !== toCol + step; col += step) {
      if (this.board[fromRow][col]) return false;
      if (this.isSquareUnderAttack(fromRow, col, color)) return false;
      if (this.isSquareFrozen(fromRow, col) || this.isSquareBarrier(fromRow, col)) return false;
    }

    return true;
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];

    // Handle en passant capture
    if ((piece === "♙" || piece === "♟") && !capturedPiece && Math.abs(toCol - fromCol) === 1) {
      const enPassantCaptured = this.board[fromRow][toCol];
      if (enPassantCaptured) {
        // Store piece with its death position
        this.capturedPieces[this.currentPlayer].push({ piece: enPassantCaptured, row: fromRow, col: toCol });
      }
      this.board[fromRow][toCol] = "";
    }

    // Add captured piece to graveyard with its death position
    if (capturedPiece) {
      this.capturedPieces[this.currentPlayer].push({ piece: capturedPiece, row: toRow, col: toCol });
    }

    // Handle castling
    if ((piece === "♔" || piece === "♚") && Math.abs(toCol - fromCol) === 2) {
      const isKingside = toCol > fromCol;
      const rookFromCol = isKingside ? 7 : 0;
      const rookToCol = isKingside ? 5 : 3;
      this.board[fromRow][rookToCol] = this.board[fromRow][rookFromCol];
      this.board[fromRow][rookFromCol] = "";
    }

    // Make the move
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = "";

    // Update king position
    if (piece === "♔" || piece === "♚") {
      this.kingPositions[this.currentPlayer] = [toRow, toCol];
    }

    // Handle pawn promotion
    if ((piece === "♙" && toRow === 0) || (piece === "♟" && toRow === 7)) {
      this.board[toRow][toCol] = this.isWhitePiece(piece) ? "♕" : "♛";
    }

    // Update en passant target
    this.enPassantTarget = null;
    if ((piece === "♙" || piece === "♟") && Math.abs(toRow - fromRow) === 2) {
      this.enPassantTarget = { row: (fromRow + toRow) / 2, col: toCol };
    }

    // Update castling rights
    this.updateCastlingRights(piece, fromRow, fromCol, toRow, toCol);

    // Record move
    this.moveHistory.push({
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      piece,
      captured: capturedPiece,
    });

    this.movesThisTurn++;
    
    // Check if player has extra move from Agility
    if (this.playerState[this.currentPlayer].extraMove && this.movesThisTurn < 2) {
      // Allow another move - don't end turn yet
    } else {
      // Normal turn flow - automatically switch turns after move
      this.processEndTurn();
    }

    // Check game status
    this.checkGameStatus();

    this.updateBoardDisplay();
    this.updateUI();
  }

  updateCastlingRights(piece, fromRow, fromCol, toRow, toCol) {
    // King moved
    if (piece === "♔") {
      this.castlingRights.white.kingside = false;
      this.castlingRights.white.queenside = false;
    } else if (piece === "♚") {
      this.castlingRights.black.kingside = false;
      this.castlingRights.black.queenside = false;
    }

    // Rook moved or captured
    if (piece === "♖" || (fromRow === 7 && fromCol === 0)) this.castlingRights.white.queenside = false;
    if (piece === "♖" || (fromRow === 7 && fromCol === 7)) this.castlingRights.white.kingside = false;
    if (piece === "♜" || (fromRow === 0 && fromCol === 0)) this.castlingRights.black.queenside = false;
    if (piece === "♜" || (fromRow === 0 && fromCol === 7)) this.castlingRights.black.kingside = false;

    if (toRow === 7 && toCol === 0) this.castlingRights.white.queenside = false;
    if (toRow === 7 && toCol === 7) this.castlingRights.white.kingside = false;
    if (toRow === 0 && toCol === 0) this.castlingRights.black.queenside = false;
    if (toRow === 0 && toCol === 7) this.castlingRights.black.kingside = false;
  }

  wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol) {
    const originalPiece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];
    const originalKingPos = [...this.kingPositions[this.currentPlayer]];
    
    this.board[toRow][toCol] = originalPiece;
    this.board[fromRow][fromCol] = "";

    if (originalPiece === "♔" || originalPiece === "♚") {
      this.kingPositions[this.currentPlayer] = [toRow, toCol];
    }

    const kingPos = this.kingPositions[this.currentPlayer];
    const inCheck = this.isSquareUnderAttack(kingPos[0], kingPos[1], this.currentPlayer);

    this.board[fromRow][fromCol] = originalPiece;
    this.board[toRow][toCol] = capturedPiece;
    this.kingPositions[this.currentPlayer] = originalKingPos;

    return inCheck;
  }

  isSquareUnderAttack(row, col, defendingColor) {
    const attackingColor = defendingColor === "white" ? "black" : "white";

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece) {
          const pieceColor = this.isWhitePiece(piece) ? "white" : "black";
          if (pieceColor === attackingColor) {
            if (this.canPieceAttackSquare(piece, r, c, row, col)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  canPieceAttackSquare(piece, fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    switch (piece.toLowerCase()) {
      case "♙": // White pawn
        return rowDiff === -1 && absColDiff === 1;
      case "♟": // Black pawn
        return rowDiff === 1 && absColDiff === 1;
      case "♖":
      case "♜": // Rook
        return (rowDiff === 0 || colDiff === 0) && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case "♗":
      case "♝": // Bishop
        return absRowDiff === absColDiff && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case "♕":
      case "♛": // Queen
        return (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case "♔":
      case "♚": // King
        return absRowDiff <= 1 && absColDiff <= 1;
      case "♘":
      case "♞": // Knight
        return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
      default:
        return false;
    }
  }

  checkGameStatus() {
    const kingPos = this.kingPositions[this.currentPlayer];
    const inCheck = this.isSquareUnderAttack(kingPos[0], kingPos[1], this.currentPlayer);

    if (this.hasValidMoves()) {
      this.gameStatus = inCheck ? "check" : "active";
    } else {
      this.gameStatus = inCheck ? "checkmate" : "stalemate";
    }
  }

  hasValidMoves() {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = this.board[fromRow][fromCol];
        if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  updateUI() {
    const currentPlayerElement = document.getElementById("currentPlayer");
    const statusElement = document.getElementById("gameStatus");
    const turnPhaseElement = document.getElementById("turnPhase");

    if (currentPlayerElement) {
      currentPlayerElement.textContent = this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
    }

    if (turnPhaseElement) {
      const phaseNames = { move: "Move", spell: "Spell", item: "Item" };
      turnPhaseElement.textContent = phaseNames[this.turnPhase] || "Move";
    }

    if (statusElement) {
      switch (this.gameStatus) {
        case "check":
          statusElement.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} is in check!`;
          statusElement.className = "game-status check";
          break;
        case "checkmate":
          statusElement.textContent = `Checkmate! ${this.currentPlayer === "white" ? "Black" : "White"} wins!`;
          statusElement.className = "game-status checkmate";
          break;
        case "stalemate":
          statusElement.textContent = "Stalemate! It's a draw!";
          statusElement.className = "game-status stalemate";
          break;
        default:
          statusElement.textContent = `Game in progress - Turn ${this.turnCounter}`;
          statusElement.className = "game-status";
      }
    }

    this.updateSpellsUI();
    this.updateItemsUI();
    this.updateEffectsDisplay();
    this.updateGraveyardDisplay();
  }

  updateGraveyardDisplay() {
    const whiteGraveyard = document.getElementById("whiteGraveyard");
    const blackGraveyard = document.getElementById("blackGraveyard");
    
    if (whiteGraveyard) {
      if (this.capturedPieces.white.length === 0) {
        whiteGraveyard.textContent = "Empty";
        whiteGraveyard.className = "graveyard-pieces empty";
      } else {
        whiteGraveyard.className = "graveyard-pieces";
        whiteGraveyard.innerHTML = this.capturedPieces.white.map(captured => {
          const piece = captured.piece || captured; // Support both old format (string) and new format (object)
          const span = document.createElement("span");
          span.className = "graveyard-piece white-piece";
          span.textContent = piece;
          return span.outerHTML;
        }).join("");
      }
    }
    
    if (blackGraveyard) {
      if (this.capturedPieces.black.length === 0) {
        blackGraveyard.textContent = "Empty";
        blackGraveyard.className = "graveyard-pieces empty";
      } else {
        blackGraveyard.className = "graveyard-pieces";
        blackGraveyard.innerHTML = this.capturedPieces.black.map(captured => {
          const piece = captured.piece || captured; // Support both old format (string) and new format (object)
          const span = document.createElement("span");
          span.className = "graveyard-piece black-piece";
          span.textContent = piece;
          return span.outerHTML;
        }).join("");
      }
    }
  }

  resetGame() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.moveHistory = [];
    this.gameStatus = "active";
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true },
    };
    this.kingPositions = { white: [7, 4], black: [0, 4] };
    
    // Reset enhanced magical state
    this.freezeEffect = {
      active: false,
      squares: [],
      remainingTurns: 0,
      totalTurns: 0,
      caster: null
    };
    this.temporaryCaptures = [];
    this.barriers = [];
    this.capturedPieces = { white: [], black: [] }; // Array of {piece, row, col} objects
    this.currentDiceRoll = null;
    this.spellsUsedThisTurn = 0;
    this.itemsUsedThisTurn = 0;
    this.selectedSpell = null;
    this.selectedItem = null;
    this.turnCounter = 0;
    this.turnPhase = "move";
    this.movesThisTurn = 0;
    this.waitingForTarget = false;
    this.pendingSpellAction = null;
    
    this.playerState = {
      white: { 
        rageTurns: 0, 
        extraMove: false, 
        kingCanMoveLikeQueen: false, 
        kingCanMoveLikeQueenTurns: 0,
        agilityTurns: 0,
        magicWandTurns: 0,
        invisibilityTurns: 0,
        barrierTurns: 0,
        spellsUsed: {},
        invisiblePiece: null,
        ladderActive: false,
        ladderTurns: 0
      },
      black: { 
        rageTurns: 0, 
        extraMove: false, 
        kingCanMoveLikeQueen: false,
        kingCanMoveLikeQueenTurns: 0,
        agilityTurns: 0,
        magicWandTurns: 0,
        invisibilityTurns: 0,
        barrierTurns: 0,
        spellsUsed: {},
        invisiblePiece: null,
        ladderActive: false,
        ladderTurns: 0
      }
    };

    this.clearHighlights();
    this.updateBoardDisplay();
    this.updateUI();
    
    const diceResult = document.getElementById("diceResult");
    if (diceResult) diceResult.textContent = "";
  }
}

// Initialize game when page loads
let game;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeMagicalChessGame);
} else {
  initializeMagicalChessGame();
}

function initializeMagicalChessGame() {
  setTimeout(() => {
    console.log("Creating game instance..."); game = new MagicalChessGame(); console.log("Game created:", game);

    const resetButton = document.getElementById("resetButton");
    if (resetButton) {
      resetButton.addEventListener("click", () => game.resetGame());
    }

    const rollDiceButton = document.getElementById("rollDiceButton");
    if (rollDiceButton) {
      rollDiceButton.addEventListener("click", () => {
        const roll = game.rollDice();
        console.log(`Rolled: ${roll}`);
        game.updateSpellItemButtons();
      });
    }

    // Enhanced spell usage button
    const useSpellButton = document.getElementById("useSpellButton");
    if (useSpellButton) {
      useSpellButton.addEventListener("click", () => {
        if (game.selectedSpell) {
          const result = game.useSpell(game.selectedSpell);
          game.displaySpellResult(result);
          game.updateSpellItemButtons();
        }
      });
    }

    // Enhanced item usage button
    const useItemButton = document.getElementById("useItemButton");
    if (useItemButton) {
      useItemButton.addEventListener("click", () => {
        if (game.selectedItem) {
          const result = game.useItem(game.selectedItem);
          game.displayItemResult(result);
          game.updateSpellItemButtons();
        }
      });
    }

    // Skip Turn button
    const skipTurnButton = document.getElementById("skipTurnButton");
    if (skipTurnButton) {
      skipTurnButton.addEventListener("click", () => {
        const result = game.skipTurn();
        if (result) {
          const statusElement = document.getElementById("gameStatus");
          if (statusElement) {
            statusElement.textContent = result;
            setTimeout(() => game.updateUI(), 1000);
          }
        }
        game.updateUI();
      });
    }

    // End Turn button
    const endTurnButton = document.getElementById("endTurnButton");
    if (endTurnButton) {
      endTurnButton.addEventListener("click", () => {
        const result = game.endTurn();
        if (result) {
          const statusElement = document.getElementById("gameStatus");
          if (statusElement) {
            statusElement.textContent = result;
            setTimeout(() => game.updateUI(), 1000);
          }
        }
        game.updateUI();
      });
    }


    // Enhanced keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "s" && game.selectedSpell) {
        const result = game.useSpell(game.selectedSpell);
        game.displaySpellResult(result);
        game.updateSpellItemButtons();
      }
      if (e.key === "i" && game.selectedItem) {
        const result = game.useItem(game.selectedItem);
        game.displayItemResult(result);
        game.updateSpellItemButtons();
      }
      if (e.key === "e" && e.ctrlKey) {
        game.endTurn();
        game.updateUI();
      }
    });
  }, 100);
}

// Add enhanced methods to the MagicalChessGame class
MagicalChessGame.prototype.updateSpellItemButtons = function() {
  const useSpellButton = document.getElementById("useSpellButton");
  const useItemButton = document.getElementById("useItemButton");
  
  if (useSpellButton) {
    useSpellButton.disabled = !this.selectedSpell || this.currentDiceRoll === null || this.spellsUsedThisTurn >= 3;
    useSpellButton.textContent = this.selectedSpell ? 
      `Use ${this.spells[this.selectedSpell].name} (S)` : 
      "Use Selected Spell (S)";
  }
  
  if (useItemButton) {
    useItemButton.disabled = !this.selectedItem || this.itemsUsedThisTurn >= 3;
    useItemButton.textContent = this.selectedItem ? 
      `Use ${this.items[this.selectedItem].name} (I)` : 
      "Use Selected Item (I)";
  }
};

MagicalChessGame.prototype.displaySpellResult = function(result) {
  const spellResult = document.getElementById("spellResult");
  if (spellResult) {
    spellResult.textContent = result;
    spellResult.className = "spell-result active";
    spellResult.style.color = "#000000";
    spellResult.style.backgroundColor = "#ffffff";
    setTimeout(() => {
      spellResult.className = "spell-result";
      spellResult.style.color = "#000000";
    }, 3000);
  }
  console.log(`Spell Result: ${result}`);
};

MagicalChessGame.prototype.displayItemResult = function(result) {
  const itemResult = document.getElementById("itemResult");
  if (itemResult) {
    itemResult.textContent = result;
    itemResult.className = "item-result active";
    itemResult.style.color = "#000000";
    itemResult.style.backgroundColor = "#ffffff";
    setTimeout(() => {
      itemResult.className = "item-result";
      itemResult.style.color = "#000000";
    }, 3000);
  }
  console.log(`Item Result: ${result}`);
};

// Override the selectSpell method to update buttons
const originalSelectSpell = MagicalChessGame.prototype.selectSpell;
MagicalChessGame.prototype.selectSpell = function(spellKey) {
  originalSelectSpell.call(this, spellKey);
  this.updateSpellItemButtons();
};

// Override the selectItem method to update buttons
const originalSelectItem = MagicalChessGame.prototype.selectItem;
MagicalChessGame.prototype.selectItem = function(itemKey) {
  originalSelectItem.call(this, itemKey);
  this.updateSpellItemButtons();
};

// Override the useSpell method to update buttons and display
const originalUseSpell = MagicalChessGame.prototype.useSpell;
MagicalChessGame.prototype.useSpell = function(spellKey) {
  const result = originalUseSpell.call(this, spellKey);
  this.updateSpellItemButtons();
  this.updateEffectsDisplay();
  return result;
};

// Override the useItem method to update buttons and display
const originalUseItem = MagicalChessGame.prototype.useItem;
MagicalChessGame.prototype.useItem = function(itemKey) {
  const result = originalUseItem.call(this, itemKey);
  this.updateSpellItemButtons();
  this.updateEffectsDisplay();
  return result;
};

// Override the rollDice method to update buttons
const originalRollDice = MagicalChessGame.prototype.rollDice;
MagicalChessGame.prototype.rollDice = function() {
  const result = originalRollDice.call(this);
  this.updateSpellItemButtons();
  return result;
};

// Override the processEndTurn method to update buttons
const originalProcessEndTurn = MagicalChessGame.prototype.processEndTurn;
MagicalChessGame.prototype.processEndTurn = function() {
  originalProcessEndTurn.call(this);
  this.updateSpellItemButtons();
};



