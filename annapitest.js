const { XMLParser } = require("fast-xml-parser");

function getAnimeNewsNetworkData(id) {
    return new Promise((res, rej) => {
        fetch(`https://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=${id}`).then((r) => {
            r.text().then((t) => {
                let data = new XMLParser({
                    ignoreAttributes: false
                }).parse(t);
                res(data);
            })
        });
    });
}

function getAnimeData(id) {
    return new Promise((res, rej) => {
        getAnimeNewsNetworkData(id).then((annData) => {
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
                                data.alternative_title += `<sep>${info["#text"]}`;
                            else
                                data.alternative_title = info["#text"];
                        }
                        break;
                    case "Picture":
                        data.medium = info.img[0]["@_src"];
                        data.large = info.img[info.img.length - 1]["@_src"];
                        break;
                    case "Number of episodes":
                        data.episode_count = info["#text"];
                        break;
                    case "Vintage":
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

getAnimeData(26334).then((data) => {
    console.log(data);
}).catch((msg) => {
    console.log(msg);
})