exports.getAnimeDetails = function () {
    return new Promise((res, rej) => {
        fetch("https://api.myanimelist.net/v2/anime/339?fields=id,title", {
            headers: {
                
            }
        }).then((r) => {
            res(r);
        }).catch((err) => {
            rej(err);
        })
    });
}