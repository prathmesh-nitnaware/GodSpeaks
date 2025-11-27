const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer'); // Or your User model

// @desc    Get Admin Dashboard Stats (Charts & Cards)
// @route   GET /api/analytics
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. CARD STATS
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        // Calculate Total Revenue (Only paid orders)
        const revenueAgg = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 2. SALES CHART DATA (Last 6 Months)
        // Groups orders by Month and Sums the Total Price
        const salesDataAgg = await Order.aggregate([
            { 
                $match: { 
                    isPaid: true,
                    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } 
                } 
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    sales: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Format for Recharts: [{ name: 'Jan', sales: 1000 }, ...]
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const salesData = salesDataAgg.map(item => ({
            name: monthNames[item._id - 1], // MongoDB month is 1-indexed
            sales: item.sales
        }));

        // 3. CATEGORY DATA (Product Distribution)
        const categoryAgg = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format: [{ name: 'Faith', count: 10 }, ...]
        const categoryData = categoryAgg.map(item => ({
            name: item._id,
            count: item.count
        }));

        res.json({
            totalOrders,
            totalProducts,
            totalRevenue,
            salesData,
            categoryData
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: 'Server Error fetching analytics' });
    }
};

module.exports = { getDashboardStats };