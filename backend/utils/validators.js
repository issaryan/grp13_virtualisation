const validateRequest = (body, requiredFields = []) => {
    try {
        const data = JSON.parse(body || '{}');
        const missingFields = requiredFields.filter(field => !data[field]);

        if (missingFields.length > 0) {
            return {
                error: `Champs manquants : ${missingFields.join(', ')}`
            };
        }

        return { data };

    } catch (error) {
        return { error: 'Format JSON invalide' };
    }
};

module.exports = { validateRequest };
