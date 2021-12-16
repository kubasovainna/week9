export default function(express, bodyParser, createReadStream, crypto, http, m, UserSchema, writeFileSync, puppeteer) {
    const app = express();
    const CORS = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Accept'
    };
    const login = 'itmo224658';
    const User = m.model('User', UserSchema);
    const headersText = {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'X-Author': login,
        ...CORS,
    };
    
    app
    .all('/login/', (req, res) => {
        res.set(CORS);
        res.send(login);
        })
    
    .all('/code/', (req, res) => {
        res.set(CORS);
        const path = import.meta.url.substring(7);
        createReadStream(path).pipe(res);
        })
    .all('/sha1/:input/', (req, res) => {
        res.set(CORS);
        const hash_sha1 = crypto.createHash('sha1')
        .update(req.params.input)
        .digest('hex')
        res.send(hash_sha1);
        })
    
    .use(bodyParser.urlencoded({extended: true}))
    
    .all('/req/', (req, res) => {
        res.set(CORS);
        if (req.method === "GET" || req.method === "POST") {
            const address = req.method === "GET" ? req.query.addr : req.body.addr;
            if (address) {
               http.get(address, (resp) => {
                let data = '';
                resp.on('data', (chunk) => { data += chunk; });
                  resp.on('end', () => {
                      res.send(data);
                  });
                }) 
            }
            else {
                res.send(login);
            }
        }
        else {
            res.send(login);
        }
        })
    .post('/insert/', async (req, res) => {
        const { URL, login, password } = req.body;
        try {
          await m.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
        } catch (e) {
          res.send(e.stack);   
        }

        const newUser = new User({ login, password });
        await newUser.save();
        res.status(201).json({ successsss: true, login });
    })
    .all('/wordpress/', (r) => {
        r.res.set(CORS).send({
            id: 1,
            title: {
                rendered: login
            }
        })
    })
    .all('/wordpress/wp-json/wp/v2/posts/1', (r) => {
        r.res.set(CORS).send({
            id: 1,
            title: {
                rendered: login
            }
        })
    })
    .use(bodyParser.json())
    .all('/render/', async (req, res) => {
        res.set(CORS);
        res.set(headersText);
        const { addr } = req.query;
        const { random2, random3 } = req.body;
        const r2 = req.body.random2;
        
        
        console.log(random2);

        http.get(addr, (r, body = '') => {
          r.on('data', (data) => (body += data)).on('end', () => {
            writeFileSync('views/render.pug', body);
            res.render('render', { login: login, random2, random3 });
          });
        });
      })
    .all('/test/', async (req, res) => {
        res.set(headersText);
        const { URL } = req.query;

        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox'],
        });
        try {
        const page = await browser.newPage();
        await page.goto(URL);
        await page.waitForSelector('#bt');
        await page.click('#bt');
        await page.waitForSelector('#inp');
        const got = await page.$eval('#inp', ({ value }) => value);
        browser.close();
        res.send(got);
        } catch (e) {
          res.send(e.stack);   
        }
      })
    .all('/*', (req, res) => {
        res.set(CORS);
        res.send(login);
        })
    .set('view engine', 'pug');
   return app; 
}