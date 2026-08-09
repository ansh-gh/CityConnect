const pollService = require("../../services/admin/poll.service");

// BUG-05 fix: all handlers now use next(error) to route through the global error handler

const createPoll = async (req, res, next) => {
    try {
        const id = await pollService.createPoll(req.body);
        res.status(201).json({ success: true, message: "Poll created successfully", data: { poll_id: id } });
    } catch (error) {
        next(error);
    }
};

const getAllPolls = async (req, res, next) => {
    try {
        const polls = await pollService.getAllPolls();
        res.json({ success: true, data: polls });
    } catch (error) {
        next(error);
    }
};

const getPollById = async (req, res, next) => {
    try {
        const poll = await pollService.getPollById(req.params.id);
        res.json({ success: true, data: poll });
    } catch (error) {
        next(error);
    }
};

const updatePoll = async (req, res, next) => {
    try {
        await pollService.updatePoll(req.params.id, req.body);
        res.json({ success: true, message: "Poll updated successfully" });
    } catch (error) {
        next(error);
    }
};

const deletePoll = async (req, res, next) => {
    try {
        await pollService.deletePoll(req.params.id);
        res.json({ success: true, message: "Poll deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = { createPoll, getAllPolls, getPollById, updatePoll, deletePoll };
