function getOstById(ostid) {
    return new Promise((res, rej) => {
        fetch("/api/ost/get", {
            method: "POST",
            body: JSON.stringify({
                ost_id: ostid
            }),
            headers: {
                "Content-Type": "application/json",
            }
        }).then((r) => {
            r.json().then((j) => {
                if (r.status === 200)
                    return res(j);
                else
                    return rej(j);
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
    });
}

function setOstScore(ostid, score) {
    return new Promise((res, rej) => {
        fetch("/api/user/score/set", {
            method: "POST",
            body: JSON.stringify({
                ost_id: ostid,
                score: score
            }),
            headers: {
                "Content-Type": "application/json",
            }
        }).then((r) => {
            r.json().then((j) => {
                if (r.status === 200)
                    return res(j);
                else
                    return rej(j);
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
    });
}

function getOstScore(ostid) {
    return new Promise((res, rej) => {
        fetch("/api/user/score/get", {
            method: "POST",
            body: JSON.stringify({
                ost_id: ostid
            }),
            headers: {
                "Content-Type": "application/json",
            }
        }).then((r) => {
            r.json().then((j) => {
                if (r.status === 200)
                    return res(j);
                rej(j);
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
    });
}

function getOstRelationsById(ostid) {
    return new Promise((res, rej) => {
        fetch("/api/ost/relation/gets",{
            method: "POST",
            body: JSON.stringify({
                ost_id: ostid
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((r) => {
            r.json().then((j) => {
                if (r.status === 200)
                    return res(j)
                rej(j);
            }).catch((err) => {
                rej({
                    err: err
                });
            })
        }).catch((err) => {
            rej({
                err: err
            });
        });
    });
}