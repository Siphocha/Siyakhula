const blockchain =
    require("../services/blockchainService");

exports.getPolicy = async (
    req,
    res
) => {

    try {

        const policy =
            await blockchain.getPolicy(
                req.params.id
            );

        res.json(policy);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });
    }
};