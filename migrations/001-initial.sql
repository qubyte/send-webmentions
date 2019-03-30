-- Up
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  url TEXT UNIQUE,
  createdAt INTEGER
);

CREATE TABLE mentions (
 id TEXT PRIMARY KEY,
 postId TEXT,
 target TEXT,
 createdAt INTEGER,
 UNIQUE(postId, target),
 FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
);

-- Down
DROP TABLE mentions;
DROP TABLE posts;