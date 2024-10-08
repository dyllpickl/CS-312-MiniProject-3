import express from "express";
import pg from "pg";

const router = express.Router();

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "BlogDB",
    password: "dylang",
    port: 5432,
});

db.connect();

//Retrieve all information from blogs table
async function getPosts() {
    const result = await db.query("SELECT * FROM blogs");
    const postsArray = [];
    result.rows.forEach((post) => {
        postsArray.push({
            author: post.creator_name || "Anonymous",
            title: post.title,
            content: post.body,
            creationDate: new Date(post.date_created).toLocaleDateString(),
            creationTime: new Date(post.date_created).toLocaleTimeString(),
        });
    });
    return postsArray;
};

//Loads new post page
router.get('/new', (req, res) => {
    res.render('posts/new.ejs');
});

//Adds new post to website
router.post('/', async (req, res) => {
    const { title, contents } = req.body;
    const user_id = req.body.user_id;
    const password = req.body.password;
    
    const result = await db.query("SELECT * FROM users WHERE user_id = $1",
        [user_id]
    );

    if (result.rows.length > 0) {
        const record = result.rows[0];
        const dbPassword = record.password;
        const dbUsername = record.username;

        if (password === dbPassword) {
            await db.query(
                "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, $5)",
                [dbUsername, user_id, title, contents, new Date()]
            );
            res.redirect('/blog');
        } else {
            res.send("Password is incorrect");
        }
    } else {
        res.send("User_ID not found, check user_ID and try again.");
    };
});

//Loads edit page with corresponding post
router.get('/edit/:blog_id', async (req, res) => {
    const post_id = req.params.blog_id;
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = ($1)",
        [post_id]
    );
    const record = result.rows[0];
    const post = {
        author: record.creator_name || "Anonymous",
        title: record.title,
        content: record.body,
        creationDate: new Date(record.date_created).toLocaleDateString(),
        creationTime: new Date(record.date_created).toLocaleTimeString(),
    }
    res.render('posts/edit.ejs', {post, post_id});
});

//Updates old post with new post information
router.post('/edit/:blog_id', async (req, res) => {
    const post_id = req.params.blog_id;
    const {title, contents, edit_id, password} = req.body;
    
    const postResult = await db.query("SELECT * FROM blogs WHERE blog_id = $1",
        [post_id]
    );

    const dbAuthorId = postResult.rows[0].creator_user_id;

    const userResult = await db.query("SELECT * FROM users WHERE user_id = $1",
        [dbAuthorId]
    );
    
    const dbPassword = userResult.rows[0].password;
    const dbUsername = userResult.rows[0].username;

    if (parseInt(edit_id.trim()) === dbAuthorId) {
        if (password.trim() === dbPassword) {
            await db.query(
                "UPDATE blogs SET creator_name = ($1), title = ($2), body = ($3), date_edited = ($4) WHERE blog_id = ($5)",
                [dbUsername, title, contents, new Date(),  post_id]
            );
            res.redirect('/blog');
        } else {
            res.send("Password is incorrect");
        }
    } else {
        res.send("User_ID does not match, please try again.");
    }
});

//Loads delete page
router.get('/delete/:blog_id', async (req, res) => {
    const post_id = req.params.blog_id;
    const result = await db.query("SELECT title FROM blogs WHERE blog_id = $1",
        [post_id]
    );
    const post_title = result.rows[0].title;
    res.render('posts/delete.ejs', { post_id, post_title });
});

//Deletes corresponding post
router.post('/delete/:blog_id', async (req, res) => {
    const post_id = req.params.blog_id;
    const {edit_id, password} = req.body;
    
    const postResult = await db.query("SELECT * FROM blogs WHERE blog_id = $1",
        [post_id]
    );

    const dbAuthorId = postResult.rows[0].creator_user_id;

    const userResult = await db.query("SELECT * FROM users WHERE user_id = $1",
        [dbAuthorId]
    );
    
    const dbPassword = userResult.rows[0].password;
    console.log(dbAuthorId);
    console.log(edit_id);
    if (parseInt(edit_id.trim()) === dbAuthorId) {
        console.log(dbPassword);
        console.log(password);
        if (password.trim() === dbPassword) {
            await db.query("DELETE FROM blogs WHERE blog_id = ($1)",
                [post_id]
            );
            res.redirect('/blog');
        } else {
            res.send("Password is incorrect");
        }
    } else {
        res.send("User_ID does not match, please try again.");
    }
});

export default router;