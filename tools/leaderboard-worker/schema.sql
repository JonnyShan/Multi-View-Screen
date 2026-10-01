CREATE TABLE IF NOT EXISTS laps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL,
  n TEXT NOT NULL,
  t REAL NOT NULL,
  d INTEGER NOT NULL,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS laps_game_t ON laps (game, t);
CREATE INDEX IF NOT EXISTS laps_ip_d ON laps (ip, d);

-- debug reports sent from ?debug=1 (motogp-livewire/js/debug.js)
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  d INTEGER NOT NULL,
  game TEXT NOT NULL,
  ip TEXT,
  body TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reports_ip_d ON reports (ip, d);
