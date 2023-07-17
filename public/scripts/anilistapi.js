function getAnimeInfoById(showid) {
    return new Promise((res, rej) => {
        fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query ($id: Int) {
                        Media (id: $id, type: ANIME) {
                            id
                            title {
                                native
                                userPreferred
                            }
                            coverImage {
                                medium
                                large
                            }
                        }
                    }
                `,
                variables: { id: showid }
            })
        }).then((r) => {
            r.json().then((j) => res(j)).catch((err) => rej({ err:err }));
        }).catch((err) => rej({ err:err }));
    });
}