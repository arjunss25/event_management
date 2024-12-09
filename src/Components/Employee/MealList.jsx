const handleMealSelect = (dayData, meal) => {

  const mealInfo = {
    dayId: dayData.id,
    mealCategory: meal.name,
    date: dayData.date  
  };
  
  dispatch(toggleScanner(true, mealInfo));
}; 