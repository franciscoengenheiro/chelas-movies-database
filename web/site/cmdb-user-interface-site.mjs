function removeGroup(usertoken, id){
    const btn = document.querySelector("#b1")
    btn.onclick = handleClick
    async function handleClick() {

        console.log(id)

        let path = location.pathname
        const startIdx = path.indexOf("/groups")
        path = path.substring(startIdx) 

        const url = `/api${path}/${id}`
        const options = {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${usertoken}`
            }

        }
        const response = await fetch(url, options)
        if(response.ok) {
            location = `/auth/groups`
        }
    }
}

