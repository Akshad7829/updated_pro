if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const express = require('express');
const ejs = require("ejs");
const fetch = require("node-fetch");
const PORT = 8000 || process.env.PORT;
const URI = `http://localhost:${PORT}`;
const mongoURI = process.env.DB_URI;
// const mongoose = require('mongoose');
const User = require('./models/User');
const FormData = require('form-data');
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');

const Projects = require('./models/project');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const bodyParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var multer = require('multer');
const app = express();

app.use(express.static("public"));
const axios = require('axios')





app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
    extended : true
}));

// .then(response => console.log(response.json()));

app.use(session({
    secret:"our little scre",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());
// mongoose.set("strictQuery", false);
let dt = ""
const url = 'mongodb+srv://kosec:2577@cluster0.hfzw1pi.mongodb.net/';
// const dbName = 'userData';


const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

// Passport

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var storages = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'prouploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });
var uploads = multer({ storage: storages });

app.use(
	session({
		resave: false,
		saveUninitialized: false,
		secret: process.env.SESSION_SECRET,
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});





// app.get('/', (req, res) => {
// 	res.render("secrets")
// });

app.get('/register', (req, res) => {
	// res.render('register');
	User.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('register', { items: items });
        }
    });
});



//Axios for fetching data send by kaushik


 
axios.get('http://127.0.0.1:5000/getUser')
.then(response => {
	//  const i = " ";
	dt =  response.data;
	// console.log(i)
	
// var a = JSON.stringify(i);
// console.log(dt[0].emails);
// console.log(a.emails)
	

})
.catch(error =>{
	console.log(error)
});

// Use connect method to connect to the server
// app.get("/secrets",(req,res)=>{
// 	res.render("/home")
// })
app.get("/",(req , res)=>{
	
	
		  
			// Find a single document
			// db.collection('users').findOne({_id:i}, function(err, doc) {
			// 	if(!err){
			// 	console.log("ajs")
			//   console.log(doc);
			// 	}
			// });
			// res.render("home")
			
			// Find multiple documents
			// db.collection('users').find({i}).toArray(function(err, docs) {
			//   console.log(docs);
			// });
		  
			// // Close the client
			// client.close();
		  


 
  Projects.find({}, function (err, project) {
	
		if(!err){
		res.render('home',{ projects: project });
		//  console.log(project)
		}
		else{
			console.log(err);
		}
	  });

})

app.get("/profile",(req , res)=>{
    // console.log(dt);
	if(dt[0].isAuth = 'false'){
		res.render("profile" ,{data:dt})
	}
	else{
		res.render("profile")
	}


	
  			

  let i = 0;
//   while(i < pro.length ){
// 	  var temp = pro[i];
// 	//   console.log(temp)
// 	  Projects.findById(temp, function (err, item) {
// 		  if (err) return res.json(400, {message: `user ${id} not found.`});
// 	  		  if(!err){
// 				res.locals.projects = item;
// 				console.log(res.locals.projects)
// 			  }
// 		});
// 		i++;
//   }
    
    
	
})


// This function handles the registration of a user



app.post('/project',uploads.single('project[image]'), async (req, res) => {
	const project = new Projects(req.body.project);
	// var vid = req.user.id;
    //  console.log(vid);
	project.image= {
		data: fs.readFileSync(path.join(__dirname + '/prouploads/' + req.file.filename)),
		contentType: 'image/png'
	}
	try {
		await project.save();
		var proid = project._id;
		console.log(proid);
		console.log("saved");
		// User.findOne({_id: proid}, function (err, user) {
		// 	if (err) return res.json(400, {message: `user ${id} not found.`});
		
			// make sure you omit sensitive user information 
			// on this object before sending it to the client.
			// res.json(user.email)
			// if(!err){
			// User.findOneAndUpdate(
			// 	{ _id: vid }, 
			// 	{ $push: { pro_id: proid  } },
			//    function (error, success) {
			// 		 if (error) {
			// 			 console.log(error);
			// 		 } else {
			// 			 console.log(success);
			// 		 }
			// 	 });
			// 	}			
		//   });
		req.flash('success', 'Project Posted');
		res.redirect('/');
	} catch (e) {
console.log(e);
		res.redirect('/project');
	}
});

app.get("/project",(req , res)=>{
    if(dt[0].isAuth = 'false'){
		// res.render("profile" ,{data:dt})
		// var id = req.user.id;
		// console.log(id);

//   User.findOne({_id: id}, function (err, user) {
//     if (err) return res.json(400, {message: `user ${id} not found.`});

    // make sure you omit sensitive user information 
    // on this object before sending it to the client.
	// res.json(user.email)
    res.render('project', { data:dt});
//   });
				
	}
    
    // }
    // else{
    //     res.redirect("/login")
    // }
})
app.get('./templates/index', (req, res) => {
	res.render('index');
});
// app.get('/login', (req, res) => {
// 	res.render('login');
	
	
// });



   
app.get('/logout', (req, res) => {
	req.logOut();
	req.flash('success', 'Successfully Logged out');
	res.redirect('/login');
});


app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
