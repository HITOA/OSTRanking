CREATE TABLE IF NOT EXISTS users(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    name NVARCHAR(32) NOT NULL, password_hash VARCHAR(60) NOT NULL, 
    email VARCHAR(320) NOT NULL, creation_date DATETIME NOT NULL, 
    privilege SMALLINT NOT NULL DEFAULT 0, trust INT NOT NULL DEFAULT 0);

CREATE TABLE IF NOT EXISTS shows(
    id INT NOT NULL PRIMARY KEY, 
    main_title NVARCHAR(256), alternative_title NVARCHAR(512), 
    medium VARCHAR(512), large VARCHAR(512), vintage VARCHAR(128),
    episode_count SMALLINT, FULLTEXT(main_title, alternative_title));

CREATE TABLE IF NOT EXISTS artists(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(128) CHARACTER SET utf8mb4);

CREATE TABLE IF NOT EXISTS artist_group_member(
    artist_group_id INT NOT NULL, artist_member_id INT NOT NULL,
    role_name VARCHAR(64), PRIMARY KEY (artist_group_id, artist_member_id),
    FOREIGN KEY (artist_group_id) REFERENCES artists(id),
    FOREIGN KEY (artist_member_id) REFERENCES artists(id));

CREATE TABLE IF NOT EXISTS tags(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(64));

CREATE TABLE IF NOT EXISTS sources(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name NVARCHAR(128));

CREATE TABLE IF NOT EXISTS osts(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name NVARCHAR(256) NOT NULL, 
    alternate_name NVARCHAR(256), sample_audio_url VARCHAR(256), 
    length SMALLINT NOT NULL, creation_date DATETIME NOT NULL, 
    update_date DATETIME NOT NULL, published_date DATE, short_length SMALLINT,
    top_rank INT, popular_rank INT, FULLTEXT(name, alternate_name));

CREATE TABLE IF NOT EXISTS artist_ost(
    artist_id INT NOT NULL, ost_id INT NOT NULL, 
    role_name VARCHAR(32) NOT NULL, PRIMARY KEY (artist_id, ost_id, role_name), 
    FOREIGN KEY (artist_id) REFERENCES artists(id), 
    FOREIGN KEY (ost_id) REFERENCES osts(id));

CREATE TABLE IF NOT EXISTS show_ost(
    show_id INT NOT NULL, ost_id INT NOT NULL, type SMALLINT NOT NULL, 
    num SMALLINT NOT NULL, PRIMARY KEY (show_id, ost_id, type, num), 
    FOREIGN KEY (show_id) REFERENCES shows(id), 
    FOREIGN KEY (ost_id) REFERENCES osts(id));

CREATE TABLE IF NOT EXISTS tag_ost(
    tag_id INT NOT NULL, ost_id INT NOT NULL, PRIMARY KEY (tag_id, ost_id), 
    FOREIGN KEY (tag_id) REFERENCES tags(id), FOREIGN KEY (ost_id) REFERENCES osts(id));

CREATE TABLE IF NOT EXISTS source_ost(
    source_id INT NOT NULL, ost_id INT NOT NULL, PRIMARY KEY (source_id, ost_id), 
    FOREIGN KEY (source_id) REFERENCES sources(id), 
    FOREIGN KEY (ost_id) REFERENCES osts(id));

CREATE TABLE IF NOT EXISTS link_ost(
    ost_id INT NOT NULL, type SMALLINT NOT NULL, url VARCHAR(256), 
    PRIMARY KEY (ost_id, url), 
    FOREIGN KEY (ost_id) REFERENCES osts(id));

CREATE TABLE IF NOT EXISTS scores(
    user_id INT NOT NULL, ost_id INT NOT NULL, score SMALLINT NOT NULL, 
    PRIMARY KEY (user_id, ost_id), FOREIGN KEY (user_id) REFERENCES users(id), 
    FOREIGN KEY (ost_id) REFERENCES osts(id));

CREATE TABLE IF NOT EXISTS ost_scores_total(
    ost_id INT NOT NULL, score_acc INT NOT NULL, 
    score_count INT NOT NULL, PRIMARY KEY (ost_id),
    FOREIGN KEY (ost_id) REFERENCES osts(id));

CREATE TABLE IF NOT EXISTS community_action(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, creation_date DATETIME NOT NULL,
    action_type SMALLINT NOT NULL, action_status SMALLINT NOT NULL DEFAULT 0, info JSON NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id));
    
CREATE OR REPLACE TRIGGER insert_ost_scores_total AFTER INSERT ON osts FOR EACH ROW INSERT INTO ost_scores_total (ost_id, score_acc, score_count) VALUES (NEW.id, 0, 0);
CREATE OR REPLACE TRIGGER add_ost_scores_total AFTER INSERT ON scores FOR EACH ROW UPDATE ost_scores_total SET score_acc=score_acc+NEW.score,score_count=score_count+1 WHERE ost_id = NEW.ost_id;
CREATE OR REPLACE TRIGGER update_ost_scores_total AFTER UPDATE ON scores FOR EACH ROW UPDATE ost_scores_total SET score_acc=score_acc+NEW.score-OLD.score WHERE ost_id = NEW.ost_id;
CREATE OR REPLACE TRIGGER remove_ost_scores_total AFTER DELETE ON scores FOR EACH ROW UPDATE ost_scores_total SET score_acc=score_acc-OLD.score,score_count=score_count-1 WHERE ost_id = OLD.ost_id;

CREATE OR REPLACE EVENT update_ost_rank 
	ON SCHEDULE EVERY 10 MINUTE
		DO
			UPDATE osts INNER JOIN (
				SELECT id, 
                RANK() OVER (ORDER BY (score_acc + 400) / (score_count + 10) DESC) AS new_top_rank, 
                RANK() OVER (ORDER BY NULLIF(score_count, 0) DESC) AS new_popular_rank 
			    FROM osts
			    INNER JOIN ost_scores_total ON ost_id = osts.id
			) AS rank_table ON rank_table.id = osts.id
			SET top_rank = rank_table.new_top_rank, popular_rank = rank_table.new_popular_rank;