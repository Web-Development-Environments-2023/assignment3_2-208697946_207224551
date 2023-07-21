const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");
const user_utils = require("./user_utils");

/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    try{
        return await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: process.env.spooncular_apiKey
            }
        });
    }
    catch(error){
        if (error.response && error.response.status === 404) {
            throw { status: 404, message: "no results were found" };

        }
    }

}

async function isRecipeViewed(user_id, recipe_id){
    let viewed = false;
    viewed = await user_utils.getRecipeViews(user_id , recipe_id);
    return viewed;
}

async function isRecipeFavorite(user_id, recipe_id){
    let favorite = false;
    let favorites = await user_utils.getFavoriteRecipes(user_id);
    favorite = favorites.some((favorite) => String(favorite.recipe_id) === String(recipe_id));
    return favorite;  
}



async function getRecipesPreview(user_id , recipes_id_array, is_favorite = false) {

    let recipes = [];
    let Watched = false;
    await Promise.all(
      recipes_id_array.map(async (recipe_id) => {
        let recipeInfo = await getRecipeInformation(recipe_id);
        if (user_id != null){
            Watched = await isRecipeViewed(user_id, recipe_id);
            if( is_favorite === false){
                is_favorite = await isRecipeFavorite(user_id, recipe_id);
            }
        }
 
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipeInfo.data;

        recipes.push({
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            Watched: Watched,
            is_favorite: is_favorite
        });
      })
    );
    return recipes;
}

async function getRandomRecipes() {
    let random_recipes =  await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
    let random_recipes_array = [];
    random_recipes_array = random_recipes.data.recipes;
    const newArray = random_recipes_array.map(item => {
             return item.id;
           });
    // const newArray = random_recipes_array.map(item => {
    //     return { id: item.id, title: item.title, readyInMinutes: item.readyInMinutes, image: item.image, popularity: item.aggregateLikes,vegan: item.vegan, vegetarian:item.vegetarian, glutenFree: item.glutenFree };
    //   });
    return newArray;
    
}

async function SearchRecipes(user_id, query ,cuisine, diet , intolorence , number) {
    let search_results =  await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: query,
            cuisine:cuisine ,
            diet: diet,
            intolerances:intolorence,
            number:number,
            instructionsRequired: true,
            apiKey: process.env.spooncular_apiKey
        }
    });
    let recipes_array = [];
    recipes_array = search_results.data.results;
    const newArray = recipes_array.map(item => {
        return item.id
      });
    let res = [];
    res = getRecipesPreview(user_id, newArray);
    return res;
}


async function getRecipeFullDetails(user_id, recipe_id) {
    try{
        let recipe_info = await getRecipeInformation(recipe_id);
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree , servings , instructions, extendedIngredients } = recipe_info.data;
        let ingredients = extendedIngredients.map(({ name, amount }) => ({ name, amount }));
        let Watched = false;
        let is_favorite = false;
        if (user_id != null){
            Watched = await isRecipeViewed(user_id, recipe_id);
            is_favorite = await isRecipeFavorite(user_id, recipe_id); 
        }
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            ingredients: ingredients,
            instructions: instructions,
            servings: servings,
            watched: Watched,
            is_favorite: is_favorite
        }
    }
    catch(error){
        throw(error);
    }
}



exports.getRecipeFullDetails = getRecipeFullDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipesPreview = getRecipesPreview;
exports.SearchRecipes = SearchRecipes;



