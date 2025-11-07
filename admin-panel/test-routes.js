/**
 * Admin Panel Route Validation Script
 * Tests all API endpoints to ensure they work correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// Color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

let testResults = {
    passed: 0,
    failed: 0,
    warnings: 0
};

// Test functions
async function testEndpoint(method, endpoint, description, shouldAuth = true) {
    try {
        const config = {
            method,
            url: `${API_URL}${endpoint}`,
            validateStatus: () => true // Don't throw on any status
        };

        const response = await axios(config);
        
        if (response.status === 401 && shouldAuth) {
            console.log(`${colors.yellow}⚠️  WARN${colors.reset} ${description}`);
            console.log(`   Endpoint requires authentication (expected)`);
            testResults.warnings++;
            return true;
        }

        if (response.status >= 200 && response.status < 300) {
            console.log(`${colors.green}✓ PASS${colors.reset} ${description}`);
            testResults.passed++;
            return true;
        } else if (response.status === 404) {
            console.log(`${colors.red}✗ FAIL${colors.reset} ${description}`);
            console.log(`   Status: 404 - Route not found`);
            testResults.failed++;
            return false;
        } else if (response.status === 500) {
            console.log(`${colors.red}✗ FAIL${colors.reset} ${description}`);
            console.log(`   Status: 500 - Server error`);
            console.log(`   Error: ${response.data.error || 'Unknown'}`);
            testResults.failed++;
            return false;
        } else {
            console.log(`${colors.yellow}⚠️  WARN${colors.reset} ${description}`);
            console.log(`   Status: ${response.status}`);
            testResults.warnings++;
            return true;
        }
    } catch (error) {
        console.log(`${colors.red}✗ FAIL${colors.reset} ${description}`);
        console.log(`   Error: ${error.message}`);
        testResults.failed++;
        return false;
    }
}

async function runTests() {
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}  RAGE:MP Admin Panel - Route Validation Test${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);

    // Check if server is running
    try {
        await axios.get(BASE_URL);
        console.log(`${colors.green}✓${colors.reset} Admin panel server is running\n`);
    } catch (error) {
        console.log(`${colors.red}✗ Admin panel server is not running!${colors.reset}`);
        console.log(`  Please start the server: node admin-panel/server-enhanced.js\n`);
        process.exit(1);
    }

    // Vehicle Routes
    console.log(`${colors.blue}\n━━━ Vehicle Management Routes ━━━${colors.reset}`);
    await testEndpoint('GET', '/vehicles/stats/summary', 'GET /vehicles/stats/summary (CRITICAL - must be first)');
    await testEndpoint('GET', '/vehicles', 'GET /vehicles (all vehicles)');
    await testEndpoint('GET', '/vehicles/1', 'GET /vehicles/:id (single vehicle)');
    await testEndpoint('DELETE', '/vehicles/999', 'DELETE /vehicles/:id (delete)');

    // Economy Routes
    console.log(`${colors.blue}\n━━━ Economy Management Routes ━━━${colors.reset}`);
    await testEndpoint('GET', '/economy/stats', 'GET /economy/stats');
    await testEndpoint('GET', '/economy/transactions', 'GET /economy/transactions');
    await testEndpoint('GET', '/economy/transactions?limit=10', 'GET /economy/transactions (with limit)');
    await testEndpoint('GET', '/economy/transactions/character/1', 'GET /economy/transactions/character/:id');
    await testEndpoint('GET', '/economy/distribution', 'GET /economy/distribution');

    // Analytics Routes
    console.log(`${colors.blue}\n━━━ Analytics Routes ━━━${colors.reset}`);
    await testEndpoint('GET', '/analytics/performance', 'GET /analytics/performance');
    await testEndpoint('GET', '/analytics/activity', 'GET /analytics/activity');
    await testEndpoint('GET', '/analytics/jobs', 'GET /analytics/jobs');
    await testEndpoint('GET', '/analytics/achievements', 'GET /analytics/achievements (division by zero fixed)');
    await testEndpoint('GET', '/analytics/leaderboards', 'GET /analytics/leaderboards');

    // Server Control Routes
    console.log(`${colors.blue}\n━━━ Server Control Routes ━━━${colors.reset}`);
    await testEndpoint('POST', '/server-control/broadcast', 'POST /server-control/broadcast');
    await testEndpoint('POST', '/server-control/give-money', 'POST /server-control/give-money');
    await testEndpoint('POST', '/server-control/set-level', 'POST /server-control/set-level');
    await testEndpoint('POST', '/server-control/heal-all', 'POST /server-control/heal-all');
    await testEndpoint('POST', '/server-control/clear-vehicles', 'POST /server-control/clear-vehicles');
    await testEndpoint('POST', '/server-control/maintenance', 'POST /server-control/maintenance');

    // Existing Routes (verification)
    console.log(`${colors.blue}\n━━━ Existing Routes (Verification) ━━━${colors.reset}`);
    await testEndpoint('GET', '/bans', 'GET /bans');
    await testEndpoint('GET', '/reports', 'GET /reports');
    await testEndpoint('GET', '/admin-logs', 'GET /admin-logs');
    await testEndpoint('GET', '/whitelist', 'GET /whitelist');
    await testEndpoint('GET', '/players', 'GET /players');
    await testEndpoint('GET', '/dashboard/stats', 'GET /dashboard/stats');

    // Print summary
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}  Test Summary${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}  Passed:   ${testResults.passed}${colors.reset}`);
    console.log(`${colors.red}  Failed:   ${testResults.failed}${colors.reset}`);
    console.log(`${colors.yellow}  Warnings: ${testResults.warnings}${colors.reset}`);
    console.log(`  Total:    ${testResults.passed + testResults.failed + testResults.warnings}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);

    if (testResults.failed > 0) {
        console.log(`${colors.red}Some tests failed. Please review the errors above.${colors.reset}\n`);
        process.exit(1);
    } else if (testResults.warnings > 0) {
        console.log(`${colors.yellow}All critical tests passed, but some require authentication.${colors.reset}`);
        console.log(`This is expected behavior for protected routes.\n`);
    } else {
        console.log(`${colors.green}All tests passed! ✓${colors.reset}\n`);
    }
}

// Run tests
runTests().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    process.exit(1);
});
