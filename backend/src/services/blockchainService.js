const {
    policyRegistry
} = require("../config/blockchain");

//Taking from what we know on the blockchain to allow user action
exports.createPolicy = async (
    investor,
    coverage,
    premium,
    threshold,
    trigger
) => {

    const tx =
        await policyRegistry.createPolicy(
            investor,
            coverage,
            premium,
            threshold,
            trigger
        );

    return await tx.wait();
};

exports.getPolicy = async (id) => {

    return await policyRegistry.getPolicy(id);
};