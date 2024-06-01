function graphqlQuery(query, variables = {}) {
    return new Promise((res, rej) => {
        fetch("/api", {
            method: "POST",
            body: JSON.stringify({
                query: query,
                variables: variables
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((r) => {
            r.json().then((j) => {
                res(j);
            }).catch((err) => {
                rej({
                    err: err
                });
            })
        }).catch((err) => {
            rej({
                err: err
            });
        })
    })
}