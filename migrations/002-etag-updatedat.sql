-- Up
ALTER TABLE posts ADD COLUMN updatedAt INTEGER;
ALTER TABLE posts ADD COLUMN etag TEXT;

-- Down
PRAGMA foreign_keys=off;
 
BEGIN TRANSACTION;
 
ALTER TABLE posts RENAME TO temp_posts;
 
CREATE TABLE posts(
  id TEXT PRIMARY KEY,
  url TEXT UNIQUE,
  createdAt INTEGER
);
 
INSERT INTO posts (id, url, createdAt)
  SELECT id, url, createdAt
  FROM temp_posts;
 
DROP TABLE temp_posts;
 
COMMIT;
 
PRAGMA foreign_keys=on;
