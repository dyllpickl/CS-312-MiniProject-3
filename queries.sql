----------General SQL----------
--CREATE users table--
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255)
);

--CREATE blogs table--
CREATE TABLE blogs (
    blog_id SERIAL PRIMARY KEY,
    creator_name VARCHAR(255),
    creator_user_id INT REFERENCES users(user_id),
    title VARCHAR(255),
    body TEXT,
    date_created TIMESTAMP,
    date_edited TIMESTAMP
);



----------index.js SQL----------
--INSERT record INTO users table--
INSERT INTO users (username, password) VALUES ($1, $2);
[username, password];



----------posts.js SQL----------
--SELECT all data FROM every record in blogs table--
SELECT * FROM blogs;

--INSERT record INTO blogs table--
INSERT INTO blogs (creator_name, title, body, date_created) VALUES ($1, $2, $3, $4);
[author || 'Anonymous', title, contents, new Date()];

--SELECT all data FROM record WHERE blog_id = post_id from blogs table--
SELECT * FROM blogs WHERE blog_id = ($1);
[post_id]

--UPDATE record data with new data--
UPDATE blogs SET creator_name = ($1), title = ($2), body = ($3), date_edited = ($4) WHERE blog_id = ($5);
[author || 'Anonymous', title, contents, new Date(),  post_id];

--DELETE record WHERE blog_id = post_id FROM blogs table--
DELETE FROM blogs WHERE blog_id = ($1);
[post_id];