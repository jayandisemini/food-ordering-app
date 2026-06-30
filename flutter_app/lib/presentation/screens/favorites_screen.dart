import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/language_provider.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return SafeArea(
      child: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.favorite_border, size: 64, color: Color(0xFFFF6B2C)),
          const SizedBox(height: 12),
          Text(lang.t('nav.favorites'),
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
        ]),
      ),
    );
  }
}
