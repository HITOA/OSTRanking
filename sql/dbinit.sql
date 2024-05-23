CREATE TABLE IF NOT EXISTS users(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    name NVARCHAR(32) NOT NULL, password_hash VARCHAR(60) NOT NULL, 
    email VARCHAR(320) NOT NULL, creation_date DATETIME NOT NULL, 
    privilege SMALLINT NOT NULL DEFAULT 0, trust INT NOT NULL DEFAULT 0);

CREATE TABLE IF NOT EXISTS shows(
    id INT NOT NULL PRIMARY KEY, native NVARCHAR(512), 
    preferred NVARCHAR(512), english NVARCHAR(512), 
    medium VARCHAR(512), large VARCHAR(512),
    FULLTEXT(native, preferred, english));

CREATE TABLE IF NOT EXISTS authors(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(64));

CREATE TABLE IF NOT EXISTS tags(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(64));

CREATE TABLE IF NOT EXISTS sources(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name NVARCHAR(128));

CREATE TABLE IF NOT EXISTS links(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, type SMALLINT NOT NULL, url VARCHAR(256));

CREATE TABLE IF NOT EXISTS osts(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name NVARCHAR(256) NOT NULL, 
    alternate_name NVARCHAR(256), sample_audio_url VARCHAR(256), 
    length SMALLINT NOT NULL, creation_date DATETIME NOT NULL, 
    update_date DATETIME NOT NULL, published_date DATE, short_length SMALLINT,
    top_rank INT, popular_rank INT, FULLTEXT(name, alternate_name));

CREATE TABLE IF NOT EXISTS author_ost(
    author_id INT NOT NULL, ost_id INT NOT NULL, 
    role VARCHAR(32) NOT NULL, PRIMARY KEY (author_id, ost_id), 
    FOREIGN KEY (author_id) REFERENCES authors(id), 
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
    link_id INT NOT NULL, ost_id INT NOT NULL, PRIMARY KEY (link_id, ost_id), 
    FOREIGN KEY (link_id) REFERENCES links(id), 
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

CREATE OR REPLACE EVENT update_ost_top_rank 
	ON SCHEDULE EVERY 10 MINUTE
		DO
			UPDATE osts INNER JOIN (
				SELECT id, RANK() OVER (ORDER BY score_acc / NULLIF(score_count, 0) DESC) AS new_top_rank 
			    FROM osts
			    INNER JOIN ost_scores_total ON ost_id = osts.id
			) AS rank_table ON rank_table.id = osts.id
			SET top_rank = rank_table.new_top_rank;

CREATE OR REPLACE EVENT update_ost_popular_rank 
	ON SCHEDULE EVERY 10 MINUTE
		DO
			UPDATE osts INNER JOIN (
				SELECT id, RANK() OVER (ORDER BY NULLIF(score_count, 0) DESC) AS new_popular_rank 
			    FROM osts
			    INNER JOIN ost_scores_total ON ost_id = osts.id
			) AS rank_table ON rank_table.id = osts.id
			SET popular_rank = rank_table.new_popular_rank;