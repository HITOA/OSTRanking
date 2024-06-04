module.exports = (req, res, next) => {
    req.info = {
        auth: req.isAuthenticated(),
        username: req.user?.name,
        current_user_id: req.user?.id,
        admin: false
    };
    next();
};