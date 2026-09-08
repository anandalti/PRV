const { getLaunchToken } = require('../../service/import-tool/getToken');

exports.generateLaunchToken = async (req, res) => {
    try {
        const details = req.body;
        const token = await getLaunchToken(details);
        res.status(200).json({ token: token });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate launch token', error: error.message });
    }
};