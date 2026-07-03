module.exports = (...roles) => {

    //Do not underestimate. Without this all roles will default to investor.
    return (req, res, next) => {

        if (
            !roles.includes(req.user.role)
        ) {

            return res.status(403).json({
                message: "Forbidden"
            });
        }

        next();
    };
};