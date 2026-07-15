import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/language_provider.dart';
import '../../data/food_data.dart';
import '../../state/cart_provider.dart';

class FoodDetailScreen extends StatelessWidget {
  const FoodDetailScreen({super.key, required this.foodId});

  final String foodId;

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('Food details')),
      body: FutureBuilder<Food>(
        future: FoodRepository.food(foodId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFFFF6B2C)),
            );
          }
          if (!snapshot.hasData) {
            return const Center(child: Text('Food item not found'));
          }
          final food = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Container(
                height: 180,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFF1B1B1B),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Text(food.emoji, style: const TextStyle(fontSize: 82)),
              ),
              const SizedBox(height: 18),
              Text(food.name,
                  style: const TextStyle(
                      fontSize: 26, fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Text(food.restaurant,
                  style: const TextStyle(color: Colors.white60)),
              const SizedBox(height: 12),
              Row(children: [
                const Icon(Icons.star, size: 18, color: Color(0xFFFF6B2C)),
                const SizedBox(width: 4),
                Text('${food.rating}'),
                const SizedBox(width: 16),
                const Icon(Icons.access_time, size: 18, color: Colors.white54),
                const SizedBox(width: 4),
                Text(food.time),
              ]),
              const SizedBox(height: 18),
              Text(formatLkr(food.price, lang.t('common.currency')),
                  style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFFF6B2C))),
              const SizedBox(height: 18),
              const Text('Description',
                  style: TextStyle(fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Text(food.description.isEmpty
                  ? 'Freshly prepared by ${food.restaurant}.'
                  : food.description),
              const SizedBox(height: 18),
              const Text('Ingredients',
                  style: TextStyle(fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Text(food.ingredients.isEmpty ? 'See restaurant for details.' : food.ingredients),
            ],
          );
        },
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton.icon(
            onPressed: () {
              context.read<CartProvider>().add(foodId);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(lang.t('cart.added')),
                  backgroundColor: const Color(0xFFFF6B2C),
                ),
              );
            },
            icon: const Icon(Icons.add_shopping_cart),
            label: const Text('Add to cart'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF6B2C),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(54),
            ),
          ),
        ),
      ),
    );
  }
}
