import 'package:flutter/foundation.dart';

import 'translations.dart';

class LanguageProvider extends ChangeNotifier {
  String _locale = 'en';
  String get locale => _locale;

  void setLocale(String code) {
    if (!translations.containsKey(code) || code == _locale) return;
    _locale = code;
    notifyListeners();
  }

  String t(String key) {
    final parts = key.split('.');
    dynamic node = translations[_locale];
    for (final p in parts) {
      if (node is Map && node.containsKey(p)) {
        node = node[p];
      } else {
        return key;
      }
    }
    return node is String ? node : key;
  }
}
