import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/language_provider.dart';
import '../../data/food_data.dart';
import '../../state/cart_provider.dart';
import '../widgets/food_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _cat = 'all';

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final cart = context.watch<CartProvider>();
    final filtered = _cat == 'all' ? foods : foods.where((f) => f.category == _cat).toList();

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Icon(Icons.location_on, size: 14, color: Color(0xFFFF6B2C)),
                  SizedBox(width: 4),
                  Text('Deliver to', style: TextStyle(fontSize: 11, color: Colors.white54)),
                ]),
                SizedBox(height: 2),
                Text('Colombo 03, Sri Lanka', style: TextStyle(fontWeight: FontWeight.w700)),
              ]),
              const Spacer(),
              Stack(children: [
                _circleIcon(Icons.shopping_bag_outlined),
                if (cart.count > 0)
                  Positioned(
                    right: 0, top: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: const BoxDecoration(color: Color(0xFFFF3B3B), shape: BoxShape.circle),
                      child: Text('${cart.count}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800)),
                    ),
                  ),
              ]),
              const SizedBox(width: 8),
              _circleIcon(Icons.notifications_none),
            ]),
            const SizedBox(height: 22),
            RichText(text: const TextSpan(
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white, height: 1.15),
              children: [
                TextSpan(text: "Hi there 👋\nWhat's making you "),
                TextSpan(text: 'hungry?', style: TextStyle(color: Color(0xFFFF6B2C))),
              ],
            )),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF1B1B1B),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(children: [
                const Icon(Icons.search, color: Colors.white54),
                const SizedBox(width: 10),
                Text(lang.t('home.searchPlaceholder'),
                    style: const TextStyle(color: Colors.white54)),
              ]),
            ),
            const SizedBox(height: 20),
            _promoBanner(),
            const SizedBox(height: 24),
            Text(lang.t('home.categories'),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
            const SizedBox(height: 12),
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final c = categories[i];
                  final active = _cat == c['id'];
                  return GestureDetector(
                    onTap: () => setState(() => _cat = c['id']!),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: active ? const Color(0xFFFF6B2C) : const Color(0xFF1B1B1B),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text('${c['emoji']}  ${c['name']}',
                          style: TextStyle(fontWeight: FontWeight.w700, color: active ? Colors.white : Colors.white70)),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            Row(children: [
              const Icon(Icons.local_fire_department, color: Color(0xFFFF6B2C), size: 20),
              const SizedBox(width: 6),
              Text(lang.t('home.popular'),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
            ]),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filtered.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.68,
              ),
              itemBuilder: (_, i) => FoodCard(food: filtered[i]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _circleIcon(IconData icon) => Container(
        height: 42, width: 42,
        decoration: BoxDecoration(color: const Color(0xFF1B1B1B), borderRadius: BorderRadius.circular(14)),
        child: Icon(icon, size: 20),
      );

  Widget _promoBanner() => Container(
        height: 120,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(22),
          gradient: const LinearGradient(colors: [Color(0xFFFF6B2C), Color(0xFFFF9152)]),
          boxShadow: [BoxShadow(color: const Color(0xFFFF6B2C).withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 10))],
        ),
        padding: const EdgeInsets.all(18),
        child: const Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('50% OFF first order',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
          SizedBox(height: 4),
          Text('Use code WELCOME50 at checkout',
              style: TextStyle(color: Colors.white70)),
        ]),
      );
}
