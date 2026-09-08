
    const express = require('express');
    const ConfigurationSectionsController = require('../controllers/ConfigurationSectionsController');
    const router = express.Router();
    router.get('/', ConfigurationSectionsController.getAllConfigurationSections);
    router.get('/:id', ConfigurationSectionsController.getConfigurationSections);
    router.post('/', ConfigurationSectionsController.createConfigurationSections);
    router.put('/:id', ConfigurationSectionsController.updateConfigurationSections);
    router.delete('/:id', ConfigurationSectionsController.deleteConfigurationSections);
    module.exports = router;
    