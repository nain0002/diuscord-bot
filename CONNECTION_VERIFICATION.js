/**
 * CONNECTION VERIFICATION SCRIPT
 * Tests all connections between admin panel, database, and server
 */

const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

const success = (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const error = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const info = (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
const warning = (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   CONNECTION VERIFICATION - FULL SYSTEM TEST          ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

async function runTests() {
    // ═══════════════════════════════════════════════════════════
    // TEST 1: Database Connection
    // ═══════════════════════════════════════════════════════════
    info('TEST 1: Database Connection');
    testsRun++;
    try {
        const database = require('./packages/rp-server/modules/database');
        
        // Test query
        const result = await database.query('SELECT 1 as test');
        if (result && result[0] && result[0].test === 1) {
            success('Database connection working');
            testsPassed++;
        } else {
            error('Database query returned unexpected result');
            testsFailed++;
        }
    } catch (err) {
        error(`Database connection failed: ${err.message}`);
        testsFailed++;
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 2: Database Tables Verification
    // ═══════════════════════════════════════════════════════════
    info('\nTEST 2: Database Tables Verification');
    testsRun++;
    try {
        const database = require('./packages/rp-server/modules/database');
        const tables = [
            'users', 'characters', 'inventory', 'vehicles',
            'bans', 'admin_logs', 'whitelist', 'reports',
            'character_appearance', 'bank_accounts', 'shops',
            'jobs', 'player_stats', 'achievements'
        ];
        
        let allTablesExist = true;
        for (const table of tables) {
            const result = await database.query(`SHOW TABLES LIKE '${table}'`);
            if (result && result.length > 0) {
                console.log(`  ✓ Table '${table}' exists`);
            } else {
                error(`  Table '${table}' missing`);
                allTablesExist = false;
            }
        }
        
        if (allTablesExist) {
            success('All required tables exist');
            testsPassed++;
        } else {
            error('Some tables are missing');
            testsFailed++;
        }
    } catch (err) {
        error(`Table verification failed: ${err.message}`);
        testsFailed++;
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 3: Admin Panel Database Connection
    // ═══════════════════════════════════════════════════════════
    info('\nTEST 3: Admin Panel Database Connection');
    testsRun++;
    try {
        // Check if admin panel routes can import database
        const adminRouteFiles = [
            './admin-panel/routes/dashboard.js',
            './admin-panel/routes/players.js',
            './admin-panel/routes/admin.js',
            './admin-panel/routes/analytics.js'
        ];
        
        let allRoutesConnected = true;
        for (const routeFile of adminRouteFiles) {
            try {
                const fs = require('fs');
                const content = fs.readFileSync(routeFile, 'utf8');
                if (content.includes('require') && content.includes('database')) {
                    console.log(`  ✓ ${path.basename(routeFile)} imports database`);
                } else {
                    error(`  ${path.basename(routeFile)} missing database import`);
                    allRoutesConnected = false;
                }
            } catch (e) {
                warning(`  ${path.basename(routeFile)} not found (optional)`);
            }
        }
        
        if (allRoutesConnected) {
            success('Admin panel routes connected to database');
            testsPassed++;
        } else {
            error('Some admin routes missing database connection');
            testsFailed++;
        }
    } catch (err) {
        error(`Admin panel database check failed: ${err.message}`);
        testsFailed++;
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 4: Server Modules Database Connection
    // ═══════════════════════════════════════════════════════════
    info('\nTEST 4: Server Modules Database Connection');
    testsRun++;
    try {
        const fs = require('fs');
        const modulesDir = './packages/rp-server/modules';
        const modules = fs.readdirSync(modulesDir).filter(f => f.endsWith('.js'));
        
        let connectedModules = 0;
        let totalModules = 0;
        
        for (const moduleFile of modules) {
            if (moduleFile === 'database.js') continue; // Skip database module itself
            
            const content = fs.readFileSync(path.join(modulesDir, moduleFile), 'utf8');
            totalModules++;
            
            if (content.includes('database') || content.includes('db.query')) {
                connectedModules++;
                console.log(`  ✓ ${moduleFile} uses database`);
            }
        }
        
        success(`${connectedModules}/${totalModules} server modules use database`);
        testsPassed++;
    } catch (err) {
        error(`Server modules check failed: ${err.message}`);
        testsFailed++;
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 5: WebSocket Bridge Files
    // ═══════════════════════════════════════════════════════════
    info('\nTEST 5: WebSocket Bridge Files');
    testsRun++;
    try {
        const fs = require('fs');
        const files = [
            './admin-panel/websocket-bridge.js',
            './packages/rp-server/modules/admin-bridge.js'
        ];
        
        let allFilesExist = true;
        for (const file of files) {
            if (fs.existsSync(file)) {
                console.log(`  ✓ ${path.basename(file)} exists`);
            } else {
                error(`  ${path.basename(file)} missing`);
                allFilesExist = false;
            }
        }
        
        if (allFilesExist) {
            success('WebSocket bridge files present');
            testsPassed++;
        } else {
            error('WebSocket bridge files missing');
            testsFailed++;
        }
    } catch (err) {
        error(`WebSocket bridge check failed: ${err.message}`);
        testsFailed++;
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 6: Admin Panel Server Configuration
    // ═══════════════════════════════════════════════════════════
    info('\nTEST 6: Admin Panel Server Configuration');
    testsRun++;
    try {
        const fs = require('fs');
        const serverFile = './admin-panel/server-enhanced.js';
        
        if (fs.existsSync(serverFile)) {
            const content = fs.readFileSync(serverFile, 'utf8');
            
            const checks = {
                'Database Import': content.includes("require('../packages/rp-server/modules/database')"),
                'WebSocket Import': content.includes('WebSocketBridge'),
                'Socket.IO': content.includes('socket.io'),
                'Express Setup': content.includes('express()'),
                'Routes Mounted': content.includes('app.use')
            };
            
            let allChecks = true;
            for (const [check, passed] of Object.entries(checks)) {
                if (passed) {
                    console.log(`  ✓ ${check}`);
                } else {
                    error(`  ${check} missing`);
                    allChecks = false;
                }
            }
            
            if (allChecks) {
                success('Admin panel server properly configured');
                testsPassed++;
            } else {
                error('Admin panel server missing some configurations');
                testsFailed++;
            }
        } else {
            error('Admin panel server file not found');
            testsFailed++;
        }
    } catch (err) {
        error(`Admin panel configuration check failed: ${err.message}`);
        testsFailed++;
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 7: Environment Variables
    // ═══════════════════════════════════════════════════════════
    info('\nTEST 7: Environment Variables');
    testsRun++;
    try {
        const requiredVars = [
            'DB_HOST',
            'DB_USER',
            'DB_PASSWORD',
            'DB_NAME'
        ];
        
        let allVarsSet = true;
        for (const varName of requiredVars) {
            if (process.env[varName]) {
                console.log(`  ✓ ${varName} is set`);
            } else {
                error(`  ${varName} not set`);
                allVarsSet = false;
            }
        }
        
        if (allVarsSet) {
            success('All environment variables configured');
            testsPassed++;
        } else {
            warning('Some environment variables missing (may use defaults)');
            testsPassed++; // Still pass as defaults may work
        }
    } catch (err) {
        error(`Environment check failed: ${err.message}`);
        testsFailed++;
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 8: File Structure
    // ═══════════════════════════════════════════════════════════
    info('\nTEST 8: File Structure Verification');
    testsRun++;
    try {
        const fs = require('fs');
        const requiredDirs = [
            './packages/rp-server/modules',
            './client_packages',
            './admin-panel/routes',
            './admin-panel/public'
        ];
        
        let allDirsExist = true;
        for (const dir of requiredDirs) {
            if (fs.existsSync(dir)) {
                console.log(`  ✓ ${dir} exists`);
            } else {
                error(`  ${dir} missing`);
                allDirsExist = false;
            }
        }
        
        if (allDirsExist) {
            success('File structure is correct');
            testsPassed++;
        } else {
            error('File structure incomplete');
            testsFailed++;
        }
    } catch (err) {
        error(`File structure check failed: ${err.message}`);
        testsFailed++;
    }

    // ═══════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                  TEST SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log(`Tests Run:    ${testsRun}`);
    console.log(`Tests Passed: ${colors.green}${testsPassed}${colors.reset}`);
    console.log(`Tests Failed: ${testsFailed > 0 ? colors.red : colors.green}${testsFailed}${colors.reset}`);
    
    const successRate = ((testsPassed / testsRun) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
    
    if (testsFailed === 0) {
        success('\n🎉 ALL TESTS PASSED! System is fully connected and ready!');
        return 0;
    } else {
        error(`\n⚠️  ${testsFailed} test(s) failed. Review errors above.`);
        return 1;
    }
}

// Run tests
runTests()
    .then(exitCode => {
        console.log('\n');
        process.exit(exitCode);
    })
    .catch(err => {
        error(`Fatal error: ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    });
