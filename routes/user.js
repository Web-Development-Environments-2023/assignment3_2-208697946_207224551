var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  console.log(req.session, req.session.user_id)
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT username FROM users").then((users) => {
      if (users.find((x) => x.username === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    console.log(user_id);
    const recipe_id = req.body.recipeId;
    console.log(recipe_id);

    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    console.log(user_id);
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    console.log(recipes_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(user_id, recipes_id_array, true);
    if(results.length == 0){
      throw { status: 404, message: "no results were found" };
    }
    else{
      res.status(200).send(results);
    }
  } catch(error){
    next(error); 
  }
});

/**
 * This path is for creating a new recipe 
 */
router.post("/myRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const result = await DButils.execQuery(`SELECT COUNT(*) AS record_count FROM recipes`);
    const id = result[0].record_count + 1;
    const recipe_id = 'U' + id;
    
    let { title, image, readyInMinutes , vegetarian, vegan , glutenFree, ingredients, instructions, servings} = req.body;
    let ingredientsJSON = JSON.stringify(ingredients);
    let query = `INSERT INTO Recipes VALUES ('${user_id}','${recipe_id}','${title}','${image}','${readyInMinutes}','${vegetarian}','${vegan}', '${glutenFree}','${ingredientsJSON}','${instructions}','${servings}')`;
    await DButils.execQuery(query);
    res.status(201).send("A new recipe has been added");

  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the recipes that was created by the logged-in user
 */

router.get('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const myRecipes = await user_utils.getmyRecipes(user_id);
    let myRecipes_array = [];
    myRecipes.map((element) => myRecipes_array.push({id: element.recipe_id , title: element.title, readyInMinutes: element.readyInMinutes, image: element.image, vegan: element.vegan , vegetarian: element.vegetarian, glutenFree: element.glutenFree})); 
    if (myRecipes_array.length === 0){
      throw { status: 404, message: "no results were found" };
    }
    else{
      res.status(200).send(myRecipes_array);
    }
  } catch(error){
    next(error); 
  }
});

router.get('/myFamilyRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let recipes = await DButils.execQuery(`SELECT title, image, owner, WhenToCook ,ingredients, instructions from familyrecipes WHERE user_id='${user_id}'`);

    if (recipes.length === 0){
      throw { status: 404, message: "no results were found" };
    }
    else{
      res.status(200).send(recipes);
    }
  } catch(error){
    next(error); 
  }
});




module.exports = router;
