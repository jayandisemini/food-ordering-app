class Food {
  final String id;
  final String name;
  final String restaurant;
  final String category;
  final double rating;
  final String time;
  final int price;
  final String emoji;

  const Food({
    required this.id,
    required this.name,
    required this.restaurant,
    required this.category,
    required this.rating,
    required this.time,
    required this.price,
    required this.emoji,
  });
}

const List<Map<String, String>> categories = [
  {'id': 'all', 'name': 'All', 'emoji': '🍽️'},
  {'id': 'pizza', 'name': 'Pizza', 'emoji': '🍕'},
  {'id': 'burgers', 'name': 'Burgers', 'emoji': '🍔'},
  {'id': 'rice', 'name': 'Rice & Curry', 'emoji': '🍛'},
  {'id': 'kottu', 'name': 'Kottu', 'emoji': '🥘'},
  {'id': 'desserts', 'name': 'Desserts', 'emoji': '🍰'},
  {'id': 'healthy', 'name': 'Healthy', 'emoji': '🥗'},
  {'id': 'beverages', 'name': 'Beverages', 'emoji': '🥤'},
];

const List<Food> foods = [
  Food(id: '1', name: 'Margherita Pizza', restaurant: 'Pizza Hut', category: 'pizza', rating: 4.8, time: '20-25 min', price: 2400, emoji: '🍕'),
  Food(id: '2', name: 'Spicy Chicken Burger', restaurant: 'Colombo Burger Co.', category: 'burgers', rating: 4.7, time: '15-20 min', price: 1650, emoji: '🍔'),
  Food(id: '3', name: 'Cheese Kottu + Egg', restaurant: 'Kottu King', category: 'kottu', rating: 4.6, time: '15-25 min', price: 950, emoji: '🥘'),
  Food(id: '4', name: 'Chicken Rice & Curry', restaurant: 'Upali\'s', category: 'rice', rating: 4.9, time: '20-30 min', price: 850, emoji: '🍛'),
  Food(id: '5', name: 'Salmon Nigiri Set', restaurant: 'Nihon Bashi', category: 'healthy', rating: 4.9, time: '25-35 min', price: 3200, emoji: '🍣'),
  Food(id: '6', name: 'King Coconut (Thambili)', restaurant: 'Fresh Stop', category: 'beverages', rating: 4.5, time: '5-10 min', price: 350, emoji: '🥥'),
];

String formatLkr(int v, String currency) =>
    '$currency ${v.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},')}';
