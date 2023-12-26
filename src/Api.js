

export async function getToken({ email, password }) {
    return fetch('https://skypro-music-api.skyeng.tech/user/token/', {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password,
        }),
        headers: {
            'content-type': 'application/json',
        },
    })
}

export async function refreshToken() {
    return fetch('https://skypro-music-api.skyeng.tech/user/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({
            refresh: localStorage.getItem('refreshToken'),
        }),
        headers: {
            'content-type': 'application/json',
        },
    })
}

export async function login({ email, password }) {
    return fetch('https://skypro-music-api.skyeng.tech/user/login/', {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password,
        }),
        headers: {
            'content-type': 'application/json',
        },
    })
}

export async function register({ email, password }) {
    return fetch('https://skypro-music-api.skyeng.tech/user/signup/', {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password,
            username: email,
        }),
        headers: {
            'content-type': 'application/json',
        },
    })
}
