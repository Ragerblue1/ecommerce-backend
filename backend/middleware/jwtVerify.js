const {expressjwt:jwt}=require('express-jwt');
function authjwt(){
    const secret=process.env.JSONWEBTOKENSECRET;
    const api = process.env.API_URL;
    return jwt({
        secret,
        algorithms:['HS256'],
        isRevoked:isRevoked,

    }).unless({
        path:[
            `${api}/users/login`,
            `${api}/users/register`,
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
             { url: /\/api\/v1\/category(.*)/, methods: ['GET', 'OPTIONS'] }
        ]
    })
}

async function isRevoked(req,token){
    if (!token.payload.isAdmin) {
       return true; // "true" means the token is revoked (rejected)
    }
    return false; // "false" means it is NOT revoked (accepted)
}
module.exports=authjwt