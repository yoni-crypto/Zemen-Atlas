const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Region = require('./models/Region');
const Ruler = require('./models/Ruler');
const Battle = require('./models/Battle');
const Person = require('./models/Person');
const Place = require('./models/Place');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedDatabase() {
  try {
    await Promise.all([
      Region.deleteMany({}),
      Ruler.deleteMany({}),
      Battle.deleteMany({}),
      Person.deleteMany({}),
      Place.deleteMany({}),
      Product.deleteMany({})
    ]);

    const regionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../frontend/data/regions.json'), 'utf8'));
    const rulersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../frontend/data/rulers.json'), 'utf8'));
    const battlesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../frontend/data/battles.json'), 'utf8'));
    const peopleData = JSON.parse(fs.readFileSync(path.join(__dirname, '../frontend/data/people.json'), 'utf8'));
    const placesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../frontend/data/places.json'), 'utf8'));
    const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../frontend/data/products.json'), 'utf8'));

    await Promise.all([
      Region.insertMany(regionsData),
      Ruler.insertMany(rulersData),
      Battle.insertMany(battlesData),
      Person.insertMany(peopleData),
      Place.insertMany(placesData),
      Product.insertMany(productsData)
    ]);

    console.log('Database seeded successfully!');
    console.log(`Inserted ${regionsData.length} regions`);
    console.log(`Inserted ${rulersData.length} rulers`);
    console.log(`Inserted ${battlesData.length} battles`);
    console.log(`Inserted ${peopleData.length} people`);
    console.log(`Inserted ${placesData.length} places`);
    console.log(`Inserted ${productsData.length} products`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();