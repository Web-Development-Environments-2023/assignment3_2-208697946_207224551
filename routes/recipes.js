var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const DButils = require("./utils/DButils");


router.get("/", (req, res) => res.send("im here"));

/**
 * This path returns main page 
 */
router.get("/random", async (req, res, next) => {
  try {
    console.log(req.session);
    console.log(req.session.user_id);

    const random_recipes = await recipes_utils.getRandomRecipes();
    let recipes = await recipes_utils.getRecipesPreview(req.session.user_id, random_recipes);
    res.status(200).send(recipes);
    
  } catch (error) {
    next(error);
  }
});

router.get("/lastWatched", async (req, res, next) => {
  try {

    if (req.session && req.session.user_id) {
      const query = 
      `SELECT recipe_id, time
       FROM views
       WHERE user_id = '${req.session.user_id}'
       ORDER BY time DESC
       LIMIT 3`;

       const result = await DButils.execQuery(query);
       const lastThreeRecipesids = result.map((item) => item.recipe_id);
       const lastThreeRecipes = await recipes_utils.getRecipesPreview(req.session.user_id, lastThreeRecipesids);
      
       res.status(200).send(lastThreeRecipes);
    }
    else{
      throw { status: 404, message: "no results were found" };
    }
    
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns search results 
 */
router.get("/search", async (req, res, next) => {
  try {
    let user_id = null;
    if(req.session && req.session.user_id){
      user_id = req.session.user_id;
    }

    const search_res = await recipes_utils.SearchRecipes(user_id , req.query.query, req.query.cuisine, req.query.diet , req.query.intolerance, req.query.results_num);
    if (search_res.length === 0){
      throw { status: 404, message: "no results were found" };
    }
    else{
      res.status(200).send(search_res);
    }
  } catch (error) {
    next(error);
  }
});





/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    let recipe;
    let user_id = null;
    if( req.session && req.session.user_id){
      user_id = req.session.user_id;
    }
    const recipe_id = String(req.params.recipeId);
    if (recipe_id.includes('U')){
        recipe = await DButils.execQuery(`SELECT recipe_id, title, image, readyInMinutes, vegetarian ,vegan, glutenFree, ingredients, instructions, servings FROM recipes where recipe_id='${recipe_id}'`);
        if (recipe.length == 0){
          recipe = null;
        }
        else{
          recipe = recipe[0];
        }
    }
    else{
      recipe = await recipes_utils.getRecipeFullDetails(user_id, recipe_id);
      if (req.session && req.session.user_id) {
        let ids = await DButils.execQuery(`select recipe_id from views where user_id='${req.session.user_id}'`);
        ids = ids.map((item) => String(item.recipe_id));
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
        if (!ids.includes(recipe_id)){
           await DButils.execQuery(`insert into views values ('${req.session.user_id}', '${req.params.recipeId}', '${currentDate}')`);
        }
        else{
          await DButils.execQuery(`UPDATE views SET time='${currentDate}' where user_id='${req.session.user_id}' AND recipe_id='${req.params.recipeId}'`)
        }
      }
    }
    if (recipe == null){
      throw { status: 404, message: "no results were found" };
    }
    else{
      res.status(200).send(recipe);
    }
  }
  catch (error){
    next(error);
  } 
});

module.exports = router;

