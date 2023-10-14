const express = require('express');
const cors = require('cors');
const mongoose  = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post')
const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')
const app =express()

const salt =bycrpt.genSaltSync(10);
const secret = 'chwhhi4rh4kj3h89hwhnf';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(__dirname + '/uploads' ))

mongoose.connect('mongodb+srv://Jahanvi215:MERN12blog34app@cluster0.cje5tdu.mongodb.net/?retryWrites=true&w=majority');

app.post('/register', async(req,res) =>{
    const {username, password, Phone, email}= req.body;
    try{
        const UserDoc =await User.create({
        username,
        password:bycrpt.hashSync(password,salt),
        Phone,
        email})
        res.json(UserDoc);

    }catch(err){
        res.status(400).json(err)

    }
});


app.post('/login', async (req,res) => {
    const {username, password} =req.body;
    const UserDoc = await User.findOne({username});
    const passOk = bycrpt.compareSync(password, UserDoc.password);
    if(passOk){
        //logged in
        jwt.sign({username, id:UserDoc._id}, secret, {}, (err,token) =>{
        if (err) throw err;
        res.cookie('token',token).json({
            id:UserDoc._id,
            username,
        });
      
        } )
    }else {
        res.status(400).json('wrong credentials');
    }
});


app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
  });


app.post('/post', uploadMiddleware.single('file'), async(req,res) => {
    const {originalname, path} =req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1]
    const newPath =path+'.'+ext;
    fs.renameSync(path, newPath );

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async(err,info) => {
        if (err) throw err;
    
        const {title, summary, content} = req.body;
        const postDoc =await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author:info.id,
        });
        res.json({postDoc});
    });

});

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
    let newPath = null;
    if (req.file) {
      const {originalname,path} = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path+'.'+ext;
      fs.renameSync(path, newPath);
    }
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {id,title,summary,content} = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    //   res.json({isAuthor})
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }
      await postDoc.updateOne({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });
  
      res.json(postDoc);
    });
  
  });
  



app.get('/post', async(req,res) =>{
    res.json(
    await Post.find()
    .populate('author', ['username'])
    .sort({createdAt: -1})
    .limit(20)
    )
    
});

app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  })
  

app.listen(4000)

//MERN12blog34app