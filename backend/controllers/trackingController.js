const axios = require('axios');
const cheerio = require('cheerio');

// Dummy data for testing
const DUMMY_DATA = {
    'TEST1234': {
        status: 'In Transit',
        checkpoints: [
            { location: 'Mumbai, MH', message: 'Item Picked Up', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
            { location: 'Pune, MH', message: 'Arrived at Sorting Center', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { location: 'Bengaluru, KA', message: 'Out for Delivery', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
        ]
    },
    'DEMO999': {
        status: 'Delivered',
        checkpoints: [
            { location: 'Chennai, TN', message: 'Dispatched from Sender', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
            { location: 'Hyderabad, TS', message: 'In Transit', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { location: 'Delhi, DL', message: 'Delivered to Consignee', date: new Date(Date.now()).toISOString() }
        ]
    }
};

/**
 * @desc    Track order by ID
 * @route   POST /api/tracking/track
 * @access  Public
 */
const trackOrder = async (req, res) => {
    try {
        const { trackingId } = req.body;

        if (!trackingId) {
            return res.status(400).json({ success: false, message: 'Please provide a tracking ID' });
        }

        // 1. Check if it's a dummy ID
        if (DUMMY_DATA[trackingId]) {
            return res.status(200).json({
                success: true,
                data: DUMMY_DATA[trackingId]
            });
        }

        // 2. Attempt India Post scraping (best effort)
        // Note: India Post uses captchas and heavily dynamic pages, making simple scraping unreliable.
        // This is a placeholder scraping attempt as requested.
        try {
            // This is a mock URL/structure as direct India Post scraping requires complex session handling
            const response = await axios.get(`https://www.indiapost.gov.in/vas/Pages/IndiaPostHome.aspx?ConsignmentNumber=${trackingId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 5000 
            });

            const $ = cheerio.load(response.data);
            
            // IF we find an error message or captcha
            if (response.data.includes('Enter characters as displayed') || response.data.includes('Captcha')) {
                 throw new Error("Captcha required by tracking provider.");
            }

            // We would extract here. Due to lack of real HTML structure provided, 
            // returning a simulated graceful failure parsing message.
            throw new Error("Unable to parse realtime India Post data correctly or tracking ID not found.");

        } catch (scrapingError) {
            console.error('Scraping failed:', scrapingError.message);
            // Graceful fallback for unknown numbers
            return res.status(404).json({
                success: false,
                message: `Tracking details not found for ID: ${trackingId}. It may not be updated yet. Please try dummy IDs like TEST1234 or DEMO999 for demonstration.`
            });
        }

    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during tracking lookup' });
    }
};

module.exports = {
    trackOrder
};
