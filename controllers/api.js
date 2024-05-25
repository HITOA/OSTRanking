var graphql = require("graphql")
var graphqlhttp = require("graphql-http/lib/use/express")
var { makeExecutableSchema } = require("@graphql-tools/schema")
const { applyMiddleware } = require("graphql-middleware")
var xss = require("xss")


function sanitizeObject(object) {
    if (!object)
        return object;

    if (typeof(object) === "string")
        return xss(object);

    for (const [key, value] of Object.entries(object))
        object[key] = sanitizeObject(value);
    return object;
}

async function sanitizerMiddleware(next, args, obj, context, info) {
    args = sanitizeObject(args);
    return await next();
}

module.exports = (app) => {
    return graphqlhttp.createHandler({
        schema: makeExecutableSchema({
            typeDefs: applyMiddleware(graphql.buildSchema(require("fs").readFileSync("./graphql/schema.graphql").toString()), sanitizerMiddleware),
            resolvers: require("../graphql/resolver")
        }),
        context: (req) => ({
            app: app,
            req: req.raw
        })
    })
}