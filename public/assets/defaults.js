/* Starting content for the Chef Yos site.
   Once Chef Yos saves anything in the dashboard (/admin), the saved version is used instead. */
window.CHEF_DEFAULTS = {
  business: {
    whatsapp: "2348083519434",
    phoneDisplay: "0808 351 9434",
    city: "Lagos",
    heroIntro: "I'm Chef Yos, your private chef in Lagos. I come to your home every week and cook, so your household eats well all month. Planning one special night instead? I do that too.",
    about: "I'm a private chef based in Lagos. I cook in your home, plan the menu around what you love, and handle the shopping and setup if you need me to. You just sit down and enjoy good food with your people.",
    bookingsOpen: true,
    closedMessage: "I'm fully booked right now. Send me a message on WhatsApp and I'll let you know my next free dates."
  },
  oneoff: [
    { id: "daily",   name: "Daily / One-day service",          price: 70000,  from: false, note: "A day of cooking in your kitchen" },
    { id: "dinner",  name: "Private dinner / intimate dining",  price: 100000, from: false, note: "Dinner cooked and served at home" },
    { id: "special", name: "Special occasion",                  price: 150000, from: true,  note: "Birthdays, anniversaries, proposals" },
    { id: "premium", name: "Premium private dining experience", price: 200000, from: true,  note: "The full private dining treatment" }
  ],
  monthly: [
    { id: "m1", name: "Once a week",        price: 150000, per: 1 },
    { id: "m2", name: "Twice a week",       price: 200000, per: 2 },
    { id: "m3", name: "Three times a week", price: 280000, per: 3 },
    { id: "m4", name: "Four times a week",  price: 350000, per: 4 }
  ],
  /* kind: "fixed" (price), "from" (price and up), "range" (price to priceMax),
           "hourly" (price per hour), "quote" (priced on request) */
  addons: [
    { id: "grocery",   name: "Grocery shopping / procurement", kind: "range",  price: 15000, priceMax: 25000 },
    { id: "hours",     name: "Extra hour",                     kind: "hourly", price: 10000 },
    { id: "mealprep",  name: "Meal prep",                      kind: "from",   price: 50000 },
    { id: "setup",     name: "Event / private dining setup",   kind: "from",   price: 50000 },
    { id: "logistics", name: "Logistics / transport",          kind: "quote",  price: 0, quoteText: "based on location" }
  ],
  gallery: [
    { src: "img/native-pasta.jpg",        caption: "Native pasta with beef chunks & baked chicken breast" },
    { src: "img/herb-chicken-quinoa.jpg", caption: "Herb-crusted chicken breast with savoury quinoa" },
    { src: "img/beef-tacos.jpg",          caption: "Beef tacos" },
    { src: "img/salmon-rice.jpg",         caption: "Spiced salmon, rice & peppers" },
    { src: "img/caesar-salad.jpg",        caption: "Classic Caesar salad" },
    { src: "img/party-trays.jpg",         caption: "Party trays: fried rice, jollof & moi moi" },
    { src: "img/potato-porridge.jpg",     caption: "Irish potato porridge" },
    { src: "img/canapes.jpg",             caption: "Canapés" },
    { src: "img/lasagne-beetroot.jpg",    caption: "Lasagne & beetroot rolls" },
    { src: "img/gizdodo.jpg",             caption: "Gizdodo" },
    { src: "img/plantain-boats.jpg",      caption: "Stuffed plantain boats" },
    { src: "img/lunch-trio.jpg",          caption: "Lunch for three" },
    { src: "img/basket.jpg",              caption: "Party food basket" },
    { src: "img/vegetable-chicken.jpg",   caption: "Vegetable sauce with chicken" },
    { src: "img/breakfast.jpg",           caption: "Breakfast plate" },
    { src: "img/salmon-spaghetti.jpg",    caption: "Salmon & spaghetti" },
    { src: "img/small-chops.jpg",         caption: "Small chops & sides" },
    { src: "img/plantain-fish.jpg",       caption: "Roast plantain, fish & veg" },
    { src: "img/spread.jpg",              caption: "A day's cooking" },
    { src: "img/bolognese.jpg",           caption: "Spaghetti bolognese" }
  ]
};

/* Shared helpers used by the site and the dashboard */
window.CHEF_FMT = function (n) { return "₦" + Number(n || 0).toLocaleString("en-NG"); };
window.CHEF_ADDON_LABEL = function (a) {
  var f = window.CHEF_FMT;
  switch (a.kind) {
    case "range":  return f(a.price) + "–" + f(a.priceMax);
    case "hourly": return f(a.price) + "/hour";
    case "from":   return "from " + f(a.price);
    case "quote":  return a.quoteText || "on request";
    default:       return f(a.price);
  }
};
window.CHEF_MERGE = function (saved) {
  var d = JSON.parse(JSON.stringify(window.CHEF_DEFAULTS));
  if (!saved || typeof saved !== "object") return d;
  return {
    business: Object.assign(d.business, saved.business || {}),
    oneoff:  Array.isArray(saved.oneoff)  && saved.oneoff.length  ? saved.oneoff  : d.oneoff,
    monthly: Array.isArray(saved.monthly) && saved.monthly.length ? saved.monthly : d.monthly,
    addons:  Array.isArray(saved.addons)  ? saved.addons  : d.addons,
    gallery: Array.isArray(saved.gallery) ? saved.gallery : d.gallery
  };
};
