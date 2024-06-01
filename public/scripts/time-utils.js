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

//https://stackoverflow.com/a/3177838
function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }