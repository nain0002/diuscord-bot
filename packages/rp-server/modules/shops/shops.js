// Shop System
const db = require('../../database/db');
const helpers = require('../../utils/helpers');

class ShopSystem {
    constructor() {
        this.shops = [];
        this.shopBlips = [];
        this.shopMarkers = [];
    }

    // Load all shops
    async loadShops() {
        try {
            this.shops = await db.query('SELECT * FROM shops');
            console.log(`[Shops] Loaded ${this.shops.length} shops`);

            // Create blips and markers for each shop
            this.shops.forEach(shop => {
                // Create blip
                const blip = mp.blips.new(shop.blip_sprite, new mp.Vector3(shop.position_x, shop.position_y, shop.position_z), {
                    name: shop.name,
                    color: shop.blip_color,
                    shortRange: true,
                    dimension: shop.dimension
                });
                this.shopBlips.push(blip);

                // Create marker
                const marker = mp.markers.new(1, new mp.Vector3(shop.position_x, shop.position_y, shop.position_z - 1), 1.5, {
                    color: [255, 255, 0, 100],
                    dimension: shop.dimension,
                    visible: true
                });
                this.shopMarkers.push(marker);

                // Create colshape for interaction
                const colshape = mp.colshapes.newSphere(shop.position_x, shop.position_y, shop.position_z, 2.0, shop.dimension);
                colshape.shopId = shop.id;
                colshape.shopData = shop;
            });

        } catch (error) {
            console.error('[Shops] Error loading shops:', error);
        }
    }

    // Get shop items
    async getShopItems(shopId) {
        try {
            const items = await db.query(
                'SELECT * FROM shop_items WHERE shop_id = ?',
                [shopId]
            );
            return items;
        } catch (error) {
            console.error('[Shops] Error getting shop items:', error);
            return [];
        }
    }

    // Purchase item
    async purchaseItem(player, shopId, itemId, quantity = 1) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded.' };
        }

        if (quantity <= 0) {
            return { success: false, message: 'Invalid quantity.' };
        }

        try {
            // Get item data
            const items = await db.query(
                'SELECT * FROM shop_items WHERE id = ? AND shop_id = ?',
                [itemId, shopId]
            );

            if (items.length === 0) {
                return { success: false, message: 'Item not found.' };
            }

            const item = items[0];
            const totalPrice = item.price * quantity;

            // Check if player has enough money
            if (player.characterData.money < totalPrice) {
                return { success: false, message: 'Insufficient funds.' };
            }

            // Check stock
            if (item.stock !== -1 && item.stock < quantity) {
                return { success: false, message: 'Insufficient stock.' };
            }

            // Update player money
            await db.query(
                'UPDATE characters SET money = money - ? WHERE id = ?',
                [totalPrice, player.characterId]
            );

            // Update stock if not unlimited
            if (item.stock !== -1) {
                await db.query(
                    'UPDATE shop_items SET stock = stock - ? WHERE id = ?',
                    [quantity, itemId]
                );
            }

            // Add item to inventory
            await this.addToInventory(player.characterId, item, quantity);

            // Update player data
            player.characterData.money -= totalPrice;

            console.log(`[Shops] ${player.name} purchased ${quantity}x ${item.item_name} for ${helpers.formatCurrency(totalPrice)}`);

            return { 
                success: true, 
                message: `Purchased ${quantity}x ${item.item_name} for ${helpers.formatCurrency(totalPrice)}`
            };

        } catch (error) {
            console.error('[Shops] Purchase error:', error);
            return { success: false, message: 'Purchase failed.' };
        }
    }

    // Add item to inventory
    async addToInventory(characterId, item, quantity) {
        try {
            // Check if item already exists in inventory
            const existing = await db.query(
                'SELECT * FROM inventory WHERE character_id = ? AND item_name = ?',
                [characterId, item.item_name]
            );

            if (existing.length > 0) {
                // Update quantity
                await db.query(
                    'UPDATE inventory SET quantity = quantity + ? WHERE id = ?',
                    [quantity, existing[0].id]
                );
            } else {
                // Find empty slot
                const slots = await db.query(
                    'SELECT slot FROM inventory WHERE character_id = ? ORDER BY slot',
                    [characterId]
                );

                let nextSlot = 0;
                for (let i = 0; i < slots.length; i++) {
                    if (slots[i].slot !== i) {
                        nextSlot = i;
                        break;
                    }
                    nextSlot = i + 1;
                }

                // Add new item
                await db.query(
                    'INSERT INTO inventory (character_id, item_name, item_type, quantity, slot) VALUES (?, ?, ?, ?, ?)',
                    [characterId, item.item_name, item.item_type, quantity, nextSlot]
                );
            }

        } catch (error) {
            console.error('[Shops] Error adding to inventory:', error);
        }
    }

    // Get player inventory
    async getInventory(characterId) {
        try {
            const inventory = await db.query(
                'SELECT * FROM inventory WHERE character_id = ? ORDER BY slot',
                [characterId]
            );
            return inventory;
        } catch (error) {
            console.error('[Shops] Error getting inventory:', error);
            return [];
        }
    }
}

module.exports = new ShopSystem();
