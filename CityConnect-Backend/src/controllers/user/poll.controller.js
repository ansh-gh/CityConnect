const pollService = require("../../services/user/poll.service");

exports.getAllPolls = async (req, res, next) => {
    try {
        const polls = await pollService.getAllPolls();
        res.status(200).json({ success: true, polls });
    } catch (error) {
        next(error);
    }
};

exports.getPollById = async (req, res, next) => {
    try {
        const poll = await pollService.getPollById(req.params.id);
        res.status(200).json({ success: true, poll });
    } catch (error) {
        next(error);
    }
};

exports.votePoll = async (req, res, next) => {
    try {
        const result = await pollService.votePoll(req.params.id, req.user.id, req.body.option_id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getPollResults = async (req, res, next) => {
    try {
        const results = await pollService.getPollResults(req.params.id);
        res.status(200).json({ success: true, ...results });
    } catch (error) {
        next(error);
    }
};
