import express from "express";
import bodyParser from "body-parser";
import postsRoute from "./routes/posts.js";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "BlogDB",
    password: "dylang",
    port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/posts', postsRoute);

async function getPosts() {
    const result = await db.query("SELECT * from blogs ORDER BY date_created");
    const postsArray = [];
    result.rows.forEach((post) => {
        postsArray.push({
            blog_id: post.blog_id,
            author: post.creator_name,
            author_id: post.creator_user_id,
            title: post.title,
            content: post.body,
            creationDate: post.date_created.toLocaleDateString(),
            creationTime: post.date_created.toLocaleTimeString(),
            editDate: post.date_edited ? post.date_edited.toLocaleDateString() : null,
            editTime: post.date_edited ? post.date_edited.toLocaleTimeString() : null,
        });
    });
    return postsArray;
};

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.get('/blog', async (req, res) => {
    const postsArray = await getPosts();
    res.render('blog.ejs', {posts: postsArray});
});

app.post('/register', async (req, res) => {
    const user_id = req.body.user_id;
    const username = req.body.username;
    const password = req.body.password;
    console.log("Register Attempt");
    console.log(`Username: ${user_id}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
    const checkID = await db.query("SELECT * FROM users WHERE user_id = $1",
        [user_id]
    );

    if (checkID.rows.length > 0) {
        res.send("User_ID already exists, try another user_ID.");
        console.log("==ERROR== User_ID already exists\n");
    } else {
        await db.query(
            "INSERT INTO users (user_id, username, password) VALUES ($1, $2, $3)",
            [user_id, username, password]
        );
        console.log("Added successfully\n");
        res.redirect('/');
    };
});

app.post('/login', async (req, res) => {
    const user_id = req.body.user_id;
    const password = req.body.password;
    console.log("Login Attempt");
    console.log(`Username: ${user_id}`);
    console.log(`Password: ${password}`);
    
    const User_ID = await db.query("SELECT * FROM users WHERE user_id = $1",
        [user_id]
    );

    if (User_ID.rows.length > 0) {
        const user_id = User_ID.rows[0];
        const dbPassword = user_id.password;

        if (password === dbPassword) {
            const postsArray = await getPosts();
            res.render('blog.ejs', {posts: postsArray});
        } else {
            res.send("Password is incorrect");
            console.log("==ERROR== Password incorrect\n");
        }
    } else {
        res.send("User_ID not found, please try again or register an account.");
        console.log("==ERROR== User_ID not found\n")
    };
});
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});