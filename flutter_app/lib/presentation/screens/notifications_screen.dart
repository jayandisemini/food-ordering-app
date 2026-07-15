import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: user == null
          ? const Center(child: Text('Register to receive notifications.'))
          : StreamBuilder<List<Map<String, dynamic>>>(
              stream: Supabase.instance.client
                  .from('notifications')
                  .stream(primaryKey: ['id'])
                  .eq('user_id', user.id)
                  .order('created_at', ascending: false),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFFFF6B2C)),
                  );
                }
                final notifications = snapshot.data!;
                if (notifications.isEmpty) {
                  return const Center(child: Text('No notifications yet.'));
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: notifications.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) {
                    final n = notifications[i];
                    return ListTile(
                      tileColor: const Color(0xFF1B1B1B),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      leading: const Icon(Icons.notifications,
                          color: Color(0xFFFF6B2C)),
                      title: Text(n['title'] as String? ?? ''),
                      subtitle: Text(n['body'] as String? ?? ''),
                      trailing: (n['unread'] as bool? ?? false)
                          ? const Icon(Icons.circle,
                              size: 10, color: Color(0xFFFF6B2C))
                          : null,
                      onTap: () => Supabase.instance.client
                          .from('notifications')
                          .update({'unread': false}).eq('id', n['id']),
                    );
                  },
                );
              },
            ),
    );
  }
}
