export default function(handler) {
    return async function(req, rsp) {
        const path = (req.path).includes('/api')

        try{
            let obj = await handler(req, rsp)
            if(path) rsp.json(obj)
            else rsp.render(obj.name, obj.data)
        } catch(e) {
            const httpResponse = translateToHTTPResponse(e)
            if(path) {
                rsp
                    .status(httpResponse.status)
                    .json(httpResponse.obj)
            }
            else {
                rsp.render('onError', httpResponse)
            }
        }
        
    }
}