const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favorites values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favorites where user_id='${user_id}'`);
    return recipes_id;
}

async function getmyRecipes(user_id){
    let query= `SELECT user_id, recipe_id, title, image, readyInMinutes ,vegetarian, vegan , glutenFree
    FROM
    recipes 
    WHERE
    user_id = '${user_id}' `;
    let myRecipesList= await DButils.execQuery(query);
    return myRecipesList;
}

async function getRecipeViews(user_id , recipe_id){
    res = await DButils.execQuery(`SELECT EXISTS (SELECT 1 FROM views WHERE user_id='${user_id}' AND recipe_id='${recipe_id}')`)
    return Object.values(res[0])[0] === 1;
}


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getmyRecipes=getmyRecipes;
exports.getRecipeViews = getRecipeViews;
