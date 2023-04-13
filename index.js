const express = require('express');
const exphbs = require('express-handlebars');
const flash = require('express-flash');
const session = require('express-session');

const pg = require("pg");
const Pool = pg.Pool;
let iceCream = require('./ice-cream');

const connectionString = process.env.DATABASE_URL || 'postgresql://unalo:unalo123@localhost:5432/ice-cream-shop';
const pool = new Pool({
  connectionString
});

const app = express();
const PORT = process.env.PORT || 3017;

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(session({
  secret: 'message added',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

let iceFactory = iceCream(pool);

app.get('/', async (req, res) => {
  let cones = await iceFactory.getContainer();
  let flavour = await iceFactory.getFlavour();
  let topping = await iceFactory.getTopping();
  let order = await iceFactory.getCardLenght();
console.log(topping);
  res.render('index', {
    cones,
    flavour,
    topping,
    order
  });
});

app.post('/ice-cream', async (req, res) => {
  let { container, flavour, topping } = req.body;
  if (container && flavour && topping) {
    let cream = await iceFactory.iceCream(container, flavour);
    let top = await iceFactory.addTopping(cream, topping)
    req.flash('sucess', `Order placed`);
  } else {
    req.flash('error', `choose container and flavour`);
    res.redirect('/')
  }
  let order = await iceFactory.getCardLenght();
  res.redirect('/')
});

app.get('/order', async (req, res) => {
  await iceFactory.getGrandTotal();
  const total = await iceFactory.getTotals();
  console.log(total);
  res.render('order', {
    total
  })
})

app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const total = await iceFactory.getTotals();
  let cones = await iceFactory.getSelectedCone(id)
  let flavour = await iceFactory.getSelectedFlavour(id);
  let topping = await iceFactory.getSelectedTopping(id);
  let order = await iceFactory.getCardLenght();

  res.render("edit", {
    cones,
    flavour,
    topping,
    id,
    order
  })
})

app.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  let { container, flavour, topping } = req.body;
  await iceFactory.upDate(id)
  let cream = await iceFactory.iceCream(container, flavour);
  await iceFactory.addTopping(cream, topping)
  req.flash('update', `Order updated`);
  res.redirect(`/`)
})

app.get("/clear", async (req, res) => {
  let clear = await iceFactory.clearAll();
  if (clear.rowCount === 0) {
    req.flash('sucess', `Cart already empty!`);
    res.redirect('order')
  }
  req.flash('sucess', `Cart cleared sucessfully!`);
  res.redirect(`/`)
})

app.listen(PORT, function () {
  console.log(`App started on port ${PORT}`)
});