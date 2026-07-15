import 'package:supabase_flutter/supabase_flutter.dart';

class Food {
  final String id;
  final String name;
  final String restaurant;
  final String category;
  final double rating;
  final String time;
  final int price;
  final String emoji;
  final String description;
  final String ingredients;

  const Food({
    required this.id,
    required this.name,
    required this.restaurant,
    required this.category,
    required this.rating,
    required this.time,
    required this.price,
    required this.emoji,
    required this.description,
    required this.ingredients,
  });

  factory Food.fromRow(Map<String, dynamic> row) => Food(
        id: row['id'].toString(),
        name: row['name'] as String? ?? '',
        restaurant: row['restaurant_name'] as String? ?? '',
        category: row['category_id'] as String? ?? '',
        rating: ((row['rating'] as num?) ?? 0).toDouble(),
        time: row['time_estimate'] as String? ?? '',
        price: ((row['price'] as num?) ?? 0).toInt(),
        emoji: row['emoji'] as String? ?? 'food',
        description: row['description'] as String? ?? '',
        ingredients: row['ingredients'] as String? ?? '',
      );
}

class FoodCategory {
  final String id;
  final String name;
  final String emoji;

  const FoodCategory(this.id, this.name, this.emoji);

  factory FoodCategory.fromRow(Map<String, dynamic> row) => FoodCategory(
        row['id'].toString(),
        row['name'] as String? ?? '',
        row['emoji'] as String? ?? 'food',
      );
}

class FoodRepository {
  static final _db = Supabase.instance.client;

  static Future<List<FoodCategory>> categories() async {
    final rows = await _db.from('categories').select().order('name');
    return (rows as List)
        .map((e) => FoodCategory.fromRow(e))
        .where((c) => c.id != 'all')
        .toList();
  }

  static Future<List<Food>> foods({String? query, String? category}) async {
    final rows = await _db.from('food_items').select().order('name');
    var items = (rows as List).map((e) => Food.fromRow(e)).toList();
    if (category != null && category != 'all') {
      items = items.where((f) => f.category == category).toList();
    }
    if (query != null && query.trim().isNotEmpty) {
      final q = query.toLowerCase();
      items = items
          .where((f) =>
              f.name.toLowerCase().contains(q) ||
              f.restaurant.toLowerCase().contains(q))
          .toList();
    }
    return items;
  }

  static Future<Food> food(String id) async {
    final row = await _db.from('food_items').select().eq('id', id).single();
    return Food.fromRow(row);
  }
}

String formatLkr(int v, String currency) =>
    '$currency ${v.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},')}';
