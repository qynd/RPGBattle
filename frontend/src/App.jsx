import React, { useState, useEffect, useCallback } from 'react';
import { backend } from 'declarations/backend';
import { AuthClient } from '@dfinity/auth-client';

const basePlayer = {
  name: 'Hero',
  hp: 30,
  maxHp: 30,
  hand: [
    { name: 'Slash', damage: 5, type: 'attack' },
    { name: 'Fireball', damage: 8, type: 'attack' },
    { name: 'Heal', heal: 6, type: 'heal' },
  ]
};

const monsters = [
  { name: 'Goblin', hp: 20, maxHp: 20, minDamage: 2, maxDamage: 6, emoji: '👹' },
  { name: 'Orc', hp: 35, maxHp: 35, minDamage: 4, maxDamage: 8, emoji: '👺' },
  { name: 'Dragon', hp: 50, maxHp: 50, minDamage: 6, maxDamage: 12, emoji: '🐉' },
  { name: 'Skeleton', hp: 25, maxHp: 25, minDamage: 3, maxDamage: 7, emoji: '💀' },
  { name: 'Troll', hp: 40, maxHp: 40, minDamage: 5, maxDamage: 9, emoji: '🧌' },
];

const equipment = {
  weapons: [
    { name: 'Wooden Sword', damage: 0, emoji: '🗡️' },
    { name: 'Iron Sword', damage: 2, emoji: '⚔️' },
    { name: 'Magic Sword', damage: 5, emoji: '🔮' },
    { name: 'Flame Sword', damage: 8, emoji: '🔥' },
  ],
  armor: [
    { name: 'Cloth Armor', hp: 0, emoji: '👕' },
    { name: 'Leather Armor', hp: 5, emoji: '🧥' },
    { name: 'Chain Mail', hp: 10, emoji: '🛡️' },
    { name: 'Plate Armor', hp: 15, emoji: '🦾' },
  ],
  accessories: [
    { name: 'None', heal: 0, emoji: '❌' },
    { name: 'Health Ring', heal: 2, emoji: '💍' },
    { name: 'Mana Crystal', heal: 5, emoji: '💎' },
    { name: 'Life Amulet', heal: 8, emoji: '🧿' },
  ]
};

const App = () => {
  const [myScore, setMyScore] = useState({ wins: 0, losses: 0 });
  const [allScores, setAllScores] = useState([]);
  const [principal, setPrincipal] = useState(null);
  const [player, setPlayer] = useState(basePlayer);
  const [enemy, setEnemy] = useState(monsters[0]);
  const [log, setLog] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState('setup'); // setup, playing, gameover
  const [selectedMonster, setSelectedMonster] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  const [selectedArmor, setSelectedArmor] = useState(0);
  const [selectedAccessory, setSelectedAccessory] = useState(0);

  // Initialize authentication and load scores
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const p = identity.getPrincipal();
      
      // Accept both authenticated and anonymous principals
      setPrincipal(p);

      // Load user's personal score
      await loadPersonalScore(p);
      
      // Load all scores for leaderboard
      await loadAllScores();

    } catch (error) {
      console.error("Error initializing app:", error);
      setError(error.message || "Failed to initialize application");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPersonalScore = async (p) => {
    try {
      const [wins, losses] = await backend.getMyScore(p);
      setMyScore({ wins: Number(wins), losses: Number(losses) });
    } catch (err) {
      console.error("Error loading personal score:", err);
      setMyScore({ wins: 0, losses: 0 });
    }
  };

  const loadAllScores = async () => {
    try {
      const scores = await backend.getAllScores();
      setAllScores(scores || []);
    } catch (err) {
      console.error("Error loading all scores:", err);
      setAllScores([]);
    }
  };

  const startGame = () => {
    const selectedMonsterData = monsters[selectedMonster];
    const selectedWeaponData = equipment.weapons[selectedWeapon];
    const selectedArmorData = equipment.armor[selectedArmor];
    const selectedAccessoryData = equipment.accessories[selectedAccessory];

    // Apply equipment bonuses
    const enhancedPlayer = {
      ...basePlayer,
      hp: basePlayer.hp + selectedArmorData.hp,
      maxHp: basePlayer.maxHp + selectedArmorData.hp,
      hand: basePlayer.hand.map(card => {
        if (card.type === 'attack') {
          return { ...card, damage: card.damage + selectedWeaponData.damage };
        } else if (card.type === 'heal') {
          return { ...card, heal: card.heal + selectedAccessoryData.heal };
        }
        return card;
      })
    };

    setPlayer(enhancedPlayer);
    setEnemy({ ...selectedMonsterData });
    setLog([`A wild ${selectedMonsterData.name} appears!`]);
    setGameState('playing');
    setIsGameOver(false);
    setError(null);
  };

  const handleCardPlay = useCallback((card) => {
    if (isGameOver || !principal || isRecording) return;

    let logEntry = `You used ${card.name}. `;
    let newEnemyHp = enemy.hp;
    let newPlayerHp = player.hp;

    // Apply card effect
    if (card.damage) {
      newEnemyHp -= card.damage;
      logEntry += `It dealt ${card.damage} damage.`;
    } else if (card.heal) {
      const healAmount = Math.min(card.heal, player.maxHp - player.hp);
      newPlayerHp = Math.min(newPlayerHp + card.heal, player.maxHp);
      logEntry += `You healed ${healAmount} HP.`;
    }

    // Enemy attack (if still alive)
    if (newEnemyHp > 0) {
      const enemyDmg = Math.floor(Math.random() * (enemy.maxDamage - enemy.minDamage + 1)) + enemy.minDamage;
      newPlayerHp -= enemyDmg;
      logEntry += `\n${enemy.name} attacks you for ${enemyDmg} damage!`;
    }

    // Update UI state immediately
    setEnemy(prev => ({ ...prev, hp: Math.max(newEnemyHp, 0) }));
    setPlayer(prev => ({ ...prev, hp: Math.max(newPlayerHp, 0) }));
    setLog(prev => [...prev, logEntry]);

    // Check game end conditions
    if (newEnemyHp <= 0) {
      setIsGameOver(true);
      setGameState('gameover');
      setLog(prev => [...prev, `You defeated the ${enemy.name}!`]);
      recordGameResult(true);
    } else if (newPlayerHp <= 0) {
      setIsGameOver(true);
      setGameState('gameover');
      setLog(prev => [...prev, 'You were defeated...']);
      recordGameResult(false);
    }
  }, [isGameOver, principal, isRecording, enemy, player]);

  const recordGameResult = async (win) => {
    if (!principal || isRecording) return;
    
    setIsRecording(true);
    setError(null);
    
    // Update local score immediately for UI responsiveness
    setMyScore(prev => ({
      wins: win ? prev.wins + 1 : prev.wins,
      losses: win ? prev.losses : prev.losses + 1
    }));

    try {
      // Record to backend
      await backend.recordGame(principal, win);
      console.log("Game recorded successfully");
      
      // Refresh scores from backend
      await loadPersonalScore(principal);
      await loadAllScores();
      
    } catch (err) {
      console.error("Backend error:", err);
      setError("Failed to record game result");
      
      // Revert local score on error
      setMyScore(prev => ({
        wins: win ? prev.wins - 1 : prev.wins,
        losses: win ? prev.losses : prev.losses - 1
      }));
    } finally {
      setIsRecording(false);
    }
  };

  const restartGame = () => {
    setGameState('setup');
    setIsGameOver(false);
    setIsRecording(false);
    setError(null);
    setLog([]);
  };

  const formatPrincipal = (principal) => {
    if (!principal) return 'Unknown';
    const text = principal.toText();
    return text.length > 12 ? `${text.substring(0, 6)}...${text.substring(text.length - 6)}` : text;
  };

  const calculateWinRate = (wins, losses) => {
    const total = wins + losses;
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  };

  const getHealthBarWidth = (currentHp, maxHp) => {
    return Math.max(0, (currentHp / maxHp) * 100);
  };

  const getHealthBarColor = (currentHp, maxHp) => {
    const percentage = (currentHp / maxHp) * 100;
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyColor = (monster) => {
    if (monster.maxHp <= 25) return 'text-green-600';
    if (monster.maxHp <= 35) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-2xl mx-auto bg-white shadow-lg rounded-xl mt-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error && !principal) {
    return (
      <div className="p-4 max-w-2xl mx-auto bg-white shadow-lg rounded-xl mt-10">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-bold">Error</h2>
            <p>{error}</p>
          </div>
          <button 
            onClick={initializeApp}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">🃏 Card RPG Adventure</h1>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* Stats Display */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-bold">📊 Your Stats</div>
          <div className="flex gap-4 mt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">{myScore.wins}</div>
              <div className="text-xs">WINS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-300">{myScore.losses}</div>
              <div className="text-xs">LOSSES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">
                {calculateWinRate(myScore.wins, myScore.losses)}%
              </div>
              <div className="text-xs">WIN RATE</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
        </button>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-3 text-center">🏆 Leaderboard</h3>
          <div className="space-y-2 max-h-48 overflow-auto">
            {allScores && allScores.length > 0 ? (
              allScores
                .sort((a, b) => {
                  if (b.wins !== a.wins) return b.wins - a.wins;
                  return calculateWinRate(b.wins, b.losses) - calculateWinRate(a.wins, a.losses);
                })
                .map((score, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded ${
                    score.player.toText() === principal?.toText() ? 'bg-blue-100 border-2 border-blue-400' : 'bg-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">#{index + 1}</span>
                      <span className="text-sm">{formatPrincipal(score.player)}</span>
                      {score.player.toText() === principal?.toText() && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">YOU</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        <span className="text-green-600">{Number(score.wins)}W</span> / 
                        <span className="text-red-600">{Number(score.losses)}L</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {calculateWinRate(Number(score.wins), Number(score.losses))}% win rate
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center text-gray-500">No scores available</div>
            )}
          </div>
        </div>
      )}

      {/* Game Setup */}
      {gameState === 'setup' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">⚔️ Prepare for Battle!</h2>
            <p className="text-gray-600">Choose your enemy and equipment</p>
          </div>

          {/* Monster Selection */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">🐉 Choose Your Enemy:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {monsters.map((monster, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMonster(index)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedMonster === index 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{monster.emoji}</div>
                  <div className="font-semibold">{monster.name}</div>
                  <div className="text-sm text-gray-600">HP: {monster.hp}</div>
                  <div className={`text-xs ${getDifficultyColor(monster)}`}>
                    {monster.hp <= 25 ? 'Easy' : monster.hp <= 35 ? 'Medium' : 'Hard'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Weapon */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">⚔️ Weapon:</h3>
              <div className="space-y-2">
                {equipment.weapons.map((weapon, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedWeapon(index)}
                    className={`w-full p-2 rounded border-2 transition-all ${
                      selectedWeapon === index 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{weapon.emoji}</span>
                        <span className="text-sm">{weapon.name}</span>
                      </div>
                      <span className="text-xs text-orange-600">+{weapon.damage}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Armor */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">🛡️ Armor:</h3>
              <div className="space-y-2">
                {equipment.armor.map((armor, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedArmor(index)}
                    className={`w-full p-2 rounded border-2 transition-all ${
                      selectedArmor === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{armor.emoji}</span>
                        <span className="text-sm">{armor.name}</span>
                      </div>
                      <span className="text-xs text-blue-600">+{armor.hp} HP</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessory */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">💍 Accessory:</h3>
              <div className="space-y-2">
                {equipment.accessories.map((accessory, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAccessory(index)}
                    className={`w-full p-2 rounded border-2 transition-all ${
                      selectedAccessory === index 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{accessory.emoji}</span>
                        <span className="text-sm">{accessory.name}</span>
                      </div>
                      <span className="text-xs text-green-600">+{accessory.heal} Heal</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg"
            >
              ⚔️ Start Battle!
            </button>
          </div>
        </div>
      )}

      {/* Game Playing */}
      {gameState === 'playing' && (
        <div className="space-y-6">
          {/* Game Area */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h2 className="font-semibold text-lg mb-2">🧝‍♂️ {player.name}</h2>
              <p className="mb-2">❤️ HP: {player.hp}/{player.maxHp}</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${getHealthBarColor(player.hp, player.maxHp)}`}
                  style={{ width: `${getHealthBarWidth(player.hp, player.maxHp)}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div>🗡️ {equipment.weapons[selectedWeapon].name}</div>
                <div>🛡️ {equipment.armor[selectedArmor].name}</div>
                <div>💍 {equipment.accessories[selectedAccessory].name}</div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg shadow">
              <h2 className="font-semibold text-lg mb-2">{enemy.emoji} {enemy.name}</h2>
              <p className="mb-2">❤️ HP: {enemy.hp}/{enemy.maxHp}</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${getHealthBarColor(enemy.hp, enemy.maxHp)}`}
                  style={{ width: `${getHealthBarWidth(enemy.hp, enemy.maxHp)}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div>⚔️ Damage: {enemy.minDamage}-{enemy.maxDamage}</div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="font-semibold mb-3">🃏 Your Cards:</h3>
            <div className="grid grid-cols-3 gap-3">
              {player.hand.map((card, index) => (
                <button
                  key={index}
                  className={`p-4 rounded-lg shadow hover:scale-105 duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                    card.type === 'attack' 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  onClick={() => handleCardPlay(card)}
                  disabled={isGameOver || isRecording}
                >
                  <div className="font-bold">{card.name}</div>
                  <div className="text-sm mt-1">
                    {card.damage ? `⚔️ ${card.damage} DMG` : `💚 ${card.heal} HEAL`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Log */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📜 Battle Log:</h3>
            <div className="text-sm h-32 overflow-auto whitespace-pre-line">
              {log.map((line, idx) => (
                <div key={idx} className="mb-1">▶ {line}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="text-center space-y-4">
          <div className="p-6 rounded-lg">
            {enemy.hp <= 0 ? (
              <div className="bg-green-100 border-2 border-green-400 text-green-800 rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">🎉 VICTORY! 🎉</div>
                <div className="text-xl mb-2">You defeated the {enemy.name}!</div>
                <div className="text-sm">
                  {isRecording ? 'Recording win...' : `Total wins: ${myScore.wins}`}
                </div>
              </div>
            ) : (
              <div className="bg-red-100 border-2 border-red-400 text-red-800 rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">💀 DEFEAT 💀</div>
                <div className="text-xl mb-2">You were defeated by the {enemy.name}...</div>
                <div className="text-sm">
                  {isRecording ? 'Recording loss...' : `Total losses: ${myScore.losses}`}
                </div>
              </div>
            )}
          </div>
          
          <button
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-bold"
            onClick={restartGame}
            disabled={isRecording}
          >
            🔄 Play Again
          </button>
        </div>
      )}

      {/* Principal Info */}
      <div className="mt-6 text-center text-xs text-gray-500">
        Principal: {formatPrincipal(principal)}
        {principal?.isAnonymous() && (
          <span className="ml-2 text-orange-600">(Anonymous)</span>
        )}
      </div>
    </div>
  );
};

export default App;