const ann = {
    getAnimeNewsNetworkData(id) {
        return new Promise((res, rej) => {
            fetch(`https://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=${id}`).then((r) => {
                r.text().then((t) => {
                    let data = new fxp.XMLParser({
                        ignoreAttributes: false
                    }).parse(t);
                    res(data);
                })
            });
        });
    },
    getAnimeData(id) {
        return new Promise((res, rej) => {
            ann.getAnimeNewsNetworkData(id).then((annData) => {
                if (!annData.ann.anime)
                    return rej("Anime not found with this id.");
                let data = {};
                for (let info of annData.ann.anime.info) {
                    switch(info["@_type"]) {
                        case "Main title":
                            data.main_title = info["#text"];
                            break;
                        case "Alternative title":
                            if (info["@_lang"] === "JA") {
                                if (data.alternative_title)
                                    data.alternative_title += `|;|${info["#text"]}`;
                                else
                                    data.alternative_title = info["#text"];
                            }
                            break;
                        case "Picture":
                            if (info.img.length === undefined) {
                                data.medium = info.img["@_src"];
                                data.large = info.img["@_src"];
                            } else {
                                data.medium = info.img[0]["@_src"];
                                data.large = info.img[info.img.length - 1]["@_src"];
                            }
                            break;
                        case "Number of episodes":
                            data.episode_count = info["#text"];
                            break;
                        case "Vintage":
                            if (!data.vintage)
                                data.vintage = info["#text"];
                            break;
                        default:
                            break;
                    }
                }

                res(data);
            });
        });
    }
}