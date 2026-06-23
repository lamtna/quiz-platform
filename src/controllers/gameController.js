const Game = require('../models/Game');
const Question = require('../models/Question');
const Category = require('../models/Category');
const User = require('../models/User');
const { success, created, notFound, badRequest, forbidden } = require('../utils/apiResponse');
const { getPagination } = require('../utils/pagination');
const { REQUIRED_CATEGORIES, DIFFICULTY_LEVELS, GAME_STATUS } = require('../config/constants');
const { getIo } = require('../sockets');
const {
  emitGameCreated,
  emitQuestionSelected,
  emitAnswerRevealed,
  emitScoreUpdated,
  emitGameFinished,
} = require('../sockets/gameSocket');

// ─── HELPER: Pick ONE random unused question via $sample (true randomness) ───
const pickRandomQuestion = async (categoryId, difficulty) => {
  const results = await Question.aggregate([
    { $match: { categoryId: categoryId, difficulty: difficulty, used: false } },
    { $sample: { size: 1 } },
  ]);
  return results.length ? results[0] : null;
};

// ─── HELPER: Build board, assign random questions per cell ───────────────────
const buildBoard = async (categoryDocs) => {
  const board = [];
  for (const cat of categoryDocs) {
    for (const difficulty of DIFFICULTY_LEVELS) {
      const question = await pickRandomQuestion(cat._id, difficulty);
      board.push({
        categoryId: cat._id,
        categoryName: cat.name,
        difficulty,
        questionId: question ? question._id : null,
        isAnswered: false,
        answeredBy: null,
        pointsAwarded: 0,
      });
      // Lock question immediately so no other concurrent game can claim it
      if (question) {
        await Question.findByIdAndUpdate(question._id, { used: true });
      }
    }
  }
  return board;
};

const determineWinner = (score) => {
  if (score.teamA > score.teamB) return 'teamA';
  if (score.teamB > score.teamA) return 'teamB';
  return 'tie';
};

const isBoardComplete = (board) =>
  board.every((cell) => cell.isAnswered || !cell.questionId);

// ─── Check game ownership ────────────────────────────────────────────────────
const assertOwner = (game, user) => {
  return user.role === 'admin' || String(game.userId) === String(user._id);
};

// ────────────────────────────────────────────────────────────────────────────
// CREATE GAME
// ────────────────────────────────────────────────────────────────────────────
const createGame = async (req, res, next) => {
  try {
    const { gameName, teamAName, teamBName, categoryIds } = req.body;
    const user = req.user;

    if (!user.hasFreeGame) {
      return forbidden(res, 'لقد استنفدت لعبتك المجانية. يرجى الترقية للاستمرار.');
    }
    if (!Array.isArray(categoryIds) || categoryIds.length !== REQUIRED_CATEGORIES) {
      return badRequest(res, `يجب اختيار ${REQUIRED_CATEGORIES} فئات بالضبط`);
    }
    if (teamAName.trim().toLowerCase() === teamBName.trim().toLowerCase()) {
      return badRequest(res, 'يجب أن تكون أسماء الفرق مختلفة');
    }

    const categoryDocs = await Category.find({ _id: { $in: categoryIds }, isActive: true });
    if (categoryDocs.length !== REQUIRED_CATEGORIES) {
      return badRequest(res, 'إحدى الفئات المختارة غير صالحة أو غير نشطة');
    }

    const board = await buildBoard(categoryDocs);

    const game = await Game.create({
      userId: user._id,
      gameName,
      teamAName,
      teamBName,
      categories: categoryIds,
      board,
      status: GAME_STATUS.ACTIVE,
      score: { teamA: 0, teamB: 0 },
    });

    await User.findByIdAndUpdate(user._id, { hasFreeGame: false });
    await game.populate('categories', 'name image');

    // Real-time: broadcast game creation to the room
    try {
      emitGameCreated(getIo(), game);
    } catch (_) {}

    return created(res, { game }, 'تم إنشاء اللعبة بنجاح');
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// LIST GAMES
// ────────────────────────────────────────────────────────────────────────────
const getGames = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    } else if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    if (req.query.status) filter.status = req.query.status;

    const [games, total] = await Promise.all([
      Game.find(filter)
        .populate('userId', 'name email')
        .populate('categories', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Game.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'تم جلب الألعاب',
      data: games,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET SINGLE GAME
// ────────────────────────────────────────────────────────────────────────────
const getGameById = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('categories', 'name image')
      .populate('board.questionId', 'text difficulty timer media');

    if (!game) return notFound(res, 'اللعبة غير موجودة');
    if (!assertOwner(game, req.user)) return forbidden(res, 'غير مصرح');

    return success(res, { game }, 'تم جلب اللعبة');
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// SELECT QUESTION (locks it, starts timer)
// ────────────────────────────────────────────────────────────────────────────
const selectQuestion = async (req, res, next) => {
  try {
    const { categoryId, difficulty } = req.body;
    const game = await Game.findById(req.params.id);

    if (!game) return notFound(res, 'اللعبة غير موجودة');
    if (game.status === GAME_STATUS.FINISHED) return badRequest(res, 'اللعبة منتهية');
    if (!assertOwner(game, req.user)) return forbidden(res, 'غير مصرح');

    const cell = game.board.find(
      (c) =>
        String(c.categoryId) === String(categoryId) &&
        c.difficulty === Number(difficulty)
    );

    if (!cell) return notFound(res, 'الخلية غير موجودة على اللوحة');
    if (cell.isAnswered) return badRequest(res, 'تمت الإجابة على هذا السؤال بالفعل');
    if (!cell.questionId) return badRequest(res, 'لا يوجد سؤال متاح لهذه الخلية');

    // Fetch question (already marked used at board-build time)
    const question = await Question.findById(cell.questionId).populate('categoryId', 'name');
    if (!question) return notFound(res, 'السؤال غير موجود');

    const now = new Date();
    game.currentQuestion = {
      questionId: question._id,
      categoryId: question.categoryId._id,
      difficulty: question.difficulty,
      startedAt: now,
      duration: question.timer,
    };
    await game.save();

    const payload = {
      gameId: game._id,
      question: {
        _id: question._id,
        text: question.text,
        media: question.media,
        difficulty: question.difficulty,
        category: question.categoryId.name,
        // answer is intentionally omitted here
      },
      timer: {
        startTime: now.toISOString(),
        duration: question.timer,
      },
    };

    // Real-time broadcast
    try { emitQuestionSelected(getIo(), game._id, payload); } catch (_) {}

    return success(res, payload, 'تم اختيار السؤال');
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// REVEAL ANSWER + award points
// ────────────────────────────────────────────────────────────────────────────
const revealAnswer = async (req, res, next) => {
  try {
    const { teamScored } = req.body; // 'teamA' | 'teamB' | null

    const game = await Game.findById(req.params.id);
    if (!game) return notFound(res, 'اللعبة غير موجودة');
    if (game.status === GAME_STATUS.FINISHED) return badRequest(res, 'اللعبة منتهية بالفعل');
    if (!assertOwner(game, req.user)) return forbidden(res, 'غير مصرح');
    if (!game.currentQuestion.questionId) {
      return badRequest(res, 'لا يوجد سؤال نشط. اختر سؤالاً أولاً.');
    }

    const question = await Question.findById(game.currentQuestion.questionId);
    if (!question) return notFound(res, 'السؤال غير موجود');

    const difficulty = game.currentQuestion.difficulty;

    // Mark cell answered
    const cell = game.board.find((c) => String(c.questionId) === String(question._id));
    if (cell) {
      cell.isAnswered = true;
      cell.answeredBy = teamScored || null;
      cell.pointsAwarded = teamScored ? difficulty : 0;
    }

    // Award points
    if (teamScored === 'teamA') game.score.teamA += difficulty;
    else if (teamScored === 'teamB') game.score.teamB += difficulty;

    // Clear active question slot
    game.currentQuestion = {
      questionId: null, categoryId: null, difficulty: null,
      startedAt: null, duration: null,
    };

    let gameFinished = false;
    if (isBoardComplete(game.board)) {
      game.status = GAME_STATUS.FINISHED;
      game.finishedAt = new Date();
      game.winner = determineWinner(game.score);
      gameFinished = true;
    }

    await game.save();

    const revealPayload = {
      gameId: game._id,
      questionId: question._id,
      answer: question.answer,
      answerMedia: question.answerMedia,
      teamScored: teamScored || null,
      pointsAwarded: teamScored ? difficulty : 0,
      score: game.score,
      gameFinished,
      ...(gameFinished && { winner: game.winner }),
    };

    // Real-time broadcasts
    try {
      const io = getIo();
      emitAnswerRevealed(io, game._id, revealPayload);
      emitScoreUpdated(io, game._id, game.score);
      if (gameFinished) {
        emitGameFinished(io, game._id, {
          gameId: game._id,
          winner: game.winner,
          score: game.score,
          teamAName: game.teamAName,
          teamBName: game.teamBName,
          gameName: game.gameName,
        });
      }
    } catch (_) {}

    return success(res, revealPayload, gameFinished ? 'انتهت اللعبة!' : 'تم كشف الإجابة');
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// FORCE FINISH
// ────────────────────────────────────────────────────────────────────────────
const finishGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return notFound(res, 'اللعبة غير موجودة');
    if (game.status === GAME_STATUS.FINISHED) return badRequest(res, 'اللعبة منتهية بالفعل');
    if (!assertOwner(game, req.user)) return forbidden(res, 'غير مصرح');

    game.status = GAME_STATUS.FINISHED;
    game.finishedAt = new Date();
    game.winner = determineWinner(game.score);
    await game.save();

    const payload = {
      gameId: game._id,
      winner: game.winner,
      score: game.score,
      teamAName: game.teamAName,
      teamBName: game.teamBName,
      gameName: game.gameName,
    };
    try { emitGameFinished(getIo(), game._id, payload); } catch (_) {}

    return success(res, payload, 'تم إنهاء اللعبة');
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GAME SUMMARY
// ────────────────────────────────────────────────────────────────────────────
const getGameSummary = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id).populate('categories', 'name');
    if (!game) return notFound(res, 'اللعبة غير موجودة');
    if (!assertOwner(game, req.user)) return forbidden(res, 'غير مصرح');

    const summary = {
      gameId: game._id,
      gameName: game.gameName,
      teamAName: game.teamAName,
      teamBName: game.teamBName,
      score: game.score,
      winner: game.winner,
      status: game.status,
      totalCells: game.board.length,
      answeredCells: game.board.filter((c) => c.isAnswered).length,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
      boardSummary: game.board.map((c) => ({
        category: c.categoryName,
        difficulty: c.difficulty,
        isAnswered: c.isAnswered,
        answeredBy: c.answeredBy,
        pointsAwarded: c.pointsAwarded,
      })),
    };

    return success(res, { summary }, 'ملخص اللعبة');
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// DELETE GAME
// ────────────────────────────────────────────────────────────────────────────
const deleteGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return notFound(res, 'اللعبة غير موجودة');
    if (!assertOwner(game, req.user)) return forbidden(res, 'غير مصرح');
    await game.deleteOne();
    return success(res, {}, 'تم حذف اللعبة');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGame,
  getGames,
  getGameById,
  selectQuestion,
  revealAnswer,
  finishGame,
  getGameSummary,
  deleteGame,
};
