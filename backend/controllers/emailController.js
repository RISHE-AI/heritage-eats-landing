const { sendBulkOrderEmail } = require('../utils/emailService');

const sendBulkOrder = async (req, res, next) => {
    try {
        const bulkData = req.body;
        
        if (!bulkData.name || !bulkData.phone || !bulkData.items || bulkData.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid bulk order data. Name, Phone, and Items are required.' });
        }

        // Trigger NodeMailer transporter logic
        await sendBulkOrderEmail(bulkData);

        res.status(200).json({
            success: true,
            message: 'Bulk order request successfully sent to admin.'
        });
    } catch (error) {
        console.error('Error in sendBulkOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk order email. Please check server logs or use WhatsApp as a fallback.'
        });
    }
};

module.exports = {
    sendBulkOrder
};
