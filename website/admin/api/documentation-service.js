/**
 * VARAi Documentation Service
 * Serves markdown documentation as HTML with search and navigation
 */

const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');

class DocumentationService {
    constructor() {
        this.documentCache = new Map();
        this.searchIndex = [];
        this.docsPath = path.join(__dirname, '../../../docs');
        this.appsPath = path.join(__dirname, '../../../apps');
        this.deployPath = path.join(__dirname, '../../../deploy');
        
        this.setupMarkedOptions();
        this.buildDocumentIndex();
    }

    setupMarkedOptions() {
        marked.setOptions({
            highlight: function(code, lang) {
                // Basic syntax highlighting placeholder
                return `<code class="language-${lang}">${code}</code>`;
            },
            breaks: true,
            gfm: true
        });
    }

    async buildDocumentIndex() {
        const documentMap = {
            // Master Documentation
            'overview': 'master-documentation/AI-DISCOVERY-MASTER-PROJECT-DOCUMENTATION.md',
            'quick-start': 'DOCUMENTATION-INDEX.md',
            
            // User Guides
            'admin-panel': 'user-guides/ADMIN-PANEL-USER-GUIDE.md',
            'super-admin': 'user-guides/ADMIN-PANEL-USER-GUIDE.md',
            'client-guide': 'user-guides/ADMIN-PANEL-USER-GUIDE.md',
            
            // Technical Documentation
            'developer-guide': 'technical/DEVELOPER-TECHNICAL-GUIDE.md',
            'api-docs': 'api/API-DOCUMENTATION-INTEGRATION-GUIDE.md',
            'architecture': 'architecture/ai-discovery-ecommerce-integration.md',
            
            // Operations
            'deployment': '../deploy/PRODUCTION_DEPLOYMENT_GUIDE.md',
            'troubleshooting': 'operations/TROUBLESHOOTING-MAINTENANCE-GUIDE.md',
            'maintenance': 'operations/TROUBLESHOOTING-MAINTENANCE-GUIDE.md',
            
            // Training
            'training-overview': 'training/KNOWLEDGE-TRANSFER-TRAINING-GUIDE.md',
            'certification': 'training/KNOWLEDGE-TRANSFER-TRAINING-GUIDE.md',
            
            // Platform Integration
            'shopify': '../apps/shopify/README-AI-Discovery.md',
            'woocommerce': 'pseudocode/woocommerce-integration-pseudocode.md',
            'magento': 'pseudocode/platform-integration-pseudocode.md',
            'html-widget': 'pseudocode/html-widget-integration-pseudocode.md',
            
            // Security & Compliance
            'security': 'architecture/security-compliance-architecture.md',
            'privacy': 'architecture/privacy-compliant-data-architecture.md',
            'gdpr': 'specifications/privacy-data-flow-spec.md'
        };

        this.documentIndex = documentMap;
        
        // Build search index
        for (const [docId, filePath] of Object.entries(documentMap)) {
            try {
                const content = await this.loadMarkdownFile(filePath);
                this.searchIndex.push({
                    id: docId,
                    title: this.extractTitle(content),
                    content: content.toLowerCase(),
                    path: filePath
                });
            } catch (error) {
                console.warn(`Could not index document ${docId}:`, error.message);
            }
        }
    }

    async loadMarkdownFile(relativePath) {
        const fullPath = path.join(this.docsPath, relativePath);
        
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            return content;
        } catch (error) {
            // Try alternative paths
            const altPaths = [
                path.join(this.appsPath, relativePath.replace('../apps/', '')),
                path.join(this.deployPath, relativePath.replace('../deploy/', ''))
            ];
            
            for (const altPath of altPaths) {
                try {
                    const content = await fs.readFile(altPath, 'utf8');
                    return content;
                } catch (altError) {
                    continue;
                }
            }
            
            throw new Error(`Document not found: ${relativePath}`);
        }
    }

    extractTitle(markdown) {
        const titleMatch = markdown.match(/^#\s+(.+)$/m);
        return titleMatch ? titleMatch[1] : 'Documentation';
    }

    extractDescription(markdown) {
        const lines = markdown.split('\n');
        let description = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && !line.startsWith('**') && line.length > 20) {
                description = line.substring(0, 150) + '...';
                break;
            }
        }
        
        return description || 'VARAi AI Discovery documentation';
    }

    async getDocument(docId) {
        // Check cache first
        if (this.documentCache.has(docId)) {
            return this.documentCache.get(docId);
        }

        const filePath = this.documentIndex[docId];
        if (!filePath) {
            throw new Error(`Document '${docId}' not found`);
        }

        try {
            const markdown = await this.loadMarkdownFile(filePath);
            const html = marked(markdown);
            const title = this.extractTitle(markdown);
            const description = this.extractDescription(markdown);

            const document = {
                id: docId,
                title,
                description,
                html,
                lastModified: new Date().toISOString()
            };

            // Cache the document
            this.documentCache.set(docId, document);
            
            return document;
        } catch (error) {
            throw new Error(`Error loading document '${docId}': ${error.message}`);
        }
    }

    searchDocuments(query) {
        const results = [];
        const searchTerms = query.toLowerCase().split(' ');

        for (const doc of this.searchIndex) {
            let score = 0;
            
            // Title matching (higher weight)
            for (const term of searchTerms) {
                if (doc.title.toLowerCase().includes(term)) {
                    score += 10;
                }
            }
            
            // Content matching
            for (const term of searchTerms) {
                const matches = (doc.content.match(new RegExp(term, 'g')) || []).length;
                score += matches;
            }
            
            if (score > 0) {
                results.push({
                    id: doc.id,
                    title: doc.title,
                    score,
                    path: doc.path
                });
            }
        }

        return results.sort((a, b) => b.score - a.score).slice(0, 20);
    }

    getDocumentList() {
        return Object.keys(this.documentIndex).map(docId => ({
            id: docId,
            title: this.searchIndex.find(doc => doc.id === docId)?.title || docId,
            path: this.documentIndex[docId]
        }));
    }

    clearCache() {
        this.documentCache.clear();
    }
}

// Express.js route handlers
const documentationService = new DocumentationService();

const routes = {
    // Get a specific document
    async getDocument(req, res) {
        try {
            const { docId } = req.params;
            const document = await documentationService.getDocument(docId);
            
            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    },

    // Search documents
    async searchDocuments(req, res) {
        try {
            const { q: query } = req.query;
            
            if (!query || query.trim().length < 2) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            const results = documentationService.searchDocuments(query);
            
            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Get document list
    async getDocumentList(req, res) {
        try {
            const documents = documentationService.getDocumentList();
            
            res.json({
                success: true,
                data: documents
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Refresh document cache
    async refreshCache(req, res) {
        try {
            documentationService.clearCache();
            await documentationService.buildDocumentIndex();
            
            res.json({
                success: true,
                message: 'Documentation cache refreshed'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

// Export for use in Express app
module.exports = {
    DocumentationService,
    routes
};

// If running as standalone server
if (require.main === module) {
    const express = require('express');
    const cors = require('cors');
    const app = express();
    const port = process.env.PORT || 3001;

    app.use(cors());
    app.use(express.json());

    // Documentation API routes
    app.get('/api/docs/search', routes.searchDocuments);
    app.get('/api/docs/:docId', routes.getDocument);
    app.get('/api/docs', routes.getDocumentList);
    app.post('/api/refresh', routes.refreshCache);

    // Health check
    app.get('/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    app.listen(port, () => {
        console.log(`Documentation service running on port ${port}`);
    });
}