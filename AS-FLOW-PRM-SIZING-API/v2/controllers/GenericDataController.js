const sizingQueryUseCases = require('../service/usecases/sizingQuery');

const getFluids = async (req, res) => {
    try {
        const data = await sizingQueryUseCases.getFluids({
            userId: req.query?.userId || req.user?.email,
        });
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        if (error?.status) {
            return res.status(error.status).json({ status: "Error", error: error.message });
        }
        console.error('Error fetching fluids details:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });

    }
};

const getFluidById = async (req, res) => {
    try {
        const fluidTypeId = req.params.fluidtypeId;
        if (!fluidTypeId) {
            return res.status(400).json({ status: "Error", error: "Missing fluidtypeId in request parameters" });
        }
        const data = await sizingQueryUseCases.getFluids({
            userId: req.query?.userId || req.user?.email,
            fluidTypeId,
        });
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        if (error?.status) {
            return res.status(error.status).json({ status: "Error", error: error.message });
        }
        console.error('Error fetching fluids details:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });

    }
};

const getGenericErrors = async (req, res) => {
    try {
        const data = await sizingQueryUseCases.getGenericErrorsGrid({
            userId: req.query?.userId || req.user?.email,
        });
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        if (error?.status) {
            return res.status(error.status).json({ status: "Error", error: error.message });
        }
        console.error('Error fetching generic errors:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });

    }
}

module.exports = {
    getFluids,
    getFluidById,
    getGenericErrors
};