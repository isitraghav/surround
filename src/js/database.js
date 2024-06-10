import axios from "axios";
import GUN from "gun";
import "gun/sea";
import "gun/axe";

// pinging gun hosts
let hosts = [
    "https://gun-manhattan.herokuapp.com/gun",
    "https://peer.wallie.io/gun",
];
let verifyhosts = [];
hosts.forEach((url, index) => {
    axios.get(`${url}/stats.radata`).then((val) => {
        if (val.status == 200) {
            if (val.data["up"].count == 1) {
                verifyhosts.push(url);
            }
        }
    });
});
// Database
export const db = GUN({
    peers: verifyhosts,
    localStorage: true,
    radisk: true
});

// Gun User
export const user = db.user()//.recall({ sessionStorage: true });