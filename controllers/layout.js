module.exports = (req, res, next) => {
    req.info = {
        auth: req.isAuthenticated(),
        username: req.user?.name,
        admin: false
    };
    next();
};