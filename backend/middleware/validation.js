// Input validation middleware

const validateFasta = (req, res, next) => {
  const { fasta } = req.body;
  
  if (!fasta || typeof fasta !== 'string') {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'fasta string is required'
    });
  }
  
  if (fasta.length < 10) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'FASTA sequence too short (minimum 10 characters)'
    });
  }
  
  if (!fasta.includes('>')) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Invalid FASTA format - missing header line starting with ">"'
    });
  }
  
  next();
};

const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  
  if (page && (isNaN(page) || page < 1)) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'page must be a positive integer'
    });
  }
  
  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'limit must be between 1 and 100'
    });
  }
  
  next();
};

const validateMongoId = (req, res, next) => {
  const { id } = req.params;
  
  // MongoDB ObjectId is 24 hex characters
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Invalid sequence ID format'
    });
  }
  
  next();
};

const validateBulkDelete = (req, res, next) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'ids array is required'
    });
  }
  
  if (ids.length === 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'ids array cannot be empty'
    });
  }
  
  if (ids.length > 100) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Cannot delete more than 100 sequences at once'
    });
  }
  
  // Validate each ID format
  const invalidIds = ids.filter(id => !/^[0-9a-fA-F]{24}$/.test(id));
  if (invalidIds.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'One or more IDs have invalid format',
      invalidIds
    });
  }
  
  next();
};

module.exports = {
  validateFasta,
  validatePagination,
  validateMongoId,
  validateBulkDelete
};
