const express = require("express");
const fs = require ("fs");
const app = express();

 
 app.use((req, resp , next)=>{
 const log = `Path: ${req.url} | Method: ${req.method} | Time: ${new Date().toLocaleString()}\n`;

 fs.appendFile("./ logs.txt", log, (err)=>{
if(err){
    resp.send("cannot log the text");
}
next();
 });
 });

app.listen(5000 , ()=>{
    console.log("Server running port on http://localhost:5000");
})