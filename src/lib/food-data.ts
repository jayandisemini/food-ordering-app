import pizza from "@/assets/food-pizza.jpg";
import burger from "@/assets/food-burger.jpg";
import kottu from "@/assets/food-kottu.jpg";
import dessert from "@/assets/food-dessert.jpg";
import salmon from "@/assets/food-salmon.jpg";
import bowl from "@/assets/food-bowl.jpg";
import chickenRice from "@/assets/food-chicken-rice.jpg";
import fishRice from "@/assets/food-fish-rice.jpg";
import thambili from "@/assets/food-thambili.jpg";
import avocado from "@/assets/food-avocado.jpg";

export type Food = {
  id: string;
  name: string;
  nameKey?: string;
  descKey?: string;
  restaurant: string;
  price: number;
  deliveryFee: number;
  rating: number;
  time: string;
  image: string;
  category: string;
  description: string;
  tags: string[];
};


export const formatLkr = (value: number) =>
  `Rs ${Math.round(value).toLocaleString("en-LK")}`;

export const categories = [
  { id: "all", name: "All", emoji: "🍽️" },
  { id: "pizza", name: "Pizza", emoji: "🍕" },
  { id: "burgers", name: "Burgers", emoji: "🍔" },
  { id: "rice", name: "Rice & Curry", emoji: "🍛" },
  { id: "kottu", name: "Kottu", emoji: "🔥" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
  { id: "healthy", name: "Healthy", emoji: "🥗" },
  { id: "beverages", name: "Beverages", emoji: "🥤" },
];

export const foods: Food[] = [
  {
    id: "1",
    name: "Sri Lankan Chicken Rice & Curry",
    nameKey: "foodItems.chickenRice",
    descKey: "foodItems.chickenRiceDesc",
    restaurant: "Upali's by Nawaloka",
    price: 1200,
    deliveryFee: 150,
    rating: 4.9,
    time: "15–20 min",
    image: chickenRice,
    category: "rice",
    description: "Steamed red samba rice served with spicy devilled chicken, dhal curry, coconut pol sambol, papadam & gotukola mallum.",
    tags: ["Bestseller", "Local", "Spicy"],
  },
  {
    id: "2",
    name: "Special Ceylon Chicken Kottu",
    restaurant: "Colombo Street Kitchen",
    price: 1450,
    deliveryFee: 150,
    rating: 4.8,
    time: "20–25 min",
    image: kottu,
    category: "kottu",
    description: "Chopped godhamba roti tossed on hot griddle with curried chicken, egg, leeks, and roasted Ceylon spices.",
    tags: ["Local", "Spicy", "Bestseller"],
  },
  {
    id: "3",
    name: "Sri Lankan Egg & String Hoppers",
    nameKey: "foodItems.fishRice",
    descKey: "foodItems.fishRiceDesc",
    restaurant: "Ceylon Spice Garden",
    price: 1100,
    deliveryFee: 150,
    rating: 4.8,
    time: "15–20 min",
    image: fishRice,
    category: "rice",
    description: "Crispy bowl egg hopper served with string hoppers (idiyappam), spicy lunu miris sambal, and coconut milk kiri hodi.",
    tags: ["Local", "Breakfast"],
  },
  {
    id: "4",
    name: "Fresh King Coconut (Thambili)",
    nameKey: "foodItems.thambili",
    descKey: "foodItems.thambiliDesc",
    restaurant: "Tropical Sips",
    price: 250,
    deliveryFee: 0,
    rating: 4.9,
    time: "5–10 min",
    image: thambili,
    category: "beverages",
    description: "100% natural organic Sri Lankan golden king coconut water, served chilled.",
    tags: ["Natural", "Hydrating"],
  },
  {
    id: "5",
    name: "Pepperoni Supreme Pizza",
    restaurant: "Napoli Wood Fired",
    price: 2200,
    deliveryFee: 150,
    rating: 4.8,
    time: "20–25 min",
    image: pizza,
    category: "pizza",
    description: "Hand-stretched sourdough crust, San Marzano tomato sauce, aged mozzarella, double pepperoni and fresh basil.",
    tags: ["Spicy", "Popular"],
  },
  {
    id: "6",
    name: "Smash Cheeseburger",
    restaurant: "Ember & Oak",
    price: 1800,
    deliveryFee: 0,
    rating: 4.9,
    time: "15–20 min",
    image: burger,
    category: "burgers",
    description: "Two crispy-edged smashed patties, melt American cheese, pickles, house sauce, toasted brioche bun.",
    tags: ["New", "Bestseller"],
  },
  {
    id: "7",
    name: "Molten Lava Cake",
    restaurant: "Maison Chocolat",
    price: 950,
    deliveryFee: 150,
    rating: 4.9,
    time: "15 min",
    image: dessert,
    category: "desserts",
    description: "Warm dark chocolate cake with flowing cocoa center, fresh berries, and vanilla bean ice cream.",
    tags: ["Sweet"],
  },
  {
    id: "8",
    name: "Grilled Atlantic Salmon",
    restaurant: "Harbor & Salt",
    price: 2900,
    deliveryFee: 250,
    rating: 4.8,
    time: "25–30 min",
    image: salmon,
    category: "healthy",
    description: "Wild-caught salmon charred over oak with rosemary, lemon brown butter, and pickled shallots.",
    tags: ["Premium", "Healthy"],
  },
  {
    id: "9",
    name: "Garden Buddha Bowl",
    restaurant: "Greens & Grains",
    price: 1650,
    deliveryFee: 0,
    rating: 4.6,
    time: "15–20 min",
    image: bowl,
    category: "healthy",
    description: "Tri-color quinoa, roasted chickpeas, ripe avocado, baby spinach, sesame greens and lemon-tahini drizzle.",
    tags: ["Vegan", "Healthy"],
  },
  {
    id: "10",
    name: "Creamy Avocado Juice",
    nameKey: "foodItems.avocado",
    descKey: "foodItems.avocadoDesc",
    restaurant: "Tropical Sips",
    price: 450,
    deliveryFee: 150,
    rating: 4.6,
    time: "10–15 min",
    image: avocado,
    category: "beverages",
    description: "Blend of ripe Sri Lankan avocados, fresh condensed milk, and honey.",
    tags: ["Creamy", "Fresh"],
  },
];

export const findFood = (id: string) => foods.find((f) => f.id === id);
