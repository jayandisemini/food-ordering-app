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
    int s = 0;
    for (final c in _items) {
      final f = foods.firstWhere((x) => x.id == c.id, orElse: () => foods.first);
      s += f.price * c.qty;
    }
    return s;
  }

  int get deliveryFee => _items.isEmpty ? 0 : 150;
  int get discount => promoApplied ? (subtotal * 0.5).round() : 0;
  int get total => subtotal + deliveryFee - discount;
}
