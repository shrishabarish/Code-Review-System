exports.createSubmission = async (req, res) => {
    console.log("USER FROM JWT:", req.user);

    const { title, description, language } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title required" });
    }

    return res.status(201).json({
        message: "Submission endpoint protected and working",
        tokenUsed: req.user.tokenId
    });
};