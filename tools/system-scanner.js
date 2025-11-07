/**
 * ELITE SYSTEM SCANNER
 * Deep diagnostic tool for RAGE:MP projects
 */

const fs = require('fs');
const path = require('path');

class SystemScanner {
    constructor() {
        this.issues = [];
        this.scannedFiles = 0;
        this.patterns = {
            // Deprecated RAGE:MP API calls
            deprecated: [
                { pattern: /mp\.events\.addCommand\(/g, suggestion: 'Use mp.events.addCommand with proper validation' },
                { pattern: /player\.call\('client:/g, suggestion: 'Verify event name matches client handler' },
                { pattern: /mp\.events\.add\('server:/g, suggestion: 'Verify event name matches server handler' }
            ],
            // Common errors
            errors: [
                { pattern: /mp\.players\.local\.getVariable\([^)]+\)\s*(?!&&|if|\?)/g, level: 'medium', message: 'Missing null check for player variable' },
                { pattern: /JSON\.parse\([^)]+\)(?!\s*catch)/g, level: 'medium', message: 'JSON.parse without try-catch' },
                { pattern: /await\s+(?!.*catch)/g, level: 'low', message: 'Async call without error handling' },
                { pattern: /mp\.players\.at\([^)]+\)(?!\s*&&|\s*if)/g, level: 'medium', message: 'Missing existence check for mp.players.at' }
            ],
            // Missing imports
            missingImports: [
                { pattern: /require\(['"]\.\.?\/[^'"]+['"]\)/g, check: 'path_exists' }
            ],
            // Console errors
            consoleErrors: [
                { pattern: /console\.log\(/g, level: 'low', message: 'Use proper logging system' },
                { pattern: /console\.error\(/g, level: 'info', message: 'Good error logging' }
            ]
        };
    }

    scanFile(filePath, content) {
        const issues = [];
        const fileName = path.basename(filePath);
        
        // Check for deprecated APIs
        this.patterns.deprecated.forEach(({ pattern, suggestion }) => {
            const matches = content.match(pattern);
            if (matches) {
                issues.push({
                    file: filePath,
                    type: 'deprecated',
                    severity: 'medium',
                    count: matches.length,
                    message: `Deprecated API usage found`,
                    suggestion
                });
            }
        });

        // Check for common errors
        this.patterns.errors.forEach(({ pattern, level, message }) => {
            const matches = content.match(pattern);
            if (matches) {
                issues.push({
                    file: filePath,
                    type: 'error',
                    severity: level,
                    count: matches.length,
                    message
                });
            }
        });

        // Check for syntax patterns that might cause issues
        if (content.includes('mp.') && !content.includes('typeof mp')) {
            const lines = content.split('\n');
            const firstMpUsage = lines.findIndex(line => line.includes('mp.') && !line.includes('typeof mp'));
            if (firstMpUsage < 10 && !content.includes('if (typeof mp ===')) {
                issues.push({
                    file: filePath,
                    type: 'warning',
                    severity: 'low',
                    line: firstMpUsage + 1,
                    message: 'Using mp global without existence check'
                });
            }
        }

        // Check event handler mismatches
        const clientCalls = content.match(/player\.call\(['"]([^'"]+)['"]/g);
        if (clientCalls) {
            clientCalls.forEach(call => {
                const eventName = call.match(/player\.call\(['"]([^'"]+)['"]/)[1];
                if (eventName.startsWith('client:')) {
                    issues.push({
                        file: filePath,
                        type: 'event',
                        severity: 'medium',
                        message: `Client event call: ${eventName}`,
                        suggestion: 'Verify matching client-side handler exists'
                    });
                }
            });
        }

        return issues;
    }

    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            scanned_files: this.scannedFiles,
            total_issues: this.issues.length,
            issues_by_severity: {
                critical: this.issues.filter(i => i.severity === 'critical').length,
                high: this.issues.filter(i => i.severity === 'high').length,
                medium: this.issues.filter(i => i.severity === 'medium').length,
                low: this.issues.filter(i => i.severity === 'low').length
            },
            issues: this.issues
        };
    }
}

module.exports = SystemScanner;
