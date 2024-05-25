function mmssFromSeconds(seconds) {
    let d = new Date(seconds * 1000);
    return `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

function mmssToDate(mmss) {
    if (typeof(mmss) !== "string")
        return null;

    let v = mmss.split(':');
    if (v.length != 2)
        return null;
    
    let mm = parseInt(v[0]);
    let ss = parseInt(v[1]);
    if (!mm || !ss)
        return null;

    return new Date(null, null, null, null, mm, ss);
}