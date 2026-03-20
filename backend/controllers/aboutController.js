/**
 * @desc    Get Admin/Company and User Info for About Page
 * @route   GET /api/about/info
 * @access  Public
 */
const getAboutInfo = async (req, res) => {
    try {
        // Company Details (Static Map Information)
        const company = {
            name: 'Maghizam Homemade Delights',
            description: 'Bringing authentic Tamil traditional sweets, snacks, and pickles right to your doorstep. Prepared with love by experienced cooks using heritage recipes.',
            contact: {
                email: 'contact.tdhms@gmail.com',
                phone: 'Mythily - 9751188414, Kalarani - 82220557761',
                address: '1/215, Ganapathy nagar, vaiyappamalai post, tiruchengode taluk, namakkal Dt - 637410'
            },
            locations: [
                {
                    id: 'hq',
                    name: 'Maghizam Headquarters',
                    role: 'Main Office & Kitchen',
                    lat: 11.4116,
                    lng: 78.0287, // Approximation for Vaiyappamalai/Namakkal
                }
            ]
        };

        // User Details (Simulated - could grab from req.user if authenticated)
        const user = {
            name: 'Guest User',
            email: 'guest@example.com'
        };

        res.status(200).json({
            success: true,
            data: {
                company,
                user
            }
        });

    } catch (error) {
        console.error('About Info Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching about info' });
    }
};

module.exports = {
    getAboutInfo
};
