const pool = require("../../config/database");

const createPoll = async (data) => {
    const {
        title, description, options,
        option_1, option_2, option_3, option_4,
        start_date, end_date, status, is_active, created_by
    } = data;

    const activeFlag = is_active !== undefined
        ? is_active
        : (status === "draft" || status === "closed" ? 0 : 1);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO polls (title, description, start_date, end_date, is_active, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description || null, start_date || null, end_date || null, activeFlag, created_by || null]
        );

        const pollId = result.insertId;

        let optionsList = [];
        if (Array.isArray(options) && options.length > 0) {
            optionsList = options
                .map(opt => typeof opt === "object" ? (opt.option_text || opt.text || "") : String(opt))
                .filter(opt => opt && opt.trim() !== "");
        } else {
            optionsList = [option_1, option_2, option_3, option_4]
                .filter(opt => opt && typeof opt === "string" && opt.trim() !== "");
        }

        if (optionsList.length > 0) {
            const optionValues = optionsList.map(opt => [pollId, opt.trim()]);
            await connection.query(
                `INSERT INTO poll_options (poll_id, option_text) VALUES ?`,
                [optionValues]
            );
        }

        await connection.commit();
        return pollId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getAllPolls = async () => {
    const [polls] = await pool.query(`
        SELECT p.id AS poll_id, p.id, p.title, p.description, p.start_date, p.end_date,
               p.is_active,
               CASE WHEN p.is_active = 1 THEN 'active' ELSE 'closed' END AS status,
               p.created_by, p.created_at, COUNT(v.id) AS total_votes
        FROM polls p
        LEFT JOIN poll_votes v ON p.id = v.poll_id
        GROUP BY p.id
        ORDER BY p.id DESC
    `);

    if (polls.length === 0) return [];

    const pollIds = polls.map(p => p.id);
    const [allOptions] = await pool.query(
        `SELECT o.id AS option_id, o.id, o.poll_id, o.option_text,
                COUNT(v.id) AS votes_count
         FROM poll_options o
         LEFT JOIN poll_votes v ON o.id = v.option_id
         WHERE o.poll_id IN (?)
         GROUP BY o.id, o.poll_id, o.option_text
         ORDER BY o.id ASC`,
        [pollIds]
    );

    const optionsMap = {};
    allOptions.forEach(opt => {
        if (!optionsMap[opt.poll_id]) optionsMap[opt.poll_id] = [];
        optionsMap[opt.poll_id].push({
            option_id: opt.option_id, id: opt.id,
            text: opt.option_text, option_text: opt.option_text,
            votes: Number(opt.votes_count || 0)
        });
    });

    return polls.map(p => {
        const opts = optionsMap[p.id] || [];
        return {
            ...p,
            options: opts,
            option_1: opts[0]?.option_text || "",
            option_2: opts[1]?.option_text || "",
            option_3: opts[2]?.option_text || "",
            option_4: opts[3]?.option_text || ""
        };
    });
};

const getPollById = async (id) => {
    const [rows] = await pool.query(`
        SELECT p.id AS poll_id, p.id, p.title, p.description, p.start_date, p.end_date,
               p.is_active,
               CASE WHEN p.is_active = 1 THEN 'active' ELSE 'closed' END AS status,
               p.created_by, p.created_at, COUNT(v.id) AS total_votes
        FROM polls p
        LEFT JOIN poll_votes v ON p.id = v.poll_id
        WHERE p.id = ?
        GROUP BY p.id
    `, [id]);

    if (rows.length === 0) throw new Error("Poll not found");
    const poll = rows[0];

    const [options] = await pool.query(`
        SELECT o.id AS option_id, o.id, o.option_text, COUNT(v.id) AS votes_count
        FROM poll_options o
        LEFT JOIN poll_votes v ON o.id = v.option_id
        WHERE o.poll_id = ?
        GROUP BY o.id, o.option_text
        ORDER BY o.id ASC
    `, [id]);

    poll.options = options.map(opt => ({
        option_id: opt.option_id, id: opt.id,
        text: opt.option_text, option_text: opt.option_text,
        votes: Number(opt.votes_count || 0)
    }));

    const [voters] = await pool.query(`
        SELECT v.id AS vote_id, v.user_id, u.full_name AS user_name, u.email AS user_email,
               v.option_id, o.option_text, v.created_at AS voted_at
        FROM poll_votes v
        JOIN users u ON v.user_id = u.id
        JOIN poll_options o ON v.option_id = o.id
        WHERE v.poll_id = ?
        ORDER BY v.created_at DESC
    `, [id]);

    poll.voters = voters;
    if (options[0]) poll.option_1 = options[0].option_text;
    if (options[1]) poll.option_2 = options[1].option_text;
    if (options[2]) poll.option_3 = options[2].option_text;
    if (options[3]) poll.option_4 = options[3].option_text;

    return poll;
};

const updatePoll = async (id, data) => {
    const {
        title, description, options,
        option_1, option_2, option_3, option_4,
        start_date, end_date, status, is_active
    } = data;

    const activeFlag = is_active !== undefined
        ? is_active
        : (status === "draft" || status === "closed" ? 0 : 1);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `UPDATE polls SET title = ?, description = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?`,
            [title, description || null, start_date || null, end_date || null, activeFlag, id]
        );

        if (result.affectedRows === 0) throw new Error("Poll not found");

        let optionsList = [];
        if (Array.isArray(options) && options.length > 0) {
            optionsList = options
                .map(opt => typeof opt === "object" ? (opt.option_text || opt.text || "") : String(opt))
                .filter(opt => opt && opt.trim() !== "");
        } else if (option_1 || option_2) {
            optionsList = [option_1, option_2, option_3, option_4]
                .filter(opt => opt && typeof opt === "string" && opt.trim() !== "");
        }

        if (optionsList.length > 0) {
            // BUG-14 warning: Deleting poll_options cascades to poll_votes.
            // All existing votes for this poll will be lost when options are replaced.
            // To preserve votes, avoid sending options in the update payload unless intentionally resetting.
            await connection.query(`DELETE FROM poll_options WHERE poll_id = ?`, [id]);
            const optionValues = optionsList.map(opt => [id, opt.trim()]);
            await connection.query(
                `INSERT INTO poll_options (poll_id, option_text) VALUES ?`,
                [optionValues]
            );
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const deletePoll = async (id) => {
    const [result] = await pool.query(`DELETE FROM polls WHERE id = ?`, [id]);
    if (result.affectedRows === 0) throw new Error("Poll not found");
    return true;
};

module.exports = { createPoll, getAllPolls, getPollById, updatePoll, deletePoll };
