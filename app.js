export default function appScr(
  express,
  bodyParser,
  fs,
  crypto,
  http,
  CORS,
  User,
  mongoose,
  puppeteer
) {
  const app = express();
  const headersHTML = { "Content-Type": "text/html; charset=utf-8", ...CORS };
  const headersAll = {
    "Content-Type": "text/html; charset=utf-8",
    "X-Author": "itmo224658",
    ...CORS,
  };
  const headersTEXT = { "Content-Type": "text/plain", ...CORS };
  const headersJSON = { "Content-Type": "application/json", ...CORS };
  const headersCORS = { ...CORS };
  const wp = {
    id: 1,
    title: {
      rendered: login,
    },
  };
  const login = 'itmo224658';
  app
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())

    .all('/*', (req, res) => {
      res.set(headersAll);
      res.send(login);
      })
    .all("/sample/", (r) => {
      r.res.set(headersTEXT).send("function task(x) { return x*this*this; }");
    })
    .all("/fetch/", (r) => {
      r.res.set(headersHTML).render("fetch");
    })
    .all("/promise/", (r) => {
      r.res
        .set(headersTEXT)
        .send(
          "function task(x){return new Promise((res,rej) => x<18 ? res('yes') : rej('no'))}"
        );
    })
    .all("/result4/", (r) => {
      const result = {
        message: login,
        "x-result": r.headers["x-test"],
      };
      let body = "";

      r.on("data", (data) => (body += data)).on("end", () => {
        result["x-body"] = body;
        r.res
          .writeHead(200, { ...CORS, "Content-Type": "application/json" })
          .end(JSON.stringify(result));
      });
    })
    .all("/login/", (r) => {
      r.res.set(headersTEXT).send(login);
    })
    .all("/code/", (r) => {
      r.res.set(headersTEXT);
      fs.readFile(import.meta.url.substring(7), (err, data) => {
        if (err) throw err;
        r.res.end(data);
      });
    })
    .all("/sha1/:input/", (r) => {
      let shasum = crypto.createHash("sha1");
      r.res
        .set(headersTEXT)
        .send(shasum.update(req.params.input).digest("hex"));
    })
    .get("/req/", (r) => {
      r.res.set(headersTEXT);
      let data = "";
      http.get(req.query.addr, async function (response) {
        await response
          .on("data", function (chunk) {
            data += chunk;
          })
          .on("end", () => {});
        r.res.send(data);
      });
    })
    .post("/req/", (r) => {
      r.res.set(headersTEXT);
      let data = "";
      http.get(req.body.addr, async function (response) {
        await response
          .on("data", function (chunk) {
            data += chunk;
          })
          .on("end", () => {});
        r.res.send(data);
      });
    })
    .post("/insert/", async (r) => {
      r.res.set(headersTEXT);
      const { login, password, URL } = r.body;
      const newUser = new User({ login, password });
      try {
        await mongoose.connect(URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        try {
          await newUser.save();
          r.res.status(201).json({ "Добавлено: ": login });
        } catch (e) {
          r.res.status(400).json({ "Ошибка: ": "Нет пароля" });
        }
      } catch (e) {
        console.log(e.codeName);
      }
    })
    .all("/test/", async (r) => {
      r.res.set(headersTEXT);
      const { URL } = r.query;
      console.log(URL);
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.goto(URL);
      await page.waitForSelector("#inp");
      await page.click("#bt");
      const got = await page.$eval("#inp", (el) => el.value);
      console.log(got);
      browser.close();
      r.res.send(got);
    })
    .all("/wordpress/", (r) => {
      r.res.set(headersJSON).send(wp);
    })
    .all("/wordpress/wp-json/wp/v2/posts/", (r) => {
      r.res.set(headersJSON).send([wp]);
    })
    .all("/render/", async (req, res) => {
      res.set(headersCORS);
      const { addr } = req.query;
      const { random2, random3 } = req.body;
      http.get(addr, (r, b = "") => {
        r.on("data", (d) => (b += d)).on("end", () => {
          fs.writeFileSync("views/render.pug", b);
          res.render("render", { login: login, random2, random3 });
        });
      });
    })
    .use(({ res: r }) => r.status(404).set(headersTEXT).send(login))
    .set("view engine", "pug");
  return app;
}
