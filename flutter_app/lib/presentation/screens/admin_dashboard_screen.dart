import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../state/app_session.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            onPressed: () => context.read<AppSession>().exit(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, List<Map<String, dynamic>>>>(
        future: _load(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFFFF6B2C)),
            );
          }
          final data = snapshot.data!;
          final orders = data['orders']!;
          final foods = data['foods']!;
          final notifications = data['notifications']!;
          final revenue = orders.fold<num>(
              0, (sum, o) => sum + ((o['total_price'] ?? o['total'] ?? 0) as num));
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(children: [
                _stat('Orders', '${orders.length}', Icons.receipt_long),
                const SizedBox(width: 10),
                _stat('Menu', '${foods.length}', Icons.restaurant_menu),
              ]),
              const SizedBox(height: 10),
              Row(children: [
                _stat('Revenue', 'Rs ${revenue.toInt()}', Icons.payments),
                const SizedBox(width: 10),
                _stat('Alerts', '${notifications.length}', Icons.notifications),
              ]),
              const SizedBox(height: 22),
              _section('Recent orders'),
              ...orders.take(8).map((o) => _tile(
                    Icons.delivery_dining,
                    o['restaurant_name'] as String? ?? 'Restaurant',
                    '${o['status']}  Rs ${((o['total_price'] ?? o['total'] ?? 0) as num).toInt()}',
                  )),
              const SizedBox(height: 18),
              _section('Menu management'),
              ...foods.take(8).map((f) => _tile(
                    Icons.fastfood,
                    f['name'] as String? ?? '',
                    '${f['restaurant_name']}  Rs ${f['price']}',
                  )),
              const SizedBox(height: 18),
              _section('Notification feed'),
              ...notifications.take(8).map((n) => _tile(
                    Icons.notifications,
                    n['title'] as String? ?? '',
                    n['body'] as String? ?? '',
                  )),
            ],
          );
        },
      ),
    );
  }

  Future<Map<String, List<Map<String, dynamic>>>> _load() async {
    final db = Supabase.instance.client;
    final orders = await db
        .from('orders')
        .select()
        .order('created_at', ascending: false);
    final foods = await db.from('food_items').select().order('name');
    final notifications = await db
        .from('notifications')
        .select()
        .order('created_at', ascending: false);
    return {
      'orders': List<Map<String, dynamic>>.from(orders),
      'foods': List<Map<String, dynamic>>.from(foods),
      'notifications': List<Map<String, dynamic>>.from(notifications),
    };
  }

  Widget _stat(String label, String value, IconData icon) => Expanded(
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF1B1B1B),
            borderRadius: BorderRadius.circular(16),
          ),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, color: const Color(0xFFFF6B2C)),
            const SizedBox(height: 12),
            Text(value,
                style:
                    const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
            Text(label, style: const TextStyle(color: Colors.white60)),
          ]),
        ),
      );

  Widget _section(String title) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
      );

  Widget _tile(IconData icon, String title, String subtitle) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        child: ListTile(
          tileColor: const Color(0xFF1B1B1B),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          leading: Icon(icon, color: const Color(0xFFFF6B2C)),
          title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
          subtitle:
              Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis),
        ),
      );
}
