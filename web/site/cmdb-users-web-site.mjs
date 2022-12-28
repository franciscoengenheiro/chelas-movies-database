// validate login and more... Aula 27 01:34:45

function validateLogin(req, rsp) {
    console.log("validateLogin")
    if(validateUser(req.body.username, req.body.password)) {
        // Represents a user in the CMDB application
        // Passport saves this object in session, and when the request arrives and while the 
        // session for this user is active, the data can be accessed in req.user
        req.login({
            username: req.body.username,
            token: ??
        }), (err) => rsp.redirect('/auth/home')
    }
}

function verifyAuthenticated(req, rsp, next) {
    // The user is only authenticated if req.user != undefined
    if (req.user) {
        return next()
    }
    rsp.redirect('/login')
}

function logout(req, rsp) {
    // Destroys req.user object and removes it from the session 
    req.logout((err) => {
        rsp.redirect('/home')
    }) 
}