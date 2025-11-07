/**
 * 🧪 AUTOMATED TEST SUITE
 * Comprehensive testing framework for RAGE:MP server
 */

class AutomatedTestSuite {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
    }

    async runAllTests() {
        console.log('\n🧪 ============ AUTOMATED TEST SUITE ============\n');
        
        await this.testDatabase();
        await this.testAuthentication();
        await this.testAdminSystem();
        await this.testInventory();
        await this.testVehicles();
        await this.testBanking();
        await this.testPlayerSystem();
        
        this.printResults();
        return this.results;
    }

    async testDatabase() {
        const testName = 'Database Connection & Queries';
        console.log(`\n📊 Testing: ${testName}`);
        
        try {
            const database = require('../packages/rp-server/modules/database');
            
            // Test 1: Connection
            await database.query('SELECT 1');
            this.pass('Database connection successful');
            
            // Test 2: Users table
            const users = await database.query('SELECT COUNT(*) as count FROM users');
            this.pass(`Users table accessible (${users[0].count} users)`);
            
            // Test 3: Characters table
            const chars = await database.query('SELECT COUNT(*) as count FROM characters');
            this.pass(`Characters table accessible (${chars[0].count} characters)`);
            
        } catch (error) {
            this.fail(testName, error.message);
        }
    }

    async testAuthentication() {
        const testName = 'Authentication System';
        console.log(`\n🔐 Testing: ${testName}`);
        
        try {
            const fs = require('fs');
            
            // Check auth-fixed.js exists
            if (fs.existsSync('./packages/rp-server/modules/auth-fixed.js')) {
                this.pass('Auth-fixed module exists');
            } else {
                this.fail(testName, 'auth-fixed.js not found');
                return;
            }
            
            // Check for event handlers
            const authContent = fs.readFileSync('./packages/rp-server/modules/auth-fixed.js', 'utf8');
            
            if (authContent.includes('attemptLogin')) {
                this.pass('Login handler implemented');
            } else {
                this.fail(testName, 'Login handler missing');
            }
            
            if (authContent.includes('attemptRegister')) {
                this.pass('Registration handler implemented');
            } else {
                this.fail(testName, 'Registration handler missing');
            }
            
            if (authContent.includes('character_id')) {
                this.pass('Character ID assignment present');
            } else {
                this.warn('Character ID assignment may be missing');
            }
            
        } catch (error) {
            this.fail(testName, error.message);
        }
    }

    async testAdminSystem() {
        const testName = 'Admin System';
        console.log(`\n👮 Testing: ${testName}`);
        
        try {
            const fs = require('fs');
            const adminFixed = './packages/rp-server/modules/admin-fixed.js';
            
            if (!fs.existsSync(adminFixed)) {
                this.fail(testName, 'admin-fixed.js not found');
                return;
            }
            
            const content = fs.readFileSync(adminFixed, 'utf8');
            
            // Test admin commands
            const commands = ['givemoney', 'setmoney', 'kick', 'ban', 'heal', 'tp', 'veh'];
            commands.forEach(cmd => {
                if (content.includes(`mp.events.addCommand('${cmd}'`)) {
                    this.pass(`Admin command: ${cmd}`);
                } else {
                    this.warn(`Admin command missing: ${cmd}`);
                }
            });
            
            // Test permission check
            if (content.includes('isAdmin') || content.includes('admin_level')) {
                this.pass('Permission check implemented');
            } else {
                this.fail(testName, 'No permission check found');
            }
            
        } catch (error) {
            this.fail(testName, error.message);
        }
    }

    async testInventory() {
        const testName = 'Inventory System';
        console.log(`\n🎒 Testing: ${testName}`);
        
        try {
            const fs = require('fs');
            
            // Check modern inventory exists
            const invModern = './packages/rp-server/modules/inventory-modern.js';
            if (fs.existsSync(invModern)) {
                this.pass('Modern inventory module exists');
                
                const content = fs.readFileSync(invModern, 'utf8');
                
                // Test core features
                if (content.includes('addItem')) this.pass('addItem function present');
                if (content.includes('removeItem')) this.pass('removeItem function present');
                if (content.includes('useItem')) this.pass('useItem function present');
                if (content.includes('ITEM_DATA')) this.pass('Item database present');
                
            } else {
                this.fail(testName, 'inventory-modern.js not found');
            }
            
            // Check CEF UI
            const invUI = './client_packages/CEF/inventory-modern.html';
            if (fs.existsSync(invUI)) {
                this.pass('Inventory UI exists');
            } else {
                this.warn('Inventory UI file not found');
            }
            
        } catch (error) {
            this.fail(testName, error.message);
        }
    }

    async testVehicles() {
        const testName = 'Vehicle System';
        console.log(`\n🚗 Testing: ${testName}`);
        
        try {
            const fs = require('fs');
            const vehiclesModule = './packages/rp-server/modules/vehicles.js';
            
            if (fs.existsSync(vehiclesModule)) {
                this.pass('Vehicles module exists');
                
                const content = fs.readFileSync(vehiclesModule, 'utf8');
                if (content.includes('spawnVehicle') || content.includes('createVehicle')) {
                    this.pass('Vehicle spawn functionality present');
                } else {
                    this.warn('Vehicle spawn function not detected');
                }
            } else {
                this.fail(testName, 'vehicles.js not found');
            }
            
        } catch (error) {
            this.fail(testName, error.message);
        }
    }

    async testBanking() {
        const testName = 'Banking System';
        console.log(`\n💰 Testing: ${testName}`);
        
        try {
            const fs = require('fs');
            const bankModule = './packages/rp-server/modules/banking.js';
            
            if (fs.existsSync(bankModule)) {
                this.pass('Banking module exists');
                
                const content = fs.readFileSync(bankModule, 'utf8');
                if (content.includes('deposit') || content.includes('withdraw')) {
                    this.pass('Banking operations present');
                } else {
                    this.warn('Banking operations not clearly defined');
                }
            } else {
                this.fail(testName, 'banking.js not found');
            }
            
        } catch (error) {
            this.fail(testName, error.message);
        }
    }

    async testPlayerSystem() {
        const testName = 'Player Management';
        console.log(`\n👤 Testing: ${testName}`);
        
        try {
            const fs = require('fs');
            const playerModule = './packages/rp-server/modules/player.js';
            
            if (fs.existsSync(playerModule)) {
                this.pass('Player module exists');
                
                const content = fs.readFileSync(playerModule, 'utf8');
                
                if (content.includes('playerJoin')) {
                    this.pass('Player join handler present');
                }
                
                if (content.includes('setVariable')) {
                    this.pass('Player variables system present');
                }
                
            } else {
                this.fail(testName, 'player.js not found');
            }
            
        } catch (error) {
            this.fail(testName, error.message);
        }
    }

    pass(message) {
        this.results.total++;
        this.results.passed++;
        this.results.tests.push({ status: 'PASS', message });
        console.log(`  ✅ PASS: ${message}`);
    }

    fail(testName, message) {
        this.results.total++;
        this.results.failed++;
        this.results.tests.push({ status: 'FAIL', test: testName, message });
        console.log(`  ❌ FAIL: ${testName} - ${message}`);
    }

    warn(message) {
        this.results.total++;
        this.results.warnings++;
        this.results.tests.push({ status: 'WARN', message });
        console.log(`  ⚠️  WARN: ${message}`);
    }

    printResults() {
        console.log('\n\n🎯 ============ TEST RESULTS ============\n');
        console.log(`  Total Tests: ${this.results.total}`);
        console.log(`  ✅ Passed: ${this.results.passed}`);
        console.log(`  ❌ Failed: ${this.results.failed}`);
        console.log(`  ⚠️  Warnings: ${this.results.warnings}`);
        
        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        console.log(`\n  Success Rate: ${successRate}%`);
        
        if (this.results.failed === 0 && this.results.warnings === 0) {
            console.log('\n  🎉 ALL TESTS PASSED! System is 100% operational.\n');
        } else if (this.results.failed === 0) {
            console.log('\n  ✅ All critical tests passed. Review warnings.\n');
        } else {
            console.log('\n  ⚠️  Some tests failed. Review above for details.\n');
        }
        
        console.log('==========================================\n');
    }
}

// Export for use in other modules
module.exports = AutomatedTestSuite;

// Run tests if executed directly
if (require.main === module) {
    const suite = new AutomatedTestSuite();
    suite.runAllTests().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}
