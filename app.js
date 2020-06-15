const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

let items = [];
let workItems = [];

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get("/", function(req, res) {
  let day = date.getDate();
  res.render("list.ejs", {
    title: day,
    newListItem: items
  });
});
app.post("/", function(req, res) {
  let item = req.body.newItem;
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});
app.get("/work", function(req, res) {
  res.render("list.ejs", {
    title: "Work List",
    newListItem: workItems
  })
})


app.listen(3000, function() {
  console.log("Server is running..");
});
