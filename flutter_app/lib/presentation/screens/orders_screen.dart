import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/language_provider.dart';
import '../../data/food_data.dart';
import '../../state/cart_provider.dart';

class _Order {
  final String id, restaurant, items, status, date, foodId;
  final int total;
  final String? eta;
  const _Order(this.id, this.restaurant, this.items, this.total, this.status, this.date, this.foodId, [this.eta]);
}

const _active = [
  _Order('ORD-7829', 'Colombo Burger Co.', 'Spicy Chicken Burger + Fries', 2450, 'On the way', 'Today', '2', '8 min'),
];
const _past = [
  _Order('ORD-7721', 'Nihon Bashi', 'Salmon Nigiri Set', 3200, 'Delivered', 'Yesterday', '5'),
  _Order('ORD-7614', 'Kottu King', 'Cheese Kottu + Egg', 950, 'Delivered', 'Jun 14', '3'),
  _Order('ORD-7533', 'Taco Bell Colombo', 'Crunchwrap Supreme', 1800, 'Cancelled', 'Jun 10', '2'),
];

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final Map<String, int> _ratings = {};

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final currency = lang.t('common.currency');
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          Center(child: Text(lang.t('orders.title'),
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900))),
          const SizedBox(height: 16),
          _sectionTitle(lang.t('orders.active')),
          ..._active.map((o) => _activeCard(o, currency, lang)),
          const SizedBox(height: 24),
          _sectionTitle(lang.t('orders.history')),
          ..._past.map((o) => _pastCard(o, currency, lang)),
        ],
      ),
    );
  }

  Widget _sectionTitle(String s) => Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 10),
        child: Text(s.toUpperCase(),
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: Colors.white54)),
      );

  Widget _activeCard(_Order o, String c, LanguageProvider lang) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF1B1B1B),
          borderRadius: BorderRadius.circular(22),
        ),
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(children: [
              Container(
                height: 48, width: 48,
                decoration: BoxDecoration(color: const Color(0xFFFF6B2C).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(14)),
                child: const Icon(Icons.receipt_long, color: Color(0xFFFF6B2C)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(o.restaurant, style: const TextStyle(fontSize: 11, color: Colors.white54)),
                  Text(o.items, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Row(children: [
                    const Icon(Icons.location_on, size: 12, color: Color(0xFFFF6B2C)),
                    const SizedBox(width: 2),
                    Text(o.status, style: const TextStyle(fontSize: 11, color: Color(0xFFFF6B2C), fontWeight: FontWeight.w700)),
                    const SizedBox(width: 8),
                    const Icon(Icons.access_time, size: 12, color: Colors.white54),
                    const SizedBox(width: 2),
                    Text(o.eta ?? '', style: const TextStyle(fontSize: 11, color: Colors.white54)),
                  ]),
                ]),
              ),
              Text(formatLkr(o.total, c), style: const TextStyle(fontWeight: FontWeight.w800)),
            ]),
          ),
          const Divider(height: 1, color: Color(0xFF2A2A2A)),
          InkWell(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(lang.t('orders.track')), backgroundColor: const Color(0xFFFF6B2C)),
              );
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.map, size: 14, color: Color(0xFFFF6B2C)),
                const SizedBox(width: 6),
                Text(lang.t('orders.track'),
                    style: const TextStyle(color: Color(0xFFFF6B2C), fontWeight: FontWeight.w800, fontSize: 12)),
              ]),
            ),
          ),
        ]),
      );

  Widget _pastCard(_Order o, String c, LanguageProvider lang) {
    final cancelled = o.status == 'Cancelled';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF1B1B1B), borderRadius: BorderRadius.circular(22)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          height: 48, width: 48,
          decoration: BoxDecoration(
            color: (cancelled ? Colors.red : const Color(0xFFFF6B2C)).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(cancelled ? Icons.cancel : Icons.check_circle,
              color: cancelled ? Colors.red : const Color(0xFFFF6B2C)),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(o.restaurant, style: const TextStyle(fontSize: 11, color: Colors.white54)),
            Text(o.items, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: (cancelled ? Colors.red : const Color(0xFFFF6B2C)).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(o.status,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: cancelled ? Colors.red : const Color(0xFFFF6B2C))),
              ),
              const SizedBox(width: 8),
              Text(o.date, style: const TextStyle(fontSize: 11, color: Colors.white54)),
            ]),
            if (!cancelled) ...[
              const SizedBox(height: 10),
              Row(children: List.generate(5, (i) {
                final filled = (_ratings[o.id] ?? 0) > i;
                return GestureDetector(
                  onTap: () => setState(() => _ratings[o.id] = i + 1),
                  child: Padding(
                    padding: const EdgeInsets.only(right: 4),
                    child: Icon(filled ? Icons.star : Icons.star_border,
                        size: 16, color: const Color(0xFFFF6B2C)),
                  ),
                );
              })),
            ],
          ]),
        ),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(formatLkr(o.total, c), style: const TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: () {
              context.read<CartProvider>().add(o.foodId);
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text(lang.t('orders.reorder')),
                backgroundColor: const Color(0xFFFF6B2C),
              ));
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.refresh, size: 12, color: Colors.black),
                const SizedBox(width: 4),
                Text(lang.t('orders.reorder'),
                    style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w800)),
              ]),
            ),
          ),
        ]),
      ]),
    );
  }
}
