const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipesPreview(recipes_id_array) {
    let recipes = [];
    await Promise.all(
      recipes_id_array.map(async (recipe_id) => {
        const recipeInfo = await getRecipeInformation(recipe_id);
        recipes.push(recipeInfo);
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
        return { id: item.id, title: item.title, readyInMinutes: item.readyInMinutes, image: item.image, popularity: item.aggregateLikes,vegan: item.vegan, vegetarian:item.vegetarian, glutenFree: item.glutenFree };
      });
    return newArray;
    
}


async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    console.log(recipe_info.data);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}


exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipesPreview = getRecipesPreview;



