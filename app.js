// 1. เรียก library ที่ต้องใช้
const express = require('express');
const path = require('path');
const app = express();

// 2. ตั้งค่า
app.set('view engine', 'ejs'); //EJS เป็นตัวสร้างหน้าเว็บ
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// ============================================
// DATA - All fruits organized by category
// ============================================

const allFruits = [
    // === SWEET FRUITS ===
    { id: 1, name: 'Mango', price: 45, image: 'mango.png', category: 'sweet_fruit', desc: 'Sweet golden mango, sun-ripened to tropical perfection.' },
    { id: 2, name: 'Watermelon', price: 60, image: 'watermelon.png', category: 'sweet_fruit', desc: 'Juicy refreshing watermelon, perfect for hot summer days.' },
    { id: 3, name: 'Banana', price: 25, image: 'banana.png', category: 'sweet_fruit', desc: 'Naturally sweet banana, packed with potassium and energy.' },
    { id: 4, name: 'Strawberry', price: 80, image: 'strawberry.png', category: 'sweet_fruit', desc: 'Fresh red strawberries bursting with natural sweetness.' },
    { id: 5, name: 'Longan', price: 65, image: 'longan.png', category: 'sweet_fruit', desc: 'Sweet translucent longan, a beloved tropical treat.' },
    { id: 6, name: 'Durian', price: 150, image: 'durian.png', category: 'sweet_fruit', desc: 'King of fruits with rich creamy texture and bold flavor.' },
    { id: 7, name: 'Melon', price: 50, image: 'melon.png', category: 'sweet_fruit', desc: 'Sweet honeydew melon, refreshingly smooth and delightful.' },
    { id: 8, name: 'Jackfruit', price: 70, image: 'jackfruit.png', category: 'sweet_fruit', desc: 'Tropical jackfruit with honey-sweet golden flesh.' },
    { id: 9, name: 'Rambutan', price: 55, image: 'rambutan.png', category: 'sweet_fruit', desc: 'Exotic hairy rambutan with sweet juicy white flesh.' },
    { id: 10, name: 'Rose Apple', price: 40, image: 'roseapple.png', category: 'sweet_fruit', desc: 'Crisp and mildly sweet rose apple, light and refreshing.' },
    { id: 11, name: 'Peach', price: 75, image: 'peach.png', category: 'sweet_fruit', desc: 'Soft velvety peach with a heavenly sweet aroma.' },
    { id: 12, name: 'Papaya', price: 35, image: 'papaya.png', category: 'sweet_fruit', desc: 'Tropical papaya, buttery smooth with natural sweetness.' },
    { id: 13, name: 'Grape', price: 90, image: 'grape.png', category: 'sweet_fruit', desc: 'Plump sweet grapes, perfect for snacking anytime.' },

    // === SOUR FRUITS ===
    { id: 14, name: 'Lemon', price: 30, image: 'lemon.png', category: 'sour_fruit', desc: 'Zesty fresh lemon, the ultimate citrus kick.' },
    { id: 15, name: 'Green Apple', price: 45, image: 'greenapple.png', category: 'sour_fruit', desc: 'Crisp and tangy green apple with a satisfying crunch.' },
    { id: 16, name: 'Kaffir Lime', price: 25, image: 'kaffirlime.png', category: 'sour_fruit', desc: 'Aromatic kaffir lime, essential for Thai cuisine.' },
    { id: 17, name: 'Tamarind', price: 40, image: 'tamarind.png', category: 'sour_fruit', desc: 'Tangy-sweet tamarind pods with unique complex flavor.' },
    { id: 18, name: 'Calamansi', price: 20, image: 'calamansi.png', category: 'sour_fruit', desc: 'Tiny but mighty calamansi, bursting with citrus tang.' },
    { id: 19, name: 'Star Gooseberry', price: 35, image: 'star gooseberry.png', category: 'sour_fruit', desc: 'Crunchy star gooseberry with a refreshing sour bite.' },
    { id: 20, name: 'Pomelo', price: 65, image: 'pomelo.png', category: 'sour_fruit', desc: 'Giant citrus pomelo with juicy bittersweet segments.' },
    { id: 21, name: 'Passion Fruit', price: 55, image: 'passion fruit.png', category: 'sour_fruit', desc: 'Exotic passion fruit with aromatic tangy pulp.' },
    { id: 22, name: 'Starfruit', price: 30, image: 'starfruit.png', category: 'sour_fruit', desc: 'Beautiful star-shaped fruit with a mild tart flavor.' },
    { id: 23, name: 'Orange', price: 40, image: 'orange.png', category: 'sour_fruit', desc: 'Classic juicy orange, the perfect vitamin C boost.' },

    // === HEALTHY FRUITS ===
    { id: 24, name: 'Kiwi', price: 60, image: 'kiwi.png', category: 'healthy_fruit', desc: 'Vitamin-packed kiwi with vibrant green flesh.' },
    { id: 25, name: 'Avocado', price: 55, image: 'avocado.png', category: 'healthy_fruit', desc: 'Creamy superfood avocado, rich in healthy fats.' },
    { id: 26, name: 'Blueberry', price: 120, image: 'blueberry.png', category: 'healthy_fruit', desc: 'Antioxidant-rich blueberries, tiny but powerful.' },
    { id: 27, name: 'Pomegranate', price: 85, image: 'pomegranate.png', category: 'healthy_fruit', desc: 'Ruby-red pomegranate seeds packed with nutrients.' },
    { id: 28, name: 'Guava', price: 35, image: 'guava.png', category: 'healthy_fruit', desc: 'Nutrient-dense guava with more vitamin C than oranges.' },
    { id: 29, name: 'Dragon Fruit', price: 70, image: 'dragonfruit.png', category: 'healthy_fruit', desc: 'Stunning dragon fruit loaded with fiber and vitamins.' },
    { id: 30, name: 'Mulberry', price: 95, image: 'mulberry.png', category: 'healthy_fruit', desc: 'Antioxidant-rich mulberries, nature\'s superfood.' },
    { id: 31, name: 'Apple', price: 40, image: 'apple.png', category: 'healthy_fruit', desc: 'A classic apple a day keeps the doctor away!' },
    { id: 32, name: 'Pineapple', price: 55, image: 'pineapple.png', category: 'healthy_fruit', desc: 'Tropical pineapple loaded with bromelain enzymes.' },
    { id: 33, name: 'Mangosteen', price: 120, image: 'mixberry.png', category: 'healthy_fruit', desc: 'Queen of fruits with potent antioxidant properties.' },

    // === JUICE FRUITS ===
    { id: 34, name: 'Apple Juice', price: 45, image: 'applejuice.png', category: 'juice_fruit', desc: 'Fresh-pressed apple juice, crisp and naturally sweet.' },
    { id: 35, name: 'Orange Juice', price: 40, image: 'orangejuice.png', category: 'juice_fruit', desc: 'Freshly squeezed OJ, the ultimate morning refresher.' },
    { id: 36, name: 'Lemon Juice', price: 35, image: 'lemonjuice.png', category: 'juice_fruit', desc: 'Tangy lemon juice, perfect for detox and drinks.' },
    { id: 37, name: 'Watermelon Juice', price: 50, image: 'watermelonjuice.png', category: 'juice_fruit', desc: 'Cool watermelon juice, summer in a glass.' },
    { id: 38, name: 'Strawberry Juice', price: 60, image: 'strawberryjuice.png', category: 'juice_fruit', desc: 'Sweet strawberry juice blended to perfection.' },
    { id: 39, name: 'Grape Juice', price: 55, image: 'grapejuice.png', category: 'juice_fruit', desc: 'Rich grape juice with deep fruity flavor.' },
    { id: 40, name: 'Pineapple Juice', price: 45, image: 'pineapplejuice.png', category: 'juice_fruit', desc: 'Tropical pineapple juice, tangy and refreshing.' },
    { id: 41, name: 'Coconut Water', price: 35, image: 'coconutwater.png', category: 'juice_fruit', desc: 'Natural coconut water, the ultimate hydrator.' },
    { id: 42, name: 'Fruit Juice Mix', price: 50, image: 'fruit_juice_ca.png', category: 'juice_fruit', desc: 'A delicious blend of mixed tropical fruit juices.' },
    { id: 43, name: 'Rainbow Smoothie', price: 75, image: 'rainbowsmoothie.png', category: 'juice_fruit', desc: 'Colorful rainbow smoothie packed with fruity goodness.' },

    // === OTHER FRUIT DISHES ===
    { id: 44, name: 'Ice Cream', price: 50, image: 'icecream.png', category: 'other_dish', desc: 'Fruity ice cream made with real fruit and cream.' },
    { id: 45, name: 'Yogurt', price: 45, image: 'yogurt.png', category: 'other_dish', desc: 'Creamy fruit yogurt with fresh fruit toppings.' },
    { id: 46, name: 'Pudding', price: 40, image: 'pudding.png', category: 'other_dish', desc: 'Silky smooth fruit pudding, a delightful dessert.' },
    { id: 47, name: 'Crepe', price: 55, image: 'crepe.png', category: 'other_dish', desc: 'Thin French crepe filled with fresh fruits and cream.' },
    { id: 48, name: 'Jelly', price: 30, image: 'jelly.png', category: 'other_dish', desc: 'Wobbly fruit jelly made with real fruit juice.' },
    { id: 49, name: 'Shave Ice', price: 35, image: 'shaveice.png', category: 'other_dish', desc: 'Fluffy shaved ice topped with fruity syrups.' },
    { id: 50, name: 'Tanghulu', price: 40, image: 'tanghulu.png', category: 'other_dish', desc: 'Candied fruit on a stick, crispy and sweet.' },
    { id: 51, name: 'Mix Berry Bowl', price: 65, image: 'mixberry.png', category: 'other_dish', desc: 'Fresh mixed berry bowl with granola and honey.' },
];

const categories = [
    { name: 'All Fruit', slug: 'all', color: '#7EC8E3', emoji: '🍎', image: 'all_fruit_ca.png', desc: 'Browse our complete collection of fresh fruits, juices, and treats from around the world.' },
    { name: 'Sweet Fruit', slug: 'sweet_fruit', color: '#FFB5C2', emoji: '🍑', image: 'sweet_fruit_ca.png', desc: 'Indulge in nature\'s candy – sweet fruits picked at peak ripeness.' },
    { name: 'Sour Fruit', slug: 'sour_fruit', color: '#B8E986', emoji: '🍋', image: 'sour_fruit_ca.png', desc: 'Tangy and zesty fruits that awaken your taste buds instantly.' },
    { name: 'Healthy Fruit', slug: 'healthy_fruit', color: '#87CEEB', emoji: '🥝', image: 'healthy_fruit_ca.png', desc: 'Nutrient-packed superfruits for your wellness journey.' },
    { name: 'Juice Fruit', slug: 'juice_fruit', color: '#FFD700', emoji: '🧃', image: 'fruit_juice_ca.png', desc: 'Fresh-squeezed juices and smoothies made from real fruits.' },
    { name: 'Other Fruit Dish', slug: 'other_dish', color: '#DDA0DD', emoji: '🍨', image: 'icecream.png', desc: 'Creative fruit-based desserts, treats, and delicious dishes.' },
];

const bestsellers = [
    allFruits.find(f => f.name === 'Durian'),
    allFruits.find(f => f.name === 'Mango'),
    allFruits.find(f => f.name === 'Watermelon'),
    allFruits.find(f => f.name === 'Blueberry'),
    allFruits.find(f => f.name === 'Pineapple'),
];

const bestsellerColors = ['#A8D86E', '#FFD93D', '#FF6B6B', '#C77DFF', '#FFAB40'];
bestsellers.forEach((item, i) => { if(item) item.cardColor = bestsellerColors[i]; });

// ============================================
// ROUTES
// ============================================

app.get('/', (req, res) => {
    res.render('index', { bestsellers, categories, allFruits });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/cart', (req, res) => {
    // Demo cart items
    const cartItems = [
        { ...allFruits.find(f => f.name === 'Durian'), qty: 1 },
        { ...allFruits.find(f => f.name === 'Mango'), qty: 3 },
        { ...allFruits.find(f => f.name === 'Watermelon'), qty: 1 },
        { ...allFruits.find(f => f.name === 'Rainbow Smoothie'), qty: 2 },
    ];
    res.render('cart', { cartItems });
});

app.get('/categories', (req, res) => {
    const activeCategory = req.query.cat || 'all';
    let filteredFruits = allFruits;
    if (activeCategory !== 'all') {
        filteredFruits = allFruits.filter(f => f.category === activeCategory);
    }
    res.render('categories', { categories, allFruits: filteredFruits, activeCategory });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Fruit Shop running on http://localhost:${PORT}`);
});