const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _ = require("lodash");
const app = express();


app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb+srv://admin-arpit:Test@123@cluster0-gfb8e.mongodb.net/todolistDB");

const itemSchema= ({
  name: String
})

const Item=mongoose.model("Item", itemSchema);

const item1= new Item({
  name: "Welcome"
})
const item2= new Item({
  name: "Hit it!"
})
const item3= new Item({
  name: "Scratch"
})

const defaultItems = [item1, item2, item3];

const listSchema={
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany([item1, item2, item3], function(err){
        if(err){
          console.log(err);
        }else{
          console.log("succesfully added!");
        }
      });
      res.redirect("/");
    }else{
      res.render("list.ejs", {
        title: "Today",
        newListItem: foundItems
      });
    }

  })

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list.ejs", {
          title: foundList.name,
          newListItem: foundList.items
        });
      }
    }
  })

})

app.post("/makeList", function(req, res){
  const listName = req.body.newList;
  res.redirect("/"+listName);
})

app.post("/", function(req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem =new Item({
    name: item
  });
  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemsId= req.body.checkbox;
  const listName =req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemsId, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("succesfully deleted");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemsId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

})
let port = process.env.PORT;
if(port==null || port==""){
  port=3000;
}
app.listen(3000, function() {
  console.log("Server is running..");
});
