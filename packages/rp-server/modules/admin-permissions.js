// Admin Permissions System
const db = require('./database');

// Cache for admin permissions
const permissionsCache = new Map();

class AdminPermissions {
    /**
     * Load admin permissions from database into cache
     */
    static async loadPermissions() {
        try {
            const permissions = await db.query('SELECT * FROM admin_permissions');
            
            permissionsCache.clear();
            permissions.forEach(perm => {
                permissionsCache.set(perm.admin_level, {
                    level: perm.admin_level,
                    name: perm.level_name,
                    canKick: perm.can_kick,
                    canBan: perm.can_ban,
                    canMute: perm.can_mute,
                    canFreeze: perm.can_freeze,
                    canTeleport: perm.can_teleport,
                    canSpawnVehicle: perm.can_spawn_vehicle,
                    canSpawnItem: perm.can_spawn_item,
                    canGiveMoney: perm.can_give_money,
                    canManageWhitelist: perm.can_manage_whitelist,
                    canViewLogs: perm.can_view_logs,
                    canManageAdmins: perm.can_manage_admins,
                    canEditDatabase: perm.can_edit_database,
                    canRestartServer: perm.can_restart_server
                });
            });
            
            console.log(`[Admin Permissions] Loaded ${permissionsCache.size} permission levels`);
            return true;
        } catch (error) {
            console.error('[Admin Permissions] Error loading permissions:', error);
            return false;
        }
    }

    /**
     * Get player admin level
     */
    static getPlayerAdminLevel(player) {
        if (!player) return 0;
        return player.getVariable('admin_level') || 0;
    }

    /**
     * Check if player has permission
     */
    static hasPermission(player, permission) {
        const adminLevel = this.getPlayerAdminLevel(player);
        
        // Owner (level 5) has all permissions
        if (adminLevel >= 5) return true;
        
        const perms = permissionsCache.get(adminLevel);
        if (!perms) return false;
        
        switch(permission) {
            case 'kick': return perms.canKick;
            case 'ban': return perms.canBan;
            case 'mute': return perms.canMute;
            case 'freeze': return perms.canFreeze;
            case 'teleport': return perms.canTeleport;
            case 'spawn_vehicle': return perms.canSpawnVehicle;
            case 'spawn_item': return perms.canSpawnItem;
            case 'give_money': return perms.canGiveMoney;
            case 'manage_whitelist': return perms.canManageWhitelist;
            case 'view_logs': return perms.canViewLogs;
            case 'manage_admins': return perms.canManageAdmins;
            case 'edit_database': return perms.canEditDatabase;
            case 'restart_server': return perms.canRestartServer;
            default: return false;
        }
    }

    /**
     * Check if player is admin (level 1+)
     */
    static isAdmin(player) {
        return this.getPlayerAdminLevel(player) >= 1;
    }

    /**
     * Check if player is moderator or higher (level 2+)
     */
    static isModerator(player) {
        return this.getPlayerAdminLevel(player) >= 2;
    }

    /**
     * Check if player is admin or higher (level 3+)
     */
    static isFullAdmin(player) {
        return this.getPlayerAdminLevel(player) >= 3;
    }

    /**
     * Check if player is head admin or higher (level 4+)
     */
    static isHeadAdmin(player) {
        return this.getPlayerAdminLevel(player) >= 4;
    }

    /**
     * Check if player is owner (level 5)
     */
    static isOwner(player) {
        return this.getPlayerAdminLevel(player) >= 5;
    }

    /**
     * Get permission level name
     */
    static getLevelName(level) {
        const perms = permissionsCache.get(level);
        return perms ? perms.name : 'Unknown';
    }

    /**
     * Get all permissions for a level
     */
    static getPermissions(level) {
        return permissionsCache.get(level) || null;
    }

    /**
     * Set player admin level
     */
    static async setAdminLevel(player, level) {
        try {
            if (level < 0 || level > 5) {
                return { success: false, error: 'Invalid admin level (0-5)' };
            }

            const userId = player.getVariable('userId');
            if (!userId) {
                return { success: false, error: 'User ID not found' };
            }

            await db.execute(
                'UPDATE users SET admin_level = ?, is_admin = ? WHERE id = ?',
                [level, level > 0 ? 1 : 0, userId]
            );

            player.setVariable('admin_level', level);
            player.setVariable('is_admin', level > 0);

            const levelName = this.getLevelName(level);
            return { success: true, level, levelName };
        } catch (error) {
            console.error('[Admin Permissions] Error setting admin level:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send permission denied message
     */
    static sendPermissionDenied(player, permission) {
        const level = this.getPlayerAdminLevel(player);
        const levelName = this.getLevelName(level);
        player.outputChatBox(`!{#FF0000}[PERMISSION DENIED] You need higher admin level to ${permission}.`);
        player.outputChatBox(`!{#FFA500}Your level: ${levelName} (${level})`);
    }

    /**
     * Get permission requirements for command
     */
    static getRequiredLevel(permission) {
        for (const [level, perms] of permissionsCache.entries()) {
            if (this._checkPermission(perms, permission)) {
                return { level, name: perms.name };
            }
        }
        return { level: 5, name: 'Owner' };
    }

    static _checkPermission(perms, permission) {
        switch(permission) {
            case 'kick': return perms.canKick;
            case 'ban': return perms.canBan;
            case 'mute': return perms.canMute;
            case 'freeze': return perms.canFreeze;
            case 'teleport': return perms.canTeleport;
            case 'spawn_vehicle': return perms.canSpawnVehicle;
            case 'spawn_item': return perms.canSpawnItem;
            case 'give_money': return perms.canGiveMoney;
            case 'manage_whitelist': return perms.canManageWhitelist;
            case 'view_logs': return perms.canViewLogs;
            case 'manage_admins': return perms.canManageAdmins;
            case 'edit_database': return perms.canEditDatabase;
            case 'restart_server': return perms.canRestartServer;
            default: return false;
        }
    }
}

// Export (permissions will be loaded after database is ready)
module.exports = AdminPermissions;
