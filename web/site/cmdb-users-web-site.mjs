// validate login and more... Aula 27 01:34:45

export default function(userServices) {
    // Validate if all the received services exist
    if (!userServices) {
        throw errors.INVALID_ARGUMENT("userServices")
    }
    return {
        newUser: newUserInternal,
        createUser: createUserInternal,
        homeNotAuthenticated: homeNotAuthenticatedInternal,
        verifyAuthenticated: verifyAuthenticatedInternal,
        homeAuthenticated: homeAuthenticatedInternal,
        loginForm: loginFormInternal,
        validateLogin: validateLoginInternal,
        logout: logoutInternal
    }

    function newUserInternal(req, rsp) {
        rsp.render('newUser')
    }

    async function createUserInternal(req, rsp) {
        const username = req.body.username
        const password = req.body.password
        const newUser = await userServices.createUser(username, password)
        rsp.redirect('/home')
    }

    function homeNotAuthenticatedInternal(req, rsp) {
        rsp.render('home')
    }
        
    function homeAuthenticatedInternal(req, rsp) {
        const viewData = {user: req.user}
        rsp.render('homeAuth', viewData)
    }
    
    function loginFormInternal(req, rsp) {
        rsp.render('login')
    }

    async function validateUser(username, password) {
        return userServices.checkUser(username, password)
    }

    async function validateLoginInternal(req, rsp) {
        let user = await validateUser(req.body.username, req.body.password)
        if(user) {
            // Represents a user in the CMDB application
            // Passport saves this object in session, and when the request arrives and while the 
            // session for this user is active, the data can be accessed in req.user
            req.login({
                username: user.username,
                token: user.token
            }), () => rsp.redirect('/auth/home')
        }
    }
    
    function verifyAuthenticatedInternal(req, rsp, next) {
        // The user is only authenticated if req.user != undefined
        if(req.user) {
            return next()
        }
        rsp.redirect('/login')
    }
    
    function logoutInternal(req, rsp) {
        // Destroys req.user object and removes it from the session 
        req.logout((err) => {
            rsp.redirect('/home')
        }) 
    }
}
