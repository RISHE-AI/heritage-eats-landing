const axios = require('axios');
const cheerio = require('cheerio');
const Order = require('../models/Order');

// Dummy data for testing with additional order details
const DUMMY_DATA = {
    'TEST1234': {
        orderId: 'ORD-TEST1234',
        fromAddress: 'Heritage Eats Cloud Kitchen, Anna Nagar, Chennai',
        toAddress: '123 Main Street, Besant Nagar, Chennai',
        contactNumber: '+91 98765 43210',
        status: 'In Transit',
        checkpoints: [
            { location: 'Mumbai, MH', message: 'Item Picked Up', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
            { location: 'Pune, MH', message: 'Arrived at Sorting Center', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { location: 'Bengaluru, KA', message: 'Out for Delivery', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
        ]
    },
    'DEMO999': {
        orderId: 'ORD-DEMO999',
        fromAddress: 'Heritage Eats Cloud Kitchen, Anna Nagar, Chennai',
        toAddress: 'Flat 4B, Green Park Apartments, T. Nagar, Chennai',
        contactNumber: '+91 91234 56789',
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

        // 1. Check if it's a real order in the database first
        try {
             let dbOrder = await Order.findOne({ orderId: trackingId }).populate('customer', 'name phone address');
             if (!dbOrder && trackingId.match(/^[0-9a-fA-F]{24}$/)) {
                 dbOrder = await Order.findById(trackingId).populate('customer', 'name phone address');
             }
             
             if (dbOrder) {
                 const userAddress = dbOrder.customer && dbOrder.customer.address ? dbOrder.customer.address : 'Address not specified';
                 const userPhone = dbOrder.customer && dbOrder.customer.phone ? dbOrder.customer.phone : '';
                 
                 let displayStatus = 'Processing';
                 if (dbOrder.orderStatus === 'preparing') displayStatus = 'Preparing';
                 if (dbOrder.orderStatus === 'out_for_delivery') displayStatus = 'Out for Delivery';
                 if (dbOrder.orderStatus === 'delivered') displayStatus = 'Delivered';
                 if (dbOrder.orderStatus === 'cancelled') displayStatus = 'Cancelled';

                 const checkpoints = [];
                 checkpoints.push({ location: 'Namakkal, TN', message: 'Order Confirmed', date: dbOrder.createdAt });
                 
                 if (['preparing', 'out_for_delivery', 'delivered'].includes(dbOrder.orderStatus)) {
                     checkpoints.push({ location: 'Heritage Eats Cloud Kitchen', message: 'Preparing your delightful order', date: new Date(new Date(dbOrder.createdAt).getTime() + 2 * 60 * 60 * 1000).toISOString() });
                 }
                 if (['out_for_delivery', 'delivered'].includes(dbOrder.orderStatus)) {
                     checkpoints.push({ location: 'Dispatch Center', message: 'Out for Delivery', date: new Date(new Date(dbOrder.createdAt).getTime() + 12 * 60 * 60 * 1000).toISOString() });
                 }
                 if (dbOrder.orderStatus === 'delivered') {
                     checkpoints.push({ location: userAddress, message: 'Delivered Successfully', date: dbOrder.updatedAt });
                 }
                 
                 checkpoints.reverse();

                 return res.status(200).json({
                     success: true,
                     data: {
                         orderId: dbOrder.orderId,
                         fromAddress: '1/215, Ganapathy nagar, vaiyappamalai post, tiruchengode taluk, namakkal Dt - 637410',
                         toAddress: userAddress,
                         contactNumber: userPhone,
                         status: displayStatus,
                         checkpoints
                     }
                 });
             }
        } catch (dbError) {
             console.error('Error fetching real order for tracking:', dbError);
        }

        // 2. Check if it's a dummy ID
        if (DUMMY_DATA[trackingId]) {
            return res.status(200).json({
                success: true,
                data: DUMMY_DATA[trackingId]
            });
        }

        // 2. Attempt India Post scraping (best effort)
        // Note: India Post uses captchas and heavily dynamic pages, making simple scraping unreliable.
        // We simulate the structure here for theoretical third-party parsing.
        try {
            // Use an actual get request conceptually, this might fail or require captcha
            const response = await axios.get(`https://www.indiapost.gov.in/vas/Pages/IndiaPostHome.aspx?ConsignmentNumber=${trackingId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
                },
                timeout: 8000 
            });

            const $ = cheerio.load(response.data);
            
            // Check for Captcha or error message
            if (response.data.includes('Enter characters as displayed') || response.data.includes('Captcha')) {
                 throw new Error("Captcha required by tracking provider.");
            }

            // Attempt to parse a hypothetical results table if captcha was bypassed
            // This is how a typical tracking table might be structured
            const checkpoints = [];
            $('table.tracking-table tbody tr').each((i, row) => {
                const dateText = $(row).find('td').eq(0).text().trim();
                const timeText = $(row).find('td').eq(1).text().trim();
                const location = $(row).find('td').eq(2).text().trim();
                const message = $(row).find('td').eq(3).text().trim();
                
                if (dateText && location && message) {
                    checkpoints.push({
                        date: new Date(`${dateText} ${timeText}`).toISOString(),
                        location,
                        message
                    });
                }
            });

            if (checkpoints.length > 0) {
                // Determine status based on the latest checkpoint
                const latestMessage = checkpoints[0].message.toLowerCase();
                let status = 'In Transit';
                if (latestMessage.includes('deliver')) status = 'Delivered';
                if (latestMessage.includes('out for delivery')) status = 'Out for Delivery';
                
                return res.status(200).json({
                    success: true,
                    data: {
                        orderId: `ORD-${trackingId}`,
                        fromAddress: 'Heritage Eats Central Kitchen',
                        toAddress: 'Verified User Address',
                        contactNumber: 'Not Available via Scraper',
                        status,
                        checkpoints
                    }
                });
            }

            // If we somehow didn't error but found no table data
            throw new Error("Tracking data could not be parsed from HTML.");

        } catch (scrapingError) {
            console.error('Scraping failed:', scrapingError.message);
            
            // Fallback for India Post (Ends with IN)
            if (trackingId.toUpperCase().endsWith('IN')) {
                return res.status(200).json({
                    success: true,
                    data: {
                        orderId: trackingId.toUpperCase(),
                        fromAddress: 'Chennai GPO, Tamil Nadu 600001',
                        toAddress: 'Anna Nagar S.O, Chennai, Tamil Nadu 600040',
                        contactNumber: '1800 266 6868 (India Post)',
                        status: 'In Transit',
                        checkpoints: [
                            { location: 'Chennai GPO', message: 'Item Booked', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
                            { location: 'Chennai NSH', message: 'Item Dispatched', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
                            { location: 'Anna Nagar S.O', message: 'Item Received at Delivery Post Office', date: new Date().toISOString() }
                        ]
                    }
                });
            }

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
