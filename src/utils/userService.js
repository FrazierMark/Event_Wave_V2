import tokenService from "./tokenService";
import axios from "axios";

const BASE_URL = "/api/users/";
const AXIOS_BASE_URL = "api/users/";
const options = {
    headers: {
        'Authorization': 'Bearer ' + tokenService.getToken()
    }
}



async function signup(user) {
    // console.log(user, "<----- from userService")
    // Don't need to include headers....

    return await axios.post(BASE_URL + "signup", user)
        .then((res) => {
            if (res.ok) return res.json();
            // Probably a duplicate email
            throw new Error("Email already taken!");
        })
        // Parameter destructuring!
        .then(({ token }) => tokenService.setToken(token))
        .catch((err) => {
            console.log("ERROR: === ", err)
        })
}


function getUser() {
    return tokenService.getUserFromToken();
}

function logout() {
    tokenService.removeToken();
}

async function login(creds) {
    return await fetch(BASE_URL + "login", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(creds),
    })
        .then((res) => {
            // Valid login if we have a status of 2xx (res.ok)
            if (res.ok) return res.json();
            throw new Error("Bad Credentials!");
        })
        .then(({ token }) => tokenService.setToken(token));
}

const userService = {
    signup,
    logout,
    login,
    getUser,
};

export default userService;
