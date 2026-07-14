import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/localization/language_provider.dart';
import 'cart_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _openLanguageSheet(BuildContext context) {
    final lang = context.read<LanguageProvider>();
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1B1B1B),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const SizedBox(height: 12),
          Container(height: 4, width: 40, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 14),
          const Text('Language', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 8),
          ...[
            ('en', 'English'),
            ('si', 'සිංහල'),
            ('ta', 'தமிழ்'),
          ].map((e) => ListTile(
                title: Text(e.$2),
                trailing: lang.locale == e.$1 ? const Icon(Icons.check, color: Color(0xFFFF6B2C)) : null,
                onTap: () {
                  lang.setLocale(e.$1);
                  Navigator.pop(context);
                },
              )),
          const SizedBox(height: 12),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(child: Text(lang.t('nav.profile'),
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900))),
          const SizedBox(height: 24),
          Center(child: Builder(
            builder: (context) {
              final user = Supabase.instance.client.auth.currentUser;
              final name = user?.userMetadata?['full_name'] as String? ?? 'Guest User';
              final avatarUrl = user?.userMetadata?['avatar_url'] as String?;
              
              return Column(
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: const Color(0xFFFF6B2C),
                    backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                    child: avatarUrl == null 
                        ? Text(name.isNotEmpty ? name[0].toUpperCase() : 'Q', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900))
                        : null,
                  ),
                  const SizedBox(height: 12),
                  Text(name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                ],
              );
            }
          )),
          const SizedBox(height: 28),
          _tile(Icons.shopping_bag_outlined, lang.t('cart.title'),
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()))),
          _tile(Icons.language, 'Language (${lang.locale.toUpperCase()})', () => _openLanguageSheet(context)),
          _tile(Icons.notifications_none, 'Notifications', () {}),
          _tile(Icons.help_outline, 'Help Center', () {}),
          _tile(Icons.lock_outline, 'Privacy & Security', () {}),
          const SizedBox(height: 14),
          _tile(Icons.logout, 'Log out', () async {
            await Supabase.instance.client.auth.signOut();
          }, danger: true),
        ],
      ),
    );
  }

  Widget _tile(IconData icon, String label, VoidCallback onTap, {bool danger = false}) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(color: const Color(0xFF1B1B1B), borderRadius: BorderRadius.circular(16)),
        child: ListTile(
          leading: Icon(icon, color: danger ? Colors.red : const Color(0xFFFF6B2C)),
          title: Text(label, style: TextStyle(fontWeight: FontWeight.w700, color: danger ? Colors.red : Colors.white)),
          trailing: const Icon(Icons.chevron_right, color: Colors.white38),
          onTap: onTap,
        ),
      );
}
