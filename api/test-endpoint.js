module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(200).json({
        success: true,
        message: 'Test endpoint works!',
        method: req.method,
        timestamp: new Date().toISOString()
    });
};