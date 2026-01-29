/**
 * Database Controller
 * Manages "Base de données" (database-type folders)
 */

module.exports = {
    /**
     * List all databases
     * GET /account/:account_id/db/list
     */
    list: async (req, res) => {
        try {
            res.render("db/db-list", {
                layout: "layout-app",
                pageTitle: "Base de données",
                account_number: req.params.account_id
            });
        } catch (error) {
            console.error("Error loading database list:", error);
            res.status(500).render("error", {
                message: "Erreur lors du chargement des bases de données",
                error: error
            });
        }
    }
};
