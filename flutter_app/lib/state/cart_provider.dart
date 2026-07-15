import 'package:flutter/foundation.dart';

import '../data/food_data.dart';

class CartItem {
  final String id;
  int qty;
  CartItem(this.id, this.qty);
}

class CartProvider extends ChangeNotifier {
  final List<CartItem> _items = [];
  bool promoApplied = false;

  List<CartItem> get items => List.unmodifiable(_items);
  int get count => _items.fold(0, (a, b) => a + b.qty);

  void add(String id, [int qty = 1]) {
    final i = _items.indexWhere((e) => e.id == id);
    if (i >= 0) {
      _items[i].qty += qty;
    } else {
      _items.add(CartItem(id, qty));
    }
    notifyListeners();
  }

  void setQty(String id, int qty) {
    final i = _items.indexWhere((e) => e.id == id);
    if (i < 0) return;
    if (qty <= 0) {
      _items.removeAt(i);
    } else {
      _items[i].qty = qty;
    }
    notifyListeners();
  }

  void clear() {
    _items.clear();
    promoApplied = false;
    notifyListeners();
  }

  bool applyPromo(String code) {
    if (code.trim().toUpperCase() == 'BINGE50') {
      promoApplied = true;
      notifyListeners();
      return true;
    }
    return false;
  }

  int get subtotal {
    return 0;
  }

  int subtotalFor(List<Food> foods) => _items.fold(0, (sum, c) {
        final matches = foods.where((x) => x.id == c.id);
        final food = matches.isEmpty ? null : matches.first;
        return sum + ((food?.price ?? 0) * c.qty);
      });

  int get deliveryFee => _items.isEmpty ? 0 : 150;
  int discountFor(List<Food> foods) =>
      promoApplied ? (subtotalFor(foods) * 0.5).round() : 0;
  int totalFor(List<Food> foods) =>
      subtotalFor(foods) + deliveryFee - discountFor(foods);
}
