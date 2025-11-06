// Helper Functions
const bcrypt = require('bcrypt');

const helpers = {
    // Hash password
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    },

    // Verify password
    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    },

    // Generate random string
    generateRandomString(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // Generate phone number
    generatePhoneNumber() {
        return Math.floor(1000000 + Math.random() * 9000000).toString();
    },

    // Generate account number
    generateAccountNumber() {
        return 'ACC' + Math.floor(100000000 + Math.random() * 900000000).toString();
    },

    // Format currency
    formatCurrency(amount) {
        return '$' + amount.toLocaleString();
    },

    // Distance between two points
    getDistance(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
    },

    // Validate email
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Validate username
    isValidUsername(username) {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        return regex.test(username);
    },

    // Send notification to player
    sendNotification(player, message, type = 'info') {
        if (player && mp.players.exists(player)) {
            player.call('client:showNotification', [message, type]);
        }
    },

    // Send error message
    sendError(player, message) {
        this.sendNotification(player, message, 'error');
    },

    // Send success message
    sendSuccess(player, message) {
        this.sendNotification(player, message, 'success');
    }
};

module.exports = helpers;
