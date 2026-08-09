const db = require("../../config/database");
const AppError = require("../../utils/AppError");

exports.getAllPolls = async () => {
    const sql = `SELECT id, title, description, start_date, end_date, is_active, created_at
                 FROM polls WHERE is_active = 1 ORDER BY created_at DESC`;
    const [polls] = await db.execute(sql);
    return polls;
};

exports.getPollById = async (pollId) => {
    const [polls] = await db.execute(
        `SELECT id, title, description, start_date, end_date, is_active FROM polls WHERE id = ?`,
        [pollId]
    );
    if (polls.length === 0) throw new AppError("Poll not found", 404);

    const [options] = await db.execute(
        `SELECT id, option_text FROM poll_options WHERE poll_id = ?`,
        [pollId]
    );
    return { ...polls[0], options };
};

exports.votePoll = async (pollId, userId, optionId) => {
    const [polls] = await db.execute(
        `SELECT * FROM polls WHERE id = ? AND is_active = 1`,
        [pollId]
    );
    if (polls.length === 0) throw new AppError("Poll not available", 404);

    const [alreadyVoted] = await db.execute(
        `SELECT id FROM poll_votes WHERE poll_id = ? AND user_id = ?`,
        [pollId, userId]
    );
    if (alreadyVoted.length > 0) throw new AppError("You have already voted", 400);

    const [option] = await db.execute(
        `SELECT id FROM poll_options WHERE id = ? AND poll_id = ?`,
        [optionId, pollId]
    );
    if (option.length === 0) throw new AppError("Invalid option", 400);

    await db.execute(
        `INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)`,
        [pollId, optionId, userId]
    );

    return { success: true, message: "Vote submitted successfully" };
};

exports.getPollResults = async (pollId) => {
    const [polls] = await db.execute(`SELECT id, title FROM polls WHERE id = ?`, [pollId]);
    if (polls.length === 0) throw new AppError("Poll not found", 404);

    const [results] = await db.execute(
        `SELECT po.id, po.option_text, COUNT(pv.id) AS votes
         FROM poll_options po
         LEFT JOIN poll_votes pv ON pv.option_id = po.id
         WHERE po.poll_id = ?
         GROUP BY po.id`,
        [pollId]
    );

    return { poll: polls[0], results };
};
