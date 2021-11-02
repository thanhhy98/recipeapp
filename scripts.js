const search = document.getElementById('search');
const form = document.querySelector('header form');
const favList = document.querySelector('.fav-list');
const container = document.querySelector('.meal-container');
const searchContainer = document.querySelector('.main-search');
const mainMeal = document.querySelector('.main-meal')
const popup = document.querySelector('.popup');
const showItemsCount = document.querySelector('.meal-container h3');

window.addEventListener('DOMContentLoaded', () => {
    getRandomMeal();
    loadFavouriteList();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = search.value;
    loadSearchedMeals(value);
})

let randomMealID;

async function loadSearchedMeals(name) {
    mainMeal.innerHTML = '';
    searchContainer.innerHTML = '';
    const meals = await getMealsBySearch(name);
    if(meals) {
        showItemsCount.innerHTML = `Co ${meals.length} san pham voi tu khoa ${name}`;
        meals.forEach(meal => {
            loadSearchedMealsHTML(meal);
        })
    }
}

function loadSearchedMealsHTML(meal) {
    const item = document.createElement('div');
    item.classList.add('search-item');
    item.innerHTML = `<p class="meal-title">${meal.strMeal}</p>
                        <span class="search-img-like"><button><i class="fas fa-heart"></i></button></span>
                        <img  src="${meal.strMealThumb}" class="main-image">`;
    searchContainer.append(item);
    item.addEventListener('click', () => {
        showPopUp(meal)
    })
    const addMeal = item.querySelector('.search-img-like button');
    addMeal.addEventListener('click', () => {
        if (addMeal.classList.contains('active')) {
            addMeal.classList.remove('active');
            deleteMealLS(meal.idMeal);
            loadFavouriteList();
        } else {
            addMeal.classList.add('active');
            addMealLS(meal.idMeal);
            loadFavouriteList();
        }
    });
}

async function getMealByID(id) {
    let api = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    let meal = await api.json();
    meal = meal.meals[0];
    return meal;
}

async function getMealsBySearch(name) {
    let api = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + name);
    let mealArr = await api.json();
    return mealArr.meals;
}

async function getRandomMeal() {
    let api = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    let meal = await api.json();
    meal = meal.meals[0];
    randomMealID = meal.idMeal;

    let list = [];
    for(let i = 1; i < 21; i++) {
        if(meal['strIngredient' + i]) {
            list.push(`<li>${meal['strIngredient' + i]}: ${meal['strMeasure' + i]}</li>`)
        }
    }
    mainMeal.innerHTML = `<div class="main-img">
                            <p class="meal-title">Todays meal: ${meal.strMeal}</p>
                            <span class="main-img-like"><button><i class="fas fa-heart"></i></button></span>
                            <img  src="${meal.strMealThumb}" class="main-image">
                        </div>
                        <div class="instruction">
                            <h4>A dish of ${meal.strArea}</h4>
                            <h4>Instructor:</h4>
                            <p>${meal.strInstructions}</p>
                            <h4>Ingredient</h4>
                        <ul>
                            ${list.join('')}
                        </ul>
                    </div>`;
    
    const addMeal = mainMeal.querySelector('.main-img-like button');
    addMeal.addEventListener('click', () => {
        if (addMeal.classList.contains('active')) {
            addMeal.classList.remove('active');
            deleteMealLS(meal.idMeal);
            loadFavouriteList();
        } else {
            addMeal.classList.add('active');
            addMealLS(meal.idMeal);
            loadFavouriteList();
        }
    });
    const image = mainMeal.querySelector('.main-img');
    image.addEventListener('click', () => {
        showPopUp(meal);
    })
}

function getMealLS() {
    return localStorage.getItem('meal') ? JSON.parse(localStorage.getItem('meal')) : [];
}

function deleteMealLS(id) {
    let meals = getMealLS();
    localStorage.setItem('meal', JSON.stringify(
        meals.filter(item => item !== id)));
}

function addMealLS(id) {
    let meals = getMealLS();
    localStorage.setItem('meal', JSON.stringify([...meals, id]));
}

async function loadFavouriteList() {
    favList.innerHTML = '';
    const meals = getMealLS();
    for (let i = 0; i < meals.length; i++) {
        const mealID = meals[i];
        meal = await getMealByID(mealID);

        loadFavouriteListHTML(meal);
    }
}


function loadFavouriteListHTML(meal) {
    const element = document.createElement('li');
    element.innerHTML = `<span class="remove-fav">
                        <i class="fas fa-times"></i>
                    </span>
                    <img  src="${meal.strMealThumb}">
                    <span>${meal.strMeal}</span>`;
    
    favList.append(element);
    const clearItem = element.querySelector('.remove-fav');
    clearItem.addEventListener('click', () => {
        deleteMealLS(meal.idMeal);
        element.remove();
        if(randomMealID === meal.idMeal) {
            const addMeal = mainMeal.querySelector('.main-img-like button');
            addMeal.classList.remove('active');
        }
    })

    element.addEventListener('click', () => {
        showPopUp(meal);
    })
}

function showPopUp(meal) {
    popup.innerHTML = '';
    popup.classList.remove('okchua');
    let ings = [];
    for(let i = 1; i < 21; i++) {
        if(meal['strIngredient' + i]) {
            ings.push(`<li>${meal['strIngredient' + i]} - ${meal['strMeasure' + i]}</li>`)
        }
    }
    popup.innerHTML = `<div class="popup-info">
        <button><i class="fas fa-times"></i></button>
        <h1>${meal.strMeal}</h1>
            <img  src="${meal.strMealThumb}" class="main-image">
            <h4>Instructor:</h4>
            <p>${meal.strInstructions}</p>
            <h4>Ingredient</h4>
            <ul>
            ${ings.join('')}
            </ul>
    </div>`;

    const closePopUp = popup.querySelector('.popup-info button');
    closePopUp.addEventListener('click', () => {
        popup.classList.add('okchua');
    });
}