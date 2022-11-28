const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Blog = require('./models/blog');
const { TopologyClosedEvent } = require('mongodb');
require('dotenv').config();

const fetch = (url) =>
  import("node-fetch").then(({ default: fetch }) => fetch(url));

// express app
const app = express();

// connect to mongodb & listen for requests


const dbURI = process.env.URL;


mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));

// register view engine
app.set("views", __dirname + "/views"); //#
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static(__dirname + "/public")); 
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

// mongoose & mongo tests
app.get('/add-blog', (req, res) => {
  const blog = new Blog({
    title: 'new blog',
    snippet: 'about my new blog',
    body: 'more about my new blog'
  })

  blog.save()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/all-blogs', (req, res) => {
  Blog.find()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);   
    });
});

app.get('/single-blog', (req, res) => {
  Blog.findById('5ea99b49b8531f40c0fde689')
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/', (req, res) => {
  res.redirect('/blogs');
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

// blog routes
app.get('/blogs/create', (req, res) => {
  res.render('create', { title: 'Create a new blog' });
});

app.get('/blogs', (req, res) => {
  Blog.find().sort({ createdAt: -1 })
    .then(result => {
      res.render('index', { blogs: result, title: 'All blogs' });
    })
    .catch(err => {
      console.log(err);
    });
});


app.post('/blogs', (req, res) => {
  // console.log(req.body);
  const blog = new Blog(req.body);

  blog.save()
    .then(result => {
      res.redirect('/blogs');
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then(result => {
      res.render('details', { blog: result, title: 'Blog Details' });
    })
    .catch(err => {
      console.log(err);
    });
});



app.delete('/blogs/:id', (req, res) => {
  const id = req.params.id;
  
  Blog.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/blogs' });
    })
    .catch(err => {
      console.log(err);
    });
});


app.get('/news', async(req, res,) => {
  
  res.render('news', { newsdata:undefined});
});

app.post('/getnews', (req, res) => {

  let intput_data=req.body;
  let topic=intput_data.news;
  if(topic==''){
    res.render('news', { newsdata:undefined});
  }
  let apiKey=process.env.KEY;
  console.log('topic is : ',topic);

  url=`https://newsapi.org/v2/everything?q=${topic}&from=2022-10-27&sortBy=publishedAt&apiKey=${apiKey}&language=en`;
  try{
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // console.log(data.articles[0]);
            res.render('news', { newsdata:data});
            console.log('rendered');
        });
    }
    catch(e){
        console.log('ERROR IN loading  : ',e);
         res.render('news');
    }   



 
});



// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});










