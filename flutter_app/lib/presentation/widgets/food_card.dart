import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/language_provider.dart';
import '../../data/food_data.dart';
import '../../state/cart_provider.dart';
import '../screens/food_detail_screen.dart';

class FoodCard extends StatelessWidget {
  final Food food;

  const FoodCard({super.key, required this.food});

  @override
  Widget build(BuildContext context) {
    final lang = context.read<LanguageProvider>();
    final cart = context.read<CartProvider>();

    return Material(
      color: const Color(0xFF1B1B1B),
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => FoodDetailScreen(foodId: food.id)),
        ),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.04)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 90,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFF252525),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(food.emoji, style: const TextStyle(fontSize: 42)),
              ),
              const SizedBox(height: 10),
              Text(
                food.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style:
                    const TextStyle(fontWeight: FontWeight.w800, height: 1.2),
              ),
              const SizedBox(height: 2),
              Text(
                food.restaurant,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.white.withOpacity(0.55),
                ),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.star,
                      size: 12, color: Color(0xFFFF6B2C)),
                  const SizedBox(width: 2),
                  Text(
                    '${food.rating}',
                    style: const TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.access_time,
                      size: 12, color: Colors.white54),
                  const SizedBox(width: 2),
                  Expanded(
                    child: Text(
                      food.time,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Colors.white54,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    formatLkr(food.price, lang.t('common.currency')),
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFFF6B2C),
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      cart.add(food.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: const Color(0xFFFF6B2C),
                          content: Text(lang.t('cart.added')),
                          duration: const Duration(milliseconds: 1200),
                        ),
                      );
                    },
                    style: IconButton.styleFrom(
                      backgroundColor: const Color(0xFFFF6B2C),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(32, 32),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    icon: const Icon(Icons.add_shopping_cart, size: 16),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
