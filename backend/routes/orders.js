import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// --- CREATE A NEW ORDER (POST) ---
// This route is likely working correctly, but we'll keep it here for completeness.
router.post('/', verifyToken, (req, res) => {
    const firebaseUid = req.user.uid;
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    pool.query('SELECT id FROM users WHERE firebase_uid = ?', [firebaseUid], (err, userRows) => {
        if (err || userRows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const userId = userRows[0].id;
        const productIds = items.map(item => item.product_id);

        pool.query('SELECT id, price FROM products WHERE id IN (?)', [productIds], (err, products) => {
            if (err) return res.status(500).json({ error: 'Error fetching products' });

            const priceMap = products.reduce((map, p) => ({ ...map, [p.id]: p.price }), {});
            const totalAmount = items.reduce((sum, item) => sum + (priceMap[item.product_id] || 0) * item.quantity, 0);

            pool.query('INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)', [userId, totalAmount, 'Pending'], (err, orderResult) => {
                if (err) return res.status(500).json({ error: 'Could not create order' });
                
                const orderId = orderResult.insertId;
                const orderItemsValues = items.map(item => [orderId, item.product_id, item.quantity, priceMap[item.product_id]]);

                pool.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?', [orderItemsValues], (err, itemsResult) => {
                    if (err) return res.status(500).json({ error: 'Could not save order items' });
                    res.status(201).json({ orderId });
                });
            });
        });
    });
});

// --- GET ALL ORDERS FOR THE LOGGED-IN USER (GET) ---
// This is the new, simplified, and more reliable implementation.
router.get('/', verifyToken, (req, res) => {
    const firebaseUid = req.user.uid;

    // First, get the user's main orders
    const ordersQuery = `
        SELECT o.id, o.total_amount, o.status, o.created_at 
        FROM orders AS o
        JOIN users AS u ON o.user_id = u.id
        WHERE u.firebase_uid = ?
        ORDER BY o.created_at DESC;
    `;

    pool.query(ordersQuery, [firebaseUid], (error, orders) => {
        if (error) {
            console.error("Error fetching main orders:", error);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        // If the user has no orders, return an empty array immediately.
        if (orders.length === 0) {
            return res.json([]);
        }

        const orderIds = orders.map(o => o.id);

        // Second, get all items for those orders in a single query
        const itemsQuery = `
            SELECT oi.order_id, oi.quantity, oi.price, p.name 
            FROM order_items AS oi
            JOIN products AS p ON oi.product_id = p.id
            WHERE oi.order_id IN (?);
        `;

        pool.query(itemsQuery, [orderIds], (error, items) => {
            if (error) {
                console.error("Error fetching order items:", error);
                return res.status(500).json({ error: 'Failed to fetch order items' });
            }

            // Map the items to their respective orders
            const ordersWithItems = orders.map(order => {
                return {
                    ...order,
                    items: items.filter(item => item.order_id === order.id)
                };
            });

            res.json(ordersWithItems);
        });
    });
});

export default router;
