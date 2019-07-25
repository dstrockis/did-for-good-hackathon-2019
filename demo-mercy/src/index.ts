import Koa from 'koa';
import KoaRouter from 'koa-router';
import Static from 'koa-static';
import BodyParser from 'koa-bodyparser';
import Session from 'koa-session';
import path from 'path';
import BookStore from './BookStore';
import { Identifier, UserAgentSession } from '@microsoft/useragent-sdk';
const secureRandom = require('secure-random');
import Helmet from 'koa-helmet';
import base64url from 'base64url';
import { formBookStoreDiscount, IBookStoreDiscount } from './bookStoreDiscount';
// import https from 'https';
// import fs from 'fs';
import cors from '@koa/cors';

const application = new Koa();
var router = new KoaRouter(); //Instantiate the router

const discountSessions: { [session: string]: IBookStoreDiscount } = {};

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: false, /** (boolean) httpOnly or not (default true) */
  signed: false, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

// Set up the decentralized identifier for the method
let bookStoreIdentifier: Identifier;
let issuerSession: UserAgentSession;
BookStore.provision().then((identifier: Identifier) => {
  bookStoreIdentifier = identifier;
  console.log(`Identifier generated and registered on ION: '${bookStoreIdentifier.id}'`)
  bookStoreIdentifier.getPublicKey()
  .then(publicKey => {
    issuerSession = new UserAgentSession(bookStoreIdentifier, 'did:ion-did:ion-ES256K-sig', BookStore.resolver);
  })
})
.catch((error: Error) => {
  console.error(error);
});

// Setup the routes
router.get('/document', async (context, next) => {
  const document = await bookStoreIdentifier.getDocument();
  context.body = document.toJSON();
  await next();
});

// ajax request to get an OpenID Connect request (OIDC section 6.2)
router.get('/auth-selfissue', async (context, next) => {
  let session = context.session.id;
  if (!session) {
    session = base64url.encode(Buffer.from(secureRandom.randomUint8Array(10)));
    context.session.id = session;
  }
  console.log(`setting session id ${context.session.id}`);
  // the URI for the signed auth request
  const host = context.get('host');
  const requestUrl = `https://${host}/req?session=${session}`;
  const selfIssuedRequest = `openid://useragent?request_uri=${requestUrl}`;
  context.body = selfIssuedRequest;
  await next();
 })

// ajax request to get an OpenID Connect request (OIDC section 6.2)
router.get('/req', async (context, next) => {
  const session = context.request.query['session'];
  console.log(`Recieved request from session ${session}`);
  const nonce = Buffer.from(secureRandom.randomUint8Array(10)).toString('base64');
  const host = context.get('host');
  const redirectUrl = `https://${host}/res`;
  const manifestUrl = `https://${host}/manifest.json`;
  context.body = await issuerSession.signRequest(redirectUrl, nonce, {credential:'VerifiedStudent'}, session, manifestUrl);
  await next();
});

// ajax request to receive auth response from user agent
// expects incoming response in JWS format
router.post('/res', async (context, next) => {
  const requestBody = context.request.body;
  //const requestBody = JSON.parse(context.body.toString());
  if (requestBody.error) {
    console.log(`UserAgent responded with error '${requestBody.error}`);
  }

  // if no error occurred, validate the id_token
  if (requestBody){
    let selfIssuedToken: any;
     try {
      selfIssuedToken = await issuerSession.verify(requestBody);
      console.log(selfIssuedToken);
     }
     catch(error) {
       console.error(error);
       //fallback, ignore verifiy failure for now
       selfIssuedToken = JSON.parse(base64url.decode(requestBody.payload));
     }
      
    // Retrieve Credentials from selfIssuedToken
    let verifiedStudentCredential = JSON.parse(base64url.decode(JSON.parse(selfIssuedToken.credential).payload));
  
    //Form a BookStoreDiscount credential
    let bookStoreDiscountClaim = formBookStoreDiscount(verifiedStudentCredential.did);

    let session = selfIssuedToken.state;
    
    // Save locally
    if (session) {
      console.log(`session id found for response: ${session}`);
      discountSessions[session] = bookStoreDiscountClaim;
    } else {
      console.log('no session id found for response');
    }

    const bookStoreDiscountCred = await bookStoreIdentifier.sign(bookStoreDiscountClaim, 'did:ion-did:ion-ES256K-sig');
    context.body = bookStoreDiscountCred;
    context.status = 200;
    } else {
    // we need an id_token for this to work
    context.status = 400;
  }

  await next();
});

router.get('/studentClaims', async (context, next) => {
  let session = context.session.id;
  if (session in discountSessions) {
    console.log(`session found for student: ${session}`)
    const claim = discountSessions[session];
    const asBody = JSON.stringify(claim);
    context.status = 200;
    context.body = asBody;
  } else {
    context.status = 404;
  }
});

// Setup the application
application
.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type']
}))
.use(Session(CONFIG, application))
.use(Static(path.join(__dirname, 'public')))
.use(BodyParser())
//.use(async (ctx, next) => {
 // ctx.body = await getRawBody(ctx.req);
  //await next();
 //})
.use(router.routes())
.use(Helmet())
.use(
  Helmet.hsts({
    maxAge: 31536000,
    includeSubdomains: true
  })
);

// Start listening for requests
var port = process.env.PORT || '1337';
application.listen(port);
// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, application.callback()).listen(port);
console.log(`Application listening on port ${port}`);