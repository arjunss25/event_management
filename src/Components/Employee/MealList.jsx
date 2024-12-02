const handleMealSelect = (dayData, meal) => {
  // Assuming dayData contains the date information from the API
  const mealInfo = {
    dayId: dayData.id,
    mealCategory: meal.name,
    date: dayData.date  // Include the date from the day's data
  };
  
  dispatch(toggleScanner(true, mealInfo));
}; 