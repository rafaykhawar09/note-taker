let fs = require("fs");
let util = require("util");

let path = require("path");
let express = require("express");

let db = require("./db/db.json");


let app = express();

const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);

// -----------------------------------------------------------
// This code block is a "boiler plate" / "template" to setup 
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
// -----------------------------------------------------------


// This get call is sending the "home page" to the client/user
app.get('/', (req, res)=>{
     res.sendFile(path.join(__dirname, "./public/index.html"));
});


// This get call is sending the "notes page" to the client/user
app.get('/notes', (req, res)=>{
     res.sendFile(path.join(__dirname, "./public/notes.html"));
});


// This call, is going to "get" all the notes saved inside db.json
// After it has gotten all the notes it is going to plop them on the sidebar in "notes.html"
app.get("/api/notes", (req, res)=>{
     
     readFileAsync("./db/db.json", "utf8")
     .then((data)=>{

          data = JSON.parse(data);

          return res.json(data);
     })
     .catch((err) => console.log(err))
});


// Through the POST request the user sends a "new note" which would get saved in db.json
app.post("/api/notes", (req, res)=>{

     // newNote will have the note that the user currently typed in and tried to save
     let newlyCreatedNote = req.body;

     // Before adding the new note to db.json, the previous data inside db.json needs to be read and stored in a local variable or else it will be lost
     // The new note is then appended to this local variable - data
     // Finally, the data variable sent to be written onto the file db.json
     readFileAsync("./db/db.json", "utf8")
     .then((data) => {

          data = JSON.parse(data);

          data.push(newlyCreatedNote);

          data[data.length - 1].id = data.length - 1;

          writeFileAsync("./db/db.json", JSON.stringify(data));
     })
     .catch((err) => console.log(err));

     res.send("Created a new note!");
});


// Whenever the user clicks the trash can icon, it deletes the respective note
app.delete("/api/notes/:id", (req, res)=>{

     let ID = req.params.id;

     // console.log(ID);

     readFileAsync("./db/db.json", "utf8")
     .then((data)=>{

          data = JSON.parse(data);

          data.splice(ID, 1);

          for (let i = 0; i < data.length; i++)
               data[i].id = i;

          writeFileAsync("./db/db.json", JSON.stringify(data));
     })
     .catch((err) => console.log(err));

     res.send("Deleted the note sucessfully!");
});


app.listen(PORT, ()=>{

     console.log(`Listening on port ${PORT}`);
})