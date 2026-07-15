import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/localization/language_provider.dart';
import '../../data/food_data.dart';
import '../../state/app_session.dart';
import 'tracking_screen.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final currency = lang.t('common.currency');
    final user = Supabase.instance.client.auth.currentUser;
    if (context.watch<AppSession>().isGuest || user == null) {
      return const SafeArea(
        child: Center(child: Text('Register to place and track orders.')),
      );
    }

    return SafeArea(
      child: FutureBuilder<List<Map<String, dynamic>>>(
        future: _loadOrders(user.id),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFFFF6B2C)),
            );
          }
          final orders = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            children: [
              Center(
                child: Text(lang.t('orders.title'),
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.w900)),
              ),
              const SizedBox(height: 16),
              if (orders.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(child: Text('No orders in the database yet.')),
                )
              else
                ...orders.map((o) => _orderCard(context, o, currency, lang)),
            ],
          );
        },
      ),
    );
  }

  Future<List<Map<String, dynamic>>> _loadOrders(String userId) async {
    final rows = await Supabase.instance.client
        .from('orders')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(rows);
  }

  Widget _orderCard(BuildContext context, Map<String, dynamic> o, String c,
      LanguageProvider lang) {
    final total = ((o['total_price'] ?? o['total'] ?? 0) as num).toInt();
    final items = ((o['items'] as List?) ?? [])
        .map((e) => e is Map ? e['name'] : null)
        .whereType<String>()
        .join(', ');
    return Container(
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
              height: 48,
              width: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFFF6B2C).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.receipt_long, color: Color(0xFFFF6B2C)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(o['restaurant_name'] as String? ?? 'Restaurant',
                        style: const TextStyle(
                            fontSize: 11, color: Colors.white54)),
                    Text(items.isEmpty ? 'Order ${o['id']}' : items,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text('${o['status']}  ${o['eta'] ?? ''}',
                        style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFFFF6B2C),
                            fontWeight: FontWeight.w700)),
                  ]),
            ),
            Text(formatLkr(total, c),
                style: const TextStyle(fontWeight: FontWeight.w800)),
          ]),
        ),
        const Divider(height: 1, color: Color(0xFF2A2A2A)),
        ListTile(
          leading: const Icon(Icons.map, color: Color(0xFFFF6B2C)),
          title: Text(lang.t('orders.track'),
              style: const TextStyle(
                  color: Color(0xFFFF6B2C), fontWeight: FontWeight.w800)),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => TrackingScreen(order: o)),
          ),
        ),
      ]),
    );
  }
}
