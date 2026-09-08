const { listTags, updateTagNumbersByTagId } = require('../../service/import-tool/listTags');

exports.listTags = async (req, res) => {
    try {
        const data = await listTags();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error listing tags:', error);
        res.status(500).json({ success: false, message: 'Failed to list tags' });
    }
};

exports.updateTagNumbers = async (req, res) => {
    const updates = req.body;
    if (!Array.isArray(updates) || !updates.length || !updates.every(u => u.TagId && u.TagNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Request body must be a non-empty array with each item containing TagId and TagNumber'
        });
    }
    try {
        await updateTagNumbersByTagId(updates);
        return res.json({
            success: true,
            message: 'Tag numbers updated successfully',
            data: updates.map(u => ({ TagId: u.TagId, TagNumber: u.TagNumber }))
        });
    } catch (error) {
        console.error('Error updating tag numbers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update tag numbers'
        });
    }
};
