import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/language_provider.dart';
import '../../data/food_data.dart';
import '../widgets/food_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final results = _q.isEmpty
        ? foods
        : foods.where((f) => f.name.toLowerCase().contains(_q.toLowerCase())).toList();

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(lang.t('nav.search'),
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
          const SizedBox(height: 14),
          TextField(
            onChanged: (v) => setState(() => _q = v),
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: lang.t('home.searchPlaceholder'),
              hintStyle: const TextStyle(color: Colors.white38),
              prefixIcon: const Icon(Icons.search, color: Colors.white54),
              suffixIcon: const Icon(Icons.mic, color: Color(0xFFFF6B2C)),
              filled: true, fillColor: const Color(0xFF1B1B1B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: GridView.builder(
              itemCount: results.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.68,
              ),
              itemBuilder: (_, i) => FoodCard(food: results[i]),
            ),
          ),
        ]),
      ),
    );
  }
}
