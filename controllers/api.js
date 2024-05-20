var graphql = require("graphql")
var graphqlhttp = require("graphql-http/lib/use/express")
var { makeExecutableSchema } = require("@graphql-tools/schema")

module.exports = (app) => {
    return graphqlhttp.createHandler({
        schema: makeExecutableSchema({
            typeDefs: graphql.buildSchema(require("fs").readFileSync("./graphql/schema.graphql").toString()),
            resolvers: require("../graphql/resolver")
        }),
        context: (req) => ({
            app: app,
            req: req.raw
        })
    })
}