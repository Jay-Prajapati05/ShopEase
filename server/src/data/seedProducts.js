/**
 * Realistic E-Commerce Seed Catalog for ShopEase
 * Inspired by top Indian e-commerce leaders: Amazon, Flipkart, Myntra, Ajio.
 * Includes multiple high-resolution images, originalPrice (MRP), ratings, and verified reviews.
 */

export const seedProducts = [
  // =========================================================================
  // 1. SMARTPHONES
  // =========================================================================
  {
    name: "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
    description: "iPhone 15 Pro. Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile pro camera system with 48MP main sensor.",
    price: 127990,
    originalPrice: 134900,
    category: "Smartphones",
    brand: "Apple",
    countInStock: 12,
    images: [
      {
        url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/iphone15pro_1",
      },
      {
        url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/iphone15pro_2",
      },
    ],
    rating: 4.8,
    numReviews: 142,
  },
  {
    name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)",
    description: "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Powered by Galaxy AI with Circle to Search, Live Translate, and Note Assist.",
    price: 119999,
    originalPrice: 134999,
    category: "Smartphones",
    brand: "Samsung",
    countInStock: 8,
    images: [
      {
        url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/s24ultra_1",
      },
      {
        url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/s24ultra_2",
      },
    ],
    rating: 4.7,
    numReviews: 98,
  },
  {
    name: "OnePlus 12 5G (Silky Black, 256 GB)",
    description: "Powered by Qualcomm Snapdragon 8 Gen 3 Mobile Platform, with 4th Gen Hasselblad Camera System for Mobile, 5400 mAh Battery with 100W SUPERVOOC charging.",
    price: 64999,
    originalPrice: 69999,
    category: "Smartphones",
    brand: "OnePlus",
    countInStock: 15,
    images: [
      {
        url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/oneplus12_1",
      },
      {
        url: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/oneplus12_2",
      },
    ],
    rating: 4.6,
    numReviews: 76,
  },
  {
    name: "Google Pixel 8 (Hazel, 128 GB)",
    description: "The helpful phone engineered by Google. The new Google Tensor G3 chip is custom-designed with Google AI for cutting-edge photo and video features, and smarter ways to help throughout the day.",
    price: 62999,
    originalPrice: 75999,
    category: "Smartphones",
    brand: "Google",
    countInStock: 3,
    images: [
      {
        url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/pixel8_1",
      },
      {
        url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/pixel8_2",
      },
    ],
    rating: 4.5,
    numReviews: 54,
  },

  // =========================================================================
  // 2. LAPTOPS
  // =========================================================================
  {
    name: "Apple MacBook Air 13-inch (M3 Chip, 8GB Unified Memory, 256GB SSD)",
    description: "Strikingly thin and fast MacBook Air with M3 chip. Delivers up to 18 hours of battery life and a stunning Liquid Retina display with 500 nits of brightness.",
    price: 104900,
    originalPrice: 114900,
    category: "Laptops",
    brand: "Apple",
    countInStock: 10,
    images: [
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/macbookair_1",
      },
      {
        url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/macbookair_2",
      },
    ],
    rating: 4.9,
    numReviews: 210,
  },
  {
    name: "Dell XPS 13 Plus Laptop (Intel Core i7 13th Gen, 16GB RAM, 512GB SSD)",
    description: "Featuring a seamless glass touchpad, capacitive touch function keys, and zero-lattice edge-to-edge keyboard. 13.4-inch OLED 3.5K InfinityEdge Touch display.",
    price: 149990,
    originalPrice: 174990,
    category: "Laptops",
    brand: "Dell",
    countInStock: 5,
    images: [
      {
        url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/dellxps_1",
      },
      {
        url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/dellxps_2",
      },
    ],
    rating: 4.7,
    numReviews: 64,
  },
  {
    name: "HP Pavilion 15 Gaming Laptop (AMD Ryzen 5, 16GB RAM, RTX 3050, 512GB SSD)",
    description: "Elevate your gaming and multitasking experience. High-grade graphics and processing power for gaming and multi-tasking, plus improved thermal cooling for overall performance and stability.",
    price: 68990,
    originalPrice: 84990,
    category: "Laptops",
    brand: "HP",
    countInStock: 14,
    images: [
      {
        url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/hppavilion_1",
      },
      {
        url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/hppavilion_2",
      },
    ],
    rating: 4.4,
    numReviews: 112,
  },
  {
    name: "Lenovo IdeaPad Slim 3 Thin & Light Laptop (12th Gen Intel Core i5)",
    description: "Sleek and portable laptop featuring 15.6-inch FHD Antiglare display, 16GB RAM, 512GB NVMe SSD, Dolby Audio stereo speakers, and rapid charge battery.",
    price: 49990,
    originalPrice: 66990,
    category: "Laptops",
    brand: "Lenovo",
    countInStock: 20,
    images: [
      {
        url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/ideapad_1",
      },
      {
        url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/ideapad_2",
      },
    ],
    rating: 4.3,
    numReviews: 87,
  },

  // =========================================================================
  // 3. AUDIO & HEADPHONES
  // =========================================================================
  {
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "Industry-leading noise cancellation with two processors and 8 microphones. Magnificent Sound, engineered to perfection with the new Integrated Processor V1. Up to 30-hour battery life.",
    price: 29990,
    originalPrice: 34990,
    category: "Audio",
    brand: "Sony",
    countInStock: 18,
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/sonyxm5_1",
      },
      {
        url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/sonyxm5_2",
      },
    ],
    rating: 4.8,
    numReviews: 320,
  },
  {
    name: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)",
    description: "Up to 2x more Active Noise Cancellation than the previous generation. Transparency mode lets you comfortably hear and interact with the world around you. Personalized Spatial Audio.",
    price: 22999,
    originalPrice: 24900,
    category: "Audio",
    brand: "Apple",
    countInStock: 16,
    images: [
      {
        url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/airpodspro_1",
      },
      {
        url: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/airpodspro_2",
      },
    ],
    rating: 4.7,
    numReviews: 240,
  },
  {
    name: "boAt Rockerz 550 Over-Ear Wireless Bluetooth Headphone",
    description: "50mm dynamic drivers bring all-out immersive audio output. 20 hours of non-stop playback, physical noise isolation cushions, and sleek ergonomic styling.",
    price: 1799,
    originalPrice: 4999,
    category: "Audio",
    brand: "boAt",
    countInStock: 40,
    images: [
      {
        url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/boatrockerz_1",
      },
      {
        url: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/boatrockerz_2",
      },
    ],
    rating: 4.2,
    numReviews: 185,
  },
  {
    name: "JBL Flip 6 Wireless Portable Bluetooth Speaker",
    description: "Powerful sound and deep bass. IP67 waterproof and dustproof so you can bring your speaker anywhere. 12 Hours of Playtime with PartyBoost pairing.",
    price: 9999,
    originalPrice: 13999,
    category: "Audio",
    brand: "JBL",
    countInStock: 22,
    images: [
      {
        url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/jblflip_1",
      },
      {
        url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/jblflip_2",
      },
    ],
    rating: 4.6,
    numReviews: 95,
  },

  // =========================================================================
  // 4. FASHION & APPAREL
  // =========================================================================
  {
    name: "Levi's Men's 511 Slim Fit Stretchable Denim Jeans",
    description: "A modern slim with room to move. Added stretch for all-day comfort. Lean look with added comfort, a great alternative to skinny jeans. Crafted with premium denim fabric.",
    price: 2499,
    originalPrice: 4199,
    category: "Fashion",
    brand: "Levi's",
    countInStock: 25,
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/levis511_1",
      },
      {
        url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/levis511_2",
      },
    ],
    rating: 4.4,
    numReviews: 145,
  },
  {
    name: "Peter England Men's Classic Cotton Regular Fit Formal Shirt",
    description: "Crafted from 100% premium breathable cotton, this classic full-sleeve formal shirt is tailored to perfection for office wear, interviews, and celebrations.",
    price: 1199,
    originalPrice: 1999,
    category: "Fashion",
    brand: "Peter England",
    countInStock: 30,
    images: [
      {
        url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/peterengland_1",
      },
      {
        url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/peterengland_2",
      },
    ],
    rating: 4.3,
    numReviews: 88,
  },
  {
    name: "Zara Men's Pure Cotton Oversized Streetwear Hoodie",
    description: "Heavyweight 380 GSM brushed fleece hoodie with a relaxed oversized drape, kangaroo front pocket, drop shoulders, and ribbed cuffs. Designed for cozy urban style.",
    price: 2990,
    originalPrice: 3990,
    category: "Fashion",
    brand: "Zara",
    countInStock: 8,
    images: [
      {
        url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/zarahoodie_1",
      },
      {
        url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/zarahoodie_2",
      },
    ],
    rating: 4.7,
    numReviews: 62,
  },
  {
    name: "FabIndia Men's Pure Handloom Cotton Long Kurta",
    description: "Handcrafted pure cotton traditional long kurta with mandarin collar and side slits. Breathable and comfortable for festive occasions and family gatherings.",
    price: 1899,
    originalPrice: 2499,
    category: "Fashion",
    brand: "FabIndia",
    countInStock: 15,
    images: [
      {
        url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/fabindia_1",
      },
      {
        url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/fabindia_2",
      },
    ],
    rating: 4.5,
    numReviews: 44,
  },

  // =========================================================================
  // 5. FOOTWEAR
  // =========================================================================
  {
    name: "Nike Air Max 270 Men's Lifestyle & Running Shoes",
    description: "Nike's biggest heel Air unit yet delivers ultra-soft cushioning that feels as impossible as it looks. Mesh details provide an airy, lightweight feel.",
    price: 11495,
    originalPrice: 13995,
    category: "Footwear",
    brand: "Nike",
    countInStock: 9,
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/nikeairmax_1",
      },
      {
        url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/nikeairmax_2",
      },
    ],
    rating: 4.8,
    numReviews: 215,
  },
  {
    name: "Puma Nitro Velocity 2 Men's Performance Running Shoes",
    description: "An all-in-one neutral running shoe for any distance. The Velocity Nitro 2 is a lightweight and responsive update to the Run PUMA roster. Featuring premium NITRO foam.",
    price: 6499,
    originalPrice: 10999,
    category: "Footwear",
    brand: "Puma",
    countInStock: 14,
    images: [
      {
        url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/pumanitro_1",
      },
      {
        url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/pumanitro_2",
      },
    ],
    rating: 4.5,
    numReviews: 78,
  },
  {
    name: "Adidas Originals Superstar Classic White Leather Sneakers",
    description: "Originally made for basketball courts in the '70s. Celebrated by hip hop royalty in the '80s. The adidas Superstar shoe is now a lifestyle staple for streetwear enthusiasts.",
    price: 7199,
    originalPrice: 8999,
    category: "Footwear",
    brand: "Adidas",
    countInStock: 16,
    images: [
      {
        url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/superstar_1",
      },
      {
        url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/superstar_2",
      },
    ],
    rating: 4.7,
    numReviews: 180,
  },
  {
    name: "Woodland Men's Camel Genuine Leather Trekking Boots",
    description: "Heavy-duty outdoor and trekking boots made from genuine nubuck leather with rugged rubber outsoles. Rust-resistant hardware and grooved lugs provide all-terrain traction.",
    price: 4495,
    originalPrice: 5995,
    category: "Footwear",
    brand: "Woodland",
    countInStock: 11,
    images: [
      {
        url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/woodland_1",
      },
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/woodland_2",
      },
    ],
    rating: 4.6,
    numReviews: 130,
  },

  // =========================================================================
  // 6. ACCESSORIES & WATCHES
  // =========================================================================
  {
    name: "Fossil Grant Chronograph Blue Dial Brown Leather Watch",
    description: "Modeled after vintage clocks, our Roman numerals are uniquely designed to provide artistic balance to the dial. Features a rich blue sunray dial and supple brown leather strap.",
    price: 8495,
    originalPrice: 13995,
    category: "Accessories",
    brand: "Fossil",
    countInStock: 7,
    images: [
      {
        url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/fossilwatch_1",
      },
      {
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/fossilwatch_2",
      },
    ],
    rating: 4.6,
    numReviews: 94,
  },
  {
    name: "Ray-Ban Aviator Classic Gold Frame Green G-15 Sunglasses",
    description: "Originally designed for U.S. aviators in 1937. Aviator Classic sunglasses are a timeless model that combines great aviator styling with exceptional quality, performance and comfort.",
    price: 8990,
    originalPrice: 10990,
    category: "Accessories",
    brand: "Ray-Ban",
    countInStock: 12,
    images: [
      {
        url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/rayban_1",
      },
      {
        url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/rayban_2",
      },
    ],
    rating: 4.8,
    numReviews: 165,
  },
  {
    name: "Fastrack Limitless FS1 Pro Smartwatch with 1.96-inch AMOLED Display",
    description: "Largest 1.96-inch Super AMOLED Arched Display with 410x502 Pixel Resolution, SingleSync BT Calling, NitroFast Charging, 110+ Sports Modes, and 200+ Watch Faces.",
    price: 2499,
    originalPrice: 7995,
    category: "Accessories",
    brand: "Fastrack",
    countInStock: 25,
    images: [
      {
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/fastrack_1",
      },
      {
        url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/fastrack_2",
      },
    ],
    rating: 4.3,
    numReviews: 128,
  },
  {
    name: "WildHorn RFID Protected Genuine Hunter Leather Wallet for Men",
    description: "Handcrafted from genuine hunter leather. Equipped with advanced RFID secure technology to block unauthorized scans. Features 9 card slots, 2 currency compartments, and a coin pocket.",
    price: 799,
    originalPrice: 1999,
    category: "Accessories",
    brand: "WildHorn",
    countInStock: 35,
    images: [
      {
        url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/wildhorn_1",
      },
      {
        url: "https://images.unsplash.com/photo-1606503825008-909a67e75429?auto=format&fit=crop&w=800&q=80",
        public_id: "seed/wildhorn_2",
      },
    ],
    rating: 4.5,
    numReviews: 190,
  },
];

