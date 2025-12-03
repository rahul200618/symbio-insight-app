// Validation middleware for API requests

/**
 * Validate FASTA format in request body
 */
function validateFasta(req, res, next) {
    const { fasta } = req.body || {};

    if (!fasta || typeof fasta !== 'string') {
        return res.status(400).json({ error: 'fasta string required in request body' });
    }

    // Basic FASTA format validation
    const trimmed = fasta.trim();
    if (!trimmed.startsWith('>')) {
        return res.status(400).json({ error: 'Invalid FASTA format: must start with ">"' });
    }

    // Check for sequence data
    const lines = trimmed.split(/\r?\n/);
    const hasSequence = lines.some((line, idx) => idx > 0 && line.trim() && !line.startsWith('>'));

    if (!hasSequence) {
        return res.status(400).json({ error: 'Invalid FASTA format: no sequence data found' });
    }

    next();
}

/**
 * Validate pagination parameters
 */
function validatePagination(req, res, next) {
    const { page, limit } = req.query;

    if (page && (isNaN(page) || parseInt(page) < 1)) {
        return res.status(400).json({ error: 'Invalid page parameter: must be a positive integer' });
    }

    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        return res.status(400).json({ error: 'Invalid limit parameter: must be between 1 and 100' });
    }

    next();
}

/**
 * Validate MongoDB ObjectId format
 */
function validateMongoId(req, res, next) {
    const { id } = req.params;

    // MongoDB ObjectId is a 24-character hexadecimal string
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;

    if (!id || !objectIdPattern.test(id)) {
        return res.status(400).json({ error: 'Invalid ID format: must be a valid MongoDB ObjectId' });
    }

    next();
}

/**
 * Validate bulk delete request
 */
function validateBulkDelete(req, res, next) {
    const { ids } = req.body || {};

    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids must be an array' });
    }

    if (ids.length === 0) {
        return res.status(400).json({ error: 'ids array cannot be empty' });
    }

    if (ids.length > 100) {
        return res.status(400).json({ error: 'Cannot delete more than 100 items at once' });
    }

    // Validate each ID format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    const invalidIds = ids.filter(id => !objectIdPattern.test(id));

    if (invalidIds.length > 0) {
        return res.status(400).json({
            error: 'Invalid ID format in array',
            invalidIds: invalidIds.slice(0, 5) // Show first 5 invalid IDs
        });
    }

    next();
}

module.exports = {
    validateFasta,
    validatePagination,
    validateMongoId,
    validateBulkDelete
};
