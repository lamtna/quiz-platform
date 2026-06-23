module.exports = {
  // Game
  REQUIRED_CATEGORIES: 6,
  DIFFICULTY_LEVELS: [200, 400, 600, 800],
  GAME_STATUS: {
    ACTIVE: 'active',
    FINISHED: 'finished',
  },

  // Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // Question defaults
  DEFAULT_QUESTION_TIMER: 30,

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,

  // Socket events
  SOCKET_EVENTS: {
    GAME_CREATED: 'game_created',
    QUESTION_SELECTED: 'question_selected',
    ANSWER_REVEALED: 'answer_revealed',
    SCORE_UPDATED: 'score_updated',
    GAME_FINISHED: 'game_finished',
    JOIN_GAME: 'join_game',
    PLAYER_JOINED: 'player_joined',
  },

  // Cloudinary folders
  CLOUDINARY_FOLDERS: {
    CATEGORIES: 'quiz/categories',
    QUESTIONS: 'quiz/questions',
  },
};
