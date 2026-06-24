const BASE_URL = "http://localhost:5000/api";

export const getQuestions = () =>
  fetch(`${BASE_URL}/questions`).then(res => res.json());

export const getCategories = () =>
  fetch(`${BASE_URL}/categories`).then(res => res.json());

export const getGames = () =>
  fetch(`${BASE_URL}/games`).then(res => res.json());